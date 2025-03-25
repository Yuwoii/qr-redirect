#!/usr/bin/env node

/**
 * Database migration script that handles both development and production environments
 * 
 * Usage:
 *   npm run db:migrate               # Migrate based on NODE_ENV
 *   npm run db:migrate -- --env=dev  # Force development environment
 *   npm run db:migrate -- --env=prod # Force production environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths to schema files
const DEV_SCHEMA = path.join(__dirname, '../prisma/schema.prisma');
const PROD_SCHEMA = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// Parse command line arguments
const args = process.argv.slice(2);
let forceEnv = null;

args.forEach(arg => {
  if (arg === '--env=dev') forceEnv = 'development';
  if (arg === '--env=prod') forceEnv = 'production';
});

// Determine environment
const environment = forceEnv || process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';

console.log(`Running database migration in ${environment} environment`);

// Function to copy the correct schema file
function setupSchema() {
  const sourceSchema = isProduction ? PROD_SCHEMA : DEV_SCHEMA;
  
  // Check if source schema exists
  if (!fs.existsSync(sourceSchema)) {
    console.error(`Schema file not found: ${sourceSchema}`);
    process.exit(1);
  }
  
  // If we're using the production schema, make a copy
  if (isProduction) {
    console.log(`Using PostgreSQL schema from ${PROD_SCHEMA}`);
    fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
    console.log('PostgreSQL schema copied successfully');
  } else {
    console.log('Using SQLite schema (already the default)');
  }
  
  return sourceSchema;
}

// Function to run migrations
function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Deploy migration
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Migration completed successfully');
    
    // Generate Prisma client
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Prisma client generated successfully');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
}

// Setup schema and run migration
const sourceSchema = setupSchema();
const success = runMigration();

// Restore the development schema if we were using production
if (isProduction && fs.existsSync(DEV_SCHEMA)) {
  console.log('Restoring development schema...');
  fs.copyFileSync(DEV_SCHEMA, SCHEMA_PATH);
}

// Exit with appropriate code
process.exit(success ? 0 : 1); 