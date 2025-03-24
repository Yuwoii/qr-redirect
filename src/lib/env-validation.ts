/**
 * Environment variable validation 
 * Ensures required environment variables are present and valid
 */

import logger from './logger';

/**
 * Required environment variables
 */
const REQUIRED_VARIABLES = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
];

/**
 * Optional environment variables with their default values
 */
const OPTIONAL_VARIABLES = {
  'LOG_LEVEL': 'info',
  'RATE_LIMIT_MAX': '100',
  'RATE_LIMIT_WINDOW_MS': '60000',
};

/**
 * Validates that all required environment variables are present
 * @returns true if all required variables are present, false otherwise
 */
export function validateRequiredEnvVars(): boolean {
  const missing = REQUIRED_VARIABLES.filter(
    name => !process.env[name]
  );
  
  if (missing.length > 0) {
    logger.error(
      `Missing required environment variables: ${missing.join(', ')}`,
      'env-validation'
    );
    
    return false;
  }
  
  return true;
}

/**
 * Sets default values for optional environment variables if not already set
 */
export function setDefaultEnvVars(): void {
  Object.entries(OPTIONAL_VARIABLES).forEach(([name, defaultValue]) => {
    if (!process.env[name]) {
      logger.info(
        `Setting default value for ${name}: ${defaultValue}`,
        'env-validation'
      );
      
      process.env[name] = defaultValue;
    }
  });
}

/**
 * Logs all environment variables (sanitized) for debugging
 * @param includeSecrets Whether to include secret variables (default: false)
 */
export function logEnvVars(includeSecrets = false): void {
  const envVars: Record<string, string> = {};
  
  // Collect all environment variables
  [...REQUIRED_VARIABLES, ...Object.keys(OPTIONAL_VARIABLES)].forEach(name => {
    const value = process.env[name];
    
    if (value) {
      // Sanitize secret values
      const isSecret = name.includes('SECRET') || 
                      name.includes('PASSWORD') || 
                      name.includes('KEY');
      
      envVars[name] = isSecret && !includeSecrets ? '******' : value;
    }
  });
  
  logger.debug(
    'Environment variables:',
    'env-validation',
    envVars
  );
}

/**
 * Validates all environment variables and sets defaults
 * @returns true if validation succeeds, false otherwise
 */
export function validateEnvironment(): boolean {
  // Validate required variables
  const isValid = validateRequiredEnvVars();
  
  // Set defaults for optional variables
  setDefaultEnvVars();
  
  // Log all variables (sanitized)
  logEnvVars();
  
  return isValid;
}

// Export a default object for convenience
export default {
  validateRequiredEnvVars,
  setDefaultEnvVars,
  logEnvVars,
  validateEnvironment,
}; 