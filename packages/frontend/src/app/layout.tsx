import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/layout/navbar';

export function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </>
  );
}
