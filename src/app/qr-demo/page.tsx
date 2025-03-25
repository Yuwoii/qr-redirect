'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRDemoRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/qr-customize');
  }, [router]);
  
  return (
    <div className="container mx-auto py-10 px-4 text-center">
      <p>Redirecting to QR Customize page...</p>
    </div>
  );
} 