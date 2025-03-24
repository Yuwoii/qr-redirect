import React from 'react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CreateQRCodeForm from "@/components/CreateQRCodeForm";

export default async function CreateQRCodePage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New QR Code</h1>
      <CreateQRCodeForm />
    </div>
  );
} 