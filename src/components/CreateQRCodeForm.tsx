'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const createQRCodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
});

type FormData = z.infer<typeof createQRCodeSchema>;

export default function CreateQRCodeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(createQRCodeSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create QR code');
      }

      reset();
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating QR code:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          QR Code Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-soft focus:outline-none focus:ring-indigo-500 focus:border-indigo-700"
          placeholder="My Product QR Code"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-700">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <div className="mt-1 flex rounded-md shadow-soft">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-700 text-sm">
            {typeof window !== 'undefined' ? `${window.location.origin}/r/` : '/r/'}
          </span>
          <input
            id="slug"
            type="text"
            {...register('slug')}
            className="flex-1 block w-full px-3 py-2 border border-gray-200 rounded-none rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-700"
            placeholder="my-product"
          />
        </div>
        {errors.slug && (
          <p className="mt-1 text-sm text-red-700">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-soft text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create QR Code'}
        </button>
      </div>
    </form>
  );
} 