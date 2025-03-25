/**
 * QR Redirect Server-Side Authentication Tests
 * --------------------------------------------
 * This script tests the server-side authentication components.
 * 
 * Usage:
 * ```
 * node tools/server-auth-test.js
 * ```
 * 
 * It will test:
 * 1. Database connectivity
 * 2. User repository operations
 * 3. NextAuth session handling
 * 
 * This creates temporary test users that are cleaned up after the tests.
 */

// Note: This would typically use a testing framework like Jest
// For simplicity, we're using plain Node.js here

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Logger
const logger = {
  info: (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),
  warning: (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`),
  step: (message) => console.log(`${colors.magenta}[STEP]${colors.reset} ${message}`)
};

// Generate a unique test email
const generateTestEmail = () => `test-${crypto.randomBytes(8).toString('hex')}@example.com`;

// Test config
const config = {
  testUser: {
    name: 'Test User',
    email: generateTestEmail(),
    password: 'SecureTestPassword123!'
  },
  hashedPassword: null,
  userId: null
};

// Mock repository pattern
const createRepositories = (prisma) => {
  return {
    userRepository: {
      findByEmail: (email) => {
        logger.info(`Finding user by email: ${email}`);
        return prisma.user.findUnique({
          where: { email }
        });
      },
      
      findById: (id) => {
        logger.info(`Finding user by id: ${id}`);
        return prisma.user.findUnique({
          where: { id }
        });
      },
      
      create: (data) => {
        logger.info(`Creating new user with email: ${data.email}`);
        return prisma.user.create({
          data
        });
      },
      
      delete: (id) => {
        logger.info(`Deleting user: ${id}`);
        return prisma.user.delete({
          where: { id }
        });
      }
    }
  };
};

// Test database connectivity
async function testDatabaseConnectivity(prisma) {
  logger.step('Testing database connectivity');
  
  try {
    // Simple query to check connectivity
    await prisma.$queryRaw`SELECT 1+1 as result`;
    logger.success('Database connection successful');
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

// Test user repository operations
async function testUserRepository(repositories) {
  logger.step('Testing user repository operations');
  
  try {
    // 1. Hash the password
    config.hashedPassword = await bcrypt.hash(config.testUser.password, 10);
    logger.info('Password hashed successfully');
    
    // 2. Create a test user
    const createdUser = await repositories.userRepository.create({
      name: config.testUser.name,
      email: config.testUser.email,
      password: config.hashedPassword
    });
    
    if (!createdUser || !createdUser.id) {
      logger.error('Failed to create test user');
      return false;
    }
    
    config.userId = createdUser.id;
    logger.success(`Test user created with ID: ${config.userId}`);
    
    // 3. Find the user by email
    const foundByEmail = await repositories.userRepository.findByEmail(config.testUser.email);
    
    if (!foundByEmail || foundByEmail.id !== config.userId) {
      logger.error('Failed to find user by email');
      return false;
    }
    
    logger.success('Found user by email successfully');
    
    // 4. Find the user by ID
    const foundById = await repositories.userRepository.findById(config.userId);
    
    if (!foundById || foundById.email !== config.testUser.email) {
      logger.error('Failed to find user by ID');
      return false;
    }
    
    logger.success('Found user by ID successfully');
    
    // 5. Verify password hash
    const isPasswordValid = await bcrypt.compare(
      config.testUser.password,
      foundByEmail.password
    );
    
    if (!isPasswordValid) {
      logger.error('Password validation failed');
      return false;
    }
    
    logger.success('Password validation successful');
    
    return true;
  } catch (error) {
    logger.error(`User repository test failed: ${error.message}`);
    return false;
  }
}

// Test NextAuth credentials provider logic
async function testNextAuthLogic(repositories) {
  logger.step('Testing NextAuth logic');
  
  try {
    // Mock the NextAuth authorize function logic
    const authorizeFunction = async (credentials) => {
      if (!credentials?.email || !credentials?.password) {
        logger.error('Missing credentials');
        return null;
      }

      const email = credentials.email.toString();
      const password = credentials.password.toString();
      
      const user = await repositories.userRepository.findByEmail(email);

      if (!user) {
        logger.error('User not found');
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.error('Invalid password');
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    };
    
    // Test with valid credentials
    const result = await authorizeFunction({
      email: config.testUser.email,
      password: config.testUser.password
    });
    
    if (!result || result.id !== config.userId) {
      logger.error('NextAuth authorize function failed with valid credentials');
      return false;
    }
    
    logger.success('NextAuth authorize function succeeded with valid credentials');
    
    // Test with invalid password
    const invalidResult = await authorizeFunction({
      email: config.testUser.email,
      password: 'WrongPassword123!'
    });
    
    if (invalidResult) {
      logger.error('NextAuth authorize function incorrectly succeeded with invalid password');
      return false;
    }
    
    logger.success('NextAuth authorize function correctly rejected invalid password');
    
    return true;
  } catch (error) {
    logger.error(`NextAuth logic test failed: ${error.message}`);
    return false;
  }
}

// Clean up test data
async function cleanupTestData(repositories) {
  logger.step('Cleaning up test data');
  
  try {
    if (config.userId) {
      await repositories.userRepository.delete(config.userId);
      logger.success(`Test user deleted: ${config.userId}`);
    }
    return true;
  } catch (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  logger.info('Starting server-side authentication tests');
  
  // Create a PrismaClient instance
  const prisma = new PrismaClient();
  
  try {
    // Create repositories
    const repositories = createRepositories(prisma);
    
    // Run tests
    const dbConnectivityResult = await testDatabaseConnectivity(prisma);
    if (!dbConnectivityResult) {
      logger.error('Database connectivity test failed, stopping tests');
      return false;
    }
    
    const userRepoResult = await testUserRepository(repositories);
    if (!userRepoResult) {
      logger.error('User repository test failed, stopping tests');
      await cleanupTestData(repositories);
      return false;
    }
    
    const nextAuthResult = await testNextAuthLogic(repositories);
    if (!nextAuthResult) {
      logger.error('NextAuth logic test failed, stopping tests');
      await cleanupTestData(repositories);
      return false;
    }
    
    // Clean up
    await cleanupTestData(repositories);
    
    logger.success('All server-side authentication tests passed successfully!');
    return true;
  } catch (error) {
    logger.error(`Test suite failed: ${error.message}`);
    return false;
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  }); 