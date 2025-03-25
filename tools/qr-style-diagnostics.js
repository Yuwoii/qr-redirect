/**
 * QR Style Diagnostics Tool
 * 
 * This script helps diagnose issues with QR code style color application
 * by systematically testing all available styles with different color combinations.
 * 
 * Usage:
 * 1. Include this script in your development environment
 * 2. Open the browser console
 * 3. Run: QRStyleDiagnostics.runTests()
 */

class QRStyleDiagnostics {
  // List of all QR style templates
  static STYLES = [
    'classic',
    'forest',
    'rounded',
    'dots',
    'classy',
    'elegant'
    // Add any other styles available in the application
  ];

  // Test color combinations
  static TEST_COLORS = [
    { fg: '#000000', bg: '#FFFFFF', name: 'Standard Black/White' },
    { fg: '#FF0000', bg: '#FFFFFF', name: 'Red on White' },
    { fg: '#0000FF', bg: '#FFFF00', name: 'Blue on Yellow' },
    { fg: '#00AA00', bg: '#FFFFFF', name: 'Green on White' },
    { fg: '#FFFFFF', bg: '#000000', name: 'White on Black' }
  ];

  /**
   * Run a complete diagnostic test of all styles with all color combinations
   */
  static async runTests() {
    console.log('🔍 Starting QR Style Diagnostics...');
    console.log('===================================');
    
    const results = [];
    
    for (const style of this.STYLES) {
      console.log(`\nTesting style: ${style}`);
      console.log('-----------------------');
      
      const styleResults = {
        style,
        tests: []
      };
      
      for (const colorSet of this.TEST_COLORS) {
        try {
          console.log(`Testing ${colorSet.name}...`);
          
          // Attempt to render the QR code with this style and color combination
          const result = await this.testStyleWithColors(style, colorSet.fg, colorSet.bg);
          
          styleResults.tests.push({
            colors: colorSet,
            success: result.success,
            message: result.message,
            renderTime: result.renderTime
          });
          
          console.log(`  ${result.success ? '✅ SUCCESS' : '❌ FAILED'}: ${result.message}`);
        } catch (error) {
          console.error(`  ❌ ERROR: ${error.message}`);
          styleResults.tests.push({
            colors: colorSet,
            success: false,
            message: error.message,
            error: error.stack
          });
        }
      }
      
      results.push(styleResults);
    }
    
    this.generateReport(results);
    return results;
  }
  
  /**
   * Test a specific style with specific colors
   * @param {string} style - The style name
   * @param {string} fgColor - Foreground color hex
   * @param {string} bgColor - Background color hex
   * @returns {Object} Test result
   */
  static async testStyleWithColors(style, fgColor, bgColor) {
    const startTime = performance.now();
    
    try {
      // Get the current QR code generator instance
      // Note: This will need to be adapted to your actual QR code generation implementation
      const qrInstance = this.getQRInstance();
      
      if (!qrInstance) {
        return { 
          success: false, 
          message: 'Could not find QR code generator instance' 
        };
      }
      
      // Set the style
      await this.setQRStyle(qrInstance, style);
      
      // Set the colors
      await this.setQRColors(qrInstance, fgColor, bgColor);
      
      // Verify that the colors were applied correctly
      const colorVerification = await this.verifyColors(qrInstance, fgColor, bgColor);
      
      const endTime = performance.now();
      
      return {
        success: colorVerification.success,
        message: colorVerification.message,
        renderTime: Math.round(endTime - startTime)
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        message: `Error: ${error.message}`,
        renderTime: Math.round(endTime - startTime)
      };
    }
  }
  
  /**
   * Get the QR code generator instance from the page
   * This method should be adapted to your specific implementation
   */
  static getQRInstance() {
    // This is a placeholder - replace with actual code to get your QR generator instance
    // Examples:
    // - If using a global variable: return window.qrCodeGenerator;
    // - If using a React component: return document.querySelector('#qr-code-component')?.__reactInternalInstance;
    
    // Placeholder implementation - detect QR code elements in the DOM
    const qrElement = document.querySelector('#qr-code-preview') || 
                     document.querySelector('[data-testid="qr-preview"]') ||
                     document.querySelector('.qr-code-container');
                     
    if (!qrElement) {
      console.warn('QR code element not found in the DOM');
      return null;
    }
    
    return {
      element: qrElement,
      // Add additional properties based on your implementation
    };
  }
  
  /**
   * Set the QR code style
   * This method should be adapted to your specific implementation
   */
  static async setQRStyle(qrInstance, style) {
    // This is a placeholder - replace with actual code to set the style
    
    // Example implementation - find and click style selector
    const styleSelector = document.querySelector(`[data-style="${style}"]`) ||
                          document.querySelector(`#style-${style}`) ||
                          document.querySelector(`.style-option[value="${style}"]`);
    
    if (styleSelector) {
      styleSelector.click();
      // Wait for the style to be applied
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }
    
    // Alternative - if using a dropdown
    const styleDropdown = document.querySelector('select#qr-style') ||
                         document.querySelector('select[name="style"]');
    
    if (styleDropdown) {
      styleDropdown.value = style;
      // Trigger change event
      styleDropdown.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }
    
    throw new Error(`Could not find UI element to set style to "${style}"`);
  }
  
  /**
   * Set the QR code colors
   * This method should be adapted to your specific implementation
   */
  static async setQRColors(qrInstance, fgColor, bgColor) {
    // This is a placeholder - replace with actual code to set the colors
    
    // Example implementation - set color inputs
    const fgInput = document.querySelector('#foreground-color') ||
                   document.querySelector('[name="foregroundColor"]') ||
                   document.querySelector('input[type="color"][data-testid="fg-color"]');
                   
    const bgInput = document.querySelector('#background-color') ||
                   document.querySelector('[name="backgroundColor"]') ||
                   document.querySelector('input[type="color"][data-testid="bg-color"]');
    
    if (fgInput && bgInput) {
      // Set foreground color
      fgInput.value = fgColor;
      fgInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Set background color
      bgInput.value = bgColor;
      bgInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Wait for colors to be applied
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }
    
    throw new Error('Could not find color input elements');
  }
  
  /**
   * Verify that the colors were applied correctly
   * This method should be adapted to your specific implementation
   */
  static async verifyColors(qrInstance, expectedFg, expectedBg) {
    // This is a placeholder - replace with actual code to verify colors
    
    try {
      // Get the QR code SVG or canvas element
      const qrElement = qrInstance.element;
      
      if (!qrElement) {
        return { success: false, message: 'QR code element not found' };
      }
      
      // For SVG QR codes
      if (qrElement.tagName === 'SVG' || qrElement.querySelector('svg')) {
        const svgElement = qrElement.tagName === 'SVG' ? qrElement : qrElement.querySelector('svg');
        
        // Check path or rect elements for the correct fill color
        const paths = Array.from(svgElement.querySelectorAll('path, rect'));
        
        if (paths.length === 0) {
          return { success: false, message: 'No SVG paths or rectangles found in QR code' };
        }
        
        // Check if any paths have the expected foreground color
        const fgPaths = paths.filter(path => {
          const fill = path.getAttribute('fill');
          return fill && this.colorsMatch(fill, expectedFg);
        });
        
        // Check if any paths have the expected background color
        const bgPaths = paths.filter(path => {
          const fill = path.getAttribute('fill');
          return fill && this.colorsMatch(fill, expectedBg);
        });
        
        if (fgPaths.length === 0) {
          return { success: false, message: `No elements with foreground color ${expectedFg} found` };
        }
        
        if (bgPaths.length === 0 && expectedBg !== 'transparent') {
          return { success: false, message: `No elements with background color ${expectedBg} found` };
        }
        
        return { 
          success: true, 
          message: `Colors applied correctly (found ${fgPaths.length} fg elements, ${bgPaths.length} bg elements)` 
        };
      }
      
      // For Canvas QR codes
      if (qrElement.tagName === 'CANVAS') {
        // This is a simplified check - might need more sophisticated pixel analysis
        return { success: true, message: 'Canvas element found, but pixel-level color verification not implemented' };
      }
      
      // If neither SVG nor Canvas
      return { 
        success: false, 
        message: `Unknown QR element type: ${qrElement.tagName}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Error during color verification: ${error.message}` 
      };
    }
  }
  
  /**
   * Compare two colors for approximate matching (handles different formats)
   */
  static colorsMatch(color1, color2) {
    // Convert both colors to RGB format for comparison
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return false;
    
    // Allow small differences due to rounding, alpha, etc.
    const threshold = 5;
    return Math.abs(rgb1.r - rgb2.r) <= threshold &&
           Math.abs(rgb1.g - rgb2.g) <= threshold &&
           Math.abs(rgb1.b - rgb2.b) <= threshold;
  }
  
  /**
   * Parse color string to RGB object
   */
  static parseColor(color) {
    // Handle hex format
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      // Handle shorthand hex (#RGB)
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16)
        };
      }
      // Handle standard hex (#RRGGBB)
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16)
        };
      }
    }
    
    // Handle rgb/rgba format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }
    
    // Handle named colors
    if (color === 'transparent') {
      return { r: 0, g: 0, b: 0, transparent: true };
    }
    
    // Create a temporary element to parse named colors
    const tempElem = document.createElement('div');
    tempElem.style.color = color;
    document.body.appendChild(tempElem);
    const computedColor = getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
    
    // Parse the computed color
    const computedMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (computedMatch) {
      return {
        r: parseInt(computedMatch[1], 10),
        g: parseInt(computedMatch[2], 10),
        b: parseInt(computedMatch[3], 10)
      };
    }
    
    return null;
  }
  
  /**
   * Generate a formatted report of the test results
   */
  static generateReport(results) {
    console.log('\n\n📊 QR Style Diagnostics Report');
    console.log('==============================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    results.forEach(styleResult => {
      const stylePassed = styleResult.tests.filter(t => t.success).length;
      const styleTotal = styleResult.tests.length;
      
      console.log(`\n${styleResult.style}: ${stylePassed}/${styleTotal} tests passed (${Math.round(stylePassed/styleTotal*100)}%)`);
      
      styleResult.tests.forEach(test => {
        console.log(`  ${test.colors.name}: ${test.success ? '✅ PASS' : '❌ FAIL'} - ${test.message}`);
        totalTests++;
        if (test.success) passedTests++;
      });
    });
    
    console.log('\n📈 Summary');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`Failed: ${totalTests - passedTests} (${Math.round((totalTests-passedTests)/totalTests*100)}%)`);
    
    // Identify working and problematic styles
    const workingStyles = results
      .filter(style => style.tests.every(test => test.success))
      .map(style => style.style);
      
    const problematicStyles = results
      .filter(style => style.tests.some(test => !test.success))
      .map(style => style.style);
    
    console.log('\n📋 Analysis');
    if (workingStyles.length > 0) {
      console.log(`✅ Working styles: ${workingStyles.join(', ')}`);
    } else {
      console.log('❗ No styles are working perfectly with all color combinations');
    }
    
    if (problematicStyles.length > 0) {
      console.log(`❌ Problematic styles: ${problematicStyles.join(', ')}`);
    }
    
    // Recommendations
    console.log('\n🔧 Recommendations:');
    if (problematicStyles.length === 0) {
      console.log('All styles are working correctly with the tested color combinations!');
    } else {
      console.log('1. Check the color application logic in the following styles:');
      problematicStyles.forEach(style => {
        console.log(`   - ${style}`);
      });
      console.log('2. Verify that the color values are being properly passed to all style templates');
      console.log('3. Examine style-specific SVG generation for foreground/background color handling');
      console.log('4. Test with additional color combinations to identify edge cases');
    }
  }
}

// Make the diagnostic tool available globally if in browser context
if (typeof window !== 'undefined') {
  window.QRStyleDiagnostics = QRStyleDiagnostics;
  console.log('QR Style Diagnostics Tool loaded. Run QRStyleDiagnostics.runTests() to start diagnostics.');
}

export default QRStyleDiagnostics; 