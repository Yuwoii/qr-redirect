import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";

// Schema for creating a new redirect
const createRedirectSchema = z.object({
  url: z.string().url("Please enter a valid URL")
});

// GET /api/qrcodes/[id]/redirects - Get all redirects for a QR code
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id } = params;
  
  try {
    // Verify the QR code belongs to the user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }
    
    // Get all redirects for the QR code
    const redirects = await prisma.redirect.findMany({
      where: {
        qrCodeId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(redirects);
  } catch (error) {
    console.error("Error fetching redirects:", error);
    return NextResponse.json(
      { error: "Failed to fetch redirects" },
      { status: 500 }
    );
  }
}

// POST /api/qrcodes/[id]/redirects - Create a new redirect for a QR code
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id } = params;
  
  try {
    // Verify the QR code belongs to the user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = createRedirectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { url } = validationResult.data;
    
    // Deactivate all existing redirects
    await prisma.redirect.updateMany({
      where: {
        qrCodeId: id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    // Create the new redirect
    const redirect = await prisma.redirect.create({
      data: {
        url,
        qrCodeId: id,
        isActive: true
      }
    });
    
    return NextResponse.json(redirect, { status: 201 });
  } catch (error) {
    console.error("Error creating redirect:", error);
    return NextResponse.json(
      { error: "Failed to create redirect" },
      { status: 500 }
    );
  }
} 