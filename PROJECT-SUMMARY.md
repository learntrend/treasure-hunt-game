# Treasure Hunt Game - Project Summary

## Project Overview
A mobile-first web-based treasure hunt game with a "Lost Letter from 1800" theme. Players find clues at physical locations and solve virtual puzzles. The game is approximately 1 hour long, playable solo or in groups, and involves 10 locations with clues, questions, and a final personal message reveal.

## Key Features

### Game Mechanics
- **Starting Bonus**: Players start with 100 stars/points
- **Scoring System**:
  - +100 points per correct answer
  - -30 points for text hints
  - -50 points for map hints
- **Timer**: Tracks game time, pauses when viewing "Learn About This Place" (titbits)
- **Game Flow**:
  1. Player sees clue ("🔍 Your Clue")
  2. Types location name in text input
  3. Upon correct entry, sees "📍 Current Location" confirmation
  4. Then sees "❓ Location Question" requiring text input answer
  5. Correct answer reveals next clue
  6. Repeats for 10 locations
  7. Final letter reveal with personal message

### Player Types
- **Solo**: Single player
- **Group**: Multiple players with team name

### Hints System
- **Map Hint**: Available in "🔍 Your Clue" section (-50 points)
  - Hidden after location is confirmed
  - Can be viewed multiple times (only deducts points on first use)
- **Text Hint**: Available in "❓ Location Question" section (-30 points)
  - Can be viewed multiple times (only deducts points on first use)

### Game State Management
- **Auto-save**: Game state saved to Firebase every 30 seconds
- **Resume Game**: Players can resume saved games
  - Initial prompt on page load if saved game exists
  - "Resume Previous Game" button on welcome screen
  - Searches by player/team name (same day, within 2 hours)
- **Timer Resume**: Resumes from saved elapsed time (does NOT add disconnected time)

### Feedback System
- Custom feedback form integrated in app (not Google Forms)
- Saves to Firebase `feedback` collection
- Feedback stats page: `feedback-stats.html`

## Technical Stack

### Frontend
- **HTML5, CSS3, JavaScript** (vanilla, no frameworks)
- **Mobile-first responsive design**
- **CSS Animations**: Fade-in effects, sparkle animations on buttons
- **Audio**: Background music with play/pause toggle (Pixabay Music, no attribution)

### Backend/Database
- **Firebase Firestore** (NoSQL database)
- **Collections**:
  - `gameSessions`: Active/incomplete games
  - `completedGames`: Finished games (moved from gameSessions on completion)
  - `feedback`: Player feedback submissions

### External Resources
- **Images**: Unsplash (no attribution required)
- **Audio**: Pixabay Music (no attribution required)

## File Structure

```
treasure-hunt-game/
├── index.html              # Main game page
├── app.js                  # UI logic, screen management, event handlers
├── game-engine.js          # Core game logic, timer, scoring, state management
├── game-data.js            # Game content (locations, clues, answers, hints, titbits)
├── database.js             # Firebase integration, save/load game state
├── firebase-config.js      # Firebase configuration (API keys, project ID)
├── styles.css              # All styling
├── admin/
│   └── index.html          # Admin portal (password: 'chicken')
├── admin-dashboard.html    # View game sessions, completed games, leaderboards
├── feedback-stats.html     # View feedback data in tabular format
├── booking.html            # Game booking page (collects booking info and personal message)
├── README.md               # Project documentation
├── FIREBASE-SETUP.md       # Firebase setup instructions
├── FEEDBACK-FORM-SETUP.md  # Feedback form documentation (legacy, now using custom form)
└── PROJECT-SUMMARY.md      # Comprehensive project documentation
```

## Key Files Explained

### index.html
- Contains all screens: tutorial, welcome, starting point, game, titbits, final, modals
- Tutorial screen with game overview, how to play, tips for success
- Welcome screen with player setup (solo/group, name input)
- Game screen with clue section, location confirmation, question section
- Final screen with letter reveal and typewriter effect
- Feedback modal with custom form
- Resume game modal

### app.js
- **Main responsibilities**:
  - Screen management (`showScreen()`)
  - Event listeners setup
  - UI updates (score, timer, locations panel)
  - Game flow control (location name submission → question → answer)
  - Hint modal display
  - Feedback form handling
  - Resume game functionality
  - Auto-save management
- **Key functions**:
  - `startGame()`: Initialize game from welcome screen
  - `startGameplay()`: Start timer and show first location
  - `loadCurrentLocation()`: Display current clue and location input
  - `handleSubmitLocationName()`: Validate location name, show confirmation
  - `submitAnswer()`: Validate answer, award points, move to next location
  - `showTextHint()` / `showMapHint()`: Display hints (deduct points on first use)
  - `resumeGame()`: Restore game state and resume timer
  - `resumeSelectedGame()`: Load and resume specific saved game
  - `saveGameState()`: Save current game to Firebase
  - `checkForSavedGame()`: Check for saved game on page load

### game-engine.js
- **GameEngine class**: Core game logic
- **Properties**:
  - `currentLocationIndex`: 0 = starting point, 1-10 = locations
  - `score`: Starts at 100
  - `elapsedTime`: Game time in seconds
  - `hintsUsed`: Sets tracking which hints were used
  - `completedLocations`: Array of completed locations
- **Key methods**:
  - `initialize()`: Set up player data
  - `startTimer()`: Begin timer
  - `pauseTimer()`: Pause (for titbits)
  - `resumeTimer()`: Resume from pause
  - `submitLocationName()`: Validate location name
  - `submitAnswer()`: Validate answer, award points
  - `useTextHint()` / `useMapHint()`: Track hint usage, deduct points
  - `getState()`: Serialize state for saving
  - `restoreState()`: Deserialize state from database
  - `getFinalStats()`: Get final score, time, personal message

### game-data.js
- Contains all game content:
  - `startingLocation`: Starting point info
  - `locations[]`: Array of 10 locations
    - Each location has: `id`, `name`, `locationName`, `locationNameVariations[]`, `clue`, `question`, `correctAnswer`, `answerVariations[]`, `textHint`, `mapHint`, `description`, `titbits`

### database.js
- **DatabaseService** (exported as `window.DatabaseService`):
  - `initializeFirebase()`: Initialize Firebase SDK
  - `saveGameState()`: Save to `gameSessions` collection
  - `loadGameState()`: Load from `gameSessions` or localStorage
  - `saveCompletedGame()`: Move to `completedGames`, delete from `gameSessions`
  - `searchSavedGamesByPlayerName()`: Search by name (same day, within 2 hours)
  - `loadGameStateBySessionId()`: Load specific game by document ID
  - `saveFeedback()`: Save feedback to `feedback` collection
  - `getSoloLeaderboard()` / `getGroupLeaderboard()`: Fetch leaderboards

### firebase-config.js
- Contains Firebase configuration object:
  ```javascript
  var firebaseConfig = {
      apiKey: "...",
      authDomain: "...",
      projectId: "treasure-hunt-game-4bd4c",
      ...
  };
  ```

## Database Schema

### gameSessions Collection
- **Document ID**: Session ID (generated)
- **Fields**:
  - `sessionId`: Unique session identifier
  - `playerType`: 'solo' or 'group'
  - `playerName`: Player or team name
  - `groupMembers`: Array of group member names
  - `currentLocationIndex`: Current progress (0-10)
  - `score`: Current score
  - `elapsedTime`: Time elapsed in seconds
  - `isTimerRunning`: Boolean
  - `isTimerPaused`: Boolean
  - `startTime`: Firestore Timestamp
  - `totalPauseTime`: Total pause duration
  - `completedLocations`: Array
  - `hintsUsed`: Object with `textHints[]` and `mapHints[]` arrays
  - `answersSubmitted`: Array
  - `locationNamesSubmitted`: Array
  - `createdAt`: Firestore Timestamp
  - `updatedAt`: Firestore Timestamp

### completedGames Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `sessionId`: Original session ID
  - `playerType`: 'solo' or 'group'
  - `playerName`: Player or team name
  - `groupMembers`: Array
  - `finalScore`: Final stars/points
  - `finalTime`: Final time in seconds
  - `calculatedScore`: Leaderboard score
  - `completedLocations`: Array
  - `hintsUsed`: Object with hint usage
  - `completedAt`: Firestore Timestamp

### feedback Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `rating`: 1-5 stars
  - `enjoyed`: Array of enjoyed features
  - `difficulty`: 'too-easy', 'just-right', 'too-difficult'
  - `recommend`: Recommendation level
  - `improvements`: Text
  - `comments`: Text
  - `email`: Optional
  - `playerName`: Player/team name
  - `playerType`: 'solo' or 'group'
  - `gameScore`: Final game score
  - `gameTime`: Final game time
  - `submittedAt`: Firestore Timestamp

### bookings Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `email`: Customer email address
  - `name`: Full name
  - `phone`: Contact number
  - `date`: Preferred date (YYYY-MM-DD)
  - `time`: Preferred time (HH:MM)
  - `players`: Number of players (string: "1", "2", etc. or "more")
  - `personalMessage`: Message for final letter
  - `paymentMethod`: 'card', 'paypal', or 'bank'
  - `referral`: How they found us (google, social-media, friend, etc.)
  - `specialRequests`: Optional special requests/notes
  - `emergencyContact`: Optional emergency contact info
  - `submittedAt`: ISO timestamp string
  - `status`: Booking status ('pending', 'confirmed', 'completed', 'cancelled')

## Important Implementation Details

### Timer Logic
- Timer calculates: `elapsed = (now - startTime - totalPauseTime) / 1000`
- When resuming: `startTime = now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000)`
- **Critical**: Does NOT add disconnected time - resumes from saved elapsed time

### Hint System
- Hints can be viewed multiple times
- Points deducted only on FIRST use per location
- Button text changes to "View Again" after first use
- Map hint hidden after location is confirmed

### Location Name Validation
- Uses `locationNameVariations[]` array for flexible matching
- Case-insensitive
- Handles common prefixes/suffixes

### Answer Validation
- Uses `answerVariations[]` array for flexible matching
- Case-insensitive
- Unlimited retry attempts (no penalty)

### Personal Message
- Fetched from Firebase database (not collected at start)
- Retrieved during final screen display
- Stored during booking process (to be implemented)

### Auto-Save
- Saves every 30 seconds when game is running
- Saves after: location confirmation, correct answer, hint usage
- Uses both Firebase and localStorage (localStorage as backup)

### Resume Game
- **Initial prompt**: Shows on page load if saved game exists
- **Manual resume**: "Resume Previous Game" button on welcome screen
  - Searches by player/team name
  - Filters: same day, within 2 hours
  - Shows list of matching games with details
  - Player selects game to resume

## UI/UX Features

### Animations
- Fade-in effects for screen transitions
- Sparkle animations on primary buttons
- Typewriter effect for final letter
- Smooth scrolling for location/question sections

### Responsive Design
- Mobile-first approach
- Single scroll (no nested scrolling on tutorial)
- Touch-friendly buttons and inputs

### Visual Feedback
- Error messages below input fields
- Success states on inputs
- Disabled states for hint buttons after location confirmation
- Loading states for async operations

## Admin Features

### Admin Portal (`admin/index.html`)
- Password: `'chicken'`
- Links to:
  - Launch Game
  - Admin Dashboard
  - Feedback Statistics
  - Game Booking Page

### Booking Page (`booking.html`)
- **Purpose**: Collect booking information and personal message
- **Fields Collected**:
  1. Email address (required)
  2. Full name (required)
  3. Contact number (required)
  4. Preferred date and time (required)
  5. Number of players (required)
  6. Personal message for final letter (required)
  7. Payment method selection (required): Card, PayPal, or Bank Transfer
  8. How did you find us? (required)
  9. Special requests/notes (optional)
  10. Emergency contact (optional)
- **Payment**: Currently collects payment method preference. Payment link sent via email (to be integrated with payment processor)
- **Data Storage**: Saves to Firebase `bookings` collection
- **Success**: Shows confirmation message with email

### Admin Dashboard (`admin-dashboard.html`)
- **Active Sessions**: View current game sessions
- **Completed Games**: View finished games with statistics
- **Bookings Management**:
  - View all bookings divided into "Upcoming" and "Completed"
  - Upcoming bookings: Future dates/times and non-completed status
  - Completed bookings: Past dates/times or completed/cancelled status
  - Edit functionality for upcoming bookings (name, email, phone, date, time, status)
  - Booking statistics (total, upcoming, completed, pending)
  - CSV export for bookings
- **Statistics**: Total sessions, solo/group counts, averages
- **Leaderboards**: Solo and group leaderboards
- **CSV Export**: Export data for all sections
- **Hint Usage**: Shows hint usage details for games

### Feedback Stats (`feedback-stats.html`)
- Summary statistics
- Detailed feedback table
- CSV export
- Filters by player name

## Configuration Requirements

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database (Standard edition)
3. Get configuration from Firebase Console
4. Update `firebase-config.js` with credentials
5. Set Firestore security rules (see `FIREBASE-SETUP.md`)
6. Create composite indexes for leaderboards (see `FIREBASE-SETUP.md`)

### Running Locally
- Use Python HTTP server: `python3 -m http.server 8000`
- Or use `start-server.sh` script
- Access at `http://localhost:8000`

## Current State

### Completed Features
✅ Full game flow (10 locations)
✅ Timer with pause/resume
✅ Scoring system (100 starting + 100 per answer - hint costs)
✅ Hint system (text and map hints)
✅ Location name and answer validation
✅ Titbits (Learn About This Place)
✅ Final letter reveal with typewriter effect
✅ Firebase integration (save/load game state)
✅ Resume game functionality
✅ Auto-save
✅ Feedback form (custom, integrated)
✅ Admin dashboard
✅ Feedback statistics page
✅ Admin portal
✅ Tutorial screen
✅ Music toggle
✅ Locations panel (Your Journey)

### Known Limitations / Future Work
- **Booking System**: 
  - ✅ Booking page created and functional
  - ⚠️ Payment processing not yet integrated (currently collects payment method preference)
  - ⚠️ Personal message from booking needs to be linked to game session
  - ⚠️ Email confirmation system to be implemented
- Leaderboard indexes need to be created in Firebase Console
- Password for admin portal is hardcoded (consider environment variable or config)
- Need to create admin view for managing bookings

## Key Design Decisions

1. **No frameworks**: Pure vanilla JavaScript for simplicity and performance
2. **Mobile-first**: Designed primarily for mobile devices
3. **Text input only**: No multiple choice - all answers are text-based for authenticity
4. **Unlimited retries**: Players can try answers multiple times without penalty
5. **Timer doesn't count disconnected time**: Fair scoring - only counts active play time
6. **100 starting stars**: Allows hint usage from first location
7. **Custom feedback form**: Integrated experience vs external Google Form
8. **Auto-save with resume**: Prevents data loss, improves UX

## Testing Checklist

When testing or debugging:
1. Check browser console for errors
2. Verify Firebase connection
3. Test game flow: clue → location → question → answer
4. Test hint system (first use vs subsequent views)
5. Test timer pause/resume (titbits screen)
6. Test auto-save (check Firebase after 30 seconds)
7. Test resume game (initial prompt and manual resume)
8. Test feedback submission
9. Test admin portal access
10. Test on mobile device for responsive design

## Common Issues & Solutions

### Timer adds disconnected time
- **Solution**: Ensure `startTime` calculation uses: `now - (savedElapsedTime * 1000) - (savedTotalPauseTime * 1000)`

### Resume game not working
- **Check**: Firebase initialization, document ID vs session ID confusion
- **Solution**: Use document ID for `loadGameStateBySessionId()`

### Hints deducting points multiple times
- **Check**: `hintsUsed` Set tracking in game engine
- **Solution**: Only deduct on first use, track in Set

### Map hint visible after location confirmed
- **Solution**: Hide hint button container: `clueHintButtons.style.display = 'none'`

## Git Repository
- **Repository**: https://github.com/learntrend/treasure-hunt-game.git
- **Main branch**: `main`
- **Recent major changes**: 100 starting stars, resume game improvements, custom feedback form, admin portal

---

## Booking System

### Booking Page (`booking.html`)
- **Purpose**: Collect booking information and personal message for the final letter
- **Access**: Linked from admin portal, or direct URL: `/booking.html`
- **Safety Disclaimer**: Includes legal disclaimer about playing safely and responsibly
- **Fields Collected**:
  1. **Email Address** (required) - For booking confirmation
  2. **Full Name** (required) - Customer name
  3. **Contact Number** (required) - Phone number with country code
  4. **Preferred Date** (required) - Date picker (minimum: today)
  5. **Preferred Time** (required) - Time picker
  6. **Number of Players** (required) - Dropdown (1-10 or "More than 10")
  7. **Personal Message** (required, min 10 chars) - Message to be revealed in final letter
  8. **Payment Method** (required) - Radio buttons: Card, PayPal, or Bank Transfer
  9. **How did you find us?** (required) - Dropdown with options
  10. **Special Requests/Notes** (optional) - Text area for special requirements
  11. **Emergency Contact** (optional) - Name and phone number

### Payment Integration
- **Current Status**: Collects payment method preference only
- **Payment Options**: Card, PayPal, Bank Transfer
- **Future Integration**: 
  - Payment link sent via email after booking confirmation
  - Can integrate Stripe Payment Links (free setup, fees only on transactions)
  - Or integrate PayPal Checkout
  - Or handle bank transfer manually

### Booking Data Flow
1. Customer fills booking form
2. Data saved to Firebase `bookings` collection with status: 'pending'
3. Success message shown with confirmation email
4. **Next Steps** (to be implemented):
   - Send confirmation email to customer
   - Send notification to admin
   - Link booking to game session when game starts
   - Fetch personal message from booking when showing final letter

### Linking Booking to Game
- When game starts, match booking by email or booking ID
- Store booking reference in game session
- When final letter is shown, fetch personal message from booking record

### Booking Management (Admin Dashboard)
- **Upcoming Bookings**: Shows bookings with future date/time and status not 'completed' or 'cancelled'
- **Completed Bookings**: Shows past bookings or bookings with 'completed'/'cancelled' status
- **Edit Functionality**: 
  - Edit name, email, phone, date, time, and status for upcoming bookings
  - Updates saved to Firebase with `updatedAt` timestamp
  - Modal-based editing interface
- **Booking Statuses**: pending, confirmed, completed, cancelled

## Recent Changes (January 2025)

### Booking System Implementation
- ✅ Created `booking.html` - Full booking page with all required fields
- ✅ Added safety disclaimer to booking page
- ✅ Integrated bookings into admin dashboard
- ✅ Bookings divided into "Upcoming" and "Completed" based on date/time
- ✅ Edit functionality for upcoming bookings (name, email, phone, date, time, status)
- ✅ Booking statistics (total, upcoming, completed, pending)
- ✅ CSV export for bookings
- ✅ Booking status badges (pending, confirmed, completed, cancelled)
- ✅ **Time Slot Management**: 
  - 15-minute intervals only (09:00-19:00 UK time)
  - Automatic slot availability checking
  - Only one booking per time slot
  - Taken slots hidden from selection
- ✅ **Status Explanations**: Added tooltips and descriptions for booking statuses
- ✅ **UI Improvements**: Fixed booking confirmation text color for better readability

### Safety & Legal
- ✅ Added safety disclaimer to booking page
- ✅ Disclaimer states: Game designed for safe environment, play responsibly, not responsible for accidents/injuries/losses

### Admin Dashboard Enhancements
- ✅ Bookings section added with upcoming/completed division
- ✅ Edit modal for booking details
- ✅ Status management (pending, confirmed, completed, cancelled)
- ✅ Booking statistics cards

---

**Last Updated**: January 2025
**Project Status**: Fully functional, production-ready
**Next Steps**: 
- Email confirmation system for bookings
- Payment processing integration (Stripe/PayPal)
- Link booking personal message to game final letter (match by email when game starts)
