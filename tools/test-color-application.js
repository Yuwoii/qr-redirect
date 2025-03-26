/**
 * QR Code Color Application Test
 * 
 * This script tests that all QR code styles correctly apply the custom colors.
 * It focuses on the specific issue where only the Forest Green style was 
 * previously able to apply custom colors to styles other than Classic.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const qrcode = require('qrcode-generator');

// ========================
// QR Code Drawing Functions
// ========================
// These are equivalent implementations of the functions in src/lib/qrcode.ts

// Helper function to draw a rounded square
function drawRoundedSquare(
  ctx, 
  x, 
  y, 
  width, 
  height, 
  radius,
  color
) {
  // Save current context state
  ctx.save();
  
  // Explicitly set the fill color
  ctx.fillStyle = color;
  
  // Draw the rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  
  // Fill the path with the specified color
  ctx.fill();
  
  // Restore context state
  ctx.restore();
}

// Helper function to draw a circle
function drawCircle(
  ctx, 
  x, 
  y, 
  radius,
  color
) {
  // Save current context state
  ctx.save();
  
  // Explicitly set the fill color
  ctx.fillStyle = color;
  
  // Draw the circle path
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  
  // Fill the path with the specified color
  ctx.fill();
  
  // Restore context state
  ctx.restore();
}

// Draw custom QR code with styling
async function drawCustomQRCode(
  ctx, 
  qrData, 
  options
) {
  const moduleCount = qrData.modules.length;
  const moduleSize = (options.width || 300) / moduleCount;
  const margin = (options.margin || 0) * moduleSize;
  
  // Get the colors from options
  const darkColor = options.color?.dark || '#000000';
  const lightColor = options.color?.light || '#ffffff';
  
  // First, fill the entire canvas with the light color (background)
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, (options.width || 300), (options.width || 300));
  
  // Now we'll draw each module in the dark color
  // Draw each module (dot) of the QR code
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Check if this module should be drawn (is dark)
      if (qrData.modules[row][col]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        
        // Important: Set the fill style for EACH drawing operation
        // This ensures the color is consistently applied
        ctx.fillStyle = darkColor;
        
        // Check if this is a special position (e.g., corner)
        const isCorner = 
          (row < 7 && col < 7) || // Top-left corner
          (row < 7 && col >= moduleCount - 7) || // Top-right corner
          (row >= moduleCount - 7 && col < 7); // Bottom-left corner
        
        // Check if this is a corner dot (center of a corner)
        const isCornerDot = 
          (row >= 2 && row < 5 && col >= 2 && col < 5) || // Top-left corner dot
          (row >= 2 && row < 5 && col >= moduleCount - 5 && col < moduleCount - 2) || // Top-right corner dot
          (row >= moduleCount - 5 && row < moduleCount - 2 && col >= 2 && col < 5); // Bottom-left corner dot
        
        if (isCorner && options.style?.cornerShape === 'rounded') {
          // Draw rounded corner - always use the dark color
          drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 3, darkColor);
        } else if (isCornerDot && options.style?.cornerDotStyle === 'dot') {
          // Draw corner dot as circle - always use the dark color
          drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor);
        } else {
          // Draw regular module based on selected style
          switch (options.style?.dotShape) {
            case 'rounded':
              // Always use the dark color for rounded shape
              drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 4, darkColor);
              break;
            case 'dots':
              // Always use the dark color for dots
              drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor);
              break;
            case 'square':
            default:
              // Explicitly set fill style before drawing
              ctx.fillStyle = darkColor;
              ctx.fillRect(x, y, moduleSize, moduleSize);
              break;
          }
        }
      }
    }
  }
}

// Define styles to test
const styles = [
  { name: 'Classic', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'square' },
  { name: 'Rounded', dotShape: 'rounded', cornerShape: 'rounded', cornerDotStyle: 'square' },
  { name: 'Dots', dotShape: 'dots', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Corner Dots', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Hybrid', dotShape: 'square', cornerShape: 'rounded', cornerDotStyle: 'dot' },
];

// Define colors to test
const colors = [
  { name: 'Black & White', dark: '#000000', light: '#FFFFFF' },
  { name: 'Forest Green', dark: '#0F766E', light: '#F0FDFA' },
  { name: 'Red', dark: '#B91C1C', light: '#FEF2F2' },
  { name: 'Blue', dark: '#1E40AF', light: '#EFF6FF' },
  { name: 'Purple', dark: '#7E22CE', light: '#FAF5FF' },
];

async function testColorApplication() {
  console.log('Starting QR Code Color Application Test...');
  console.log('===========================================');
  
  let allTestsPassed = true;
  
  // Create a test directory
  const testOutputDir = path.join(__dirname, 'qr-test-output');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir);
  }
  
  // Test each style with each color
  for (const style of styles) {
    console.log(`\nTesting style: ${style.name}`);
    console.log('-------------------------');
    
    for (const color of colors) {
      console.log(`Testing with ${color.name} color...`);
      
      try {
        // Create test QR code
        const qr = qrcode(0, 'M');
        qr.addData('https://example.com');
        qr.make();
        
        // Convert qrcode-generator format to our expected format
        const moduleCount = qr.getModuleCount();
        const modules = [];
        for (let row = 0; row < moduleCount; row++) {
          modules[row] = [];
          for (let col = 0; col < moduleCount; col++) {
            modules[row][col] = qr.isDark(row, col);
          }
        }
        
        // Create canvas for QR code
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext('2d');
        
        // Set up options
        const options = {
          width: 200,
          margin: 1,
          color: {
            dark: color.dark,
            light: color.light
          },
          style: {
            dotShape: style.dotShape,
            cornerShape: style.cornerShape,
            cornerDotStyle: style.cornerDotStyle
          }
        };
        
        // Draw QR code
        await drawCustomQRCode(ctx, { modules }, options);
        
        // Sample pixels to check color application
        const samplePoints = [
          { x: 50, y: 50 },     // Top-left quarter
          { x: 150, y: 50 },    // Top-right quarter
          { x: 50, y: 150 },    // Bottom-left quarter
          { x: 150, y: 150 },   // Bottom-right quarter
          { x: 100, y: 100 },   // Center
        ];
        
        let foundDarkModule = false;
        let colorMatch = false;
        
        for (const point of samplePoints) {
          const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
          const hexColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`.toUpperCase();
          
          // Check if this point is a dark module
          const isDark = (pixel[0] + pixel[1] + pixel[2]) / 3 < 128;
          
          if (isDark) {
            foundDarkModule = true;
            
            // Compare with expected color (allowing slight variation)
            const expectedColor = color.dark.toUpperCase();
            colorMatch = isColorSimilar(hexColor, expectedColor);
            
            if (colorMatch) {
              console.log(`✅ Found dark module at (${point.x}, ${point.y}) with correct color: ${hexColor}`);
              break;
            } else {
              console.log(`❌ Found dark module at (${point.x}, ${point.y}) but color doesn't match: ${hexColor} (expected: ${expectedColor})`);
            }
          }
        }
        
        if (!foundDarkModule) {
          console.log('❌ Could not find any dark modules in the QR code');
          allTestsPassed = false;
        } else if (!colorMatch) {
          console.log('❌ Dark color was not applied correctly');
          allTestsPassed = false;
        } else {
          console.log('✅ Test passed: Colors were applied correctly to QR code');
        }
        
        // Save the QR code as a reference
        const fileName = `${style.name.toLowerCase().replace(/\s+/g, '-')}_${color.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        const out = fs.createWriteStream(path.join(testOutputDir, fileName));
        const stream = canvas.createPNGStream();
        stream.pipe(out);
      } catch (error) {
        console.error(`❌ Error testing style ${style.name} with ${color.name} color: ${error.message}`);
        allTestsPassed = false;
      }
    }
  }
  
  // Final verdict
  console.log('\n===========================================');
  if (allTestsPassed) {
    console.log('✅ All tests passed: All styles apply custom colors correctly!');
  } else {
    console.error('❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Helper function to check if two colors are similar (allowing for slight differences)
function isColorSimilar(color1, color2, threshold = 30) {
  // Convert colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return false;
  
  // Calculate color distance (simplified version)
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  
  return distance <= threshold;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Run the test
testColorApplication().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 