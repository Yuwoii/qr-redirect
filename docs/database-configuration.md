# Database Configuration System

## Overview

The QR Redirect application uses a sophisticated multi-schema approach to database configuration, ensuring maximum compatibility across different environments. This system automatically detects and configures the appropriate database connection based on the current environment, handling both SQLite (for local development) and PostgreSQL (for production).

## Key Features

- **Environment Detection**: Automatically identifies the current environment (development, production, Vercel)
- **Multi-Schema Approach**: Uses different Prisma schema files optimized for each environment
- **Schema Validation Chain**: Attempts multiple schemas in sequence until finding one that works
- **Automatic Local Setup**: Self-healing local development environment setup
- **Robust Error Handling**: Gracefully handles database connection failures with retries and fallbacks
- **Seamless Environment Transitions**: Works consistently across development, staging, and production

## Schema Files

The application maintains multiple schema files, each tailored for specific environments:

| Schema File | Purpose | Environment | Features |
|-------------|---------|-------------|----------|
| `schema.local.prisma` | Local development | Development | SQLite connection, simplified models |
| `schema.vercel.prisma` | Primary Vercel schema | Production (Vercel) | PostgreSQL with extensions, optimized for Vercel |
| `schema.vercel-safe.prisma` | Fallback Vercel schema | Production (Vercel) | PostgreSQL without extensions, more compatible |
| `schema.postgresql.prisma` | Standard PostgreSQL | Production (non-Vercel) | Standard PostgreSQL setup for traditional hosting |
| `schema.database-url.prisma` | Simplified connection | Any | Uses only DATABASE_URL, maximum compatibility |
| `schema.env.test.prisma` | Testing environment | Testing | Configured for automated testing |

## Local Development Setup

For local development, the system provides a streamlined setup process:

1. The `setup-local.js` script automatically runs when you execute `npm run dev`
2. It checks your environment variables in `.env`
3. If needed, it updates the DATABASE_URL to use SQLite
4. It copies the appropriate schema to `schema.prisma`
5. It validates the schema to ensure it works
6. It generates the Prisma client
7. It pushes schema changes to the database if needed

### Commands for Local Development

- `npm run dev`: Starts the development server with automatic database setup
- `npm run local:setup`: Manually runs the database setup process
- `npm run dev:clean`: Performs a clean setup and starts the server

## Vercel Deployment Process

For Vercel deployments, the system uses a more complex approach:

1. During build, `vercel-check.js` validates the environment
2. It checks for required environment variables
3. The `db-migrate.js` script selects the appropriate schema
4. It tries `schema.vercel.prisma` first
5. If validation fails, it attempts fallback schemas in order
6. Once a valid schema is found, it's copied to `schema.prisma`
7. The Prisma client is generated based on this schema

## Environment Variables

The system uses several environment variables to configure database connections:

### Development Environment
- `DATABASE_URL`: Path to SQLite database file (e.g., `file:./prisma/dev.db`)
- `DATABASE_PROVIDER`: Set to `sqlite` for local development

### Production Environment
- `POSTGRES_PRISMA_URL`: Primary PostgreSQL connection string
- `POSTGRES_URL_NON_POOLING`: Non-pooled connection for direct access (Edge functions)
- `DATABASE_URL`: Fallback connection string
- `DATABASE_PROVIDER`: Set to `postgresql` for production

## Troubleshooting

If you encounter database connection issues:

1. **Local Development**:
   - Run `npm run local:setup` to reset your local environment
   - Check if your `.env` file has the correct DATABASE_URL for SQLite
   - Verify that the dev.db file exists in the prisma directory

2. **Vercel Deployment**:
   - Verify that you have set POSTGRES_PRISMA_URL in your Vercel environment variables
   - Check the deployment logs for database connection errors
   - Try running with DATABASE_URL set to a valid PostgreSQL connection string

## How It Works Behind the Scenes

1. **Environment Detection**:
   ```javascript
   const isProduction = process.env.NODE_ENV === 'production';
   const isVercel = process.env.VERCEL === '1';
   ```

2. **Schema Validation**:
   ```javascript
   function validateSchema(schemaPath) {
     try {
       const result = execSync(`npx prisma validate --schema="${relativePath}"`, { 
         stdio: 'pipe',
         encoding: 'utf8',
         cwd: process.cwd()
       });
       return true;
     } catch (error) {
       return false;
     }
   }
   ```

3. **Schema Selection Logic**:
   ```javascript
   function selectSchema() {
     // Try PostgreSQL schemas if in production
     if (isProviderPostgres || isDatabaseUrlPostgres || hasPgPrismaUrl) {
       const schemaFiles = [
         'schema.vercel.prisma',
         'schema.vercel-safe.prisma',
         'schema.database-url.prisma',
         'schema.postgresql.prisma',
       ];
       
       for (const schemaFile of schemaFiles) {
         if (validateSchema(schemaFile)) {
           return schemaFile;
         }
       }
     }
     
     // Default to SQLite for local development
     return 'schema.local.prisma';
   }
   ```

4. **Database Client Initialization**:
   ```javascript
   function createPrismaClient() {
     const dbConfig = getDatabaseConfig();
     
     let finalUrl = dbConfig.url;
     
     // Add parameters for serverless environments
     if (dbConfig.provider === 'postgresql' && process.env.VERCEL === '1') {
       finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
       finalUrl += '&schema_cache_mode=bypass';
     }
     
     return new PrismaClient({
       datasources: {
         db: { url: finalUrl }
       }
     });
   }
   ``` 