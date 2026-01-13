'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const pulseBadgeVariants = cva(
  [
    'relative inline-flex items-center gap-1.5',
    'font-mono text-xs font-medium uppercase tracking-wider',
    'transition-all duration-300',
  ],
  {
    variants: {
      variant: {
        connected: [
          'text-[#00ff00]',
          '[--pulse-color:#00ff00]',
        ],
        disconnected: [
          'text-[#ff0000]',
          '[--pulse-color:#ff0000]',
        ],
        warning: [
          'text-[#ffb800]',
          '[--pulse-color:#ffb800]',
        ],
        info: [
          'text-white/80',
          '[--pulse-color:rgba(255,255,255,0.8)]',
        ],
        neutral: [
          'text-white/50',
          '[--pulse-color:rgba(255,255,255,0.5)]',
        ],
        processing: [
          'text-[#ffb800]',
          '[--pulse-color:#ffb800]',
        ],
      },
      size: {
        sm: 'text-[10px]',
        default: 'text-xs',
        lg: 'text-sm',
      },
      appearance: {
        dot: '',
        pill: [
          'px-3 py-1',
          'bg-[#0a0a0a]',
          'border border-current/30',
        ],
        tag: [
          'px-2 py-0.5',
          'bg-current/10',
          'border-l-2 border-current',
        ],
      },
    },
    defaultVariants: {
      variant: 'connected',
      size: 'default',
      appearance: 'dot',
    },
  }
);

export interface PulseBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pulseBadgeVariants> {
  pulse?: boolean;
  icon?: React.ReactNode;
}

const PulseBadge = React.forwardRef<HTMLSpanElement, PulseBadgeProps>(
  (
    {
      className,
      variant,
      size,
      appearance,
      pulse = true,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const showDot = appearance === 'dot' || appearance === undefined;

    // Size-based dot dimensions
    const dotSizes = {
      sm: { dot: 'h-1.5 w-1.5', pill: 'h-1 w-1' },
      default: { dot: 'h-2 w-2', pill: 'h-1.5 w-1.5' },
      lg: { dot: 'h-2.5 w-2.5', pill: 'h-2 w-2' },
    };
    const currentSize = size || 'default';
    const dotSize = dotSizes[currentSize];

    // Glow class based on variant
    const getGlowClass = () => {
      if (variant === 'connected') {
        return 'drop-shadow-[0_0_6px_rgba(0,255,0,0.5)]';
      }
      if (variant === 'disconnected') {
        return 'drop-shadow-[0_0_6px_rgba(255,0,0,0.5)]';
      }
      if (variant === 'warning' || variant === 'processing') {
        return 'drop-shadow-[0_0_6px_rgba(255,184,0,0.5)]';
      }
      return '';
    };
    const glowClass = getGlowClass();

    return (
      <span
        ref={ref}
        className={cn(pulseBadgeVariants({ variant, size, appearance }), glowClass, className)}
        {...props}
      >
        {showDot && (
          <span className={cn('relative flex', dotSize.dot)}>
            {pulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  'bg-[var(--pulse-color)]',
                  'animate-ping'
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full',
                dotSize.dot,
                'bg-[var(--pulse-color)]'
              )}
            />
          </span>
        )}
        {appearance === 'pill' && (
          <span className={cn('relative flex', dotSize.pill)}>
            {pulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  'bg-[var(--pulse-color)]',
                  'animate-ping'
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full',
                dotSize.pill,
                'bg-[var(--pulse-color)]'
              )}
            />
          </span>
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);
PulseBadge.displayName = 'PulseBadge';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'connected' | 'disconnected' | 'idle' | 'busy';
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, showLabel = true, size = 'default', ...props }, ref) => {
    const statusConfig = {
      connected: { variant: 'connected' as const, label: 'CONNECTED' },
      disconnected: { variant: 'disconnected' as const, label: 'DISCONNECTED' },
      idle: { variant: 'warning' as const, label: 'IDLE' },
      busy: { variant: 'processing' as const, label: 'BUSY' },
    };

    const config = statusConfig[status];

    return (
      <div ref={ref} className={cn('flex items-center', className)} {...props}>
        <PulseBadge
          variant={config.variant}
          size={size}
          pulse={status === 'connected' || status === 'busy'}
        >
          {showLabel && config.label}
        </PulseBadge>
      </div>
    );
  }
);
StatusIndicator.displayName = 'StatusIndicator';

export interface ConnectionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  connected: boolean;
  latency?: number;
  showLatency?: boolean;
}

const ConnectionBadge = React.forwardRef<HTMLDivElement, ConnectionBadgeProps>(
  ({ className, connected, latency, showLatency = true, ...props }, ref) => {
    const getLatencyColor = (ms: number) => {
      if (ms < 50) return 'text-[#00ff00]';
      if (ms < 150) return 'text-[#ffb800]';
      return 'text-[#ff0000]';
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3', className)}
        {...props}
      >
        <PulseBadge
          variant={connected ? 'connected' : 'disconnected'}
          appearance="pill"
          pulse={connected}
        >
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </PulseBadge>
        {connected && showLatency && latency !== undefined && (
          <span
            className={cn(
              'font-mono text-xs',
              getLatencyColor(latency)
            )}
          >
            {latency}ms
          </span>
        )}
      </div>
    );
  }
);
ConnectionBadge.displayName = 'ConnectionBadge';

export { ConnectionBadge, PulseBadge, pulseBadgeVariants, StatusIndicator };
