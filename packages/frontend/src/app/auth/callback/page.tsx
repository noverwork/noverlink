'use client';

import { EvaFlickerOverlay, EvaGrainOverlay } from '@noverlink/ui-shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { authStore } from '@/lib/auth-store';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken && refreshToken) {
      authStore.setTokens(accessToken, refreshToken);
      router.replace('/dashboard');
    } else {
      router.replace('/login?error=Authentication failed');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-[#00ff00] border-t-transparent rounded-full animate-spin" />
      <p
        className="mt-4 text-white/40 uppercase tracking-wider text-xs"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        Completing sign in...
      </p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <>
      <EvaGrainOverlay />
      <EvaFlickerOverlay />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
            <div className="w-8 h-8 border-2 border-[#00ff00] border-t-transparent rounded-full animate-spin" />
            <p
              className="mt-4 text-white/40 uppercase tracking-wider text-xs"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Loading...
            </p>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </>
  );
}
