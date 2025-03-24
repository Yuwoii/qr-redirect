# QR Code Customization Component

This project provides enhanced QR code customization capabilities, allowing you to create beautiful, branded QR codes with custom colors, shapes, and even embedded logos.

## Features

### Enhanced QR Code Generation
- **Custom Colors**: Change the foreground and background colors of your QR codes
- **Custom Shapes**: Choose from different dot shapes (square, rounded, dots) and corner styles
- **Logo Embedding**: Add your brand logo to the center of the QR code
- **Error Correction**: Adjust the error correction level to balance between reliability and data capacity
- **Size and Margin**: Customize the size and margins of your QR codes

### Components
- **EnhancedQRCode**: The main component that combines display and customization features
- **QRCodeCustomizer**: A powerful UI for customizing QR code appearance
- **QRCodeDisplay**: A simple component to display QR codes with various options

## Installation

No additional installation is required as all necessary components are included in the project. However, the following dependencies are used:

- `qrcode` (v1.5.3+): Core QR code generation library
- `canvas`: For advanced QR code manipulation
- `react-color`: Color picker component
- UI components from `@radix-ui` and styled with Tailwind CSS

## Usage

### Basic Usage

```jsx
import EnhancedQRCode from '@/components/EnhancedQRCode';

export default function MyPage() {
  return (
    <div>
      <h1>My QR Code</h1>
      <EnhancedQRCode
        url="https://example.com"
        size={250}
        showCustomizeButton={true}
        showDownloadButton={true}
      />
    </div>
  );
}
```

### With Initial Custom Options

```jsx
import EnhancedQRCode from '@/components/EnhancedQRCode';

export default function BrandedQRCode() {
  return (
    <div>
      <h1>Branded QR Code</h1>
      <EnhancedQRCode
        url="https://example.com"
        size={250}
        initialOptions={{
          color: { dark: '#0f766e', light: '#f0fdfa' },
          style: { dotShape: 'rounded', cornerShape: 'rounded' },
          errorCorrectionLevel: 'H' // High error correction for better logo support
        }}
      />
    </div>
  );
}
```

### Using the QRCodeCustomizer Component Directly

If you want to build a custom UI around the QR code customizer:

```jsx
import { useState } from 'react';
import QRCodeCustomizer from '@/components/QRCodeCustomizer';
import { QRCodeCustomOptions } from '@/lib/qrcode';

export default function CustomQRCodeEditor() {
  const [options, setOptions] = useState<QRCodeCustomOptions>({});
  
  const handleCustomized = (newOptions: QRCodeCustomOptions) => {
    setOptions(newOptions);
    console.log('QR code customized with options:', newOptions);
    // Do something with the customized options
  };
  
  return (
    <div>
      <h1>Custom QR Code Editor</h1>
      <QRCodeCustomizer
        url="https://example.com"
        initialOptions={options}
        onCustomized={handleCustomized}
      />
    </div>
  );
}
```

### Demo Page

A demo page showcasing all the features is available at `/qr-demo`. This page demonstrates:
- Basic QR code generation with URL input
- QR code customization with the full suite of options
- Example QR codes with different styles
- Download functionality

## API Reference

### EnhancedQRCode Component

```tsx
interface EnhancedQRCodeProps {
  url: string;                            // The URL to encode in the QR code
  size?: number;                          // QR code size (default: 300)
  className?: string;                     // Additional CSS classes
  initialOptions?: Partial<QRCodeCustomOptions>; // Initial customization options
  onOptionsChange?: (options: QRCodeCustomOptions) => void; // Callback when options change
  showCustomizeButton?: boolean;          // Whether to show the customize button (default: true)
  showDownloadButton?: boolean;           // Whether to show the download button (default: true)
}
```

### QRCodeCustomOptions Interface

```tsx
interface QRCodeCustomOptions {
  // Standard QR code options
  margin?: number;                        // QR code margin (default: 1)
  width?: number;                         // QR code width (default: 300)
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction level (default: 'M')
  
  // Color options
  color?: {
    dark?: string;                        // Dark module color (default: '#000000')
    light?: string;                       // Light module color (default: '#ffffff')
  };
  
  // Logo options
  logo?: {
    src?: string;                         // Logo image source (URL or data URL)
    width?: number;                       // Logo width (default: 20% of QR code size)
    height?: number;                      // Logo height (default: same as width)
    opacity?: number;                     // Logo opacity (default: 1)
    borderRadius?: number;                // Logo border radius (default: 0)
    border?: boolean;                     // Whether to add a border (default: true)
    borderWidth?: number;                 // Border width (default: 5)
    borderColor?: string;                 // Border color (default: '#ffffff')
  };
  
  // Style options
  style?: {
    dotShape?: 'square' | 'rounded' | 'dots'; // Shape of QR code dots (default: 'square')
    cornerShape?: 'square' | 'rounded';       // Shape of corners (default: 'square')
    cornerDotStyle?: 'square' | 'dot';        // Style of corner dots (default: 'square')
  };
}
```

## Technical Implementation

The QR code customization is implemented using a combination of:

1. The `qrcode` library for base QR code generation
2. Canvas manipulation to apply custom styles and embed logos
3. React components for the UI

The implementation handles:
- Proper QR code generation with proper error correction
- Maintaining QR code readability even with customizations
- Responsive UI for all screen sizes
- Real-time preview of customizations

## Best Practices

1. **Error Correction Level**: When adding a logo, use 'H' (high) error correction level
2. **Logo Size**: Keep the logo size below 25% of the QR code for better readability
3. **Color Contrast**: Maintain good contrast between dark and light colors
4. **Testing**: Always test your QR codes with multiple scanner apps and devices

## Demo Page

Visit `/qr-demo` to see all the QR code customization features in action. 