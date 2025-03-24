import React from 'react';
import { redirect } from "next/navigation";
import CreateQRCodeForm from "@/components/CreateQRCodeForm";
import { auth } from "@/app/auth";

export default async function CreateQRCodePage() {
  const session = await auth();
  
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