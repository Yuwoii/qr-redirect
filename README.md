# QR Redirect

A web application for creating and managing dynamic QR codes. Create a QR code once and change where it redirects to anytime without needing to regenerate the QR code.

## Features

- Create QR codes with custom names and slugs
- Update redirect URLs without changing the QR code
- Track scan metrics for each QR code
- User authentication
- Download QR codes in PNG or SVG formats

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [PostgreSQL](https://www.postgresql.org) - Production database

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Yuwoii/qr-redirect.git
cd qr-redirect
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your settings.

5. Initialize the database:

```bash
npx prisma migrate dev --name init
```

6. Run the development server:

```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

### Setup

1. Create a Vercel account and link it to your GitHub account.
2. Create a new project in Vercel and import your GitHub repository.
3. Configure the following environment variables in Vercel:
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `DATABASE_URL`: Your PostgreSQL connection string

### Database Setup

For production, we recommend using a PostgreSQL database. You can use:

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- Any other PostgreSQL provider

After setting up your database, make sure to run the migrations:

```bash
npx prisma migrate deploy
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
