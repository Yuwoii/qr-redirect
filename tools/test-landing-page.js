/**
 * QR Redirect Landing Page Test
 * -----------------------------
 * This script tests the landing page rendering and functionality.
 * It validates responsive design, navigation, and core elements.
 * 
 * How to use:
 * 1. Run the application locally
 * 2. Open the browser console on the landing page (/)
 * 3. Copy and paste this script into the console
 * 4. Call testLandingPage() to run the full test suite
 */

// Configuration
const config = {
  baseUrl: window.location.origin,
  verbose: true,
  breakpoints: {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  },
  selectors: {
    hero: {
      heading: 'h1',
      description: 'h1 + p',
      ctas: '.flex-col.sm\\:flex-row a'
    },
    features: {
      section: 'section:nth-of-type(3)',
      cards: 'section:nth-of-type(3) .grid > div'
    },
    howItWorks: {
      section: 'section:nth-of-type(4)',
      steps: 'section:nth-of-type(4) .grid > div'
    },
    analyticsShowcase: {
      section: 'section:nth-of-type(2)',
      featureList: 'section:nth-of-type(2) ul li'
    },
    cta: {
      section: 'section:nth-of-type(5)',
      button: 'section:nth-of-type(5) a'
    },
    navigation: {
      links: 'header nav a'
    }
  }
};

// Logging utility
const logger = {
  log: (message) => {
    if (config.verbose) {
      console.log(`%c [LANDING TEST] ${message}`, 'color: #6366F1');
    }
  },
  error: (message, error) => {
    console.error(`%c [LANDING TEST ERROR] ${message}`, 'color: #EF4444', error);
  },
  success: (message) => {
    console.log(`%c [LANDING TEST SUCCESS] ${message}`, 'color: #10B981');
  },
  warning: (message) => {
    console.log(`%c [LANDING TEST WARNING] ${message}`, 'color: #F59E0B');
  },
  info: (message) => {
    console.log(`%c [LANDING TEST INFO] ${message}`, 'color: #3B82F6');
  },
  style: (message, style) => {
    console.log(`%c ${message}`, style);
  }
};

// Test if element exists
function testElementExists(selector, name) {
  const element = document.querySelector(selector);
  if (element) {
    logger.success(`Found ${name}: ${element.innerText.substring(0, 30)}${element.innerText.length > 30 ? '...' : ''}`);
    return true;
  } else {
    logger.error(`Could not find ${name} using selector: ${selector}`);
    return false;
  }
}

// Test if multiple elements exist
function testElementsExist(selector, name, expectedCount = null) {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    logger.success(`Found ${elements.length} ${name}`);
    
    if (expectedCount !== null && elements.length !== expectedCount) {
      logger.warning(`Expected ${expectedCount} ${name} but found ${elements.length}`);
      return false;
    }
    
    return true;
  } else {
    logger.error(`Could not find any ${name} using selector: ${selector}`);
    return false;
  }
}

// Test navigation links
function testNavigation() {
  logger.info("TESTING NAVIGATION");
  
  const links = document.querySelectorAll(config.selectors.navigation.links);
  if (links.length === 0) {
    logger.error("No navigation links found");
    return false;
  }
  
  logger.success(`Found ${links.length} navigation links`);
  
  // Log each link
  links.forEach(link => {
    logger.log(`Nav link: ${link.innerText} -> ${link.getAttribute('href')}`);
  });
  
  // Check for key links
  const requiredLinks = ['Dashboard', 'Login', 'Register'];
  const foundLinks = Array.from(links).map(link => link.innerText);
  
  const missingLinks = requiredLinks.filter(link => 
    !foundLinks.some(found => found.includes(link))
  );
  
  if (missingLinks.length > 0) {
    logger.warning(`Missing navigation links: ${missingLinks.join(', ')}`);
  } else {
    logger.success(`All required navigation links present`);
  }
  
  return true;
}

// Test hero section
function testHeroSection() {
  logger.info("TESTING HERO SECTION");
  
  let success = true;
  
  success = testElementExists(config.selectors.hero.heading, 'Hero heading') && success;
  success = testElementExists(config.selectors.hero.description, 'Hero description') && success;
  success = testElementsExist(config.selectors.hero.ctas, 'Call to action buttons') && success;
  
  return success;
}

// Test features section
function testFeaturesSection() {
  logger.info("TESTING FEATURES SECTION");
  
  let success = true;
  
  success = testElementExists(config.selectors.features.section, 'Features section') && success;
  success = testElementsExist(config.selectors.features.cards, 'Feature cards', 3) && success;
  
  return success;
}

// Test how it works section
function testHowItWorksSection() {
  logger.info("TESTING HOW IT WORKS SECTION");
  
  let success = true;
  
  success = testElementExists(config.selectors.howItWorks.section, 'How it works section') && success;
  success = testElementsExist(config.selectors.howItWorks.steps, 'Step cards', 4) && success;
  
  return success;
}

// Test analytics showcase section
function testAnalyticsSection() {
  logger.info("TESTING ANALYTICS SHOWCASE SECTION");
  
  let success = true;
  
  success = testElementExists(config.selectors.analyticsShowcase.section, 'Analytics showcase section') && success;
  success = testElementsExist(config.selectors.analyticsShowcase.featureList, 'Analytics features', 4) && success;
  
  return success;
}

// Test CTA section
function testCTASection() {
  logger.info("TESTING CTA SECTION");
  
  let success = true;
  
  success = testElementExists(config.selectors.cta.section, 'CTA section') && success;
  success = testElementExists(config.selectors.cta.button, 'CTA button') && success;
  
  return success;
}

// Test responsive design
function testResponsiveDesign() {
  logger.info("TESTING RESPONSIVE DESIGN");
  
  // We can't actually resize the viewport in a console script,
  // but we can check if the responsive classes are applied correctly
  
  // Check for responsive classes on key elements
  const responsiveClasses = [
    'sm:', 'md:', 'lg:', 'xl:'
  ];
  
  const html = document.documentElement.outerHTML;
  const responsiveClassCount = responsiveClasses.reduce((count, className) => {
    const matches = html.match(new RegExp(className.replace(':', '\\:'), 'g'));
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (responsiveClassCount > 50) {
    logger.success(`Found ${responsiveClassCount} responsive class usages - responsive design confirmed`);
    return true;
  } else {
    logger.warning(`Only found ${responsiveClassCount} responsive class usages - responsive design may be limited`);
    return false;
  }
}

// Test links functionality
function testLinks() {
  logger.info("TESTING LINKS FUNCTIONALITY");
  
  // Get all links
  const links = document.querySelectorAll('a[href]');
  logger.log(`Found ${links.length} links`);
  
  // Check for broken links (missing href or javascript:void(0))
  const brokenLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href');
    return !href || href === '#' || href === 'javascript:void(0)';
  });
  
  if (brokenLinks.length > 0) {
    logger.warning(`Found ${brokenLinks.length} potentially broken links`);
    brokenLinks.forEach(link => {
      logger.log(`Potentially broken link: ${link.innerText} (${link.getAttribute('href')})`);
    });
  } else {
    logger.success(`No broken links found`);
  }
  
  return true;
}

// Test images
function testImages() {
  logger.info("TESTING IMAGES");
  
  // Get all images
  const images = document.querySelectorAll('img');
  logger.log(`Found ${images.length} images`);
  
  // Check for images with alt text
  const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt') && img.getAttribute('alt'));
  const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt') || !img.getAttribute('alt'));
  
  logger.log(`Images with alt text: ${imagesWithAlt.length}`);
  logger.log(`Images without alt text: ${imagesWithoutAlt.length}`);
  
  if (imagesWithoutAlt.length > 0) {
    logger.warning(`Found ${imagesWithoutAlt.length} images without alt text`);
  } else if (images.length > 0) {
    logger.success(`All images have alt text`);
  }
  
  // Check for broken images
  const brokenImages = Array.from(images).filter(img => !img.complete || !img.naturalWidth);
  
  if (brokenImages.length > 0) {
    logger.error(`Found ${brokenImages.length} broken images`);
    return false;
  } else if (images.length > 0) {
    logger.success(`All images are loading correctly`);
  }
  
  return true;
}

// Test performance metrics
function testPerformance() {
  logger.info("MEASURING PERFORMANCE METRICS");
  
  // Use the Performance API to get basic metrics
  if (window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domComplete - perfData.domLoading;
    
    logger.log(`Page load time: ${pageLoadTime}ms`);
    logger.log(`DOM ready time: ${domReadyTime}ms`);
    
    if (pageLoadTime < 3000) {
      logger.success(`Page load time is good (${pageLoadTime}ms)`);
    } else {
      logger.warning(`Page load time could be improved (${pageLoadTime}ms)`);
    }
  } else {
    logger.warning("Performance API not available");
  }
  
  return true;
}

// Main test function
async function testLandingPage() {
  logger.style("LANDING PAGE TEST SUITE", "font-size: 16px; font-weight: bold; color: #4F46E5; padding: 5px;");
  logger.info(`Testing landing page at ${config.baseUrl}`);
  
  // Make sure we're on the landing page
  if (window.location.pathname !== '/') {
    logger.warning(`You're not on the landing page. Current path: ${window.location.pathname}`);
    if (confirm("Navigate to landing page now?")) {
      window.location.href = config.baseUrl;
      return false;
    }
  }
  
  let testsPassed = 0;
  let testsFailed = 0;
  let testsWarning = 0;
  
  // Run all tests
  const tests = [
    { name: "Navigation", fn: testNavigation },
    { name: "Hero Section", fn: testHeroSection },
    { name: "Features Section", fn: testFeaturesSection },
    { name: "How It Works Section", fn: testHowItWorksSection },
    { name: "Analytics Section", fn: testAnalyticsSection },
    { name: "CTA Section", fn: testCTASection },
    { name: "Responsive Design", fn: testResponsiveDesign },
    { name: "Links", fn: testLinks },
    { name: "Images", fn: testImages },
    { name: "Performance", fn: testPerformance }
  ];
  
  // Run tests sequentially
  for (const test of tests) {
    logger.style(`\n${test.name} TEST`, "font-weight: bold; color: #6366F1; padding: 3px;");
    try {
      const result = await test.fn();
      if (result === true) {
        testsPassed++;
      } else if (result === false) {
        testsFailed++;
      } else {
        testsWarning++;
      }
    } catch (error) {
      logger.error(`Test "${test.name}" failed with error:`, error);
      testsFailed++;
    }
  }
  
  // Summary
  logger.style("\nTEST SUMMARY", "font-size: 16px; font-weight: bold; color: #4F46E5; padding: 5px;");
  logger.style(`Tests Passed: ${testsPassed}/${tests.length}`, "color: #10B981; font-weight: bold;");
  
  if (testsFailed > 0) {
    logger.style(`Tests Failed: ${testsFailed}/${tests.length}`, "color: #EF4444; font-weight: bold;");
  }
  
  if (testsWarning > 0) {
    logger.style(`Tests with Warnings: ${testsWarning}/${tests.length}`, "color: #F59E0B; font-weight: bold;");
  }
  
  return testsFailed === 0;
}

// Browser detection for console compatibility
function checkBrowserCompatibility() {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = typeof InstallTrigger !== 'undefined';
  
  if (!isChrome && !isFirefox) {
    logger.warning("This test script works best in Chrome or Firefox. Results may vary in other browsers.");
  }
}

// Initialize
(function() {
  checkBrowserCompatibility();
  logger.info("Landing page test script loaded");
  logger.info("Run testLandingPage() to start the tests");
})();

// Export function for console access
window.testLandingPage = testLandingPage; 