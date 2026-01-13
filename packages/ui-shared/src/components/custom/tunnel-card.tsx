'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const tunnelCardVariants = cva(
  [
    'p-4',
    'flex items-center justify-between',
    'transition-all duration-200',
    'border-l-2',
    'bg-[#0a0a0a]',
  ],
  {
    variants: {
      status: {
        online: [
          'border-l-[#00ff00]',
          'hover:bg-[#00ff00]/5',
        ],
        offline: [
          'border-l-white/20',
          'hover:bg-white/5',
          'opacity-60',
        ],
        error: [
          'border-l-[#ff0000]',
          'hover:bg-[#ff0000]/5',
        ],
      },
    },
    defaultVariants: {
      status: 'online',
    },
  }
);

export interface TunnelCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelCardVariants> {
  name: string;
  localPort?: number;
  publicUrl?: string;
  stats?: string;
  actions?: React.ReactNode;
}

const TunnelCard = React.forwardRef<HTMLDivElement, TunnelCardProps>(
  (
    {
      className,
      status,
      name,
      localPort,
      publicUrl,
      stats,
      actions,
      ...props
    },
    ref
  ) => {
    const isOnline = status === 'online' || status === undefined;
    const isError = status === 'error';

    return (
      <div
        ref={ref}
        className={cn(tunnelCardVariants({ status }), className)}
        {...props}
      >
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isOnline && 'bg-[#00ff00] shadow-[0_0_8px_rgba(0,255,0,0.5)]',
              status === 'offline' && 'bg-white/30',
              isError && 'bg-[#ff0000] shadow-[0_0_8px_rgba(255,0,0,0.5)]'
            )}
          />

          {/* Tunnel info */}
          <div>
            <div
              className={cn(
                'font-mono text-sm tracking-wider uppercase',
                isOnline && 'text-white',
                status === 'offline' && 'text-white/50',
                isError && 'text-[#ff0000]'
              )}
            >
              {name}
            </div>
            {(localPort || publicUrl) && (
              <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-1">
                {localPort && <span>:{localPort}</span>}
                {localPort && publicUrl && <span className="text-white/30">→</span>}
                {publicUrl && (
                  <span className={cn(isOnline && 'text-[#00ff00]/80')}>
                    {publicUrl}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: stats or actions */}
        <div className="flex items-center gap-4">
          {stats && (
            <div
              className={cn(
                'text-xs font-mono',
                isOnline && 'text-white/60',
                status === 'offline' && 'text-white/30',
                isError && 'text-[#ff0000]/80'
              )}
            >
              {stats}
            </div>
          )}
          {actions}
        </div>
      </div>
    );
  }
);
TunnelCard.displayName = 'TunnelCard';

// Metric display card
export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, value, label, sublabel, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-center p-4 bg-[#0a0a0a] border border-white/10',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-mono text-white">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-xs font-mono',
                trend === 'up' && 'text-[#00ff00]',
                trend === 'down' && 'text-[#ff0000]',
                trend === 'neutral' && 'text-white/50'
              )}
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'neutral' && '→'}
            </span>
          )}
        </div>
        <div className="text-xs uppercase tracking-wider text-white/50 mt-1">
          {label}
          {sublabel && <span className="text-white/30"> · {sublabel}</span>}
        </div>
      </div>
    );
  }
);
MetricCard.displayName = 'MetricCard';

// Stats row component
export interface TunnelStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  requests?: number | string;
  bandwidth?: string;
  latency?: string;
  uptime?: string;
}

const TunnelStats = React.forwardRef<HTMLDivElement, TunnelStatsProps>(
  ({ className, requests, bandwidth, latency, uptime, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10', className)}
        {...props}
      >
        {requests !== undefined && (
          <MetricCard value={requests} label="Requests" sublabel="total" />
        )}
        {bandwidth && (
          <MetricCard value={bandwidth} label="Bandwidth" sublabel="total" />
        )}
        {latency && (
          <MetricCard value={latency} label="Latency" sublabel="avg" />
        )}
        {uptime && (
          <MetricCard value={uptime} label="Uptime" />
        )}
      </div>
    );
  }
);
TunnelStats.displayName = 'TunnelStats';

export { MetricCard, TunnelCard, tunnelCardVariants, TunnelStats };
