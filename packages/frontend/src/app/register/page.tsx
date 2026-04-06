import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Card, Input } from '@/components/ui';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const nameValue = formData.get('name');
    const fallbackName = email.split('@')[0] || 'user';
    const name = String(nameValue ?? fallbackName);

    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.setItem(
      'user',
      JSON.stringify({
        id: String(Date.now()),
        email,
        name,
      }),
    );

    setIsLoading(false);
    navigate('/videos');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">建立帳戶</h1>
          <p className="text-muted-foreground">開始上傳並管理您的影片</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              名稱
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="您的名稱"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              電子郵件
            </label>
            <Input
              id="email"
              name="email"
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
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '建立中...' : '建立帳戶'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          已經有帳戶？{' '}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            立即登入
          </Link>
        </p>
      </Card>
    </div>
  );
}
