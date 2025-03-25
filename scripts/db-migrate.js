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
const VERCEL_SCHEMA = path.join(__dirname, '../prisma/schema.vercel.prisma');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// Parse command line arguments
const args = process.argv.slice(2);
let forceEnv = null;

args.forEach(arg => {
  if (arg === '--env=dev') forceEnv = 'development';
  if (arg === '--env=prod') forceEnv = 'production';
  if (arg === '--env=vercel') forceEnv = 'vercel';
});

// Detect Vercel environment
const isVercel = process.env.VERCEL === '1';

// If we're on Vercel, force Vercel mode
if (isVercel) {
  console.log('Vercel environment detected, using Vercel-specific configuration');
  forceEnv = 'vercel';
}

// Determine environment
const environment = forceEnv || process.env.NODE_ENV || 'development';
const isProduction = environment === 'production' || environment === 'vercel';
const isVercelEnv = environment === 'vercel';

console.log(`Running database migration in ${environment} environment`);

// Function to copy the correct schema file
function setupSchema() {
  let sourceSchema;
  
  if (isVercelEnv) {
    sourceSchema = VERCEL_SCHEMA;
  } else if (isProduction) {
    sourceSchema = PROD_SCHEMA;
  } else {
    sourceSchema = DEV_SCHEMA;
  }
  
  // Check if source schema exists
  if (!fs.existsSync(sourceSchema)) {
    console.error(`Schema file not found: ${sourceSchema}`);
    // If Vercel schema doesn't exist, fall back to production schema
    if (isVercelEnv && fs.existsSync(PROD_SCHEMA)) {
      console.log('Vercel schema not found, falling back to production schema');
      sourceSchema = PROD_SCHEMA;
    } else {
      process.exit(1);
    }
  }
  
  // Copy the appropriate schema file
  if (isProduction) {
    if (isVercelEnv) {
      console.log(`Using Vercel-specific schema from ${sourceSchema}`);
    } else {
      console.log(`Using PostgreSQL schema from ${sourceSchema}`);
    }
    
    fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    console.log('Schema copied successfully');

    // Verify the URL environment variable for production
    if (isProduction) {
      const postgresUrl = process.env.POSTGRES_PRISMA_URL || 
                        process.env.DATABASE_URL;
      
      const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING;
      
      if (!postgresUrl) {
        console.warn('WARNING: No PostgreSQL URL found in environment variables');
        console.warn('Expected either POSTGRES_PRISMA_URL or DATABASE_URL to be set');
        if (isVercel) {
          console.warn('Check your Vercel project settings and environment variables');
        }
      } else {
        console.log('PostgreSQL URL found in environment variables');
        
        if (isVercelEnv && nonPoolingUrl) {
          console.log('Non-pooling URL also found for direct connections');
        }
      }
    }
  } else {
    console.log('Using SQLite schema (already the default)');
  }
  
  return sourceSchema;
}

// Function to run migrations
function runMigration() {
  try {
    // Skip migration in build-time on Vercel
    if (isVercel && process.env.VERCEL_ENV !== 'development') {
      console.log('Skipping migration deploy on Vercel build (will run at runtime instead)');
      return true;
    }

    console.log('Running database migration...');
    
    // Deploy migration
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Migration completed successfully');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
}

// Function to generate Prisma client
function generatePrismaClient() {
  try {
    console.log('Generating Prisma client...');
    
    // Generate Prisma client
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Prisma client generated successfully');
    
    return true;
  } catch (error) {
    console.error('Prisma client generation failed:', error.message);
    return false;
  }
}

// Setup schema 
const sourceSchema = setupSchema();

// Run migration if needed
const migrationSuccess = runMigration();

// Always generate Prisma client
const generateSuccess = generatePrismaClient();

// Restore the development schema if we were using production
// But only if we're not on Vercel (to avoid changing the schema on Vercel)
if (isProduction && fs.existsSync(DEV_SCHEMA) && !isVercel) {
  console.log('Restoring development schema...');
  fs.copyFileSync(DEV_SCHEMA, SCHEMA_PATH);
}

// Exit with appropriate code
process.exit((migrationSuccess && generateSuccess) ? 0 : 1); 