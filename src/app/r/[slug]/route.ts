import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // The slug parameter could be either a namespaced slug (namespace/slug) or a legacy slug
  const { slug } = params;
  
  try {
    // Check if the slug contains a namespace (has a slash)
    if (slug.includes('/')) {
      // Parse the namespaced slug
      const [namespace, userSlug] = slug.split('/', 2);
      
      // Find the user by namespace
      const user = await prisma.user.findUnique({
        where: { namespace },
        select: { id: true }
      });
      
      if (!user) {
        // Namespace not found
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Find the QR code by user ID and slug
      const qrCode = await prisma.qRCode.findFirst({
        where: { 
          userId: user.id,
          slug: userSlug 
        },
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
    }
    else {
      // Legacy slug format (no namespace) - maintain backward compatibility
      
      // Find the QR code by slug
      const qrCode = await prisma.qRCode.findFirst({
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
    }
  } catch (error) {
    console.error("Error processing redirect:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
} 