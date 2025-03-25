# QR Redirect: System Specifications

Last Updated: March 25, 2025

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
- QR code customization with visual styling options
- QR code download in various formats (PNG, SVG)
- Redirect tracking and analytics
- Dashboard for managing QR codes and viewing statistics
- Geographic analytics with region-specific data
- Multi-environment database configuration with automatic schema selection

## System Architecture

### Technology Stack
- **Frontend**: React.js, Next.js, TailwindCSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: SQLite (development), PostgreSQL (production via Vercel Postgres)
- **ORM**: Prisma with multi-schema configuration
- **Authentication**: NextAuth.js
- **QR Code Generation**: Enhanced qrcode.js library with customization features
- **Deployment**: Vercel with environment-specific configurations

### Design Patterns
- **Repository Pattern**: For database operations, providing abstraction and easy testing
- **Middleware**: For request processing, authentication, and error handling
- **Edge-compatible Components**: For optimized serverless deployment
- **Request Context Tracking**: For correlating logs and tracing requests through the system
- **Environment-adaptive Configuration**: For seamless development and production transitions
- **Schema Validation Chain**: For reliable database configuration across environments
- **Progressive Fallback System**: For handling configuration failures gracefully

### Folder Structure
```
/
├── .env                     # Environment variables for development
├── .env.production          # Template for production environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── prisma/                  # Prisma ORM files
│   ├── schema.prisma        # Active schema (auto-selected at runtime)
│   ├── schema.local.prisma  # Optimized SQLite schema for local development
│   ├── schema.postgresql.prisma # Production PostgreSQL schema
│   ├── schema.vercel.prisma # Vercel-specific PostgreSQL schema with extensions
│   ├── schema.vercel-safe.prisma # Fallback Vercel schema without extensions
│   ├── schema.database-url.prisma # Minimal schema using only DATABASE_URL
│   ├── schema.env.test.prisma # Schema for testing environments
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
├── public/                  # Static files
├── scripts/                 # Utility scripts
│   ├── db-migrate.js        # Database migration script with multi-schema support
│   ├── setup-local.js       # Local development environment setup script
│   └── vercel-check.js      # Vercel configuration verification script
├── src/                     # Source code
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── auth.ts          # Authentication configuration
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── r/[slug]/        # Redirect handler
│   │   ├── qr-customize/    # QR code customization page
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── CreateQRForm.tsx # QR creation form
│   │   ├── QRCodeCard.tsx   # QR code display card
│   │   ├── QRCodeCustomizer.tsx # QR code customization component
│   │   ├── EnhancedQRCode.tsx # Enhanced QR code component
│   │   └── ...
│   └── lib/                 # Utility functions
│       ├── db.ts            # Database client repository
│       ├── prisma-client.ts # Prisma client configuration with auto-detection
│       ├── db-init.ts       # Database initialization utilities
│       ├── db-health.ts     # Database health checks
│       ├── logger.ts        # Enhanced logging utilities
│       ├── qrcode.ts        # QR code generation utilities
│       ├── analytics.ts     # Analytics tracking
│       └── ...
├── docs/                    # Documentation
│   ├── database-configuration.md # Detailed database configuration docs
│   └── ...
├── vercel.json              # Vercel deployment configuration
└── tailwind.config.js       # Tailwind CSS configuration
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
6. **QR Code Customization**: Visual customization interface for QR codes
   - Style selection
   - Color customization
   - Logo embedding
   - Preview and download options

### Components
1. **QRCodeCard**: Display and actions for a QR code
2. **CreateQRForm**: Form for creating new QR codes
3. **UpdateRedirectForm**: Form for updating redirects
4. **AnalyticsChart**: Visual representation of QR code statistics
5. **Navigation**: Site navigation and user menu
6. **EnhancedQRCode**: Component for displaying customized QR codes
7. **QRCodeCustomizer**: UI for QR code visual customization

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

### Environment-Specific Database Setup
The system automatically detects the current environment and uses the appropriate database configuration:

#### Development Environment
- **Database Type**: SQLite
- **Schema File**: `prisma/schema.local.prisma` (copied to `schema.prisma` at runtime)
- **Connection String**: `file:./prisma/dev.db` (from `.env` file)
- **Setup Script**: `scripts/setup-local.js` (runs automatically with `npm run dev`)
- **Advantages**: 
  - Simple file-based database for local development
  - No additional services or dependencies required
  - Fast startup and easy backup
  - Automatic configuration detection and setup

#### Production Environment (Non-Vercel)
- **Database Type**: PostgreSQL
- **Schema File**: `prisma/schema.postgresql.prisma`
- **Connection String**: `POSTGRES_PRISMA_URL` or `DATABASE_URL` environment variable
- **Advantages**:
  - Scalable relational database
  - Connection pooling support
  - Advanced query capabilities

#### Vercel Production Environment
- **Database Type**: PostgreSQL via Vercel Postgres
- **Primary Schema**: `prisma/schema.vercel.prisma`
- **Fallback Schemas**: 
  - `prisma/schema.vercel-safe.prisma` (without PostgreSQL extensions)
  - `prisma/schema.database-url.prisma` (simplified for DATABASE_URL only)
  - `prisma/schema.env.test.prisma` (for testing environments)
- **Connection Strings**:
  - Primary: `POSTGRES_PRISMA_URL` environment variable
  - Direct (for Edge functions): `POSTGRES_URL_NON_POOLING` environment variable
- **Advantages**:
  - Seamless integration with Vercel deployments
  - Edge function compatibility
  - Built-in connection management
  - Fallback schema system for robustness

### Multi-Schema Approach
The system uses a series of schema files tailored for different environments and scenarios:

1. **schema.local.prisma**: Optimized SQLite schema for local development
2. **schema.vercel.prisma**: Primary PostgreSQL schema for Vercel with extensions
3. **schema.vercel-safe.prisma**: Simplified PostgreSQL schema without extensions
4. **schema.postgresql.prisma**: Standard PostgreSQL schema for production
5. **schema.database-url.prisma**: Minimal schema using only DATABASE_URL
6. **schema.env.test.prisma**: Testing environment schema

The system attempts to validate each schema in order until it finds one that works with the current environment, ensuring maximum compatibility across different deployment scenarios.

### Database Environment Detection
The database configuration is managed by the following components:

1. **Prisma Client Initialization**:
   - `src/lib/prisma-client.ts` detects the environment and selects the appropriate connection details
   - Handles connection pooling configuration
   - Provides retry logic for transient errors
   - Manages connection lifecycle

2. **Schema Management**:
   - Multi-schema architecture with progressive fallbacks
   - Automatic schema validation and selection
   - Auto-healing local environment with `scripts/setup-local.js`
   - Environment-specific optimizations

3. **Migration Scripts**:
   - `scripts/db-migrate.js` for database migrations with multi-schema support
   - Environment-aware migration process
   - Automatic schema validation and fallback system
   - Handles schema validation failures gracefully

4. **Local Development Setup**:
   - `scripts/setup-local.js` for automatic local environment configuration
   - Intelligently updates .env file with correct values
   - Built-in schema validation and debugging
   - Handles paths with spaces and special characters

5. **Deployment Configuration**:
   - `vercel.json` includes database-specific build commands
   - Environment variable configuration
   - `scripts/vercel-check.js` verifies Vercel environment setup
   - Fallback build process on schema validation failures

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
- Environment-specific migration processes

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
   - Visual style selection with interactive examples
   - Logo upload and positioning
   - Live preview of customizations
   - Tabs for organizing customization options
   
3. **QR Customization Page**: Dedicated page for QR code customization
   - Full-screen customization interface
   - Real-time preview of changes
   - Visual style gallery with interactive examples
   - Direct download capabilities
   
### Customization Features
- **Color Options**: Customize foreground and background colors with color picker
- **Visual Style Gallery**: Interactive examples of style combinations that can be applied with a single click
- **Pre-defined Style Templates**: Ready-to-use style configurations with visual previews
- **Logo Integration**: Upload and embed logos with customizable size, opacity, and border options
- **Size & Margin**: Adjustable QR code size and margin settings
- **Error Correction**: Configurable error correction levels to balance density and scan reliability
- **Download Options**: Direct download of customized QR codes in high resolution

### Known Issues
- **Style Color Application**: Custom colors only apply correctly to Forest and Classic styles, other styles do not properly render custom colors
- **Style-Color Compatibility**: Some color combinations don't render appropriately with certain styles
- **Style-Specific Rendering**: Each style template requires specific handling for color application that is currently incomplete

## Analytics & Tracking

### Current Implementation
The system currently includes basic analytics tracking for QR code scans:

- **Scan Counting**: Each QR code scan is recorded and associated with the QR code
- **Timestamp Tracking**: Scan times are recorded to enable time-based analysis
- **Dashboard Visualization**: Basic charts and metrics displayed in the user dashboard
- **Per-QR Code Analytics**: Individual analytics views for each QR code
- **Data Aggregation**: Summary statistics across all user QR codes

### Planned Enhancements
Additional analytics features planned for upcoming releases:

- **Geographic Data**: Country and region information for scan origins
- **Device Information**: Browser, operating system, and device type tracking
- **Session Analysis**: Unique vs. returning visitor analysis
- **Conversion Tracking**: Integration with destination URLs for conversion tracking
- **Export Functionality**: Data export in CSV and JSON formats

### Implementation Architecture
The analytics system uses a lightweight, privacy-focused tracking approach:

- **Redirect Handler**: Records basic scan information during redirect processing
- **Aggregation Service**: Aggregates raw scan data into useful metrics
- **Throttled Updates**: Updates dashboard in real-time without overwhelming the database
- **Privacy Controls**: No personal information collection beyond what's necessary

### Known Issues
- **Authentication Rate Limiting**: The current NextAuth.js configuration occasionally triggers "Too many requests" errors during logout/login sequences
- **Session Management**: Session handling needs optimization to prevent API throttling
- **Token Refresh**: Token refresh mechanism requires improvement to avoid session interruptions

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
  - **Issue**: Current rate limiting is sometimes too aggressive, causing "Too many requests" errors
  - **Planned Fix**: Implementing more intelligent rate limiting with session-aware thresholds
- Session management with JWT
- Secure cookie handling

### Authentication Improvements (Planned)
The following improvements are planned to address current authentication issues:

1. **Optimized Rate Limiting**:
   - Session-aware rate limiting to prevent false positives
   - Gradual throttling instead of hard cutoffs
   - Better client-side handling of rate limit errors

2. **Token Management**:
   - Improved token refresh mechanism
   - Background token refreshing to prevent session interruptions
   - Better error handling for token expiration

3. **Session Stability**:
   - Enhanced NextAuth.js configuration
   - More resilient session persistence
   - Reduced API calls during session validation

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
1. Local development with SQLite (automatically configured)
2. Commit changes to version control
3. CI/CD pipeline runs tests
4. Deployment to staging environment
5. QA testing
6. Deployment to production

### Infrastructure
- Vercel for Next.js deployment
- PostgreSQL database via Vercel Postgres
- CDN for static assets
- CI/CD pipeline for automated testing and deployment

### Environment-Specific Builds
The deployment process uses environment-specific configuration:

1. **Build Process**:
   - `npm run vercel-build` for Vercel deployments with enhanced validation
   - Multi-step schema selection with progressive fallbacks
   - Verification of environment variables with detailed reporting
   - Cross-environment compatibility checks

2. **Database Configuration System**:
   - Automatic schema selection based on environment
   - Schema validation with fallback mechanisms:
     - Primary: `schema.vercel.prisma` (PostgreSQL with extensions)
     - Fallback 1: `schema.vercel-safe.prisma` (PostgreSQL without extensions)
     - Fallback 2: `schema.database-url.prisma` (simplified connections)
     - Fallback 3: `schema.env.test.prisma` (testing configuration)
   - Detailed validation reporting for easier troubleshooting
   - Self-healing mechanisms for local development

3. **Connection Management**:
   - Optimized connection parameters for serverless environments
   - Connection pooling with PgBouncer integration
   - Schema caching control for preventing prepared statement conflicts
   - Connection lifecycle management with proper cleanup
   - Retry mechanisms with exponential backoff for transient errors
   - Health checks to verify database connectivity

4. **Configuration Files**:
   - `vercel.json` for Vercel-specific settings
   - `.env` files for different environments
   - Memory allocation optimizations for API functions
   - Build command customization
   - Environment variable configuration templates

## Future Enhancements

### Immediate Priorities (Next 4 Weeks)
- **QR Code Customization Fixes**:
  - Fix color application issues for all QR code style templates
  - Ensure consistent color rendering across all styles
  - Implement style-specific color handling
  - Create comprehensive test suite for style-color combinations
  - Add validation to prevent invalid color and style pairings

- **Authentication Improvements**:
  - Fix rate limiting issues in NextAuth.js configuration
  - Implement more intelligent token refresh mechanism
  - Optimize session management to prevent "Too many requests" errors
  - Add better error handling for authentication failures
  
- **Analytics Dashboard Refinements**:
  - Add date range filtering to existing analytics dashboard
  - Implement more advanced visualization options
  - Add data comparison features (week-over-week, month-over-month)
  - Optimize analytics data loading for faster dashboard rendering
  - Add printable report generation

### Short-term Enhancements (Next Quarter)
- Bulk operations for QR codes and redirects
- API for third-party integrations
- Automatic database backups and monitoring
- Performance optimizations for high-traffic QR codes

### Medium-term Enhancements (Next 6 Months)
- Advanced redirect rules (geo-based, time-based)
- A/B testing functionality for different redirect destinations
- Webhook notifications for QR code scans
- Team collaboration features with role-based access control

### Long-term Vision (12+ Months)
- White-label solution for agencies and enterprises
- Mobile application for on-the-go QR code management
- Integration with popular marketing platforms
- AI-powered analytics and optimization suggestions

## Maintenance & Updates

### Current Issues Being Addressed
- **QR Code Style Colors** *(Priority: High)*:
  - **Issue**: Custom colors only display correctly for Forest and Classic styles
  - **Cause**: Style-specific color application logic is incomplete for remaining style templates
  - **Impact**: Users cannot effectively customize colors for all available style options
  - **Solution**: Implementing proper color mapping for each style template and adding comprehensive test suite
  - **Timeline**: Fix scheduled for completion within the next 2 weeks

- **Authentication Rate Limiting** *(Priority: High)*:
  - **Issue**: Users occasionally receive "Too many requests" errors after logout/login sequences
  - **Error**: `ClientFetchError: Too many requests. Please try again in X seconds.`
  - **Cause**: NextAuth.js default rate limiting is too aggressive for our current usage patterns
  - **Impact**: Users may experience session interruptions and need to wait before logging in again
  - **Solution**: Implementing more intelligent rate limiting and optimizing session management
  - **Timeline**: Fix scheduled for completion within the next 2 weeks

### Completed Major Updates
- **March 2025**: Enhanced database configuration with multi-schema approach and automatic environment detection
- **January 2025**: Basic analytics implementation with scan counting and visualization
- **May 2024**: Comprehensive QR code customization system with color, style, and logo options

### Regular Maintenance
- Weekly dependency updates
- Monthly security reviews
- Quarterly performance optimizations

### Version Update Process
- Semantic versioning (MAJOR.MINOR.PATCH)
- Release notes for all non-patch updates
- Database migration procedures documented for each version

---

*This specifications document is updated regularly to reflect the current state of the project and future plans.*

*Last updated: March 25, 2025* 