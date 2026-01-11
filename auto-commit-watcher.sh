#!/bin/bash

# WARNING: This script automatically commits changes when files are modified
# Use with caution! Review changes before pushing.
# 
# This watches for file changes and automatically commits them
# You still need to manually push: git push
#
# To stop: Press Ctrl+C

echo "👀 Watching for file changes..."
echo "📝 Auto-committing changes as they happen..."
echo "⚠️  Remember: You still need to manually push with 'git push'"
echo "🛑 Press Ctrl+C to stop watching"
echo ""

# Check if fswatch is installed (macOS)
if command -v fswatch &> /dev/null; then
    fswatch -o . | while read f; do
        # Exclude .git directory and this script itself
        if [[ "$f" != *".git"* ]] && [[ "$f" != *"auto-commit"* ]]; then
            echo "📝 Changes detected, committing..."
            git add .
            git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
            echo "✅ Auto-committed at $(date '+%H:%M:%S')"
            echo ""
        fi
    done
elif command -v inotifywait &> /dev/null; then
    # Linux alternative
    while inotifywait -r -e modify,create,delete . --exclude '\.git' 2>/dev/null; do
        echo "📝 Changes detected, committing..."
        git add .
        git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "✅ Auto-committed at $(date '+%H:%M:%S')"
        echo ""
    done
else
    echo "❌ Error: File watcher not found"
    echo "Install fswatch for macOS: brew install fswatch"
    echo "Or use inotify-tools for Linux: sudo apt-get install inotify-tools"
    exit 1
fi
