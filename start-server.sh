#!/bin/bash

# Simple local server for Treasure Hunt Game
# This script starts a local web server so you can view the game in your browser

echo "🚀 Starting local server for Treasure Hunt Game..."
echo ""
echo "📍 The game will be available at:"
echo "   http://localhost:8000"
echo ""
echo "📝 Press Ctrl+C to stop the server when you're done"
echo ""

# Try Python 3 first, then Python 2, then use built-in macOS server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "Python not found. Using PHP server instead..."
    php -S localhost:8000
fi
