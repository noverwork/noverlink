'use client';

import {
  cn,
  GlowButton,
  MetricCard,
  PulseBadge,
  TunnelConnection,
} from '@noverlink/ui-shared';
import Link from 'next/link';

import { useSession, useSessionLogs } from '../../lib/hooks';
import { DashboardLayout } from '../dashboard-layout';

interface TunnelDetailPageProps {
  tunnelId: string;
}

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

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function TunnelDetailPage({ tunnelId }: TunnelDetailPageProps) {
  const { data: tunnel, isLoading: tunnelLoading } = useSession(tunnelId);
  const { data: logsData, isLoading: logsLoading } = useSessionLogs(tunnelId);

  const logs = logsData?.logs ?? [];

  const renderLogEntries = () => {
    if (logsLoading) {
      return (
        <div className="py-8 text-center text-slate-400">Loading logs...</div>
      );
    }
    if (logs.length === 0) {
      return (
        <div className="py-8 text-center text-slate-400">No requests yet</div>
      );
    }
    return (
      <div className="divide-y divide-slate-800/50">
        {logs.map((log) => (
          <div
            key={log.id}
            className="grid grid-cols-12 gap-4 px-3 py-3 text-sm hover:bg-slate-800/30 transition-colors"
          >
            <div className="col-span-1">
              <span
                className={cn(
                  'text-xs font-mono px-2 py-0.5 rounded',
                  log.method === 'GET' && 'bg-teal-500/20 text-teal-400',
                  log.method === 'POST' && 'bg-blue-500/20 text-blue-400',
                  log.method === 'PUT' && 'bg-amber-500/20 text-amber-400',
                  log.method === 'DELETE' && 'bg-rose-500/20 text-rose-400'
                )}
              >
                {log.method}
              </span>
            </div>
            <div className="col-span-5 font-mono text-slate-300 truncate">
              {log.path}
            </div>
            <div className="col-span-2">
              <span
                className={cn(
                  'font-mono text-xs',
                  (log.status ?? 0) < 300 && 'text-teal-400',
                  (log.status ?? 0) >= 300 &&
                    (log.status ?? 0) < 400 &&
                    'text-amber-400',
                  (log.status ?? 0) >= 400 &&
                    (log.status ?? 0) < 500 &&
                    'text-orange-400',
                  (log.status ?? 0) >= 500 && 'text-rose-400'
                )}
              >
                {log.status ?? '-'}
              </span>
            </div>
            <div className="col-span-2 font-mono text-slate-400">
              {log.durationMs ? `${log.durationMs}ms` : '-'}
            </div>
            <div className="col-span-2 text-right font-mono text-slate-500">
              {formatTime(log.timestamp)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (tunnelLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-center text-slate-400">Loading tunnel...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tunnel) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-center text-slate-400">Tunnel not found</div>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = tunnel.status === 'active';

  return (
    <DashboardLayout>
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <Link
          href="/tunnels"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Tunnels
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isActive ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'
            )}
          />
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              {tunnel.subdomain}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <span className="font-mono">localhost:{tunnel.localPort}</span>
              <span>→</span>
              <a
                href={tunnel.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-teal-400 hover:underline"
              >
                {tunnel.publicUrl.replace('https://', '')}
              </a>
              <CopyButton text={tunnel.publicUrl} />
            </div>
          </div>
        </div>
        <PulseBadge
          variant={isActive ? 'connected' : 'disconnected'}
          appearance="pill"
        >
          {isActive ? 'Connected' : 'Disconnected'}
        </PulseBadge>
      </div>

      {/* Connection Visualization */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
        <TunnelConnection
          localLabel="localhost"
          localSublabel={`:${tunnel.localPort}`}
          publicLabel={tunnel.subdomain}
          publicSublabel={`.${tunnel.publicUrl
            .replace('https://', '')
            .split('.')
            .slice(1)
            .join('.')}`}
          status={isActive ? 'connected' : 'disconnected'}
          tunnelName={tunnel.subdomain}
          animated={isActive}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value={tunnel.requestCount?.toLocaleString() ?? '0'}
          label="Total Requests"
          sublabel="this session"
        />
        <MetricCard
          value={formatBytes(tunnel.bytesIn)}
          label="Bytes In"
          sublabel="received"
        />
        <MetricCard
          value={formatBytes(tunnel.bytesOut)}
          label="Bytes Out"
          sublabel="sent"
        />
        <MetricCard
          value={formatUptime(tunnel.connectedAt)}
          label="Uptime"
          sublabel={isActive ? 'connected' : 'was connected'}
        />
      </div>

      {/* Request Logs */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Request Log</h3>
          <div className="flex items-center gap-2">
            {isActive && (
              <PulseBadge variant="connected" size="sm">
                Live
              </PulseBadge>
            )}
          </div>
        </div>

        {/* Log table header */}
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-800">
          <div className="col-span-1">Method</div>
          <div className="col-span-5">Path</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        {/* Log entries */}
        {renderLogEntries()}

        {/* Load more */}
        {logsData?.hasMore && (
          <div className="pt-4 border-t border-slate-800 mt-4">
            <GlowButton variant="ghost" size="sm" className="w-full">
              Load More
            </GlowButton>
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-slate-400">
            <span className="text-slate-500">Session ID:</span>{' '}
            <span className="font-mono">{tunnel.id}</span>
          </div>
          <div className="text-sm text-slate-400">
            <span className="text-slate-500">Connected:</span>{' '}
            <span className="font-mono">
              {new Date(tunnel.connectedAt).toLocaleString()}
            </span>
          </div>
          {tunnel.disconnectedAt && (
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">Disconnected:</span>{' '}
              <span className="font-mono">
                {new Date(tunnel.disconnectedAt).toLocaleString()}
              </span>
            </div>
          )}
          {tunnel.clientVersion && (
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">CLI Version:</span>{' '}
              <span className="font-mono">{tunnel.clientVersion}</span>
            </div>
          )}
        </div>
      </div>
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
      className="p-1 rounded hover:bg-slate-700 transition-colors"
      title="Copy to clipboard"
    >
      <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
    </button>
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
