# Quick Setup Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/ (v14 or higher)

### 2. Install MongoDB (Choose one option)

**Option A: Local MongoDB Installation**
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow MongoDB installation guide for your distribution

**Option B: MongoDB Atlas (Cloud - Recommended for Windows)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string
6. Update MONGODB_URI in .env file with your Atlas connection string

### 3. Install Expo CLI
```bash
npm install -g expo-cli
```

## Project Setup (5 minutes)

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/canteen-app
JWT_SECRET=canteen_secret_key_2024_secure
NODE_ENV=development" > .env

# Start MongoDB (in separate terminal)
mongod

# Seed database with sample data
npm run seed

# Start backend server
npm start
```

Backend will run on http://localhost:5000

### Step 2: Mobile App Setup (2 minutes)

```bash
# Navigate to mobile app directory (new terminal)
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Step 3: Test the Application (1 minute)

#### Test Admin Panel
1. Open browser: http://localhost:5000/admin
2. Login with: admin@canteen.com / admin123
3. Explore dashboard, menu, and orders

#### Test Mobile App
1. Download Expo Go app on your phone
2. Scan QR code from terminal
3. Register new user or use app
4. Browse menu and place test order

## Common Issues & Solutions

### MongoDB Connection Error
**Problem**: `MongoDB connection error`
**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on localhost:27017

### Port Already in Use
**Problem**: `Port 5000 is already in use`
**Solution**: 
- Change PORT in .env file to 5001
- Or kill process using port 5000: `npx kill-port 5000`

### Mobile App Network Error
**Problem**: `Network request failed`
**Solution**:
- Ensure backend server is running
- Check API_URL in mobile-app/src/services/api.js
- For physical device testing, use your computer's IP instead of localhost

### Expo Metro Bundler Issues
**Problem**: Metro bundler not starting
**Solution**:
```bash
npx expo start -c
```

## Next Steps

1. **Customize Menu**: Add your actual canteen menu items via admin panel
2. **Test Full Flow**: Place complete orders from mobile app
3. **Configure Production**: Update environment variables for production
4. **Deploy**: Follow deployment guide in main README

## Need Help?

- Check main README.md for detailed documentation
- Review API endpoints and data models
- Examine screen components for customization options