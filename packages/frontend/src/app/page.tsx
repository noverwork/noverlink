'use client';

import Link from 'next/link';

import { Button, Card } from '@/components/ui';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">影片上傳服務</h1>
          <p className="text-muted-foreground">簡單、快速地上傳和管理您的影片</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/videos/upload">
            <Button>上傳影片</Button>
          </Link>
          <Link href="/videos">
            <Button variant="outline">瀏覽影片</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
