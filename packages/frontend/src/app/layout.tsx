import './globals.css';

import { Navbar } from '@/components/layout/navbar';

import { Providers } from './providers';

export const metadata = {
  title: 'VideoHub - 影片上傳服務',
  description: '簡單的视频上傳平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
