import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import { auth } from "./auth";
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 xl:py-40 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 leading-tight">
            Elevate Your Brand with Dynamic QR Codes
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            Create sophisticated QR codes that adapt to your needs. Customize designs, change destinations, and track performance—all in one elegant platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {session ? (
              <Link 
                href="/dashboard" 
                className="bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Create Your First QR Code
                </Link>
                <Link 
                  href="/login" 
                  className="bg-white text-gray-800 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Showcase Section */}
      <section className="w-full py-16 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Beautiful QR Codes That Stand Out</h2>
                <p className="text-gray-700 mb-8 text-lg">
                  Customize every aspect of your QR codes—from colors and shapes to patterns and logos. Create codes that complement your brand while maintaining perfect scannability.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Multiple style templates (Classic, Rounded, Dots, Forest)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Customizable colors for all elements
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Logo integration in the center of your QR code
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Corner customization for unique appearances
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-10 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/classic-black.png" 
                        alt="Classic QR Code Style (Black)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Classic (Black)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/rounded-green.png" 
                        alt="Rounded QR Code Style (Green)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Rounded (Green)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/dots-purple.png" 
                        alt="Dots QR Code Style (Purple)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Dots (Purple)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/corner dots-red.png" 
                        alt="Corner Dots QR Code Style (Red)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Corner Dots (Red)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/rounded-purple.png" 
                        alt="Rounded QR Code Style (Purple)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Rounded (Purple)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="aspect-square w-full rounded flex items-center justify-center">
                      <Image 
                        src="/verification-results/classic-black.png" 
                        alt="Classic QR Code Style (Black)" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-2">Classic (Black)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Premium Features, Elegant Experience</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Dynamic Redirects</h3>
              <p className="text-gray-700 leading-relaxed">
                Create once, redirect anywhere. Update where your QR code points to at any time without changing the physical code itself.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Detailed Analytics</h3>
              <p className="text-gray-700 leading-relaxed">
                Track scan counts, geographic data, devices, and usage patterns with our comprehensive analytics dashboard.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Instant Redirection</h3>
              <p className="text-gray-700 leading-relaxed">
                Our optimized infrastructure ensures lightning-fast redirects with high reliability and uptime for all your users.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Analytics Showcase */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Make Data-Driven Decisions</h2>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Understand how your QR codes perform with comprehensive analytics. Gain insights into user behavior and optimize your marketing strategy.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-1 rounded mt-1 mr-4">
                    <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Geographic Analysis</h4>
                    <p className="text-gray-600 mt-1">See where your QR codes are being scanned around the world.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-1 rounded mt-1 mr-4">
                    <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Device & Browser Tracking</h4>
                    <p className="text-gray-600 mt-1">Understand which devices and browsers your users prefer.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-1 rounded mt-1 mr-4">
                    <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Time-Based Analysis</h4>
                    <p className="text-gray-600 mt-1">Track usage patterns over time to optimize your campaigns.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-indigo-100 p-1 rounded mt-1 mr-4">
                    <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Export Capabilities</h4>
                    <p className="text-gray-600 mt-1">Download your data for further analysis or reporting needs.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="lg:w-1/2 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500">QR Analytics Dashboard</div>
                </div>
              </div>
              <div className="p-4 relative">
                <AnalyticsDashboard />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="w-full py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Simple Process, Powerful Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="relative flex flex-col items-center text-center">
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg z-10">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Create QR Code</h3>
              <p className="text-gray-700">Sign up and create your first QR code with a custom name in just seconds.</p>
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-indigo-200 -z-10"></div>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg z-10">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Customize Design</h3>
              <p className="text-gray-700">Personalize your QR code with colors, styles, and logos that match your brand.</p>
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-indigo-200 -z-10"></div>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg z-10">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Set Destination</h3>
              <p className="text-gray-700">Add the URL where your QR code will redirect users when scanned.</p>
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-indigo-200 -z-10"></div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg z-10">4</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Track & Update</h3>
              <p className="text-gray-700">Monitor performance and change the destination URL whenever needed.</p>
            </div>
          </div>
          
          <div className="text-center mt-14">
            <Link 
              href={session ? "/dashboard" : "/register"} 
              className="bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {session ? "Go to Dashboard" : "Start Creating Now"}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonial/CTA Section */}
      <section className="w-full py-24 bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Transform Your QR Experience?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-10 text-indigo-100">
            Join thousands of businesses who trust QR Redirect for their dynamic QR code needs.
          </p>
          
          <Link 
            href={session ? "/dashboard" : "/register"} 
            className="bg-white text-indigo-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {session ? "Access Your Dashboard" : "Get Started for Free"}
          </Link>
        </div>
      </section>
      
      {/* QR Code Styles */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            QR Code Styles
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Choose from our professionally designed QR code styles
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Classic Black */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/classic-black.png" 
              alt="Classic Black QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Classic Black</h3>
              <p className="text-sm text-gray-500">Timeless and reliable design</p>
            </div>
          </div>
          
          {/* Ocean Blue */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/ocean-blue.png" 
              alt="Ocean Blue QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Ocean Blue</h3>
              <p className="text-sm text-gray-500">Professional and trustworthy</p>
            </div>
          </div>
          
          {/* Forest Green */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/forest-green.png" 
              alt="Forest Green QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Forest Green</h3>
              <p className="text-sm text-gray-500">Eco-friendly and natural</p>
            </div>
          </div>
          
          {/* Sunset Red */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/sunset-red.png" 
              alt="Sunset Red QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Sunset Red</h3>
              <p className="text-sm text-gray-500">Bold and attention-grabbing</p>
            </div>
          </div>
          
          {/* Purple */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/dots-purple.png" 
              alt="Purple Dots QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Purple Dots</h3>
              <p className="text-sm text-gray-500">Creative and distinctive</p>
            </div>
          </div>
          
          {/* Amber */}
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="/verification-results/amber-gold.png" 
              alt="Amber Gold QR Code" 
              className="w-full object-contain h-48" 
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Amber Gold</h3>
              <p className="text-sm text-gray-500">Warm and premium feel</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Preview Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful Analytics
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Gain insights with our detailed scan analytics
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          <AnalyticsDashboard />
        </div>
      </div>
      
    </div>
  );
}
