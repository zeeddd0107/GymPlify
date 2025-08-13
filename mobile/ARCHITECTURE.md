# 🏗️ GymPlify Mobile Architecture

## 📁 **Folder Structure & Separation of Concerns**

### **Root Structure**
```
mobile/
├── app/                    # Expo Router screens & navigation
├── src/                    # Source code with clear separation
├── assets/                 # Static assets (fonts, images)
├── android/                # Android-specific configuration
└── package.json            # Dependencies & scripts
```

---

## 🎯 **Core Principles**

### **1. Separation of Concerns**
- **UI Components** → Pure presentation logic
- **Custom Hooks** → Business logic & state management
- **Services** → External API calls & data operations
- **Constants** → App-wide configuration values
- **Context** → Global state management

### **2. Single Responsibility**
- Each component handles one specific UI concern
- Each hook manages one specific business logic area
- Each service handles one specific external integration

### **3. Reusability**
- Components are modular and reusable
- Hooks can be shared across multiple screens
- Services are centralized and consistent

---

## 📱 **App Directory (`/app`)**

### **Purpose**: Screen-level components & navigation

```
app/
├── _layout.jsx                    # Root layout & navigation
├── (tabs)/                        # Tab-based navigation
│   ├── _layout.jsx               # Tab layout configuration
│   ├── index.jsx                 # Home/Dashboard screen
│   ├── explore.jsx               # Explore screen
│   └── sessions.jsx              # Sessions list screen
├── create-session.jsx             # Session creation screen
├── profile.jsx                    # User profile screen
├── my-qr-code.jsx                # QR code display screen
├── notifications.jsx              # Notifications screen
└── auth/                          # Authentication screens
    └── index.jsx                 # Login/Register screen
```

**✅ Benefits**:
- Clear screen organization
- Expo Router handles navigation
- Each screen is focused on one feature

---

## 🧩 **Components Directory (`/src/components`)**

### **Purpose**: Reusable UI components

### **Dashboard Components (`/dashboard`)**
```
dashboard/
├── AttendanceSummary.jsx          # Attendance statistics display
├── MembershipOverview.jsx         # Membership status & details
├── UpcomingSessions.jsx           # Next scheduled sessions
├── WorkoutTip.jsx                 # Daily workout tips
└── index.js                       # Exports all dashboard components
```

### **Schedule Components (`/schedule`)**
```
schedule/
├── Calendar.jsx                   # Date selection calendar
├── TimeSelector.jsx               # Time slot picker
├── WorkoutLegend.jsx              # Workout schedule legend
├── ScheduledSessions.jsx          # Confirmed sessions list
├── TimePickerModal.jsx            # Detailed time selection
├── ConfirmationModal.jsx          # Booking confirmation
├── ErrorModal.jsx                 # Error display
├── IntermediateConfirmationModal.jsx # Pre-booking confirmation
└── index.js                       # Exports all schedule components
```

### **Sessions Components (`/sessions`)**
```
sessions/
├── SessionCard.jsx                # Individual session display
└── index.js                       # Exports sessions components
```

### **Shared Components**
```
├── ThemedText.jsx                 # Theme-aware text component
├── ThemedView.jsx                 # Theme-aware view component
└── index.js                       # Exports all components
```

**✅ Benefits**:
- Modular, reusable components
- Clear component categorization
- Easy imports via index files
- Consistent styling patterns

---

## 🪝 **Hooks Directory (`/src/hooks`)**

### **Purpose**: Business logic & state management

### **Schedule Hooks (`/schedule`)**
```
schedule/
├── useSchedule.js                 # Complete scheduling logic
└── index.js                       # Exports schedule hooks
```

**Features**:
- Calendar management
- Date/time validation
- Session booking
- Firebase integration
- Modal state management

### **Dashboard Hooks (`/dashboard`)**
```
dashboard/
├── useDashboard.js                # Main dashboard data
├── useUpcomingSessions.js         # Upcoming sessions data
├── useMembership.js               # Membership information
├── useAttendance.js               # Attendance statistics
├── useWorkoutTip.js               # Workout tips
└── index.js                       # Exports dashboard hooks
```

### **User Hooks (`/user`)**
```
user/
├── useUserData.js                 # User profile & preferences
└── index.js                       # Exports user hooks
```

### **UI Hooks (`/ui`)**
```
ui/
├── useThemeColor.js               # Theme color utilities
├── useColorScheme.js              # System color scheme
└── index.js                       # Exports UI hooks
```

### **Notification Hooks (`/notifications`)**
```
notifications/
├── useNotifications.js            # Notification management
└── index.js                       # Exports notification hooks
```

### **Sessions Hooks (`/sessions`)**
```
sessions/
├── useSessions.js                 # Sessions data management
└── index.js                       # Exports sessions hooks
```

**✅ Benefits**:
- Business logic separated from UI
- Reusable across multiple components
- Easy testing and maintenance
- Clear data flow patterns

---

## 🔧 **Services Directory (`/src/services`)**

### **Purpose**: External integrations & data operations

```
services/
├── firebase.js                    # Firebase configuration
├── authService.js                 # Authentication operations
└── dashboardService.js            # Dashboard data fetching
```

**✅ Benefits**:
- Centralized external API calls
- Consistent error handling
- Easy to mock for testing
- Reusable across the app

---

## 🎨 **Constants Directory (`/src/constants`)**

### **Purpose**: App-wide configuration values

```
constants/
├── Colors.js                      # Theme color definitions
└── Fonts.js                       # Typography configurations
```

**✅ Benefits**:
- Consistent design system
- Easy theme changes
- Centralized configuration
- Type-safe constants

---

## 🌐 **Context Directory (`/src/context`)**

### **Purpose**: Global state management

```
context/
├── AuthContext.js                 # Authentication state
├── AuthProvider.jsx               # Auth context provider
├── ThemeContext.jsx               # Theme state management
├── useTheme.js                    # Theme hook
└── index.js                       # Context exports
```

**✅ Benefits**:
- Global state management
- Theme switching
- User authentication state
- Consistent data access

---

## 📊 **Data Flow Architecture**

### **1. Screen Level**
```
Screen → Custom Hook → Service → External API
```

### **2. Component Level**
```
Component → Props → State → Re-render
```

### **3. Hook Level**
```
Hook → State Management → Business Logic → Data Fetching
```

---

## 🔄 **Import/Export Pattern**

### **Centralized Imports**
```javascript
// ✅ Good: Import from centralized index
import { useSessions, SessionCard } from "@/src/hooks";
import { SessionCard } from "@/src/components";

// ❌ Bad: Direct file imports
import { useSessions } from "@/src/hooks/sessions/useSessions";
import { SessionCard } from "@/src/components/sessions/SessionCard";
```

### **Index Files**
```javascript
// /src/hooks/index.js
export * from './dashboard';
export * from './schedule';
export * from './sessions';
export * from './user';
export * from './ui';
export * from './notifications';

// /src/components/index.js
export * from './dashboard';
export * from './schedule';
export * from './sessions';
export { default as ThemedText } from './ThemedText';
export { default as ThemedView } from './ThemedView';
```

---

## 🧪 **Testing Strategy**

### **Component Testing**
- Test UI components in isolation
- Mock hook dependencies
- Test user interactions

### **Hook Testing**
- Test business logic separately
- Mock service dependencies
- Test state changes

### **Service Testing**
- Test API integrations
- Mock external dependencies
- Test error handling

---

## 🚀 **Benefits of This Architecture**

### **1. Maintainability**
- Clear file organization
- Easy to find specific functionality
- Consistent patterns across the app

### **2. Scalability**
- Easy to add new features
- Components can be reused
- Hooks can be shared

### **3. Testing**
- Logic separated from UI
- Easy to mock dependencies
- Clear testing boundaries

### **4. Team Development**
- Clear ownership of files
- Consistent coding patterns
- Easy onboarding for new developers

### **5. Performance**
- Components only re-render when needed
- Hooks optimize data fetching
- Efficient state management

---

## 📝 **Best Practices**

### **1. Component Guidelines**
- Keep components focused and small
- Use props for data passing
- Implement proper prop types
- Handle loading and error states

### **2. Hook Guidelines**
- One hook per business concern
- Use useCallback for expensive operations
- Implement proper error handling
- Return consistent data structures

### **3. Service Guidelines**
- Handle errors gracefully
- Implement retry logic
- Use consistent API patterns
- Cache data when appropriate

### **4. File Naming**
- Use PascalCase for components
- Use camelCase for hooks and services
- Use descriptive, clear names
- Follow consistent patterns

---

## 🔍 **Current Implementation Status**

### **✅ Implemented**
- Complete schedule functionality
- Dashboard components and hooks
- Sessions management
- Authentication system
- Theme management
- Firebase integration

### **🔄 In Progress**
- Component optimization
- Hook refactoring
- Error handling improvements

### **📋 Future Enhancements**
- Additional reusable components
- More specialized hooks
- Enhanced error boundaries
- Performance optimizations

---

This architecture ensures that GymPlify Mobile maintains clean, maintainable, and scalable code while providing an excellent user experience! 🎉

