#!/bin/bash

# Script to push to GitHub repository

if [ -z "$1" ]; then
    echo "❌ Error: Please provide the GitHub repository URL"
    echo "Usage: ./push-to-github.sh <repository-url>"
    echo "Example: ./push-to-github.sh https://github.com/yourusername/treasure-hunt-game.git"
    exit 1
fi

REPO_URL=$1

echo "🔗 Adding remote repository..."
git remote add origin $REPO_URL 2>/dev/null || git remote set-url origin $REPO_URL

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository at: $REPO_URL"
else
    echo "❌ Error pushing to GitHub. Please check:"
    echo "   - Repository URL is correct"
    echo "   - You have access to the repository"
    echo "   - Your git credentials are configured"
fi
