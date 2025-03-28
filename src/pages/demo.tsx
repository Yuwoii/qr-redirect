import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This is a fallback page to prevent build errors.
 * The original demo page has been migrated to the app directory structure.
 */
export default function LegacyDemoPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new demo page location
    router.push('/qr-demo');
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
      <p>Please wait while we redirect you to the new demo page.</p>
      <a href="/qr-demo" className="text-blue-600 hover:underline mt-4">
        Click here if you are not redirected automatically
      </a>
    </div>
  );
} 