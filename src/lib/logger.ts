/**
 * Enhanced logger utility for the application
 * Includes request ID tracking for correlating logs across requests
 */

import { getRequestId } from './request-context';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Different log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Configuration for the logger
interface LoggerConfig {
  // Minimum log level to output
  minLevel: LogLevel;
  // Whether to include timestamps in log messages
  includeTimestamps: boolean;
  // Whether to include the calling service/method in log messages
  includeSource: boolean;
  // Whether to include request IDs in log messages
  includeRequestId: boolean;
  // Whether to send logs to a remote service (future)
  sendToRemoteService: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 
            (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG),
  includeTimestamps: true,
  includeSource: true,
  includeRequestId: true,
  sendToRemoteService: false,
};

// Current logger configuration
let config: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger
 * @param newConfig The new configuration to apply
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Determine if a log message should be output based on its level
 * @param level The log level
 * @returns True if the message should be logged
 */
function shouldLog(level: LogLevel): boolean {
  const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
  const minLevelIndex = levels.indexOf(config.minLevel);
  const currentLevelIndex = levels.indexOf(level);
  
  // If minLevel is not valid, default to INFO
  if (minLevelIndex === -1) {
    return currentLevelIndex <= levels.indexOf(LogLevel.INFO);
  }
  
  return currentLevelIndex <= minLevelIndex;
}

/**
 * Format a log message with optional timestamp, source, and request ID
 * @param level The log level
 * @param message The message to log
 * @param source The source of the log (e.g., service or method name)
 * @returns The formatted log message
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  source?: string
): string {
  let formattedMessage = '';
  
  // Add timestamp if configured
  if (config.includeTimestamps) {
    formattedMessage += `[${new Date().toISOString()}] `;
  }
  
  // Add log level
  formattedMessage += `[${level.toUpperCase()}] `;
  
  // Add request ID if configured and not in browser
  if (config.includeRequestId && !isBrowser) {
    try {
      formattedMessage += `[${getRequestId()}] `;
    } catch (e) {
      // Silently ignore errors in getting request ID
    }
  }
  
  // Add source if provided and configured
  if (source && config.includeSource) {
    formattedMessage += `[${source}] `;
  }
  
  // Add message
  formattedMessage += message;
  
  return formattedMessage;
}

/**
 * Type for additional logging data
 */
type LoggingData = Record<string, unknown>;

/**
 * Log an error message
 * @param message The message to log
 * @param source The source of the log (e.g., service or method name)
 * @param error An optional error object
 * @param additionalData Additional data to log
 */
export function error(
  message: string,
  source?: string,
  error?: Error | unknown,
  additionalData?: LoggingData
): void {
  if (!shouldLog(LogLevel.ERROR)) return;
  
  const formattedMessage = formatLogMessage(LogLevel.ERROR, message, source);
  console.error(formattedMessage);
  
  if (error) {
    if (error instanceof Error) {
      // Log the error with stack trace
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      // Try to log unknown errors as best we can
      console.error('Unknown error:', error);
    }
  }
  
  if (additionalData) {
    console.error('Additional data:', additionalData);
  }
  
  // In the future, this could send logs to a remote service
  if (config.sendToRemoteService && !isBrowser) {
    // Implementation for remote logging would go here
  }
}

/**
 * Log a warning message
 * @param message The message to log
 * @param source The source of the log (e.g., service or method name)
 * @param additionalData Additional data to log
 */
export function warn(
  message: string,
  source?: string,
  additionalData?: LoggingData
): void {
  if (!shouldLog(LogLevel.WARN)) return;
  
  const formattedMessage = formatLogMessage(LogLevel.WARN, message, source);
  console.warn(formattedMessage);
  
  if (additionalData) {
    console.warn('Additional data:', additionalData);
  }
}

/**
 * Log an info message
 * @param message The message to log
 * @param source The source of the log (e.g., service or method name)
 * @param additionalData Additional data to log
 */
export function info(
  message: string,
  source?: string,
  additionalData?: LoggingData
): void {
  if (!shouldLog(LogLevel.INFO)) return;
  
  const formattedMessage = formatLogMessage(LogLevel.INFO, message, source);
  console.info(formattedMessage);
  
  if (additionalData) {
    console.info('Additional data:', additionalData);
  }
}

/**
 * Log a debug message
 * @param message The message to log
 * @param source The source of the log (e.g., service or method name)
 * @param additionalData Additional data to log
 */
export function debug(
  message: string,
  source?: string,
  additionalData?: LoggingData
): void {
  if (!shouldLog(LogLevel.DEBUG)) return;
  
  const formattedMessage = formatLogMessage(LogLevel.DEBUG, message, source);
  console.debug(formattedMessage);
  
  if (additionalData) {
    console.debug('Additional data:', additionalData);
  }
}

/**
 * Log a request completion with timing information
 * @param method The HTTP method
 * @param url The request URL
 * @param statusCode The response status code
 * @param startTime The time when the request started (in milliseconds)
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  startTime: number
): void {
  const duration = Date.now() - startTime;
  const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  
  const message = `${method} ${url} ${statusCode} in ${duration}ms`;
  
  if (level === LogLevel.ERROR) {
    error(message, 'http');
  } else {
    info(message, 'http');
  }
}

// Create the logger object
const logger = {
  error,
  warn,
  info,
  debug,
  logRequest,
  configure: configureLogger,
};

// Export the logger
export default logger; 