# Lost Letter from 1800 - Treasure Hunt Game

A mobile-first web-based treasure hunt game where players follow clues through 10 locations to discover a personal message left in the past.

## Features

- **Time Machine Theme**: Immersive storyline about a lost letter from 1800
- **10 Location Journey**: Follow clues through 10 different locations
- **Timer System**: Tracks completion time (pauses during titbits)
- **Scoring System**: 
  - +100 points for each correct answer
  - -30 points for text hints
  - -50 points for map hints
- **Personal Message**: Custom message revealed at the end
- **Titbits**: Learn interesting facts about each location (timer pauses)
- **Hint System**: Text hints and map hints available
- **Mobile-First Design**: Optimized for mobile devices

## How to Play

1. **Setup**: Enter your name, choose solo or group play, and write a personal message
2. **Starting Point**: Navigate to the starting location and tap "I've Arrived"
3. **Follow Clues**: Read the clue and navigate to the location
4. **Answer Questions**: When you arrive, answer questions based on physical features at the location
5. **Use Hints**: If stuck, use text or map hints (with point penalties)
6. **Learn**: View titbits about each location (timer pauses)
7. **Complete**: Reach the 10th location to reveal your personal message

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `game-data.js` - Game data (locations, clues, questions, titbits)
- `game-engine.js` - Game logic (timer, scoring, state management)
- `app.js` - UI interactions and screen management

## Customization

### Updating Locations and Clues

Edit `game-data.js` to update:
- Starting location name and address
- Location names, descriptions, and clues
- Questions and answers
- Text hints and map hints
- Titbits for each location

### Styling

Modify `styles.css` to customize:
- Colors and themes
- Fonts and typography
- Layout and spacing
- Animations and effects

## Running the Game

Simply open `index.html` in a web browser. For best experience:
- Use a mobile device or mobile browser view
- Enable location services (for future geolocation features)
- Use HTTPS when hosting (required for geolocation API)

## Future Enhancements

- Phase 2: Add locations requiring London transport (tubes/buses)
- Geolocation verification to ensure players are at correct locations
- Integration with mapping services for better navigation
- Leaderboard system
- Multi-language support

## Notes

- All location data is currently placeholder content
- Replace placeholder text with actual locations and clues
- Questions should be answerable by observing physical features at locations
- Ensure all locations are within walking distance for Phase 1
