'use client';

import { type ReactNode } from 'react';

import { cn } from '../../lib/utils';

// ============================================================================
// EVA OVERLAYS
// ============================================================================

/**
 * Film grain overlay - adds subtle animated noise texture
 */
export function EvaGrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        width: '200%',
        height: '200%',
        opacity: 0.06,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        animation: 'grain 0.5s steps(10) infinite',
      }}
    />
  );
}

/**
 * Screen flicker overlay - subtle CRT-like effect
 */
export function EvaFlickerOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{
        backgroundColor: 'rgba(0,0,0,0.02)',
        animation: 'flicker 0.15s infinite',
      }}
    />
  );
}

// ============================================================================
// EVA TYPOGRAPHY
// ============================================================================

export interface EvaTitleProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  glow?: boolean;
}

const titleSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl md:text-6xl',
  display: 'text-6xl md:text-8xl lg:text-[10rem]',
};

/**
 * EVA-style compressed serif title
 */
export function EvaTitle({
  children,
  size = 'lg',
  className,
  as: Component = 'h1',
  glow = false,
}: EvaTitleProps) {
  return (
    <Component
      className={cn(
        'eva-title text-white uppercase',
        titleSizes[size],
        glow && 'text-shadow-[0_0_60px_rgba(255,255,255,0.2)]',
        className
      )}
      style={glow ? { textShadow: '0 0 60px rgba(255,255,255,0.2)' } : undefined}
    >
      {children}
    </Component>
  );
}

export interface EvaLabelProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  muted?: boolean;
}

const labelSizes = {
  xs: 'text-[0.65rem]',
  sm: 'text-xs',
  md: 'text-sm',
};

/**
 * EVA-style UI label - uppercase with wide letter-spacing
 */
export function EvaLabel({
  children,
  size = 'sm',
  className,
  muted = false,
}: EvaLabelProps) {
  return (
    <span
      className={cn(
        'eva-label',
        labelSizes[size],
        muted ? 'text-white/50' : 'text-white/80',
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================================================
// EVA STATUS COMPONENTS
// ============================================================================

export interface EvaStatusTextProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const statusColors = {
  default: 'text-white',
  success: 'text-[#00ff00]',
  warning: 'text-[#ffb800]',
  error: 'text-[#ff0000]',
};

const statusGlows = {
  default: undefined,
  success: '0 0 10px rgba(0,255,0,0.5)',
  warning: '0 0 10px rgba(255,184,0,0.5)',
  error: '0 0 10px rgba(255,0,0,0.5)',
};

/**
 * EVA-style status row with label and value
 */
export function EvaStatusText({
  label,
  value,
  variant = 'default',
  className,
}: EvaStatusTextProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between bg-[#0a0a0a] px-6 py-4 border-b border-white/10',
        className
      )}
    >
      <span className="eva-label text-xs text-white/50">{label}</span>
      <span
        className={cn(
          "font-['Times_New_Roman',Georgia,serif] font-black text-xl",
          statusColors[variant]
        )}
        style={{
          transform: 'scaleY(0.8) scaleX(0.9)',
          letterSpacing: '0.05em',
          textShadow: statusGlows[variant],
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// EVA CARDS
// ============================================================================

export interface EvaCardProps {
  children: ReactNode;
  className?: string;
  status?: 'connected' | 'disconnected' | 'idle';
}

const cardBorderColors = {
  connected: 'border-l-[#00ff00]',
  disconnected: 'border-l-[#ff0000]',
  idle: 'border-l-[#ffb800]',
};

/**
 * EVA-style card with optional status border
 */
export function EvaCard({ children, className, status }: EvaCardProps) {
  return (
    <div
      className={cn(
        'bg-[#0a0a0a] p-6',
        status && 'border-l-4',
        status && cardBorderColors[status],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// EVA NAVIGATION
// ============================================================================

export interface EvaNavProps {
  items: { key: string; label: string }[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

/**
 * EVA-style horizontal navigation tabs
 */
export function EvaNav({ items, active, onSelect, className }: EvaNavProps) {
  return (
    <nav
      className={cn(
        'flex border-b border-white/10 bg-[#111]',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={cn(
            'flex-1 px-4 py-4 eva-label text-xs transition-colors',
            active === item.key
              ? 'bg-white text-black'
              : 'bg-transparent text-white hover:bg-white/5'
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ============================================================================
// EVA DIVIDER
// ============================================================================

export function EvaDivider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-white/10', className)} />;
}

// ============================================================================
// EVA SECTION
// ============================================================================

export interface EvaSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * EVA-style section with optional title
 */
export function EvaSection({ title, children, className }: EvaSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {title && (
        <h2 className="eva-label text-xs text-white/50 border-b border-white/10 pb-2">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
