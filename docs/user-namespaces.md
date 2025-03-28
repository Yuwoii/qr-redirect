# User Namespaces for QR Codes

## Overview

The User Namespaces feature introduces a dedicated namespace for each user's QR codes. This ensures that slugs are unique per user rather than globally, which prevents namespace collisions and allows multiple users to create QR codes with the same slug.

## Benefits

1. **Slug Independence**: Each user can create QR codes with their preferred slugs without worrying about global uniqueness constraints.
2. **Better Organization**: QR codes are logically grouped by user namespace.
3. **Enhanced Security**: The namespaced URLs provide an additional layer of security, making it harder to guess or enumerate QR code URLs.
4. **Scalability**: The system can handle many more users without running into slug conflicts.
5. **Flexibility**: Users can create more intuitive, memorable slugs for their QR codes.

## Technical Implementation

### Database Changes

- Added a `namespace` field to the `User` model that is unique and automatically generated using CUID.
- Modified the `QRCode` model to enforce uniqueness of `slug` per user instead of globally.

### URL Structure

QR codes now support two URL formats:

1. **Namespaced URL (recommended)**: `/r/[namespace]/[slug]`
2. **Legacy URL (for backward compatibility)**: `/r/[slug]`

The system checks both formats when resolving a QR code redirect, ensuring backward compatibility while encouraging the use of the new namespaced format.

### Migration

Existing users are automatically assigned a unique namespace. A migration script (`tools/add-namespaces.js`) handles this process:

1. Identifies users without a namespace
2. Generates a unique namespace for each user
3. Updates the user record with the new namespace

### Frontend Changes

The QR code creation and display interfaces have been updated to:

1. Show the user's namespace when creating a new QR code
2. Display both the namespaced and legacy URLs on the QR code detail page
3. Generate QR codes using the namespaced URL format

## Best Practices

1. **Always use namespaced URLs**: When sharing QR code URLs directly, use the namespaced format to ensure uniqueness.
2. **Test scans**: Always test your QR codes after creation to ensure they redirect properly.
3. **Update existing materials**: Consider updating any printed or published materials to use the new namespaced URLs for better reliability.

## Backward Compatibility

To ensure a smooth transition:

- Legacy URLs (without namespaces) will continue to work for all existing QR codes.
- The system first attempts to resolve a legacy URL before checking for namespaced URLs.
- QR code downloads and displays now default to using the namespaced URL format.

## Future Considerations

In future updates, we may:

1. Provide options for users to customize their namespace
2. Gradually phase out support for legacy URLs
3. Add analytics that differentiate between accesses via legacy and namespaced URLs 