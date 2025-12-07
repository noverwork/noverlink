'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  GlowButton,
  Input,
  PulseBadge,
} from '@noverlink/ui-shared';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

const deviceCodeSchema = z.object({
  userCode: z
    .string()
    .min(1, 'Code is required')
    .regex(
      /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
      'Invalid code format (e.g., ABCD-1234)'
    ),
});

type DeviceCodeFormData = z.infer<typeof deviceCodeSchema>;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function DeviceAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'input' | 'success' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill from URL if provided
  const prefillCode = searchParams.get('code') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeviceCodeFormData>({
    resolver: zodResolver(deviceCodeSchema),
    defaultValues: {
      userCode: prefillCode.toUpperCase(),
    },
  });

  const userCode = watch('userCode');

  // Check if user is logged in
  const isAuthenticated = authStore.isAuthenticated();

  const onSubmit = async (data: DeviceCodeFormData) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = `/auth/device?code=${encodeURIComponent(
        data.userCode
      )}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await authApi.approveDeviceCode(data.userCode);
      if (result.success) {
        setStatus('success');
      } else {
        setErrorMessage(
          'Failed to authorize. The code may be invalid or expired.'
        );
        setStatus('error');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to authorize device. Please try again.';
      setErrorMessage(message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!userCode) return;

    setIsLoading(true);
    try {
      await authApi.denyDeviceCode(userCode);
      router.push('/dashboard');
    } catch {
      // Ignore errors on deny
      router.push('/dashboard');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 min-h-screen bg-slate-950">
        <div className="w-full max-w-[420px]">
          <Card className="bg-slate-900 border-white/[0.08]">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-teal-400" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Device Authorized
              </h1>
              <p className="text-sm text-slate-400 mb-6">
                Your CLI is now connected. You can close this window and return
                to your terminal.
              </p>
              <Link href="/dashboard">
                <GlowButton variant="secondary" className="w-full">
                  Go to Dashboard
                </GlowButton>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 min-h-screen bg-slate-950">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-3 mb-3">
          <Image
            src="/logo.png"
            alt="Noverlink"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <span className="text-[32px] font-semibold tracking-tight text-white">
            Noverlink
          </span>
        </Link>
        <p className="text-sm text-slate-400">CLI Device Authorization</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[420px]">
        <Card className="bg-slate-900 border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Authorize Device
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter the code shown in your terminal to authorize the CLI.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">
                  You need to sign in first before authorizing a device.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Device Code
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="XXXX-XXXX"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] uppercase bg-slate-800 border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 h-14"
                  disabled={isLoading}
                  maxLength={9}
                  {...register('userCode', {
                    onChange: (e) => {
                      // Auto-format: add dash after 4 characters
                      let value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '');
                      if (value.length > 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4, 8);
                      }
                      e.target.value = value;
                    },
                  })}
                />
                {errors.userCode && (
                  <p className="text-xs text-rose-400">
                    {errors.userCode.message}
                  </p>
                )}
              </div>

              {(status === 'error' || errorMessage) && (
                <div className="flex items-center justify-center gap-2">
                  <PulseBadge variant="disconnected" appearance="pill">
                    {errorMessage}
                  </PulseBadge>
                </div>
              )}

              <div className="flex gap-3">
                <GlowButton
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={handleDeny}
                >
                  Deny
                </GlowButton>
                <GlowButton
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={isLoading}
                >
                  {isAuthenticated ? 'Authorize' : 'Sign in to Authorize'}
                </GlowButton>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Only authorize devices you trust. This will give the CLI access
                to create and manage tunnels on your account.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Having trouble?{' '}
          <Link
            href="/docs/cli"
            className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
          >
            View CLI documentation
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function DeviceAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      }
    >
      <DeviceAuthContent />
    </Suspense>
  );
}
