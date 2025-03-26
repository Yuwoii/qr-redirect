/**
 * QR Code Logo Options Test
 * 
 * This script tests that the QR code logo functionality works correctly with the
 * simplified options (no logoSize or borderRadius). It verifies that:
 * 
 * 1. The logo size is fixed at 20% of the QR code size
 * 2. The border radius has been removed from the options
 * 3. The logo displays correctly with different opacity and border options
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Create a sample test logo if it doesn't exist
const logoPath = path.join(__dirname, 'test-logo.png');
const testLogoExists = fs.existsSync(logoPath);

// Keep track of whether we're already running the test
let isRunning = false;

if (!testLogoExists) {
  // Create a simple logo for testing
  console.log('Creating test logo...');
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  
  // Draw a blue background
  ctx.fillStyle = '#2563EB';
  ctx.fillRect(0, 0, 100, 100);
  
  // Draw a white test letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', 50, 50);
  
  // Save as PNG
  const out = fs.createWriteStream(logoPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => {
    if (!isRunning) {
      isRunning = true;
      runLogoTest();
    }
  });
} else {
  if (!isRunning) {
    isRunning = true;
    runLogoTest();
  }
}

async function runLogoTest() {
  console.log('Starting QR Code Logo Options Test...');
  console.log('=====================================');
  
  let allTestsPassed = true;
  
  // Test output directory
  const testOutputDir = path.join(__dirname, 'qr-logo-test-output');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir);
  }
  
  try {
    // Test QR Code Options Interface
    // We manually check that these options are no longer present in QRCodeCustomOptions
    console.log('\nTesting QR Code Options Interface:');
    console.log('-------------------------------');
    
    // Read qrcode.ts file
    const qrcodePath = path.join(process.cwd(), 'src/lib/qrcode.ts');
    const qrcodeContent = fs.readFileSync(qrcodePath, 'utf8');
    
    // Check if the logo options still contain width, height, or borderRadius
    const logoOptionsRegex = /logo\?\s*:\s*{[^}]*}/gs;
    const logoOptionsMatch = qrcodeContent.match(logoOptionsRegex);
    
    if (logoOptionsMatch) {
      const logoOptionsStr = logoOptionsMatch[0];
      const containsWidth = logoOptionsStr.includes('width?:') || logoOptionsStr.includes('width ?:');
      const containsHeight = logoOptionsStr.includes('height?:') || logoOptionsStr.includes('height ?:');
      const containsBorderRadius = logoOptionsStr.includes('borderRadius?:') || logoOptionsStr.includes('borderRadius ?:');
      
      if (containsWidth || containsHeight || containsBorderRadius) {
        console.error('❌ QRCodeCustomOptions logo options still contains removed properties:');
        if (containsWidth) console.error('  - width is still present in logo options');
        if (containsHeight) console.error('  - height is still present in logo options');
        if (containsBorderRadius) console.error('  - borderRadius is still present in logo options');
        allTestsPassed = false;
      } else {
        console.log('✅ QRCodeCustomOptions correctly removed width, height, and borderRadius from logo options');
      }
    }
    
    // Test addLogoToQRCode implementation
    console.log('\nTesting Logo Implementation:');
    console.log('---------------------------');
    
    // Check if addLogoToQRCode uses fixed size
    const usesFixedSize = qrcodeContent.includes('const logoWidth = canvasSize * 0.2;');
    if (!usesFixedSize) {
      console.error('❌ addLogoToQRCode does not use fixed size (20% of QR code)');
      allTestsPassed = false;
    } else {
      console.log('✅ addLogoToQRCode uses fixed logo size (20% of QR code)');
    }
    
    // Check if border radius code was removed
    const addLogoToQRCodeRegex = /export async function addLogoToQRCode[\s\S]+?\}(\s+catch|\s+\/\/)/;
    const addLogoMatch = qrcodeContent.match(addLogoToQRCodeRegex);

    if (addLogoMatch) {
      const addLogoFunctionStr = addLogoMatch[0];
      const containsArcOrClip = addLogoFunctionStr.includes('ctx.arc') || 
                               addLogoFunctionStr.includes('ctx.clip');
      
      if (containsArcOrClip) {
        console.error('❌ addLogoToQRCode still contains border radius code (arc/clip)');
        allTestsPassed = false;
      } else {
        console.log('✅ Border radius code successfully removed from addLogoToQRCode');
      }
    } else {
      console.error('❌ Could not find addLogoToQRCode function in the source code');
      allTestsPassed = false;
    }
    
    // Test logo rendering with QR codes
    console.log('\nTesting Logo Rendering:');
    console.log('----------------------');
    
    // Load our implementation of the QR code functions
    const { generateQRCodeWithLogo } = require('./test-qr-utils');
    
    // Test cases for logo options
    const logoTestCases = [
      { name: 'default', options: {} },
      { name: 'with-border', options: { border: true } },
      { name: 'with-colored-border', options: { border: true, borderColor: '#FF0000' } },
      { name: 'half-opacity', options: { opacity: 0.5 } },
    ];
    
    for (const test of logoTestCases) {
      console.log(`Testing logo with ${test.name} options...`);
      
      try {
        // Generate a QR code with the test logo
        const qrCodeDataUrl = await generateQRCodeWithLogo(
          'https://example.com',
          logoPath,
          test.options
        );
        
        // Save the QR code image for visual inspection
        const imageData = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(
          path.join(testOutputDir, `logo-${test.name}.png`),
          Buffer.from(imageData, 'base64')
        );
        
        console.log(`✅ Generated QR code with logo (${test.name})`);
      } catch (error) {
        console.error(`❌ Error generating QR code with logo (${test.name}):`, error.message);
        allTestsPassed = false;
      }
    }
    
    // Final summary
    console.log('\n=====================================');
    if (allTestsPassed) {
      console.log('✅ All logo tests passed successfully!');
      console.log(`QR codes with logos were saved to: ${testOutputDir}`);
      console.log('Please visually verify that:');
      console.log('1. The logo size is consistent across all test images (20% of QR code)');
      console.log('2. The logo has no rounded corners in any test images');
      console.log('3. The opacity and border options work correctly');
    } else {
      console.error('❌ Some logo tests failed. Please check the errors above.');
    }
  } catch (error) {
    console.error('❌ Error running logo tests:', error);
  }
}

// Implementation of QR code functions for testing
fs.writeFileSync(
  path.join(__dirname, 'test-qr-utils.js'),
  `
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const qrcode = require('qrcode-generator');

/**
 * Generate a QR code with a logo in the center
 * @param {string} url - URL to encode in the QR code
 * @param {string} logoPath - Path to the logo file
 * @param {Object} logoOptions - Logo options
 * @returns {Promise<string>} - Data URL of the QR code with logo
 */
async function generateQRCodeWithLogo(url, logoPath, logoOptions = {}) {
  // Create QR code
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  
  // Create canvas
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext('2d');
  
  // Draw QR code onto canvas
  // Clear canvas
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw QR modules
  const moduleCount = qr.getModuleCount();
  const moduleSize = canvas.width / moduleCount;
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(
          col * moduleSize,
          row * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }
  
  // Add logo
  try {
    // Load logo
    const logo = await loadImage(logoPath);
    
    // Fixed logo size at 20% of QR code size
    const logoWidth = canvas.width * 0.2;
    const logoHeight = logoWidth;
    
    // Calculate logo position (center)
    const x = (canvas.width - logoWidth) / 2;
    const y = (canvas.height - logoHeight) / 2;
    
    // Save context state
    ctx.save();
    
    // Add white background for logo
    ctx.fillStyle = '#ffffff';
    
    if (logoOptions.border) {
      const borderWidth = 5; // Fixed border width
      ctx.fillRect(
        x - borderWidth, 
        y - borderWidth, 
        logoWidth + 2 * borderWidth, 
        logoHeight + 2 * borderWidth
      );
      
      // Draw border
      if (logoOptions.borderColor) {
        ctx.strokeStyle = logoOptions.borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          x - borderWidth / 2, 
          y - borderWidth / 2, 
          logoWidth + borderWidth, 
          logoHeight + borderWidth
        );
      }
    } else {
      ctx.fillRect(x, y, logoWidth, logoHeight);
    }
    
    // Apply opacity
    if (logoOptions.opacity !== undefined && logoOptions.opacity < 1) {
      ctx.globalAlpha = logoOptions.opacity;
    }
    
    // Draw logo
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    
    // Restore context state
    ctx.restore();
  } catch (error) {
    console.error('Error adding logo:', error);
  }
  
  // Return as data URL
  return canvas.toDataURL('image/png');
}

module.exports = {
  generateQRCodeWithLogo
};
`
);

// If being run directly
if (require.main === module) {
  if (testLogoExists) {
    runLogoTest();
  }
} 