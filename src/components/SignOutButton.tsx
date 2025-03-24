'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      className="text-gray-700 hover:text-indigo-700 font-medium"
    >
      Sign Out
    </button>
  );
} 