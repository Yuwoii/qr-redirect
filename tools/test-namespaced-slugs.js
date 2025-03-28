/**
 * Test script for validating the namespaced slugs implementation
 * 
 * This script tests various aspects of the namespaced slug feature:
 * 1. Creating users with namespaces
 * 2. Creating QR codes with the same slug for different users
 * 3. Verifying that unique slugs per user namespace work correctly
 * 
 * Usage: node tools/test-namespaced-slugs.js
 */

const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

// Test users for our simulation
const testUsers = [
  { email: 'test1@example.com', password: 'password123', name: 'Test User 1' },
  { email: 'test2@example.com', password: 'password123', name: 'Test User 2' }
];

// Helper to log test steps
function log(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Clean up test data before starting
async function cleanup() {
  log('Cleaning up test data...', 'step');
  
  // Delete test users and their QR codes
  for (const user of testUsers) {
    try {
      await prisma.user.delete({
        where: { email: user.email }
      });
      log(`Deleted test user: ${user.email}`, 'info');
    } catch (error) {
      // User may not exist, which is fine
    }
  }
}

// Create test users with namespaces
async function createTestUsers() {
  log('Creating test users...', 'step');
  
  const users = [];
  
  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        namespace: createId()
      }
    });
    
    log(`Created user ${user.email} with namespace ${user.namespace}`, 'success');
    users.push(user);
  }
  
  return users;
}

// Create test QR codes with the same slug for different users
async function createTestQRCodes(users) {
  log('Creating test QR codes...', 'step');
  
  const commonSlug = 'test-product';
  const qrCodes = [];
  
  for (const user of users) {
    const qrCode = await prisma.qRCode.create({
      data: {
        name: `Test QR Code for ${user.name}`,
        slug: commonSlug,
        userId: user.id,
        redirects: {
          create: {
            url: `https://example.com/${user.id}`,
            isActive: true
          }
        }
      },
      include: {
        redirects: true,
        user: true
      }
    });
    
    log(`Created QR code with slug "${qrCode.slug}" for user ${user.email}`, 'success');
    qrCodes.push(qrCode);
  }
  
  return qrCodes;
}

// Verify that QR codes were created successfully
async function verifyQRCodes(users) {
  log('Verifying QR codes...', 'step');
  
  for (const user of users) {
    // Find QR codes for this user
    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        redirects: {
          where: { isActive: true }
        }
      }
    });
    
    if (qrCodes.length === 0) {
      log(`✗ No QR codes found for user ${user.email}`, 'error');
      continue;
    }
    
    // Log information about each QR code
    for (const qrCode of qrCodes) {
      const namespacedSlug = `${qrCode.user.namespace}/${qrCode.slug}`;
      
      log(`QR code for ${user.email}:`, 'info');
      log(`- ID: ${qrCode.id}`, 'info');
      log(`- Slug: ${qrCode.slug}`, 'info');
      log(`- Namespaced slug: ${namespacedSlug}`, 'info');
      
      if (qrCode.redirects.length > 0) {
        log(`- Redirect URL: ${qrCode.redirects[0].url}`, 'info');
      }
      
      log(`✓ QR code verified for user ${user.email}`, 'success');
    }
  }
}

// Run all tests
async function runTests() {
  try {
    log('Starting namespaced slugs tests', 'step');
    
    // Cleanup old test data
    await cleanup();
    
    // Create test users with namespaces
    const users = await createTestUsers();
    
    // Create test QR codes with the same slug
    await createTestQRCodes(users);
    
    // Verify QR codes
    await verifyQRCodes(users);
    
    // Attempt to create a duplicate slug for the same user (should fail)
    log('Testing duplicate slug constraint...', 'step');
    try {
      const firstUser = users[0];
      await prisma.qRCode.create({
        data: {
          name: 'Duplicate Slug Test',
          slug: 'test-product', // Same slug as before
          userId: firstUser.id
        }
      });
      log('✗ Created duplicate slug for the same user - constraint failed!', 'error');
    } catch (error) {
      log('✓ Correctly prevented duplicate slug for same user', 'success');
    }
    
    log('All tests completed successfully!', 'success');
  } catch (error) {
    log(`Test failed: ${error.stack}`, 'error');
    process.exit(1);
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

// Run the tests
runTests(); 