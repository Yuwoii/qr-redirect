'use client';

import React, { useState, useEffect, useRef } from 'react';
import qrcode from 'qrcode-generator';

// Simple QR code debug page
export default function QRDebugPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code directly on canvas
  useEffect(() => {
    try {
      setStatus('Generating QR code...');
      
      // Create QR code
      const qr = qrcode(0, 'M');
      qr.addData('https://example.com/test');
      qr.make();
      
      // Draw it directly on canvas
      const canvas = canvasRef.current;
      if (!canvas) {
        setError('Canvas not available');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas context not available');
        return;
      }
      
      // Clear canvas with light color
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Get module count
      const moduleCount = qr.getModuleCount();
      const moduleSize = canvas.width / moduleCount;
      
      // Set dark color
      const darkColor = '#0F766E'; // Teal
      ctx.fillStyle = darkColor;
      
      // Draw QR code modules
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            const x = col * moduleSize;
            const y = row * moduleSize;
            
            // Direct simple square drawing
            ctx.fillRect(x, y, moduleSize, moduleSize);
          }
        }
      }
      
      // Create an image from the canvas
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setQrImage(dataUrl);
        setStatus('QR code generated successfully');
      } catch (err) {
        setError(`Error creating data URL: ${err instanceof Error ? err.message : String(err)}`);
      }
    } catch (err) {
      setError(`Error generating QR code: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);
  
  // Also test with a rounded style
  useEffect(() => {
    try {
      setTimeout(() => {
        const canvas = document.getElementById('rounded-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas with light color
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create QR code
        const qr = qrcode(0, 'M');
        qr.addData('https://example.com/rounded');
        qr.make();
        
        // Get module count
        const moduleCount = qr.getModuleCount();
        const moduleSize = canvas.width / moduleCount;
        
        // Set dark color
        const darkColor = '#7E22CE'; // Purple
        
        // Draw QR code modules with rounded dots
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              const x = col * moduleSize;
              const y = row * moduleSize;
              const radius = moduleSize / 2;
              const centerX = x + radius;
              const centerY = y + radius;
              
              // Draw rounded dot
              ctx.fillStyle = darkColor;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      }, 500);
    } catch (err) {
      console.error('Error with rounded style:', err);
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">QR Code Debug Page</h1>
      
      <div className="mb-4">
        <p className="mb-2">Status: <span className={error ? 'text-red-600' : 'text-green-600'}>{error || status}</span></p>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Basic QR Code (Square Style)</h2>
          <canvas 
            ref={canvasRef} 
            width={200} 
            height={200} 
            className="border border-gray-300 bg-white mb-3"
          ></canvas>
          {qrImage && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Generated Image:</h3>
              <img src={qrImage} alt="Generated QR code" className="border border-gray-300" />
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Rounded Style</h2>
          <canvas 
            id="rounded-canvas" 
            width={200} 
            height={200} 
            className="border border-gray-300 bg-white"
          ></canvas>
          <div className="mt-4 text-sm">
            <p>Color: <span className="inline-block w-4 h-4 bg-purple-700"></span> #7E22CE</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-medium mb-3">Debug Information</h2>
        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
          {`// Canvas Support: ${typeof document !== 'undefined' ? (!!document.createElement('canvas').getContext ? 'Yes' : 'No') : 'N/A'}
// Window Object: ${typeof window !== 'undefined' ? 'Available' : 'Unavailable'}
// QR Library: ${typeof qrcode !== 'undefined' ? 'Loaded' : 'Not Loaded'}
// Browser: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
`}
        </pre>
      </div>
    </div>
  );
} 