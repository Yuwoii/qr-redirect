# QR Redirect: System Specifications

Last Updated: May 22, 2024

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [User Interfaces](#user-interfaces)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Configuration](#database-configuration)
8. [QR Code Generation](#qr-code-generation)
9. [Analytics & Tracking](#analytics--tracking)
10. [Performance Considerations](#performance-considerations)
11. [Security Measures](#security-measures)
12. [Error Handling](#error-handling)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Strategy](#deployment-strategy)
15. [Future Enhancements](#future-enhancements)
16. [Maintenance & Updates](#maintenance--updates)

## Overview

QR Redirect is a platform that allows users to create and manage QR codes with customizable redirects. The core functionality enables users to generate QR codes linked to slugs, which can then redirect to different URLs. This redirection can be changed over time without requiring new QR codes to be generated, making it ideal for marketing campaigns, product information, and other dynamic content needs.

### Key Features
- User registration and authentication
- QR code creation with custom slugs
- Multiple redirect management for each QR code
- QR code download in various formats (PNG, SVG)
- Redirect tracking and analytics
- Dashboard for managing QR codes and viewing statistics

## System Architecture

### Technology Stack
- **Frontend**: React.js, Next.js, TailwindCSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: SQLite (development), Postgres (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **QR Code Generation**: qrcode.js library
- **Deployment**: Vercel (or custom hosting)

### Design Patterns
- **Repository Pattern**: For database operations, providing abstraction and easy testing
- **Middleware**: For request processing, authentication, and error handling
- **Edge-compatible Components**: For optimized serverless deployment
- **Request Context Tracking**: For correlating logs and tracing requests through the system

### Folder Structure
```
/
├── .env                     # Environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── prisma/                  # Prisma ORM files
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
├── public/                  # Static files
├── src/                     # Source code
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── auth.ts          # Authentication configuration
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── r/[slug]/        # Redirect handler
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── CreateQRForm.tsx # QR creation form
│   │   ├── QRCodeCard.tsx   # QR code display card
│   │   └── ...
│   └── lib/                 # Utility functions
│       ├── db-client.ts     # Database client repository
│       ├── db-health.ts     # Database health checking
│       ├── db-init.ts       # Database initialization
│       ├── prisma-client.ts # Prisma client configuration
│       ├── request-context.ts # Request context tracking
│       ├── logger.ts        # Enhanced logging utilities
│       ├── api-error-handler.ts # API error handling
│       ├── qrcode.ts        # QR code generation utilities
│       ├── analytics.ts     # Analytics tracking
│       └── ...
└── test-db.js               # Database testing utility
```

## Data Models

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  qrCodes       QRCode[]

  @@index([email]) // Add index for email lookups
}
```

### QRCode Model
```prisma
model QRCode {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  redirects     Redirect[]

  @@index([userId]) // Add index for user lookups
  @@index([slug]) // Add index for slug lookups
  @@index([createdAt]) // Add index for sorting
}
```

### Redirect Model
```prisma
model Redirect {
  id            String    @id @default(cuid())
  url           String
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  qrCodeId      String
  qrCode        QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  visitCount    Int       @default(0)

  @@index([qrCodeId]) // Add index for QR code lookups
  @@index([isActive]) // Add index for active redirects
  @@index([createdAt]) // Add index for sorting
}
```

## API Endpoints

### Authentication
- `POST /api/auth/callback/credentials` - Login with credentials
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get available auth providers
- `GET /api/auth/csrf` - Get CSRF token
- `POST /api/register` - Register a new user

### QR Codes
- `GET /api/qrcodes` - List user's QR codes
- `POST /api/qrcodes` - Create a new QR code
- `GET /api/qrcodes/:id` - Get a specific QR code
- `PUT /api/qrcodes/:id` - Update a QR code
- `DELETE /api/qrcodes/:id` - Delete a QR code
- `GET /api/qrcodes/:id/download` - Download QR code as image

### Redirects
- `GET /api/redirects/:qrCodeId` - List redirects for a QR code
- `POST /api/redirects` - Create a new redirect
- `PUT /api/redirects/:id` - Update a redirect
- `DELETE /api/redirects/:id` - Delete a redirect

### Health Checks
- `GET /api/health` - Check overall API health
- `GET /api/database/health` - Check database connectivity

### Redirects
- `GET /r/:slug` - Redirect handler (public endpoint)

## User Interfaces

### Pages
1. **Home Page**: Introduction and call-to-action for registration
2. **Registration Page**: User sign-up form
3. **Login Page**: User login form
4. **Dashboard**: QR code management interface
   - List of user's QR codes
   - QR code creation form
   - QR code statistics
5. **QR Code Detail**: Management interface for a specific QR code
   - QR code display and download options
   - Redirect management
   - Analytics display

### Components
1. **QRCodeCard**: Display and actions for a QR code
2. **CreateQRForm**: Form for creating new QR codes
3. **UpdateRedirectForm**: Form for updating redirects
4. **AnalyticsChart**: Visual representation of QR code statistics
5. **Navigation**: Site navigation and user menu
6. **ErrorBoundary**: React component for graceful UI error handling

## Authentication & Authorization

### Authentication Flow
1. User registers via the registration form
2. Credentials are validated and password is hashed using bcrypt
3. User logs in with email and password
4. NextAuth.js validates credentials and creates a JWT session
5. Protected routes check for valid session

### Session Management
- JWT-based session handling
- Session expiration configured in NextAuth
- Refresh token mechanism for extended sessions

### Authorization Rules
- Users can only manage their own QR codes
- Admin functionality (planned for future) will have elevated permissions

## Database Configuration

### Development Environment
- SQLite database for local development
- Connection string stored in `.env` file as `DATABASE_URL`
- Database file location: `./prisma/dev.db`

### Production Environment
- PostgreSQL database for production deployment
- Connection string stored in environment variables
- Support for connection pooling

### Database Operations
- Repository pattern used to abstract database operations
- Retry mechanism for transient database errors
- Connection health checking with fallbacks
- Robust error handling for database operations
- Structured logging of database errors with context

### Migrations
- Prisma Migrate used for database schema migrations
- Migration commands included in package.json scripts
- Seeding functionality for development environments

## QR Code Generation

### Generation Process
1. User creates a QR code with a unique slug
2. System generates a URL in the format `/r/{slug}`
3. QR code is generated using the qrcode.js library
4. QR code can be downloaded in PNG or SVG format

### QR Code Options
- Size customization (width and height)
- Error correction level (L, M, Q, H)
- Format options (PNG, SVG)
- Margin customization
- Color customization (foreground and background colors)
- Style options (dot shape, corner shape)
- Logo embedding with customizable size and position

### QR Code Customization Components
1. **EnhancedQRCode**: Main component for displaying customized QR codes
   - Handles rendering of styled QR codes
   - Includes download functionality
   - Provides real-time preview of changes
   - Dialog-based customization interface
   
2. **QRCodeCustomizer**: UI component for customizing QR codes
   - Color selection with color picker
   - Style options via dropdowns and toggles
   - Logo upload and positioning
   - Live preview of customizations
   - Tabs for organizing customization options
   
3. **QR Customization Page**: Dedicated page for QR code customization
   - Full-screen customization interface
   - Real-time preview of changes
   - Advanced styling options
   - Direct download capabilities
   
### Customization Features
- **Color Options**: Customize foreground and background colors with color picker
- **Shape Options**: Square, rounded, or dots for QR code modules
- **Corner Styles**: Square or rounded corners with custom corner dot styles
- **Logo Integration**: Upload and embed logos with customizable size, opacity, and border options
- **Size & Margin**: Adjustable QR code size and margin settings
- **Error Correction**: Configurable error correction levels to balance density and scan reliability
- **Download Options**: Direct download of customized QR codes in high resolution

## Analytics & Tracking

### Tracked Metrics
- Visit count per redirect
- Geographic information (future)
- Device and browser information (future)
- Time of day patterns (future)

### Implementation
- Visit tracking on redirect resolution
- Privacy-focused tracking (no personal information)
- Aggregated statistics for dashboard display

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling for production
- Query optimization using Prisma features
- Database connection retry logic with exponential backoff
- Health checks to ensure database availability

### Caching Strategy
- Static generation for non-dynamic pages
- Redis caching for frequently accessed QR codes (future)
- CDN for static assets

### Edge Compatibility
- Edge runtime compatibility for redirect resolution
- Static optimization where possible
- Serverless function optimization

## Security Measures

### Authentication Security
- Bcrypt password hashing
- CSRF protection
- Rate limiting on authentication endpoints

### General Security
- Input validation
- Sanitization of user inputs
- Content Security Policy headers
- XSS protection

### Database Security
- Parameterized queries (via Prisma)
- Limited database user permissions
- Connection encryption

## Error Handling

### Frontend Error Handling
- Form validation with helpful error messages
- Error boundaries for component errors
- Graceful degradation of features

### Backend Error Handling
- Structured error responses with request IDs
- Comprehensive logging with context information
- Custom error types for different scenarios
- Retry mechanisms for transient errors
- Fallback mechanisms for critical operations

### Monitoring
- Structured logging with contextual information
- Request ID tracking across the system
- Health check endpoints for key services
- Error rate monitoring
- Environment variable validation and safe defaults

## Testing Strategy

### Unit Testing
- Component tests for UI elements
- Function tests for utilities
- Repository pattern tests

### Integration Testing
- API endpoint testing
- Database operation testing
- Authentication flow testing

### End-to-End Testing
- User journey testing
- Cross-browser compatibility testing

## Deployment Strategy

### Development Workflow
1. Local development with SQLite
2. Commit changes to version control
3. CI/CD pipeline runs tests
4. Deployment to staging environment
5. QA testing
6. Deployment to production

### Infrastructure
- Vercel for Next.js deployment
- PostgreSQL database (managed service)
- CDN for static assets
- CI/CD pipeline for automated testing and deployment

## Future Enhancements

### Short-term Enhancements
- Enhanced QR code customization
- Improved analytics dashboard
- Bulk operations for QR codes

### Medium-term Enhancements
- Advanced redirect rules (geo-based, time-based)
- A/B testing functionality
- API for third-party integrations

### Long-term Vision
- White-label solutions
- Enterprise features
- Mobile application

See the [ROADMAP.md](./ROADMAP.md) file for a more detailed timeline of planned enhancements.

## Maintenance & Updates

### Regular Maintenance
- Dependency updates
- Security patches
- Performance optimizations

### Version Updates
- Semantic versioning
- Release notes
- Database migration procedures

---

*This specifications document is updated regularly to reflect the current state of the project and future plans.*

*Last updated: May 22, 2024* 