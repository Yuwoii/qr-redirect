'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnhancedQRCode from '@/components/EnhancedQRCode';
import QRCodeCustomizer from '@/components/QRCodeCustomizer';
import { QRCodeCustomOptions } from '@/lib/qrcode';

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [customOptions, setCustomOptions] = useState<QRCodeCustomOptions>({});
  
  useEffect(() => {
    const fetchQRCodeData = async () => {
      if (params && params.id) {
        try {
          setIsLoading(true);
          const qrId = params.id as string;
          setId(qrId);
          
          // Fetch the QR code data to get the slug
          const response = await fetch(`/api/qrcodes/${qrId}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.slug) {
              setQrUrl(`${window.location.origin}/r/${data.slug}`);
            }
          } else {
            console.error('Failed to fetch QR code data');
          }
        } catch (error) {
          console.error('Error fetching QR code data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchQRCodeData();
  }, [params]);
  
  const handleOptionsChange = (newOptions: QRCodeCustomOptions) => {
    setCustomOptions(newOptions);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-700"></div>
      </div>
    );
  }
  
  if (!qrUrl) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-600 mb-4">Failed to load QR code data</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={`/dashboard/qrcodes/${id}`} className="text-indigo-700 hover:text-indigo-800 font-medium">
          &larr; Back to QR Code
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize Your QR Code</h1>
        <p className="text-gray-700">Personalize your QR code with custom colors, styles, and even add your logo.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Preview</CardTitle>
            <CardDescription>
              Live preview of your customized QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <EnhancedQRCode
              url={qrUrl}
              size={300}
              initialOptions={customOptions}
              showDownloadButton={true}
              showCustomizeButton={false}
            />
          </CardContent>
        </Card>
        
        <div>
          <QRCodeCustomizer
            url={qrUrl}
            initialOptions={customOptions}
            onCustomized={handleOptionsChange}
          />
        </div>
      </div>
    </div>
  );
} 