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
const VERCEL_SAFE_SCHEMA = path.join(__dirname, '../prisma/schema.vercel-safe.prisma');
const TEST_SCHEMA = path.join(__dirname, '../prisma/schema.env.test.prisma');
const DATABASE_URL_SCHEMA = path.join(__dirname, '../prisma/schema.database-url.prisma');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// Parse command line arguments
const args = process.argv.slice(2);
let forceEnv = null;

args.forEach(arg => {
  if (arg === '--env=dev') forceEnv = 'development';
  if (arg === '--env=prod') forceEnv = 'production';
  if (arg === '--env=vercel') forceEnv = 'vercel';
  if (arg === '--env=test') forceEnv = 'test';
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
const isTestEnv = environment === 'test';

console.log(`Running database migration in ${environment} environment`);

// Function to validate a Prisma schema
function validatePrismaSchema(schemaPath) {
  try {
    // Try to validate the schema using prisma validate
    execSync(`cd "${path.join(__dirname, '..')}" && npx prisma validate --schema=${path.relative(path.join(__dirname, '..'), schemaPath)}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`Schema validation failed for ${schemaPath}: ${error.message}`);
    return false;
  }
}

// Function to copy the correct schema file
function setupSchema() {
  let sourceSchema;
  
  if (isVercelEnv) {
    // For Vercel, try the main schema first, then fallback if needed
    if (fs.existsSync(VERCEL_SCHEMA)) {
      sourceSchema = VERCEL_SCHEMA;
      // Copy and validate
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
      if (!validatePrismaSchema(SCHEMA_PATH)) {
        console.log('Vercel schema validation failed, trying fallback schema...');
        
        // Try the fallback schema if available
        if (fs.existsSync(VERCEL_SAFE_SCHEMA)) {
          sourceSchema = VERCEL_SAFE_SCHEMA;
          fs.copyFileSync(sourceSchema, SCHEMA_PATH);
          
          if (!validatePrismaSchema(SCHEMA_PATH)) {
            console.log('Fallback schema validation failed, trying test schema...');
            
            // Try the test schema if available
            if (fs.existsSync(TEST_SCHEMA)) {
              sourceSchema = TEST_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.log('Test schema validation failed, trying DATABASE_URL schema...');
                
                // Try the DATABASE_URL schema if available
                if (fs.existsSync(DATABASE_URL_SCHEMA)) {
                  sourceSchema = DATABASE_URL_SCHEMA;
                  fs.copyFileSync(sourceSchema, SCHEMA_PATH);
                  
                  if (!validatePrismaSchema(SCHEMA_PATH)) {
                    console.log('DATABASE_URL schema validation failed, trying production schema...');
                    
                    // Last resort, try the production schema
                    if (fs.existsSync(PROD_SCHEMA)) {
                      sourceSchema = PROD_SCHEMA;
                      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
                      
                      if (!validatePrismaSchema(SCHEMA_PATH)) {
                        console.error('All schemas failed validation, deployment may fail');
                      }
                    }
                  }
                } else if (fs.existsSync(PROD_SCHEMA)) {
                  // If no DATABASE_URL schema, try production schema
                  sourceSchema = PROD_SCHEMA;
                  fs.copyFileSync(sourceSchema, SCHEMA_PATH);
                  
                  if (!validatePrismaSchema(SCHEMA_PATH)) {
                    console.error('Production schema failed validation, deployment may fail');
                  }
                }
              }
            } else if (fs.existsSync(DATABASE_URL_SCHEMA)) {
              // If no test schema, try DATABASE_URL schema
              sourceSchema = DATABASE_URL_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.log('DATABASE_URL schema validation failed, trying production schema...');
                
                // Last resort, try the production schema
                if (fs.existsSync(PROD_SCHEMA)) {
                  sourceSchema = PROD_SCHEMA;
                  fs.copyFileSync(sourceSchema, SCHEMA_PATH);
                  
                  if (!validatePrismaSchema(SCHEMA_PATH)) {
                    console.error('All schemas failed validation, deployment may fail');
                  }
                }
              }
            } else if (fs.existsSync(PROD_SCHEMA)) {
              // If no test schema, try production schema
              sourceSchema = PROD_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.error('Production schema failed validation, deployment may fail');
              }
            }
          }
        } else if (fs.existsSync(TEST_SCHEMA)) {
          // If no fallback, try test schema
          sourceSchema = TEST_SCHEMA;
          fs.copyFileSync(sourceSchema, SCHEMA_PATH);
          
          if (!validatePrismaSchema(SCHEMA_PATH)) {
            console.log('Test schema validation failed, trying DATABASE_URL schema...');
            
            // Try the DATABASE_URL schema
            if (fs.existsSync(DATABASE_URL_SCHEMA)) {
              sourceSchema = DATABASE_URL_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.log('DATABASE_URL schema validation failed, trying production schema...');
                
                // Last resort, try the production schema
                if (fs.existsSync(PROD_SCHEMA)) {
                  sourceSchema = PROD_SCHEMA;
                  fs.copyFileSync(sourceSchema, SCHEMA_PATH);
                  
                  if (!validatePrismaSchema(SCHEMA_PATH)) {
                    console.error('All schemas failed validation, deployment may fail');
                  }
                }
              }
            } else if (fs.existsSync(PROD_SCHEMA)) {
              // If no DATABASE_URL schema, try production schema
              sourceSchema = PROD_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.error('Production schema failed validation, deployment may fail');
              }
            }
          }
        } else if (fs.existsSync(DATABASE_URL_SCHEMA)) {
          // If no fallback or test, try DATABASE_URL schema
          sourceSchema = DATABASE_URL_SCHEMA;
          fs.copyFileSync(sourceSchema, SCHEMA_PATH);
          
          if (!validatePrismaSchema(SCHEMA_PATH)) {
            console.log('DATABASE_URL schema validation failed, trying production schema...');
            
            // Last resort, try the production schema
            if (fs.existsSync(PROD_SCHEMA)) {
              sourceSchema = PROD_SCHEMA;
              fs.copyFileSync(sourceSchema, SCHEMA_PATH);
              
              if (!validatePrismaSchema(SCHEMA_PATH)) {
                console.error('All schemas failed validation, deployment may fail');
              }
            }
          }
        } else if (fs.existsSync(PROD_SCHEMA)) {
          // If no fallback or test, try production schema
          sourceSchema = PROD_SCHEMA;
          fs.copyFileSync(sourceSchema, SCHEMA_PATH);
          
          if (!validatePrismaSchema(SCHEMA_PATH)) {
            console.error('Production schema failed validation, deployment may fail');
          }
        }
      }
    } else if (fs.existsSync(VERCEL_SAFE_SCHEMA)) {
      // If main Vercel schema doesn't exist, try the fallback
      sourceSchema = VERCEL_SAFE_SCHEMA;
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    } else if (fs.existsSync(TEST_SCHEMA)) {
      // If neither Vercel schema exists, fall back to test schema
      console.log('Vercel schemas not found, falling back to test schema');
      sourceSchema = TEST_SCHEMA;
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    } else if (fs.existsSync(DATABASE_URL_SCHEMA)) {
      // If no Vercel schemas or test schema, fall back to DATABASE_URL schema
      console.log('Vercel schemas not found, falling back to DATABASE_URL schema');
      sourceSchema = DATABASE_URL_SCHEMA;
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    } else if (fs.existsSync(PROD_SCHEMA)) {
      // If neither Vercel schema exists, fall back to production schema
      console.log('Vercel schemas not found, falling back to production schema');
      sourceSchema = PROD_SCHEMA;
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    } else {
      console.error('No suitable schema found for Vercel deployment');
      process.exit(1);
    }
  } else if (isTestEnv) {
    // For test environment, use the test schema
    if (fs.existsSync(TEST_SCHEMA)) {
      sourceSchema = TEST_SCHEMA;
      fs.copyFileSync(sourceSchema, SCHEMA_PATH);
    } else {
      console.error('Test schema not found');
      process.exit(1);
    }
  } else if (isProduction) {
    sourceSchema = PROD_SCHEMA;
    
    // Check if source schema exists
    if (!fs.existsSync(sourceSchema)) {
      console.error(`Schema file not found: ${sourceSchema}`);
      process.exit(1);
    }
    
    fs.copyFileSync(sourceSchema, SCHEMA_PATH);
  } else {
    sourceSchema = DEV_SCHEMA;
    
    // For development, we keep the existing schema.prisma
    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error(`Schema file not found: ${SCHEMA_PATH}`);
      process.exit(1);
    }
  }
  
  // Copy the appropriate schema file
  if (isProduction || isTestEnv) {
    if (isVercelEnv) {
      console.log(`Using Vercel-specific schema from ${sourceSchema}`);
    } else if (isTestEnv) {
      console.log(`Using test schema from ${sourceSchema}`);
    } else {
      console.log(`Using PostgreSQL schema from ${sourceSchema}`);
    }
    
    console.log('Schema copied successfully');

    // Verify the URL environment variable for production
    if (isProduction && !isTestEnv) {
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
if ((isProduction || isTestEnv) && fs.existsSync(DEV_SCHEMA) && !isVercel) {
  console.log('Restoring development schema...');
  fs.copyFileSync(DEV_SCHEMA, SCHEMA_PATH);
}

// Exit with appropriate code
process.exit((migrationSuccess && generateSuccess) ? 0 : 1); 