# GymPlify Web App

This is the web frontend for GymPlify, built with React and Vite.

## Features

- ⚡ **Vite** - Fast development server and build tool
- ⚛️ **React 19** - Latest React with concurrent features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧪 **Vitest** - Fast unit testing framework

## Getting Started

### Development

```bash
npm run dev
```

This starts the development server at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates a production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

### Running Tests

```bash
npm test
```

This runs the test suite using Vitest.

## Project Structure

```
web/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── index.js     # Component exports
│   ├── context/         # React context providers
│   │   └── index.js     # Context exports
│   ├── hooks/           # Custom React hooks
│   │   └── index.js     # Hook exports
│   ├── pages/           # Page components
│   │   ├── App.jsx      # Main application component
│   │   ├── App.test.jsx # App component tests
│   │   └── index.js     # Page exports
│   ├── styles/          # CSS and styling files
│   │   └── index.css    # Global styles with Tailwind
│   ├── utils/           # Utility functions and helpers
│   │   ├── test-setup.js # Test configuration
│   │   └── index.js     # Utility exports
│   └── index.jsx        # Application entry point
├── config/              # Configuration files
│   ├── vite.config.js   # Vite configuration
│   ├── vitest.config.js # Vitest configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js # PostCSS configuration
├── public/              # Static assets
│   ├── favicon.ico      # Browser icon
│   ├── manifest.json    # Web app manifest
│   └── robots.txt       # SEO configuration
└── index.html           # HTML template
```

## Technologies Used

- **Vite** - Build tool and dev server
- **React** - UI library
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **PostCSS** - CSS processing
- **Firebase** - Authentication and database
- **Axios** - HTTP client for API calls

## Environment Variables

Create a `.env` file in the web directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API URL
VITE_API_URL=http://localhost:4000
```

You can get these values from your Firebase project console.
