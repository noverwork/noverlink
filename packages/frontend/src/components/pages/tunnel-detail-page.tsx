'use client';

import {
  cn,
  GlowButton,
  MetricCard,
  PulseBadge,
  TunnelConnection,
} from '@noverlink/ui-shared';
import Link from 'next/link';
import { useState } from 'react';

import { useLogDetail, useSession, useSessionLogs } from '../../lib/hooks';
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
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const { data: tunnel, isLoading: tunnelLoading } = useSession(tunnelId);
  const { data: logsData, isLoading: logsLoading } = useSessionLogs(tunnelId);
  const { data: logDetail, isLoading: detailLoading } = useLogDetail(
    tunnelId,
    selectedLogId
  );

  const logs = logsData?.logs ?? [];

  const renderLogEntries = () => {
    if (logsLoading) {
      return (
        <div className="py-8 text-center text-white/40">Loading logs...</div>
      );
    }
    if (logs.length === 0) {
      return (
        <div className="py-8 text-center text-white/40">No requests yet</div>
      );
    }
    return (
      <div className="divide-y divide-white/10">
        {logs.map((log) => {
          const isSelected = selectedLogId === log.id;
          return (
            <div key={log.id}>
              <div
                onClick={() =>
                  setSelectedLogId(isSelected ? null : log.id)
                }
                className={cn(
                  'grid grid-cols-12 gap-4 px-3 py-3 text-sm cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-white/5'
                    : 'hover:bg-white/[0.03]'
                )}
              >
                <div className="col-span-1">
                  <span
                    className={cn(
                      'text-xs font-mono uppercase px-2 py-0.5',
                      log.method === 'GET' && 'bg-[#00ff00]/20 text-[#00ff00]',
                      log.method === 'POST' && 'bg-blue-500/20 text-blue-400',
                      log.method === 'PUT' && 'bg-[#ffb800]/20 text-[#ffb800]',
                      log.method === 'DELETE' && 'bg-[#ff0000]/20 text-[#ff0000]'
                    )}
                  >
                    {log.method}
                  </span>
                </div>
                <div className="col-span-5 font-mono text-white/60 truncate">
                  {log.path}
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      'font-mono text-xs',
                      (log.status ?? 0) < 300 && 'text-[#00ff00]',
                      (log.status ?? 0) >= 300 &&
                        (log.status ?? 0) < 400 &&
                        'text-[#ffb800]',
                      (log.status ?? 0) >= 400 &&
                        (log.status ?? 0) < 500 &&
                        'text-[#ffb800]',
                      (log.status ?? 0) >= 500 && 'text-[#ff0000]'
                    )}
                  >
                    {log.status ?? '-'}
                  </span>
                </div>
                <div className="col-span-2 font-mono text-white/40">
                  {log.durationMs ? `${log.durationMs}ms` : '-'}
                </div>
                <div className="col-span-2 text-right font-mono text-white/40 flex items-center justify-end gap-2">
                  {formatTime(log.timestamp)}
                  <ChevronIcon
                    className={cn(
                      'w-4 h-4 text-white/40 transition-transform',
                      isSelected && 'rotate-180'
                    )}
                  />
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isSelected && (
                <LogDetailPanel
                  detail={logDetail}
                  isLoading={detailLoading}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (tunnelLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-[#111] border border-white/10">
          <div className="text-center text-white/40">Loading tunnel...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tunnel) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-[#111] border border-white/10">
          <div className="text-center text-white/40">Tunnel not found</div>
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
          className="text-xs text-white/40 hover:text-[#00ff00] transition-colors"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          &larr; Back to Tunnels
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-3 h-3',
              isActive ? 'bg-[#00ff00] animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.5)]' : 'bg-white/20'
            )}
          />
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
              {tunnel.subdomain}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/40 mt-1">
              <span className="font-mono">localhost:{tunnel.localPort}</span>
              <span>&rarr;</span>
              <a
                href={tunnel.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#00ff00] hover:underline"
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
      <div className="p-6 bg-[#111] border border-white/10 mb-6">
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
      <div className="p-6 bg-[#111] border border-white/10">
        <div className="flex items-center justify-between mb-4">
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
            Request Log
          </h3>
          <div className="flex items-center gap-2">
            {isActive && (
              <PulseBadge variant="connected" size="sm">
                Live
              </PulseBadge>
            )}
          </div>
        </div>

        {/* Log table header */}
        <div
          className="grid grid-cols-12 gap-4 px-3 py-2 text-[0.65rem] text-white/40 border-b border-white/10"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
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
          <div className="pt-4 border-t border-white/10 mt-4">
            <GlowButton variant="ghost" size="sm" className="w-full">
              Load More
            </GlowButton>
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="mt-6 p-4 bg-[#111] border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-white/40">
            <span className="text-white/60">Session ID:</span>{' '}
            <span className="font-mono">{tunnel.id}</span>
          </div>
          <div className="text-sm text-white/40">
            <span className="text-white/60">Connected:</span>{' '}
            <span className="font-mono">
              {new Date(tunnel.connectedAt).toLocaleString()}
            </span>
          </div>
          {tunnel.disconnectedAt && (
            <div className="text-sm text-white/40">
              <span className="text-white/60">Disconnected:</span>{' '}
              <span className="font-mono">
                {new Date(tunnel.disconnectedAt).toLocaleString()}
              </span>
            </div>
          )}
          {tunnel.clientVersion && (
            <div className="text-sm text-white/40">
              <span className="text-white/60">CLI Version:</span>{' '}
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
      className="p-1 hover:bg-white/10 transition-colors"
      title="Copy to clipboard"
    >
      <CopyIcon className="w-3.5 h-3.5 text-white/40" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface LogDetailPanelProps {
  detail: import('../../lib/api').TunnelLogDetail | undefined;
  isLoading: boolean;
}

function LogDetailPanel({ detail, isLoading }: LogDetailPanelProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-6 bg-black/50 border-t border-white/10">
        <div className="text-sm text-white/40">Loading details...</div>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <div className="px-4 py-4 bg-black/50 border-t border-white/10 space-y-4">
      {/* Truncation Warning */}
      {detail.bodyTruncated && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#ffb800]/10 border border-[#ffb800]/20">
          <span className="text-[#ffb800] text-xs">!</span>
          <span className="text-xs text-[#ffb800] font-mono uppercase tracking-wider">
            Body truncated (original:{' '}
            {detail.originalRequestSize
              ? `req ${Math.round(detail.originalRequestSize / 1024)}KB`
              : ''}
            {detail.originalRequestSize && detail.originalResponseSize
              ? ', '
              : ''}
            {detail.originalResponseSize
              ? `res ${Math.round(detail.originalResponseSize / 1024)}KB`
              : ''}
            )
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Panel */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white/40">
            Request
          </h4>

          {/* Request Headers */}
          <div>
            <div className="text-xs text-white/40 mb-1 font-mono uppercase tracking-wider">Headers</div>
            <div className="bg-black p-3 max-h-48 overflow-auto border border-white/10">
              <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap">
                {formatHeaders(detail.requestHeaders)}
              </pre>
            </div>
          </div>

          {/* Request Body */}
          {detail.requestBody && (
            <div>
              <div className="text-xs text-white/40 mb-1 font-mono uppercase tracking-wider">Body</div>
              <div className="bg-black p-3 max-h-64 overflow-auto border border-white/10">
                <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap">
                  {formatBody(detail.requestBody, detail.requestHeaders['content-type'])}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white/40">
            Response
          </h4>

          {/* Response Headers */}
          {detail.responseHeaders && (
            <div>
              <div className="text-xs text-white/40 mb-1 font-mono uppercase tracking-wider">Headers</div>
              <div className="bg-black p-3 max-h-48 overflow-auto border border-white/10">
                <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap">
                  {formatHeaders(detail.responseHeaders)}
                </pre>
              </div>
            </div>
          )}

          {/* Response Body */}
          {detail.responseBody && (
            <div>
              <div className="text-xs text-white/40 mb-1 font-mono uppercase tracking-wider">Body</div>
              <div className="bg-black p-3 max-h-64 overflow-auto border border-white/10">
                <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap">
                  {formatBody(
                    detail.responseBody,
                    detail.responseHeaders?.['content-type']
                  )}
                </pre>
              </div>
            </div>
          )}

          {!detail.responseHeaders && !detail.responseBody && (
            <div className="text-xs text-white/40 italic font-mono">No response recorded</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function formatBody(body: string, contentType?: string): string {
  if (!body) return '';

  // Try to format JSON
  if (contentType?.includes('application/json') || body.startsWith('{') || body.startsWith('[')) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      // Not valid JSON, return as-is
    }
  }

  return body;
}
