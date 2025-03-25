/**
 * QR Code Customization Fix Test Script
 * 
 * This script tests the following fixes:
 * 1. QR code preview cropping issue (left and bottom sides)
 * 2. QR code disappearing when changing colors
 * 3. Removal of logo border radius and size options
 * 
 * To run this test:
 * - Execute from the browser console on the QR code customization page
 * - Ensure the page is correctly loading all components
 */

// Utility function to log with styling
const log = (message, type = 'info') => {
  const styles = {
    info: 'color: #3b82f6; font-weight: bold;',
    success: 'color: #10b981; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;',
    header: 'color: #8b5cf6; font-weight: bold; font-size: 14px;'
  };
  
  console.log(`%c${message}`, styles[type] || styles.info);
};

// Test preview container for proper sizing and padding
const testPreviewContainer = () => {
  log('TESTING PREVIEW CONTAINER', 'header');
  
  // Find the QR code preview container
  const previewContainer = document.querySelector('.bg-white.p-4.border.rounded-md.flex.justify-center.items-center');
  if (!previewContainer) {
    log('QR code preview container not found', 'error');
    return false;
  }
  
  // Check container dimensions
  const containerStyle = window.getComputedStyle(previewContainer);
  log(`Container width: ${containerStyle.width}`);
  log(`Container height: ${containerStyle.height}`);
  
  // Check for padding
  log(`Container padding: ${containerStyle.padding}`);
  
  // Verify container has sufficient size for QR code
  const hasProperWidth = parseInt(containerStyle.width) >= 320;
  const hasProperHeight = parseInt(containerStyle.height) >= 320;
  const hasProperPadding = parseInt(containerStyle.padding) >= 16; // 4 * 4px (1rem)
  
  log(`Container has proper width: ${hasProperWidth ? 'YES' : 'NO'}`, hasProperWidth ? 'success' : 'error');
  log(`Container has proper height: ${hasProperHeight ? 'YES' : 'NO'}`, hasProperHeight ? 'success' : 'error');
  log(`Container has proper padding: ${hasProperPadding ? 'YES' : 'NO'}`, hasProperPadding ? 'success' : 'error');
  
  // Verify the QR code image within the container
  const qrCodeImage = previewContainer.querySelector('img');
  if (!qrCodeImage) {
    log('QR code image not found', 'error');
    return false;
  }
  
  const imageStyle = window.getComputedStyle(qrCodeImage);
  log(`Image width: ${imageStyle.width}`);
  log(`Image height: ${imageStyle.height}`);
  
  // Verify image isn't cropped
  const hasProperImageWidth = parseInt(imageStyle.width) <= parseInt(containerStyle.width) - 32; // Account for padding
  const hasProperImageHeight = parseInt(imageStyle.height) <= parseInt(containerStyle.height) - 32;
  
  log(`Image has proper width (not cropped): ${hasProperImageWidth ? 'YES' : 'NO'}`, hasProperImageWidth ? 'success' : 'error');
  log(`Image has proper height (not cropped): ${hasProperImageHeight ? 'YES' : 'NO'}`, hasProperImageHeight ? 'success' : 'error');
  
  return hasProperWidth && hasProperHeight && hasProperPadding && hasProperImageWidth && hasProperImageHeight;
};

// Test QR code visibility after color changes
const testColorChanges = async () => {
  log('TESTING COLOR CHANGES', 'header');
  
  // Find the color picker input for dark color
  const darkColorInput = document.querySelector('input[id="darkColor"]');
  if (!darkColorInput) {
    log('Dark color input not found', 'error');
    return false;
  }
  
  // Store original QR code data URL
  const originalQRCode = document.querySelector('.bg-white.p-4.border.rounded-md img');
  if (!originalQRCode) {
    log('Original QR code image not found', 'error');
    return false;
  }
  
  const originalSrc = originalQRCode.src;
  log('Original QR code found', 'success');
  
  // Test different colors
  const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
  let allTestsPassed = true;
  
  for (const color of testColors) {
    log(`Testing color: ${color}`);
    
    // Simulate changing the color input
    const inputEvent = new Event('input', { bubbles: true });
    darkColorInput.value = color;
    darkColorInput.dispatchEvent(inputEvent);
    
    // Wait for QR code to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if QR code is still visible
    const updatedQRCode = document.querySelector('.bg-white.p-4.border.rounded-md img');
    
    if (!updatedQRCode) {
      log('QR code disappeared after color change', 'error');
      allTestsPassed = false;
      continue;
    }
    
    if (!updatedQRCode.src || updatedQRCode.src === 'data:,') {
      log('QR code has invalid source after color change', 'error');
      allTestsPassed = false;
      continue;
    }
    
    // Verify the QR code changed (should have different data URL)
    const colorChangeWorked = updatedQRCode.src !== originalSrc;
    log(`Color change worked: ${colorChangeWorked ? 'YES' : 'NO'}`, colorChangeWorked ? 'success' : 'warning');
    
    // Check if QR code is visible (not empty/blank image)
    const imgVisibilityTest = await new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to check pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Check if the image has non-white pixels (QR code content)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Count non-white pixels
        let nonWhitePixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          // If not white (allowing some tolerance)
          if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
            nonWhitePixels++;
          }
        }
        
        // At least 5% of pixels should be non-white (QR code content)
        const totalPixels = canvas.width * canvas.height;
        const hasContent = nonWhitePixels / totalPixels > 0.05;
        
        resolve(hasContent);
      };
      img.onerror = () => resolve(false);
      img.src = updatedQRCode.src;
    });
    
    log(`QR code is visible with content: ${imgVisibilityTest ? 'YES' : 'NO'}`, imgVisibilityTest ? 'success' : 'error');
    
    if (!imgVisibilityTest) {
      allTestsPassed = false;
    }
  }
  
  // Reset to original color
  darkColorInput.value = '#000000';
  darkColorInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  return allTestsPassed;
};

// Test logo customization options removal
const testLogoOptions = () => {
  log('TESTING LOGO CUSTOMIZATION', 'header');
  
  // Ensure we're on the logo tab
  const logoTab = document.querySelector('button[value="logo"]');
  if (logoTab) {
    logoTab.click();
  } else {
    log('Logo tab not found', 'error');
    return false;
  }
  
  // Check for removed options
  const borderRadiusOption = document.querySelector('div[id="logoBorderRadius"]');
  const logoSizeOption = document.querySelector('div[id="logoSize"]');
  
  const borderRadiusRemoved = !borderRadiusOption;
  const logoSizeRemoved = !logoSizeOption;
  
  log(`Border radius option removed: ${borderRadiusRemoved ? 'YES' : 'NO'}`, borderRadiusRemoved ? 'success' : 'error');
  log(`Logo size option removed: ${logoSizeRemoved ? 'YES' : 'NO'}`, logoSizeRemoved ? 'success' : 'error');
  
  // Check for remaining options
  const logoUploadOption = document.querySelector('input[id="logoUpload"]');
  const logoOpacityOption = document.querySelector('div[id="logoOpacity"]');
  const logoBorderOption = document.querySelector('button[id="logoBorder"]');
  
  const logoUploadExists = !!logoUploadOption;
  const logoOpacityExists = !!logoOpacityOption;
  const logoBorderExists = !!logoBorderOption;
  
  log(`Logo upload option exists: ${logoUploadExists ? 'YES' : 'NO'}`, logoUploadExists ? 'success' : 'error');
  log(`Logo opacity option exists: ${logoOpacityExists ? 'YES' : 'NO'}`, logoOpacityExists ? 'success' : 'error');
  log(`Logo border option exists: ${logoBorderExists ? 'YES' : 'NO'}`, logoBorderExists ? 'success' : 'error');
  
  return borderRadiusRemoved && logoSizeRemoved && logoUploadExists;
};

// Main test function
const runTests = async () => {
  log('STARTING QR CODE CUSTOMIZATION FIX TESTS', 'header');
  
  const previewTest = testPreviewContainer();
  log(`Preview container test: ${previewTest ? 'PASSED' : 'FAILED'}`, previewTest ? 'success' : 'error');
  
  const colorTest = await testColorChanges();
  log(`Color change test: ${colorTest ? 'PASSED' : 'FAILED'}`, colorTest ? 'success' : 'error');
  
  const logoTest = testLogoOptions();
  log(`Logo options test: ${logoTest ? 'PASSED' : 'FAILED'}`, logoTest ? 'success' : 'error');
  
  const allPassed = previewTest && colorTest && logoTest;
  
  log('=============================================', 'header');
  log(`OVERALL TEST RESULT: ${allPassed ? 'PASSED' : 'FAILED'}`, allPassed ? 'success' : 'error');
  log('=============================================', 'header');
  
  return allPassed;
};

// Execute tests
runTests().then(result => {
  console.log(`Test completed with result: ${result ? 'Success' : 'Failure'}`);
}); 