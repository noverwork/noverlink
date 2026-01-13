'use client';

import {
  cn,
  GlowButton,
  MetricCard,
  PulseBadge,
  TunnelCard,
  TunnelConnection,
} from '@noverlink/ui-shared';
import Link from 'next/link';

import { useSessionLogs, useSessions, useStats } from '../../lib/hooks';
import { DashboardLayout } from '../dashboard-layout';

function formatBytes(bytes: string): string {
  const num = parseInt(bytes, 10);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffSec = Math.floor((now - time) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

export function DashboardPage() {
  const { data: sessionsData } = useSessions({ status: 'active' });
  const { data: statsData } = useStats();

  const activeTunnels = sessionsData?.sessions ?? [];
  const hasActiveTunnels = activeTunnels.length > 0;
  const firstSessionId = activeTunnels[0]?.id;

  const { data: logsData } = useSessionLogs(firstSessionId ?? '', { limit: 4 });
  const recentLogs = logsData?.logs ?? [];

  const stats = statsData ?? {
    activeSessions: 0,
    totalRequests: 0,
    bandwidthMb: 0,
    tunnelMinutes: 0,
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-3xl text-white uppercase"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
              transform: 'scaleY(0.7) scaleX(0.85)',
              transformOrigin: 'left',
              letterSpacing: '0.05em',
            }}
          >
            Dashboard
          </h2>
          <p
            className="text-white/50 mt-2 text-xs"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Real-time tunnel connections from your CLI
          </p>
        </div>
        {hasActiveTunnels && (
          <PulseBadge variant="connected" appearance="pill">
            {activeTunnels.length} ACTIVE
          </PulseBadge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value={stats.activeSessions}
          label="ACTIVE TUNNELS"
          sublabel="right now"
        />
        <MetricCard
          value={stats.totalRequests.toLocaleString()}
          label="REQUESTS"
          sublabel="this month"
        />
        <MetricCard
          value={`${stats.bandwidthMb.toFixed(1)} MB`}
          label="BANDWIDTH"
          sublabel="this month"
        />
        <MetricCard
          value={stats.tunnelMinutes.toLocaleString()}
          label="TUNNEL MINUTES"
          sublabel="this month"
        />
      </div>

      {/* Active Connections */}
      {hasActiveTunnels ? (
        <div className="space-y-6">
          {/* Primary tunnel visualization */}
          <div className="p-6 bg-[#0a0a0a]/80 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl text-white uppercase"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontWeight: 900,
                  transform: 'scaleY(0.75) scaleX(0.9)',
                  transformOrigin: 'left',
                  letterSpacing: '0.03em',
                }}
              >
                Active Connections
              </h3>
              <Link href="/tunnels">
                <GlowButton variant="ghost" size="sm">
                  VIEW ALL
                </GlowButton>
              </Link>
            </div>

            {/* Show first tunnel visualization */}
            <TunnelConnection
              localLabel="localhost"
              localSublabel={`:${activeTunnels[0].localPort}`}
              publicLabel={activeTunnels[0].subdomain}
              publicSublabel={`.${activeTunnels[0].publicUrl
                .replace('https://', '')
                .split('.')
                .slice(1)
                .join('.')}`}
              status="connected"
              tunnelName={activeTunnels[0].subdomain}
              animated
            />

            {/* Tunnel list */}
            <div className="mt-6 space-y-2">
              {activeTunnels.map((tunnel) => (
                <Link key={tunnel.id} href={`/tunnels/${tunnel.id}`}>
                  <TunnelCard
                    name={tunnel.subdomain}
                    status={tunnel.status === 'active' ? 'online' : 'offline'}
                    localPort={tunnel.localPort}
                    publicUrl={tunnel.publicUrl.replace('https://', '')}
                    stats={`${formatBytes(tunnel.bytesIn)} in / ${formatBytes(
                      tunnel.bytesOut
                    )} out`}
                    className="cursor-pointer"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Start reminder */}
          <div className="p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#00ff00]/10 border border-[#00ff00]/20 flex items-center justify-center">
                <TerminalIcon className="w-5 h-5 text-[#00ff00]" />
              </div>
              <div className="flex-1">
                <div
                  className="text-xs text-white"
                  style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  Start another tunnel
                </div>
                <code className="text-xs text-white/40 font-mono">
                  noverlink http 8080
                </code>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No active tunnels - show CLI instructions */
        <div className="p-8 bg-[#0a0a0a]/80 border border-white/10">
          <div className="text-center max-w-lg mx-auto">
            {/* Disconnected visualization */}
            <div className="mb-8 opacity-50">
              <TunnelConnection
                localLabel="localhost"
                localSublabel=":3000"
                publicLabel="your-tunnel"
                publicSublabel=".noverlink.com"
                status="disconnected"
                animated={false}
              />
            </div>

            <div className="w-12 h-12 mx-auto mb-4 bg-white/5 border border-white/20 flex items-center justify-center">
              <TerminalIcon className="w-6 h-6 text-white/40" />
            </div>
            <h3
              className="text-xl text-white mb-2 uppercase"
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontWeight: 900,
                transform: 'scaleY(0.75) scaleX(0.9)',
                letterSpacing: '0.03em',
              }}
            >
              No active tunnels
            </h3>
            <p
              className="text-white/50 mb-6 text-xs"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Start a tunnel from your terminal to see it here
            </p>

            {/* CLI Instructions */}
            <div className="bg-black p-4 text-left mb-6 border border-white/10">
              <div
                className="text-[0.65rem] text-white/40 mb-2"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Terminal
              </div>
              <code className="text-sm text-[#00ff00] font-mono">
                $ noverlink http 3000
              </code>
            </div>

            <a
              href="https://github.com/noverwork/noverlink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlowButton variant="ghost" size="sm">
                VIEW DOCS
              </GlowButton>
            </a>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {hasActiveTunnels && recentLogs.length > 0 && (
        <div className="mt-8 p-6 bg-[#0a0a0a]/80 border border-white/10">
          <h3
            className="text-xs text-white/50 mb-4"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Recent Requests
          </h3>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 px-3 bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs font-mono px-2 py-0.5',
                      log.method === 'GET' && 'bg-[#00ff00]/20 text-[#00ff00]',
                      log.method === 'POST' && 'bg-blue-500/20 text-blue-400',
                      log.method === 'PUT' && 'bg-[#ffb800]/20 text-[#ffb800]',
                      log.method === 'DELETE' && 'bg-[#ff0000]/20 text-[#ff0000]'
                    )}
                  >
                    {log.method}
                  </span>
                  <span className="text-sm font-mono text-white/80">
                    {log.path}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'text-xs font-mono',
                      (log.status ?? 0) < 400
                        ? 'text-[#00ff00]'
                        : 'text-[#ff0000]'
                    )}
                  >
                    {log.status ?? '-'}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href={`/tunnels/${firstSessionId}`}>
            <GlowButton variant="ghost" size="sm" className="w-full mt-4">
              VIEW ALL LOGS
            </GlowButton>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}

function TerminalIcon({ className }: { className?: string }) {
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
        d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}
