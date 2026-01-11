#!/bin/bash

# Helper script to easily commit and push changes to GitHub
# Usage: ./commit-and-push.sh "Your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit message"
    echo "Usage: ./commit-and-push.sh \"Your commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "🔄 Checking git status..."
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully!"
    echo ""
    echo "📤 Pushing to GitHub..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
    else
        echo "❌ Error pushing to GitHub. Please check your remote configuration."
        exit 1
    fi
else
    echo "❌ Error committing changes. Please check your git configuration."
    exit 1
fi
