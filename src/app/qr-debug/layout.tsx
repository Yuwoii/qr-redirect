import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Debug - Simple Canvas Test',
  description: 'Debug page for testing QR code generation with minimal dependencies',
};

export default function QRDebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 