import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import { auth } from "./auth";

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
          QR Codes That <span className="text-indigo-700">Adapt</span> To Your Needs
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
          Create a fixed QR code and change where it points to anytime. No more reprinting QR codes when your URL changes.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {session ? (
            <Link 
              href="/dashboard" 
              className="bg-indigo-700 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors shadow-soft"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/register" 
                className="bg-indigo-700 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors shadow-soft"
              >
                Get Started for Free
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-soft"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full py-16 bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Use QR Redirect?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-md shadow-soft border border-gray-100">
              <div className="text-indigo-700 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Dynamic Redirects</h3>
              <p className="text-gray-700">
                Create once, redirect anywhere. Update where your QR code points to at any time without changing the code itself.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-md shadow-soft border border-gray-100">
              <div className="text-indigo-700 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Simple Analytics</h3>
              <p className="text-gray-700">
                Track how many times your QR code has been scanned with our built-in analytics.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-md shadow-soft border border-gray-100">
              <div className="text-indigo-700 text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast Scanning</h3>
              <p className="text-gray-700">
                Our QR codes are optimized for quick scanning on all devices and redirect instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 text-indigo-700 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-soft">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Create QR Code</h3>
              <p className="text-gray-700">Sign up and create your first QR code with a custom name and slug.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 text-indigo-700 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-soft">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Set Redirect</h3>
              <p className="text-gray-700">Add a URL where your QR code will redirect users when scanned.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 text-indigo-700 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-soft">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Use & Update</h3>
              <p className="text-gray-700">Download your QR code, use it anywhere, and change the redirect whenever needed.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href={session ? "/dashboard" : "/register"} 
              className="bg-indigo-700 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors shadow-soft"
            >
              {session ? "Go to Dashboard" : "Get Started Now"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
