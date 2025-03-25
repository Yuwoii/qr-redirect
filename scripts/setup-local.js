#!/usr/bin/env node

/**
 * Local development environment setup script
 * This script automatically checks and selects the most appropriate
 * database schema for your local development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths to schema files
const MAIN_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const LOCAL_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.local.prisma');
const ENV_FILE_PATH = path.join(__dirname, '../.env');

console.log('Setting up local development environment...');

// Check if we have a valid DATABASE_URL in .env
function checkDatabaseUrl() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      console.log('No .env file found. Creating one from .env.example...');
      if (fs.existsSync(path.join(__dirname, '../.env.example'))) {
        fs.copyFileSync(path.join(__dirname, '../.env.example'), ENV_FILE_PATH);
      } else {
        // Create a minimal .env file
        fs.writeFileSync(ENV_FILE_PATH, 'DATABASE_URL="file:./prisma/dev.db"\nDATABASE_PROVIDER="sqlite"\n');
      }
    }

    // Read .env file
    let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    // Check for PostgreSQL URLs
    const hasPgPrismaUrl = envContent.includes('POSTGRES_PRISMA_URL=') && 
                          !envContent.includes('POSTGRES_PRISMA_URL=') && 
                          !envContent.includes('POSTGRES_PRISMA_URL=#');
    
    const hasDatabaseUrl = envContent.includes('DATABASE_URL=') && 
                          !envContent.includes('DATABASE_URL=') && 
                          !envContent.includes('DATABASE_URL=#');
    
    // Determine database provider
    let isDatabaseUrlPostgres = false;
    if (hasDatabaseUrl) {
      const match = envContent.match(/DATABASE_URL=["']?(postgres|postgresql):\/\//);
      isDatabaseUrlPostgres = !!match;
    }
    
    // Check database provider setting
    const isProviderPostgres = envContent.includes('DATABASE_PROVIDER="postgresql"') || 
                               envContent.includes("DATABASE_PROVIDER='postgresql'");
    
    // Make sure DATABASE_URL is set correctly for SQLite if we're not using Postgres
    if (!hasDatabaseUrl || (hasDatabaseUrl && isDatabaseUrlPostgres && !isProviderPostgres)) {
      console.log('Setting SQLite DATABASE_URL for local development');
      
      // Remove any existing DATABASE_URL
      envContent = envContent.replace(/^DATABASE_URL=.*$/m, '');
      
      // Make sure DATABASE_PROVIDER is set to sqlite
      envContent = envContent.replace(/^DATABASE_PROVIDER=.*$/m, '');
      
      // Add the correct SQLite DATABASE_URL
      envContent += '\nDATABASE_URL="file:./prisma/dev.db"\n';
      envContent += 'DATABASE_PROVIDER="sqlite"\n';
      
      // Write the updated .env file
      fs.writeFileSync(ENV_FILE_PATH, envContent);
    }
    
    return {
      hasPgPrismaUrl,
      hasDatabaseUrl,
      isDatabaseUrlPostgres,
      isProviderPostgres
    };
  } catch (error) {
    console.error('Error checking database URL:', error.message);
    return {
      hasPgPrismaUrl: false,
      hasDatabaseUrl: false,
      isDatabaseUrlPostgres: false,
      isProviderPostgres: false
    };
  }
}

// Function to validate a schema
function validateSchema(schemaPath) {
  try {
    console.log(`Validating schema: ${schemaPath}`);
    
    // Use relative path to avoid issues with spaces in paths
    const relativePath = path.relative(process.cwd(), schemaPath);
    console.log(`Using relative path: ${relativePath}`);
    
    // Try to validate with more verbose output and no spaces in the path
    const result = execSync(`npx prisma validate --schema="${relativePath}"`, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd() // Make sure we're in the right directory
    });
    
    console.log(`Validation successful: ${result}`);
    return true;
  } catch (error) {
    console.error(`Validation error: ${error.message}`);
    if (error.stdout) console.error(`stdout: ${error.stdout}`);
    if (error.stderr) console.error(`stderr: ${error.stderr}`);
    return false;
  }
}

// Select the most appropriate schema
function selectSchema() {
  const {
    hasPgPrismaUrl,
    hasDatabaseUrl,
    isDatabaseUrlPostgres,
    isProviderPostgres
  } = checkDatabaseUrl();
  
  // If we're using PostgreSQL, make sure we have all the right URLs
  if (isProviderPostgres || isDatabaseUrlPostgres || hasPgPrismaUrl) {
    console.log('PostgreSQL configuration detected.');
    
    // Check each schema to find one that works
    const schemaFiles = [
      '../prisma/schema.database-url.prisma',
      '../prisma/schema.vercel-safe.prisma',
      '../prisma/schema.postgresql.prisma',
      '../prisma/schema.vercel.prisma',
    ];
    
    for (const schemaFile of schemaFiles) {
      const schemaPath = path.join(__dirname, schemaFile);
      if (fs.existsSync(schemaPath) && validateSchema(schemaPath)) {
        console.log(`Using valid PostgreSQL schema: ${schemaFile}`);
        fs.copyFileSync(schemaPath, MAIN_SCHEMA_PATH);
        return true;
      }
    }
    
    console.log('No valid PostgreSQL schema found. Reverting to SQLite for local development.');
  }
  
  // Default to SQLite for local development if we don't have valid PostgreSQL config
  if (fs.existsSync(LOCAL_SCHEMA_PATH)) {
    console.log('Using SQLite schema for local development');
    fs.copyFileSync(LOCAL_SCHEMA_PATH, MAIN_SCHEMA_PATH);
    return true;
  } else {
    console.error('Local schema not found! Please check your installation.');
    return false;
  }
}

// Main execution
(async function() {
  try {
    // Select the appropriate schema
    const schemaSelected = selectSchema();
    
    if (!schemaSelected) {
      console.error('Failed to select a schema. Please check your configuration.');
      process.exit(1);
    }
    
    // Validate the final schema
    if (validateSchema(MAIN_SCHEMA_PATH)) {
      console.log('Schema validated successfully!');
    } else {
      console.error('Schema validation failed! Check your database configuration.');
      process.exit(1);
    }
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push the schema to the database (dev only, not for production)
    console.log('Pushing schema to database (dev only)...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('Local development environment setup complete!');
    console.log('You can now start your development server with: npm run dev');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
})(); 