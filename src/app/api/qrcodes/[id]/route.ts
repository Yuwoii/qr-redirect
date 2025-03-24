import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      select: {
        id: true,
        slug: true,
        name: true,
        createdAt: true
      }
    });
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 