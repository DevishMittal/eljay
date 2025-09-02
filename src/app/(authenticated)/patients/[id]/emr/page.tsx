'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientEMRPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the patient page since EMR is now handled there
    router.replace(`/patients/${params.id}`);
  }, [router, params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to patient page...</p>
      </div>
    </div>
  );
}
