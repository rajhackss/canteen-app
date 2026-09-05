# GitHub Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `canteen`
3. Make it **Public** (Render free tier requires public repos)
4. **DO NOT** initialize with README (we have code already)
5. Click "Create repository"

## Step 2: Prepare Local Repository

### Using Git Bash (Recommended)
```bash
# Navigate to project
cd /c/Users/Shambhuraje\ Thorat/Desktop/Projects/canteen

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Smart Canteen App"

# Rename branch to main
git branch -M main

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/canteen.git

# Push to GitHub
git push -u origin main
```

### Using Command Prompt (if Git is in PATH)
```bash
cd "C:\Users\Shambhuraje Thorat\Desktop\Projects\canteen"
git init
git add .
git commit -m "Initial commit - Smart Canteen App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/canteen.git
git push -u origin main
```

## Step 3: Deploy to Render

### 1. Create Render Account
- Go to https://render.com/
- Sign up with GitHub (recommended)
- Authorize Render to access your repositories

### 2. Create Web Service
1. Go to Render Dashboard → https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Click "Connect GitHub"
4. Select your `canteen` repository
5. Configure deployment:

**Basic Settings:**
- **Name**: canteen-backend
- **Region**: Singapore (or closest to you)
- **Branch**: main
- **Root Directory**: backend
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Advanced Settings:**
- **Environment Variables** (Add these):
  ```
  PORT=5000
  MONGODB_URI=mongodb+srv://shambhorajet1_db_user:SWEYgAScvJ64NKCv@cluster0.1r502qs.mongodb.net/canteen-app?retryWrites=true&w=majority
  JWT_SECRET=canteen_secret_key_2024_secure
  NODE_ENV=production
  ```

6. Click "Create Web Service"

### 3. Wait for Deployment
- Takes 5-10 minutes
- Watch the logs in Render dashboard
- You'll get a URL like: `https://canteen-backend.onrender.com`

## Step 4: Update Mobile App

After deployment, update the API URL in your mobile app:

**File**: `mobile-app/src/services/api.js`
```javascript
const API_URL = 'https://canteen-backend.onrender.com/api';
```

## Step 5: Test Deployment

1. **Test Backend**: Open `https://canteen-backend.onrender.com/admin`
2. **Test Admin Panel**: Login with admin@canteen.com / admin123
3. **Test Mobile App**: Run with Expo Go and test full flow

## Troubleshooting

### Git Commands Not Working
- Use Git Bash instead of Command Prompt
- Or add Git to Windows PATH

### GitHub Push Fails
- Check your GitHub credentials
- Verify repository URL is correct
- Make sure repository is Public (Render requirement)

### Render Deployment Fails
- Check Render logs for specific errors
- Verify environment variables are set correctly
- Ensure Procfile exists in backend folder

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
- Ensure database user has correct permissions

## Quick Reference

**Your GitHub Repo**: https://github.com/YOUR_USERNAME/canteen
**Render Dashboard**: https://dashboard.render.com/
**Backend URL**: https://canteen-backend.onrender.com
**Admin Panel**: https://canteen-backend.onrender.com/admin