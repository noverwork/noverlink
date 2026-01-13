'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'relative w-full',
    'bg-[#0a0a0a]',
    'border transition-all duration-200',
    'text-white placeholder:text-white/30',
    'font-mono',
    'focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-white/10',
          'hover:border-white/20',
          'focus:border-white/40',
        ],
        error: [
          'border-[#ff0000]/50',
          'focus:border-[#ff0000]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-12 px-5 text-base',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-none',
        lg: 'rounded-none',
        full: 'rounded-full',
      },
      mono: {
        true: 'font-mono',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      mono: true,
    },
  }
);

export interface TunnelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  mono?: boolean;
}

const TunnelInput = React.forwardRef<HTMLInputElement, TunnelInputProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      mono,
      type = 'text',
      icon,
      iconPosition = 'left',
      error,
      ...props
    },
    ref
  ) => {
    const hasIcon = !!icon;

    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-3 text-white/40 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, size, rounded, mono }),
              hasIcon && iconPosition === 'left' && 'pl-10',
              hasIcon && iconPosition === 'right' && 'pr-12',
              className
            )}
            ref={ref}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-3 text-white/40 z-10">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#ff0000]">{error}</p>
        )}
      </div>
    );
  }
);
TunnelInput.displayName = 'TunnelInput';

export interface TunnelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  mono?: boolean;
}

const TunnelTextarea = React.forwardRef<HTMLTextAreaElement, TunnelTextareaProps>(
  ({ className, variant, size, rounded, mono, error, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            inputVariants({ variant: error ? 'error' : variant, rounded, mono }),
            'min-h-[100px] py-3 resize-none',
            size === 'sm' && 'px-3 text-xs',
            size === 'default' && 'px-4 text-sm',
            size === 'lg' && 'px-5 text-base',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#ff0000]">{error}</p>
        )}
      </div>
    );
  }
);
TunnelTextarea.displayName = 'TunnelTextarea';

export interface TunnelInputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  required?: boolean;
}

const TunnelInputGroup = React.forwardRef<HTMLDivElement, TunnelInputGroupProps>(
  ({ className, label, description, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
            {label}
            {required && <span className="text-[#ff0000] ml-1">*</span>}
          </label>
        )}
        {children}
        {description && (
          <p className="text-xs text-white/40">{description}</p>
        )}
      </div>
    );
  }
);
TunnelInputGroup.displayName = 'TunnelInputGroup';

// Legacy exports for backward compatibility
export const NeonInput = TunnelInput;
export const NeonTextarea = TunnelTextarea;
export const NeonInputGroup = TunnelInputGroup;
export const neonInputVariants = inputVariants;

export { inputVariants, TunnelInput, TunnelInputGroup, TunnelTextarea };
