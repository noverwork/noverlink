'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const tunnelCardVariants = cva(
  [
    'p-4 rounded-xl',
    'flex items-center justify-between',
    'transition-colors',
  ],
  {
    variants: {
      status: {
        online: [
          'border border-teal-500/20 bg-teal-500/5',
          'hover:border-teal-500/30 hover:bg-teal-500/10',
        ],
        offline: [
          'border border-slate-800 bg-slate-900/30',
          'hover:border-slate-700 hover:bg-slate-900/50',
        ],
        error: [
          'border border-rose-500/20 bg-rose-500/5',
          'hover:border-rose-500/30 hover:bg-rose-500/10',
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
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isOnline && 'bg-teal-400',
              status === 'offline' && 'bg-slate-600',
              isError && 'bg-rose-400'
            )}
          />

          {/* Tunnel info */}
          <div>
            <div
              className={cn(
                'font-medium',
                isOnline && 'text-white',
                status === 'offline' && 'text-slate-400',
                isError && 'text-rose-300'
              )}
            >
              {name}
            </div>
            {(localPort || publicUrl) && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                {localPort && <span>:{localPort}</span>}
                {localPort && publicUrl && <span>→</span>}
                {publicUrl && (
                  <span className={cn(isOnline && 'text-teal-400/80')}>
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
                'text-sm',
                isOnline && 'text-slate-400',
                status === 'offline' && 'text-slate-500',
                isError && 'text-rose-400'
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
          'text-center p-4 rounded-xl bg-slate-800/50',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-semibold text-white">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-xs',
                trend === 'up' && 'text-teal-400',
                trend === 'down' && 'text-rose-400',
                trend === 'neutral' && 'text-slate-400'
              )}
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'neutral' && '→'}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {label}
          {sublabel && <span className="text-slate-600"> · {sublabel}</span>}
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
        className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}
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

export { MetricCard, TunnelCard, tunnelCardVariants,TunnelStats };
