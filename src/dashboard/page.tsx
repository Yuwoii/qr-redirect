import React from 'react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const qrCodes = await prisma.qRCode.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      redirects: {
        where: {
          isActive: true
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your QR Codes</h1>
        <Link
          href="/dashboard/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create New QR Code
        </Link>
      </div>
      
      {qrCodes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No QR codes yet</h2>
          <p className="text-gray-600 mb-6">Create your first QR code to get started</p>
          <Link
            href="/dashboard/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create QR Code
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => {
            const currentRedirect = qrCode.redirects[0];
            const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/r/${qrCode.slug}`;
            
            return (
              <div key={qrCode.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{qrCode.name}</h2>
                  <p className="text-gray-500 text-sm mb-4">/{qrCode.slug}</p>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Current Redirect:</div>
                    <div className="bg-gray-50 p-2 rounded text-sm truncate">
                      {currentRedirect ? currentRedirect.url : 'No redirect set'}
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <QRCodeDisplay url={qrUrl} size={150} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/dashboard/qrcodes/${qrCode.id}`}
                      className="bg-indigo-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-indigo-700 transition-colors"
                    >
                      Manage
                    </Link>
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm text-center hover:bg-gray-200 transition-colors"
                    >
                      Test
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 