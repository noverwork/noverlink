'use client';

import {
  cn,
  EvaFlickerOverlay,
  EvaGrainOverlay,
  GlowButton,
  GridBackground,
  PulseBadge,
} from '@noverlink/ui-shared';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLogout, useProfile } from '@/lib/hooks';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const logout = useLogout();

  const formatPlan = (plan: string) => {
    return plan.toUpperCase();
  };

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD', icon: DashboardIcon },
    { href: '/tunnels', label: 'TUNNELS', icon: TunnelIcon },
    { href: '/settings', label: 'SETTINGS', icon: SettingsIcon },
    { href: '/billings', label: 'BILLING', icon: BillingIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* EVA Overlays */}
      <EvaGrainOverlay />
      <EvaFlickerOverlay />

      {/* Header */}
      <header className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Noverlink"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h1
                className="text-xl text-white uppercase"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontWeight: 900,
                  transform: 'scaleY(0.75) scaleX(0.9)',
                  letterSpacing: '0.05em',
                }}
              >
                NOVERLINK
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <PulseBadge variant="connected" appearance="pill">
                SYSTEM ONLINE
              </PulseBadge>
              <GlowButton variant="ghost" size="sm">
                <UserIcon className="w-4 h-4" />
              </GlowButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-[#0a0a0a]/80 border-r border-white/10 relative">
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-xs transition-all border-l-2',
                        isActive
                          ? 'text-[#00ff00] bg-[#00ff00]/10 border-[#00ff00]'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                      )}
                      style={{
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isActive ? 'text-[#00ff00]' : ''
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center">
                <span
                  className="text-sm text-white/80"
                  style={{
                    fontFamily: "'Times New Roman', Georgia, serif",
                    fontWeight: 900,
                  }}
                >
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm text-white truncate"
                  style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {profile?.name || 'Loading...'}
                </div>
                <div
                  className="text-[0.65rem] text-white/40"
                  style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {profile ? `${formatPlan(profile.plan)} PLAN` : '...'}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <LogoutIcon className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <GridBackground className="max-w-7xl mx-auto" opacity={0.02}>
            {children}
          </GridBackground>
        </main>
      </div>
    </div>
  );
}

// Icon components
function DashboardIcon({ className }: { className?: string }) {
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
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function TunnelIcon({ className }: { className?: string }) {
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
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  );
}

function BillingIcon({ className }: { className?: string }) {
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
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
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
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
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
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  );
}
