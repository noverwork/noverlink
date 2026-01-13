'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

function getFlowAnimation(
  isHorizontal: boolean,
  flowDirection: 'forward' | 'backward'
): string {
  if (isHorizontal) {
    return flowDirection === 'forward' ? 'flow-right' : 'flow-left';
  }
  return flowDirection === 'forward' ? 'flow-down' : 'flow-up';
}

const tunnelLineVariants = cva('relative', {
  variants: {
    status: {
      connected: '',
      disconnected: 'opacity-40',
      connecting: '',
    },
    direction: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
  },
  defaultVariants: {
    status: 'connected',
    direction: 'horizontal',
  },
});

export interface TunnelLineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelLineVariants> {
  animated?: boolean;
  flowDirection?: 'forward' | 'backward';
  label?: string;
}

const TunnelLine = React.forwardRef<HTMLDivElement, TunnelLineProps>(
  (
    {
      className,
      status,
      direction,
      animated = false,
      flowDirection = 'forward',
      label,
      ...props
    },
    ref
  ) => {
    const isHorizontal = direction === 'horizontal' || direction === undefined;
    const isConnected = status === 'connected' || status === undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center',
          isHorizontal ? 'w-full px-2' : 'h-full py-2',
          className
        )}
        {...props}
      >
        {/* Main line */}
        <div
          className={cn(
            tunnelLineVariants({ status, direction }),
            isConnected
              ? 'bg-gradient-to-r from-white/10 via-[#00ff00]/50 to-white/10'
              : 'bg-white/20'
          )}
        />

        {/* Flow dot animation */}
        {animated && isConnected && (
          <div
            className={cn(
              'absolute w-2 h-2 rounded-full bg-[#00ff00]',
              'shadow-[0_0_10px_rgba(0,255,0,0.8)]'
            )}
            style={{
              animation: `${getFlowAnimation(isHorizontal, flowDirection)} 2s linear infinite`,
            }}
          />
        )}

        {/* Connecting pulse animation */}
        {status === 'connecting' && (
          <div
            className={cn(
              'absolute w-3 h-3 rounded-full bg-[#ffb800]/50',
              'animate-ping'
            )}
          />
        )}

        {/* Label badge */}
        {label && (
          <div
            className={cn(
              'absolute px-3 py-1',
              'bg-[#0a0a0a] border',
              isConnected ? 'border-[#00ff00]/30' : 'border-white/20',
              'text-xs font-mono uppercase tracking-wider',
              isConnected ? 'text-[#00ff00]' : 'text-white/50'
            )}
          >
            {label}
          </div>
        )}
      </div>
    );
  }
);
TunnelLine.displayName = 'TunnelLine';

// Convenience component for complete tunnel visualization
export interface TunnelConnectionProps extends React.HTMLAttributes<HTMLDivElement> {
  localLabel?: string;
  localSublabel?: string;
  publicLabel?: string;
  publicSublabel?: string;
  status?: 'connected' | 'disconnected' | 'connecting';
  tunnelName?: string;
  animated?: boolean;
  /** Custom local node component */
  localNode?: React.ReactNode;
  /** Custom public node component */
  publicNode?: React.ReactNode;
}

const TunnelConnection = React.forwardRef<HTMLDivElement, TunnelConnectionProps>(
  (
    {
      className,
      localLabel = 'LOCAL',
      localSublabel,
      publicLabel = 'PUBLIC',
      publicSublabel,
      status = 'connected',
      tunnelName,
      animated = true,
      localNode,
      publicNode,
      ...props
    },
    ref
  ) => {
    const isConnected = status === 'connected';

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-4', className)}
        {...props}
      >
        {/* Local node - use custom or placeholder */}
        {localNode || (
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-16 h-16 flex items-center justify-center',
                'bg-[#0a0a0a] border border-white/20',
                status === 'disconnected' && 'opacity-50',
                status === 'connecting' && 'animate-pulse'
              )}
            >
              <svg
                className="w-7 h-7 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xs font-mono uppercase tracking-wider text-white">{localLabel}</div>
              {localSublabel && (
                <div className="text-xs font-mono text-white/50">{localSublabel}</div>
              )}
            </div>
          </div>
        )}

        {/* Connection line */}
        <div className="flex-1 min-w-[100px]">
          <TunnelLine
            status={status}
            animated={animated && status === 'connected'}
            label={tunnelName}
          />
        </div>

        {/* Public node - use custom or placeholder */}
        {publicNode || (
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-16 h-16 flex items-center justify-center',
                'bg-[#0a0a0a]',
                isConnected
                  ? 'border border-[#00ff00]/50 shadow-[0_0_15px_rgba(0,255,0,0.15)]'
                  : 'border border-white/20',
                status === 'disconnected' && 'opacity-50',
                status === 'connecting' && 'animate-pulse'
              )}
            >
              <svg
                className={cn(
                  'w-7 h-7',
                  isConnected ? 'text-[#00ff00]' : 'text-white/40'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xs font-mono uppercase tracking-wider text-white">{publicLabel}</div>
              {publicSublabel && (
                <div className={cn(
                  'text-xs font-mono',
                  isConnected ? 'text-[#00ff00]/80' : 'text-white/50'
                )}>{publicSublabel}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
TunnelConnection.displayName = 'TunnelConnection';

export { TunnelConnection, TunnelLine, tunnelLineVariants };
