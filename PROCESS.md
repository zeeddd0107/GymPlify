# Project Process & Development Journal
## Web
This file is for documenting the journey of building GymPlify, including key decisions, daily progress, and future plans. Also, to take note the processes everytime I run 'npm run dev' in the console.

- When I run 'npm run dev', it executes the script defined in web/package.json. This script starts the Vite development server using the configuration defined in the 'config/vite.config.js' file.

- Vite serves web/index.html as the entry point of the application. Inside index.html, line 20 triggers:
<script type="module" src="/src/index.jsx"></script>

- index.html contains this specific line (Line 20 in file): 
<script type="module" src="/src/index.jsx"></script>

- The index.html acts like a bridge between the browser and the React application.

- The Browser reads that line and Vite then compiles and serves the index.jsx file.

- The Container (index.html): It has an empty div waiting to be filled:
<div id="root"></div>

- The Connector (index.html): It tells the browser to run the index.jsx script:
<script type="module" src="/src/index.jsx"></script>

- The Builder (src/index.jsx): This file runs, grabs that <div id="root">, and injects the entire React app (<App />) into it.

- Inside index.jsx, it creates a root element and renders the App component:
const root = ReactDOM.createRoot(document.getElementById("root")); // Finds the div
root.render(<App />); // Puts the App inside it

### Log

#### [Date: 2024-02-04]
**Focus:** 
- 

**Challenges:**
- 

**Solutions:**
- 

### Architecture Decisions
- **Decision:** 
  - **Reason:** 
  - **Alternatives Considered:** 

### TODOs & Future Ideas
- [ ] 

## Mobile
- **Current Status:**
- **Notes:**

## Backend
- **Current Status:**
- **Notes:**
