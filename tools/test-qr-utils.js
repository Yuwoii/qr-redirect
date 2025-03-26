
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
