import React, { useState } from 'react';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import EnhancedQRCode from '@/components/EnhancedQRCode';

export default function QRDemo() {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUrl(url);
  };

  return (
    <>
      <Head>
        <title>QR Code Customizer Demo</title>
        <meta name="description" content="Demo of QR code customization features" />
      </Head>
      
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">QR Code Customizer</h1>
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
                  <h3 className="font-medium">Basic Customization</h3>
                  <p className="text-sm text-gray-600">
                    Change size, margin, and error correction level.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Styling Options</h3>
                  <p className="text-sm text-gray-600">
                    Choose different shapes for dots and corners, customize colors.
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
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-6">QR Code Style Examples</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center">
                <EnhancedQRCode
                  url="https://example.com/style1"
                  size={150}
                  initialOptions={{
                    color: { dark: '#0f766e', light: '#f0fdfa' },
                    style: { dotShape: 'rounded', cornerShape: 'rounded' }
                  }}
                  showCustomizeButton={false}
                  showDownloadButton={false}
                />
                <p className="mt-2 text-sm font-medium">Rounded Style</p>
              </div>
              
              <div className="flex flex-col items-center">
                <EnhancedQRCode
                  url="https://example.com/style2"
                  size={150}
                  initialOptions={{
                    color: { dark: '#7e22ce', light: '#faf5ff' },
                    style: { dotShape: 'dots', cornerShape: 'rounded' }
                  }}
                  showCustomizeButton={false}
                  showDownloadButton={false}
                />
                <p className="mt-2 text-sm font-medium">Dots Style</p>
              </div>
              
              <div className="flex flex-col items-center">
                <EnhancedQRCode
                  url="https://example.com/style3"
                  size={150}
                  initialOptions={{
                    color: { dark: '#be123c', light: '#fff1f2' },
                    style: { dotShape: 'square', cornerShape: 'square', cornerDotStyle: 'dot' }
                  }}
                  showCustomizeButton={false}
                  showDownloadButton={false}
                />
                <p className="mt-2 text-sm font-medium">Corner Dots Style</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 