import React from 'react';
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import UpdateRedirectForm from "@/components/UpdateRedirectForm";
import { auth } from "@/app/auth";

interface QRCodeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function QRCodeDetailPage({ params }: QRCodeDetailPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  // Ensure params is properly awaited
  const paramsObj = await params;
  const id = paramsObj.id;
  
  // Fetch the QR code with its redirects
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      redirects: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
  
  if (!qrCode) {
    notFound();
  }
  
  // Find the active redirect
  const activeRedirect = qrCode.redirects.find(redirect => redirect.isActive);
  const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/r/${qrCode.slug}`;
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-indigo-700 hover:text-indigo-800 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{qrCode.name}</h1>
          <p className="text-gray-700 mb-6">Created: {new Date(qrCode.createdAt).toLocaleDateString()}</p>
          
          <div className="bg-white p-6 rounded-md shadow-soft border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">QR Code</h2>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={qrUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-2">Scan to visit:</p>
              <div className="bg-gray-50 p-2 rounded-md text-sm font-mono break-all border border-gray-100">
                {qrUrl}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-md shadow-soft border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Download QR Code</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`/api/qrcodes/${qrCode.id}/download?format=png`}
                download={`qrcode-${qrCode.slug}.png`}
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-center hover:bg-indigo-800 transition-colors shadow-soft"
              >
                PNG
              </a>
              <a
                href={`/api/qrcodes/${qrCode.id}/download?format=svg`}
                download={`qrcode-${qrCode.slug}.svg`}
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-center hover:bg-indigo-800 transition-colors shadow-soft"
              >
                SVG
              </a>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-md shadow-soft border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Update Redirect URL</h2>
            <UpdateRedirectForm 
              qrCodeId={qrCode.id} 
              currentUrl={activeRedirect?.url} 
            />
          </div>
          
          <div className="bg-white p-6 rounded-md shadow-soft border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Redirect History</h2>
            {qrCode.redirects.length === 0 ? (
              <p className="text-gray-700">No redirects yet</p>
            ) : (
              <div className="space-y-4">
                {qrCode.redirects.map((redirect) => (
                  <div
                    key={redirect.id}
                    className={`p-3 rounded-md ${
                      redirect.isActive ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="break-all">
                        <a 
                          href={redirect.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-700 hover:underline"
                        >
                          {redirect.url}
                        </a>
                      </div>
                      {redirect.isActive && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-700 mt-2">
                      <span>Created: {new Date(redirect.createdAt).toLocaleString()}</span>
                      <span className="ml-4">Visits: {redirect.visitCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 