# Pierre-P Mobile App - Setup Guide

## 📱 React Native Mobile Application

This is a React Native mobile application for managing church attendance on iOS and Android devices.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** (recommended for development)
- For iOS development: **Xcode** (macOS only)
- For Android development: **Android Studio** and **Android SDK**

### Installation

#### 1. Install Node.js

Download from: https://nodejs.org/

#### 2. Install Expo CLI

```bash
npm install -g expo-cli
```

#### 3. Install Dependencies

```bash
cd mobile
npm install
# or
yarn install
```

#### 4. Start the Application

```bash
npm start
# or
expo start
```

This will show a menu with options to run on iOS, Android, or web.

### Running on Different Platforms

#### iOS (macOS only)

```bash
npm run ios
# or
expo start --ios
```

Requirements:
- Xcode installed
- iOS SDK 13.0 or higher

#### Android

```bash
npm run android
# or
expo start --android
```

Requirements:
- Android Studio installed
- Android SDK level 21 or higher

#### Web (Browser)

```bash
npm run web
# or
expo start --web
```

### Using Expo Go App (Easiest for Testing)

1. Download **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Run `npm start` or `expo start`
3. Scan the QR code with your phone camera or Expo Go app
4. App loads instantly on your device!

## 📋 Features

### Authentication
- Secure login with email and password
- Token-based session management
- Logout functionality

### Check-In Management
- Select events (services, meetings, classes)
- Register member attendance
- Record check-in times
- Add notes for special cases

### Attendance History
- View recent attendance records
- Search attendance by member or event
- Color-coded status indicators
- Attendance statistics

### Member Directory
- Browse all active members
- Search members by name
- View member details
- Contact information

### Settings
- User account information
- App version info
- Logout option

## 🔧 Configuration

### API Endpoint

Update the API URL in `App.js`:

```javascript
const API_URL = 'http://your-api-url.com/api';
```

### Build Configuration (app.json)

Create or update `app.json` with your app details:

```json
{
  "expo": {
    "name": "Pierre-P",
    "slug": "pierre-p",
    "version": "1.0.0",
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.pierreperreault.pierrepmobile"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 📲 Building for Production

### Build for iOS

```bash
exp build --platform ios
```

Requirements:
- Apple Developer Account
- Provisioning profiles configured

### Build for Android

```bash
exp build --platform android
```

Requirements:
- Google Play Developer Account
- Keystore file configured

## 🎨 UI/UX Features

- **Material Design** inspired interface
- **Green color scheme** (#2E7D32) for church theme
- **Icon library** using Material Community Icons
- **Responsive layout** for different screen sizes
- **Touch-friendly** buttons and inputs
- **Loading states** for better UX
- **Error handling** with alerts

## 📱 Screen Navigation

```
Login Screen
    ↓
Main App (Bottom Tab Navigation)
├── Check-In Screen (Record attendance)
├── History Screen (View past records)
├── Members Screen (Browse members)
└── Settings Screen (User preferences)
```

## 🧪 Testing

### Manual Testing

1. Test login with invalid credentials
2. Test check-in process with different events
3. Test member search functionality
4. Test attendance history filtering
5. Test logout functionality

### Run Tests (if available)

```bash
npm test
```

## 🐛 Troubleshooting

### App won't start

```bash
# Clear cache
expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Connection issues

- Ensure your phone and computer are on the same WiFi
- Check firewall settings
- Try using a different port: `expo start --tunnel`

### Build errors

```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Update packages
npm install expo@latest
```

### API connection errors

- Verify API_URL is correct in `App.js`
- Check backend server is running
- Test API endpoints with Postman
- Check network connectivity

## 📚 Project Structure

```
mobile/
├── App.js                 # Main app component
├── package.json          # Dependencies
├── app.json              # Expo configuration
├── SETUP.md              # Setup instructions
└── assets/               # Images, icons, fonts
    ├── adaptive-icon.png
    └── favicon.png
```

## 🔐 Security Considerations

1. **Never hardcode credentials** - Use environment variables
2. **Use HTTPS** for API communication
3. **Validate user input** - Check data before sending
4. **Secure token storage** - Use AsyncStorage securely
5. **Implement timeout** - Logout after inactivity
6. **Error handling** - Don't expose sensitive info in errors

## 📦 Dependencies Explained

| Package | Purpose |
|---------|----------|
| `react-native` | Core framework |
| `expo` | Development and build tools |
| `@react-navigation/*` | Screen navigation |
| `react-native-vector-icons` | Icon library |
| `axios` | HTTP requests |
| `date-fns` | Date manipulation |

## 📈 Future Enhancements

- [ ] Offline mode with local database
- [ ] Barcode/QR code scanning
- [ ] Push notifications for events
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Dark theme support
- [ ] Biometric authentication
- [ ] Export attendance reports
- [ ] Calendar view for events
- [ ] Member profile photos

## 🤝 Contributing

To contribute to the mobile app:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Expo documentation: https://docs.expo.dev
- Check React Native docs: https://reactnative.dev

## 📄 License

This project is provided as-is for parish use.

---

**Version:** 1.0.0  
**Last Updated:** July 2026  
**Author:** pierredperreault-design
