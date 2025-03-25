/**
 * QR Redirect Landing Page Update Test
 * ------------------------------------
 * This script tests the landing page updates, specifically checking:
 * 1. QR code examples are properly displayed
 * 2. Analytics dashboard visualization is showing
 * 3. No duplicate footer copyright
 * 
 * How to use:
 * 1. Run the application locally
 * 2. Open the browser console on the landing page (/)
 * 3. Copy and paste this script into the console
 * 4. Call testLandingPageUpdates() to run the tests
 */

// Configuration
const config = {
  verbose: true,
  selectors: {
    qrExamples: {
      container: '.grid.grid-cols-2.gap-6',
      images: '.grid.grid-cols-2.gap-6 img',
      titles: '.grid.grid-cols-2.gap-6 p.text-center'
    },
    analyticsDashboard: {
      container: '.lg\\:w-1\\/2.bg-white.rounded-xl',
      chartContainer: '.w-full.h-64.bg-white',
      chartBars: '.h-32.flex.items-end > div',
      stats: '.grid.grid-cols-3.gap-4'
    },
    footer: {
      container: 'footer',
      copyright: 'footer p',
      links: 'footer a'
    }
  },
  qrStyles: ['Classic', 'Rounded', 'Dots', 'Hybrid']
};

// Logging utility
const logger = {
  log: (message) => {
    if (config.verbose) {
      console.log(`%c [UPDATE TEST] ${message}`, 'color: #6366F1');
    }
  },
  error: (message, error) => {
    console.error(`%c [UPDATE TEST ERROR] ${message}`, 'color: #EF4444', error);
  },
  success: (message) => {
    console.log(`%c [UPDATE TEST SUCCESS] ${message}`, 'color: #10B981');
  },
  warning: (message) => {
    console.log(`%c [UPDATE TEST WARNING] ${message}`, 'color: #F59E0B');
  },
  info: (message) => {
    console.log(`%c [UPDATE TEST INFO] ${message}`, 'color: #3B82F6');
  }
};

// Test QR code examples
function testQRExamples() {
  logger.info("TESTING QR CODE EXAMPLES");
  let success = true;
  
  // Check container
  const container = document.querySelector(config.selectors.qrExamples.container);
  if (!container) {
    logger.error("QR examples container not found");
    return false;
  }
  
  logger.success("QR examples container found");
  
  // Check images
  const images = document.querySelectorAll(config.selectors.qrExamples.images);
  if (images.length !== 4) {
    logger.error(`Expected 4 QR code images, found ${images.length}`);
    success = false;
  } else {
    logger.success(`Found all 4 QR code images`);
    
    // Check for broken images
    let brokenImages = 0;
    images.forEach((img, index) => {
      if (!img.complete || img.naturalHeight === 0) {
        logger.error(`QR code image ${index + 1} is broken or not loading`);
        brokenImages++;
      }
      
      // Check src attribute
      const src = img.getAttribute('src');
      if (!src || !src.includes('style-previews')) {
        logger.error(`QR code image ${index + 1} has incorrect src: ${src}`);
        success = false;
      } else {
        logger.log(`QR code image ${index + 1} src: ${src}`);
      }
      
      // Check alt attribute
      const alt = img.getAttribute('alt');
      if (!alt) {
        logger.warning(`QR code image ${index + 1} missing alt text`);
      }
    });
    
    if (brokenImages > 0) {
      logger.error(`${brokenImages} QR code images are broken`);
      success = false;
    } else {
      logger.success("All QR code images are loading correctly");
    }
  }
  
  // Check titles
  const titles = document.querySelectorAll(config.selectors.qrExamples.titles);
  if (titles.length !== 4) {
    logger.error(`Expected 4 QR code titles, found ${titles.length}`);
    success = false;
  } else {
    logger.success(`Found all 4 QR code titles`);
    
    // Check if all expected styles are present
    const foundStyles = Array.from(titles).map(title => title.innerText.trim());
    const missingStyles = config.qrStyles.filter(style => 
      !foundStyles.some(found => found.includes(style))
    );
    
    if (missingStyles.length > 0) {
      logger.error(`Missing QR code styles: ${missingStyles.join(', ')}`);
      success = false;
    } else {
      logger.success("All expected QR code styles are present");
    }
  }
  
  return success;
}

// Test analytics dashboard
function testAnalyticsDashboard() {
  logger.info("TESTING ANALYTICS DASHBOARD");
  let success = true;
  
  // Check container
  const container = document.querySelector(config.selectors.analyticsDashboard.container);
  if (!container) {
    logger.error("Analytics dashboard container not found");
    return false;
  }
  
  logger.success("Analytics dashboard container found");
  
  // Check chart container
  const chartContainer = document.querySelector(config.selectors.analyticsDashboard.chartContainer);
  if (!chartContainer) {
    logger.error("Analytics chart container not found");
    success = false;
  } else {
    logger.success("Analytics chart container found");
    
    // Check for chart bars
    const chartBars = document.querySelectorAll(config.selectors.analyticsDashboard.chartBars);
    if (chartBars.length < 5) {
      logger.error(`Expected at least 5 chart bars, found ${chartBars.length}`);
      success = false;
    } else {
      logger.success(`Found ${chartBars.length} chart bars`);
    }
  }
  
  // Check stats section
  const stats = document.querySelector(config.selectors.analyticsDashboard.stats);
  if (!stats) {
    logger.error("Analytics stats section not found");
    success = false;
  } else {
    logger.success("Analytics stats section found");
    
    // Check if we have at least 3 stat blocks
    const statBlocks = stats.children;
    if (statBlocks.length < 3) {
      logger.error(`Expected at least 3 stat blocks, found ${statBlocks.length}`);
      success = false;
    } else {
      logger.success(`Found ${statBlocks.length} stat blocks`);
    }
  }
  
  return success;
}

// Test footer (make sure there's no duplicate copyright)
function testFooter() {
  logger.info("TESTING FOOTER");
  let success = true;
  
  // Check container
  const container = document.querySelector(config.selectors.footer.container);
  if (!container) {
    logger.error("Footer container not found");
    return false;
  }
  
  logger.success("Footer container found");
  
  // Check copyright mentions (should be exactly one)
  const copyrightTexts = document.querySelectorAll(config.selectors.footer.copyright);
  if (copyrightTexts.length !== 1) {
    logger.error(`Expected exactly 1 copyright text, found ${copyrightTexts.length}`);
    success = false;
  } else {
    logger.success("Found exactly 1 copyright text");
    
    // Check copyright content
    const copyright = copyrightTexts[0].innerText;
    if (!copyright.includes(new Date().getFullYear()) || !copyright.includes('QR Redirect')) {
      logger.error(`Copyright text does not contain expected content: ${copyright}`);
      success = false;
    } else {
      logger.success(`Copyright text contains expected content: ${copyright}`);
    }
  }
  
  // Check footer links
  const links = document.querySelectorAll(config.selectors.footer.links);
  if (links.length < 1) {
    logger.warning("No footer links found, expected at least 1");
  } else {
    logger.success(`Found ${links.length} footer links`);
  }
  
  return success;
}

// Main test function
async function testLandingPageUpdates() {
  logger.info("STARTING LANDING PAGE UPDATES TEST");
  
  // Make sure we're on the landing page
  if (window.location.pathname !== '/') {
    logger.warning(`You're not on the landing page. Current path: ${window.location.pathname}`);
    if (confirm("Navigate to landing page now?")) {
      window.location.href = window.location.origin;
      return false;
    }
  }
  
  // Run the tests
  const qrExamplesSuccess = testQRExamples();
  const analyticsDashboardSuccess = testAnalyticsDashboard();
  const footerSuccess = testFooter();
  
  // Summary
  logger.info("TEST SUMMARY");
  
  if (qrExamplesSuccess) {
    logger.success("QR Examples Test: PASSED");
  } else {
    logger.error("QR Examples Test: FAILED");
  }
  
  if (analyticsDashboardSuccess) {
    logger.success("Analytics Dashboard Test: PASSED");
  } else {
    logger.error("Analytics Dashboard Test: FAILED");
  }
  
  if (footerSuccess) {
    logger.success("Footer Test: PASSED");
  } else {
    logger.error("Footer Test: FAILED");
  }
  
  const overallSuccess = qrExamplesSuccess && analyticsDashboardSuccess && footerSuccess;
  
  if (overallSuccess) {
    logger.success("ALL TESTS PASSED! The landing page updates are working correctly.");
  } else {
    logger.error("SOME TESTS FAILED. Please check the detailed logs above.");
  }
  
  return overallSuccess;
}

// Initialize
(function() {
  logger.info("Landing page update test script loaded");
  logger.info("Run testLandingPageUpdates() to start the tests");
})();

// Export function for console access
window.testLandingPageUpdates = testLandingPageUpdates; 