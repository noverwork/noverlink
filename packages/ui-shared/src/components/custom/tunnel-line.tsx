'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

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
              ? 'bg-gradient-to-r from-slate-700 via-teal-500 to-slate-700'
              : 'bg-slate-700'
          )}
        />

        {/* Flow dot animation */}
        {animated && isConnected && (
          <div
            className={cn(
              'absolute w-2 h-2 rounded-full bg-teal-400',
              'shadow-lg shadow-teal-400/50'
            )}
            style={{
              animation: isHorizontal
                ? `flow-${flowDirection === 'forward' ? 'right' : 'left'} 2s linear infinite`
                : `flow-${flowDirection === 'forward' ? 'down' : 'up'} 2s linear infinite`,
            }}
          />
        )}

        {/* Connecting pulse animation */}
        {status === 'connecting' && (
          <div
            className={cn(
              'absolute w-3 h-3 rounded-full bg-teal-400/50',
              'animate-ping'
            )}
          />
        )}

        {/* Label badge */}
        {label && (
          <div
            className={cn(
              'absolute px-3 py-1 rounded-full',
              'bg-slate-900 border',
              isConnected ? 'border-teal-500/30' : 'border-slate-700',
              'text-xs font-medium',
              isConnected ? 'text-teal-400' : 'text-slate-500'
            )}
          >
            {label}
          </div>
        )}

        <style jsx>{`
          @keyframes flow-right {
            0% {
              left: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }

          @keyframes flow-left {
            0% {
              right: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              right: 100%;
              opacity: 0;
            }
          }

          @keyframes flow-down {
            0% {
              top: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }

          @keyframes flow-up {
            0% {
              bottom: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              bottom: 100%;
              opacity: 0;
            }
          }
        `}</style>
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
      localLabel = 'Local',
      localSublabel,
      publicLabel = 'Public',
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
                'w-16 h-16 flex items-center justify-center rounded-2xl',
                'bg-slate-800 border border-slate-700',
                status === 'disconnected' && 'opacity-50',
                status === 'connecting' && 'animate-pulse'
              )}
            >
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">{localLabel}</div>
              {localSublabel && (
                <div className="text-xs font-mono text-slate-400">{localSublabel}</div>
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
                'w-16 h-16 flex items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
                'border border-teal-500/30',
                status === 'disconnected' && 'opacity-50',
                status === 'connecting' && 'animate-pulse'
              )}
            >
              <svg
                className="w-7 h-7 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">{publicLabel}</div>
              {publicSublabel && (
                <div className="text-xs font-mono text-slate-400">{publicSublabel}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
TunnelConnection.displayName = 'TunnelConnection';

export { TunnelLine, TunnelConnection, tunnelLineVariants };
