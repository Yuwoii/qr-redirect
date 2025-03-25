import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "./auth";
import { Providers } from "./providers";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import { initializeDatabase } from '../lib/db-init';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Redirect - Manage QR Code Redirects",
  description: "A platform to create and manage QR codes with customizable redirects",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

// Create a server action to initialize the database
// This runs only on the server side and won't affect the Edge runtime
async function initDB() {
  // Only in server components, not during static rendering
  if (typeof window === 'undefined') {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

// Call the initialization method
initDB();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-soft border-b border-gray-100">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Image 
                    src="/logo.svg" 
                    alt="QR Redirect Logo" 
                    width={40} 
                    height={40} 
                  />
                  <span className="text-xl font-bold text-indigo-700">QR Redirect</span>
                </Link>
                <nav>
                  <ul className="flex space-x-6">
                    <li><Link href="/qr-customize" className="text-gray-700 hover:text-indigo-700 font-medium">QR Customize</Link></li>
                    {session ? (
                      <>
                        <li><Link href="/dashboard" className="text-gray-700 hover:text-indigo-700 font-medium">Dashboard</Link></li>
                        <li><SignOutButton /></li>
                      </>
                    ) : (
                      <>
                        <li><Link href="/login" className="text-gray-700 hover:text-indigo-700 font-medium">Login</Link></li>
                        <li><Link href="/register" className="text-gray-700 hover:text-indigo-700 font-medium">Register</Link></li>
                      </>
                    )}
                  </ul>
                </nav>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <footer className="bg-white py-6 border-t border-gray-100">
              <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-600 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} QR Redirect. All rights reserved.</p>
                <div className="flex flex-wrap justify-center md:justify-end space-x-6">
                  <Link href="/privacy-policy" className="text-gray-600 hover:text-indigo-700 transition-colors text-sm">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="text-gray-600 hover:text-indigo-700 transition-colors text-sm">Terms of Service</Link>
                  <Link href="/contact-us" className="text-gray-600 hover:text-indigo-700 transition-colors text-sm">Contact Us</Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
