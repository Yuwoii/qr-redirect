import { NextRequest, NextResponse } from "next/server";
import { qrCodeRepository } from "../../../../../lib/db";
import { generateQRCodeDataURL, generateQRCodeSVG } from "../../../../../lib/qrcode";
import { auth } from "../../../../auth";
import { apiError } from "../../../../../lib/api-utils";
import logger from "../../../../../lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png";
    
    // Verify the QR code belongs to the user
    const qrCode = await qrCodeRepository.findById(id);
    
    if (!qrCode || qrCode.userId !== session.user.id) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }
    
    const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/r/${qrCode.slug}`;
    
    if (format === "svg") {
      const svg = await generateQRCodeSVG(qrUrl);
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qrcode-${qrCode.slug}.svg"`
        }
      });
    } else {
      const dataUrl = await generateQRCodeDataURL(qrUrl, { width: 500 });
      const base64Data = dataUrl.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="qrcode-${qrCode.slug}.png"`
        }
      });
    }
  } catch (error) {
    logger.error("Error generating QR code download:", "qrcodes/download", error as Error);
    return apiError(error as Error, 500);
  }
} 