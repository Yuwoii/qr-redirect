# QR Code Customization Testing Guide

## Testing the QR Code Customization Fix

This document provides a comprehensive guide for testing the QR code color application fix to ensure that all style templates correctly apply the user-selected colors.

## Test Page

A dedicated test page has been created at `/qr-test` that automatically generates QR codes for all style and color combinations. This page provides:

1. Visual verification of color application
2. Statistical analysis of color matching success
3. Diagnostic information for each style-color combination

## Manual Testing Steps

To thoroughly test the QR code customization fix, follow these steps:

### 1. Basic Functionality Test

1. Navigate to the dashboard and create a new QR code
2. Access the QR code customization page from the dashboard
3. Verify that all style templates are visible with their preview images
4. Confirm that the color pickers work and update the preview in real-time

### 2. Style-Color Combination Test

For each of the following style templates:
- Classic
- Forest
- Rounded
- Dots
- Corner Dots
- Hybrid

Test with these color combinations:
- Dark: #000000 (Black), Light: #FFFFFF (White) - Default
- Dark: #0F766E (Green), Light: #ECFDF5 (Light Green)
- Dark: #7E22CE (Purple), Light: #F5F3FF (Light Purple)
- Dark: #BE123C (Red), Light: #FFF1F2 (Light Red)
- Dark: #B45309 (Amber), Light: #FFFBEB (Light Amber)
- Dark: #0063B3 (Blue), Light: #E6F0FF (Light Blue)

### 3. Verification Checklist

For each style-color combination, verify:

- [ ] The QR code background matches the selected light color
- [ ] All dots/modules in the QR code match the selected dark color
- [ ] The corner squares match the selected dark color
- [ ] The style-specific features (rounded corners, dots) maintain their shape
- [ ] The QR code is scannable with a standard QR reader
- [ ] The QR code preview in the customizer matches the generated QR code

### 4. Edge Case Testing

Test the following edge cases:

- [ ] Very high contrast colors (e.g., black/white)
- [ ] Low contrast colors (e.g., dark blue on dark purple)
- [ ] Non-standard colors (using the color picker's hex input)
- [ ] Rapidly switching between styles while customizing
- [ ] Adding a logo to QR codes with different styles

### 5. Browser Compatibility

Test the QR code customization on:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome for Android)

## Automated Testing

The `/qr-test` page includes automated verification:

1. It renders all style-color combinations
2. It analyzes the colors in the generated QR codes
3. It compares the actual colors to the expected colors
4. It reports success rates per style and overall

## Debugging Tools

For debugging color application issues, the test page includes:

1. Color analysis that extracts actual colors from the rendered QR codes
2. Color swatch comparison showing expected vs. actual colors
3. Generation timing to identify performance issues
4. Success/failure indicators for each style-color combination

## Expected Results

After the fix, all style templates should correctly apply the specified colors. The expected success rate should be close to 100% for all styles.

## Reporting Issues

If any issues are found during testing, document the following:

1. The specific style and color combination
2. The actual vs. expected color values
3. The browser and device used
4. Screenshot of the issue
5. Steps to reproduce

## QR Code Generation Process

For reference, the QR code generation process follows these steps:

1. User selects style and colors in the customization UI
2. The options are passed to the `drawCustomQRCode` function
3. The canvas background is filled with the light color
4. Each module is drawn based on its position and the selected style
5. The dark color is applied to each module during drawing
6. Style-specific shapes (rounded corners, dots) are rendered
7. The final canvas is converted to a data URL for display

This comprehensive testing approach ensures that the QR code customization feature works correctly for all style templates and color combinations. 