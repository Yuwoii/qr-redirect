/**
 * Comprehensive test runner for QR Redirect platform
 * 
 * This script runs all test scripts in sequence to verify:
 * 1. QR code customizer functionality 
 * 2. QR code rendering with different colors and styles
 * 3. Login system integrity
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Starting comprehensive testing of QR Redirect platform...\n');

const tests = [
  {
    name: 'QR Code Customizer Changes',
    script: 'tools/test-qr-customizer.js',
    description: 'Verifies the changes made to QR code customizer component and library'
  },
  {
    name: 'QR Code Rendering',
    script: 'tools/test-qr-customizer-interaction.js',
    description: 'Tests QR code rendering with different colors and styles'
  },
  {
    name: 'Login Functionality',
    script: 'tools/test-login.js',
    description: 'Verifies the login system is intact'
  }
];

let allPassed = true;
const testResults = [];

// Run each test and record result
for (const test of tests) {
  console.log(`\n🧪 Running test: ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Run the test script using execSync
    const output = execSync(`node ${test.script}`, { encoding: 'utf8' });
    console.log(output);
    testResults.push({ name: test.name, passed: true, output });
  } catch (error) {
    console.error(`❌ Test failed: ${test.name}`);
    console.error(error.stdout);
    allPassed = false;
    testResults.push({ name: test.name, passed: false, output: error.stdout });
  }
}

// Print summary
console.log('\n📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
testResults.forEach(result => {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
});

// Final verdict
if (allPassed) {
  console.log('\n🎉 All tests passed! The QR Redirect platform is working correctly.');
  console.log('The QR code customizer has been successfully modified to:');
  console.log('1. Fix the issue with QR codes becoming invisible after color changes');
  console.log('2. Remove the logo size and border radius options');
  console.log('3. Simplify the logo handling with a fixed size of 20% of the QR code');
  console.log('4. Ensure all components render correctly');
} else {
  console.error('\n⚠️ Some tests failed. Please review the test output above.');
  process.exit(1);
} 