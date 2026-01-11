# Resource Licenses and Sources

This document lists all external resources used in the game and their licenses.

## Images

All images are sourced from **Unsplash** (https://unsplash.com)

### License Information
- **License**: Unsplash License (https://unsplash.com/license)
- **Usage Rights**: 
  - ✅ Free for commercial and personal use
  - ✅ No attribution required (but appreciated)
  - ✅ Can modify and use freely
  - ✅ Can use for any purpose

### Images Used:
1. **Time Machine Icon** (Welcome & Final Screen)
   - URL: `https://images.unsplash.com/photo-1518709268805-4e9042af2176`
   - Used in: Welcome screen, Final screen

2. **Starting Location Image**
   - URL: `https://images.unsplash.com/photo-1519682337058-a94d519337bc`
   - Used in: Starting point screen

3. **Map Image** (Hint Modal)
   - URL: `https://images.unsplash.com/photo-1524661135-423995f22d0b`
   - Used in: Map hint modal

## Audio/Music

### Current Status: No Audio Source
- **Status**: ⚠️ **NO MUSIC CONFIGURED** - Add your own music from Pixabay Music
- **Reason**: Removed placeholder to avoid potential attribution requirements

### Recommended Free Music Source (NO ATTRIBUTION REQUIRED):

1. **Pixabay Music** ⭐ RECOMMENDED
   - URL: https://pixabay.com/music/
   - License: **Free for commercial use, NO attribution required**
   - Best for: Background music, ambient sounds
   - How to use:
     1. Visit https://pixabay.com/music/
     2. Search for "adventure", "mystery", or "treasure hunt"
     3. Download or get direct URL
     4. Add to `index.html` audio source

2. **Freesound**
   - URL: https://freesound.org/
   - License: Varies by uploader (check individual licenses)
   - Best for: Sound effects, ambient sounds

3. **Incompetech** (Kevin MacLeod)
   - URL: https://incompetech.com/music/
   - License: Free with attribution required
   - Best for: Background music (requires credit)

4. **FreePD**
   - URL: https://freepd.com/
   - License: Public Domain
   - Best for: Background music

## How to Replace Music

1. Choose a music file from one of the recommended sources above
2. Download the file or get the direct URL
3. Update `index.html` line 17:
   ```html
   <source src="YOUR_MUSIC_URL_HERE" type="audio/mpeg">
   ```
4. Or use a local file:
   ```html
   <source src="music/your-music-file.mp3" type="audio/mpeg">
   ```

## Verification Checklist

- [x] All images are from Unsplash (free license)
- [ ] Music source verified and replaced (currently placeholder)
- [x] All resources documented with sources
- [x] License information included

## Notes

- **Images**: All current images are properly licensed from Unsplash
- **Music**: Currently using SoundHelix placeholder - **MUST BE REPLACED** before production
- All resources are free to use for commercial purposes
- No attribution required for Unsplash images (but appreciated)
