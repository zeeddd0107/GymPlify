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
// eslint-disable-next-line no-undef
const ENV =
  typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "production";

const currentLogLevel =
  ENV === "development" ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

class Logger {
  static error(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  static info(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  static debug(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  // Specific loggers for different parts of the app
  static auth(message, ...args) {
    this.debug(`🔐 Auth: ${message}`, ...args);
  }

  static api(message, ...args) {
    this.debug(`🌐 API: ${message}`, ...args);
  }

  static render(component, message, ...args) {
    this.debug(`🎨 ${component}: ${message}`, ...args);
  }

  static hook(hookName, message, ...args) {
    this.debug(`🪝 ${hookName}: ${message}`, ...args);
  }

  static navigation(message, ...args) {
    this.debug(`🧭 Nav: ${message}`, ...args);
  }

  static payment(message, ...args) {
    this.info(`💳 Payment: ${message}`, ...args);
  }
}

export default Logger;
