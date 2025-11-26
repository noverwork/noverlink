'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const tunnelNodeVariants = cva(
  [
    'flex items-center justify-center',
    'rounded-2xl transition-colors',
  ],
  {
    variants: {
      variant: {
        local: [
          'bg-slate-800 border border-slate-700',
        ],
        public: [
          'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
          'border border-teal-500/30',
        ],
        relay: [
          'bg-slate-800/50 border border-slate-600',
        ],
      },
      size: {
        sm: 'w-12 h-12',
        default: 'w-16 h-16',
        lg: 'w-20 h-20',
      },
      status: {
        connected: '',
        disconnected: 'opacity-50',
        connecting: '',
      },
    },
    defaultVariants: {
      variant: 'local',
      size: 'default',
      status: 'connected',
    },
  }
);

const iconVariants = cva('', {
  variants: {
    variant: {
      local: 'text-slate-400',
      public: 'text-teal-400',
      relay: 'text-slate-500',
    },
    size: {
      sm: 'w-5 h-5',
      default: 'w-7 h-7',
      lg: 'w-9 h-9',
    },
  },
  defaultVariants: {
    variant: 'local',
    size: 'default',
  },
});

export interface TunnelNodeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelNodeVariants> {
  icon?: React.ReactNode;
  label?: string;
  sublabel?: string;
}

const TunnelNode = React.forwardRef<HTMLDivElement, TunnelNodeProps>(
  (
    {
      className,
      variant,
      size,
      status,
      icon,
      label,
      sublabel,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          ref={ref}
          className={cn(
            tunnelNodeVariants({ variant, size, status }),
            status === 'connecting' && 'animate-pulse',
            className
          )}
          {...props}
        >
          {icon ? (
            <span className={cn(iconVariants({ variant, size }))}>{icon}</span>
          ) : (
            <DefaultNodeIcon variant={variant} size={size} />
          )}
        </div>
        {(label || sublabel) && (
          <div className="text-center">
            {label && (
              <div className="text-sm font-medium text-white">{label}</div>
            )}
            {sublabel && (
              <div className="text-xs font-mono text-slate-400">{sublabel}</div>
            )}
          </div>
        )}
      </div>
    );
  }
);
TunnelNode.displayName = 'TunnelNode';

// Default icons for each node variant
function DefaultNodeIcon({
  variant,
  size,
}: {
  variant?: 'local' | 'public' | 'relay' | null;
  size?: 'sm' | 'default' | 'lg' | null;
}) {
  const className = cn(iconVariants({ variant, size }));

  if (variant === 'public') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    );
  }

  if (variant === 'relay') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    );
  }

  // Default: local/computer icon
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}

export { TunnelNode, tunnelNodeVariants };
