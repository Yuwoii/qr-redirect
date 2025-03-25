/**
 * QR Redirect Homepage Updates Verification
 * ----------------------------------------
 * This script verifies the server-side aspects of the homepage updates,
 * checking that images are accessible and the application is functioning properly.
 * 
 * Run this script with Node.js:
 * node tools/verify-homepage-updates.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');
const { promisify } = require('util');

// Use color to make logs easier to read
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logger
const logger = {
  info: (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),
  warning: (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`),
  step: (message) => console.log(`${colors.magenta}[STEP]${colors.reset} ${message}`),
  spacer: () => console.log('')
};

// Configuration
const config = {
  appUrl: 'http://localhost:3000',
  imagePaths: [
    '/style-previews/classic.svg', 
    '/style-previews/rounded.svg', 
    '/style-previews/dots.svg', 
    '/style-previews/hybrid.svg'
  ],
  expectedStrings: [
    'Elevate Your Brand with Dynamic QR Codes',
    'Beautiful QR Codes That Stand Out',
    'Premium Features, Elegant Experience',
    'Make Data-Driven Decisions',
    'Simple Process, Powerful Results',
    'Ready to Transform Your QR Experience'
  ],
  publicDir: path.join(process.cwd(), 'public')
};

// Verify that image files exist in the public directory
async function verifyImageFiles() {
  logger.step('Verifying image files in the public directory');
  
  let success = true;
  
  for (const imagePath of config.imagePaths) {
    const fullPath = path.join(config.publicDir, imagePath);
    
    try {
      const stat = await promisify(fs.stat)(fullPath);
      
      if (stat.isFile()) {
        logger.success(`Image exists: ${imagePath} (${stat.size} bytes)`);
      } else {
        logger.error(`Path exists but is not a file: ${imagePath}`);
        success = false;
      }
    } catch (error) {
      logger.error(`Image does not exist or cannot be accessed: ${imagePath}`);
      logger.error(`  Error: ${error.message}`);
      success = false;
    }
  }
  
  logger.spacer();
  return success;
}

// Make an HTTP request and get response
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Check that homepage content is correct
async function verifyHomepageContent() {
  logger.step('Verifying homepage content');
  
  try {
    const response = await makeRequest(config.appUrl);
    
    if (response.statusCode !== 200) {
      logger.error(`Homepage returned status code ${response.statusCode}`);
      return false;
    }
    
    logger.success(`Homepage loaded successfully (status code ${response.statusCode})`);
    
    // Check for expected strings in the HTML
    let missingStrings = [];
    
    for (const expectedString of config.expectedStrings) {
      if (!response.body.includes(expectedString)) {
        missingStrings.push(expectedString);
      }
    }
    
    if (missingStrings.length > 0) {
      logger.error(`Homepage is missing expected content:`);
      missingStrings.forEach(str => logger.error(`  - "${str}"`));
      return false;
    }
    
    logger.success('All expected content found on homepage');
    
    // Check for image references in the HTML
    let missingImages = [];
    
    for (const imagePath of config.imagePaths) {
      if (!response.body.includes(imagePath)) {
        missingImages.push(imagePath);
      }
    }
    
    if (missingImages.length > 0) {
      logger.error(`Homepage is missing references to images:`);
      missingImages.forEach(img => logger.error(`  - "${img}"`));
      return false;
    }
    
    logger.success('All image references found on homepage');
    
    // Check for duplicate copyright
    const copyrightMatches = response.body.match(/QR Redirect\. All rights reserved/g);
    if (!copyrightMatches) {
      logger.error('No copyright notice found on homepage');
      return false;
    } else if (copyrightMatches.length > 1) {
      logger.error(`Found ${copyrightMatches.length} copyright notices instead of just one`);
      return false;
    } else {
      logger.success('Exactly one copyright notice found on homepage');
    }
    
    logger.spacer();
    return true;
  } catch (error) {
    logger.error(`Failed to check homepage content: ${error.message}`);
    logger.spacer();
    return false;
  }
}

// Check that images are accessible via HTTP
async function verifyImageAccess() {
  logger.step('Verifying image accessibility via HTTP');
  
  let success = true;
  
  for (const imagePath of config.imagePaths) {
    const imageUrl = `${config.appUrl}${imagePath}`;
    
    try {
      const response = await makeRequest(imageUrl);
      
      if (response.statusCode === 200) {
        logger.success(`Image accessible: ${imagePath}`);
        
        // Check Content-Type header
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('svg')) {
          logger.success(`  Content-Type: ${contentType}`);
        } else {
          logger.warning(`  Unexpected Content-Type: ${contentType}`);
        }
        
        // Check Content-Length header
        const contentLength = response.headers['content-length'];
        if (contentLength) {
          logger.success(`  Content-Length: ${contentLength} bytes`);
        }
      } else {
        logger.error(`Image inaccessible: ${imagePath} (status code ${response.statusCode})`);
        success = false;
      }
    } catch (error) {
      logger.error(`Failed to access image ${imagePath}: ${error.message}`);
      success = false;
    }
  }
  
  logger.spacer();
  return success;
}

// Check if the server is running
async function isServerRunning() {
  try {
    await makeRequest(config.appUrl);
    return true;
  } catch (error) {
    return false;
  }
}

// Run all verification steps
async function runVerification() {
  logger.info('Starting homepage updates verification');
  logger.spacer();
  
  // First, make sure the app is running
  const serverRunning = await isServerRunning();
  if (!serverRunning) {
    logger.warning('The app server does not appear to be running.');
    logger.warning(`Cannot access ${config.appUrl}`);
    logger.warning('Start the server with "npm run dev" and run this script again.');
    return false;
  }
  
  // Run the verification steps
  const imageFilesOk = await verifyImageFiles();
  const homepageContentOk = await verifyHomepageContent();
  const imageAccessOk = await verifyImageAccess();
  
  // Summary
  logger.step('VERIFICATION SUMMARY');
  
  if (imageFilesOk) {
    logger.success('✓ Image files verification: PASSED');
  } else {
    logger.error('✗ Image files verification: FAILED');
  }
  
  if (homepageContentOk) {
    logger.success('✓ Homepage content verification: PASSED');
  } else {
    logger.error('✗ Homepage content verification: FAILED');
  }
  
  if (imageAccessOk) {
    logger.success('✓ Image accessibility verification: PASSED');
  } else {
    logger.error('✗ Image accessibility verification: FAILED');
  }
  
  const overallSuccess = imageFilesOk && homepageContentOk && imageAccessOk;
  
  logger.spacer();
  if (overallSuccess) {
    logger.success('All verification checks PASSED!');
    logger.success('The homepage updates have been successfully applied.');
  } else {
    logger.error('Some verification checks FAILED.');
    logger.error('Please review the issues reported above.');
  }
  
  return overallSuccess;
}

// Self-executing function
(async () => {
  try {
    const success = await runVerification();
    process.exit(success ? 0 : 1);
  } catch (error) {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  }
})(); 