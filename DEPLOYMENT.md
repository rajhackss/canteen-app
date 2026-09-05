# Free Backend Deployment Guide

## Option 1: Render (Recommended)

Render offers a free tier for web services with:
- Free SSL certificates
- Automatic deploys from GitHub
- 512MB RAM
- Shared CPU
- Sleeps after 15 minutes of inactivity (spins up in ~30 seconds)

### Step 1: Create Render Account

1. Go to https://render.com/
2. Sign up (GitHub, Google, or email)
3. Verify your email

### Step 2: Prepare Your Code

#### Create `.gitignore` (if not exists)
```bash
node_modules/
.env
.DS_Store
```

#### Create `Procfile` in backend directory
```bash
web: node server.js
```

#### Update `package.json` scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 3: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git in your project:
```bash
cd C:\Users\Shambhuraje Thorat\Desktop\Projects\canteen
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/canteen.git
git push -u origin main
```

### Step 4: Deploy on Render

1. Go to Render Dashboard → https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: canteen-backend
   - **Region**: Singapore (or closest to you)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables** (Add these):
   - `PORT`: 5000
   - `MONGODB_URI`: `mongodb+srv://shambhorajet1_db_user:SWEYgAScvJ64NKCv@cluster0.1r502qs.mongodb.net/canteen-app?retryWrites=true&w=majority`
   - `JWT_SECRET`: `canteen_secret_key_2024_secure`
   - `NODE_ENV`: `production`
6. Click "Create Web Service"

### Step 5: Get Your URL

After deployment (~5-10 minutes), Render will provide:
- Your app URL: `https://canteen-backend.onrender.com`
- SSL enabled automatically

## Option 2: Railway

Railway also offers a free tier:
- $5 free credit monthly
- Auto-suspension after inactivity
- Easy GitHub integration

### Steps:

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

## Option 3: Glitch

Glitch is completely free and great for simple apps:
- Always online
- Easy to use
- 2000 hours/month free

### Steps:

1. Go to https://glitch.com/
2. Sign up
3. Create new project
4. Import your code
5. Add .env file with variables
6. Your app will be live immediately

## Post-Deployment Steps

### 1. Update Mobile App API URL

After deployment, update in `mobile-app/src/services/api.js`:

```javascript
const API_URL = 'https://your-render-url.onrender.com/api';
```

### 2. Test the Deployment

1. Check if backend is accessible
2. Test admin panel at `https://your-render-url.onrender.com/admin`
3. Test API endpoints
4. Update mobile app and test

### 3. MongoDB Atlas Network Access

Make sure your MongoDB Atlas allows access from anywhere:

1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs)
3. Or add Render's IP ranges if you want to be more specific

## Environment Variables Reference

```
PORT=5000
MONGODB_URI=mongodb+srv://shambhorajet1_db_user:SWEYgAScvJ64NKCv@cluster0.1r502qs.mongodb.net/canteen-app?retryWrites=true&w=majority
JWT_SECRET=canteen_secret_key_2024_secure
NODE_ENV=production
```

## Troubleshooting

### Build Fails
- Check package.json has correct start script
- Verify all dependencies are in package.json
- Check Render logs for specific errors

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas Network Access settings
- Ensure database user has correct permissions

### App Sleeps
- Render free tier sleeps after inactivity
- First request may take 30 seconds to wake up
- This is normal for free tier

### Mobile App Can't Connect
- Update API_URL to deployed URL
- Check if backend is accessible via browser
- Verify CORS settings allow mobile app origin

## Recommendations

**For Production**: Consider upgrading to paid tier for:
- No sleep times
- Better performance
- More resources
- Custom domains

**For Testing**: Free tiers are perfect for:
- Development
- Testing
- Personal projects
- Small-scale applications