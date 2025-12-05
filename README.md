# Hacker News Mobile App - React Native Challenge

A feature-rich React Native mobile application for browsing Hacker News articles with offline support, favorites management, and smart push notifications.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Features Guide](#features-guide)
- [Technologies Used](#technologies-used)

## ✨ Features

### Core Features
- **Article Browsing**: Infinite scroll list of Hacker News articles
- **Offline Support**: View previously loaded articles without internet
- **Article Reader**: In-app WebView for reading articles
- **Pull to Refresh**: Update article list with latest content

### Article Management
- **Swipe to Delete**: Remove articles from your feed
- **Favorites**: Save articles for later reading
- **Deleted History**: View and restore deleted articles
- **Persistent State**: All interactions saved across app restarts

### Smart Notifications
- **Push Notifications**: Get notified about new articles
- **Custom Filters**: Platform (Android/iOS), Technology Categories
- **Keyword Matching**: Create custom keywords with AND/OR logic
- **Score Threshold**: Filter by minimum article points
- **Domain Whitelist**: Only notify for specific domains
- **Quiet Hours**: Suppress notifications during specific times
- **Background Fetch**: Automatic article updates

## 📦 Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**
- **Expo CLI**: Installed globally (`npm install -g expo-cli`)
- **iOS Simulator** (Mac only) or **Android Emulator**
- **Physical Device** (optional, for push notifications)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 📱 Running the App

### Using Expo Go (Quick Start)
```bash
npm start
```
Then scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

> **Note**: Push notifications have limited functionality in Expo Go. For full testing, use a development build.

### Using iOS Simulator (Mac only)
```bash
npm run ios
```

### Using Android Emulator
```bash
npm run android
```

### Building for Production Testing

For full push notification testing, create a development build:

```bash
# Install expo-dev-client (if not already installed)
npx expo install expo-dev-client

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Test Suites Included
- **Unit Tests**: 167 passing tests
  - Settings Store (23 tests)
  - Notification Utilities (48 tests)
  - useNotifications Hook (15 tests)
  - Settings Screen (27 tests)
  - Article Store (23 tests)
  - Storage Utilities (9 tests)
  - Component Tests (22 tests)

## 📁 Project Structure

```
mobile-challenge/
├── app/                          # Expo Router pages
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── index.tsx           # Home/Feed screen
│   │   ├── favorites.tsx       # Favorites screen
│   │   ├── deleted.tsx         # Deleted articles screen
│   │   ├── settings.tsx        # Notification settings
│   │   └── __tests__/          # Screen tests
│   ├── article-webview.tsx    # Article reader
│   └── _layout.tsx             # Root layout
├── components/                   # Reusable components
│   ├── ArticleItem/            # Article card components
│   └── ArticleList/            # Article list with infinite scroll
├── hooks/                        # Custom React hooks
│   ├── useNotifications.ts     # Notification management
│   └── use-color-scheme.ts     # Theme management
├── stores/                       # Zustand state management
│   ├── articleStore.ts         # Article state (favorites/deleted)
│   └── settingsStore.ts        # Notification settings state
├── utils/                        # Utility functions
│   ├── notifications.ts        # Notification filtering logic
│   └── storage.ts              # AsyncStorage helpers
├── types/                        # TypeScript type definitions
│   ├── article.ts
│   └── notifications.ts
└── api/                          # API integration
    └── hnApi.ts                 # Hacker News API client
```

## 🎯 Features Guide

### 1. Browse Articles
- Launch the app to see the latest Hacker News articles
- Scroll down for infinite loading
- Pull down to refresh
- Tap an article to read it in the in-app browser

### 2. Manage Favorites
- **Add to Favorites**: Tap the star icon on any article
- **View Favorites**: Navigate to the "Favorites" tab
- **Remove from Favorites**: Tap the star again to unfavorite

### 3. Delete & Restore Articles
- **Delete**: Swipe left on any article and tap "Delete"
- **View Deleted**: Navigate to the "Deleted" tab
- **Restore**: Tap "Restore" on any deleted article

### 4. Configure Notifications

Navigate to the **Settings** tab to configure:

#### Platform Filters
Filter notifications by platform mentions (Android/iOS)

#### Technology Categories
Select categories to follow:
- Web, Mobile, Backend, Frontend
- DevOps, AI/ML, Security, Database

#### Custom Keywords
- Add your own keywords (e.g., "rust", "typescript")
- Choose match mode: ANY (OR logic) or ALL (AND logic)

#### Minimum Score
Set a minimum point threshold (0 = disabled)

#### Domain Whitelist
Only get notifications from specific domains (empty = all)

#### Quiet Hours
Suppress notifications during specific hours (e.g., 22:00 to 08:00)

#### Test Notifications
Use the "Send Test Notification" button to verify your setup

### 5. Test Push Notifications

1. Grant notification permissions when prompted
2. Configure your filters in Settings
3. Wait for background fetch or test immediately
4. Tap a notification to open the article

## 🛠 Technologies Used

### Core
- **React Native** (0.81.5) - Mobile framework
- **Expo** (~54.0) - Development platform
- **TypeScript** (~5.9.2) - Type safety

### State Management
- **Zustand** (^5.0.9) - Lightweight state management
- **React Query** (^5.90.12) - Server state management
- **AsyncStorage** (^2.2.0) - Persistent storage

### Notifications
- **expo-notifications** (~0.32.14) - Push notifications
- **expo-device** (~8.0.10) - Device detection
- **expo-task-manager** (~14.0.9) - Background tasks

### Testing
- **Jest** (^29.7.0) - Test runner
- **React Native Testing Library** (^13.3.3) - Component testing

### UI/UX
- **React Navigation** (^7.1.8) - Navigation
- **Expo Router** (~6.0.17) - File-based routing
- **React Native Gesture Handler** (~2.28.0) - Gestures
- **React Native Reanimated** (~4.1.1) - Animations

### API
- **Axios** (^1.13.2) - HTTP client
- **Hacker News API** - Article source

## 📝 Notes

- **Expo Go Limitations**: Push notifications have limited functionality in Expo Go. For full testing, use a development build.
- **Physical Device**: Background fetch and push notifications require a physical device for complete testing.


