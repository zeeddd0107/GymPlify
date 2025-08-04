# GymPlify Web Application

A comprehensive gym management system built with React, featuring subscription management, inventory tracking, and user administration.

## 📁 Project Structure

```
web/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── buttons/         # Button components
│   │   │   ├── Actions.jsx          # Row-level action buttons (edit/delete)
│   │   │   ├── DeleteButton.jsx     # Delete confirmation buttons
│   │   │   ├── EditButtons.jsx      # Edit form buttons (save/cancel)
│   │   │   └── index.js             # Button exports
│   │   ├── modals/          # Modal dialog components
│   │   │   ├── DeleteModal.jsx      # Delete confirmation modal
│   │   │   ├── EditModal.jsx        # Edit form modal
│   │   │   └── index.js             # Modal exports
│   │   ├── ui/              # UI-specific components
│   │   │   ├── SubscriptionsUI.jsx      # Main subscriptions page UI
│   │   │   ├── SubscriptionsActions.jsx # Subscription modal container
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── Sidebar.jsx          # Sidebar navigation
│   │   │   ├── FormInput.jsx        # Reusable form input
│   │   │   └── index.js             # UI exports
│   │   ├── forms/           # Form components
│   │   ├── tables/          # Table components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── subscription/    # Subscription-specific components
│   │   ├── inputs/          # Input components
│   │   ├── services/        # Service layer
│   │   └── index.js         # Main component exports
│   ├── pages/               # Page components
│   │   ├── Subscriptions.jsx        # Subscriptions page
│   │   ├── Inventory.jsx            # Inventory management page
│   │   ├── DashboardHome.jsx        # Dashboard home page
│   │   ├── QR.jsx                   # QR code page
│   │   ├── Admin.jsx                # Admin panel
│   │   ├── App.jsx                  # Main app component
│   │   └── index.js                 # Page exports
│   ├── context/             # React context providers
│   │   ├── AuthContext.js           # Authentication context
│   │   ├── AuthProvider.jsx         # Auth provider component
│   │   └── index.js                 # Context exports
│   ├── services/            # API and service functions
│   ├── config/              # Configuration files
│   │   └── firebase.js              # Firebase configuration
│   ├── styles/              # CSS and styling
│   ├── utils/               # Utility functions
│   └── index.jsx            # Main app entry point
├── public/                  # Static assets
├── config/                  # Build configuration
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── postcss.config.js    # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🧩 Component Architecture

### Button Components (`/components/buttons/`)

#### `Actions.jsx`
- **Purpose**: Row-level action buttons for data tables
- **Features**: Edit and delete buttons with built-in delete confirmation
- **Usage**: Embedded in table rows for individual item actions

#### `EditButtons.jsx`
- **Purpose**: Form action buttons for edit operations
- **Features**: Save and Cancel buttons with shadow effects
- **Usage**: Used in edit modals and forms

#### `DeleteButton.jsx`
- **Purpose**: Delete confirmation buttons
- **Features**: Cancel (gray) and Delete (red) buttons with shadows
- **Usage**: Used in delete confirmation modals

### Modal Components (`/components/modals/`)

#### `EditModal.jsx`
- **Purpose**: Reusable edit modal dialog
- **Features**: Form container with header, content area, and action buttons
- **Usage**: Wraps forms for editing data

#### `DeleteModal.jsx`
- **Purpose**: Delete confirmation modal with warnings
- **Features**: Warning icon, item display, confirmation messages
- **Usage**: Confirms destructive delete operations

### UI Components (`/components/ui/`)

#### `SubscriptionsUI.jsx`
- **Purpose**: Main subscriptions page interface
- **Features**: Data table, header, and modal integration
- **Usage**: Complete subscriptions page layout

#### `SubscriptionsActions.jsx`
- **Purpose**: Modal container for subscription operations
- **Features**: Edit and delete modal management
- **Usage**: Handles subscription-specific modal logic

## 🔄 Component Flow

### Edit Flow:
1. **Actions** (table row) → Edit button click
2. **SubscriptionsActions** → Opens EditModal
3. **EditModal** → Contains form with EditButtons
4. **EditButtons** → Save/Cancel actions

### Delete Flow:
1. **Actions** (table row) → Delete button click
2. **Actions** → Opens DeleteModal (built-in)
3. **DeleteModal** → Contains DeleteButton
4. **DeleteButton** → Confirm/Cancel actions

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Defined in Tailwind config
- **Shadows**: Enhanced button shadows for depth
- **Responsive**: Mobile-first design approach

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 Key Features

- **Modular Architecture**: Separated concerns between buttons, modals, and UI
- **Reusable Components**: Components can be used across different pages
- **Consistent Styling**: Unified design system with shadows and effects
- **Type Safety**: JSDoc comments for better development experience
- **Performance**: Optimized rendering with proper state management

## 🔧 Development Notes

- **Component Comments**: All functions have simple explanatory comments
- **File Organization**: Logical grouping by functionality
- **Import Structure**: Clean imports using index files
- **State Management**: React hooks for local state
- **Error Handling**: Comprehensive error handling in delete operations

## 📚 Dependencies

- **React**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling framework
- **Firebase**: Backend services
- **React Icons**: Icon library
