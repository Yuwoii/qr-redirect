/**
 * Logo and QR Code Preview Implementation Test
 * 
 * This script verifies that the new logo and QR code previews
 * from the verification-results directory are correctly implemented.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Logo and QR Code Preview Test');
console.log('=========================================');

// Function to check if file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Test logo implementation
function testLogoImplementation() {
  console.log('\n📊 Testing Logo Implementation:');
  console.log('----------------------------');
  
  const logoPath = path.join(process.cwd(), 'public', 'logo.svg');
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
  
  const logoExists = fileExists(logoPath);
  console.log(`✓ Main logo exists: ${logoExists ? '✅ PASS' : '❌ FAIL'}`);
  
  const faviconExists = fileExists(faviconPath);
  console.log(`✓ Favicon exists: ${faviconExists ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check logo file content
  if (logoExists) {
    const logoContent = fs.readFileSync(logoPath, 'utf8');
    const containsGradient = logoContent.includes('bg-gradient');
    console.log(`✓ Logo has proper gradient: ${containsGradient ? '✅ PASS' : '❌ FAIL'}`);
    
    const containsQRElements = logoContent.includes('QR Code Elements');
    console.log(`✓ Logo has QR code elements: ${containsQRElements ? '✅ PASS' : '❌ FAIL'}`);
    
    const containsRedirectArrow = logoContent.includes('Arrow Indicating Redirection');
    console.log(`✓ Logo has redirect arrow: ${containsRedirectArrow ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log(`\n🏁 Logo implementation test: ${logoExists && faviconExists ? '✅ PASSED' : '❌ FAILED'}`);
  return logoExists && faviconExists;
}

// Test QR code preview implementation
function testQRCodePreviews() {
  console.log('\n📊 Testing QR Code Previews Implementation:');
  console.log('----------------------------------------');
  
  const previewFiles = [
    'classic-blue.png',
    'rounded-green.png',
    'dots-purple.png',
    'corner dots-red.png',
    'rounded-purple.png',
    'hybrid-blue.png'
  ];
  
  const verificationResultsDir = path.join(process.cwd(), 'verification-results');
  
  // Check if verification-results directory exists
  const dirExists = fs.existsSync(verificationResultsDir);
  console.log(`✓ Verification results directory exists: ${dirExists ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!dirExists) {
    return false;
  }
  
  // Check if all preview files exist
  let allFilesExist = true;
  for (const file of previewFiles) {
    const filePath = path.join(verificationResultsDir, file);
    const exists = fileExists(filePath);
    console.log(`✓ Preview file ${file}: ${exists ? '✅ PASS' : '❌ FAIL'}`);
    if (!exists) {
      allFilesExist = false;
    }
  }
  
  // Check homepage implementation
  const homepagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const homepageExists = fileExists(homepagePath);
  
  let homepageUsesNewPreviews = false;
  if (homepageExists) {
    const homepageContent = fs.readFileSync(homepagePath, 'utf8');
    homepageUsesNewPreviews = previewFiles.every(file => 
      homepageContent.includes(`/verification-results/${file}`)
    );
    console.log(`✓ Homepage references new previews: ${homepageUsesNewPreviews ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log(`\n🏁 QR code previews test: ${allFilesExist && homepageUsesNewPreviews ? '✅ PASSED' : '❌ FAILED'}`);
  return allFilesExist && homepageUsesNewPreviews;
}

// Run tests and summarize results
function runAllTests() {
  console.log('\n🚀 Running all implementation tests...');
  
  const logoTestPassed = testLogoImplementation();
  const previewsTestPassed = testQRCodePreviews();
  
  console.log('\n📋 Test Summary:');
  console.log('----------------');
  console.log(`Logo Implementation: ${logoTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`QR Code Previews: ${previewsTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = logoTestPassed && previewsTestPassed;
  console.log(`\n🔎 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Execute all tests
runAllTests(); 