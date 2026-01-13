'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const tunnelLoaderVariants = cva('relative inline-flex items-center justify-center', {
  variants: {
    size: {
      sm: 'gap-1.5',
      default: 'gap-2',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const dotSizeVariants = cva('bg-[#00ff00] animate-pulse shadow-[0_0_6px_rgba(0,255,0,0.5)]', {
  variants: {
    size: {
      sm: 'w-2 h-2',
      default: 'w-3 h-3',
      lg: 'w-4 h-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface TunnelLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelLoaderVariants> {
  count?: number;
}

const TunnelLoader = React.forwardRef<HTMLDivElement, TunnelLoaderProps>(
  ({ className, size, count = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tunnelLoaderVariants({ size }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(dotSizeVariants({ size }))}
            style={{
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    );
  }
);
TunnelLoader.displayName = 'TunnelLoader';

export interface SpinnerLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelLoaderVariants> {}

const spinnerSizeVariants = cva(
  'border-2 border-white/10 border-t-[#00ff00] animate-spin',
  {
    variants: {
      size: {
        sm: 'w-5 h-5',
        default: 'w-8 h-8',
        lg: 'w-12 h-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const SpinnerLoader = React.forwardRef<HTMLDivElement, SpinnerLoaderProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerSizeVariants({ size }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
SpinnerLoader.displayName = 'SpinnerLoader';

export interface ConnectionLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelLoaderVariants> {
  count?: number;
}

const ConnectionLoader = React.forwardRef<HTMLDivElement, ConnectionLoaderProps>(
  ({ className, size, count = 5, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tunnelLoaderVariants({ size }), className)}
        role="status"
        aria-label="Connecting"
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(dotSizeVariants({ size }))}
            style={{
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    );
  }
);
ConnectionLoader.displayName = 'ConnectionLoader';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  text?: string;
  variant?: 'tunnel' | 'spinner' | 'connection';
}

function getLoaderComponent(variant: 'tunnel' | 'spinner' | 'connection') {
  if (variant === 'spinner') return SpinnerLoader;
  if (variant === 'connection') return ConnectionLoader;
  return TunnelLoader;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { className, loading = true, text, variant = 'tunnel', children, ...props },
    ref
  ) => {
    if (!loading) {
      return children;
    }

    const LoaderComponent = getLoaderComponent(variant);

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm z-50">
          <LoaderComponent size="lg" />
          {text && (
            <span className="mt-4 text-xs font-mono uppercase tracking-wider text-white/60">
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

// Export legacy name for backward compatibility
export const HexLoader = TunnelLoader;

export {
  ConnectionLoader,
  LoadingOverlay,
  SpinnerLoader,
  TunnelLoader,
  tunnelLoaderVariants,
};
