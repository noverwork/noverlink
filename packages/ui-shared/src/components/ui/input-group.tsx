'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';

// InputGroup - Container for input with addons
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group"
    className={cn(
      'relative flex items-center rounded-lg border border-white/[0.08] bg-slate-900',
      'focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/20',
      'has-[input:disabled]:opacity-50 has-[input:disabled]:cursor-not-allowed',
      className
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

// InputGroupInput - The actual input element
const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      'flex-1 h-10 w-full bg-transparent px-4 py-2.5 text-sm text-white',
      'placeholder:text-slate-500',
      'focus:outline-none',
      'disabled:cursor-not-allowed',
      className
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

// InputGroupAddon - For icons or buttons on either side
interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = 'start', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group-addon"
      className={cn(
        'flex items-center justify-center text-slate-400',
        align === 'start' && 'pl-3',
        align === 'end' && 'pr-3',
        className
      )}
      {...props}
    />
  )
);
InputGroupAddon.displayName = 'InputGroupAddon';

// InputGroupButton - Interactive button addon
const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-slot="input-group-button"
    className={cn(
      'flex items-center justify-center px-3 text-slate-400',
      'hover:text-white transition-colors',
      'focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
InputGroupButton.displayName = 'InputGroupButton';

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput };
