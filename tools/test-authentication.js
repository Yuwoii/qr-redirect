/**
 * QR Redirect Authentication Test
 * ---------------------------------
 * This script tests the core authentication flow of the application.
 * It covers registration, login, and session persistence.
 * 
 * How to use:
 * 1. Run the application locally
 * 2. Open the browser console on the home page
 * 3. Copy and paste this script into the console
 * 4. Call testAuthentication() to run the full test suite
 * 
 * Note: This is for testing purposes only and uses test credentials
 * that will be deleted after testing.
 */

// Configuration
const config = {
  baseUrl: window.location.origin,
  testUser: {
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!"
  },
  verbose: true
};

// Logging utility
const logger = {
  log: (message) => {
    if (config.verbose) {
      console.log(`%c [AUTH TEST] ${message}`, 'color: #6366F1');
    }
  },
  error: (message, error) => {
    console.error(`%c [AUTH TEST ERROR] ${message}`, 'color: #EF4444', error);
  },
  success: (message) => {
    console.log(`%c [AUTH TEST SUCCESS] ${message}`, 'color: #10B981');
  },
  warning: (message) => {
    console.log(`%c [AUTH TEST WARNING] ${message}`, 'color: #F59E0B');
  },
  info: (message) => {
    console.log(`%c [AUTH TEST INFO] ${message}`, 'color: #3B82F6');
  }
};

// Fetch utility with error handling
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    logger.error(`Failed to fetch ${url}`, error);
    throw error;
  }
}

// Navigate to a page and wait for it to load
async function navigateTo(path) {
  logger.log(`Navigating to ${path}`);
  return new Promise((resolve) => {
    window.location.href = `${config.baseUrl}${path}`;
    // We can't really know when navigation completes in this context
    // So we're resolving immediately, actual navigation will happen after
    resolve();
  });
}

// Test registration flow
async function testRegistration() {
  logger.info("TESTING REGISTRATION FLOW");
  
  try {
    // Direct API approach since we can't easily interact with forms in console
    const { response, data } = await fetchWithErrorHandling(`${config.baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.testUser),
    });
    
    if (response.ok) {
      logger.success(`Registration successful for ${config.testUser.email}`);
      return true;
    } else {
      logger.error("Registration failed", data.error);
      return false;
    }
  } catch (error) {
    logger.error("Registration test failed", error);
    return false;
  }
}

// Test login flow
async function testLogin() {
  logger.info("TESTING LOGIN FLOW");
  
  try {
    // We'll need to use the NextAuth signIn function
    // This is a client-side function that would be called from the login form
    const result = await window.fetch(`${config.baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: true,
        email: config.testUser.email,
        password: config.testUser.password,
        redirect: false,
        callbackUrl: `${config.baseUrl}/dashboard`,
      }),
    });
    
    if (result.ok) {
      logger.success("Login successful");
      
      // Check if we can access protected routes
      const isAuthenticated = await checkAuthentication();
      if (isAuthenticated) {
        logger.success("Authentication validation passed");
        return true;
      } else {
        logger.error("Login succeeded but validation failed");
        return false;
      }
    } else {
      logger.error("Login failed");
      return false;
    }
  } catch (error) {
    logger.error("Login test failed", error);
    return false;
  }
}

// Check if the user is authenticated by trying to access a protected route
async function checkAuthentication() {
  logger.log("Checking authentication status");
  
  try {
    // Try to fetch a protected API route
    const response = await fetch(`${config.baseUrl}/api/auth/session`);
    const session = await response.json();
    
    if (session && session.user) {
      logger.success("User is authenticated");
      return true;
    } else {
      logger.error("User is not authenticated");
      return false;
    }
  } catch (error) {
    logger.error("Authentication check failed", error);
    return false;
  }
}

// Clean up test user (for a complete test)
async function cleanupTestUser() {
  // This would require admin access, so we'll just log a warning
  logger.warning(`Test complete. Please manually delete test user: ${config.testUser.email}`);
  return true;
}

// Main test function
async function testAuthentication() {
  logger.info("STARTING AUTHENTICATION TEST SUITE");
  logger.info(`Test user: ${config.testUser.email}`);
  
  try {
    // Step 1: Register
    const registrationSuccess = await testRegistration();
    if (!registrationSuccess) {
      logger.error("Registration test failed, stopping test suite");
      return false;
    }
    
    // Step 2: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      logger.error("Login test failed, stopping test suite");
      return false;
    }
    
    // Step 3: Cleanup (optional)
    await cleanupTestUser();
    
    logger.success("AUTHENTICATION TEST SUITE COMPLETED SUCCESSFULLY");
    return true;
  } catch (error) {
    logger.error("Authentication test suite failed", error);
    return false;
  }
}

// Browser detection for console compatibility
function checkBrowserCompatibility() {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = typeof InstallTrigger !== 'undefined';
  
  if (!isChrome && !isFirefox) {
    logger.warning("This test script works best in Chrome or Firefox. Results may vary in other browsers.");
  }
  
  // Check if we're on the home page
  if (!window.location.pathname === '/') {
    logger.warning("This test should be run from the home page for best results.");
  }
}

// Initialize
(function() {
  checkBrowserCompatibility();
  logger.info("Authentication test script loaded");
  logger.info("Run testAuthentication() to start the tests");
})();

// Export functions for console access
window.testAuthentication = testAuthentication;
window.testRegistration = testRegistration;
window.testLogin = testLogin;
window.checkAuthentication = checkAuthentication; 