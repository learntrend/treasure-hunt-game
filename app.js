// Main Application Logic - Handles UI interactions and screen management

let gameEngine;
let backgroundMusic;
let isMusicPlaying = false;
let currentPlayerType = 'solo'; // Track current player type (solo/group)
let saveStateInterval = null; // Interval for auto-saving game state

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    if (window.DatabaseService) {
        window.DatabaseService.initializeFirebase();
    }
    
    gameEngine = new GameEngine();
    
    // Initialize background music
    backgroundMusic = document.getElementById('background-music');
    backgroundMusic.volume = 0.3; // Set volume to 30%
    
    // Set up callbacks
    gameEngine.onTimerUpdate = (time) => {
        updateTimerDisplay(time);
    };
    
    gameEngine.onScoreUpdate = (score) => {
        updateScoreDisplay(score);
    };
    
    // Set current year in final screen
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Check for saved game state and resume if available
    await checkForSavedGame();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-save game state every 30 seconds (only when game is running)
    startAutoSave();
});

// Set up all event listeners
function setupEventListeners() {
    // Welcome screen
    document.getElementById('group-size').addEventListener('change', (e) => {
        updateNameLabel(e.target.value);
        const groupContainer = document.getElementById('group-names-container');
        groupContainer.style.display = e.target.value === 'group' ? 'block' : 'none';
    });
    
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('view-tutorial-btn').addEventListener('click', showTutorial);
    document.getElementById('start-after-tutorial-btn').addEventListener('click', startAfterTutorial);
    
    // Starting point screen
    document.getElementById('arrived-btn').addEventListener('click', startGameplay);
    
    // Game screen
    document.getElementById('submit-location-name-btn').addEventListener('click', handleSubmitLocationName);
    document.getElementById('location-name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmitLocationName();
        }
    });
    document.getElementById('view-titbits-btn').addEventListener('click', showTitbits);
    document.getElementById('text-hint-btn').addEventListener('click', showTextHint);
    document.getElementById('map-hint-btn').addEventListener('click', showMapHint);
    document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    document.getElementById('toggle-locations-panel-btn').addEventListener('click', toggleLocationsPanel);
    document.getElementById('music-toggle-btn').addEventListener('click', toggleMusic);
    
    // Titbits screen
    document.getElementById('close-titbits-btn').addEventListener('click', closeTitbits);
    
    // Hint modal
    document.getElementById('close-hint-modal').addEventListener('click', closeHintModal);
    
    // Feedback modal
    document.getElementById('close-feedback-modal').addEventListener('click', closeFeedbackModal);
    document.getElementById('close-feedback-modal-btn').addEventListener('click', closeFeedbackModal);
    
    // Final screen
    document.getElementById('give-feedback-btn').addEventListener('click', showFeedbackModal);
    document.getElementById('share-results-btn').addEventListener('click', shareResults);
}

// Update name label based on group size
function updateNameLabel(groupSize) {
    const nameLabel = document.getElementById('name-label');
    const nameInput = document.getElementById('player-name');
    
    if (groupSize === 'group') {
        nameLabel.textContent = 'Your Team Name:';
        nameInput.placeholder = 'Enter your team name';
    } else {
        nameLabel.textContent = 'Your Name:';
        nameInput.placeholder = 'Enter your name';
    }
}

// Toggle background music
function toggleMusic() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicIcon = document.getElementById('music-icon');
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicIcon.textContent = '🎵';
        musicBtn.classList.remove('playing');
        isMusicPlaying = false;
    } else {
        backgroundMusic.play().catch(error => {
            console.log('Music autoplay prevented:', error);
            // User interaction is required for audio playback
        });
        musicIcon.textContent = '🔊';
        musicBtn.classList.add('playing');
        isMusicPlaying = true;
    }
}

// Show tutorial screen
function showTutorial() {
    showScreen('tutorial-screen');
}

// Start game after tutorial
function startAfterTutorial() {
    showScreen('welcome-screen');
}

// Start game from welcome screen
async function startGame() {
    const playerName = document.getElementById('player-name').value.trim();
    const groupSize = document.getElementById('group-size').value;
    const groupNames = document.getElementById('group-names').value.trim();
    
    if (!playerName) {
        const label = groupSize === 'group' ? 'team name' : 'name';
        alert(`Please enter your ${label} to begin.`);
        return;
    }
    
    if (groupSize === 'group' && !groupNames) {
        alert('Please enter group member names.');
        return;
    }
    
    // Clear any previous game session
    if (window.DatabaseService) {
        await window.DatabaseService.deleteGameSession();
    }
    
    // Store player type
    currentPlayerType = groupSize;
    
    // Initialize game engine (personal message will be fetched from database later)
    gameEngine.initialize(playerName, groupSize, groupNames, null);
    
    // Show starting point screen
    showScreen('starting-point-screen');
    
    // Update starting location info
    document.getElementById('starting-location-name').textContent = gameData.startingLocation.name;
    document.getElementById('starting-location-address').textContent = gameData.startingLocation.address;
}

// Start gameplay when player arrives at starting point
async function startGameplay() {
    // Start timer
    gameEngine.startTimer();
    
    // Move to first location
    gameEngine.nextLocation();
    
    // Save initial game state
    await saveGameState();
    
    // Show game screen
    showScreen('game-screen');
    
    // Load first location with page turn animation
    loadCurrentLocation();
}

// Load current location data
function loadCurrentLocation() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    // Apply fade-in animation to clue section
    const clueSection = document.getElementById('clue-section');
    clueSection.classList.add('fade-in');
    setTimeout(() => {
        clueSection.classList.remove('fade-in');
    }, 1000);
    
    // Update clue
    document.getElementById('clue-text').textContent = location.clue;
    
    // Show clue section with location name input
    document.getElementById('clue-section').style.display = 'block';
    document.getElementById('location-name-input-container').style.display = 'block';
    document.getElementById('location-name-input').value = '';
    document.getElementById('location-name-input').classList.remove('error', 'success');
    
    // Clear any error messages from previous location
    const locationError = document.getElementById('location-name-input-error');
    if (locationError) {
        locationError.remove();
    }
    
    // Hide location info and question sections initially
    document.getElementById('location-info-section').style.display = 'none';
    document.getElementById('question-section').style.display = 'none';
    document.getElementById('action-buttons-container').style.display = 'none';
    
    // Reset hint buttons
    resetHintButtons();
    
    // Update locations panel
    updateLocationsPanel();
}

// Handle location name submission
function handleSubmitLocationName() {
    const locationNameInput = document.getElementById('location-name-input');
    const locationName = locationNameInput.value.trim();
    const errorContainer = document.getElementById('location-name-error');
    
    // Clear previous error
    if (errorContainer) {
        errorContainer.remove();
    }
    
    if (!locationName) {
        showInputError(locationNameInput, 'Please enter a location name.');
        return;
    }
    
    const result = gameEngine.submitLocationName(locationName);
    
    if (result && result.correct) {
        locationNameInput.classList.remove('error');
        locationNameInput.classList.add('success');
        if (errorContainer) errorContainer.remove();
        
        // Hide location name input
        document.getElementById('location-name-input-container').style.display = 'none';
        
        // Show location confirmation with scroll animation
        const location = gameEngine.getCurrentLocation();
        document.getElementById('location-name').textContent = location.locationName || location.name;
        document.getElementById('location-description').textContent = location.description;
        const locationInfoSection = document.getElementById('location-info-section');
        locationInfoSection.style.display = 'block';
        locationInfoSection.classList.add('scroll-reveal');
        
        // Save game state after correct location name
        saveGameState();
        
        // Show question section after a short delay with scroll animation
        setTimeout(() => {
            showQuestionSection();
        }, 1500);
    } else {
        showInputError(locationNameInput, 'Incorrect location. Try again!');
    }
}

// Show question section
function showQuestionSection() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    document.getElementById('question-text').textContent = location.question;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').classList.remove('error', 'success');
    
    // Clear any error messages from previous question
    const answerError = document.getElementById('answer-input-error');
    if (answerError) {
        answerError.remove();
    }
    
    const questionSection = document.getElementById('question-section');
    questionSection.style.display = 'block';
    questionSection.classList.add('scroll-reveal');
    document.getElementById('action-buttons-container').style.display = 'block';
    
    // Reset hint buttons (text hint for question section)
    resetHintButtons();
}

// Submit answer - Allow unlimited retries
function submitAnswer() {
    const answerInput = document.getElementById('answer-input');
    const answerText = answerInput.value.trim();
    const errorContainer = document.getElementById('answer-input-error');
    
    // Clear previous error
    if (errorContainer) {
        errorContainer.remove();
    }
    
    if (!answerText) {
        showInputError(answerInput, 'Please enter an answer.');
        return;
    }
    
    const result = gameEngine.submitAnswer(answerText);
    
    if (result) {
        if (result.correct) {
            answerInput.classList.remove('error');
            answerInput.classList.add('success');
            if (errorContainer) errorContainer.remove();
            showMessage('Correct! +' + result.points + ' points', 'success');
            
            // Update locations panel
            updateLocationsPanel();
            
            // Save game state after correct answer
            saveGameState();
            
            // Check if game is complete
            if (gameEngine.isGameComplete()) {
                setTimeout(() => {
                    showFinalScreen();
                }, 2000);
            } else {
                // Move to next location after delay with fade-in animation
                setTimeout(async () => {
                    gameEngine.nextLocation();
                    loadCurrentLocation();
                    showMessage('', ''); // Clear message
                    // Save state after moving to next location
                    await saveGameState();
                }, 2000);
            }
        } else {
            showInputError(answerInput, 'Incorrect answer. Try again!');
        }
    }
}

// Show error message below input field
function showInputError(inputElement, message) {
    // Remove existing error
    const existingError = inputElement.parentElement.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
    
    inputElement.classList.add('error');
    inputElement.classList.remove('success');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.id = inputElement.id + '-error';
    errorDiv.textContent = message;
    
    // Insert after input field
    inputElement.parentElement.insertBefore(errorDiv, inputElement.nextSibling);
}

// Show text hint
async function showTextHint() {
    const hint = gameEngine.useTextHint();
    if (hint) {
        showHintModal('Text Hint', hint, false);
        updateScoreDisplay(gameEngine.getScore());
        resetHintButtons();
        // Save state after using hint
        await saveGameState();
    }
}

// Show map hint
async function showMapHint() {
    const hintData = gameEngine.useMapHint();
    if (hintData) {
        showHintModal('Map Hint', hintData.text, true);
        updateScoreDisplay(gameEngine.getScore());
        resetHintButtons();
        // Save state after using hint
        await saveGameState();
    }
}

// Show hint modal
function showHintModal(title, text, isMapHint) {
    document.getElementById('hint-modal-title').textContent = title;
    document.getElementById('hint-text').textContent = text;
    
    const mapContainer = document.getElementById('map-hint-container');
    if (isMapHint) {
        mapContainer.style.display = 'block';
        // Hide the "Next location" text
        const mapHintText = document.getElementById('map-hint-text');
        if (mapHintText) {
            mapHintText.style.display = 'none';
        }
    } else {
        mapContainer.style.display = 'none';
    }
    
    document.getElementById('hint-modal').classList.add('active');
}

// Close hint modal
function closeHintModal() {
    document.getElementById('hint-modal').classList.remove('active');
}

// Show titbits
function showTitbits() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    // Pause timer
    gameEngine.pauseTimer();
    
    // Show titbits
    document.getElementById('titbits-text').innerHTML = `<p>${location.titbits}</p>`;
    showScreen('titbits-screen');
}

// Close titbits
function closeTitbits() {
    // Resume timer
    gameEngine.resumeTimer();
    
    // Return to game screen
    showScreen('game-screen');
}

// Fetch personal message from database/API
async function fetchPersonalMessage() {
    try {
        // Replace this URL with your actual API endpoint
        const playerName = gameEngine.playerName;
        const response = await fetch(`/api/personal-message?player=${encodeURIComponent(playerName)}`);
        
        if (response.ok) {
            const data = await response.json();
            return data.message || getDefaultMessage();
        } else {
            // Fallback to default message if API fails
            return getDefaultMessage();
        }
    } catch (error) {
        console.error('Error fetching personal message:', error);
        // Fallback to default message
        return getDefaultMessage();
    }
}

// Get default message if none is available
function getDefaultMessage() {
    const recipient = gameEngine.groupMembers.length > 0 ? gameEngine.groupMembers[0] : gameEngine.playerName;
    return `Dear ${recipient},\n\nIn the year 1800, this message was written but never delivered. Through time and space, it has found its way to you.\n\nYou have followed the trail, solved the puzzles, and proven yourself worthy. This letter was meant for you, across the centuries.\n\nMay this journey remind you that some messages are timeless, and some connections transcend the boundaries of time itself.\n\nWith hope from the past,\nA message from 1800`;
}

// Show final screen
async function showFinalScreen() {
    // Stop timer
    gameEngine.stopTimer();
    
    // Fetch personal message from database
    const personalMessage = await fetchPersonalMessage();
    
    // Update game engine with the fetched message
    gameEngine.personalMessage = personalMessage;
    
    // Get final stats
    const stats = gameEngine.getFinalStats();
    
    // Save completed game to database
    if (window.DatabaseService) {
        const completedGameData = {
            playerType: currentPlayerType,
            playerName: gameEngine.playerName,
            groupMembers: gameEngine.groupMembers,
            score: stats.score,
            time: gameEngine.elapsedTime, // in seconds
            completedLocations: gameEngine.completedLocations
        };
        await window.DatabaseService.saveCompletedGame(completedGameData);
    }
    
    // Update final screen
    document.getElementById('final-time').textContent = stats.time;
    document.getElementById('final-score').textContent = stats.score;
    
    // Show final screen first
    showScreen('final-screen');
    
    // Start typewriter effect for letter after screen is shown
    setTimeout(() => {
        startTypewriterEffect(stats.personalMessage);
    }, 500);
}

// Typewriter effect for letter content
function startTypewriterEffect(message) {
    const messageElement = document.getElementById('personal-message-text');
    const fullText = message.replace(/\n/g, '<br>');
    messageElement.innerHTML = '';
    messageElement.style.opacity = '1';
    
    let index = 0;
    const speed = 30; // milliseconds per character
    
    function typeWriter() {
        if (index < fullText.length) {
            // Handle HTML tags
            if (fullText.substring(index, index + 4) === '<br>') {
                messageElement.innerHTML += '<br>';
                index += 4;
            } else {
                messageElement.innerHTML += fullText.charAt(index);
                index++;
            }
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

// Show feedback modal
function showFeedbackModal() {
    document.getElementById('feedback-modal').classList.add('active');
}

// Close feedback modal
function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('active');
}

// Share results
function shareResults() {
    const stats = gameEngine.getFinalStats();
    const shareText = `I completed the Lost Letter from 1800 treasure hunt!\n\nTime: ${stats.time}\nScore: ${stats.score} points\n\nCan you beat my time?`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Lost Letter from 1800 - Treasure Hunt',
            text: shareText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
        }).catch(() => {
            alert('Share feature not available. Your results:\n\n' + shareText);
        });
    }
}

// Show a specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Show/hide locations panel based on active screen
    const locationsPanel = document.getElementById('locations-panel');
    if (screenId === 'game-screen') {
        locationsPanel.style.display = 'flex';
    } else {
        locationsPanel.style.display = 'none';
    }
}

// Update timer display
function updateTimerDisplay(seconds) {
    const formatted = gameEngine.formatTime(seconds);
    document.getElementById('timer').textContent = formatted;
}

// Update score display
function updateScoreDisplay(score) {
    document.getElementById('score').textContent = score;
}

// Show message
function showMessage(text, type) {
    // Remove existing messages
    const existing = document.querySelector('.message');
    if (existing) {
        existing.remove();
    }
    
    if (!text) return;
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    const gameContent = document.querySelector('.game-content');
    if (gameContent) {
        gameContent.insertBefore(message, gameContent.firstChild);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Reset hint buttons
function resetHintButtons() {
    const textHintBtn = document.getElementById('text-hint-btn');
    const mapHintBtn = document.getElementById('map-hint-btn');
    
    const location = gameEngine.getCurrentLocation();
    if (location) {
        const textHintUsed = gameEngine.hasUsedTextHint();
        const mapHintUsed = gameEngine.hasUsedMapHint();
        
        // Hints can be shown multiple times, but only deduct points on first use
        textHintBtn.disabled = false;
        mapHintBtn.disabled = false;
        
        if (textHintUsed) {
            textHintBtn.textContent = '💡 Text Hint (View Again)';
        } else {
            textHintBtn.textContent = '💡 Text Hint (-30 pts)';
        }
        
        if (mapHintUsed) {
            mapHintBtn.textContent = '🗺️ Map Hint (View Again)';
        } else {
            mapHintBtn.textContent = '🗺️ Map Hint (-50 pts)';
        }
    }
}

// Update locations panel
function updateLocationsPanel() {
    const completedLocations = gameEngine.getCompletedLocations();
    const locationsList = document.getElementById('locations-list');
    
    if (completedLocations.length === 0) {
        locationsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Complete locations to see your journey...</p>';
        return;
    }
    
    locationsList.innerHTML = '';
    completedLocations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <div class="location-item-header">Location ${loc.id}: ${loc.name}</div>
            <div class="location-item-answer">Answer: ${loc.answer}</div>
        `;
        locationsList.appendChild(item);
    });
}

// Toggle locations panel
function toggleLocationsPanel() {
    const panel = document.getElementById('locations-panel');
    const btn = document.getElementById('toggle-locations-panel-btn');
    
    panel.classList.toggle('collapsed');
    btn.textContent = panel.classList.contains('collapsed') ? '+' : '−';
}

// Save game state to database
async function saveGameState() {
    if (!window.DatabaseService || !gameEngine) return;
    
    try {
        await window.DatabaseService.saveGameState(gameEngine, currentPlayerType);
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

// Auto-save game state periodically
function startAutoSave() {
    // Save every 30 seconds if game is running
    saveStateInterval = setInterval(() => {
        if (gameEngine && gameEngine.isTimerRunning) {
            saveGameState();
        }
    }, 30000); // 30 seconds
}

// Stop auto-save
function stopAutoSave() {
    if (saveStateInterval) {
        clearInterval(saveStateInterval);
        saveStateInterval = null;
    }
}

// Check for saved game state and resume if available
async function checkForSavedGame() {
    if (!window.DatabaseService) return;
    
    try {
        const savedState = await window.DatabaseService.loadGameState();
        if (savedState && savedState.currentLocationIndex > 0) {
            // Ask user if they want to resume
            const resume = confirm('We found a saved game. Would you like to resume where you left off?');
            if (resume) {
                resumeGame(savedState);
            } else {
                // Clear saved state if user doesn't want to resume
                await window.DatabaseService.deleteGameSession();
            }
        }
    } catch (error) {
        console.error('Error checking for saved game:', error);
    }
}

// Resume game from saved state
function resumeGame(savedState) {
    // Restore game engine state
    gameEngine.restoreState(savedState);
    currentPlayerType = savedState.playerType || 'solo';
    
    // Update UI
    updateScoreDisplay(gameEngine.getScore());
    updateTimerDisplay(gameEngine.elapsedTime);
    updateLocationsPanel();
    
    // Restore timer if it was running
    if (savedState.isTimerRunning && !savedState.isTimerPaused) {
        // Calculate remaining time
        const now = Date.now();
        const elapsedSinceSave = Math.floor((now - (savedState.startTime || now)) / 1000);
        gameEngine.elapsedTime = savedState.elapsedTime + elapsedSinceSave;
        gameEngine.startTime = now - (gameEngine.elapsedTime * 1000) - savedState.totalPauseTime;
        gameEngine.startTimer();
    } else if (savedState.isTimerPaused) {
        // Timer was paused, restore pause state
        gameEngine.isTimerRunning = true;
        gameEngine.isTimerPaused = true;
        gameEngine.startTime = savedState.startTime;
        gameEngine.totalPauseTime = savedState.totalPauseTime;
    }
    
    // Show appropriate screen based on current location
    if (savedState.currentLocationIndex === 0) {
        showScreen('starting-point-screen');
        document.getElementById('starting-location-name').textContent = gameData.startingLocation.name;
        document.getElementById('starting-location-address').textContent = gameData.startingLocation.address;
    } else {
        showScreen('game-screen');
        loadCurrentLocation();
    }
}
