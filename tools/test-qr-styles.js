/**
 * Test script for QR Code Styles and Colors
 * 
 * This script performs static code analysis to verify:
 * 1. All QR code styles apply colors correctly
 * 2. Support for various dot shapes and corner styles
 * 3. Proper color handling in the QR code components
 */

const fs = require('fs');
const path = require('path');

console.log('Starting QR Code Styles and Colors Test...');

// Create a simple test environment
let allTestsPassed = true;

// Extract the relevant parts from the QR code library
try {
  // Load the library code
  const qrcodeLib = fs.readFileSync(path.join(process.cwd(), 'src/lib/qrcode.ts'), 'utf8');
  
  // Extract the drawCustomQRCode function using a regex
  const drawFunctionRegex = /export async function drawCustomQRCode[\s\S]*?\}$/m;
  const drawFunctionMatch = qrcodeLib.match(drawFunctionRegex);
  
  // Extract the helper functions
  const drawRoundedSquareRegex = /function drawRoundedSquare[\s\S]*?\}$/m;
  const drawRoundedSquareMatch = qrcodeLib.match(drawRoundedSquareRegex);
  
  const drawCircleRegex = /function drawCircle[\s\S]*?\}$/m;
  const drawCircleMatch = qrcodeLib.match(drawCircleRegex);
  
  console.log('\nTesting QR code library implementation:');
  
  // Check if drawRoundedSquare applies color correctly
  if (drawRoundedSquareMatch && drawRoundedSquareMatch[0].includes('ctx.fillStyle = color')) {
    console.log('✅ drawRoundedSquare function properly applies the color parameter');
  } else {
    console.error('❌ drawRoundedSquare function doesn\'t properly apply the color parameter');
    allTestsPassed = false;
  }
  
  // Check if drawCircle applies color correctly
  if (drawCircleMatch && drawCircleMatch[0].includes('ctx.fillStyle = color')) {
    console.log('✅ drawCircle function properly applies the color parameter');
  } else {
    console.error('❌ drawCircle function doesn\'t properly apply the color parameter');
    allTestsPassed = false;
  }
  
  // Check if darkColor is passed to drawing functions in drawCustomQRCode
  if (drawFunctionMatch) {
    const drawFunctionCode = drawFunctionMatch[0];
    
    if (drawFunctionCode.includes('drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 3, darkColor)') &&
        drawFunctionCode.includes('drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor)')) {
      console.log('✅ drawCustomQRCode passes darkColor to helper functions correctly');
    } else {
      console.error('❌ drawCustomQRCode doesn\'t pass darkColor to helper functions correctly');
      allTestsPassed = false;
    }
  } else {
    console.error('❌ Could not find drawCustomQRCode function in library code');
    allTestsPassed = false;
  }
  
  // Check if proper style options are supported
  if (drawFunctionMatch) {
    const drawFunctionCode = drawFunctionMatch[0];
    
    // Check for all style handling
    const hasStyles = drawFunctionCode.includes("options.style?.dotShape") &&
                      drawFunctionCode.includes("options.style?.cornerShape") &&
                      drawFunctionCode.includes("options.style?.cornerDotStyle");
                      
    if (hasStyles) {
      console.log('✅ QR code library supports all style options (dotShape, cornerShape, cornerDotStyle)');
    } else {
      console.error('❌ QR code library is missing support for some style options');
      allTestsPassed = false;
    }
    
    // Check for rounded style
    if (drawFunctionCode.includes("case 'rounded'")) {
      console.log('✅ QR code library supports rounded style');
    } else {
      console.error('❌ QR code library is missing support for rounded style');
      allTestsPassed = false;
    }
    
    // Check for dots style
    if (drawFunctionCode.includes("case 'dots'")) {
      console.log('✅ QR code library supports dots style');
    } else {
      console.error('❌ QR code library is missing support for dots style');
      allTestsPassed = false;
    }
  }
  
  // Validate color handling in QRCodeDisplay component
  try {
    const displayComponentPath = path.join(process.cwd(), 'src/components/QRCodeDisplay.tsx');
    const displayCode = fs.readFileSync(displayComponentPath, 'utf8');
    
    // Check if the component properly structures color options
    if (displayCode.includes('color: {') && 
        displayCode.includes('dark: options.color?.dark') &&
        displayCode.includes('light: options.color?.light')) {
      console.log('✅ QRCodeDisplay component correctly structures color options');
    } else {
      console.error('❌ QRCodeDisplay component may not be correctly structuring color options');
      allTestsPassed = false;
    }
    
    // Check if the component handles style options
    if (displayCode.includes('style: options.style ?')) {
      console.log('✅ QRCodeDisplay component correctly structures style options');
    } else {
      console.error('❌ QRCodeDisplay component may not be correctly structuring style options');
      allTestsPassed = false;
    }
  } catch (error) {
    console.error(`❌ Error checking QRCodeDisplay component: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Check generateCustomQRCode function for color handling
  const generateCustomQRCodeRegex = /async function generateCustomQRCode[\s\S]*?\}$/m;
  const generateCustomQRCodeMatch = qrcodeLib.match(generateCustomQRCodeRegex);
  
  if (generateCustomQRCodeMatch) {
    const generateCode = generateCustomQRCodeMatch[0];
    
    if (generateCode.includes('dark: options.color?.dark') ||
        generateCode.includes('options.color?.dark ||')) {
      console.log('✅ generateCustomQRCode function properly handles dark color');
    } else {
      console.error('❌ generateCustomQRCode function may not properly handle dark color');
      allTestsPassed = false;
    }
    
    if (generateCode.includes('light: options.color?.light') ||
        generateCode.includes('options.color?.light ||')) {
      console.log('✅ generateCustomQRCode function properly handles light color');
    } else {
      console.error('❌ generateCustomQRCode function may not properly handle light color');
      allTestsPassed = false;
    }
  } else {
    console.error('❌ Could not find generateCustomQRCode function in library code');
    allTestsPassed = false;
  }
  
} catch (error) {
  console.error(`❌ Error testing QR code library: ${error.message}`);
  allTestsPassed = false;
}

// Final summary
if (allTestsPassed) {
  console.log('\n✅ All QR code style and color tests passed!');
  console.log('The QR code library should now render all styles with proper colors.');
} else {
  console.error('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
} 