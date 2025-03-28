/**
 * Migration script to add namespaces to existing users
 * 
 * This script finds all users without a namespace and adds a unique namespace to each one.
 * Run this script after updating the schema to include the namespace field.
 * 
 * Usage: node tools/add-namespaces.js
 */

const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

async function addNamespacesToUsers() {
  console.log('Starting namespace migration...');

  try {
    // Find all users (we'll check for empty namespaces later)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        namespace: true
      }
    });

    console.log(`Found ${users.length} total users`);
    
    let updatedCount = 0;

    // Add namespace to each user that needs one
    for (const user of users) {
      // Skip users that already have a namespace
      if (user.namespace && user.namespace.trim() !== '') {
        console.log(`User ${user.email} already has namespace: ${user.namespace}`);
        continue;
      }
      
      const namespace = createId();
      
      await prisma.user.update({
        where: { id: user.id },
        data: { namespace }
      });
      
      console.log(`Added namespace '${namespace}' to user ${user.email}`);
      updatedCount++;
    }

    console.log(`Successfully added namespaces to ${updatedCount} users`);
  } catch (error) {
    console.error('Error adding namespaces:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the migration
addNamespacesToUsers(); 