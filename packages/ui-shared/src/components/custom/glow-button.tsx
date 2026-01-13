'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const glowButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium text-sm',
    'cursor-pointer',
    'transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
    // EVA label style
    'tracking-[0.1em] uppercase',
  ],
  {
    variants: {
      variant: {
        primary: [
          'border border-white bg-white text-[#0a0a0a]',
          'hover:bg-transparent hover:text-white',
          'focus-visible:ring-white/50',
        ],
        secondary: [
          'border border-white/20 text-white',
          'hover:border-white/40 hover:bg-white/5',
          'focus-visible:ring-white/30',
        ],
        ghost: [
          'text-white/60',
          'hover:text-white hover:bg-white/5',
          'focus-visible:ring-white/30',
        ],
        danger: [
          'border border-[#ff0000]/50 text-[#ff0000]',
          'hover:bg-[#ff0000]/10 hover:border-[#ff0000]',
          'focus-visible:ring-[#ff0000]/50',
        ],
        success: [
          'border border-[#00ff00]/50 text-[#00ff00]',
          'hover:bg-[#00ff00]/10 hover:border-[#00ff00]',
          'focus-visible:ring-[#00ff00]/50',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      rounded: 'none',
    },
  }
);

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(glowButtonVariants({ variant, size, rounded }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            PROCESSING...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
GlowButton.displayName = 'GlowButton';

export { GlowButton, glowButtonVariants };
