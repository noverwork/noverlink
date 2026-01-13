'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const tunnelProgressVariants = cva('relative overflow-hidden', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface TunnelProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelProgressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  indeterminate?: boolean;
}

const TunnelProgress = React.forwardRef<HTMLDivElement, TunnelProgressProps>(
  (
    {
      className,
      size,
      value,
      max = 100,
      showValue = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="w-full space-y-1">
        {showValue && (
          <div className="flex justify-between text-xs font-mono uppercase tracking-wider">
            <span className="text-white/50">PROGRESS</span>
            <span className="text-[#00ff00]">
              {indeterminate ? '...' : `${Math.round(percentage)}%`}
            </span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            tunnelProgressVariants({ size }),
            'bg-white/10',
            className
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          {/* Progress bar */}
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              indeterminate ? 'w-1/3' : '',
              'bg-[#00ff00]',
              'shadow-[0_0_10px_rgba(0,255,0,0.5)]'
            )}
            style={{
              width: indeterminate ? undefined : `${percentage}%`,
              animation: indeterminate
                ? 'progress-indeterminate 1.5s ease-in-out infinite'
                : undefined,
            }}
          />
        </div>
      </div>
    );
  }
);
TunnelProgress.displayName = 'TunnelProgress';

export interface SegmentedProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof tunnelProgressVariants>, 'size'> {
  value: number;
  max?: number;
  segments?: number;
  gap?: number;
}

const SegmentedProgress = React.forwardRef<
  HTMLDivElement,
  SegmentedProgressProps
>(({ className, value, max = 100, segments = 10, gap = 2, ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filledSegments = Math.round((percentage / 100) * segments);

  return (
    <div
      ref={ref}
      className={cn('flex w-full h-2', className)}
      style={{ gap: `${gap}px` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-full transition-all duration-300',
            i < filledSegments
              ? 'bg-[#00ff00] shadow-[0_0_5px_rgba(0,255,0,0.5)]'
              : 'bg-white/10'
          )}
          style={{
            transitionDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
});
SegmentedProgress.displayName = 'SegmentedProgress';

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tunnelProgressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  strokeWidth?: number;
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      className,
      size,
      value,
      max = 100,
      showValue = true,
      strokeWidth = 4,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const sizeConfig = {
      sm: { container: 'w-14 h-14', text: 'text-[10px]' },
      default: { container: 'w-20 h-20', text: 'text-sm' },
      lg: { container: 'w-28 h-28', text: 'text-base' },
    };
    const currentSize = sizeConfig[size || 'default'];

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          currentSize.container,
          className
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#00ff00"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300 ease-out"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(0, 255, 0, 0.5))',
            }}
          />
        </svg>
        {showValue && (
          <span
            className={cn('absolute font-mono text-[#00ff00]', currentSize.text)}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export {
  CircularProgress,
  SegmentedProgress,
  TunnelProgress,
  tunnelProgressVariants,
};
