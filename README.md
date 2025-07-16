# GymPlify

## Setup Instructions

After cloning this repository, you must install dependencies using Yarn. This is standard practice for all Node.js, React, and Expo projects.

### 1. Install Yarn (if you don't have it)
```sh
yarn --version
# If you see a version number, you're good!
# If not, install it:
npm install -g yarn
```

### 2. Install dependencies in all project directories
From the root of your project, run:
```sh
yarn install
cd web && yarn install
cd ../mobile && yarn install
```

### 3. Start your projects
- For web:
  ```sh
  cd web
  yarn dev
  ```
- For mobile (Expo):
  ```sh
  cd mobile
  yarn start
  # or
  npx expo start
  ```

---

**Note:**
- You do NOT need to (and should NOT) commit `node_modules` to git. All dependencies are described in `package.json` and `yarn.lock`.
- If you add or update dependencies, always use `yarn add <package>` or `yarn add --dev <package>`.
- If you switch to npm, remove all `yarn.lock` files and use `npm install` instead (not recommended for this project).

---

For any issues, please open an issue or contact the maintainer.
