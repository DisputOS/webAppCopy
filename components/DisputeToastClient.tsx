'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function DisputeToastClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      toast.success('Welcome to your new dispute 🎉');
    }
  }, [searchParams]);

  return <Toaster richColors />;
}
