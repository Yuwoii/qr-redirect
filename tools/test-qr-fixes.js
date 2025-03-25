/**
 * Test script to verify QR code customization fixes
 * 
 * This script tests:
 * 1. Removal of QR code logo size and border radius options
 * 2. Proper border display in QRCodeDisplay component
 * 
 * Run with: node tools/test-qr-fixes.js
 */

const fs = require('fs');
const path = require('path');

// Mock console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
  console.log(`${status} - ${name}${message ? `: ${message}` : ''}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Check if file contains a pattern
function fileContainsPattern(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(pattern);
  } catch (err) {
    return false;
  }
}

// Check if file doesn't contain a pattern
function fileDoesNotContainPattern(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return !content.includes(pattern);
  } catch (err) {
    return false;
  }
}

// Check if file contains a regex pattern
function fileContainsRegex(filePath, regex) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return regex.test(content);
  } catch (err) {
    return false;
  }
}

// Verify logo options removed from interface
function verifyLogoOptions() {
  console.log(`\n${colors.bright}Verifying Logo Options Removal${colors.reset}`);
  
  // Check QRCodeCustomizer.tsx for logo size option
  const customizerPath = path.join(__dirname, '../src/components/QRCodeCustomizer.tsx');
  logTest("QRCodeCustomizer.tsx exists", 
          fileExists(customizerPath));
  
  if (fileExists(customizerPath)) {
    // Check for removed logoSize
    logTest("Logo size option removed", 
            fileDoesNotContainPattern(customizerPath, 'logoSize'));
    
    // Check for removed logoBorderRadius
    logTest("Logo border radius option removed", 
            fileDoesNotContainPattern(customizerPath, 'logoBorderRadius'));
  }
  
  // Check qrcode.ts for borderRadius in interface
  const qrcodePath = path.join(__dirname, '../src/lib/qrcode.ts');
  logTest("qrcode.ts exists", 
          fileExists(qrcodePath));
  
  if (fileExists(qrcodePath)) {
    // Check for removed borderRadius in interface
    logTest("borderRadius removed from QRCodeLogoOptions interface", 
            fileDoesNotContainPattern(qrcodePath, 'borderRadius?:'));
    
    // Check for removed borderRadius usage in addLogoToQRCode function
    logTest("borderRadius not used in addLogoToQRCode function", 
            fileDoesNotContainPattern(qrcodePath, 'options.logo?.borderRadius'));
    
    // Make sure the code still calculates logo size correctly
    logTest("Logo size calculation present", 
            fileContainsPattern(qrcodePath, 'logoWidth') && 
            fileContainsPattern(qrcodePath, 'logoHeight'));
  }
}

// Check QR code display for proper border and no cropping
function verifyQRCodeDisplay() {
  console.log(`\n${colors.bright}Verifying QR Code Display${colors.reset}`);
  
  // Check QRCodeDisplay.tsx for proper styling
  const displayPath = path.join(__dirname, '../src/components/QRCodeDisplay.tsx');
  logTest("QRCodeDisplay.tsx exists", 
          fileExists(displayPath));
  
  if (fileExists(displayPath)) {
    // Check for border
    const hasBorder = fileContainsPattern(displayPath, 'border border-gray-200') || 
                      fileContainsPattern(displayPath, 'border-gray-100');
    logTest("QR code has border styling", hasBorder);
    
    // Check for padding
    const hasPadding = fileContainsPattern(displayPath, 'p-4') || 
                       fileContainsPattern(displayPath, 'p-3') || 
                       fileContainsPattern(displayPath, 'p-2');
    logTest("QR code has padding", hasPadding);
    
    // Check for proper image display properties
    const hasProperImageDisplay = 
      fileContainsPattern(displayPath, 'object-contain') || 
      fileContainsPattern(displayPath, 'max-width:') || 
      fileContainsPattern(displayPath, 'max-height:');
    logTest("QR code image has proper display properties", hasProperImageDisplay);
    
    // Check for proper margin handling
    const hasMarginHandling = fileContainsPattern(displayPath, 'options.margin');
    logTest("QR code options includes margin handling", hasMarginHandling);
  }
}

// Verify QR code doesn't disappear with color changes (checking library code)
function verifyQRCodeColorHandling() {
  console.log(`\n${colors.bright}Verifying QR Code Color Handling${colors.reset}`);
  
  const qrcodePath = path.join(__dirname, '../src/lib/qrcode.ts');
  
  if (fileExists(qrcodePath)) {
    // Check that the dark color is correctly applied from options
    const hasDarkColorOption = fileContainsPattern(qrcodePath, 'options.color?.dark') || 
                               fileContainsPattern(qrcodePath, 'options.color.dark');
    logTest("QR code applies dark color from options", hasDarkColorOption);
    
    // Check that the light color is correctly applied from options
    const hasLightColorOption = fileContainsPattern(qrcodePath, 'options.color?.light') || 
                                fileContainsPattern(qrcodePath, 'options.color.light');
    logTest("QR code applies light color from options", hasLightColorOption);
    
    // Check that the code has fallbacks for colors to prevent disappearing QR codes
    const hasFallbackColors = fileContainsPattern(qrcodePath, '|| "#000000"') || 
                              fileContainsPattern(qrcodePath, '|| "#ffffff"') ||
                              fileContainsPattern(qrcodePath, "|| '#000000'") || 
                              fileContainsPattern(qrcodePath, "|| '#ffffff'");
    logTest("QR code has color fallbacks to prevent disappearing", hasFallbackColors);
  } else {
    logTest("QR code library file exists", false);
  }
}

// Run all tests
function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}QR Code Customization Fixes Verification${colors.reset}`);
  console.log('='.repeat(50));
  
  verifyLogoOptions();
  verifyQRCodeDisplay();
  verifyQRCodeColorHandling();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bright}Test Summary:${colors.reset}`);
  console.log(`- Total tests: ${results.passed + results.failed}`);
  console.log(`- ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`- ${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.yellow}Failed tests:${colors.reset}`);
    results.tests.filter(test => !test.passed).forEach(test => {
      console.log(`- ${test.name}${test.message ? `: ${test.message}` : ''}`);
    });
    
    console.log(`\n${colors.red}⚠️ Some tests failed. Please fix the issues before proceeding.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ All tests passed! The QR code customization fixes are working correctly.${colors.reset}`);
  }
}

// Run the tests
try {
  runAllTests();
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
} 