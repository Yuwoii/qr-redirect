#!/usr/bin/env node

/**
 * Script to check Vercel configuration and database connectivity
 * This can be used to diagnose database connection issues on Vercel
 */

const fs = require('fs');
const path = require('path');

// Check Vercel environment variables
function checkVercelEnv() {
  console.log('Checking Vercel environment variables...');
  
  const requiredVars = [
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING',
    'DATABASE_URL'
  ];
  
  const foundVars = [];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      foundVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });
  
  console.log(`Found environment variables: ${foundVars.join(', ') || 'None'}`);
  
  if (missingVars.length > 0) {
    console.log(`Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Note: Not all variables are required, but at least one database URL is necessary');
  }
  
  // Check if we have at least one database URL
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    console.error('ERROR: No database URL found in environment variables');
    console.error('Make sure either POSTGRES_PRISMA_URL or DATABASE_URL is set in your Vercel project');
    return false;
  }
  
  return true;
}

// Check Prisma schema configuration
function checkPrismaSchema() {
  console.log('Checking Prisma schema configuration...');
  
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('ERROR: Prisma schema not found at', schemaPath);
    return false;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check if we have the correct provider
  if (schema.includes('provider = "sqlite"')) {
    console.error('ERROR: Prisma schema is using SQLite provider, but we need PostgreSQL for Vercel');
    console.log('Fixing schema by copying Vercel-specific schema...');
    
    const vercelSchemaPath = path.join(__dirname, '../prisma/schema.vercel.prisma');
    
    if (fs.existsSync(vercelSchemaPath)) {
      fs.copyFileSync(vercelSchemaPath, schemaPath);
      console.log('Schema fixed with Vercel-specific configuration');
    } else {
      const prodSchemaPath = path.join(__dirname, '../prisma/schema.postgresql.prisma');
      
      if (fs.existsSync(prodSchemaPath)) {
        fs.copyFileSync(prodSchemaPath, schemaPath);
        console.log('Schema fixed with production PostgreSQL configuration');
      } else {
        console.error('ERROR: Could not find Vercel or PostgreSQL schema to fix the issue');
        return false;
      }
    }
  } else if (schema.includes('provider = "postgresql"')) {
    console.log('Prisma schema is correctly using PostgreSQL provider');
  } else {
    console.error('ERROR: Unknown provider in Prisma schema');
    return false;
  }
  
  return true;
}

// Main function
async function main() {
  console.log('Vercel database configuration check');
  console.log('==================================');
  
  const isVercel = process.env.VERCEL === '1';
  
  if (!isVercel) {
    console.log('Not running on Vercel, this script is intended for Vercel deployments');
    console.log('To simulate Vercel environment, set VERCEL=1 environment variable');
    return;
  }
  
  console.log('Running on Vercel environment');
  
  const envCheck = checkVercelEnv();
  const schemaCheck = checkPrismaSchema();
  
  if (envCheck && schemaCheck) {
    console.log('All checks passed! Your Vercel configuration looks good');
  } else {
    console.error('Some checks failed. Please fix the issues above before deploying to Vercel');
  }
}

// Execute the main function
main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
}); 