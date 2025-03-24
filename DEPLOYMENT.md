# Deploying QR Redirect to Vercel with Supabase PostgreSQL

This guide will help you deploy the QR Redirect application to Vercel using Supabase PostgreSQL as the database.

## Prerequisites

- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account
- Your QR Redirect codebase pushed to GitHub

## Step 1: Set Up Supabase PostgreSQL Database

1. Log in to your Supabase account and create a new project
2. Once your project is set up, navigate to "Project Settings" > "Database"
3. Find your connection string under "Connection string" > "URI"
   - It should look like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
4. Copy this connection string for later use

## Step 2: Prepare Your Schema for PostgreSQL

1. In your local project, update your `prisma/schema.prisma` file to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update your `package.json` build script to include Prisma schema generation:

```json
"scripts": {
  "build": "prisma generate && next build",
  ...
}
```

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and click "Add New..." > "Project"
2. Import your GitHub repository containing the QR Redirect application
3. In the project configuration page:
   - Framework: Next.js (should be auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. Expand "Environment Variables" and add:
   - `NEXTAUTH_URL`: Your production URL, e.g., `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET`: Generate a secure random string (run `openssl rand -base64 32` in terminal)
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string from Step 1
   
5. Click "Deploy"

## Step 4: Run Migrations on Supabase PostgreSQL

After your first deployment succeeds, you need to run the Prisma migration to set up your database schema:

### Option A: Using Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Log in to Vercel
vercel login

# Link to your project
vercel link

# Run the migration command
vercel env pull .env.production && npx prisma migrate deploy
```

### Option B: Using Vercel Web Interface

1. Go to your Vercel project
2. Navigate to "Settings" > "Deployments" > Click on your latest deployment
3. Go to "Functions" tab > "Console"
4. Run the following command: `npx prisma migrate deploy`

## Step 5: Verify Your Deployment

1. Visit your deployed application URL (provided by Vercel after deployment)
2. Test the following features:
   - Register a new account
   - Login
   - Create a QR code
   - View and update your QR codes
   - Use the QR code redirect functionality

## Troubleshooting

### Database Connection Issues

- **SSL Connection**: Ensure your connection string includes `?sslmode=require` 
  - Example: `postgresql://postgres:password@db.xyz.supabase.co:5432/postgres?sslmode=require`

- **Network Issues**: In Supabase, go to "Project Settings" > "Database" > "Connection Pooling" 
  and ensure it's enabled for Vercel's IP ranges

### Prisma Migration Issues

- If you encounter errors about column types, ensure your schema matches PostgreSQL requirements
- Try `npx prisma db push` if migrations aren't working properly

### NextAuth Issues

- Check that your `NEXTAUTH_URL` matches your actual deployment URL
- Ensure `NEXTAUTH_SECRET` is properly set

## Ongoing Maintenance

- Monitor your database usage in Supabase dashboard
- Set up usage alerts in Supabase
- Regularly backup your database (Supabase has point-in-time recovery)
- Consider enabling connection pooling if your application scales 