'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import EnhancedQRCode from '@/components/EnhancedQRCode';

export default function QRCustomize() {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUrl(url);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2 text-center">QR Code Customizer</h1>
      <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
        Generate and customize your QR codes with our advanced tools. Add logos, change colors, and style your QR codes to match your brand.
      </p>
      
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter URL</CardTitle>
            <CardDescription>
              Enter the URL you want to encode in your QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="url" className="sr-only">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit">Generate QR Code</Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Your QR Code</CardTitle>
              <CardDescription>
                Customize, download or share your QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <EnhancedQRCode
                url={currentUrl}
                size={250}
                showCustomizeButton={true}
                showDownloadButton={true}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>QR Code Features</CardTitle>
              <CardDescription>
                Explore the customization options available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Visual Style Gallery</h3>
                <p className="text-sm text-gray-600">
                  Choose from pre-designed styles with a single click.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Color Themes</h3>
                <p className="text-sm text-gray-600">
                  Apply professionally designed color combinations.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Logo Integration</h3>
                <p className="text-sm text-gray-600">
                  Add your brand logo to the center of the QR code.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Download & Share</h3>
                <p className="text-sm text-gray-600">
                  Download your QR code as a high-quality PNG image.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 