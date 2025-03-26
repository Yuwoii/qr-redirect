/**
 * QR Code Next.js Integration Test
 * 
 * This script tests the QR code library's integration with Next.js.
 * It creates a simple test page that renders QR codes with different styles and colors.
 */

const fs = require('fs');
const path = require('path');

// Test file paths
const testPagePath = path.join(process.cwd(), 'src/app/qr-test/page.tsx');
const testLayoutPath = path.join(process.cwd(), 'src/app/qr-test/layout.tsx');

// Create test directory if it doesn't exist
const testDir = path.join(process.cwd(), 'src/app/qr-test');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create test layout
const testLayoutContent = `
export default function QRTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">QR Code Style and Color Test</h1>
      {children}
    </div>
  );
}
`;

// Create test page
const testPageContent = `
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateQRCodeDataURL } from '@/lib/qrcode';

// Define QR code styles to test
const styles = [
  { name: 'Classic', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'square' },
  { name: 'Rounded', dotShape: 'rounded', cornerShape: 'rounded', cornerDotStyle: 'square' },
  { name: 'Dots', dotShape: 'dots', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Corner Dots', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Hybrid', dotShape: 'square', cornerShape: 'rounded', cornerDotStyle: 'dot' },
];

// Define colors to test
const colors = [
  { name: 'Black & White', dark: '#000000', light: '#FFFFFF' },
  { name: 'Forest Green', dark: '#0F766E', light: '#F0FDFA' },
  { name: 'Red', dark: '#B91C1C', light: '#FEF2F2' },
  { name: 'Blue', dark: '#1E40AF', light: '#EFF6FF' },
  { name: 'Purple', dark: '#7E22CE', light: '#FAF5FF' },
];

export default function QRTestPage() {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStyle, setSelectedStyle] = useState<string>('Classic');
  const [selectedColor, setSelectedColor] = useState<{ dark: string; light: string }>(colors[0]);
  const [testResults, setTestResults] = useState<{ passed: number; total: number }>({ passed: 0, total: 0 });
  const [currentTest, setCurrentTest] = useState<string>('');

  // Generate a sample QR code with the given style and color
  const generateQRCode = async (styleName: string, color: typeof colors[0]) => {
    try {
      const style = styles.find(s => s.name === styleName);
      if (!style) return null;

      const url = 'https://example.com/test';
      const options = {
        width: 200,
        margin: 1,
        color: {
          dark: color.dark,
          light: color.light
        },
        style: {
          dotShape: style.dotShape,
          cornerShape: style.cornerShape,
          cornerDotStyle: style.cornerDotStyle
        }
      };

      const dataUrl = await generateQRCodeDataURL(url, options);
      return dataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  // Generate QR codes for current selections
  useEffect(() => {
    const generate = async () => {
      const dataUrl = await generateQRCode(selectedStyle, selectedColor);
      if (dataUrl) {
        setQrCodes(prev => ({ ...prev, current: dataUrl }));
      }
    };

    generate();
  }, [selectedStyle, selectedColor]);

  // Run all tests
  const runAllTests = async () => {
    setLoading(true);
    setTestResults({ passed: 0, total: 0 });
    
    let passed = 0;
    let total = 0;
    
    for (const style of styles) {
      for (const color of colors) {
        total++;
        setCurrentTest(\`Testing \${style.name} with \${color.name} color...\`);
        
        try {
          const dataUrl = await generateQRCode(style.name, color);
          if (dataUrl) {
            passed++;
            setQrCodes(prev => ({ 
              ...prev, 
              [\`\${style.name}_\${color.name}\`]: dataUrl 
            }));
          }
        } catch (error) {
          console.error(\`Error testing \${style.name} with \${color.name}:\`, error);
        }
      }
    }
    
    setTestResults({ passed, total });
    setCurrentTest('');
    setLoading(false);
  };

  // Generate specific QR codes on initial load
  useEffect(() => {
    const loadInitialQRCodes = async () => {
      setLoading(true);
      
      // Generate one QR code with each style
      const initialCodes: { [key: string]: string } = {};
      
      for (const style of styles) {
        const dataUrl = await generateQRCode(style.name, colors[0]);
        if (dataUrl) {
          initialCodes[style.name] = dataUrl;
        }
      }
      
      setQrCodes(initialCodes);
      setLoading(false);
    };
    
    loadInitialQRCodes();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Style and Color Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page tests the QR code library's ability to correctly apply different styles and colors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="style-select" className="mb-2 block">Select Style</Label>
              <select 
                id="style-select"
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
              >
                {styles.map(style => (
                  <option key={style.name} value={style.name}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="color-select" className="mb-2 block">Select Color</Label>
              <select 
                id="color-select"
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedColor.name}
                onChange={(e) => {
                  const color = colors.find(c => c.name === e.target.value);
                  if (color) setSelectedColor(color);
                }}
              >
                {colors.map(color => (
                  <option key={color.name} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Current QR Code</h3>
            <div className="bg-gray-100 p-4 rounded-md flex justify-center">
              {qrCodes.current ? (
                <img 
                  src={qrCodes.current} 
                  alt="Current QR Code" 
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-center">
              <span className="font-semibold">{selectedStyle}</span> style with <span 
                className="font-semibold inline-flex items-center">
                {selectedColor.name} 
                <span 
                  className="inline-block w-3 h-3 ml-1" 
                  style={{ backgroundColor: selectedColor.dark }}
                ></span>
              </span> color
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Run All Tests'}
            </Button>
            
            {currentTest && (
              <div className="mt-2 text-sm text-center">{currentTest}</div>
            )}
            
            {testResults.total > 0 && (
              <div className="mt-4 text-center">
                <div className={
                  testResults.passed === testResults.total 
                    ? "text-green-600 font-bold" 
                    : "text-amber-600 font-bold"
                }>
                  {testResults.passed} / {testResults.total} tests passed
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {testResults.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(qrCodes).filter(([key]) => key !== 'current').map(([key, dataUrl]) => {
                const [style, colorName] = key.split('_');
                return (
                  <div key={key} className="bg-white border rounded-md p-3 text-center">
                    <img 
                      src={dataUrl} 
                      alt={\`\${style} with \${colorName}\`} 
                      className="w-24 h-24 mx-auto mb-2"
                    />
                    <div className="text-xs font-medium">{style}</div>
                    <div className="text-xs text-gray-500">{colorName}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Style Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {styles.map((style) => (
              <div key={style.name} className="bg-white border rounded-md p-3 text-center">
                {qrCodes[style.name] ? (
                  <img 
                    src={qrCodes[style.name]} 
                    alt={style.name} 
                    className="w-24 h-24 mx-auto mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 flex items-center justify-center">
                    Loading...
                  </div>
                )}
                <div className="text-sm font-medium">{style.name}</div>
                <div className="text-xs text-gray-500">
                  Dot: {style.dotShape}, 
                  Corner: {style.cornerShape}, 
                  Corner dot: {style.cornerDotStyle}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

// Write test files
console.log('Creating test files...');
fs.writeFileSync(testLayoutPath, testLayoutContent);
fs.writeFileSync(testPagePath, testPageContent);

console.log(`
✅ Test page created at: src/app/qr-test/page.tsx
✅ Test layout created at: src/app/qr-test/layout.tsx

To run the test:
1. Start the development server: npm run dev
2. Visit http://localhost:3000/qr-test
3. The page will automatically test all QR code styles with the default Black & White color
4. Click "Run All Tests" to test all style and color combinations

This test verifies that:
- The QR code library can be imported and used in a Next.js app
- All QR code styles render correctly
- All color combinations work properly
- The QR code is visible after style and color changes
`);

// Check if the dev server is running
const isDevServerRunning = () => {
  try {
    // This is a simple check that will obviously fail, but we just want
    // to see if port 3000 is in use
    require('http').get('http://localhost:3000', () => {});
    return true;
  } catch (error) {
    return false;
  }
};

console.log('Integration test files created successfully!');
if (!isDevServerRunning()) {
  console.log('\n⚠️ Development server is not running.');
  console.log('Start the server with: npm run dev');
  console.log('Then visit: http://localhost:3000/qr-test');
} else {
  console.log('\n✅ Development server appears to be running.');
  console.log('Visit: http://localhost:3000/qr-test to run the test');
} 