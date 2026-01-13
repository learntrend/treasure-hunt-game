# Feedback Form Setup Guide

This guide will help you create a free feedback form using Google Forms and integrate it into your treasure hunt game.

## Why Google Forms?

- ✅ **100% Free** - No cost, no limits
- ✅ **Trusted** - Google's reliable service
- ✅ **Easy to use** - Simple setup, no coding required
- ✅ **Automatic data collection** - Responses saved to Google Sheets
- ✅ **Mobile-friendly** - Works perfectly on all devices
- ✅ **Analytics** - Built-in charts and summaries

## Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com/)
2. Click **"Blank"** to create a new form
3. Name your form: **"Lost Letter from 1800 - Game Feedback"**

## Step 2: Add Questions

Add the following questions in order:

### Question 1: Overall Rating
- **Type**: Multiple choice (or Linear scale 1-5)
- **Question**: "How would you rate your overall experience?"
- **Options**: 
  - ⭐⭐⭐⭐⭐ Excellent
  - ⭐⭐⭐⭐ Very Good
  - ⭐⭐⭐ Good
  - ⭐⭐ Fair
  - ⭐ Poor
- **Required**: Yes

### Question 2: Player Type
- **Type**: Multiple choice
- **Question**: "How did you play?"
- **Options**: 
  - Solo Explorer
  - Group Adventure
- **Required**: Yes

### Question 3: What did you enjoy most?
- **Type**: Checkboxes (multiple selection)
- **Question**: "What did you enjoy most about the game? (Select all that apply)"
- **Options**:
  - The storyline and theme
  - Finding clues at physical locations
  - Solving puzzles and questions
  - Learning about historical locations (titbits)
  - The final letter reveal
  - The scoring system
  - The hint system
  - Other (please specify in comments)
- **Required**: Yes

### Question 4: Difficulty Level
- **Type**: Multiple choice
- **Question**: "How would you rate the difficulty level?"
- **Options**:
  - Too Easy
  - Just Right
  - Too Difficult
- **Required**: Yes

### Question 5: Would you recommend?
- **Type**: Multiple choice
- **Question**: "Would you recommend this game to others?"
- **Options**:
  - Definitely Yes
  - Probably Yes
  - Maybe
  - Probably No
  - Definitely No
- **Required**: Yes

### Question 6: What could be improved?
- **Type**: Short answer (or Paragraph)
- **Question**: "What could we improve to make the game better?"
- **Required**: No

### Question 7: Additional Comments
- **Type**: Paragraph
- **Question**: "Any other comments or suggestions?"
- **Required**: No

### Question 8: Contact (Optional)
- **Type**: Short answer
- **Question**: "Email (optional - only if you'd like us to follow up)"
- **Required**: No

## Step 3: Customize Your Form

1. Click the **palette icon** (🎨) to customize colors
2. Choose a theme that matches your game (e.g., dark/mysterious colors)
3. Add a header image if desired (optional)

## Step 4: Get Your Form Link

1. Click the **"Send"** button (top right)
2. Click the **link icon** (🔗)
3. Copy the form link (it will look like: `https://forms.gle/XXXXXXXXXX`)
4. Click **"Copy"**

## Step 5: Update Your Game

1. Open `index.html` in your project
2. Find the feedback modal (around line 273)
3. Replace `YOUR_FEEDBACK_FORM_LINK` with your actual Google Form link

## Step 6: View Responses

1. Go back to your Google Form
2. Click the **"Responses"** tab
3. View responses in:
   - **Summary**: Charts and statistics
   - **Individual**: Each response
   - **Link to Google Sheets**: Export to spreadsheet

## Alternative: Embed Form in Modal (Optional)

If you want to embed the form directly in the modal instead of opening a new tab:

1. In Google Forms, click **"Send"** → **"Embed"** (</> icon)
2. Copy the iframe code
3. Update the feedback modal in `index.html` to include the iframe

**Note**: Embedded forms work well but may be less mobile-friendly than opening in a new tab.

## Recommended Questions Summary

✅ Overall rating (1-5 stars)  
✅ Player type (Solo/Group)  
✅ What they enjoyed most (multiple choice)  
✅ Difficulty level  
✅ Would recommend  
✅ What could be improved (text)  
✅ Additional comments (text)  
✅ Contact email (optional)

## Tips

- Keep questions short and clear
- Use multiple choice for quick responses
- Make only essential questions required
- Test your form before sharing
- Check responses regularly to improve the game

---

**Need help?** Google Forms has excellent documentation: https://support.google.com/docs/topic/9054603
