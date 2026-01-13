'use client';

import { GlowButton, PulseBadge, TunnelConnection } from '@noverlink/ui-shared';
import Link from 'next/link';

import { useSessions } from '../../lib/hooks';
import { DashboardLayout } from '../dashboard-layout';

function formatBytes(bytes: string): string {
  const num = parseInt(bytes, 10);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(connectedAt: string): string {
  const now = Date.now();
  const connected = new Date(connectedAt).getTime();
  const diffMs = now - connected;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export function TunnelsPage() {
  const { data, isLoading } = useSessions({ status: 'active' });

  const tunnels = data?.sessions ?? [];
  const hasTunnels = tunnels.length > 0;

  const renderTunnelsContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 bg-[#0a0a0a]/80 border border-white/10">
          <div className="text-center text-white/60 font-mono uppercase tracking-wider">Loading tunnels...</div>
        </div>
      );
    }
    if (hasTunnels) {
      return (
        <div className="space-y-6">
          {/* Tunnel List */}
          <div className="space-y-3">
            {tunnels.map((tunnel) => (
              <Link key={tunnel.id} href={`/tunnels/${tunnel.id}`}>
                <div className="p-5 bg-[#0a0a0a]/80 border-l-4 border-l-[#00ff00] border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#00ff00] animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
                      <div>
                        <div
                          className="text-lg text-white"
                          style={{
                            fontFamily: "'Times New Roman', Georgia, serif",
                            fontWeight: 900,
                            transform: 'scaleY(0.8) scaleX(0.9)',
                            transformOrigin: 'left',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tunnel.subdomain}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-1 font-mono">
                          <span>
                            localhost:{tunnel.localPort}
                          </span>
                          <span>-&gt;</span>
                          <span className="text-[#00ff00]">
                            {tunnel.publicUrl.replace('https://', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-[0.65rem] text-white/40"
                        style={{
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Uptime
                      </div>
                      <div className="text-sm font-mono text-white/80">
                        {formatUptime(tunnel.connectedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div
                        className="text-[0.65rem] text-white/40"
                        style={{
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Bytes In
                      </div>
                      <div className="text-sm font-mono text-white">
                        {formatBytes(tunnel.bytesIn)}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-[0.65rem] text-white/40"
                        style={{
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Bytes Out
                      </div>
                      <div className="text-sm font-mono text-white">
                        {formatBytes(tunnel.bytesOut)}
                      </div>
                    </div>
                    <div className="text-right">
                      <GlowButton variant="ghost" size="sm">
                        VIEW DETAILS -&gt;
                      </GlowButton>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Start */}
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
                  noverlink http 5000
                </code>
              </div>
              <CopyButton text="noverlink http 5000" />
            </div>
          </div>
        </div>
      );
    }
    // No active tunnels
    return (
      <div className="p-8 bg-[#0a0a0a]/80 border border-white/10">
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
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[0.65rem] text-white/40"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Terminal
              </span>
              <CopyButton text="noverlink http 3000" />
            </div>
            <code className="text-sm text-[#00ff00] font-mono">
              $ noverlink http 3000
            </code>
          </div>

          <p
            className="text-xs text-white/40 mb-4"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.1em',
            }}
          >
            Don&apos;t have the CLI installed?
          </p>

          {/* Install instructions */}
          <div className="bg-black p-4 text-left mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[0.65rem] text-white/40"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Install CLI (macOS/Linux)
              </span>
              <CopyButton text="brew tap noverwork/noverlink && brew install noverlink" />
            </div>
            <code className="text-sm text-white/80 font-mono block">
              $ brew tap noverwork/noverlink
            </code>
            <code className="text-sm text-white/80 font-mono block mt-1">
              $ brew install noverlink
            </code>
          </div>

          <a
            href="https://github.com/noverwork/noverlink"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlowButton variant="ghost" size="sm">
              DOCUMENTATION
            </GlowButton>
          </a>
        </div>
      </div>
    );
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
            Active Tunnels
          </h2>
          <p
            className="text-white/50 mt-2 text-xs"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Live connections from your CLI sessions
          </p>
        </div>
        {hasTunnels && (
          <PulseBadge variant="connected" appearance="pill">
            {tunnels.length} CONNECTED
          </PulseBadge>
        )}
      </div>

      {renderTunnelsContent()}
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
      className="p-1.5 hover:bg-white/10 transition-colors"
      title="Copy to clipboard"
    >
      <CopyIcon className="w-4 h-4 text-white/40" />
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
