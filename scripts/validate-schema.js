#!/usr/bin/env node

/**
 * Script to validate all Prisma schemas and test the fallback mechanism
 * 
 * Usage:
 *   node scripts/validate-schema.js
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

console.log('Validating Prisma schemas...');

// Function to validate a Prisma schema using a more direct approach
function validatePrismaSchema(schemaPath) {
  console.log(`\nTesting schema: ${schemaPath}`);
  
  // First check if the file exists
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file does not exist');
    return false;
  }
  
  try {
    // Create a temporary copy with a simple name to avoid path issues
    const tempSchema = path.join(__dirname, '../prisma/temp.prisma');
    fs.copyFileSync(schemaPath, tempSchema);
    
    // Try to validate the schema using prisma validate on the temp file
    const output = execSync(`cd "${path.join(__dirname, '..')}" && npx prisma validate --schema=prisma/temp.prisma`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    // Clean up temp file
    if (fs.existsSync(tempSchema)) {
      fs.unlinkSync(tempSchema);
    }
    
    console.log('✅ Schema is valid');
    console.log(output);
    return true;
  } catch (error) {
    console.error('❌ Schema validation failed');
    console.error(error.message);
    
    // Clean up temp file
    const tempSchema = path.join(__dirname, '../prisma/temp.prisma');
    if (fs.existsSync(tempSchema)) {
      fs.unlinkSync(tempSchema);
    }
    
    return false;
  }
}

// Test each schema individually
console.log('\n=== Individual Schema Validation ===');
const devValid = validatePrismaSchema(DEV_SCHEMA);
const prodValid = validatePrismaSchema(PROD_SCHEMA);
const vercelValid = validatePrismaSchema(VERCEL_SCHEMA);
const safeFallbackValid = fs.existsSync(VERCEL_SAFE_SCHEMA) ? 
  validatePrismaSchema(VERCEL_SAFE_SCHEMA) : false;
const testValid = fs.existsSync(TEST_SCHEMA) ?
  validatePrismaSchema(TEST_SCHEMA) : false;
const databaseUrlValid = fs.existsSync(DATABASE_URL_SCHEMA) ?
  validatePrismaSchema(DATABASE_URL_SCHEMA) : false;

// Save original schema for restoration
let originalSchema = null;
if (fs.existsSync(SCHEMA_PATH)) {
  originalSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
}

// Test the fallback mechanism
console.log('\n=== Testing Fallback Mechanism ===');

// Function to test schema fallback
function testFallback() {
  console.log('\nTesting fallback logic...');
  
  // First try the Vercel schema
  if (fs.existsSync(VERCEL_SCHEMA)) {
    fs.copyFileSync(VERCEL_SCHEMA, SCHEMA_PATH);
    console.log('Copied Vercel schema to main schema location');
    
    if (!validatePrismaSchema(SCHEMA_PATH)) {
      console.log('Vercel schema failed validation, trying fallback...');
      
      // Try the fallback schema
      if (fs.existsSync(VERCEL_SAFE_SCHEMA)) {
        fs.copyFileSync(VERCEL_SAFE_SCHEMA, SCHEMA_PATH);
        console.log('Copied safe fallback schema to main schema location');
        
        if (!validatePrismaSchema(SCHEMA_PATH)) {
          console.log('Fallback schema failed validation, trying test schema...');
          
          // Try the test schema
          if (fs.existsSync(TEST_SCHEMA)) {
            fs.copyFileSync(TEST_SCHEMA, SCHEMA_PATH);
            console.log('Copied test schema to main schema location');
            
            if (!validatePrismaSchema(SCHEMA_PATH)) {
              console.log('Test schema failed validation, trying DATABASE_URL schema...');
              
              // Try the DATABASE_URL schema
              if (fs.existsSync(DATABASE_URL_SCHEMA)) {
                fs.copyFileSync(DATABASE_URL_SCHEMA, SCHEMA_PATH);
                console.log('Copied DATABASE_URL schema to main schema location');
                
                if (!validatePrismaSchema(SCHEMA_PATH)) {
                  console.log('DATABASE_URL schema failed validation, trying production schema...');
                  
                  // Try the production schema as last resort
                  if (fs.existsSync(PROD_SCHEMA)) {
                    fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
                    console.log('Copied production schema to main schema location');
                    
                    if (!validatePrismaSchema(SCHEMA_PATH)) {
                      console.log('❌ All schemas failed validation!');
                      return false;
                    } else {
                      console.log('✅ Production schema passed validation as final fallback');
                      return true;
                    }
                  } else {
                    console.log('❌ Production schema not found!');
                    return false;
                  }
                } else {
                  console.log('✅ DATABASE_URL schema passed validation');
                  return true;
                }
              } else if (fs.existsSync(PROD_SCHEMA)) {
                // If no DATABASE_URL schema, try production schema
                fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
                console.log('Copied production schema to main schema location');
                
                if (!validatePrismaSchema(SCHEMA_PATH)) {
                  console.log('❌ Production schema failed validation!');
                  return false;
                } else {
                  console.log('✅ Production schema passed validation');
                  return true;
                }
              } else {
                console.log('❌ No additional fallback schemas available!');
                return false;
              }
            } else {
              console.log('✅ Test schema passed validation');
              return true;
            }
          } else if (fs.existsSync(DATABASE_URL_SCHEMA)) {
            // If no test schema, try DATABASE_URL schema
            fs.copyFileSync(DATABASE_URL_SCHEMA, SCHEMA_PATH);
            console.log('Copied DATABASE_URL schema to main schema location (no test schema available)');
            
            if (!validatePrismaSchema(SCHEMA_PATH)) {
              console.log('❌ DATABASE_URL schema failed validation!');
              return false;
            } else {
              console.log('✅ DATABASE_URL schema passed validation');
              return true;
            }
          } else if (fs.existsSync(PROD_SCHEMA)) {
            // If no test schema, try production schema
            fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
            console.log('Copied production schema to main schema location');
            
            if (!validatePrismaSchema(SCHEMA_PATH)) {
              console.log('❌ Production schema failed validation!');
              return false;
            } else {
              console.log('✅ Production schema passed validation');
              return true;
            }
          } else {
            console.log('❌ No additional fallback schemas available!');
            return false;
          }
        } else {
          console.log('✅ Fallback schema passed validation');
          return true;
        }
      } else if (fs.existsSync(TEST_SCHEMA)) {
        // Try test schema if no fallback schema
        fs.copyFileSync(TEST_SCHEMA, SCHEMA_PATH);
        console.log('Copied test schema to main schema location (no safe fallback available)');
        
        if (!validatePrismaSchema(SCHEMA_PATH)) {
          console.log('❌ Test schema failed validation!');
          return false;
        } else {
          console.log('✅ Test schema passed validation');
          return true;
        }
      } else if (fs.existsSync(DATABASE_URL_SCHEMA)) {
        // Try DATABASE_URL schema if no fallback or test schema
        fs.copyFileSync(DATABASE_URL_SCHEMA, SCHEMA_PATH);
        console.log('Copied DATABASE_URL schema to main schema location (no fallback or test schema available)');
        
        if (!validatePrismaSchema(SCHEMA_PATH)) {
          console.log('❌ DATABASE_URL schema failed validation!');
          return false;
        } else {
          console.log('✅ DATABASE_URL schema passed validation');
          return true;
        }
      } else if (fs.existsSync(PROD_SCHEMA)) {
        // Try the production schema if no other options
        fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
        console.log('Copied production schema to main schema location (no other schemas available)');
        
        if (!validatePrismaSchema(SCHEMA_PATH)) {
          console.log('❌ Production schema failed validation!');
          return false;
        } else {
          console.log('✅ Production schema passed validation');
          return true;
        }
      } else {
        console.log('❌ No fallback schemas available!');
        return false;
      }
    } else {
      console.log('✅ Vercel schema passed validation, no fallback needed');
      return true;
    }
  } else {
    console.log('Vercel schema not found, trying fallback schemas...');
    
    // Try safe fallback
    if (fs.existsSync(VERCEL_SAFE_SCHEMA)) {
      fs.copyFileSync(VERCEL_SAFE_SCHEMA, SCHEMA_PATH);
      console.log('Copied safe fallback schema to main schema location');
      
      if (validatePrismaSchema(SCHEMA_PATH)) {
        console.log('✅ Fallback schema passed validation');
        return true;
      }
    }
    
    // Try test schema
    if (fs.existsSync(TEST_SCHEMA)) {
      fs.copyFileSync(TEST_SCHEMA, SCHEMA_PATH);
      console.log('Copied test schema to main schema location');
      
      if (validatePrismaSchema(SCHEMA_PATH)) {
        console.log('✅ Test schema passed validation');
        return true;
      }
    }
    
    // Try DATABASE_URL schema
    if (fs.existsSync(DATABASE_URL_SCHEMA)) {
      fs.copyFileSync(DATABASE_URL_SCHEMA, SCHEMA_PATH);
      console.log('Copied DATABASE_URL schema to main schema location');
      
      if (validatePrismaSchema(SCHEMA_PATH)) {
        console.log('✅ DATABASE_URL schema passed validation');
        return true;
      }
    }
    
    // Try production schema
    if (fs.existsSync(PROD_SCHEMA)) {
      fs.copyFileSync(PROD_SCHEMA, SCHEMA_PATH);
      console.log('Copied production schema to main schema location');
      
      if (validatePrismaSchema(SCHEMA_PATH)) {
        console.log('✅ Production schema passed validation');
        return true;
      } else {
        console.log('❌ Production schema failed validation!');
        return false;
      }
    }
    
    console.log('❌ No valid schemas found!');
    return false;
  }
}

// Run the fallback test
const fallbackWorked = testFallback();

// Restore original schema if it existed
if (originalSchema) {
  fs.writeFileSync(SCHEMA_PATH, originalSchema, 'utf8');
  console.log('\nRestored original schema file');
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Development Schema: ${devValid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`Production Schema: ${prodValid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`Vercel Schema: ${vercelValid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`Safe Fallback Schema: ${safeFallbackValid ? '✅ Valid' : '❌ Not found or invalid'}`);
console.log(`Test Schema: ${testValid ? '✅ Valid' : '❌ Not found or invalid'}`);
console.log(`DATABASE_URL Schema: ${databaseUrlValid ? '✅ Valid' : '❌ Not found or invalid'}`);
console.log(`Fallback Mechanism: ${fallbackWorked ? '✅ Working' : '❌ Failed'}`);

// Exit with appropriate code
if (fallbackWorked) {
  console.log('\n✅ TEST PASSED: At least one schema is valid and fallback mechanism works');
  process.exit(0);
} else {
  console.error('\n❌ TEST FAILED: No valid schemas found or fallback mechanism failed');
  process.exit(1);
} 