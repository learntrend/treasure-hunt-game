// Main Application Logic - Handles UI interactions and screen management

let gameEngine;
let backgroundMusic;
let isMusicPlaying = false;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Set up event listeners
    setupEventListeners();
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
    document.getElementById('skip-tutorial-btn').addEventListener('click', skipTutorial);
    
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

// Skip tutorial
function skipTutorial() {
    showScreen('welcome-screen');
}

// Start game from welcome screen
function startGame() {
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
    
    // Initialize game engine (personal message will be fetched from database later)
    gameEngine.initialize(playerName, groupSize, groupNames, null);
    
    // Show starting point screen
    showScreen('starting-point-screen');
    
    // Update starting location info
    document.getElementById('starting-location-name').textContent = gameData.startingLocation.name;
    document.getElementById('starting-location-address').textContent = gameData.startingLocation.address;
}

// Start gameplay when player arrives at starting point
function startGameplay() {
    // Start timer
    gameEngine.startTimer();
    
    // Move to first location
    gameEngine.nextLocation();
    
    // Show game screen
    showScreen('game-screen');
    
    // Load first location with page turn animation
    loadCurrentLocation();
}

// Load current location data
function loadCurrentLocation() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    // Apply page turn animation to clue section
    const clueSection = document.getElementById('clue-section');
    clueSection.classList.add('page-turn');
    setTimeout(() => {
        clueSection.classList.remove('page-turn');
    }, 800);
    
    // Update clue
    document.getElementById('clue-text').textContent = location.clue;
    
    // Show clue section with location name input
    document.getElementById('clue-section').style.display = 'block';
    document.getElementById('location-name-input-container').style.display = 'block';
    document.getElementById('location-name-input').value = '';
    document.getElementById('location-name-input').classList.remove('error', 'success');
    
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
    
    if (!locationName) {
        showMessage('Please enter a location name.', 'error');
        locationNameInput.classList.add('error');
        return;
    }
    
    const result = gameEngine.submitLocationName(locationName);
    
    if (result && result.correct) {
        locationNameInput.classList.remove('error');
        locationNameInput.classList.add('success');
        showMessage('Correct location!', 'success');
        
        // Hide location name input
        document.getElementById('location-name-input-container').style.display = 'none';
        
        // Show location confirmation with scroll animation
        const location = gameEngine.getCurrentLocation();
        document.getElementById('location-name').textContent = location.locationName || location.name;
        document.getElementById('location-description').textContent = location.description;
        const locationInfoSection = document.getElementById('location-info-section');
        locationInfoSection.style.display = 'block';
        locationInfoSection.classList.add('scroll-reveal');
        
        // Show question section after a short delay with scroll animation
        setTimeout(() => {
            showQuestionSection();
        }, 1500);
    } else {
        locationNameInput.classList.add('error');
        locationNameInput.classList.remove('success');
        showMessage('Incorrect location. Try again!', 'error');
        // Don't clear input - let user retry
        setTimeout(() => {
            locationNameInput.classList.remove('error');
        }, 2000);
    }
}

// Show question section
function showQuestionSection() {
    const location = gameEngine.getCurrentLocation();
    if (!location) return;
    
    document.getElementById('question-text').textContent = location.question;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').classList.remove('error', 'success');
    const questionSection = document.getElementById('question-section');
    questionSection.style.display = 'block';
    questionSection.classList.add('scroll-reveal');
    document.getElementById('action-buttons-container').style.display = 'block';
}

// Submit answer - Allow unlimited retries
function submitAnswer() {
    const answerInput = document.getElementById('answer-input');
    const answerText = answerInput.value.trim();
    
    if (!answerText) {
        showMessage('Please enter an answer.', 'error');
        answerInput.classList.add('error');
        return;
    }
    
    const result = gameEngine.submitAnswer(answerText);
    
    if (result) {
        if (result.correct) {
            answerInput.classList.remove('error');
            answerInput.classList.add('success');
            showMessage('Correct! +' + result.points + ' points', 'success');
            
            // Update locations panel
            updateLocationsPanel();
            
            // Check if game is complete
            if (gameEngine.isGameComplete()) {
                setTimeout(() => {
                    showFinalScreen();
                }, 2000);
            } else {
                // Move to next location after delay with page turn animation
                setTimeout(() => {
                    gameEngine.nextLocation();
                    loadCurrentLocation();
                    showMessage('', ''); // Clear message
                }, 2000);
            }
        } else {
            answerInput.classList.add('error');
            answerInput.classList.remove('success');
            showMessage('Incorrect answer. Try again!', 'error');
            // Don't clear input - let user retry with unlimited attempts
            setTimeout(() => {
                answerInput.classList.remove('error');
            }, 2000);
        }
    }
}

// Show text hint
function showTextHint() {
    if (gameEngine.hasUsedTextHint()) {
        alert('You have already used the text hint for this location.');
        return;
    }
    
    const hint = gameEngine.useTextHint();
    if (hint) {
        showHintModal('Text Hint', hint, false);
        updateScoreDisplay(gameEngine.getScore());
        resetHintButtons();
    }
}

// Show map hint
function showMapHint() {
    if (gameEngine.hasUsedMapHint()) {
        alert('You have already used the map hint for this location.');
        return;
    }
    
    const hintData = gameEngine.useMapHint();
    if (hintData) {
        showHintModal('Map Hint', hintData.text, true, hintData.locationName);
        updateScoreDisplay(gameEngine.getScore());
        resetHintButtons();
    }
}

// Show hint modal
function showHintModal(title, text, isMapHint, locationName) {
    document.getElementById('hint-modal-title').textContent = title;
    document.getElementById('hint-text').textContent = text;
    
    const mapContainer = document.getElementById('map-hint-container');
    if (isMapHint) {
        mapContainer.style.display = 'block';
        if (locationName) {
            document.getElementById('map-hint-text').textContent = `Next location: ${locationName}`;
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
    
    // Update final screen
    document.getElementById('final-time').textContent = stats.time;
    document.getElementById('final-score').textContent = stats.score;
    // Format message with line breaks
    const messageElement = document.getElementById('personal-message-text');
    messageElement.innerHTML = stats.personalMessage.replace(/\n/g, '<br>');
    
    // Show final screen
    showScreen('final-screen');
    
    // Show feedback dialog after a short delay
    setTimeout(() => {
        showFeedbackModal();
    }, 3000); // Show after 3 seconds
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
        
        textHintBtn.disabled = textHintUsed;
        mapHintBtn.disabled = mapHintUsed;
        
        if (textHintUsed) {
            textHintBtn.textContent = '💡 Text Hint (Used)';
        } else {
            textHintBtn.textContent = '💡 Text Hint (-30 pts)';
        }
        
        if (mapHintUsed) {
            mapHintBtn.textContent = '🗺️ Map Hint (Used)';
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
