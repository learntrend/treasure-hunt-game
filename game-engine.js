// Game Engine - Handles game state, timer, scoring, and game logic

class GameEngine {
    constructor() {
        this.currentLocationIndex = 0; // 0 = starting point, 1-10 = locations
        this.score = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        this.pauseStartTime = null;
        this.totalPauseTime = 0;
        this.playerName = '';
        this.groupMembers = [];
        this.personalMessage = '';
        this.hintsUsed = {
            textHints: new Set(),
            mapHints: new Set()
        };
        this.answersSubmitted = new Set();
        this.locationNamesSubmitted = new Set(); // Track location names that have been correctly identified
        this.completedLocations = []; // Track completed locations with their names and answers
    }

    // Initialize game with player data
    initialize(playerName, groupSize, groupNames, personalMessage) {
        this.playerName = playerName;
        // Personal message will be fetched from database when showing final screen
        // Store it if provided, otherwise it will be fetched later
        this.personalMessage = personalMessage || null;
        if (groupSize === 'group' && groupNames) {
            this.groupMembers = groupNames.split(',').map(name => name.trim()).filter(name => name);
        } else {
            this.groupMembers = [];
        }
    }

    // Start the timer when player arrives at starting point
    startTimer() {
        if (!this.isTimerRunning && !this.isTimerPaused) {
            this.startTime = Date.now();
            this.isTimerRunning = true;
            this.totalPauseTime = 0;
            this.updateTimer();
        }
    }

    // Update timer display
    updateTimer() {
        if (!this.isTimerRunning) return;

        this.timerInterval = setInterval(() => {
            if (!this.isTimerPaused && this.isTimerRunning) {
                const now = Date.now();
                const elapsed = now - this.startTime - this.totalPauseTime;
                this.elapsedTime = Math.floor(elapsed / 1000);
                this.onTimerUpdate(this.elapsedTime);
            }
        }, 1000);
    }

    // Pause timer (for titbits screen)
    pauseTimer() {
        if (this.isTimerRunning && !this.isTimerPaused) {
            this.isTimerPaused = true;
            this.pauseStartTime = Date.now();
        }
    }

    // Resume timer
    resumeTimer() {
        if (this.isTimerRunning && this.isTimerPaused) {
            const pauseDuration = Date.now() - this.pauseStartTime;
            this.totalPauseTime += pauseDuration;
            this.isTimerPaused = false;
            this.pauseStartTime = null;
        }
    }

    // Stop timer (when game ends)
    stopTimer() {
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        // Calculate final elapsed time
        if (this.startTime) {
            const now = Date.now();
            this.elapsedTime = Math.floor((now - this.startTime - this.totalPauseTime) / 1000);
        }
    }

    // Format time as MM:SS
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Get current formatted time
    getFormattedTime() {
        return this.formatTime(this.elapsedTime);
    }

    // Move to next location
    nextLocation() {
        if (this.currentLocationIndex < gameData.locations.length) {
            this.currentLocationIndex++;
            return true;
        }
        return false;
    }

    // Get current location data
    getCurrentLocation() {
        if (this.currentLocationIndex === 0) {
            return null; // Starting point
        }
        return gameData.locations[this.currentLocationIndex - 1];
    }

    // Get clue for current location
    getCurrentClue() {
        const location = this.getCurrentLocation();
        return location ? location.clue : null;
    }

    // Get question for current location
    getCurrentQuestion() {
        const location = this.getCurrentLocation();
        return location ? location.question : null;
    }

    // Get correct answer for current question (for text input)
    getCurrentCorrectAnswer() {
        const location = this.getCurrentLocation();
        return location ? location.correctAnswer : null;
    }

    // Validate location name
    validateLocationName(locationName) {
        const location = this.getCurrentLocation();
        if (!location) return false;
        
        const normalizedInput = locationName.trim().toLowerCase();
        const variations = location.locationNameVariations || [];
        
        // Check against all variations
        for (const variation of variations) {
            if (normalizedInput === variation.toLowerCase()) {
                return true;
            }
        }
        
        // Also check against the main location name
        if (normalizedInput === location.locationName.toLowerCase()) {
            return true;
        }
        
        return false;
    }

    // Submit location name
    submitLocationName(locationName) {
        const location = this.getCurrentLocation();
        if (!location || this.locationNamesSubmitted.has(location.id)) {
            return false;
        }

        const isValid = this.validateLocationName(locationName);
        if (isValid) {
            this.locationNamesSubmitted.add(location.id);
            return { correct: true };
        } else {
            return { correct: false };
        }
    }

    // Submit answer and update score (text-based)
    submitAnswer(answerText) {
        const location = this.getCurrentLocation();
        if (!location) {
            return false;
        }
        
        // Allow multiple attempts - don't check if answer was already submitted

        const normalizedInput = answerText.trim().toLowerCase();
        const variations = location.answerVariations || [];
        
        // Check against all variations
        let isCorrect = false;
        for (const variation of variations) {
            if (normalizedInput === variation.toLowerCase()) {
                isCorrect = true;
                break;
            }
        }
        
        // Also check against the main correct answer
        if (!isCorrect && location.correctAnswer) {
            if (normalizedInput === location.correctAnswer.toLowerCase()) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            // Only add to completed locations if not already there
            if (!this.answersSubmitted.has(location.id)) {
                this.answersSubmitted.add(location.id);
                // Add location to completed locations list
                this.completedLocations.push({
                    id: location.id,
                    name: location.locationName || location.name,
                    answer: location.correctAnswer
                });
                
                this.addScore(100);
                return { correct: true, points: 100 };
            } else {
                // Already answered correctly, don't add points again
                return { correct: true, points: 0 };
            }
        } else {
            return { correct: false, points: 0 };
        }
    }

    // Get completed locations for the pinned panel
    getCompletedLocations() {
        return this.completedLocations;
    }

    // Check if location name has been submitted for current location
    hasSubmittedLocationName() {
        const location = this.getCurrentLocation();
        return location ? this.locationNamesSubmitted.has(location.id) : false;
    }

    // Use text hint
    useTextHint() {
        const location = this.getCurrentLocation();
        if (!location) {
            return null;
        }

        const alreadyUsed = this.hintsUsed.textHints.has(location.id);
        
        if (!alreadyUsed) {
            this.hintsUsed.textHints.add(location.id);
            this.addScore(-30);
        }
        
        return location.textHint;
    }

    // Use map hint
    useMapHint() {
        const location = this.getCurrentLocation();
        if (!location) {
            return null;
        }

        const alreadyUsed = this.hintsUsed.mapHints.has(location.id);
        
        if (!alreadyUsed) {
            this.hintsUsed.mapHints.add(location.id);
            this.addScore(-50);
        }
        
        return {
            text: location.mapHint,
            locationName: location.name
        };
    }

    // Check if text hint has been used for current location
    hasUsedTextHint() {
        const location = this.getCurrentLocation();
        return location ? this.hintsUsed.textHints.has(location.id) : false;
    }

    // Check if map hint has been used for current location
    hasUsedMapHint() {
        const location = this.getCurrentLocation();
        return location ? this.hintsUsed.mapHints.has(location.id) : false;
    }

    // Add to score
    addScore(points) {
        this.score = Math.max(0, this.score + points);
        this.onScoreUpdate(this.score);
    }

    // Get current score
    getScore() {
        return this.score;
    }

    // Get current location number (1-10)
    getCurrentLocationNumber() {
        return this.currentLocationIndex;
    }

    // Check if game is complete
    isGameComplete() {
        return this.currentLocationIndex === gameData.locations.length;
    }

    // Get final stats
    getFinalStats() {
        // If personal message is not set, return a placeholder (it should be fetched before calling this)
        const message = this.personalMessage || 'Loading your personal message...';
        return {
            time: this.getFormattedTime(),
            score: this.score,
            personalMessage: message
        };
    }

    // Reset game
    reset() {
        this.currentLocationIndex = 0;
        this.score = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        this.pauseStartTime = null;
        this.totalPauseTime = 0;
        this.hintsUsed = {
            textHints: new Set(),
            mapHints: new Set()
        };
        this.answersSubmitted = new Set();
        this.locationNamesSubmitted = new Set();
        this.completedLocations = [];
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Callbacks (to be set by app.js)
    onTimerUpdate(time) {}
    onScoreUpdate(score) {}
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}