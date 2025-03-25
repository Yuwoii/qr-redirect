const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const qrcode = require('qrcode-generator');

// Define some options similar to our actual implementation
const defaultOptions = {
  width: 200,
  margin: 1,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#ffffff'
  },
  style: {
    dotShape: 'square',
    cornerShape: 'square',
    cornerDotStyle: 'square'
  }
};

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
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  
  // Fill the path with the specified color
  ctx.fill();
  
  // Restore context state
  ctx.restore();
}

// Recreate our drawCustomQRCode function in a simplified way
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
  
  // Fill background
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, (options.width || 300), (options.width || 300));
  
  // Draw each module
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Check if this module should be drawn (is dark)
      if (qrData.modules[row][col]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        
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
        
        // Draw based on style
        if (options.style?.dotShape === 'dots' || 
            (isCornerDot && options.style?.cornerDotStyle === 'dot')) {
          // Draw circle
          drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor);
        } else if (options.style?.dotShape === 'rounded' || 
                  (isCorner && options.style?.cornerShape === 'rounded')) {
          // Draw rounded square
          drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 4, darkColor);
        } else {
          // Default: square
          ctx.fillStyle = darkColor;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }
  }
}

// Function to sample multiple pixels to find a dark module
function findDarkModule(ctx, canvas, expectedColor) {
  // Sample positions (try more positions to catch modules)
  const positions = [
    { x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2) }, // center
    { x: 30, y: 30 }, // top-left
    { x: canvas.width - 30, y: 30 }, // top-right
    { x: 30, y: canvas.height - 30 }, // bottom-left
    { x: 50, y: 50 },
    { x: 70, y: 70 },
    { x: 90, y: 90 },
    { x: 110, y: 110 },
    { x: 130, y: 130 },
    { x: 150, y: 150 },
    { x: 30, y: canvas.height / 2 },
    { x: canvas.width / 2, y: 30 },
  ];
  
  // First check all positions for an exact color match
  for (const pos of positions) {
    // Sample a 3x3 area
    const sampleSize = 3;
    const imageData = ctx.getImageData(
      pos.x - Math.floor(sampleSize / 2), 
      pos.y - Math.floor(sampleSize / 2), 
      sampleSize, 
      sampleSize
    );
    
    // Calculate average RGB
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = sampleSize * sampleSize;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      totalR += imageData.data[i];
      totalG += imageData.data[i + 1];
      totalB += imageData.data[i + 2];
    }
    
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);
    
    const actualColor = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
    
    // Check if this color is similar to the expected color
    const normalizedExpected = expectedColor.toLowerCase();
    const normalizedActual = actualColor.toLowerCase();
    
    if (isColorSimilar(normalizedActual, normalizedExpected, 40)) {
      return {
        position: pos,
        color: actualColor,
        match: true
      };
    }
  }
  
  // If we didn't find an exact match, look for any dark module
  for (const pos of positions) {
    const sampleSize = 3;
    const imageData = ctx.getImageData(
      pos.x - Math.floor(sampleSize / 2), 
      pos.y - Math.floor(sampleSize / 2), 
      sampleSize, 
      sampleSize
    );
    
    // Calculate average RGB
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = sampleSize * sampleSize;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      totalR += imageData.data[i];
      totalG += imageData.data[i + 1];
      totalB += imageData.data[i + 2];
    }
    
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);
    
    // Check if this is a dark module (not white/light background)
    // Using a relaxed threshold since some "dark" colors might not be very dark
    const maxRGB = Math.max(avgR, avgG, avgB);
    if (maxRGB < 240) {
      return {
        position: pos,
        color: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`,
        match: false
      };
    }
  }
  
  // If we can't find any non-white pixel, return null
  return null;
}

// Run the test
async function testQRLibrary() {
  console.log('Testing QR library implementation...');
  
  // Test all style combinations
  const styles = [
    { name: 'Classic', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'square' },
    { name: 'Rounded', dotShape: 'rounded', cornerShape: 'rounded', cornerDotStyle: 'square' },
    { name: 'Dots', dotShape: 'dots', cornerShape: 'square', cornerDotStyle: 'dot' },
    { name: 'Hybrid', dotShape: 'square', cornerShape: 'rounded', cornerDotStyle: 'dot' },
  ];
  
  const colors = [
    { name: 'Black', dark: '#000000', light: '#FFFFFF' },
    { name: 'Blue', dark: '#0063B3', light: '#E6F0FF' },
    { name: 'Purple', dark: '#7E22CE', light: '#F5F3FF' },
  ];
  
  // Track results
  let passCount = 0;
  let totalTests = 0;
  
  for (const style of styles) {
    for (const color of colors) {
      try {
        totalTests++;
        console.log(`Testing ${style.name} style with ${color.name} color`);
        
        // Create a canvas
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext('2d');
        
        // Generate QR code with qrcode-generator
        const qr = qrcode(0, 'M');
        qr.addData(`https://example.com/test/${style.name}/${color.name}`);
        qr.make();
        
        // Convert to our format
        const moduleCount = qr.getModuleCount();
        const modules = [];
        for (let row = 0; row < moduleCount; row++) {
          modules[row] = [];
          for (let col = 0; col < moduleCount; col++) {
            modules[row][col] = qr.isDark(row, col);
          }
        }
        
        // Create options
        const options = {
          ...defaultOptions,
          color: {
            dark: color.dark,
            light: color.light,
          },
          style: {
            dotShape: style.dotShape,
            cornerShape: style.cornerShape,
            cornerDotStyle: style.cornerDotStyle,
          },
        };
        
        // Draw QR code
        await drawCustomQRCode(ctx, { modules }, options);
        
        // Save the image
        const filename = `qr-${style.name.toLowerCase()}-${color.name.toLowerCase()}.png`;
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filename, buffer);
        console.log(`Saved to ${filename}`);
        
        // Analyze colors
        const darkModule = findDarkModule(ctx, canvas, color.dark);
        
        if (!darkModule) {
          console.error('❌ Could not find any dark module in the generated QR code');
          continue;
        }
        
        console.log(`Found pixel at (${darkModule.position.x}, ${darkModule.position.y})`);
        console.log(`Expected color: ${color.dark}`);
        console.log(`Actual color: ${darkModule.color}`);
        
        // If the module has a match property, use it
        let isMatch = false;
        if (darkModule.hasOwnProperty('match')) {
          isMatch = darkModule.match;
        } else {
          // Otherwise do the comparison manually
          const normalizedExpected = color.dark.toLowerCase();
          const normalizedActual = darkModule.color.toLowerCase();
          isMatch = normalizedActual === normalizedExpected || isColorSimilar(normalizedActual, normalizedExpected);
        }
        
        if (isMatch) {
          console.log('✅ Color matches expectation');
          passCount++;
        } else {
          console.log('❌ Color does not match expectation');
          
          // Try to analyze why - check if we can find the expected color anywhere
          const allPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let matchingPixels = 0;
          let totalPixels = 0;
          
          // Sample every 5th pixel to save time
          for (let i = 0; i < allPixels.length; i += 20) {
            const r = allPixels[i];
            const g = allPixels[i + 1];
            const b = allPixels[i + 2];
            // Skip white/very light pixels
            if (r > 240 && g > 240 && b > 240) continue;
            
            totalPixels++;
            const pixelColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            if (isColorSimilar(pixelColor, color.dark, 50)) {
              matchingPixels++;
            }
          }
          
          if (totalPixels > 0) {
            const matchPercentage = Math.round((matchingPixels / totalPixels) * 100);
            console.log(`Found ${matchingPixels}/${totalPixels} (${matchPercentage}%) dark pixels with matching color`);
          } else {
            console.log('No dark pixels found in the entire image');
          }
        }
        
        console.log('---');
        
      } catch (error) {
        console.error(`Error testing ${style.name} with ${color.name}:`, error);
      }
    }
  }
  
  // Print summary
  console.log(`\nTest Summary:`);
  console.log(`Passed: ${passCount}/${totalTests} (${Math.round((passCount/totalTests)*100)}%)`);
  console.log('All tests completed');
}

// Check if two colors are similar with custom threshold
function isColorSimilar(color1, color2, customThreshold = 30) {
  // Remove # if present
  color1 = color1.replace('#', '');
  color2 = color2.replace('#', '');
  
  // Convert to RGB
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);
  
  // Calculate color difference (using a simple Euclidean distance)
  const colorDiff = Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
  
  // Colors are similar if the difference is less than our threshold
  const threshold = customThreshold;
  return colorDiff <= threshold;
}

// Run the tests
testQRLibrary().catch(err => {
  console.error('Error in tests:', err);
}); 