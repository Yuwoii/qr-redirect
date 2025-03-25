# QR Redirect

A web application for creating and managing dynamic QR codes. Create a QR code once and change where it redirects to anytime without needing to regenerate the QR code.

## Features

- Create QR codes with custom names and slugs
- Update redirect URLs without changing the QR code
- Track scan metrics for each QR code
- User authentication
- Download QR codes in PNG or SVG formats
- QR code customization with colors, logos, and styles
- Intelligent database configuration for any environment

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [PostgreSQL](https://www.postgresql.org) - Production database
- SQLite - Development database

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

4. Edit the `.env` file with your settings. For local development, the following variables are enough:

```
DATABASE_URL="file:./prisma/dev.db"
DATABASE_PROVIDER="sqlite"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-goes-here"
```

5. Start the development server:

```bash
npm run dev
```

This command will automatically:
- Configure the local database
- Generate the Prisma client
- Start the Next.js development server

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Configuration

The application uses a sophisticated multi-schema database configuration system:

### Development Environment

For local development, SQLite is used by default for simplicity:

- **Schema**: `prisma/schema.local.prisma` (copied to `schema.prisma` at runtime)
- **Setup**: Automatically configured with `npm run dev`
- **Manual Setup**: Run `npm run local:setup` if needed

### Production Environment

For production, PostgreSQL is used:

- **Vercel Deployment**: Uses `schema.vercel.prisma` with fallbacks
- **Other Deployment**: Uses `schema.postgresql.prisma`

For more details, see [Database Configuration Documentation](docs/database-configuration.md).

## Deployment on Vercel

### Setup

1. Create a Vercel account and link it to your GitHub account.
2. Create a new project in Vercel and import your GitHub repository.
3. Configure the following environment variables in Vercel:
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `POSTGRES_PRISMA_URL`: Your PostgreSQL connection string
   - `POSTGRES_URL_NON_POOLING`: (Optional) Direct PostgreSQL connection for Edge functions

The application includes a robust fallback system that will automatically:
- Validate the database configuration
- Try multiple schema configurations if needed
- Fall back to simpler schemas if necessary

### Troubleshooting

If you encounter database connection issues:

- For local development, run `npm run local:setup` to reset your environment
- For Vercel deployment, check your environment variables in the Vercel dashboard
- See [Database Configuration Documentation](docs/database-configuration.md) for more details

## License

This project is licensed under the MIT License - see the LICENSE file for details.
