// Main Application Logic - Handles UI interactions and screen management

let gameEngine;
// Audio/Music - COMMENTED OUT FOR NOW
// let backgroundMusic;
// let isMusicPlaying = false;
let currentPlayerType = 'solo'; // Track current player type (solo/group)
let saveStateInterval = null; // Interval for auto-saving game state
let waitingForGameplayStart = false; // Flag to track if we're waiting to start gameplay after character message

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    if (window.DatabaseService) {
        window.DatabaseService.initializeFirebase();
    }
    
    gameEngine = new GameEngine();
    
    // Initialize background music - COMMENTED OUT FOR NOW
    // backgroundMusic = document.getElementById('background-music');
    // if (backgroundMusic) {
    //     backgroundMusic.volume = 0.3; // Set volume to 30%
    // }
    
    // Set up callbacks
    gameEngine.onTimerUpdate = (time) => {
        updateTimerDisplay(time);
    };
    
    gameEngine.onScoreUpdate = (score) => {
        updateScoreDisplay(score);
    };
    
    // Set current year in final screen
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Check for booking-based access
    await checkBookingAccess();
    
    // Check for saved game state and resume if available
    await checkForSavedGame();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-save game state every 30 seconds (only when game is running)
    startAutoSave();
});

// Get URL parameter
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get session ID (helper function)
function getSessionId() {
    if (window.DatabaseService && typeof window.DatabaseService.getSessionId === 'function') {
        return window.DatabaseService.getSessionId();
    }
    // Fallback to localStorage
    return localStorage.getItem('gameSessionId');
}

// Check booking-based access
async function checkBookingAccess() {
    const bookingId = getURLParameter('bookingId');
    
    if (!bookingId) {
        // No booking ID - allow normal game flow (for testing/development)
        return;
    }
    
    if (!window.DatabaseService || !window.DatabaseService.isInitialized()) {
        console.warn('Database not initialized. Cannot check booking access.');
        return;
    }
    
    try {
        // Check if we can access the game
        const accessCheck = await window.DatabaseService.canAccessGame(bookingId);
        
        if (!accessCheck.canAccess) {
            // Show access denied message
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.innerHTML = `
                    <div class="welcome-container">
                        <h1 class="game-title">Access Restricted</h1>
                        <p class="game-subtitle" style="color: var(--accent-color); margin-top: 20px;">
                            ${accessCheck.reason || 'You cannot access this game at this time.'}
                        </p>
                        <p style="margin-top: 20px; color: #666;">
                            If you believe this is an error, please contact support.
                        </p>
                    </div>
                `;
            }
            return;
        }
        
        // Access granted - load game session
        const gameSession = accessCheck.gameSession;
        if (gameSession) {
            // IMPORTANT: Set session ID so loadGameState can find it
            if (window.DatabaseService && typeof window.DatabaseService.setSessionId === 'function') {
                window.DatabaseService.setSessionId(gameSession.id || gameSession.sessionId);
            }
            
            // Set booking info in game engine
            gameEngine.bookingId = bookingId;
            gameEngine.bookingDate = gameSession.bookingDate;
            gameEngine.bookingTime = gameSession.bookingTime;
            gameEngine.gameStatus = gameSession.gameStatus || 'pending';
            
            // If game is already active, restore state
            if (gameSession.gameStatus === 'active' && gameSession.currentLocationIndex > 0) {
                const savedState = await window.DatabaseService.loadGameStateBySessionId(gameSession.id);
                if (savedState) {
                    gameEngine.restoreState(savedState);
                    // Will be handled by checkForSavedGame
                }
            }
        }
    } catch (error) {
        console.error('Error checking booking access:', error);
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Welcome screen
    document.getElementById('group-size').addEventListener('change', (e) => {
        updateNameLabel(e.target.value);
        const groupContainer = document.getElementById('group-names-container');
        groupContainer.style.display = e.target.value === 'group' ? 'block' : 'none';
    });
    
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('resume-previous-game-btn').addEventListener('click', showResumeGameModal);
    document.getElementById('view-tutorial-btn').addEventListener('click', showTutorial);
    document.getElementById('start-after-tutorial-btn').addEventListener('click', startAfterTutorial);
    
    // Resume game modal
    document.getElementById('close-resume-modal').addEventListener('click', closeResumeGameModal);
    document.getElementById('search-saved-games-btn').addEventListener('click', searchSavedGames);
    document.getElementById('resume-player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchSavedGames();
        }
    });
    
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
    // Music toggle - COMMENTED OUT FOR NOW
    // document.getElementById('music-toggle-btn').addEventListener('click', toggleMusic);
    
    // Titbits screen
    document.getElementById('close-titbits-btn').addEventListener('click', closeTitbits);
    
    // Hint modal
    document.getElementById('close-hint-modal').addEventListener('click', closeHintModal);
    
    // Feedback modal
    document.getElementById('close-feedback-modal').addEventListener('click', closeFeedbackModal);
    
    // Final screen
    document.getElementById('give-feedback-btn').addEventListener('click', showFeedbackModal);
    document.getElementById('share-results-btn').addEventListener('click', shareResults);
    
    // Feedback form
    document.getElementById('feedback-form').addEventListener('submit', handleFeedbackSubmit);
    document.getElementById('close-feedback-form-btn').addEventListener('click', closeFeedbackModal);
    document.getElementById('close-feedback-after-submit').addEventListener('click', closeFeedbackModal);
    
    // Character modals
    document.getElementById('close-character-intro-btn').addEventListener('click', closeCharacterIntro);
    document.getElementById('close-character-popup-btn').addEventListener('click', closeCharacterPopup);
    
    // Setup rating buttons
    setupRatingButtons();
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

// Toggle background music - COMMENTED OUT FOR NOW
/*
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
*/

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
    const bookingId = getURLParameter('bookingId');
    
    if (!playerName) {
        const label = groupSize === 'group' ? 'team name' : 'name';
        alert(`Please enter your ${label} to begin.`);
        return;
    }
    
    if (groupSize === 'group' && !groupNames) {
        alert('Please enter group member names.');
        return;
    }
    
    // If booking-based game, check access first
    if (bookingId && window.DatabaseService && window.DatabaseService.isInitialized()) {
        const accessCheck = await window.DatabaseService.canAccessGame(bookingId);
        
        if (!accessCheck.canAccess) {
            alert(accessCheck.reason || 'You cannot start this game at this time.');
            return;
        }
        
        // Get or create game session
        const gameSession = accessCheck.gameSession;
        if (gameSession) {
            // Use existing session
            gameEngine.bookingId = bookingId;
            gameEngine.bookingDate = gameSession.bookingDate;
            gameEngine.bookingTime = gameSession.bookingTime;
            gameEngine.gameStatus = 'active';
            
            // Update game status to active
            await window.DatabaseService.updateGameStatus(gameSession.id, 'active');
        } else {
            // Create new session from booking
            // Note: This would require fetching booking data first
            // For now, we'll create session with booking ID
            gameEngine.bookingId = bookingId;
            gameEngine.gameStatus = 'active';
        }
    } else {
        // Non-booking game (for testing/development)
        // Clear any previous game session
        if (window.DatabaseService) {
            await window.DatabaseService.deleteGameSession();
        }
    }
    
    // Store player type
    currentPlayerType = groupSize;
    
    // Initialize game engine (personal message will be fetched from database later)
    gameEngine.initialize(playerName, groupSize, groupNames, null);
    
    // Update score display to show initial 100 points
    updateScoreDisplay(gameEngine.getScore());
    
    // Show character introduction first
    showCharacterIntroduction(playerName, groupSize);
}

// Start gameplay when player arrives at starting point
async function startGameplay() {
    // Show welcome message from character
    const welcomeMessages = [
        `Excellent! You've arrived at the starting point. Your journey through time begins now, ${gameEngine.playerName}!`,
        `Splendid! The adventure commences. Let's see what mysteries await you, ${gameEngine.playerName}!`,
        `Wonderful! You're ready to begin. The lost letter from 1800 awaits discovery, ${gameEngine.playerName}!`
    ];
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    // Set flag to continue after popup closes
    waitingForGameplayStart = true;
    showCharacterPopup(randomWelcome, null, false, true);
}

// Load current location data
function loadCurrentLocation() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    // Update location stage indicator
    updateLocationStageIndicator();
    
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
    
    // Reset hint buttons and re-enable map hint for new location
    resetHintButtons();
    
    // Re-enable and show map hint button for new clue
    const mapHintBtn = document.getElementById('map-hint-btn');
    if (mapHintBtn) {
        mapHintBtn.disabled = false;
        mapHintBtn.style.display = 'block';
    }
    
    // Show the hint-buttons container in clue section
    const clueHintButtons = document.querySelector('#clue-section .hint-buttons');
    if (clueHintButtons) {
        clueHintButtons.style.display = 'flex';
    }
    
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
        
        // Show motivational message from character
        const location = gameEngine.getCurrentLocation();
        const locationMessages = [
            `Excellent work! You've found ${location.locationName || location.name}. Well done!`,
            `Splendid! ${location.locationName || location.name} is indeed the correct location.`,
            `Bravo! You've correctly identified ${location.locationName || location.name}.`
        ];
        const randomMessage = locationMessages[Math.floor(Math.random() * locationMessages.length)];
        
        // Store callback to continue after popup closes
        const continueAfterPopup = () => {
            // Hide and disable map hint button since location is now confirmed
            const mapHintBtn = document.getElementById('map-hint-btn');
            if (mapHintBtn) {
                mapHintBtn.disabled = true;
                mapHintBtn.style.display = 'none';
            }
            
            // Also hide the hint-buttons container in clue section
            const clueHintButtons = document.querySelector('#clue-section .hint-buttons');
            if (clueHintButtons) {
                clueHintButtons.style.display = 'none';
            }
            
            // Hide location name input
            document.getElementById('location-name-input-container').style.display = 'none';
            
            // Show location confirmation with scroll animation
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
        };
        
        // Show character popup with callback
        showCharacterPopupWithCallback(randomMessage, null, false, true, continueAfterPopup);
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
            
            // Show motivational message from character
            const locationNumber = gameEngine.getCurrentLocationNumber();
            const totalLocations = gameData.locations.length;
            const motivationalMessages = getMotivationalMessage(locationNumber, totalLocations);
            
            // Update locations panel
            updateLocationsPanel();
            
            // Save game state after correct answer
            saveGameState();
            
            // Check if game is complete
            if (gameEngine.isGameComplete()) {
                // Show final motivational message, then final screen
                setTimeout(() => {
                    showCharacterPopupWithCallback(motivationalMessages.message, null, false, true, () => {
                        showFinalScreen();
                    });
                }, 1000);
            } else {
                // Show motivational message, then move to next location
                setTimeout(() => {
                    showCharacterPopupWithCallback(motivationalMessages.message, null, false, true, async () => {
                        gameEngine.nextLocation();
                        loadCurrentLocation();
                        showMessage('', ''); // Clear message
                        // Save state after moving to next location
                        await saveGameState();
                    });
                }, 1000);
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
        // Show character popup with hint
        const hintMessages = [
            "Ah, seeking guidance, are we? Very well, let me illuminate your path...",
            "A wise choice to seek assistance! Here's what I can tell you...",
            "Excellent! Asking for help shows wisdom. Allow me to share this insight...",
            "I see you need a nudge in the right direction. Here's what you should know..."
        ];
        const randomMessage = hintMessages[Math.floor(Math.random() * hintMessages.length)];
        showCharacterPopup(randomMessage, hint, false, false);
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
        // Show character popup with map hint
        const hintMessages = [
            "Ah, you seek the path forward! Let me show you the way...",
            "A map to guide your journey! Here's where you must go...",
            "Excellent! Sometimes a visual guide is what's needed. Behold...",
            "The way becomes clearer with a map. Here's your route..."
        ];
        const randomMessage = hintMessages[Math.floor(Math.random() * hintMessages.length)];
        showCharacterPopup(randomMessage, hintData.text, true, false);
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
    
    // Update game status to completed
    if (window.DatabaseService && window.DatabaseService.isInitialized() && gameEngine.bookingId) {
        const sessionId = getSessionId();
        if (sessionId) {
            await window.DatabaseService.updateGameStatus(sessionId, 'completed');
        }
    }
    gameEngine.gameStatus = 'completed';
    
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
            completedLocations: gameEngine.completedLocations,
            hintsUsed: {
                textHints: Array.from(gameEngine.hintsUsed.textHints),
                mapHints: Array.from(gameEngine.hintsUsed.mapHints)
            }
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
    // Reset form
    document.getElementById('feedback-form').reset();
    document.getElementById('rating').value = '';
    document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('feedback-form').style.display = 'block';
    document.getElementById('feedback-success').style.display = 'none';
    
    document.getElementById('feedback-modal').classList.add('active');
}

// Close feedback modal
function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('active');
    // Reset form when closing
    document.getElementById('feedback-form').reset();
    document.getElementById('rating').value = '';
    document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('feedback-form').style.display = 'block';
    document.getElementById('feedback-success').style.display = 'none';
}

// Handle feedback form submission
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submit-feedback-btn');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const rating = document.getElementById('rating').value;
    const enjoyed = Array.from(document.querySelectorAll('input[name="enjoyed"]:checked')).map(cb => cb.value);
    const difficulty = document.getElementById('difficulty').value;
    const recommend = document.getElementById('recommend').value;
    const improvements = document.getElementById('improvements').value.trim();
    const comments = document.getElementById('comments').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validation
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
    
    if (!rating) {
        showFormError('rating', 'Please select a rating');
        isValid = false;
    }
    
    if (enjoyed.length === 0) {
        showFormError(document.querySelector('.checkbox-group').closest('.form-group'), 'Please select at least one option');
        isValid = false;
    }
    
    if (!difficulty) {
        showFormError('difficulty', 'Please select difficulty level');
        isValid = false;
    }
    
    if (!recommend) {
        showFormError('recommend', 'Please select recommendation');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Get current game stats
        const stats = gameEngine.getFinalStats();
        
        // Prepare feedback data
        const feedbackData = {
            rating: parseInt(rating),
            enjoyed: enjoyed,
            difficulty: difficulty,
            recommend: recommend,
            improvements: improvements || null,
            comments: comments || null,
            email: email || null,
            playerName: gameEngine.playerName || 'Anonymous',
            playerType: currentPlayerType || 'solo',
            groupMembers: gameEngine.groupMembers || [],
            gameScore: stats.score || 0,
            gameTime: gameEngine.elapsedTime || 0,
            completedAt: new Date().toISOString()
        };
        
        // Save to database
        if (window.DatabaseService) {
            const saved = await window.DatabaseService.saveFeedback(feedbackData);
            if (saved) {
                // Show success message
                document.getElementById('feedback-form').style.display = 'none';
                document.getElementById('feedback-success').style.display = 'block';
            } else {
                throw new Error('Failed to save feedback');
            }
        } else {
            // Fallback: show success even if database not available
            document.getElementById('feedback-form').style.display = 'none';
            document.getElementById('feedback-success').style.display = 'block';
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('There was an error submitting your feedback. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show form error
function showFormError(fieldIdOrElement, message) {
    let formGroup;
    if (typeof fieldIdOrElement === 'string') {
        const field = document.getElementById(fieldIdOrElement);
        formGroup = field ? field.closest('.form-group') : null;
    } else {
        formGroup = fieldIdOrElement;
    }
    
    if (formGroup) {
        formGroup.classList.add('error');
        let errorElement = formGroup.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
}

// Setup rating buttons
function setupRatingButtons() {
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Set hidden input value
            document.getElementById('rating').value = this.dataset.rating;
            // Clear error if any
            const formGroup = this.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
            }
        });
    });
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
    
    // Hide stage indicator on non-game screens
    const stageIndicator = document.getElementById('location-stage-indicator');
    if (stageIndicator) {
        if (screenId === 'game-screen') {
            // Will be shown/hidden by loadCurrentLocation
        } else {
            stageIndicator.style.display = 'none';
        }
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

// Update location stage indicator
function updateLocationStageIndicator() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    const currentLocationNumber = gameEngine.getCurrentLocationNumber();
    const totalLocations = gameData.locations.length;
    const stageIndicator = document.getElementById('location-stage-indicator');
    const stageText = document.getElementById('stage-text');
    
    if (stageIndicator && stageText) {
        // Smart stage indicators based on progress
        const progress = currentLocationNumber / totalLocations;
        let stageLabel = '';
        
        if (currentLocationNumber === 1) {
            stageLabel = '📍 Beginning Your Quest';
        } else if (currentLocationNumber === Math.floor(totalLocations / 2)) {
            stageLabel = '⚖️ Halfway Through Your Journey';
        } else if (currentLocationNumber === totalLocations - 1) {
            stageLabel = '🏁 Approaching the Final Destination';
        } else if (currentLocationNumber === totalLocations) {
            stageLabel = '🎯 Final Stage';
        } else if (progress < 0.3) {
            stageLabel = `🌱 Early Stages of Your Adventure`;
        } else if (progress < 0.7) {
            stageLabel = `🚶 Making Steady Progress`;
        } else {
            stageLabel = `🏃 Nearing the End`;
        }
        
        stageText.textContent = `${stageLabel} • Stage ${currentLocationNumber} of ${totalLocations}`;
        stageIndicator.style.display = 'block';
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
    
    // Restore and resume timer - don't add disconnected time, just resume from saved elapsed time
    if (savedState.currentLocationIndex > 0) {
        const now = Date.now();
        const savedElapsedTime = savedState.elapsedTime || 0;
        const savedTotalPauseTime = savedState.totalPauseTime || 0;
        
        // Restore timer state - don't add any time that passed while disconnected
        // Just resume from the saved elapsed time
        gameEngine.elapsedTime = savedElapsedTime;
        gameEngine.totalPauseTime = savedTotalPauseTime;
        
        // Calculate start time so timer continues from saved elapsed time
        // Formula in game engine: elapsed = (now - startTime - totalPauseTime) / 1000
        // We want: elapsed = savedElapsedTime (at resume time)
        // So: startTime = now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000)
        gameEngine.startTime = now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000);
        
        if (savedState.isTimerPaused) {
            // Timer was paused (e.g., viewing titbits) - restore pause state
            gameEngine.isTimerRunning = true;
            gameEngine.isTimerPaused = true;
            gameEngine.pauseStartTime = savedState.pauseStartTime || now;
            console.log('Timer restored - was paused, elapsed time:', gameEngine.elapsedTime);
        } else {
            // Timer should be running - resume it from saved elapsed time
            gameEngine.isTimerRunning = true;
            gameEngine.isTimerPaused = false;
            gameEngine.pauseStartTime = null;
            
            // Stop any existing timer interval
            if (gameEngine.timerInterval) {
                clearInterval(gameEngine.timerInterval);
                gameEngine.timerInterval = null;
            }
            
            // Start the timer - this will continue counting from saved elapsed time
            gameEngine.updateTimer();
            console.log('Timer resumed from:', gameEngine.elapsedTime, 'seconds');
        }
        
        // Update timer display immediately with saved elapsed time
        updateTimerDisplay(gameEngine.elapsedTime);
    } else {
        // At starting point - timer hasn't started yet
        gameEngine.elapsedTime = 0;
        gameEngine.isTimerRunning = false;
        gameEngine.isTimerPaused = false;
        updateTimerDisplay(0);
        console.log('Timer not started - at starting point');
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

// Show resume game modal
function showResumeGameModal() {
    document.getElementById('resume-game-modal').classList.add('active');
    document.getElementById('resume-player-name').value = '';
    document.getElementById('saved-games-results').style.display = 'none';
    document.getElementById('saved-games-list').innerHTML = '';
    document.getElementById('no-games-found').style.display = 'none';
    document.getElementById('resume-loading').style.display = 'none';
}

// Close resume game modal
function closeResumeGameModal() {
    document.getElementById('resume-game-modal').classList.remove('active');
}

// Search for saved games by player name
async function searchSavedGames() {
    const playerName = document.getElementById('resume-player-name').value.trim();
    
    if (!playerName) {
        alert('Please enter your name to search for saved games.');
        return;
    }
    
    if (!window.DatabaseService || !window.DatabaseService.isInitialized()) {
        alert('Database not available. Please check your connection.');
        return;
    }
    
    const resultsDiv = document.getElementById('saved-games-results');
    const gamesList = document.getElementById('saved-games-list');
    const noGamesFound = document.getElementById('no-games-found');
    const loadingDiv = document.getElementById('resume-loading');
    
    // Show loading
    resultsDiv.style.display = 'block';
    gamesList.innerHTML = '';
    noGamesFound.style.display = 'none';
    loadingDiv.style.display = 'block';
    
    try {
        const games = await window.DatabaseService.searchSavedGamesByPlayerName(playerName);
        
        loadingDiv.style.display = 'none';
        
        if (games.length === 0) {
            noGamesFound.style.display = 'block';
            gamesList.innerHTML = '';
        } else {
            noGamesFound.style.display = 'none';
            
            let html = '';
            games.forEach((game, index) => {
                const lastUpdated = game.lastUpdated.toLocaleString();
                const locationText = game.currentLocationIndex === 0 
                    ? 'Starting Point' 
                    : `Location ${game.currentLocationIndex}`;
                const timeText = formatTimeForResume(game.elapsedTime);
                
                html += `
                    <div style="background: rgba(102, 126, 234, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid var(--accent-color);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <strong style="color: var(--primary-color);">Game ${index + 1}</strong>
                                <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                                    ${locationText} • Score: ${game.score} ⭐ • Time: ${timeText}
                                </div>
                                <div style="font-size: 0.85rem; color: #999; margin-top: 5px;">
                                    Last saved: ${lastUpdated}
                                </div>
                            </div>
                            <button class="btn-primary" onclick="resumeSelectedGame('${game.id}', '${game.sessionId}')" style="padding: 8px 15px; font-size: 0.9rem;">
                                Resume
                            </button>
                        </div>
                    </div>
                `;
            });
            
            gamesList.innerHTML = html;
        }
    } catch (error) {
        console.error('Error searching saved games:', error);
        loadingDiv.style.display = 'none';
        
        // Show more detailed error message
        let errorMessage = 'Error searching for saved games. ';
        if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check the console for details.';
        }
        
        // Check if it's an index error
        if (error.message && error.message.includes('index')) {
            errorMessage += '\n\nYou may need to create a Firestore index. Check the console for the link.';
        }
        
        alert(errorMessage);
    }
}

// Resume selected game - directly loads from database
async function resumeSelectedGame(gameId, sessionId) {
    if (!window.DatabaseService) {
        alert('Database not available.');
        return;
    }
    
    const loadingDiv = document.getElementById('resume-loading');
    loadingDiv.style.display = 'block';
    
    try {
        console.log('Resuming game with document ID:', gameId, 'sessionId:', sessionId);
        const savedState = await window.DatabaseService.loadGameStateBySessionId(gameId);
        
        if (!savedState) {
            loadingDiv.style.display = 'none';
            console.error('Failed to load game state. Document ID:', gameId);
            alert('Could not load the selected game. It may have been deleted or the session expired.');
            return;
        }
        
        console.log('Game state loaded successfully:', savedState);
        console.log('Current location index:', savedState.currentLocationIndex);
        console.log('Player name:', savedState.playerName);
        console.log('Score:', savedState.score);
        
        // Close modal first
        closeResumeGameModal();
        
        // Directly restore game engine state
        try {
            gameEngine.restoreState(savedState);
            currentPlayerType = savedState.playerType || 'solo';
            
            console.log('Game engine restored successfully');
            
            // Update UI
            updateScoreDisplay(gameEngine.getScore());
            updateTimerDisplay(gameEngine.elapsedTime);
            updateLocationsPanel();
            
            // Restore and resume timer
            // If game is in progress (past starting point), always resume timer
            if (savedState.currentLocationIndex > 0) {
                const now = Date.now();
                const savedElapsedTime = savedState.elapsedTime || 0;
                const savedTotalPauseTime = savedState.totalPauseTime || 0;
                
                // Restore timer state - don't add any time that passed while disconnected
                // Just resume from the saved elapsed time
                gameEngine.elapsedTime = savedElapsedTime;
                gameEngine.totalPauseTime = savedTotalPauseTime;
                
                // Calculate start time so timer continues from saved elapsed time
                // Formula in game engine: elapsed = (now - startTime - totalPauseTime) / 1000
                // We want: elapsed = savedElapsedTime (at resume time)
                // So: startTime = now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000)
                gameEngine.startTime = now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000);
                
                if (savedState.isTimerPaused) {
                    // Timer was paused (e.g., viewing titbits) - restore pause state
                    gameEngine.isTimerRunning = true;
                    gameEngine.isTimerPaused = true;
                    gameEngine.pauseStartTime = savedState.pauseStartTime || now;
                    console.log('Timer restored - was paused, elapsed time:', gameEngine.elapsedTime);
                } else {
                    // Timer should be running - resume it from saved elapsed time
                    gameEngine.isTimerRunning = true;
                    gameEngine.isTimerPaused = false;
                    gameEngine.pauseStartTime = null;
                    
                    // Stop any existing timer interval
                    if (gameEngine.timerInterval) {
                        clearInterval(gameEngine.timerInterval);
                        gameEngine.timerInterval = null;
                    }
                    
                    // Start the timer - this will continue counting from saved elapsed time
                    gameEngine.updateTimer();
                    console.log('Timer resumed from:', gameEngine.elapsedTime, 'seconds');
                }
                
                // Update timer display immediately with saved elapsed time
                updateTimerDisplay(gameEngine.elapsedTime);
            } else {
                // At starting point - timer hasn't started yet
                gameEngine.elapsedTime = 0;
                gameEngine.isTimerRunning = false;
                gameEngine.isTimerPaused = false;
                updateTimerDisplay(0);
                console.log('Timer not started - at starting point');
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
            
            // Start auto-save if not already running
            startAutoSave();
            
        } catch (restoreError) {
            console.error('Error restoring game state:', restoreError);
            alert('Error restoring game: ' + (restoreError.message || 'Please try again.'));
        }
        
    } catch (error) {
        console.error('Error resuming game:', error);
        loadingDiv.style.display = 'none';
        alert('Error loading game: ' + (error.message || 'Please try again.'));
    }
}

// Format time helper for resume modal
function formatTimeForResume(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Character System Functions

// Show character introduction
function showCharacterIntroduction(playerName, groupSize) {
    const characterIntroText = document.getElementById('character-intro-text');
    const greeting = groupSize === 'group' ? `Greetings, ${playerName}!` : `Greetings, ${playerName}!`;
    
    characterIntroText.innerHTML = `
        ${greeting} I am <strong>Master Archibald</strong>, the keeper of this temporal treasure hunt and master of this game.<br><br>
        Through my time-traveling mechanisms and steampunk contraptions, I have crafted this journey across the centuries for you.<br><br>
        Your quest: Follow the clues, solve the puzzles, and discover the lost letter from 1800. I shall be your guide, appearing when you need assistance or when you achieve great feats.<br><br>
        <em>Remember: You start with 100 bonus points. Each correct answer earns you 100 points. Hints cost points, but wisdom often comes at a price!</em><br><br>
        Are you ready to begin this adventure through time?
    `;
    
    document.getElementById('character-intro-modal').classList.add('active');
}

// Close character introduction
function closeCharacterIntro() {
    document.getElementById('character-intro-modal').classList.remove('active');
    
    // Show starting point screen after introduction
    showScreen('starting-point-screen');
    
    // Update starting location info
    document.getElementById('starting-location-name').textContent = gameData.startingLocation.name;
    document.getElementById('starting-location-address').textContent = gameData.startingLocation.address;
}

// Show character popup (for hints and messages)
function showCharacterPopup(message, hintText, isMapHint, isMotivational) {
    showCharacterPopupWithCallback(message, hintText, isMapHint, isMotivational, null);
}

// Show character popup with callback (for when we need to continue after popup closes)
let characterPopupCallback = null;

function showCharacterPopupWithCallback(message, hintText, isMapHint, isMotivational, callback) {
    const popupText = document.getElementById('character-popup-text');
    const hintContent = document.getElementById('character-hint-content');
    const hintTextElement = document.getElementById('character-hint-text');
    const mapHintContainer = document.getElementById('character-map-hint-container');
    
    popupText.textContent = message;
    
    if (hintText) {
        hintContent.style.display = 'block';
        hintTextElement.textContent = hintText;
        
        if (isMapHint) {
            mapHintContainer.style.display = 'block';
        } else {
            mapHintContainer.style.display = 'none';
        }
    } else {
        hintContent.style.display = 'none';
    }
    
    // Store callback
    characterPopupCallback = callback;
    
    document.getElementById('character-popup-modal').classList.add('active');
}

// Close character popup
async function closeCharacterPopup() {
    document.getElementById('character-popup-modal').classList.remove('active');
    
    // Execute callback if provided
    if (characterPopupCallback) {
        const callback = characterPopupCallback;
        characterPopupCallback = null;
        callback();
    }
    
    // If we were waiting to start gameplay, continue now
    if (waitingForGameplayStart) {
        waitingForGameplayStart = false;
        
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
}

// Get motivational message based on progress
function getMotivationalMessage(currentLocation, totalLocations) {
    const progress = currentLocation / totalLocations;
    const playerName = gameEngine.playerName;
    
    let message = '';
    
    if (currentLocation === 1) {
        message = `Excellent work, ${playerName}! You've found your first location. The journey has truly begun!`;
    } else if (currentLocation === Math.floor(totalLocations / 2)) {
        message = `Magnificent progress, ${playerName}! You're halfway through your quest. The letter from 1800 draws nearer!`;
    } else if (currentLocation === totalLocations - 1) {
        message = `Outstanding, ${playerName}! You're on the final stretch. The lost letter awaits at your next destination!`;
    } else if (currentLocation === totalLocations) {
        message = `Congratulations, ${playerName}! You've completed the entire journey! The letter from 1800 is yours to discover!`;
    } else if (progress < 0.3) {
        const messages = [
            `Well done, ${playerName}! You're making excellent progress. Keep up the momentum!`,
            `Splendid work, ${playerName}! Each location brings you closer to the mystery.`,
            `Bravo, ${playerName}! Your determination is admirable. Continue forward!`
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    } else if (progress < 0.7) {
        const messages = [
            `Impressive, ${playerName}! You're navigating this temporal puzzle with great skill!`,
            `Excellent progress, ${playerName}! The pieces of the puzzle are coming together.`,
            `Outstanding work, ${playerName}! You're proving yourself a worthy time traveler!`
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    } else {
        const messages = [
            `Remarkable, ${playerName}! You're so close to uncovering the secret!`,
            `Extraordinary work, ${playerName}! The final revelation approaches!`,
            `Brilliant, ${playerName}! Your journey through time is nearly complete!`
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    }
    
    return { message };
}
