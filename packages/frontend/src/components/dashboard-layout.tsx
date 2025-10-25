'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview' },
    { href: '/tunnels', label: 'Tunnels' },
    { href: '/billings', label: 'Billings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Noverlink</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-gray-800 border-r border-gray-700">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-4 py-2 rounded-md font-medium',
                        isActive
                          ? 'text-white bg-gray-700'
                          : 'text-gray-400 hover:bg-gray-700/50'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
