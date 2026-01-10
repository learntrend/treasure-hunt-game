# How to Run the Treasure Hunt Game Locally

## Quick Start (Easiest Method)

### Option 1: Direct File Opening
1. Open Finder and navigate to the project folder
2. Double-click on `index.html`
3. The game will open in your default web browser

**Note:** Some features (like fetching data from APIs) might not work when opening files directly. Use Option 2 for full functionality.

### Option 2: Local Server (Recommended)

#### Using the Script (Easiest)
1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd /Users/meghana/treasure-hunt-game
   ```
3. Run the start script:
   ```bash
   ./start-server.sh
   ```
4. Open your browser and go to: `http://localhost:8000`
5. Press `Ctrl+C` in Terminal to stop the server when done

#### Using Python Manually
1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd /Users/meghana/treasure-hunt-game
   ```
3. Start the server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and visit: `http://localhost:8000`
5. Press `Ctrl+C` to stop the server

#### Using Node.js (if you have it installed)
1. Install http-server globally:
   ```bash
   npm install -g http-server
   ```
2. Navigate to project folder:
   ```bash
   cd /Users/meghana/treasure-hunt-game
   ```
3. Start the server:
   ```bash
   http-server -p 8000
   ```
4. Open browser: `http://localhost:8000`

#### Using VS Code (if you use VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The game will open automatically in your browser

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, use a different port:
```bash
python3 -m http.server 8080
```
Then access at: `http://localhost:8080`

### Images or Resources Not Loading
- Make sure you're using a local server (Option 2), not opening the file directly
- Check browser console for any errors (Press F12 or Cmd+Option+I)

### Music Not Playing
- Browser autoplay policies may prevent music from starting automatically
- Click the music button (🎵) in the game header to enable music
- User interaction is required for audio playback in most browsers

## File Structure
```
treasure-hunt-game/
├── index.html          (Main HTML file - open this!)
├── styles.css          (Styling)
├── app.js             (Main JavaScript logic)
├── game-engine.js     (Game engine)
├── game-data.js       (Game data - locations, clues, etc.)
├── start-server.sh    (Server startup script)
└── README.md          (Project documentation)
```

## Next Steps After Testing Locally
Once you're happy with the game locally, you can:
1. Deploy to GitHub Pages (free hosting)
2. Deploy to Netlify or Vercel (free hosting)
3. Use any web hosting service

Happy hunting! 🎯
