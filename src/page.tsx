import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession();
  
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          QR Codes That <span className="text-indigo-600">Adapt</span> To Your Needs
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
          Create a fixed QR code and change where it points to anytime. No more reprinting QR codes when your URL changes.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {session ? (
            <Link 
              href="/dashboard" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/register" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started for Free
              </Link>
              <Link 
                href="/login" 
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-xl mb-2">1. Create</div>
              <p className="text-gray-600">Create a QR code in seconds. Give it a name and a custom URL slug.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-xl mb-2">2. Share</div>
              <p className="text-gray-600">Print your QR code on marketing materials, products, or share digitally.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-xl mb-2">3. Update</div>
              <p className="text-gray-600">Change where your QR code points to anytime without reprinting.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose QR Redirect</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Future-Proof QR Codes</h3>
              <p className="text-gray-600">Your QR codes never expire and can be updated anytime to point anywhere.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Track Scans</h3>
              <p className="text-gray-600">Know how many times your QR codes have been scanned with basic analytics.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">No technical skills required. Update your redirects in seconds from any device.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Updates</h3>
              <p className="text-gray-600">Change your redirects as often as you need at no additional cost.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-16 bg-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of businesses using QR Redirect to create dynamic QR codes.
          </p>
          
          {!session && (
            <Link 
              href="/register" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
            >
              Create Your First QR Code
            </Link>
          )}
        </div>
      </section>
    </div>
  );
} 