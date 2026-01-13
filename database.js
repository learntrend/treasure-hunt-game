// Database Service - Firebase Firestore Integration
// Handles all database operations for game state, scores, and leaderboards

// Database will be initialized after Firebase SDK loads
let db = null;
let isInitialized = false;

// Initialize Firebase
function initializeFirebase() {
    // Check if Firebase is already initialized
    if (isInitialized) return;
    
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Database features will be disabled.');
        return;
    }

    try {
        // Get config from firebase-config.js (loaded as a global variable)
        if (typeof firebaseConfig === 'undefined') {
            console.warn('Firebase config not found. Please check firebase-config.js');
            return;
        }

        // Check if app is already initialized
        try {
            firebase.app();
            // App already initialized, just get firestore
            db = firebase.firestore();
        } catch (e) {
            // App not initialized, initialize it
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        }
        
        isInitialized = true;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        console.warn('Database features will be disabled. Please check your Firebase configuration.');
    }
}

// Try to initialize when script loads (if Firebase is already available)
if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
    initializeFirebase();
}

// Generate a unique session ID for the current game
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID (stored in localStorage)
function getSessionId() {
    let sessionId = localStorage.getItem('gameSessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('gameSessionId', sessionId);
    }
    return sessionId;
}

// Set session ID
function setSessionId(sessionId) {
    localStorage.setItem('gameSessionId', sessionId);
}

// Clear session ID
function clearSessionId() {
    localStorage.removeItem('gameSessionId');
}

// Database Schema:
// Collection: 'gameSessions'
// Document ID: sessionId (generated)
// Fields: (see saveGameState function)

// Collection: 'completedGames'
// Document ID: auto-generated
// Fields: (see saveCompletedGame function)

// Convert game engine state to database format
function gameStateToDB(gameEngine, playerType) {
    return {
        sessionId: getSessionId(),
        playerType: playerType,
        playerName: gameEngine.playerName,
        groupMembers: gameEngine.groupMembers || [],
        currentLocationIndex: gameEngine.currentLocationIndex,
        score: gameEngine.score,
        startTime: gameEngine.startTime ? firebase.firestore.Timestamp.fromMillis(gameEngine.startTime) : null,
        elapsedTime: gameEngine.elapsedTime,
        isTimerRunning: gameEngine.isTimerRunning,
        isTimerPaused: gameEngine.isTimerPaused,
        pauseStartTime: gameEngine.pauseStartTime ? firebase.firestore.Timestamp.fromMillis(gameEngine.pauseStartTime) : null,
        totalPauseTime: gameEngine.totalPauseTime,
        completedLocations: gameEngine.completedLocations || [],
        hintsUsed: {
            textHints: Array.from(gameEngine.hintsUsed.textHints || []),
            mapHints: Array.from(gameEngine.hintsUsed.mapHints || [])
        },
        answersSubmitted: Array.from(gameEngine.answersSubmitted || []),
        locationNamesSubmitted: Array.from(gameEngine.locationNamesSubmitted || []),
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now()
    };
}

// Convert database format back to game engine state
function dbToGameState(data) {
    if (!data) return null;

    const state = {
        currentLocationIndex: data.currentLocationIndex || 0,
        score: data.score || 0,
        startTime: data.startTime ? data.startTime.toMillis() : null,
        elapsedTime: data.elapsedTime || 0,
        isTimerRunning: data.isTimerRunning || false,
        isTimerPaused: data.isTimerPaused || false,
        pauseStartTime: data.pauseStartTime ? data.pauseStartTime.toMillis() : null,
        totalPauseTime: data.totalPauseTime || 0,
        playerName: data.playerName || '',
        groupMembers: data.groupMembers || [],
        completedLocations: data.completedLocations || [],
        hintsUsed: {
            textHints: new Set(data.hintsUsed?.textHints || []),
            mapHints: new Set(data.hintsUsed?.mapHints || [])
        },
        answersSubmitted: new Set(data.answersSubmitted || []),
        locationNamesSubmitted: new Set(data.locationNamesSubmitted || []),
        playerType: data.playerType || 'solo'
    };

    return state;
}

// Save game state to database
async function saveGameState(gameEngine, playerType) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized. Game state not saved to database.');
        // Fallback to localStorage
        const state = {
            playerType: playerType,
            playerName: gameEngine.playerName,
            groupMembers: gameEngine.groupMembers,
            currentLocationIndex: gameEngine.currentLocationIndex,
            score: gameEngine.score,
            startTime: gameEngine.startTime,
            elapsedTime: gameEngine.elapsedTime,
            isTimerRunning: gameEngine.isTimerRunning,
            isTimerPaused: gameEngine.isTimerPaused,
            pauseStartTime: gameEngine.pauseStartTime,
            totalPauseTime: gameEngine.totalPauseTime,
            completedLocations: gameEngine.completedLocations,
            hintsUsed: {
                textHints: Array.from(gameEngine.hintsUsed.textHints),
                mapHints: Array.from(gameEngine.hintsUsed.mapHints)
            },
            answersSubmitted: Array.from(gameEngine.answersSubmitted),
            locationNamesSubmitted: Array.from(gameEngine.locationNamesSubmitted)
        };
        localStorage.setItem('gameState', JSON.stringify(state));
        return false;
    }

    try {
        const sessionId = getSessionId();
        const gameStateData = gameStateToDB(gameEngine, playerType);

        const sessionRef = db.collection('gameSessions').doc(sessionId);
        await sessionRef.set(gameStateData, { merge: true });
        
        // Also save to localStorage as backup
        const state = {
            playerType: playerType,
            playerName: gameEngine.playerName,
            groupMembers: gameEngine.groupMembers,
            currentLocationIndex: gameEngine.currentLocationIndex,
            score: gameEngine.score,
            startTime: gameEngine.startTime,
            elapsedTime: gameEngine.elapsedTime,
            isTimerRunning: gameEngine.isTimerRunning,
            isTimerPaused: gameEngine.isTimerPaused,
            pauseStartTime: gameEngine.pauseStartTime,
            totalPauseTime: gameEngine.totalPauseTime,
            completedLocations: gameEngine.completedLocations,
            hintsUsed: {
                textHints: Array.from(gameEngine.hintsUsed.textHints),
                mapHints: Array.from(gameEngine.hintsUsed.mapHints)
            },
            answersSubmitted: Array.from(gameEngine.answersSubmitted),
            locationNamesSubmitted: Array.from(gameEngine.locationNamesSubmitted)
        };
        localStorage.setItem('gameState', JSON.stringify(state));
        
        return true;
    } catch (error) {
        console.error('Error saving game state:', error);
        // Fallback to localStorage
        const state = {
            playerType: playerType,
            playerName: gameEngine.playerName,
            groupMembers: gameEngine.groupMembers,
            currentLocationIndex: gameEngine.currentLocationIndex,
            score: gameEngine.score,
            startTime: gameEngine.startTime,
            elapsedTime: gameEngine.elapsedTime,
            isTimerRunning: gameEngine.isTimerRunning,
            isTimerPaused: gameEngine.isTimerPaused,
            pauseStartTime: gameEngine.pauseStartTime,
            totalPauseTime: gameEngine.totalPauseTime,
            completedLocations: gameEngine.completedLocations,
            hintsUsed: {
                textHints: Array.from(gameEngine.hintsUsed.textHints),
                mapHints: Array.from(gameEngine.hintsUsed.mapHints)
            },
            answersSubmitted: Array.from(gameEngine.answersSubmitted),
            locationNamesSubmitted: Array.from(gameEngine.locationNamesSubmitted)
        };
        localStorage.setItem('gameState', JSON.stringify(state));
        return false;
    }
}

// Load game state from database
async function loadGameState() {
    if (!db || !isInitialized) {
        // Try localStorage fallback
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                // Convert arrays back to Sets
                if (state.hintsUsed) {
                    state.hintsUsed = {
                        textHints: new Set(state.hintsUsed.textHints || []),
                        mapHints: new Set(state.hintsUsed.mapHints || [])
                    };
                }
                if (state.answersSubmitted) {
                    state.answersSubmitted = new Set(state.answersSubmitted || []);
                }
                if (state.locationNamesSubmitted) {
                    state.locationNamesSubmitted = new Set(state.locationNamesSubmitted || []);
                }
                return state;
            } catch (error) {
                console.error('Error parsing localStorage game state:', error);
                return null;
            }
        }
        return null;
    }

    try {
        const sessionId = getSessionId();
        if (!sessionId) return null;

        const sessionRef = db.collection('gameSessions').doc(sessionId);
        const docSnap = await sessionRef.get();

        if (docSnap.exists()) {
            const data = docSnap.data();
            return dbToGameState(data);
        }
        return null;
    } catch (error) {
        console.error('Error loading game state:', error);
        // Try localStorage fallback
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                // Convert arrays back to Sets
                if (state.hintsUsed) {
                    state.hintsUsed = {
                        textHints: new Set(state.hintsUsed.textHints || []),
                        mapHints: new Set(state.hintsUsed.mapHints || [])
                    };
                }
                if (state.answersSubmitted) {
                    state.answersSubmitted = new Set(state.answersSubmitted || []);
                }
                if (state.locationNamesSubmitted) {
                    state.locationNamesSubmitted = new Set(state.locationNamesSubmitted || []);
                }
                return state;
            } catch (error) {
                return null;
            }
        }
        return null;
    }
}

// Save completed game (for leaderboard)
async function saveCompletedGame(gameStats) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized. Completed game not saved.');
        return false;
    }

    try {
        const sessionId = getSessionId();
        const completedGameData = {
            sessionId: sessionId,
            playerType: gameStats.playerType,
            playerName: gameStats.playerName,
            groupMembers: gameStats.groupMembers || [],
            finalScore: gameStats.score, // stars/points
            finalTime: gameStats.time, // in seconds
            calculatedScore: calculateFinalScore(gameStats.score, gameStats.time),
            completedLocations: gameStats.completedLocations || [],
            hintsUsed: gameStats.hintsUsed || { textHints: [], mapHints: [] }, // Include hints used
            completedAt: firebase.firestore.Timestamp.now()
        };

        // Save to completedGames collection
        await db.collection('completedGames').add(completedGameData);
        
        // Delete the session from gameSessions (no longer needed - game is complete)
        if (sessionId) {
            const sessionRef = db.collection('gameSessions').doc(sessionId);
            await sessionRef.delete();
        }
        
        // Clear session ID and localStorage after game completion
        clearSessionId();
        localStorage.removeItem('gameState');
        
        return true;
    } catch (error) {
        console.error('Error saving completed game:', error);
        return false;
    }
}

// Calculate final score for leaderboard (stars - time penalty)
// Higher score = better performance
// Formula: (stars * 10) - (time in seconds / 10)
// This rewards high stars and low time
function calculateFinalScore(stars, timeInSeconds) {
    return Math.round((stars * 10) - (timeInSeconds / 10));
}

// Get leaderboard (solo players)
async function getSoloLeaderboard(limitCount = 10) {
    if (!db || !isInitialized) {
        return [];
    }

    try {
        const querySnapshot = await db.collection('completedGames')
            .where('playerType', '==', 'solo')
            .orderBy('calculatedScore', 'desc')
            .limit(limitCount)
            .get();
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching solo leaderboard:', error);
        return [];
    }
}

// Get leaderboard (groups)
async function getGroupLeaderboard(limitCount = 10) {
    if (!db || !isInitialized) {
        return [];
    }

    try {
        const querySnapshot = await db.collection('completedGames')
            .where('playerType', '==', 'group')
            .orderBy('calculatedScore', 'desc')
            .limit(limitCount)
            .get();
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching group leaderboard:', error);
        return [];
    }
}

// Delete game session (when starting new game)
async function deleteGameSession() {
    if (!db || !isInitialized) {
        clearSessionId();
        localStorage.removeItem('gameState');
        return true;
    }

    try {
        const sessionId = getSessionId();
        if (sessionId) {
            const sessionRef = db.collection('gameSessions').doc(sessionId);
            await sessionRef.update({ deleted: true });
        }
        clearSessionId();
        localStorage.removeItem('gameState');
        return true;
    } catch (error) {
        console.error('Error deleting game session:', error);
        clearSessionId();
        localStorage.removeItem('gameState');
        return false;
    }
}

// Save feedback to database
async function saveFeedback(feedbackData) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized. Feedback not saved.');
        return false;
    }

    try {
        const feedbackDoc = {
            ...feedbackData,
            submittedAt: firebase.firestore.Timestamp.now(),
            playerName: feedbackData.playerName || 'Anonymous',
            playerType: feedbackData.playerType || 'unknown',
            gameScore: feedbackData.gameScore || 0,
            gameTime: feedbackData.gameTime || 0
        };

        await db.collection('feedback').add(feedbackDoc);
        return true;
    } catch (error) {
        console.error('Error saving feedback:', error);
        return false;
    }
}

// Search for saved games by player name (same day, within 2 hours)
async function searchSavedGamesByPlayerName(playerName) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized.');
        throw new Error('Database not initialized. Please check your Firebase connection.');
    }

    if (!playerName || playerName.trim() === '') {
        throw new Error('Player name is required.');
    }

    try {
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        
        // Get today's date at midnight for same-day filtering
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        console.log('Searching for games with playerName:', playerName.trim());
        
        const snapshot = await db.collection('gameSessions')
            .where('playerName', '==', playerName.trim())
            .get();
        
        console.log('Found', snapshot.size, 'documents matching playerName');

        const games = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Get last updated time (use updatedAt, fallback to createdAt)
            let lastUpdated;
            if (data.updatedAt) {
                lastUpdated = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
            } else if (data.createdAt) {
                lastUpdated = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            } else {
                // Skip if no timestamp available
                return;
            }
            
            // Filter: same day and within 2 hours
            const isSameDay = lastUpdated >= today;
            const isWithin2Hours = lastUpdated >= twoHoursAgo;
            
            if (isSameDay && isWithin2Hours) {
                games.push({
                    id: doc.id,
                    playerName: data.playerName,
                    playerType: data.playerType,
                    currentLocationIndex: data.currentLocationIndex || 0,
                    score: data.score || 0,
                    elapsedTime: data.elapsedTime || 0,
                    lastUpdated: lastUpdated,
                    sessionId: data.sessionId
                });
            }
        });
        
        // Sort by last updated (most recent first)
        games.sort((a, b) => b.lastUpdated - a.lastUpdated);
        
        console.log('Filtered to', games.length, 'games from today within 2 hours');
        
        return games;
    } catch (error) {
        console.error('Error searching saved games:', error);
        // Re-throw the error so the caller can handle it
        throw error;
    }
}

// Load game state by session ID (document ID) - returns raw data
async function loadGameStateBySessionId(documentId) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized.');
        return null;
    }

    if (!documentId) {
        console.error('Document ID is required.');
        return null;
    }

    try {
        console.log('Loading game state for document ID:', documentId);
        const sessionRef = db.collection('gameSessions').doc(documentId);
        const docSnap = await sessionRef.get();

        // Check if document exists - handle both exists() method and data() check
        let exists = false;
        let data = null;
        
        if (typeof docSnap.exists === 'function') {
            exists = docSnap.exists();
            if (exists) {
                data = docSnap.data();
            }
        } else {
            // Fallback: try to get data directly
            data = docSnap.data();
            exists = data !== undefined && data !== null;
        }

        if (exists && data) {
            console.log('Game state found, raw data:', data);
            
            // Set the session ID so future saves use this session
            if (data.sessionId) {
                setSessionId(data.sessionId);
            } else {
                // If no sessionId in data, use the document ID
                setSessionId(documentId);
            }
            
            // Return raw data with converted timestamps
            const gameState = {
                currentLocationIndex: data.currentLocationIndex || 0,
                score: data.score || 0,
                startTime: data.startTime ? (data.startTime.toMillis ? data.startTime.toMillis() : (typeof data.startTime === 'number' ? data.startTime : null)) : null,
                elapsedTime: data.elapsedTime || 0,
                isTimerRunning: data.isTimerRunning || false,
                isTimerPaused: data.isTimerPaused || false,
                pauseStartTime: data.pauseStartTime ? (data.pauseStartTime.toMillis ? data.pauseStartTime.toMillis() : (typeof data.pauseStartTime === 'number' ? data.pauseStartTime : null)) : null,
                totalPauseTime: data.totalPauseTime || 0,
                playerName: data.playerName || '',
                groupMembers: data.groupMembers || [],
                completedLocations: data.completedLocations || [],
                hintsUsed: {
                    textHints: new Set(data.hintsUsed?.textHints || []),
                    mapHints: new Set(data.hintsUsed?.mapHints || [])
                },
                answersSubmitted: new Set(data.answersSubmitted || []),
                locationNamesSubmitted: new Set(data.locationNamesSubmitted || []),
                playerType: data.playerType || 'solo'
            };
            
            console.log('Game state converted successfully:', gameState);
            return gameState;
        } else {
            console.warn('Document does not exist or has no data:', documentId);
            return null;
        }
    } catch (error) {
        console.error('Error loading game state by session ID:', error);
        console.error('Error details:', error.message, error.stack);
        return null;
    }
}

// Export functions as global object
window.DatabaseService = {
    saveGameState,
    loadGameState,
    saveCompletedGame,
    getSoloLeaderboard,
    getGroupLeaderboard,
    deleteGameSession,
    calculateFinalScore,
    saveFeedback,
    searchSavedGamesByPlayerName,
    loadGameStateBySessionId,
    isInitialized: () => isInitialized,
    initializeFirebase
};
