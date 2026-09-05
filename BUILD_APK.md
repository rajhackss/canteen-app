# Building APK for Smart Canteen App

## Prerequisites

1. **Expo Account**: Create a free account at https://expo.dev
2. **EAS CLI**: Already installed globally
3. **Android Device**: For testing the APK

## Step-by-Step Build Process

### 1. Login to Expo
```bash
cd mobile-app
eas login
```
This will open a browser window to authenticate your Expo account.

### 2. Configure Build
```bash
eas build:configure
```
This will set up your project with Expo servers.

### 3. Build APK (Preview Build)
```bash
eas build --platform android --profile preview
```

This will:
- Create an APK file (not signed for Play Store)
- Take about 10-15 minutes
- Provide a download link when complete
- Send you an email with the download link

### 4. Build APK (Production Build)
```bash
eas build --platform android --profile production
```

This will:
- Create a production-ready APK
- Take about 15-20 minutes
- Provide a download link when complete
- Be optimized for performance

## Alternative: Local Build (Requires Android Studio)

If you prefer to build locally:

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Set Up Android Environment
- Install Android Studio
- Install Android SDK (API level 33 or higher)
- Set up ANDROID_HOME environment variable

### 3. Build APK Locally
```bash
eas build --platform android --local --profile preview
```

## Important Notes

### API Configuration
The APK will need to connect to your backend server. Update the API URL in:

**File**: `mobile-app/src/services/api.js`

```javascript
// For production APK, use your actual server URL:
const API_URL = 'https://your-backend-server.com/api';

// For local testing with physical device on same network:
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

To find your computer's IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip a`

### Network Permissions
The app.json already includes necessary permissions:
- INTERNET
- ACCESS_NETWORK_STATE

### Backend Server
Make sure your backend server is:
- Accessible from the device (not just localhost)
- Running on the configured port
- Has CORS properly configured

## Testing the APK

1. **Download**: Use the link provided by EAS build
2. **Install**: Enable "Install from unknown sources" on Android
3. **Test**: 
   - Open the app
   - Try registration/login
   - Browse menu
   - Place a test order

## Troubleshooting

### Build Fails
- Check Expo account is properly authenticated
- Ensure app.json is properly configured
- Verify internet connection

### APK Won't Install
- Enable "Unknown sources" in Android settings
- Check Android version compatibility
- Ensure sufficient storage space

### Network Errors in App
- Verify backend server is accessible
- Check API_URL configuration
- Ensure device and server are on same network (for local testing)
- Check firewall settings

### Build Takes Too Long
- First builds are slower (caching dependencies)
- Subsequent builds are faster
- Use preview builds for faster iteration

## Production Deployment

For Play Store deployment:

1. **Create Production Build**:
```bash
eas build --platform android --profile production
```

2. **Generate Signing Key**:
```bash
eas credentials
```

3. **Submit to Play Store**:
```bash
eas submit --platform android
```

## Cost Information

- **EAS Build**: Free for development builds
- **Production builds**: Free tier available (limited builds per month)
- **Local builds**: Free (requires local Android setup)

## Support

For build issues:
- Expo documentation: https://docs.expo.dev/build/introduction/
- EAS Build documentation: https://docs.expo.dev/eas/
- Community forums: https://forums.expo.dev/