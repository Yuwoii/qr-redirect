'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCustomOptions } from '@/lib/qrcode';
import qrcode from 'qrcode-generator';
import { drawCustomQRCode } from '@/lib/qrcode';

// Define test styles
const styles = [
  { name: 'Classic', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'square' },
  { name: 'Rounded', dotShape: 'rounded', cornerShape: 'rounded', cornerDotStyle: 'square' },
  { name: 'Dots', dotShape: 'dots', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Corner Dots', dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'dot' },
  { name: 'Hybrid', dotShape: 'dots', cornerShape: 'rounded', cornerDotStyle: 'dot' },
];

// Define test colors
const colors = [
  { name: 'Black', dark: '#000000', light: '#FFFFFF' },
  { name: 'Blue', dark: '#0063B3', light: '#E6F0FF' },
  { name: 'Green', dark: '#0F766E', light: '#ECFDF5' },
  { name: 'Purple', dark: '#7E22CE', light: '#F5F3FF' },
  { name: 'Red', dark: '#BE123C', light: '#FFF1F2' },
  { name: 'Amber', dark: '#B45309', light: '#FFFBEB' },
];

interface DebugInfo {
  generationTime: Record<string, number>;
  styleStats: Record<string, { success: number; total: number }>;
  colorAnalysis: Record<string, { actual: string; expected: string; match: boolean }>;
}

export default function QRTestPage() {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    generationTime: {},
    styleStats: {},
    colorAnalysis: {},
  });
  const qrRef = useRef<HTMLImageElement>(null);

  // Generate QR codes for all style and color combinations
  useEffect(() => {
    const generateQRCodes = async () => {
      setLoading(true);
      
      const codes: Record<string, string> = {};
      const newDebugInfo: DebugInfo = {
        generationTime: {},
        styleStats: {},
        colorAnalysis: {},
      };
      
      for (const style of styles) {
        // Initialize style stats
        if (!newDebugInfo.styleStats[style.name]) {
          newDebugInfo.styleStats[style.name] = { success: 0, total: 0 };
        }
        
        for (const color of colors) {
          try {
            const key = `${style.name}-${color.name}`;
            const startTime = performance.now();
            
            // Create a canvas
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            // Generate QR code
            const qr = qrcode(0, 'M');
            qr.addData('https://example.com/test');
            qr.make();
            
            // Create options
            const options: QRCodeCustomOptions = {
              width: 200,
              margin: 1,
              color: {
                dark: color.dark,
                light: color.light,
              },
              style: {
                dotShape: style.dotShape as 'square' | 'rounded' | 'dots',
                cornerShape: style.cornerShape as 'square' | 'rounded',
                cornerDotStyle: style.cornerDotStyle as 'square' | 'dot',
              },
            };
            
            // Draw QR code
            await drawCustomQRCode(ctx, qr, options);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png');
            codes[key] = dataURL;
            
            // Record generation time
            const endTime = performance.now();
            newDebugInfo.generationTime[key] = endTime - startTime;
            
            // Analyze colors
            const colorInfo = analyzeQRCodeColors(canvas, color.dark, color.light);
            newDebugInfo.colorAnalysis[key] = colorInfo;
            
            // Update stats
            newDebugInfo.styleStats[style.name].total += 1;
            if (colorInfo.match) {
              newDebugInfo.styleStats[style.name].success += 1;
            }
            
            // Log details for debugging
            console.log(`Generated QR code for ${key}:`, {
              style: style,
              color: color,
              options: options,
              generationTime: newDebugInfo.generationTime[key],
              colorMatch: colorInfo.match,
            });
            
          } catch (error) {
            console.error(`Error generating QR code for ${style.name} with ${color.name}:`, error);
          }
        }
      }
      
      setQrCodes(codes);
      setDebugInfo(newDebugInfo);
      setLoading(false);
    };
    
    generateQRCodes();
  }, []);
  
  // Analyze colors in the generated QR code
  const analyzeQRCodeColors = (
    canvas: HTMLCanvasElement,
    expectedDarkColor: string,
    expectedLightColor: string
  ) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return { actual: 'unknown', expected: expectedDarkColor, match: false };
      
      // Sample a position in the QR code that should be dark
      // Center module is usually dark
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleSize = 5;
      
      // Sample a few positions to find a dark module
      const positions = [
        { x: centerX, y: centerY },
        { x: 30, y: 30 }, // Top left corner pattern
        { x: canvas.width - 30, y: 30 }, // Top right corner pattern
        { x: 30, y: canvas.height - 30 }, // Bottom left corner pattern
      ];
      
      for (const pos of positions) {
        const imageData = ctx.getImageData(pos.x, pos.y, sampleSize, sampleSize);
        const data = imageData.data;
        
        // Check if this is a dark module (average RGB values below 128)
        let avgR = 0, avgG = 0, avgB = 0;
        const pixelCount = sampleSize * sampleSize;
        
        for (let i = 0; i < data.length; i += 4) {
          avgR += data[i];
          avgG += data[i + 1];
          avgB += data[i + 2];
        }
        
        avgR = Math.round(avgR / pixelCount);
        avgG = Math.round(avgG / pixelCount);
        avgB = Math.round(avgB / pixelCount);
        
        if (avgR < 128 && avgG < 128 && avgB < 128) {
          // This is likely a dark module
          const actualColor = rgbToHex(avgR, avgG, avgB);
          const match = checkColorMatch(actualColor, expectedDarkColor);
          return { actual: actualColor, expected: expectedDarkColor, match };
        }
      }
      
      // If we didn't find a dark module in our samples, return a no-match
      return { actual: 'not found', expected: expectedDarkColor, match: false };
    } catch (error) {
      console.error('Error analyzing QR code colors:', error);
      return { actual: 'error', expected: expectedDarkColor, match: false };
    }
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Check if two colors are similar
  const checkColorMatch = (color1: string, color2: string) => {
    // Very basic color comparison - should be enhanced for real applications
    // Convert to lowercase to handle case differences in hex notation
    return color1.toLowerCase() === color2.toLowerCase() || 
           // Allow for some flexibility in color matching
           isColorSimilar(color1, color2);
  };
  
  // Simple color similarity check
  const isColorSimilar = (color1: string, color2: string) => {
    // Parse hex colors and compare RGB components
    const c1 = color1.startsWith('#') ? color1.substring(1) : color1;
    const c2 = color2.startsWith('#') ? color2.substring(1) : color2;
    
    if (c1.length !== 6 || c2.length !== 6) return false;
    
    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);
    
    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);
    
    // Allow for some color difference
    const threshold = 30;
    return Math.abs(r1 - r2) <= threshold && 
           Math.abs(g1 - g2) <= threshold && 
           Math.abs(b1 - b2) <= threshold;
  };
  
  // Calculate success rate
  const calculateSuccessRate = () => {
    let totalSuccess = 0;
    let totalTests = 0;
    
    Object.values(debugInfo.styleStats).forEach(stat => {
      totalSuccess += stat.success;
      totalTests += stat.total;
    });
    
    return totalTests > 0 ? Math.round((totalSuccess / totalTests) * 100) : 0;
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">QR Code Style Test Page</h1>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg">Generating test QR codes for all styles and colors...</p>
        </div>
      ) : (
        <>
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Results</h2>
            <div className="mb-4">
              <p className="text-lg">
                Overall Success Rate: <span className={`font-bold ${calculateSuccessRate() > 90 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateSuccessRate()}%
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(debugInfo.styleStats).map(([style, stats]) => (
                <div key={style} className="p-3 bg-white rounded shadow">
                  <h3 className="font-semibold">{style}</h3>
                  <p>
                    Success: <span className={stats.success === stats.total ? 'text-green-600' : 'text-yellow-600'}>
                      {stats.success} / {stats.total}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {styles.map(style => (
              <div key={style.name} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{style.name} Style</h2>
                <div className="space-y-6">
                  {colors.map(color => {
                    const key = `${style.name}-${color.name}`;
                    const colorAnalysis = debugInfo.colorAnalysis[key];
                    
                    return (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">{color.name}</h3>
                        <div className="flex justify-center mb-2">
                          <img
                            src={qrCodes[key]}
                            alt={`QR code with ${style.name} style and ${color.name} color`}
                            className="w-32 h-32 border border-gray-300"
                            ref={qrRef}
                          />
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            Generation: {Math.round(debugInfo.generationTime[key] || 0)}ms
                          </p>
                          {colorAnalysis && (
                            <div>
                              <p className={colorAnalysis.match ? 'text-green-600' : 'text-red-600'}>
                                {colorAnalysis.match ? '✓ Colors match' : '✗ Colors differ'}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span>Expected:</span>
                                <div 
                                  className="w-4 h-4 border border-gray-300" 
                                  style={{ backgroundColor: colorAnalysis.expected }}
                                />
                                <span>{colorAnalysis.expected}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>Actual:</span>
                                <div 
                                  className="w-4 h-4 border border-gray-300" 
                                  style={{ backgroundColor: colorAnalysis.actual }}
                                />
                                <span>{colorAnalysis.actual}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 