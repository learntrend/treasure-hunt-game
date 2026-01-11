# Git Workflow Guide

## ⚠️ Important: Automatic Pushes are NOT Recommended

**Why?** Automatic pushes can:
- Push broken code to your repository
- Commit temporary or incomplete files
- Make it hard to review changes before they go live
- Create a messy commit history

## ✅ Recommended Workflow

### Option 1: Easy Manual Commit & Push (Recommended)

Use the helper script I created:

```bash
./commit-and-push.sh "Description of your changes"
```

**Example:**
```bash
./commit-and-push.sh "Added new animations and fixed hint buttons"
```

This will:
1. Add all changes
2. Commit with your message
3. Push to GitHub

### Option 2: Standard Git Commands

```bash
# Add all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push
```

### Option 3: Auto-Commit Watcher (Advanced - Use with Caution)

If you want automatic commits (but still manual push):

1. **First, install fswatch (macOS):**
   ```bash
   brew install fswatch
   ```

2. **Run the watcher:**
   ```bash
   ./auto-commit-watcher.sh
   ```

3. **This will:**
   - Watch for file changes
   - Automatically commit them with timestamp
   - **You still need to manually push:** `git push`

4. **Stop the watcher:** Press `Ctrl+C`

⚠️ **Warning:** The auto-commit watcher commits everything automatically. Make sure you review before pushing!

## 📋 Best Practices

### 1. Review Before Committing
Always check what you're committing:
```bash
git status
git diff
```

### 2. Meaningful Commit Messages
Use clear, descriptive messages:
- ✅ Good: "Fixed timer display and added music toggle button"
- ❌ Bad: "updates" or "fix"

### 3. Commit Often, Push When Ready
- Commit small, logical chunks of work
- Push when a feature is complete and tested

### 4. Test Before Pushing
- Test your changes locally first
- Make sure the game works before pushing

## 🔄 Typical Workflow

1. **Make changes** to your files
2. **Test locally** using `./start-server.sh`
3. **Review changes:**
   ```bash
   git status
   git diff
   ```
4. **Commit and push:**
   ```bash
   ./commit-and-push.sh "Description of changes"
   ```
   OR manually:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

## 🚨 If You Really Want Automatic Pushes (NOT Recommended)

If you absolutely want automatic pushes (use with extreme caution), you could modify the auto-commit-watcher.sh to also push. However, this is **strongly discouraged** because:

1. You might push broken code
2. You can't review changes first
3. It creates a messy commit history
4. It's harder to fix mistakes

**If you still want it**, you would need to modify `auto-commit-watcher.sh` to add `git push` after commit. But I recommend against this.

## 🛠️ Useful Git Commands

```bash
# Check status
git status

# See what changed
git diff

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Pull latest changes
git pull

# Check remote repository
git remote -v
```

## 📝 Current Setup

Your repository is already configured with:
- ✅ Helper script: `commit-and-push.sh` - Easy commit and push
- ✅ Auto-commit watcher: `auto-commit-watcher.sh` - Auto-commit (manual push)
- ✅ `.gitignore` - Excludes unnecessary files

## 💡 Recommended Approach

**Use the helper script** (`./commit-and-push.sh`) for a balance of convenience and safety. It's:
- Fast and easy to use
- Still requires you to write a commit message (so you review what you're committing)
- One command to commit and push
- Safe and controllable

Happy coding! 🎉
