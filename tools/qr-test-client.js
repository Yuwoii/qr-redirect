/**
 * QR Code Test Client
 * 
 * This script helps test and verify QR code generation and color application
 * in the browser. It can be run in the browser console to diagnose issues.
 * 
 * Usage:
 * 1. Copy this entire script
 * 2. Open the browser console on the QR test page
 * 3. Paste and run
 * 4. Call runQRTest() to execute tests
 */

function runQRTest() {
  console.log("Starting QR Code Test...");
  
  // Test basic page structure
  const testDivs = document.querySelectorAll('.test-grid .test-cell');
  if (testDivs.length === 0) {
    console.error("❌ No QR code test cells found. Is the test page loaded?");
    return;
  }
  
  console.log(`✅ Found ${testDivs.length} QR test cells`);
  
  // Check QR image rendering
  const qrImages = document.querySelectorAll('img[alt*="QR code"]');
  if (qrImages.length === 0) {
    console.error("❌ No QR code images found. Generation may have failed.");
    testImageGeneration();
    return;
  }
  
  console.log(`✅ Found ${qrImages.length} QR code images`);
  
  // Check QR image sources
  let brokenImages = 0;
  let dataUrlImages = 0;
  qrImages.forEach(img => {
    if (!img.complete || img.naturalHeight === 0) {
      brokenImages++;
    }
    if (img.src.startsWith('data:image/')) {
      dataUrlImages++;
    }
  });
  
  if (brokenImages > 0) {
    console.error(`❌ ${brokenImages} broken QR images detected`);
  } else {
    console.log("✅ All QR images loaded successfully");
  }
  
  console.log(`✅ ${dataUrlImages} QR images using data URLs`);
  
  // Test color extraction
  const colorTests = testColorExtraction(qrImages);
  
  // Output final verdict
  if (colorTests.matchCount === 0) {
    console.error("❌ No QR codes with matching colors found. Color application is likely failing.");
  } else if (colorTests.matchCount < colorTests.total * 0.5) {
    console.warn(`⚠️ Only ${colorTests.matchCount}/${colorTests.total} QR codes have matching colors. Partial failure.`);
  } else {
    console.log(`✅ ${colorTests.matchCount}/${colorTests.total} QR codes have matching colors (${Math.round(colorTests.matchCount/colorTests.total*100)}%)`);
  }
  
  // Try regenerating a QR code programmatically
  testProgrammaticGeneration();
  
  return {
    totalTests: qrImages.length,
    brokenImages,
    dataUrlImages,
    colorMatches: colorTests.matchCount,
    colorTotal: colorTests.total
  };
}

/**
 * Test color extraction from QR code images
 */
function testColorExtraction(qrImages) {
  console.log("Testing color extraction from QR codes...");
  
  // Create a temporary canvas for image analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  let total = 0;
  let matchCount = 0;
  
  // Test a subset of images for performance
  const samplesToTest = Math.min(qrImages.length, 10);
  
  for (let i = 0; i < samplesToTest; i++) {
    const img = qrImages[i];
    if (!img.complete || img.naturalHeight === 0) continue;
    
    // Try to find the expected color
    const parentElement = img.closest('[data-expected-color]') || 
                          img.closest('[data-dark-color]') ||
                          img.parentElement;
    
    // Extract expected color from data attributes or nearby elements
    let expectedColor = null;
    if (parentElement) {
      expectedColor = parentElement.dataset.expectedColor || 
                     parentElement.dataset.darkColor;
                     
      if (!expectedColor) {
        // Try to find a color display element
        const colorElement = parentElement.querySelector('.expected-color') ||
                            parentElement.querySelector('[data-color]');
        if (colorElement) {
          expectedColor = colorElement.dataset.color || 
                         colorElement.textContent || 
                         window.getComputedStyle(colorElement).backgroundColor;
        }
      }
    }
    
    // If we couldn't find an expected color, skip this test
    if (!expectedColor) {
      console.log(`Skipping color test for QR code #${i+1} - no expected color found`);
      continue;
    }
    
    total++;
    
    // Draw the image to canvas for pixel analysis
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    
    // Check colors in key positions (center, corners)
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const positions = [
      { x: centerX, y: centerY, name: "center" },
      { x: 10, y: 10, name: "top-left" },
      { x: canvas.width - 10, y: 10, name: "top-right" },
      { x: 10, y: canvas.height - 10, name: "bottom-left" }
    ];
    
    // Look for a dark module
    let foundMatch = false;
    let pixelColors = {};
    
    for (const pos of positions) {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hexColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
      pixelColors[pos.name] = hexColor;
      
      // Check if this is a dark module (average RGB < 128)
      const isDark = (pixel[0] + pixel[1] + pixel[2]) / 3 < 128;
      if (isDark) {
        // Compare with expected color
        const colorMatch = compareColors(hexColor, expectedColor);
        if (colorMatch) {
          foundMatch = true;
          break;
        }
      }
    }
    
    if (foundMatch) {
      matchCount++;
      console.log(`✅ QR code #${i+1} has matching colors`);
    } else {
      console.warn(`⚠️ QR code #${i+1} has mismatched colors`);
      console.log('Expected:', expectedColor);
      console.log('Found pixels:', pixelColors);
    }
  }
  
  return { total, matchCount };
}

/**
 * Compare two colors with some tolerance
 */
function compareColors(color1, color2) {
  // Normalize colors to hex without #
  color1 = color1.replace('#', '').toLowerCase();
  color2 = color2.replace('#', '').toLowerCase();
  
  // Handle short hex format
  if (color1.length === 3) {
    color1 = color1[0] + color1[0] + color1[1] + color1[1] + color1[2] + color1[2];
  }
  if (color2.length === 3) {
    color2 = color2[0] + color2[0] + color2[1] + color2[1] + color2[2] + color2[2];
  }
  
  // Convert to RGB
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);
  
  // Allow for some difference
  const threshold = 30;
  return Math.abs(r1 - r2) <= threshold && 
         Math.abs(g1 - g2) <= threshold && 
         Math.abs(b1 - b2) <= threshold;
}

/**
 * Test image generation directly
 */
function testImageGeneration() {
  console.log("Testing basic image generation...");
  
  try {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple colored square
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 100, 100);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create an image element
    const img = document.createElement('img');
    img.src = dataUrl;
    
    console.log("✅ Basic canvas image generation works");
    
    // Test image loading
    img.onload = () => {
      console.log("✅ Image loading from data URL works");
    };
    
    img.onerror = () => {
      console.error("❌ Image loading from data URL failed");
    };
    
    return true;
  } catch (error) {
    console.error("❌ Basic image generation failed:", error);
    return false;
  }
}

/**
 * Test programmatic QR code generation using the page's functions
 */
function testProgrammaticGeneration() {
  console.log("Testing programmatic QR code generation...");
  
  try {
    // Try to find the QR code generation function in window scope
    const qrModule = window.qrcode || window.QRCode;
    
    if (!qrModule) {
      console.warn("⚠️ QR code library not found in global scope. This is not necessarily an error.");
      return false;
    }
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Generate a simple QR code
    if (typeof qrModule === 'function') {
      // qrcode.js approach
      const qr = qrModule(0, 'M');
      qr.addData('https://example.com');
      qr.make();
      
      const moduleCount = qr.getModuleCount();
      const modules = [];
      
      for (let row = 0; row < moduleCount; row++) {
        modules[row] = [];
        for (let col = 0; col < moduleCount; col++) {
          modules[row][col] = qr.isDark(row, col);
        }
      }
      
      // Fill entire canvas with light color first
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw dark modules
      ctx.fillStyle = "#000000";
      const moduleSize = canvas.width / moduleCount;
      
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (modules[row][col]) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
          }
        }
      }
      
      console.log("✅ QR code generation successful");
      
      // Convert to data URL and display
      const dataUrl = canvas.toDataURL('image/png');
      console.log("Generated QR code:", dataUrl.substring(0, 100) + "...");
      
      return true;
    } else {
      console.warn("⚠️ Unsupported QR code library format");
      return false;
    }
  } catch (error) {
    console.error("❌ Programmatic QR code generation failed:", error);
    return false;
  }
}

// Execute the test immediately if we're in a browser
if (typeof window !== 'undefined') {
  console.log("QR Code Test Client loaded. Run runQRTest() to execute the tests.");
} else {
  console.log("This script is designed to run in a browser environment.");
}

// Make available globally
if (typeof window !== 'undefined') {
  window.runQRTest = runQRTest;
  window.testColorExtraction = testColorExtraction;
  window.testImageGeneration = testImageGeneration;
  window.testProgrammaticGeneration = testProgrammaticGeneration;
} 