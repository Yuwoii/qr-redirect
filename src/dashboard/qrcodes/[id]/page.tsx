import React from 'react';
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import UpdateRedirectForm from "@/components/UpdateRedirectForm";

interface QRCodeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function QRCodeDetailPage({ params }: QRCodeDetailPageProps) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const { id } = params;
  
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
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">{qrCode.name}</h1>
          <p className="text-gray-500 mb-6">Created: {new Date(qrCode.createdAt).toLocaleDateString()}</p>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">QR Code</h2>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={qrUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scan to visit:</p>
              <div className="bg-gray-50 p-2 rounded-md text-sm font-mono break-all">
                {qrUrl}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Download QR Code</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`/api/qrcodes/${qrCode.id}/download?format=png`}
                download={`qrcode-${qrCode.slug}.png`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-center hover:bg-indigo-700 transition-colors"
              >
                PNG
              </a>
              <a
                href={`/api/qrcodes/${qrCode.id}/download?format=svg`}
                download={`qrcode-${qrCode.slug}.svg`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-center hover:bg-indigo-700 transition-colors"
              >
                SVG
              </a>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Update Redirect URL</h2>
            <UpdateRedirectForm 
              qrCodeId={qrCode.id} 
              currentUrl={activeRedirect?.url} 
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Redirect History</h2>
            {qrCode.redirects.length === 0 ? (
              <p className="text-gray-500">No redirects yet</p>
            ) : (
              <div className="space-y-4">
                {qrCode.redirects.map((redirect) => (
                  <div
                    key={redirect.id}
                    className={`p-3 rounded-md ${
                      redirect.isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="break-all">
                        <a 
                          href={redirect.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
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
                    <div className="text-xs text-gray-500 mt-2">
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