'use client';

import { EvaFlickerOverlay, EvaGrainOverlay } from '@noverlink/ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authStore } from '@/lib/auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <>
        <EvaGrainOverlay />
        <EvaFlickerOverlay />
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00ff00] border-t-transparent rounded-full animate-spin" />
            <div
              className="text-white/40 text-sm uppercase tracking-wider"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Loading...
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
