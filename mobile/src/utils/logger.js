/**
 * Centralized logging utility for GymPlify mobile app
 * Provides different log levels and can be easily configured for production
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Set to 'development' for verbose logging, 'production' for minimal logging

const ENV =
  typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "production";

// Reduce verbosity by default; can be overridden at runtime via setLevel
let currentLogLevel = ENV === "development" ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;

// Simple dedupe store to avoid log spam (same key within window suppressed)
const seenLogKeys = new Map(); // key -> expiry timestamp
const DEDUPE_WINDOW_MS = 3000;

class Logger {
  static setLevel(levelName) {
    if (LOG_LEVELS[levelName] !== undefined) {
      currentLogLevel = LOG_LEVELS[levelName];
    }
  }

  static _shouldLog(key) {
    if (!key) return true;
    const now = Date.now();
    const expiry = seenLogKeys.get(key) || 0;
    if (expiry > now) return false; // suppress
    seenLogKeys.set(key, now + DEDUPE_WINDOW_MS);
    return true;
  }

  static once(key, message, ...args) {
    if (!this._shouldLog(key)) return;
    this.info(message, ...args);
  }
  static error(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(message, ...args);
    }
  }

  static warn(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(message, ...args);
    }
  }

  static info(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(message, ...args);
    }
  }

  static debug(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(message, ...args);
    }
  }

  // Specific loggers for different parts of the app
  static auth(message, ...args) {
    this.debug(`Auth: ${message}`, ...args);
  }

  static api(message, ...args) {
    this.debug(`API: ${message}`, ...args);
  }

  static render(component, message, ...args) {
    this.debug(`${component}: ${message}`, ...args);
  }

  static hook(hookName, message, ...args) {
    this.debug(`${hookName}: ${message}`, ...args);
  }

  static navigation(message, ...args) {
    this.debug(`Nav: ${message}`, ...args);
  }

  static payment(message, ...args) {
    this.info(`Payment: ${message}`, ...args);
  }
}

export default Logger;
