'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';

import { Button } from '@/components/ui';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold">VideoHub</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link
            href="/videos"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/videos' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            瀏覽影片
          </Link>
          <Link
            href="/videos/upload"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/videos/upload' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            上傳影片
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                登出
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">登入</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
