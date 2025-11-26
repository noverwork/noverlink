'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'relative w-full',
    'bg-slate-900',
    'border transition-colors',
    'text-white placeholder:text-slate-500',
    'focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-white/[0.08]',
          'hover:border-white/[0.15]',
          'focus:border-teal-500/50',
        ],
        error: [
          'border-rose-400/50',
          'focus:border-rose-400',
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
        default: 'rounded-lg',
        lg: 'rounded-xl',
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
      mono: false,
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
      <div className="relative">
        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, size, rounded, mono }),
              hasIcon && iconPosition === 'left' && 'pl-10',
              hasIcon && iconPosition === 'right' && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-400">{error}</p>
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
          <p className="mt-1.5 text-xs text-rose-400">{error}</p>
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
          <label className="block text-sm font-medium text-slate-200">
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        {children}
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
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

export { inputVariants,TunnelInput, TunnelInputGroup, TunnelTextarea };
