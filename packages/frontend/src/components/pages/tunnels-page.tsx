'use client';

import {
  GlowButton,
  PulseBadge,
  TunnelConnection,
} from '@noverlink/ui-shared';
import Link from 'next/link';

import { DashboardLayout } from '../dashboard-layout';

// Mock data - will come from real-time API
const mockActiveTunnels = [
  {
    id: 'tun_abc123',
    name: 'happy-fox-42',
    localPort: 3000,
    publicUrl: 'happy-fox-42.noverlink.com',
    status: 'online' as const,
    requests: 1247,
    bandwidth: '23.4 MB',
    connectedAt: '2024-01-15T10:30:00Z',
    uptime: '2h 15m',
  },
  {
    id: 'tun_def456',
    name: 'cool-tiger-88',
    localPort: 8080,
    publicUrl: 'cool-tiger-88.noverlink.com',
    status: 'online' as const,
    requests: 89,
    bandwidth: '1.2 MB',
    connectedAt: '2024-01-15T12:30:00Z',
    uptime: '15m',
  },
];

export function TunnelsPage() {
  // Real-time data from API/WebSocket
  const tunnels = mockActiveTunnels;
  const hasTunnels = tunnels.length > 0;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Active Tunnels
          </h2>
          <p className="text-slate-400 mt-1">
            Live connections from your CLI sessions
          </p>
        </div>
        {hasTunnels && (
          <PulseBadge variant="connected" appearance="pill">
            {tunnels.length} Connected
          </PulseBadge>
        )}
      </div>

      {hasTunnels ? (
        <div className="space-y-6">
          {/* Tunnel List */}
          <div className="space-y-3">
            {tunnels.map((tunnel) => (
              <Link key={tunnel.id} href={`/tunnels/${tunnel.id}`}>
                <div className="p-5 rounded-xl bg-slate-900/50 border border-teal-500/20 hover:border-teal-500/40 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
                      <div>
                        <div className="font-medium text-white">
                          {tunnel.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="font-mono">
                            localhost:{tunnel.localPort}
                          </span>
                          <span>→</span>
                          <span className="font-mono text-teal-400">
                            {tunnel.publicUrl}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Uptime</div>
                      <div className="text-sm font-mono text-slate-300">
                        {tunnel.uptime}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <div className="text-xs text-slate-500">Requests</div>
                      <div className="text-sm font-mono text-white">
                        {tunnel.requests.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Bandwidth</div>
                      <div className="text-sm font-mono text-white">
                        {tunnel.bandwidth}
                      </div>
                    </div>
                    <div className="text-right">
                      <GlowButton variant="ghost" size="sm">
                        View Details →
                      </GlowButton>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Start */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <TerminalIcon className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Start another tunnel
                </div>
                <code className="text-xs text-slate-400 font-mono">
                  noverlink http 5000
                </code>
              </div>
              <CopyButton text="noverlink http 5000" />
            </div>
          </div>
        </div>
      ) : (
        /* No active tunnels */
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-center max-w-lg mx-auto">
            {/* Visual */}
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

            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <TerminalIcon className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No active tunnels
            </h3>
            <p className="text-slate-400 mb-6 text-sm">
              Start a tunnel from your terminal to see it here
            </p>

            {/* CLI Instructions */}
            <div className="bg-slate-950 rounded-lg p-4 text-left mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Terminal</span>
                <CopyButton text="noverlink http 3000" />
              </div>
              <code className="text-sm text-teal-400 font-mono">
                $ noverlink http 3000
              </code>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Don&apos;t have the CLI installed?
            </p>

            {/* Install instructions */}
            <div className="bg-slate-950 rounded-lg p-4 text-left mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Install CLI</span>
                <CopyButton text="cargo install noverlink" />
              </div>
              <code className="text-sm text-slate-300 font-mono">
                $ cargo install noverlink
              </code>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link href="/settings">
                <GlowButton variant="secondary" size="sm">
                  Get API Key
                </GlowButton>
              </Link>
              <a
                href="https://github.com/noverwork/noverlink"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GlowButton variant="ghost" size="sm">
                  Documentation
                </GlowButton>
              </a>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-slate-700 transition-colors"
      title="Copy to clipboard"
    >
      <CopyIcon className="w-4 h-4 text-slate-400" />
    </button>
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

function CopyIcon({ className }: { className?: string }) {
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
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}
