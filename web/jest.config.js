export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  moduleNameMapper: {
    "^\\.\\/firebase$": "<rootDir>/__mocks__/firebase.js",
    "^\\.\\/api$": "<rootDir>/__mocks__/api.js",
  },
};
