'use client';

import React, { useState } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import QRCodeCustomizer from './QRCodeCustomizer';
import { QRCodeCustomOptions, defaultQRCodeOptions } from '@/lib/qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Palette } from "lucide-react";

interface EnhancedQRCodeProps {
  url: string;
  size?: number;
  className?: string;
  initialOptions?: Partial<QRCodeCustomOptions>;
  onOptionsChange?: (options: QRCodeCustomOptions) => void;
  showCustomizeButton?: boolean;
  showDownloadButton?: boolean;
}

export default function EnhancedQRCode({
  url,
  size = 300,
  className = '',
  initialOptions = {},
  onOptionsChange,
  showCustomizeButton = true,
  showDownloadButton = true,
}: EnhancedQRCodeProps) {
  const [options, setOptions] = useState<QRCodeCustomOptions>({
    ...defaultQRCodeOptions,
    width: size,
    ...initialOptions as any
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [customizeOpen, setCustomizeOpen] = useState<boolean>(false);

  // Update QR code options
  const handleOptionsChange = (newOptions: QRCodeCustomOptions) => {
    setOptions(newOptions);
    setCustomizeOpen(false);
    if (onOptionsChange) {
      onOptionsChange(newOptions);
    }
  };

  // Handle QR code data URL for downloading
  const handleQRCodeGenerated = (dataUrl: string) => {
    setQrCodeDataUrl(dataUrl);
  };

  // Download QR code as image
  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${encodeURIComponent(url).slice(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeDisplay 
        url={url} 
        size={options.width || size} 
        className={className} 
        options={options}
        onGenerated={handleQRCodeGenerated}
      />
      
      {(showCustomizeButton || showDownloadButton) && (
        <div className="flex gap-2 mt-2">
          {showCustomizeButton && (
            <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2 items-center">
                  <Palette className="h-4 w-4" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-[95vw]">
                <DialogHeader>
                  <DialogTitle>Customize QR Code</DialogTitle>
                  <DialogDescription>
                    Customize the appearance of your QR code
                  </DialogDescription>
                </DialogHeader>
                <QRCodeCustomizer 
                  url={url} 
                  initialOptions={options} 
                  onCustomized={handleOptionsChange} 
                />
              </DialogContent>
            </Dialog>
          )}
          
          {showDownloadButton && qrCodeDataUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex gap-2 items-center"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 