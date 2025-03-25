import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Code Style Color Test',
  description: 'Test page for QR code style colors to verify fixes for color application across all styles',
};

export default function QRTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className={inter.className}>
      {children}
    </section>
  );
} 