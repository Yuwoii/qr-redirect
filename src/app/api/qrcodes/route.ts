import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";

// Schema for creating a new QR code
const createQRCodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
});

// GET /api/qrcodes - Get all QR codes for the authenticated user
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        redirects: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

// POST /api/qrcodes - Create a new QR code
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createQRCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, slug } = validationResult.data;
    
    // Check if slug already exists
    const existingQRCode = await prisma.qRCode.findUnique({
      where: { slug }
    });
    
    if (existingQRCode) {
      return NextResponse.json(
        { error: "Slug already in use" },
        { status: 400 }
      );
    }
    
    // Create the QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        name,
        slug,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    console.error("Error creating QR code:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
} 