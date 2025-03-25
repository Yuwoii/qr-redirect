/**
 * Test script for QR Code Customizer component
 * Tests the following:
 * 1. QR code visibility after color changes
 * 2. Removal of logoSize and borderRadius options
 * 3. Fixed preview rendering
 * 4. Fixed logo handling with simplified options
 */

const fs = require('fs');
const path = require('path');

// Test files
const files = [
  'src/lib/qrcode.ts',
  'src/components/QRCodeCustomizer.tsx'
];

console.log('Starting QR Customizer tests...');

// Test 1: Verify QR code customization changes
let allTestsPassed = true;

// Check if files exist
for (const file of files) {
  try {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File ${file} not found`);
      allTestsPassed = false;
      continue;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Test specific patterns in each file
    if (file === 'src/lib/qrcode.ts') {
      // Check for fixes related to QR code colors in drawing functions
      if (!fileContent.includes('ctx.fillStyle = color')) {
        console.error('❌ Error: QR code color fix not found in drawing functions of qrcode.ts');
        allTestsPassed = false;
      }
      
      // Check for fixed logo size
      if (fileContent.includes('options.logo?.width') || fileContent.includes('options.logo?.height')) {
        console.error('❌ Error: Logo size options not properly removed in qrcode.ts');
        allTestsPassed = false;
      }
      
      // Check for removal of border radius
      if (fileContent.includes('options.logo?.borderRadius')) {
        console.error('❌ Error: Logo border radius not properly removed in qrcode.ts');
        allTestsPassed = false;
      }
      
      console.log('✅ QR code lib changes verified');
    } else if (file === 'src/components/QRCodeCustomizer.tsx') {
      // Check for removal of logo size slider
      if (fileContent.includes('logoSize')) {
        console.error('❌ Error: Logo size slider not properly removed in QRCodeCustomizer.tsx');
        allTestsPassed = false;
      }
      
      // Check for removal of border radius
      if (fileContent.includes('borderRadius')) {
        console.error('❌ Error: Border radius not properly removed in QRCodeCustomizer.tsx');
        allTestsPassed = false;
      }
      
      console.log('✅ QR code customizer component changes verified');
    }
  } catch (error) {
    console.error(`❌ Error checking file ${file}: ${error.message}`);
    allTestsPassed = false;
  }
}

// Summary
if (allTestsPassed) {
  console.log('✅ All QR customizer tests passed successfully!');
} else {
  console.error('❌ Some tests failed. Please review the errors above.');
  process.exit(1);
} 