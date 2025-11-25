'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const toggleVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center',
    'rounded-full border transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        default: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const thumbVariants = cva(
  [
    'pointer-events-none block rounded-full bg-white',
    'transition-transform duration-150',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.125rem]',
        default: 'h-5 w-5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.375rem]',
        lg: 'h-6 w-6 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.875rem]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface CyberToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

const CyberToggle = React.forwardRef<HTMLButtonElement, CyberToggleProps>(
  (
    {
      className,
      size,
      checked,
      defaultChecked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked);
    const controlledChecked = checked ?? isChecked;

    const handleClick = () => {
      if (disabled) return;
      const newValue = !controlledChecked;
      if (checked === undefined) {
        setIsChecked(newValue);
      }
      onCheckedChange?.(newValue);
    };

    const toggle = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={controlledChecked}
        data-state={controlledChecked ? 'checked' : 'unchecked'}
        disabled={disabled}
        className={cn(
          toggleVariants({ size }),
          controlledChecked
            ? 'bg-teal-500 border-teal-500'
            : 'bg-slate-700 border-slate-700',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span
          data-state={controlledChecked ? 'checked' : 'unchecked'}
          className={cn(thumbVariants({ size }))}
        />
      </button>
    );

    if (!label && !description) {
      return toggle;
    }

    return (
      <div className="flex items-start gap-3">
        {toggle}
        <div className="flex flex-col">
          {label && (
            <label
              className={cn(
                'text-sm font-medium text-slate-200 cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={handleClick}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-slate-400">{description}</span>
          )}
        </div>
      </div>
    );
  }
);
CyberToggle.displayName = 'CyberToggle';

export interface CyberCheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

const CyberCheckbox = React.forwardRef<HTMLButtonElement, CyberCheckboxProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked);
    const controlledChecked = checked ?? isChecked;

    const handleClick = () => {
      if (disabled) return;
      const newValue = !controlledChecked;
      if (checked === undefined) {
        setIsChecked(newValue);
      }
      onCheckedChange?.(newValue);
    };

    const checkbox = (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={controlledChecked}
        disabled={disabled}
        className={cn(
          'relative flex h-5 w-5 items-center justify-center',
          'rounded border-2 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          controlledChecked
            ? 'bg-teal-500 border-teal-500'
            : 'bg-slate-900 border-slate-700',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {controlledChecked && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
    );

    if (!label) {
      return checkbox;
    }

    return (
      <div className="flex items-center gap-2">
        {checkbox}
        <label
          className={cn(
            'text-sm text-slate-200 cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={handleClick}
        >
          {label}
        </label>
      </div>
    );
  }
);
CyberCheckbox.displayName = 'CyberCheckbox';

export interface CyberRadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const CyberRadioGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const CyberRadioGroup = React.forwardRef<HTMLDivElement, CyberRadioGroupProps>(
  (
    { value, defaultValue = '', onValueChange, children, className },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const controlledValue = value ?? internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <CyberRadioGroupContext.Provider
        value={{ value: controlledValue, onValueChange: handleValueChange }}
      >
        <div ref={ref} role="radiogroup" className={cn('space-y-2', className)}>
          {children}
        </div>
      </CyberRadioGroupContext.Provider>
    );
  }
);
CyberRadioGroup.displayName = 'CyberRadioGroup';

export interface CyberRadioItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  label?: string;
}

const CyberRadioItem = React.forwardRef<HTMLButtonElement, CyberRadioItemProps>(
  ({ className, value, label, disabled, ...props }, ref) => {
    const context = React.useContext(CyberRadioGroupContext);
    if (!context) {
      throw new Error('CyberRadioItem must be used within CyberRadioGroup');
    }

    const { value: groupValue, onValueChange } = context;
    const isSelected = groupValue === value;

    const radio = (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={disabled}
        className={cn(
          'relative flex h-5 w-5 items-center justify-center',
          'rounded-full border-2 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isSelected
            ? 'border-teal-500'
            : 'border-slate-700',
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {isSelected && (
          <span className="h-2 w-2 rounded-full bg-teal-400" />
        )}
      </button>
    );

    if (!label) {
      return radio;
    }

    return (
      <div className="flex items-center gap-2">
        {radio}
        <label
          className={cn(
            'text-sm text-slate-200 cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && onValueChange(value)}
        >
          {label}
        </label>
      </div>
    );
  }
);
CyberRadioItem.displayName = 'CyberRadioItem';

export {
  CyberToggle,
  CyberCheckbox,
  CyberRadioGroup,
  CyberRadioItem,
  toggleVariants,
};
