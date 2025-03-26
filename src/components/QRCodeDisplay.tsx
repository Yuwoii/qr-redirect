'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateQRCodeDataURL, QRCodeCustomOptions } from '@/lib/qrcode';
import Image from 'next/image';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
  options?: Partial<QRCodeCustomOptions>;
  onGenerated?: (dataUrl: string) => void;
}

// Create a cache to avoid regenerating the same QR code
const qrCodeCache = new Map<string, string>();

export default function QRCodeDisplay({ 
  url, 
  size = 250, 
  className = '',
  options = {},
  onGenerated
}: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a dependency key to track when url/options truly change
  const dependencyKey = useMemo(() => {
    return JSON.stringify({ url, size, options });
  }, [url, size, options]);

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Check if we already have this QR code in cache
        if (qrCodeCache.has(dependencyKey)) {
          const cachedUrl = qrCodeCache.get(dependencyKey);
          setQrCode(cachedUrl!);
          if (onGenerated) {
            onGenerated(cachedUrl!);
          }
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        setError(null);
        
        // Ensure we're passing all options, including colors and style
        const mergedOptions = {
          width: size,
          ...options,
          // Ensure color object is properly structured
          color: {
            dark: options.color?.dark || '#000000',
            light: options.color?.light || '#ffffff'
          },
          // Ensure style object is properly structured if style options are provided
          style: options.style ? {
            dotShape: options.style.dotShape || 'square',
            cornerShape: options.style.cornerShape || 'square',
            cornerDotStyle: options.style.cornerDotStyle || 'square'
          } : undefined
        };
        
        const dataUrl = await generateQRCodeDataURL(url, mergedOptions);
        
        // Store in cache
        qrCodeCache.set(dependencyKey, dataUrl);
        
        setQrCode(dataUrl);
        
        // Call onGenerated callback if provided
        if (onGenerated) {
          onGenerated(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [dependencyKey, onGenerated]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-md border border-gray-100 ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-md border border-red-100 ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {qrCode ? (
        <div className="bg-white p-4 rounded-md shadow-soft border border-gray-100" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image 
            src={qrCode} 
            alt="QR Code" 
            width={size} 
            height={size} 
            className="rounded-sm"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      ) : null}
    </div>
  );
} 