'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Card,Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        email,
        name: email.split('@')[0],
      }),
    );
    setIsLoading(false);
    router.push('/videos');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">登入</h1>
          <p className="text-muted-foreground">歡迎回來</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              電子郵件
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              密碼
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '登入中...' : '登入'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          還沒有帳戶？{' '}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            立即註冊
          </Link>
        </p>
      </Card>
    </div>
  );
}
