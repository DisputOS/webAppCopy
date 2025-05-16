// -----------------------------------------------------------------------------
// INACTIVE file: src/components/EvidenceUploader.tsx   (client component)
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DisputeToastClient() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShow(true);
      const timeout = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in">
      ✅ Welcome to your new dispute
    </div>
  );
}
