# QR Redirect: System Specifications

Last Updated: May 1, 2025

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
- QR code customization with advanced styling options and logo integration
- QR code download in various formats (PNG, SVG)
- Redirect tracking and comprehensive analytics
- Dashboard for managing QR codes and viewing detailed statistics
- Geographic analytics with region-specific data
- Multi-environment database configuration with automatic schema selection
- Fully customizable QR code styles with reliable color application

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
│   │   ├── qr-test/         # QR code testing page
│   │   ├── qr-debug/        # QR code debugging utility
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
│       ├── qrcode.ts        # QR code generation utilities with style customization
│       ├── analytics.ts     # Analytics tracking
│       └── ...
├── docs/                    # Documentation
│   ├── database-configuration.md # Detailed database configuration docs
│   └── ...
├── tools/                   # Testing and validation tools
│   ├── validate-qr.js       # QR code validation script
│   ├── test-qr-library.js   # QR code library testing
│   ├── verify-fix.js        # Verification for color application fixes
│   └── ...
├── verification-results/    # Test result documentation
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
  customization Json?     // Stores QR code customization options

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
  visits        Visit[]   // Relation to visit records

  @@index([qrCodeId]) // Add index for QR code lookups
  @@index([isActive]) // Add index for active redirects
  @@index([createdAt]) // Add index for sorting
}
```

### Visit Model
```prisma
model Visit {
  id            String    @id @default(cuid())
  redirectId    String
  redirect      Redirect  @relation(fields: [redirectId], references: [id], onDelete: Cascade)
  timestamp     DateTime  @default(now())
  ipAddress     String?   // Hashed for privacy
  userAgent     String?
  country       String?
  region        String?
  city          String?
  device        String?
  browser       String?

  @@index([redirectId])
  @@index([timestamp])
  @@index([country])
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
- `POST /api/qrcodes/:id/customize` - Apply customization to QR code

### Redirects
- `GET /api/redirects/:qrCodeId` - List redirects for a QR code
- `POST /api/redirects` - Create a new redirect
- `PUT /api/redirects/:id` - Update a redirect
- `DELETE /api/redirects/:id` - Delete a redirect

### Analytics
- `GET /api/analytics/:qrCodeId` - Get analytics data for a QR code
- `GET /api/analytics/:qrCodeId/summary` - Get summary statistics for a QR code
- `GET /api/analytics/:qrCodeId/visits` - Get detailed visit data for a QR code
- `GET /api/analytics/:qrCodeId/geography` - Get geographic data for a QR code
- `GET /api/analytics/:qrCodeId/devices` - Get device and browser data for a QR code
- `GET /api/analytics/:qrCodeId/export` - Export analytics data in CSV format

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
   - Style selection with visual templates
   - Color customization with color picker
   - Logo embedding with size and position control
   - Preview and download options
7. **Analytics Dashboard**: Comprehensive analytics view
   - Time-based visualizations
   - Geographic data
   - Device and browser statistics
   - Export functionality

### Components
1. **QRCodeCard**: Display and actions for a QR code
2. **CreateQRForm**: Form for creating new QR codes
3. **UpdateRedirectForm**: Form for updating redirects
4. **AnalyticsChart**: Visual representation of QR code statistics
5. **Navigation**: Site navigation and user menu
6. **EnhancedQRCode**: Component for displaying customized QR codes
7. **QRCodeCustomizer**: UI for QR code visual customization
8. **ColorPicker**: Component for selecting and previewing colors
9. **StyleGallery**: Gallery of available QR code style templates
10. **LogoUploader**: Component for uploading and positioning logos

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
- Improved rate limiting with session-aware thresholds

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
3. QR code is generated using the enhanced qrcode.js library
4. Custom styles and colors are applied based on user preferences
5. Logo is embedded if provided
6. QR code can be downloaded in PNG or SVG format

### QR Code Options
- Size customization (width and height)
- Error correction level (L, M, Q, H)
- Format options (PNG, SVG)
- Margin customization
- Color customization (foreground and background colors)
- Style options (dot shape, corner shape, corner dot style)
- Logo embedding with customizable size, position, and opacity

### QR Code Customization Components
1. **EnhancedQRCode**: Main component for displaying customized QR codes
   - Handles rendering of styled QR codes with consistent color application
   - Includes download functionality with high-resolution options
   - Provides real-time preview of changes
   - Dialog-based customization interface
   
2. **QRCodeCustomizer**: UI component for customizing QR codes
   - Color selection with color picker and pre-defined color themes
   - Visual style selection with interactive examples
   - Logo upload and positioning with preview
   - Live preview of customizations with accurate rendering
   - Tabs for organizing customization options
   
3. **QR Customization Page**: Dedicated page for QR code customization
   - Full-screen customization interface
   - Real-time preview of changes with accurate color representation
   - Visual style gallery with interactive examples
   - Direct download capabilities with format options
   
### Customization Features
- **Color Options**: Customize foreground and background colors with color picker
- **Visual Style Gallery**: Interactive examples of style combinations that can be applied with a single click
- **Pre-defined Style Templates**: Ready-to-use style configurations with visual previews
- **Logo Integration**: Upload and embed logos with customizable size, opacity, and border options
- **Size & Margin**: Adjustable QR code size and margin settings
- **Error Correction**: Configurable error correction levels to balance density and scan reliability
- **Download Options**: Direct download of customized QR codes in high resolution

### QR Code Style Rendering
The system supports multiple QR code styles with consistent color application:

1. **Classic Style**: Standard square QR code modules
2. **Rounded Style**: QR code modules with rounded corners
3. **Dots Style**: Circular modules for a modern look
4. **Corner Dots Style**: Special dot styling for the corner patterns
5. **Hybrid Style**: Combination of rounded corners and special corner dots

All styles correctly apply custom colors through a robust implementation that handles each style's unique rendering requirements. Color application has been verified through comprehensive testing to ensure consistency across all style templates.

### QR Code Testing and Verification
The system includes comprehensive testing tools for QR code generation:

1. **Validation Script**: Verifies basic QR code generation
2. **Test Library**: Tests all style and color combinations
3. **Verification Tool**: Comprehensive testing with detailed reporting
4. **Color Analysis**: Pixel-level color verification to ensure proper rendering

These tools have been used to verify that all QR code styles correctly apply custom colors, with test results available in the `verification-results` directory.

## Analytics & Tracking

### Current Implementation
The system includes comprehensive analytics tracking for QR code scans:

- **Scan Counting**: Each QR code scan is recorded and associated with the QR code
- **Timestamp Tracking**: Scan times are recorded to enable time-based analysis
- **Dashboard Visualization**: Interactive charts and metrics displayed in the user dashboard
- **Per-QR Code Analytics**: Individual analytics views for each QR code
- **Data Aggregation**: Summary statistics across all user QR codes
- **Geographic Data**: Country and region information for scan origins
- **Device Tracking**: Information about devices and browsers used for scanning

### Analytics Features
- **Time-based Analysis**: View scan data by hour, day, week, or month
- **Geographic Visualization**: Map-based display of scan locations
- **Device Breakdown**: Charts showing device types and browsers
- **Trend Analysis**: Track changes in scan patterns over time
- **Comparative Analysis**: Compare performance across different QR codes
- **Export Options**: Export data in CSV format for further analysis

### Implementation Architecture
The analytics system uses a lightweight, privacy-focused tracking approach:

- **Redirect Handler**: Records basic scan information during redirect processing
- **Aggregation Service**: Aggregates raw scan data into useful metrics
- **Throttled Updates**: Updates dashboard in real-time without overwhelming the database
- **Privacy Controls**: Personal information is anonymized for privacy compliance

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
- Optimized rate limiting on authentication endpoints
  - Session-aware thresholds to prevent false positives
  - Gradual throttling instead of hard cutoffs
  - Improved error handling for rate limit errors
- Session management with JWT
- Secure cookie handling

### Token Management
- Improved token refresh mechanism
- Background token refreshing to prevent session interruptions
- Better error handling for token expiration

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

### QR Code Specific Testing
- Style and color combination verification
- Scanning compatibility testing
- Logo placement validation
- Visual consistency checks

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
- **Analytics Dashboard Enhancements**:
  - Add date range filtering to existing analytics dashboard
  - Implement more advanced visualization options
  - Add data comparison features (week-over-week, month-over-month)
  - Optimize analytics data loading for faster dashboard rendering
  - Add printable report generation

- **Usability Improvements**:
  - Improve dashboard organization for better workflow
  - Add bulk operations for QR codes and redirects
  - Enhance mobile responsiveness for on-the-go management
  - Create guided tours for new users
  
- **Performance Optimizations**:
  - Implement caching for frequently accessed QR codes
  - Optimize database queries for faster analytics display
  - Improve loading states and performance feedback

### Short-term Enhancements (Next Quarter)
- API for third-party integrations
- Automatic database backups and monitoring
- Performance optimizations for high-traffic QR codes
- Advanced QR code customization options (gradients, patterns)
- Enhanced security features (2FA, improved session management)

### Medium-term Enhancements (Next 6 Months)
- Advanced redirect rules (geo-based, time-based)
- A/B testing functionality for different redirect destinations
- Webhook notifications for QR code scans
- Team collaboration features with role-based access control
- Advanced analytics with heatmaps and user flow visualization

### Long-term Vision (12+ Months)
- White-label solution for agencies and enterprises
- Mobile application for on-the-go QR code management
- Integration with popular marketing platforms
- AI-powered analytics and optimization suggestions
- Advanced QR code campaigns with multi-stage journeys

## Maintenance & Updates

### Recently Completed Updates
- **QR Code Style Color Fix** *(Completed: April 2025)*:
  - Fixed color application for all QR code style templates
  - Implemented comprehensive testing for style-color combinations
  - Added validation for color and style compatibility
  - Created detailed documentation of the fix with verification results

- **Authentication Improvements** *(Completed: April 2025)*:
  - Fixed rate limiting issues in NextAuth.js configuration
  - Implemented more intelligent token refresh mechanism
  - Added better error handling for authentication failures
  - Optimized session management to prevent "Too many requests" errors

- **Database Configuration Enhancement** *(Completed: March 2025)*:
  - Enhanced database configuration with multi-schema approach
  - Implemented automatic environment detection
  - Created fallback mechanisms for database configuration
  - Added comprehensive error handling for database connections

- **Analytics Implementation** *(Completed: January 2025)*:
  - Implemented basic analytics tracking for QR code scans
  - Created visualization components for scan data
  - Added geographic and device tracking features
  - Implemented export functionality for analytics data

### Regular Maintenance
- Weekly dependency updates
- Monthly security reviews
- Quarterly performance optimizations
- Continuous monitoring of error rates and performance metrics

### Version Update Process
- Semantic versioning (MAJOR.MINOR.PATCH)
- Release notes for all non-patch updates
- Database migration procedures documented for each version
- Automatic database schema updates for compatible changes

---

*This specifications document is updated regularly to reflect the current state of the project and future plans.*

*Last updated: May 1, 2025* 