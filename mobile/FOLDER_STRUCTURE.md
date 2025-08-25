# Mobile App Folder Structure

This document explains the purpose and organization of each folder in the GymPlify mobile application.

## 📁 Root Level Files

### Configuration Files

- **`package.json`** - Node.js dependencies and scripts for the mobile app
- **`app.json`** - Expo configuration (app name, version, permissions, etc.)
- **`eas.json`** - Expo Application Services configuration for builds
- **`babel.config.js`** - Babel transpiler configuration for React Native
- **`tsconfig.json`** - TypeScript configuration (though currently using JSX)
- **`jest.config.js`** - Jest testing framework configuration
- **`expo-env.js`** - Expo environment variables configuration

### Documentation

- **`README.md`** - Project overview and setup instructions
- **`ARCHITECTURE.md`** - Detailed architecture documentation
- **`DASHBOARD_FEATURES.md`** - Dashboard functionality specifications
- **`TODO.md`** - Development tasks and roadmap

### Build & Dependencies

- **`yarn.lock`** - Yarn dependency lock file
- **`package-lock.json`** - NPM dependency lock file
- **`.gitignore`** - Git ignore patterns for mobile-specific files

## 📱 App Directory (`/app`)

### Core App Files

- **`_layout.jsx`** - Root layout component for the entire app
- **`+not-found.jsx`** - 404 error page component

### Main Features

- **`my-qr-code.jsx`** - QR code generation and display screen
- **`profile.jsx`** - User profile management screen
- **`notifications.jsx`** - Push notifications and alerts screen
- **`create-session.jsx`** - Session creation and scheduling screen

### Subdirectories

- **`(tabs)/`** - Tab-based navigation screens
  - `_layout.jsx` - Tab navigation layout
  - `index.jsx` - Home/Dashboard tab
  - `explore.jsx` - Explore/Discover tab
  - `sessions.jsx` - Sessions management tab
- **`auth/`** - Authentication-related screens
  - `index.jsx` - Login/Registration screen

## 🏗️ Source Code (`/src`)

### Components (`/components`)

- **`dashboard/`** - Dashboard-specific UI components
  - `AttendanceSummary.jsx` - Attendance statistics display
  - `MembershipOverview.jsx` - Membership status and details
  - `UpcomingSessions.jsx` - Future session listings
  - `WorkoutTip.jsx` - Daily workout tips and advice
- **`schedule/`** - Scheduling and calendar components
  - `Calendar.jsx` - Calendar interface for sessions
  - `TimePickerModal.jsx` - Time selection modal
  - `ConfirmationModal.jsx` - Session booking confirmation
- **`sessions/`** - Session-related components
  - `SessionCard.jsx` - Individual session display card
- **`shared/`** - Reusable UI components
  - `ThemedText.jsx` - Consistent text styling
  - `ThemedView.jsx` - Consistent view containers
  - `FloatingActionButton.jsx` - FAB component
  - `Collapsible.jsx` - Expandable/collapsible content
  - `ThemeToggle.jsx` - Dark/light mode switcher

### Hooks (`/hooks`)

- **`dashboard/`** - Dashboard-specific custom hooks
  - `useDashboard.js` - Main dashboard data management
  - `useAttendance.js` - Attendance data handling
  - `useMembership.js` - Membership data management
  - `useUpcomingSessions.js` - Future sessions data
  - `useWorkoutTip.js` - Workout tips data
- **`schedule/`** - Scheduling-related hooks
  - `useSchedule.js` - Session scheduling logic
- **`sessions/`** - Session management hooks
  - `useSessions.js` - Session data and operations
- **`notifications/`** - Notification handling hooks
  - `useNotifications.js` - Push notification management
- **`user/`** - User data hooks
  - `useUserData.js` - User profile and preferences
- **`ui/`** - UI-related hooks
  - `useTheme.js` - Theme management
  - `useColorScheme.js` - Color scheme detection

### Context (`/context`)

- **`AuthContext.jsx`** - Authentication state management
- **`AuthProvider.jsx`** - Authentication provider component
- **`ThemeContext.jsx`** - Theme state management
- **`ThemeContextInstance.js`** - Theme context instance

### Services (`/services`)

- **`authService.js`** - Authentication API calls and logic
- \*\*`dashboardService.js` - Dashboard data fetching
- \*\*`firebase.js` - Firebase configuration and setup

### Constants (`/constants`)

- **`Colors.js`** - App color palette definitions
- **`Fonts.js`** - Typography and font configurations

## 🎨 Assets (`/assets`)

### Visual Resources

- **`fonts/`** - Custom font files (Poppins family, SpaceMono)
- **`icons/`** - SVG and icon assets
- **`images/`** - App images, logos, and graphics

## 🤖 Android (`/android`)

### Native Android Configuration

- **`app/`** - Android app-specific code and resources
  - `build.gradle` - App-level build configuration
  - `src/main/` - Main Android source code
    - `AndroidManifest.xml` - App permissions and components
    - `MainActivity.kt` - Main Android activity
    - `MainApplication.kt` - Android application class
    - `res/` - Android resources (drawables, layouts, values)
- **`build.gradle`** - Project-level build configuration
- **`settings.gradle`** - Gradle project settings
- **`gradle.properties`** - Gradle build properties
- **`gradlew`** - Gradle wrapper script (Unix)
- **`gradlew.bat`** - Gradle wrapper script (Windows)

## 🧪 Testing (`/test`)

### Test Files

- **`App.test.jsx`** - Main app component tests
- **`firebase.js`** - Firebase testing configuration

## 🔧 Scripts (`/scripts`)

### Development Tools

- **`reset-project.js`** - Project reset and cleanup utility

## 📱 Expo Configuration

### Expo-specific Files

- **`.expo/`** - Expo development server cache and configuration
- **`expo-env.js`** - Expo environment variables

## 🚀 Key Benefits of This Structure

1. **Separation of Concerns** - Clear separation between UI components, business logic, and data management
2. **Reusability** - Shared components and hooks can be used across different screens
3. **Maintainability** - Organized code structure makes it easier to find and modify specific features
4. **Scalability** - Easy to add new features without affecting existing code
5. **Testing** - Dedicated test directory for comprehensive testing
6. **Platform Support** - Native Android configuration alongside React Native/Expo code

## 📋 Development Workflow

1. **Components** go in `/src/components/`
2. **Business Logic** goes in `/src/hooks/`
3. **API Calls** go in `/src/services/`
4. **State Management** goes in `/src/context/`
5. **New Screens** go in `/app/`
6. **Assets** go in `/assets/`
7. **Tests** go in `/test/`

This structure follows React Native and Expo best practices while maintaining a clean, organized codebase that's easy to navigate and maintain.
