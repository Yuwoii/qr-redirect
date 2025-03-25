'use client';

import { useState, useEffect } from 'react';
import { generateQRCodeDataURL, QRCodeCustomOptions } from '@/lib/qrcode';
import Image from 'next/image';

interface QRStyleTestProps {
  style: string;
  url: string;
  colors: {
    dark: string;
    light: string;
  };
  options?: Partial<QRCodeCustomOptions>;
}

function QRStyleTest({ style, url, colors, options = {} }: QRStyleTestProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate QR code on component mount
  useEffect(() => {
    const generateCode = async () => {
      try {
        setIsLoading(true);
        const dataUrl = await generateQRCodeDataURL(url, {
          ...options,
          color: colors
        });
        setQrCode(dataUrl);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error(`Error generating ${style} QR code:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    generateCode();
  }, [url, colors, options, style]); // Dependencies for the effect

  return (
    <div className="flex flex-col items-center border rounded-md p-4 bg-white">
      <h3 className="text-lg font-medium mb-2">{style}</h3>
      <div className="text-xs text-gray-500 mb-4">
        <span className="inline-block w-4 h-4 mr-1" style={{ backgroundColor: colors.dark }}></span>
        {colors.dark} / 
        <span className="inline-block w-4 h-4 mx-1" style={{ backgroundColor: colors.light }}></span>
        {colors.light}
      </div>
      {isLoading ? (
        <div className="h-32 w-32 animate-pulse bg-gray-200 rounded-md"></div>
      ) : error ? (
        <div className="h-32 w-32 flex items-center justify-center bg-red-50 text-red-500 text-xs text-center p-2">
          {error}
        </div>
      ) : qrCode ? (
        <Image src={qrCode} alt={`${style} QR Code`} width={150} height={150} />
      ) : null}
    </div>
  );
}

export default function QRTestPage() {
  // Define test cases with different styles and colors
  const testCases = [
    // Classic style with different colors
    {
      style: 'Classic',
      options: {
        style: {
          dotShape: 'square' as const,
          cornerShape: 'square' as const,
          cornerDotStyle: 'square' as const
        }
      },
      colors: [
        { dark: '#000000', light: '#FFFFFF' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    },
    // Forest style with different colors
    {
      style: 'Forest',
      options: {
        style: {
          dotShape: 'square' as const,
          cornerShape: 'rounded' as const,
          cornerDotStyle: 'square' as const
        }
      },
      colors: [
        { dark: '#0F766E', light: '#F0FDFA' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    },
    // Rounded style with different colors
    {
      style: 'Rounded',
      options: {
        style: {
          dotShape: 'rounded' as const,
          cornerShape: 'rounded' as const,
          cornerDotStyle: 'square' as const
        }
      },
      colors: [
        { dark: '#7E22CE', light: '#FAF5FF' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    },
    // Dots style with different colors
    {
      style: 'Dots',
      options: {
        style: {
          dotShape: 'dots' as const,
          cornerShape: 'square' as const,
          cornerDotStyle: 'square' as const
        }
      },
      colors: [
        { dark: '#BE123C', light: '#FFF1F2' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    },
    // Corner Dots style with different colors
    {
      style: 'Corner Dots',
      options: {
        style: {
          dotShape: 'square' as const,
          cornerShape: 'square' as const,
          cornerDotStyle: 'dot' as const
        }
      },
      colors: [
        { dark: '#B45309', light: '#FFFBEB' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    },
    // Hybrid style with different colors
    {
      style: 'Hybrid',
      options: {
        style: {
          dotShape: 'dots' as const,
          cornerShape: 'rounded' as const,
          cornerDotStyle: 'dot' as const
        }
      },
      colors: [
        { dark: '#0063B3', light: '#E6F3FF' },
        { dark: '#FF0000', light: '#FFFFFF' },
        { dark: '#0000FF', light: '#FFFF00' }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">QR Code Style Color Test</h1>
      <p className="mb-4 text-gray-700">
        This page tests different QR code styles with various color combinations to verify 
        that colors are correctly applied to all styles.
      </p>
      
      <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-md">
        <h2 className="text-lg font-semibold text-green-800 mb-2">Fix Verification</h2>
        <p className="text-green-700">
          This page is testing the fix for the QR code style color issue where colors were only 
          correctly applied to Forest and Classic styles. The fix ensures that custom colors are 
          properly applied to all style templates.
        </p>
        <p className="mt-2 text-green-700">
          If the fix is successful, all QR codes below should display with their respective colors,
          not just the Forest and Classic styles.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testCases.map((testCase, testIndex) => (
          <div key={testIndex} className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">{testCase.style} Style</h2>
            <div className="grid grid-cols-1 gap-4">
              {testCase.colors.map((colorSet, colorIndex) => (
                <QRStyleTest
                  key={`${testIndex}-${colorIndex}`}
                  style={`${colorSet.dark.substring(1, 4)}`}
                  url={`https://example.com/test/${testCase.style}/${colorIndex}`}
                  colors={colorSet}
                  options={testCase.options}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 