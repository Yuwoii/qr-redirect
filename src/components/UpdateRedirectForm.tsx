'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const updateRedirectSchema = z.object({
  url: z.string().url("Please enter a valid URL")
});

type FormData = z.infer<typeof updateRedirectSchema>;

interface UpdateRedirectFormProps {
  qrCodeId: string;
  currentUrl?: string;
}

export default function UpdateRedirectForm({ qrCodeId, currentUrl = '' }: UpdateRedirectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(updateRedirectSchema),
    defaultValues: {
      url: currentUrl
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/qrcodes/${qrCodeId}/redirects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update redirect URL');
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error('Error updating redirect:', err);
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

      {success && (
        <div className="bg-green-50 p-4 rounded-md text-green-700 text-sm border border-green-100">
          Redirect URL updated successfully!
        </div>
      )}

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          Redirect URL
        </label>
        <input
          id="url"
          type="text"
          {...register('url')}
          className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-soft focus:outline-none focus:ring-indigo-500 focus:border-indigo-700"
          placeholder="https://example.com"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-700">{errors.url.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-soft text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Redirect URL'}
        </button>
      </div>
    </form>
  );
} 