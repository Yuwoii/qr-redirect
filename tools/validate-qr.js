const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const qrcode = require('qrcode-generator');

// Create a simple test
async function validateQRGeneration() {
  console.log('Validating QR code generation...');
  
  // Create a canvas
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  try {
    // Generate QR code
    const qr = qrcode(0, 'M');
    qr.addData('https://example.com/test');
    qr.make();
    
    // Get module count
    const moduleCount = qr.getModuleCount();
    console.log(`QR code generated with ${moduleCount} modules`);
    
    // Convert format
    const modules = [];
    for (let row = 0; row < moduleCount; row++) {
      modules[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        modules[row][col] = qr.isDark(row, col);
      }
    }
    
    // Validate module data
    let darkModules = 0;
    let totalModules = 0;
    
    for (let row = 0; row < modules.length; row++) {
      for (let col = 0; col < modules[row].length; col++) {
        totalModules++;
        if (modules[row][col]) {
          darkModules++;
        }
      }
    }
    
    console.log(`Total modules: ${totalModules}`);
    console.log(`Dark modules: ${darkModules} (${Math.round(darkModules/totalModules*100)}%)`);
    
    // Draw modules directly
    const moduleSize = canvas.width / moduleCount;
    
    // Draw the QR code
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          const x = col * moduleSize;
          const y = row * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('qr-validation.png', buffer);
    console.log('QR code saved to qr-validation.png');
    
    // Test a rounded style
    const roundedCanvas = createCanvas(200, 200);
    const roundedCtx = roundedCanvas.getContext('2d');
    
    // Clear canvas with white background
    roundedCtx.fillStyle = '#FFFFFF';
    roundedCtx.fillRect(0, 0, roundedCanvas.width, roundedCanvas.height);
    
    // Draw rounded dots
    roundedCtx.fillStyle = '#7E22CE'; // Purple
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          const x = col * moduleSize;
          const y = row * moduleSize;
          const radius = moduleSize / 2;
          const centerX = x + radius;
          const centerY = y + radius;
          
          roundedCtx.beginPath();
          roundedCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          roundedCtx.fill();
        }
      }
    }
    
    // Save the rounded image
    const roundedBuffer = roundedCanvas.toBuffer('image/png');
    fs.writeFileSync('qr-validation-rounded.png', roundedBuffer);
    console.log('Rounded QR code saved to qr-validation-rounded.png');
    
    console.log('QR code validation complete!');
    
  } catch (error) {
    console.error('QR code validation failed:', error);
  }
}

// Run the validation
validateQRGeneration().catch(err => {
  console.error('Error in validation:', err);
}); 