const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Starting database connection test...');
  
  // Create a new Prisma client
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('Attempting to connect to the database...');
    
    // Execute a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful!');
    console.log('Query result:', result);
    
    // Count users as a sanity check
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in the database`);
    
    return { success: true };
  } catch (error) {
    console.error('Database connection failed!');
    console.error('Error details:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}

// Run the test
main()
  .then((result) => {
    console.log('Test complete:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 