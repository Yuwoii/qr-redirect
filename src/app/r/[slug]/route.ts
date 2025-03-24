import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  try {
    // Find the QR code by slug
    const qrCode = await prisma.qRCode.findUnique({
      where: { slug },
      include: {
        redirects: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    
    if (!qrCode || qrCode.redirects.length === 0) {
      // Redirect to home page if no active redirect is found
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    const redirect = qrCode.redirects[0];
    
    // Increment the visit count
    await prisma.redirect.update({
      where: { id: redirect.id },
      data: { visitCount: { increment: 1 } }
    });
    
    // Perform the redirect
    return NextResponse.redirect(new URL(redirect.url));
  } catch (error) {
    console.error("Error processing redirect:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
} 