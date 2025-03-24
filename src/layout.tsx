import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { Providers } from './providers';

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="/" className="text-xl font-bold text-indigo-600">QR Redirect</a>
                <nav>
                  <ul className="flex space-x-6">
                    {session ? (
                      <>
                        <li><a href="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</a></li>
                        <li><a href="/api/auth/signout" className="text-gray-600 hover:text-indigo-600">Sign Out</a></li>
                      </>
                    ) : (
                      <>
                        <li><a href="/login" className="text-gray-600 hover:text-indigo-600">Login</a></li>
                        <li><a href="/register" className="text-gray-600 hover:text-indigo-600">Register</a></li>
                      </>
                    )}
                  </ul>
                </nav>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <footer className="bg-gray-50 py-6">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} QR Redirect. All rights reserved.
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
} 