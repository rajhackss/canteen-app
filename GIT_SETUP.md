# Git Installation Guide for Windows

## Install Git

1. **Download Git**: https://git-scm.com/download/win
2. **Run installer** with default settings
3. **Restart Command Prompt** after installation

## Verify Installation
```bash
git --version
```

## Basic Git Commands
```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## GitHub Setup

1. **Create GitHub account**: https://github.com/signup
2. **Create new repository**:
   - Click "+" → "New repository"
   - Name: `canteen`
   - Make it Public
   - Click "Create repository"

3. **Push your code**:
```bash
cd "C:\Users\Shambhuraje Thorat\Desktop\Projects\canteen"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/canteen.git
git push -u origin main
```

## Quick Deployment Steps After Git Setup

1. **Push code to GitHub** (commands above)
2. **Go to Render.com** → New Web Service
3. **Connect GitHub repository**
4. **Add environment variables**:
   - PORT=5000
   - MONGODB_URI=mongodb+srv://shambhorajet1_db_user:SWEYgAScvJ64NKCv@cluster0.1r502qs.mongodb.net/canteen-app?retryWrites=true&w=majority
   - JWT_SECRET=canteen_secret_key_2024_secure
   - NODE_ENV=production
5. **Deploy** (takes 5-10 minutes)