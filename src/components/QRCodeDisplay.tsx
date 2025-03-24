'use client';

import { useState, useEffect } from 'react';
import { generateQRCodeDataURL } from '@/lib/qrcode';
import Image from 'next/image';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ url, size = 250, className = '' }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dataUrl = await generateQRCodeDataURL(url, { width: size });
        setQrCode(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [url, size]);

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
        <div className="bg-white p-2 rounded-md shadow-soft border border-gray-100">
          <Image 
            src={qrCode} 
            alt="QR Code" 
            width={size} 
            height={size} 
            className="rounded-sm"
          />
        </div>
      ) : null}
    </div>
  );
} 