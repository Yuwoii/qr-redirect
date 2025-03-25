/**
 * Homepage Updates Verification Script
 * 
 * This script verifies that the homepage updates have been implemented correctly:
 * 1. The classic-black QR code is being used instead of duplicate blue styles
 * 2. The analytics dashboard has working navigation buttons that toggle views
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Homepage Updates Verification');
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

// Test QR code previews
function testQRCodePreviews() {
  console.log('\n📊 Testing QR Code Preview Updates:');
  console.log('----------------------------------');
  
  // Check if classic-black.png exists in public directory
  const classicBlackPath = path.join(process.cwd(), 'public', 'verification-results', 'classic-black.png');
  const classicBlackExists = fileExists(classicBlackPath);
  console.log(`✓ Classic Black QR code exists in public directory: ${classicBlackExists ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check if the homepage references classic-black.png
  const homepagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const homepageExists = fileExists(homepagePath);
  
  let usesClassicBlack = false;
  if (homepageExists) {
    const homepageContent = fs.readFileSync(homepagePath, 'utf8');
    usesClassicBlack = homepageContent.includes('/verification-results/classic-black.png');
    console.log(`✓ Homepage references classic-black.png: ${usesClassicBlack ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log(`\n🏁 QR code preview test: ${classicBlackExists && usesClassicBlack ? '✅ PASSED' : '❌ FAILED'}`);
  return classicBlackExists && usesClassicBlack;
}

// Test analytics dashboard
function testAnalyticsDashboard() {
  console.log('\n📊 Testing Analytics Dashboard:');
  console.log('-----------------------------');
  
  const homepagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const homepageExists = fileExists(homepagePath);
  
  let hasAnalyticsComponent = false;
  let hasStateManagement = false;
  let hasSwissSystem = false;
  
  if (homepageExists) {
    const homepageContent = fs.readFileSync(homepagePath, 'utf8');
    
    // Check if the AnalyticsDashboardWithNavigation component exists
    hasAnalyticsComponent = homepageContent.includes('AnalyticsDashboardWithNavigation');
    console.log(`✓ Analytics dashboard component exists: ${hasAnalyticsComponent ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check if state management for toggling views is implemented
    hasStateManagement = homepageContent.includes('useState') && 
                          homepageContent.includes('currentView') && 
                          homepageContent.includes('setCurrentView');
    console.log(`✓ View toggle state management implemented: ${hasStateManagement ? '✅ PASS' : '❌ FAIL'}`);
    
    // Check if Swiss engagement system view is implemented
    hasSwissSystem = homepageContent.includes('Swiss Engagement System');
    console.log(`✓ Swiss engagement system view implemented: ${hasSwissSystem ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log(`\n🏁 Analytics dashboard test: ${hasAnalyticsComponent && hasStateManagement && hasSwissSystem ? '✅ PASSED' : '❌ FAILED'}`);
  return hasAnalyticsComponent && hasStateManagement && hasSwissSystem;
}

// Run tests and summarize results
function runAllTests() {
  console.log('\n🚀 Running all verification tests...');
  
  const qrPreviewTestPassed = testQRCodePreviews();
  const analyticsDashboardTestPassed = testAnalyticsDashboard();
  
  console.log('\n📋 Test Summary:');
  console.log('----------------');
  console.log(`QR Code Preview Updates: ${qrPreviewTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Analytics Dashboard Updates: ${analyticsDashboardTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = qrPreviewTestPassed && analyticsDashboardTestPassed;
  console.log(`\n🔎 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Execute all tests
runAllTests(); 