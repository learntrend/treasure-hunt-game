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
function gameStateToDB(gameEngine, playerType, bookingId = null) {
    const state = {
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
        updatedAt: firebase.firestore.Timestamp.now()
    };
    
    // Store individual player name for both solo and group games (needed for Archibald to reference actual player)
    if (gameEngine.individualPlayerName) {
        state.individualPlayerName = gameEngine.individualPlayerName;
    }
    
    // Store team name for group games (for admin dashboard)
    if (gameEngine.teamName) {
        state.teamName = gameEngine.teamName;
    }
    
    // Convert groupMembers to array if it's a string (comma-separated)
    if (typeof state.groupMembers === 'string') {
        state.groupMembers = state.groupMembers.split(',').map(name => name.trim()).filter(name => name);
    }

    // Add booking-related fields if they exist
    if (gameEngine.bookingId || bookingId) {
        state.bookingId = gameEngine.bookingId || bookingId;
    }
    if (gameEngine.bookingDate) {
        state.bookingDate = gameEngine.bookingDate;
    }
    if (gameEngine.bookingTime) {
        state.bookingTime = gameEngine.bookingTime;
    }
    // Set gameStatus - default to 'active' if not set (for non-booking games)
    state.gameStatus = gameEngine.gameStatus || 'active';
    if (gameEngine.lastPlayedAt) {
        state.lastPlayedAt = firebase.firestore.Timestamp.fromMillis(gameEngine.lastPlayedAt);
    }

    // Only set createdAt if it's a new session
    if (!gameEngine.createdAt) {
        state.createdAt = firebase.firestore.Timestamp.now();
    }

    return state;
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
        individualPlayerName: data.individualPlayerName || null, // Store individual player name for Archibald references
        completedLocations: data.completedLocations || [],
        hintsUsed: {
            textHints: new Set(data.hintsUsed?.textHints || []),
            mapHints: new Set(data.hintsUsed?.mapHints || [])
        },
        answersSubmitted: new Set(data.answersSubmitted || []),
        locationNamesSubmitted: new Set(data.locationNamesSubmitted || []),
        playerType: data.playerType || 'solo',
        // Game access control fields
        bookingId: data.bookingId || null,
        bookingDate: data.bookingDate || null,
        bookingTime: data.bookingTime || null,
        gameStatus: data.gameStatus || 'pending',
        lastPlayedAt: data.lastPlayedAt ? (data.lastPlayedAt.toMillis ? data.lastPlayedAt.toMillis() : data.lastPlayedAt) : null
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
        const bookingId = gameEngine.bookingId || null;
        const gameStateData = gameStateToDB(gameEngine, playerType, bookingId);

        const sessionRef = db.collection('gameSessions').doc(sessionId);
        await sessionRef.set(gameStateData, { merge: true });
        
        // Update lastPlayedAt when saving
        await sessionRef.update({
            lastPlayedAt: firebase.firestore.Timestamp.now()
        });
        
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
            locationNamesSubmitted: Array.from(gameEngine.locationNamesSubmitted),
            bookingId: gameEngine.bookingId || bookingId || null,
            bookingDate: gameEngine.bookingDate || null,
            bookingTime: gameEngine.bookingTime || null,
            gameStatus: gameEngine.gameStatus || 'pending'
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
        if (!sessionId) {
            console.log('No session ID found for loadGameState');
            return null;
        }

        const sessionRef = db.collection('gameSessions').doc(sessionId);
        const docSnap = await sessionRef.get();

        // Validate docSnap is a valid Firestore document snapshot
        if (!docSnap) {
            console.warn('docSnap is null or undefined');
            return null;
        }

        // Check if document exists (handle both Firestore v8 and v9+ syntax)
        let exists = false;
        try {
            if (typeof docSnap.exists === 'function') {
                // Firestore v8: exists is a function
                exists = docSnap.exists();
            } else if (typeof docSnap.exists === 'boolean') {
                // Firestore v9+: exists is a boolean property
                exists = docSnap.exists;
            } else {
                // Fallback: check if data exists
                const data = docSnap.data();
                exists = data !== undefined && data !== null;
            }
        } catch (existsError) {
            console.error('Error checking document existence:', existsError);
            // Fallback: try to get data
            try {
                const data = docSnap.data();
                exists = data !== undefined && data !== null;
            } catch (dataError) {
                console.error('Error getting document data:', dataError);
                return null;
            }
        }
        
        if (exists) {
            try {
                const data = docSnap.data();
                if (data) {
                    return dbToGameState(data);
                }
            } catch (dataError) {
                console.error('Error converting document data:', dataError);
            }
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

// ============================================
// GAME ACCESS CONTROL FUNCTIONS
// ============================================

// Create game session from booking
async function createGameSessionFromBooking(bookingId, bookingData) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized. Cannot create game session.');
        return null;
    }

    try {
        // Always create a NEW session for each player
        // Multiple players can use the same booking link, but each gets their own session
        // This allows each player to start from location 0 with their own timer
        
        // Create new game session
        const sessionId = generateSessionId();
        setSessionId(sessionId);

        const gameSessionData = {
            sessionId: sessionId,
            bookingId: bookingId,
            bookingDate: bookingData.date || null,
            bookingTime: bookingData.time || null,
            playerType: bookingData.players > 1 ? 'group' : 'solo',
            playerName: bookingData.name || '',
            email: bookingData.email || '',
            recipientEmail: bookingData.recipientEmail || bookingData.email || '',
            personalMessage: bookingData.personalMessage || null,
            messageFrom: bookingData.messageFrom || null,
            gameStatus: 'pending', // pending, active, completed, abandoned
            currentLocationIndex: 0,
            score: 100, // Starting bonus
            createdAt: firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
        };

        await db.collection('gameSessions').doc(sessionId).set(gameSessionData);
        return sessionId;
    } catch (error) {
        console.error('Error creating game session from booking:', error);
        return null;
    }
}

// Check if game can be accessed (time-based and status checks)
async function canAccessGame(bookingId = null, sessionId = null) {
    if (!db || !isInitialized) {
        return { canAccess: false, reason: 'Database not initialized' };
    }

    try {
        let gameSession = null;

        // Find game session by bookingId or sessionId
        if (bookingId) {
            const bookingQuery = await db.collection('gameSessions')
                .where('bookingId', '==', bookingId)
                .limit(1)
                .get();
            
            if (!bookingQuery.empty) {
                gameSession = { id: bookingQuery.docs[0].id, ...bookingQuery.docs[0].data() };
            }
        } else if (sessionId) {
            const sessionDoc = await db.collection('gameSessions').doc(sessionId).get();
            const docExists = typeof sessionDoc.exists === 'function' ? sessionDoc.exists() : sessionDoc.exists;
            if (docExists) {
                gameSession = { id: sessionDoc.id, ...sessionDoc.data() };
            }
        } else {
            // Try to get from current session
            const currentSessionId = getSessionId();
            if (currentSessionId) {
                const sessionDoc = await db.collection('gameSessions').doc(currentSessionId).get();
                const docExists = typeof sessionDoc.exists === 'function' ? sessionDoc.exists() : sessionDoc.exists;
                if (docExists) {
                    gameSession = { id: sessionDoc.id, ...sessionDoc.data() };
                }
            }
        }

        if (!gameSession) {
            return { canAccess: false, reason: 'Game session not found' };
        }

        // Check game status
        const gameStatus = gameSession.gameStatus || 'pending';
        
        if (gameStatus === 'completed') {
            return { canAccess: false, reason: 'Game already completed. You cannot play again.' };
        }

        if (gameStatus === 'abandoned') {
            // Check if enough time has passed (e.g., 1 hour after last play)
            const lastPlayedAt = gameSession.lastPlayedAt;
            if (lastPlayedAt) {
                const lastPlayed = lastPlayedAt.toMillis ? lastPlayedAt.toMillis() : lastPlayedAt;
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                
                if (lastPlayed < oneHourAgo) {
                    return { canAccess: false, reason: 'Game session expired. You cannot resume after leaving.' };
                }
            } else {
                return { canAccess: false, reason: 'Game session expired. You cannot resume after leaving.' };
            }
        }

        // Check booking time (if booking date/time exists)
        if (gameSession.bookingDate && gameSession.bookingTime) {
            const now = new Date();
            
            // Parse booking date and time - handle different formats
            let bookingDateTime;
            try {
                // Try ISO format first: "2024-01-15T11:30"
                const dateTimeString = `${gameSession.bookingDate}T${gameSession.bookingTime}`;
                bookingDateTime = new Date(dateTimeString);
                
                // Validate the date
                if (isNaN(bookingDateTime.getTime())) {
                    console.error('Invalid booking date/time:', dateTimeString);
                    // Fallback: try parsing date and time separately
                    const [datePart] = gameSession.bookingDate.split('T');
                    const [timePart] = gameSession.bookingTime.split('T');
                    bookingDateTime = new Date(`${datePart}T${timePart}`);
                }
                
                // If still invalid, log error but allow access (don't block due to date parsing issues)
                if (isNaN(bookingDateTime.getTime())) {
                    console.error('Could not parse booking date/time. Allowing access.');
                    return { canAccess: true, gameSession: gameSession };
                }
            } catch (error) {
                console.error('Error parsing booking date/time:', error);
                // Allow access if date parsing fails (don't block users)
                return { canAccess: true, gameSession: gameSession };
            }
            
            // If booking is in the past, allow access immediately
            if (bookingDateTime < now) {
                console.log('Booking is in the past, allowing immediate access');
                return { canAccess: true, gameSession: gameSession };
            }
            
            // Allow access 15 minutes before booking time
            const accessStartTime = new Date(bookingDateTime.getTime() - 15 * 60 * 1000);
            
            if (now < accessStartTime) {
                const timeUntilAccessMinutes = Math.ceil((accessStartTime - now) / (1000 * 60));
                
                // Format time message nicely
                let timeMessage;
                if (timeUntilAccessMinutes >= 60) {
                    const hours = Math.floor(timeUntilAccessMinutes / 60);
                    const minutes = timeUntilAccessMinutes % 60;
                    if (minutes > 0) {
                        timeMessage = `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                    } else {
                        timeMessage = `${hours} hour${hours > 1 ? 's' : ''}`;
                    }
                } else {
                    timeMessage = `${timeUntilAccessMinutes} minute${timeUntilAccessMinutes !== 1 ? 's' : ''}`;
                }
                
                // Format booking date and time for display
                const bookingDateDisplay = bookingDateTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const bookingTimeDisplay = bookingDateTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                return { 
                    canAccess: false, 
                    reason: `Your game is scheduled for ${bookingDateDisplay} at ${bookingTimeDisplay}. The game will be available in ${timeMessage} (15 minutes before your booking time).` 
                };
            }
        }

        return { canAccess: true, gameSession: gameSession };
    } catch (error) {
        console.error('Error checking game access:', error);
        return { canAccess: false, reason: 'Error checking access: ' + error.message };
    }
}

// Update game status
async function updateGameStatus(sessionId, status) {
    if (!db || !isInitialized) {
        console.warn('Database not initialized. Cannot update game status.');
        return false;
    }

    try {
        const updateData = {
            gameStatus: status,
            updatedAt: firebase.firestore.Timestamp.now()
        };

        if (status === 'active' && !gameSession.startTime) {
            updateData.startTime = firebase.firestore.Timestamp.now();
        }

        if (status === 'completed' || status === 'abandoned') {
            updateData.lastPlayedAt = firebase.firestore.Timestamp.now();
        }

        await db.collection('gameSessions').doc(sessionId).update(updateData);
        return true;
    } catch (error) {
        console.error('Error updating game status:', error);
        return false;
    }
}

// Get game session by booking ID (for group access)
async function getGameSessionByBookingId(bookingId) {
    if (!db || !isInitialized) {
        return null;
    }

    try {
        const querySnapshot = await db.collection('gameSessions')
            .where('bookingId', '==', bookingId)
            .limit(1)
            .get();

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting game session by booking ID:', error);
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
    initializeFirebase,
    // New game access control functions
    createGameSessionFromBooking,
    canAccessGame,
    updateGameStatus,
    getGameSessionByBookingId
};
