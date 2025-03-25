/**
 * QR Redirect Homepage Enhancements Test
 * -------------------------------------
 * This script tests the enhanced homepage features:
 * 1. Updated QR code examples (all 6 styles)
 * 2. Enhanced analytics dashboard with navigation controls
 * 3. Global footer implementation
 * 
 * How to use:
 * 1. Run the application locally
 * 2. Open the browser console on the landing page (/)
 * 3. Copy and paste this script into the console
 * 4. Call testHomepageEnhancements() to run the tests
 */

// Configuration
const config = {
  verbose: true,
  selectors: {
    qrExamples: {
      container: '.grid.grid-cols-3.gap-4',
      images: '.grid.grid-cols-3.gap-4 img',
      titles: '.grid.grid-cols-3.gap-4 p.text-center',
      expectedStyles: ['Classic', 'Rounded', 'Dots', 'Corner Dots', 'Rounded Dots', 'Hybrid']
    },
    analyticsDashboard: {
      container: '.lg\\:w-1\\/2.bg-white.rounded-xl',
      navigationButtons: 'button[aria-label]',
      chartContainer: '.h-32.bg-white',
      chartBars: '.h-32.flex.items-end > div',
      statsGrid: '.grid.grid-cols-3.gap-4',
      secondaryData: '.grid.grid-cols-2.gap-4'
    },
    footer: {
      container: 'footer',
      copyright: 'footer p',
      links: 'footer a',
      expectedLinks: ['Privacy Policy', 'Terms of Service', 'Contact Us']
    }
  }
};

// Logging utility
const logger = {
  log: (message) => {
    if (config.verbose) {
      console.log(`%c [ENHANCEMENT TEST] ${message}`, 'color: #6366F1');
    }
  },
  error: (message, error) => {
    console.error(`%c [ENHANCEMENT TEST ERROR] ${message}`, 'color: #EF4444', error);
  },
  success: (message) => {
    console.log(`%c [ENHANCEMENT TEST SUCCESS] ${message}`, 'color: #10B981');
  },
  warning: (message) => {
    console.log(`%c [ENHANCEMENT TEST WARNING] ${message}`, 'color: #F59E0B');
  },
  info: (message) => {
    console.log(`%c [ENHANCEMENT TEST INFO] ${message}`, 'color: #3B82F6');
  }
};

// Test QR code examples with all 6 styles
function testQRExamples() {
  logger.info("TESTING ENHANCED QR CODE EXAMPLES");
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
  if (images.length !== 6) {
    logger.error(`Expected 6 QR code images, found ${images.length}`);
    success = false;
  } else {
    logger.success(`Found all 6 QR code images`);
    
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
    });
    
    if (brokenImages > 0) {
      logger.error(`${brokenImages} QR code images are broken`);
      success = false;
    } else {
      logger.success("All QR code images are loading correctly");
    }
  }
  
  // Check style titles
  const titles = Array.from(document.querySelectorAll('p')).filter(p => 
    ['Classic', 'Rounded', 'Dots', 'Corner', 'Hybrid'].some(style => 
      p.textContent.includes(style)
    )
  );
  
  if (titles.length < 6) {
    logger.error(`Expected at least 6 QR code style titles, found ${titles.length}`);
    success = false;
  } else {
    logger.success(`Found ${titles.length} QR code style titles`);
    
    // Check if all expected styles are present
    const foundStyles = titles.map(title => title.textContent.trim());
    const missingStyles = config.selectors.qrExamples.expectedStyles.filter(style => 
      !foundStyles.some(found => found.includes(style.split(' ')[0]))
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

// Test enhanced analytics dashboard with navigation
function testEnhancedAnalyticsDashboard() {
  logger.info("TESTING ENHANCED ANALYTICS DASHBOARD");
  let success = true;
  
  // Check container
  const container = document.querySelector(config.selectors.analyticsDashboard.container);
  if (!container) {
    logger.error("Analytics dashboard container not found");
    return false;
  }
  
  logger.success("Analytics dashboard container found");
  
  // Check navigation buttons
  const navigationButtons = document.querySelectorAll(config.selectors.analyticsDashboard.navigationButtons);
  if (navigationButtons.length !== 2) {
    logger.error(`Expected 2 navigation buttons, found ${navigationButtons.length}`);
    success = false;
  } else {
    logger.success("Found both navigation buttons (left and right)");
  }
  
  // Check chart container
  const chartContainer = document.querySelector(config.selectors.analyticsDashboard.chartContainer);
  if (!chartContainer) {
    logger.error("Analytics chart container not found");
    success = false;
  } else {
    logger.success("Analytics chart container found");
    
    // Check for chart bars
    const chartBars = document.querySelectorAll(config.selectors.analyticsDashboard.chartBars);
    if (chartBars.length < 10) {
      logger.error(`Expected at least 10 chart bars, found ${chartBars.length}`);
      success = false;
    } else {
      logger.success(`Found ${chartBars.length} chart bars`);
    }
  }
  
  // Check stats grid
  const statsGrid = document.querySelector(config.selectors.analyticsDashboard.statsGrid);
  if (!statsGrid) {
    logger.error("Stats grid not found");
    success = false;
  } else {
    logger.success("Stats grid found");
    
    // Check if we have at least 3 stat blocks
    const statBlocks = statsGrid.children;
    if (statBlocks.length < 3) {
      logger.error(`Expected at least 3 stat blocks, found ${statBlocks.length}`);
      success = false;
    } else {
      logger.success(`Found ${statBlocks.length} stat blocks`);
    }
  }
  
  // Check secondary data section
  const secondaryData = document.querySelector(config.selectors.analyticsDashboard.secondaryData);
  if (!secondaryData) {
    logger.error("Secondary data section not found");
    success = false;
  } else {
    logger.success("Secondary data section found");
    
    // Check if we have geographic and device breakdown sections
    const secondaryBlocks = secondaryData.children;
    if (secondaryBlocks.length < 2) {
      logger.error(`Expected at least 2 secondary data blocks, found ${secondaryBlocks.length}`);
      success = false;
    } else {
      logger.success(`Found ${secondaryBlocks.length} secondary data blocks`);
    }
  }
  
  return success;
}

// Test global footer implementation
function testGlobalFooter() {
  logger.info("TESTING GLOBAL FOOTER");
  let success = true;
  
  // Check container
  const footer = document.querySelector(config.selectors.footer.container);
  if (!footer) {
    logger.error("Footer container not found");
    return false;
  }
  
  logger.success("Footer container found");
  
  // Check copyright text
  const copyright = document.querySelector(config.selectors.footer.copyright);
  if (!copyright) {
    logger.error("Copyright text not found");
    success = false;
  } else {
    logger.success("Copyright text found");
    
    // Check copyright content
    const copyrightText = copyright.textContent;
    if (!copyrightText.includes(new Date().getFullYear().toString()) || !copyrightText.includes('QR Redirect')) {
      logger.error(`Copyright text does not contain expected content: ${copyrightText}`);
      success = false;
    } else {
      logger.success(`Copyright text contains expected content: ${copyrightText}`);
    }
  }
  
  // Check footer links
  const links = document.querySelectorAll(config.selectors.footer.links);
  if (links.length < 3) {
    logger.error(`Expected at least 3 footer links, found ${links.length}`);
    success = false;
  } else {
    logger.success(`Found ${links.length} footer links`);
    
    // Check if all expected links are present
    const foundLinks = Array.from(links).map(link => link.textContent.trim());
    const missingLinks = config.selectors.footer.expectedLinks.filter(link => 
      !foundLinks.includes(link)
    );
    
    if (missingLinks.length > 0) {
      logger.error(`Missing footer links: ${missingLinks.join(', ')}`);
      success = false;
    } else {
      logger.success("All expected footer links are present");
    }
  }
  
  return success;
}

// Main test function
async function testHomepageEnhancements() {
  logger.info("STARTING HOMEPAGE ENHANCEMENTS TEST");
  
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
  const analyticsDashboardSuccess = testEnhancedAnalyticsDashboard();
  const footerSuccess = testGlobalFooter();
  
  // Summary
  logger.info("TEST SUMMARY");
  
  if (qrExamplesSuccess) {
    logger.success("QR Examples Test: PASSED");
  } else {
    logger.error("QR Examples Test: FAILED");
  }
  
  if (analyticsDashboardSuccess) {
    logger.success("Enhanced Analytics Dashboard Test: PASSED");
  } else {
    logger.error("Enhanced Analytics Dashboard Test: FAILED");
  }
  
  if (footerSuccess) {
    logger.success("Global Footer Test: PASSED");
  } else {
    logger.error("Global Footer Test: FAILED");
  }
  
  const overallSuccess = qrExamplesSuccess && analyticsDashboardSuccess && footerSuccess;
  
  if (overallSuccess) {
    logger.success("ALL TESTS PASSED! The homepage enhancements are working correctly.");
  } else {
    logger.error("SOME TESTS FAILED. Please check the detailed logs above.");
  }
  
  return overallSuccess;
}

// Initialize
(function() {
  logger.info("Homepage enhancements test script loaded");
  logger.info("Run testHomepageEnhancements() to start the tests");
})();

// Export function for console access
window.testHomepageEnhancements = testHomepageEnhancements; 