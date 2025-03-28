import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";

// GET /api/user/namespace - Get the namespace for the authenticated user
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { namespace: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ namespace: user.namespace });
  } catch (error) {
    console.error("Error fetching user namespace:", error);
    return NextResponse.json(
      { error: "Failed to fetch user namespace" },
      { status: 500 }
    );
  }
} 