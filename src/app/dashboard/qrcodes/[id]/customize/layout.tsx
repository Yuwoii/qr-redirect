import React from 'react';
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import prisma from "@/lib/db";

export default async function CustomizeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  // Verify the QR code belongs to the user
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    }
  });
  
  if (!qrCode) {
    redirect("/dashboard");
  }
  
  return (
    <>
      {children}
    </>
  );
} 