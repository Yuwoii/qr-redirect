import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Customizer Demo',
  description: 'Demo of QR code customization features',
};

export default function QRDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 