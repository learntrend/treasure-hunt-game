#!/bin/bash

# Setup script for initializing git repository and pushing to GitHub

echo "🚀 Setting up git repository..."

# Initialize git repository
git init

# Add all files
git add .

# Configure git user (update these with your actual name and email)
git config user.name "Meghana"
git config user.email "meghana@example.com"

# Create initial commit
git commit -m "Initial commit: Lost Letter from 1800 treasure hunt game

Features:
- Tutorial screen with comprehensive game instructions
- 10-location treasure hunt gameplay
- Location name validation and text-based answers
- Scoring system with hints
- Timer system with pause functionality
- Pinned locations panel for progress tracking
- Mobile-first responsive design"

echo "✅ Git repository initialized and files committed!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Copy the repository URL (e.g., https://github.com/yourusername/treasure-hunt-game.git)"
echo "3. Run the following commands:"
echo ""
echo "   git remote add origin https://github.com/yourusername/treasure-hunt-game.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or run: ./push-to-github.sh <your-repo-url>"
