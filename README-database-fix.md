# Database Configuration Fix for QR Redirect App

## Problem

The application was encountering this error when running locally:

```
PrismaClientInitializationError: 
Invalid `prisma.qRCode.findMany()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:14
   | 
13 |   // Tries Vercel Postgres connection string first, falls back to DATABASE_URL
14 |   url       = env("POSTGRES_PRISMA_URL")
   | 

Validation Error Count: 1
```

This occurred because the Prisma schema was configured to use a PostgreSQL connection, but the local environment didn't have the PostgreSQL connection strings set up correctly.

## Solution

We created a robust local development environment that automatically configures the database correctly, regardless of whether you're using SQLite or PostgreSQL:

1. **Created a dedicated SQLite schema** (`prisma/schema.local.prisma`) specifically for local development that doesn't depend on PostgreSQL.

2. **Developed an automatic setup script** (`scripts/setup-local.js`) that:
   - Checks the environment variables
   - Updates the .env file if needed
   - Selects the appropriate schema based on what's available
   - Validates the schema before using it
   - Generates the Prisma client
   - Pushes the schema to the database

3. **Updated the npm scripts** in package.json:
   - `npm run dev` now automatically runs the setup script first
   - Added `npm run local:setup` to manually run the setup
   - Added `npm run dev:clean` for a full clean setup and server start

4. **Updated the .env file** to have clearer documentation and proper SQLite configuration values.

## Usage

For local development, just run:

```bash
npm run dev
```

The script will automatically configure everything correctly. If you ever need to reset your local environment, run:

```bash
npm run dev:clean
```

## How It Works

The setup script follows these steps:

1. Checks the .env file for database configuration
2. Updates the .env file with SQLite configuration if needed
3. Attempts to validate various schema files to find a working one
4. Copies the working schema to the main schema.prisma file
5. Generates the Prisma client
6. Pushes the schema to the database

This ensures that your local development environment is always correctly configured without requiring manual setup.

## Schema Files

- `schema.prisma`: The main schema used by the application
- `schema.local.prisma`: SQLite schema for local development
- `schema.postgresql.prisma`: PostgreSQL schema for production
- `schema.vercel.prisma`: Optimized schema for Vercel deployment
- `schema.vercel-safe.prisma`: Fallback schema for Vercel without extensions
- `schema.database-url.prisma`: Simple schema that only uses DATABASE_URL
- `schema.env.test.prisma`: Schema for testing environments

The setup script attempts to find a working schema based on your environment variables. 