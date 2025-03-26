/**
 * Browser QR Code Test Script
 * 
 * This script can be copied and pasted into the browser console on the QR code customization page
 * to test if all styles and colors work correctly.
 * 
 * Usage:
 * 1. Open the QR code customization page in your browser
 * 2. Open the browser console (F12 or right-click > Inspect > Console)
 * 3. Copy and paste this entire script into the console
 * 4. Run testQRStyles() to test all combinations
 */

function testQRStyles() {
  console.log('Starting QR Style and Color Test...');
  console.log('===================================');
  
  // Find the QR code customizer component
  const customizer = document.querySelector('.qr-code-customizer') || document.body;
  if (!customizer) {
    console.error('❌ Could not find QR code customizer component');
    return;
  }
  
  // Get style selector buttons
  const styleButtons = Array.from(
    document.querySelectorAll('[data-style]') ||
    document.querySelectorAll('.style-option') ||
    document.querySelectorAll('.qr-style-button')
  );
  
  if (styleButtons.length === 0) {
    console.error('❌ Could not find style selector buttons');
    return;
  }
  
  console.log(`✅ Found ${styleButtons.length} style options`);
  
  // Get color theme buttons
  const colorButtons = Array.from(
    document.querySelectorAll('[data-color]') ||
    document.querySelectorAll('.color-theme') ||
    document.querySelectorAll('.color-option')
  );
  
  if (colorButtons.length === 0) {
    console.error('❌ Could not find color theme buttons');
    return;
  }
  
  console.log(`✅ Found ${colorButtons.length} color options`);
  
  // Check if color picker inputs exist
  const darkColorInput = document.querySelector('#darkColor') || 
                       document.querySelector('[name="darkColor"]');
  
  const lightColorInput = document.querySelector('#lightColor') || 
                        document.querySelector('[name="lightColor"]');
  
  // Find the QR code preview element
  const qrPreview = document.querySelector('img[alt="QR Code Preview"]') ||
                   document.querySelector('.qr-preview') ||
                   document.querySelector('.qr-code-preview');
  
  if (!qrPreview) {
    console.error('❌ Could not find QR code preview element');
    return;
  }
  
  // Set up test data
  const testColors = [
    { name: 'Black', dark: '#000000', light: '#ffffff' },
    { name: 'Forest Green', dark: '#0F766E', light: '#F0FDFA' },
    { name: 'Red', dark: '#B91C1C', light: '#FEF2F2' },
    { name: 'Blue', dark: '#1E40AF', light: '#EFF6FF' },
    { name: 'Purple', dark: '#7E22CE', light: '#FAF5FF' }
  ];
  
  // Create a results container
  const resultContainer = document.createElement('div');
  resultContainer.style.position = 'fixed';
  resultContainer.style.top = '20px';
  resultContainer.style.right = '20px';
  resultContainer.style.width = '300px';
  resultContainer.style.height = '500px';
  resultContainer.style.backgroundColor = 'white';
  resultContainer.style.border = '1px solid #ccc';
  resultContainer.style.borderRadius = '5px';
  resultContainer.style.padding = '10px';
  resultContainer.style.overflow = 'auto';
  resultContainer.style.zIndex = '9999';
  resultContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  resultContainer.innerHTML = `
    <h3 style="margin-top: 0; text-align: center;">QR Style & Color Test</h3>
    <div class="test-results"></div>
    <div style="text-align: center; margin-top: 10px;">
      <button id="close-test-results" style="padding: 5px 10px;">Close</button>
    </div>
  `;
  document.body.appendChild(resultContainer);
  
  // Add close button functionality
  document.getElementById('close-test-results').addEventListener('click', () => {
    document.body.removeChild(resultContainer);
  });
  
  const testResults = resultContainer.querySelector('.test-results');
  
  // Run tests asynchronously
  runTests(styleButtons, testColors, testResults);
  
  return {
    styleCount: styleButtons.length,
    colorCount: testColors.length
  };
}

async function runTests(styleButtons, testColors, resultsContainer) {
  let allPassed = true;
  let totalTests = 0;
  let passedTests = 0;
  
  for (const styleButton of styleButtons) {
    // Get style name
    const styleName = styleButton.getAttribute('data-style') ||
                     styleButton.textContent.trim() ||
                     'Unknown Style';
    
    console.log(`\nTesting style: ${styleName}`);
    resultsContainer.innerHTML += `<h4>Style: ${styleName}</h4>`;
    
    // Click the style button to select it
    styleButton.click();
    await wait(500); // Wait for style to apply
    
    // Test each color with this style
    for (const color of testColors) {
      console.log(`Testing with ${color.name} color...`);
      
      try {
        totalTests++;
        
        // Apply the test color
        await applyColor(color.dark, color.light);
        await wait(800); // Wait for QR code to update
        
        // Check if QR code preview exists and is visible
        const qrPreview = document.querySelector('img[alt="QR Code Preview"]') ||
                         document.querySelector('.qr-preview') ||
                         document.querySelector('.qr-code-preview');
        
        if (!qrPreview || !isElementVisible(qrPreview)) {
          throw new Error('QR code preview not visible after color change');
        }
        
        if (qrPreview.naturalWidth === 0 || qrPreview.naturalHeight === 0) {
          throw new Error('QR code preview failed to load');
        }
        
        // Take a screenshot of the QR code
        const qrImage = await getImageThumbnail(qrPreview);
        
        // Success!
        passedTests++;
        console.log(`✅ ${styleName} with ${color.name} color works!`);
        resultsContainer.innerHTML += `
          <div style="margin-bottom: 10px; display: flex; align-items: center;">
            <span style="color: green; margin-right: 5px;">✓</span>
            <span>${color.name}</span>
            <div style="margin-left: 10px; width: 20px; height: 20px; background-color: ${color.dark}; border: 1px solid #ccc;"></div>
            ${qrImage ? `<img src="${qrImage}" style="margin-left: 10px; width: 40px; height: 40px; border: 1px solid #eee;">` : ''}
          </div>
        `;
      } catch (error) {
        allPassed = false;
        console.error(`❌ ${styleName} with ${color.name} color failed: ${error.message}`);
        resultsContainer.innerHTML += `
          <div style="margin-bottom: 10px; color: red;">
            ✗ ${color.name}: ${error.message}
          </div>
        `;
      }
    }
  }
  
  // Final summary
  console.log('\n===================================');
  if (allPassed) {
    console.log(`✅ All tests passed! (${passedTests}/${totalTests})`);
  } else {
    console.error(`❌ Some tests failed. (${passedTests}/${totalTests} passed)`);
  }
  
  resultsContainer.innerHTML += `
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; text-align: center; font-weight: bold;">
      ${allPassed 
        ? `<span style="color: green;">✅ All ${passedTests} tests passed!</span>` 
        : `<span style="color: orange;">⚠️ ${passedTests}/${totalTests} tests passed</span>`
      }
    </div>
  `;
}

// Helper function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to apply a color
async function applyColor(darkColor, lightColor) {
  // First try to find color input fields
  const darkInput = document.querySelector('#darkColor') || 
                   document.querySelector('[name="darkColor"]');
  
  const lightInput = document.querySelector('#lightColor') || 
                    document.querySelector('[name="lightColor"]');
  
  if (darkInput && lightInput) {
    // Set input values and trigger change events
    darkInput.value = darkColor;
    lightInput.value = lightColor;
    
    // Trigger change events
    darkInput.dispatchEvent(new Event('change', { bubbles: true }));
    lightInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    await wait(300); // Wait for changes to apply
    return;
  }
  
  // If no inputs found, try color theme buttons
  const colorButtons = Array.from(
    document.querySelectorAll('[data-color]') ||
    document.querySelectorAll('.color-theme') ||
    document.querySelectorAll('.color-option')
  );
  
  // Find button with matching dark color
  const matchingButton = colorButtons.find(button => {
    const buttonDark = button.getAttribute('data-dark-color') || 
                       button.getAttribute('data-color') ||
                       '';
    return buttonDark.toLowerCase() === darkColor.toLowerCase();
  });
  
  if (matchingButton) {
    matchingButton.click();
    await wait(300); // Wait for changes to apply
    return;
  }
  
  // If still nothing worked, throw error
  throw new Error('Could not apply colors');
}

// Helper function to check if element is visible
function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

// Helper function to create a thumbnail of an image
function getImageThumbnail(imgElement) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 40;
    canvas.height = 40;
    
    // Draw the image scaled down
    ctx.drawImage(imgElement, 0, 0, 40, 40);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return null;
  }
}

// Call this function to run the tests
// testQRStyles(); 