'use client';

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
