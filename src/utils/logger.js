/**
 * Logger Utility
 * Provides structured logging for the API Gateway
 */

export const logger = {
  /**
   * Log info message
   */
  info(message, data = {}) {
    const logEntry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...data
    };
    console.log(JSON.stringify(logEntry));
  },

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    const logEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...data
    };
    console.warn(JSON.stringify(logEntry));
  },

  /**
   * Log error message
   */
  error(message, data = {}) {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      ...data
    };
    console.error(JSON.stringify(logEntry));
  },

  /**
   * Log debug message
   */
  debug(message, data = {}) {
    const logEntry = {
      level: 'debug',
      timestamp: new Date().toISOString(),
      message,
      ...data
    };
    console.debug(JSON.stringify(logEntry));
  }
};
