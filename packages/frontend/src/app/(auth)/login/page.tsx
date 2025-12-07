'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  GlowButton,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@noverlink/ui-shared';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '@/lib/api';
import { useLogin } from '@/lib/hooks';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const isLoading = loginMutation.isPending;

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  const handleGithubLogin = () => {
    window.location.href = authApi.getGithubAuthUrl();
  };

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 min-h-screen">
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
          <span className="text-3xl font-bold text-white tracking-tight">
            Noverlink
          </span>
        </Link>
        <p className="text-slate-400 text-sm">
          Secure tunnel management platform
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px]">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField label="Email" required error={errors.email?.message}>
              <InputGroup>
                <InputGroupAddon align="start">
                  <MailIcon className="w-5 h-5" />
                </InputGroupAddon>
                <InputGroupInput
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  {...register('email')}
                />
              </InputGroup>
            </FormField>

            <FormField
              label="Password"
              required
              error={errors.password?.message}
            >
              <InputGroup>
                <InputGroupAddon align="start">
                  <LockIcon className="w-5 h-5" />
                </InputGroupAddon>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...register('password')}
                />
                <InputGroupButton
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </InputGroupButton>
              </InputGroup>
            </FormField>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 focus:ring-offset-slate-900 cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {loginMutation.error && (
              <p className="text-sm text-rose-400 text-center">
                {loginMutation.error.message}
              </p>
            )}

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={isLoading}
            >
              Sign in
            </GlowButton>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <GlowButton
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
              onClick={handleGithubLogin}
            >
              <span className="flex items-center justify-center gap-2">
                <GitHubIcon className="w-5 h-5 shrink-0" />
                <span>GitHub</span>
              </span>
            </GlowButton>
            <GlowButton
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleLogin}
            >
              <span className="flex items-center justify-center gap-2">
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span>Google</span>
              </span>
            </GlowButton>
          </div>
        </div>

        {/* Sign up link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
