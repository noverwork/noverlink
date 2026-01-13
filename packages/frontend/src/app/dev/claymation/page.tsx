'use client';

import { useState } from 'react';

/**
 * Claymation / Clay Style Design Prototype
 *
 * Style characteristics:
 * - Everything looks like soft clay/plasticine
 * - Rounded, blobby shapes
 * - Soft shadows (like clay on a surface)
 * - Warm, muted pastel colors
 * - Slightly imperfect, organic shapes
 * - Thick, soft borders
 * - 3D-ish appearance but flat (pseudo-3D)
 * - Playful and friendly vibe
 * - Subtle texture (like fingerprints on clay)
 * - Think: Wallace and Gromit, Nintendo's Kirby
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const colors = {
  // Background colors
  bgMain: '#FFF5EB',
  bgCard: '#FFFFFF',
  bgSoft: '#FEF3E2',

  // Clay pastels
  pink: '#FFB5BA',
  pinkDark: '#E89CA1',
  pinkLight: '#FFD4D7',
  blue: '#A8D8EA',
  blueDark: '#8BC4D6',
  blueLight: '#C5E8F2',
  mint: '#B8E6D3',
  mintDark: '#9AD4BE',
  mintLight: '#D4F2E7',
  lavender: '#D4C4E8',
  lavenderDark: '#BBA8D6',
  lavenderLight: '#E8DFF5',
  cream: '#FFF2CC',
  creamDark: '#F5E4A8',
  peach: '#FFDAB3',
  peachDark: '#EECA9E',
  coral: '#FF9E9E',
  coralDark: '#E88A8A',

  // Status colors (softer versions)
  success: '#98D4A6',
  successDark: '#7BC48B',
  warning: '#FFD97A',
  warningDark: '#EEC45F',
  error: '#FF9E9E',
  errorDark: '#E88A8A',

  // Text
  textPrimary: '#4A4A4A',
  textSecondary: '#7A7A7A',
  textMuted: '#A0A0A0',
  textWhite: '#FFFFFF',

  // Shadows & borders
  shadow: 'rgba(120, 100, 80, 0.25)',
  shadowDeep: 'rgba(100, 80, 60, 0.35)',
  border: 'rgba(0, 0, 0, 0.08)',
};

// Clay-like soft shadow
const clayShadow = `
  0 4px 0 ${colors.shadow},
  0 8px 16px ${colors.shadow}
`;

const clayPressedShadow = `
  0 2px 0 ${colors.shadow},
  0 4px 8px ${colors.shadow}
`;

// ============================================================================
// SVG FILTER FOR CLAY EFFECT
// ============================================================================

function ClayFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Wobbly edges filter */}
        <filter id="clay-wobble" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Subtle texture filter */}
        <filter id="clay-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>

        {/* Soft glow */}
        <filter id="clay-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ============================================================================
// SVG COMPONENTS - CLAY MASCOT & DECORATIONS
// ============================================================================

/** Clay blob decoration */
function ClayBlob({
  color,
  size = 60,
  className = '',
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  const darkColor = `${color}DD`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
    >
      <ellipse
        cx="30"
        cy="32"
        rx="26"
        ry="24"
        fill={darkColor}
        opacity="0.4"
      />
      <ellipse
        cx="30"
        cy="28"
        rx="26"
        ry="24"
        fill={color}
      />
      <ellipse
        cx="24"
        cy="22"
        rx="8"
        ry="6"
        fill="white"
        opacity="0.4"
      />
    </svg>
  );
}

/** Clay mascot - cute tunnel worm */
function ClayMascot({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Body shadow */}
      <ellipse cx="55" cy="58" rx="35" ry="20" fill={colors.shadow} opacity="0.3" />

      {/* Body segments */}
      <ellipse cx="70" cy="52" rx="14" ry="12" fill={colors.peachDark} />
      <ellipse cx="70" cy="50" rx="14" ry="12" fill={colors.peach} />

      <ellipse cx="55" cy="54" rx="16" ry="14" fill={colors.peachDark} />
      <ellipse cx="55" cy="52" rx="16" ry="14" fill={colors.peach} />

      <ellipse cx="38" cy="52" rx="18" ry="16" fill={colors.peachDark} />
      <ellipse cx="38" cy="50" rx="18" ry="16" fill={colors.peach} />

      {/* Head */}
      <ellipse cx="22" cy="52" rx="20" ry="18" fill={colors.pinkDark} />
      <ellipse cx="22" cy="50" rx="20" ry="18" fill={colors.pink} />

      {/* Eye */}
      <ellipse cx="18" cy="44" rx="8" ry="7" fill="white" />
      <ellipse cx="16" cy="43" rx="4" ry="4" fill={colors.textPrimary} />
      <ellipse cx="14" cy="41" rx="2" ry="2" fill="white" />

      {/* Rosy cheek */}
      <ellipse cx="10" cy="54" rx="5" ry="4" fill={colors.coralDark} opacity="0.5" />

      {/* Smile */}
      <path
        d="M12 58 Q22 66, 32 58"
        stroke={colors.textPrimary}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cute antenna */}
      <path
        d="M30 35 Q35 25, 40 30"
        stroke={colors.pink}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="41" cy="29" rx="5" ry="5" fill={colors.pinkDark} />
      <ellipse cx="41" cy="28" rx="5" ry="5" fill={colors.pink} />

      {/* Tail */}
      <ellipse cx="85" cy="52" rx="8" ry="7" fill={colors.peachDark} />
      <ellipse cx="85" cy="50" rx="8" ry="7" fill={colors.peach} />

      {/* Shine on body */}
      <ellipse cx="35" cy="42" rx="6" ry="4" fill="white" opacity="0.4" />
      <ellipse cx="55" cy="44" rx="4" ry="3" fill="white" opacity="0.3" />
    </svg>
  );
}

/** Happy clay mascot (for connected state) */
function HappyClayMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
    >
      {/* Body shadow */}
      <ellipse cx="40" cy="48" rx="28" ry="16" fill={colors.shadow} opacity="0.3" />

      {/* Body */}
      <ellipse cx="55" cy="42" rx="12" ry="10" fill={colors.mintDark} />
      <ellipse cx="55" cy="40" rx="12" ry="10" fill={colors.mint} />

      <ellipse cx="40" cy="42" rx="14" ry="12" fill={colors.mintDark} />
      <ellipse cx="40" cy="40" rx="14" ry="12" fill={colors.mint} />

      {/* Head */}
      <ellipse cx="24" cy="42" rx="16" ry="14" fill={colors.mintDark} />
      <ellipse cx="24" cy="40" rx="16" ry="14" fill={colors.mint} />

      {/* Happy closed eyes */}
      <path
        d="M16 36 Q20 32, 24 36"
        stroke={colors.textPrimary}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Big smile */}
      <path
        d="M14 44 Q24 54, 34 44"
        stroke={colors.textPrimary}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy cheeks */}
      <ellipse cx="12" cy="42" rx="4" ry="3" fill={colors.pinkLight} opacity="0.7" />
      <ellipse cx="34" cy="42" rx="4" ry="3" fill={colors.pinkLight} opacity="0.7" />

      {/* Sparkles */}
      <g fill={colors.cream}>
        <path d="M65 25 L67 30 L72 30 L68 33 L70 38 L65 35 L60 38 L62 33 L58 30 L63 30 Z" />
        <path d="M8 22 L9 25 L12 25 L10 27 L11 30 L8 28 L5 30 L6 27 L4 25 L7 25 Z" />
      </g>

      {/* Tail wagging */}
      <ellipse cx="68" cy="40" rx="6" ry="5" fill={colors.mintDark} />
      <ellipse cx="68" cy="38" rx="6" ry="5" fill={colors.mint} />
    </svg>
  );
}

/** Sad clay mascot (for error state) */
function SadClayMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
    >
      {/* Body shadow */}
      <ellipse cx="40" cy="52" rx="28" ry="14" fill={colors.shadow} opacity="0.3" />

      {/* Droopy body */}
      <ellipse cx="55" cy="48" rx="11" ry="9" fill={colors.lavenderDark} />
      <ellipse cx="55" cy="46" rx="11" ry="9" fill={colors.lavender} />

      <ellipse cx="40" cy="50" rx="13" ry="11" fill={colors.lavenderDark} />
      <ellipse cx="40" cy="48" rx="13" ry="11" fill={colors.lavender} />

      {/* Head */}
      <ellipse cx="24" cy="50" rx="15" ry="13" fill={colors.lavenderDark} />
      <ellipse cx="24" cy="48" rx="15" ry="13" fill={colors.lavender} />

      {/* Sad eye */}
      <ellipse cx="20" cy="44" rx="6" ry="5" fill="white" />
      <ellipse cx="19" cy="45" rx="3" ry="3" fill={colors.textPrimary} />
      <ellipse cx="18" cy="44" rx="1.5" ry="1.5" fill="white" />

      {/* Tear */}
      <ellipse cx="14" cy="52" rx="3" ry="4" fill={colors.blue} opacity="0.7" />

      {/* Sad mouth */}
      <path
        d="M16 56 Q24 52, 32 56"
        stroke={colors.textPrimary}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Droopy antenna */}
      <path
        d="M32 38 Q34 32, 30 28"
        stroke={colors.lavender}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="30" cy="27" rx="4" ry="4" fill={colors.lavenderDark} />
      <ellipse cx="30" cy="26" rx="4" ry="4" fill={colors.lavender} />

      {/* Rain cloud */}
      <g opacity="0.6">
        <ellipse cx="60" cy="22" rx="12" ry="8" fill="#CCC" />
        <ellipse cx="50" cy="24" rx="8" ry="6" fill="#CCC" />
        <ellipse cx="68" cy="24" rx="7" ry="5" fill="#CCC" />
        {/* Rain drops */}
        <ellipse cx="52" cy="35" rx="2" ry="3" fill={colors.blue} />
        <ellipse cx="60" cy="38" rx="2" ry="3" fill={colors.blue} />
        <ellipse cx="66" cy="34" rx="2" ry="3" fill={colors.blue} />
      </g>
    </svg>
  );
}

/** Tunnel icon made of clay */
function ClayTunnelIcon({ size = 50 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
    >
      {/* Outer ring shadow */}
      <ellipse cx="25" cy="27" rx="20" ry="18" fill={colors.shadow} opacity="0.3" />

      {/* Outer ring */}
      <ellipse cx="25" cy="25" rx="20" ry="18" fill={colors.blueDark} />
      <ellipse cx="25" cy="24" rx="20" ry="18" fill={colors.blue} />

      {/* Inner hole */}
      <ellipse cx="25" cy="25" rx="12" ry="10" fill={colors.textPrimary} opacity="0.8" />

      {/* Shine */}
      <ellipse cx="18" cy="18" rx="5" ry="3" fill="white" opacity="0.4" />

      {/* Arrow going through */}
      <path
        d="M10 25 L18 25 M16 22 L18 25 L16 28"
        stroke={colors.mint}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 25 L32 25 M34 22 L32 25 L34 28"
        stroke={colors.mint}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small decorative clay stars */
function ClayStar({ color, size = 30, className = '' }: { color: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
    >
      <path
        d="M15 3 L17.5 11 L26 11 L19.5 16 L22 24 L15 19 L8 24 L10.5 16 L4 11 L12.5 11 Z"
        fill={`${color}CC`}
      />
      <path
        d="M15 5 L17 11.5 L24 11.5 L18.5 15.5 L20.5 22 L15 18 L9.5 22 L11.5 15.5 L6 11.5 L13 11.5 Z"
        fill={color}
      />
      <ellipse cx="12" cy="10" rx="2" ry="1.5" fill="white" opacity="0.5" />
    </svg>
  );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

/** Clay card container */
function ClayCard({
  children,
  color = colors.bgCard,
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative p-5 ${className}`}
      style={{
        backgroundColor: color,
        borderRadius: '24px',
        boxShadow: clayShadow,
        border: `3px solid ${colors.border}`,
      }}
    >
      {/* Subtle shine effect */}
      <div
        className="absolute top-2 left-4 right-12 h-3 rounded-full opacity-30"
        style={{
          background: 'linear-gradient(to bottom, white, transparent)',
        }}
      />
      {children}
    </div>
  );
}

/** Clay button */
function ClayButton({
  children,
  color = colors.pink,
  darkColor,
  size = 'default',
  onClick,
}: {
  children: React.ReactNode;
  color?: string;
  darkColor?: string;
  size?: 'sm' | 'default' | 'lg';
  onClick?: () => void;
}) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const actualDarkColor = darkColor || `${color}DD`;

  return (
    <button
      className={`
        relative font-bold rounded-full
        transition-all duration-100
        ${sizeStyles[size]}
      `}
      style={{
        backgroundColor: isPressed ? actualDarkColor : color,
        color: colors.textWhite,
        boxShadow: isPressed ? clayPressedShadow : clayShadow,
        transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
        border: `3px solid ${actualDarkColor}`,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      {/* Shine */}
      <span
        className="absolute top-1.5 left-3 right-6 h-2 rounded-full opacity-40"
        style={{ background: 'linear-gradient(to bottom, white, transparent)' }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

/** Clay status badge */
function ClayBadge({
  status,
  children,
}: {
  status: 'connected' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
}) {
  const statusStyles = {
    connected: { bg: colors.success, dark: colors.successDark },
    warning: { bg: colors.warning, dark: colors.warningDark },
    error: { bg: colors.error, dark: colors.errorDark },
    neutral: { bg: colors.lavender, dark: colors.lavenderDark },
  };

  const style = statusStyles[status];

  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 font-medium text-sm rounded-full"
      style={{
        backgroundColor: style.bg,
        color: colors.textWhite,
        border: `2px solid ${style.dark}`,
        boxShadow: `0 2px 0 ${colors.shadow}`,
        textShadow: '0 1px 1px rgba(0,0,0,0.15)',
      }}
    >
      {/* Pulsing dot for connected */}
      {status === 'connected' && (
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'white' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: 'white' }}
          />
        </span>
      )}
      {children}
    </span>
  );
}

/** Clay input field */
function ClayInput({
  placeholder,
  type = 'text',
}: {
  placeholder: string;
  type?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type={type}
      className="w-full px-4 py-3 font-medium rounded-2xl outline-none transition-all"
      style={{
        backgroundColor: colors.bgSoft,
        color: colors.textPrimary,
        border: `3px solid ${isFocused ? colors.blue : colors.border}`,
        boxShadow: isFocused
          ? `inset 0 2px 4px ${colors.shadow}, 0 0 0 3px ${colors.blueLight}`
          : `inset 0 2px 4px ${colors.shadow}`,
      }}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

/** Tunnel card component */
function TunnelCard({
  name,
  status,
  localPort,
  publicUrl,
  requests,
  latency,
}: {
  name: string;
  status: 'connected' | 'warning' | 'error';
  localPort: number;
  publicUrl?: string;
  requests: string;
  latency: string;
}) {
  const cardColors = {
    connected: colors.mintLight,
    warning: colors.creamDark,
    error: colors.pinkLight,
  };

  return (
    <ClayCard color={cardColors[status]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ClayTunnelIcon size={40} />
          <h3
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            {name}
          </h3>
        </div>
        <ClayBadge status={status}>
          {/* eslint-disable-next-line sonarjs/no-nested-conditional -- Component conditional rendering */}
          {status === 'connected' ? 'Online' : status === 'warning' ? 'Idle' : 'Offline'}
        </ClayBadge>
      </div>

      {/* Connection info */}
      <div
        className="p-3 rounded-xl space-y-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          boxShadow: `inset 0 2px 4px ${colors.shadow}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Local:
          </span>
          <code
            className="font-mono text-sm px-2 py-1 rounded-lg"
            style={{
              backgroundColor: colors.bgCard,
              color: colors.textPrimary,
              border: `2px solid ${colors.border}`,
            }}
          >
            localhost:{localPort}
          </code>
        </div>
        {publicUrl && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Public:
            </span>
            <code
              className="font-mono text-sm px-2 py-1 rounded-lg"
              style={{
                backgroundColor: colors.bgCard,
                color: colors.blue,
                border: `2px solid ${colors.blueDark}`,
              }}
            >
              {publicUrl}
            </code>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div
          className="p-3 rounded-xl text-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            boxShadow: `0 2px 0 ${colors.shadow}`,
          }}
        >
          <p className="font-mono text-xl font-bold" style={{ color: colors.textPrimary }}>
            {requests}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Requests
          </p>
        </div>
        <div
          className="p-3 rounded-xl text-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            boxShadow: `0 2px 0 ${colors.shadow}`,
          }}
        >
          <p className="font-mono text-xl font-bold" style={{ color: colors.textPrimary }}>
            {latency}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Latency
          </p>
        </div>
      </div>
    </ClayCard>
  );
}

/** Metric card */
function MetricCard({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
}) {
  return (
    <ClayCard color={color}>
      <div className="text-center">
        {icon && <div className="flex justify-center mb-2">{icon}</div>}
        <p
          className="font-mono text-3xl font-bold"
          style={{ color: colors.textPrimary, textShadow: '0 2px 2px rgba(0,0,0,0.1)' }}
        >
          {value}
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: colors.textSecondary }}>
          {label}
        </p>
      </div>
    </ClayCard>
  );
}

/** Section title */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <ClayBlob color={colors.pink} size={24} />
      <h2
        className="text-xl font-bold"
        style={{ color: colors.textPrimary }}
      >
        {children}
      </h2>
      <div
        className="flex-1 h-2 rounded-full"
        style={{
          background: `linear-gradient(to right, ${colors.pink}40, transparent)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ClaymationPrototypePage() {
  const [activeTab, setActiveTab] = useState<'tunnels' | 'settings'>('tunnels');

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: colors.bgMain,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${colors.pinkLight}40 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, ${colors.blueLight}40 0%, transparent 40%),
          radial-gradient(circle at 50% 90%, ${colors.mintLight}40 0%, transparent 30%)
        `,
      }}
    >
      <ClayFilters />

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <ClayBlob color={colors.pink} size={80} className="absolute top-20 left-10 opacity-50" />
        <ClayBlob color={colors.blue} size={60} className="absolute top-40 right-20 opacity-50" />
        <ClayBlob color={colors.mint} size={70} className="absolute bottom-40 left-20 opacity-50" />
        <ClayBlob color={colors.lavender} size={50} className="absolute bottom-20 right-40 opacity-50" />
        <ClayStar color={colors.cream} size={40} className="absolute top-32 right-40 opacity-60" />
        <ClayStar color={colors.pinkLight} size={30} className="absolute bottom-60 left-40 opacity-60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-8 space-y-10">
        {/* Header */}
        <header className="text-center space-y-6 pt-8">
          {/* Logo & Mascot */}
          <div className="flex items-center justify-center gap-4">
            <ClayMascot size={120} />
            <div className="text-left">
              <h1
                className="text-4xl font-extrabold tracking-tight"
                style={{
                  color: colors.textPrimary,
                  textShadow: `3px 3px 0 ${colors.pinkLight}`,
                }}
              >
                NOVERLINK
              </h1>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Your friendly tunnel buddy!
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex justify-center gap-3">
            {(['tunnels', 'settings'] as const).map((tab) => (
              <ClayButton
                key={tab}
                color={activeTab === tab ? colors.blue : colors.lavender}
                darkColor={activeTab === tab ? colors.blueDark : colors.lavenderDark}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ClayButton>
            ))}
          </nav>
        </header>

        {/* Hero illustration */}
        <ClayCard color={colors.cream} className="text-center py-8">
          <div className="flex items-center justify-center gap-8">
            {/* Local computer */}
            <div className="text-center">
              <div
                className="w-20 h-16 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: colors.lavender,
                  boxShadow: clayShadow,
                  border: `3px solid ${colors.lavenderDark}`,
                }}
              >
                <span className="font-mono text-sm font-bold" style={{ color: colors.textPrimary }}>
                  :3000
                </span>
              </div>
              <p className="text-xs font-medium mt-2" style={{ color: colors.textSecondary }}>
                localhost
              </p>
            </div>

            {/* Tunnel with mascot */}
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-3 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${colors.blue}, ${colors.mint})`,
                  boxShadow: `0 2px 4px ${colors.shadow}`,
                }}
              />
              <HappyClayMascot size={60} />
              <div
                className="w-12 h-3 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${colors.mint}, ${colors.blue})`,
                  boxShadow: `0 2px 4px ${colors.shadow}`,
                }}
              />
            </div>

            {/* Globe */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: colors.blue,
                  boxShadow: clayShadow,
                  border: `3px solid ${colors.blueDark}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full"
                  style={{
                    backgroundColor: colors.mint,
                    border: `2px solid ${colors.mintDark}`,
                  }}
                />
              </div>
              <p className="text-xs font-medium mt-2" style={{ color: colors.textSecondary }}>
                Internet
              </p>
            </div>
          </div>
        </ClayCard>

        {/* Metrics */}
        <section>
          <SectionTitle>Overview</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              value="3"
              label="Active Tunnels"
              color={colors.mintLight}
            />
            <MetricCard
              value="45.2k"
              label="Total Requests"
              color={colors.blueLight}
            />
            <MetricCard
              value="23ms"
              label="Avg Latency"
              color={colors.pinkLight}
            />
            <MetricCard
              value="99.9%"
              label="Uptime"
              color={colors.lavenderLight}
            />
          </div>
        </section>

        {/* Tunnels */}
        <section>
          <SectionTitle>Your Tunnels</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TunnelCard
              name="api-gateway"
              status="connected"
              localPort={3000}
              publicUrl="api.noverlink.com"
              requests="12.4k"
              latency="23ms"
            />
            <TunnelCard
              name="web-server"
              status="connected"
              localPort={8080}
              publicUrl="app.noverlink.com"
              requests="8.2k"
              latency="31ms"
            />
            <TunnelCard
              name="db-admin"
              status="warning"
              localPort={5432}
              requests="124"
              latency="--"
            />
            <TunnelCard
              name="failed-tunnel"
              status="error"
              localPort={9000}
              requests="0"
              latency="--"
            />
          </div>
        </section>

        {/* Create Tunnel */}
        <section>
          <SectionTitle>Create New Tunnel</SectionTitle>
          <ClayCard color={colors.bgCard}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Tunnel Name
                </label>
                <ClayInput placeholder="my-awesome-tunnel" />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Local Port
                </label>
                <ClayInput placeholder="3000" type="number" />
              </div>
              <div className="flex items-end">
                <ClayButton color={colors.mint} darkColor={colors.mintDark}>
                  Create Tunnel
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </section>

        {/* Buttons Demo */}
        <section>
          <SectionTitle>Buttons</SectionTitle>
          <ClayCard color={colors.bgCard}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <ClayButton color={colors.pink} darkColor={colors.pinkDark}>
                  Pink
                </ClayButton>
                <ClayButton color={colors.blue} darkColor={colors.blueDark}>
                  Blue
                </ClayButton>
                <ClayButton color={colors.mint} darkColor={colors.mintDark}>
                  Mint
                </ClayButton>
                <ClayButton color={colors.lavender} darkColor={colors.lavenderDark}>
                  Lavender
                </ClayButton>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <ClayButton color={colors.coral} darkColor={colors.coralDark} size="sm">
                  Small
                </ClayButton>
                <ClayButton color={colors.coral} darkColor={colors.coralDark} size="default">
                  Default
                </ClayButton>
                <ClayButton color={colors.coral} darkColor={colors.coralDark} size="lg">
                  Large
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </section>

        {/* Status Badges */}
        <section>
          <SectionTitle>Status Badges</SectionTitle>
          <ClayCard color={colors.bgCard}>
            <div className="flex flex-wrap gap-4">
              <ClayBadge status="connected">Connected</ClayBadge>
              <ClayBadge status="warning">Warning</ClayBadge>
              <ClayBadge status="error">Error</ClayBadge>
              <ClayBadge status="neutral">Neutral</ClayBadge>
            </div>
          </ClayCard>
        </section>

        {/* Mascot showcase */}
        <section>
          <SectionTitle>Meet Your Tunnel Buddies</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <ClayCard color={colors.peach} className="text-center">
              <ClayMascot size={100} />
              <p className="text-sm font-medium mt-2" style={{ color: colors.textPrimary }}>
                Ready!
              </p>
            </ClayCard>
            <ClayCard color={colors.mintLight} className="text-center">
              <HappyClayMascot size={100} />
              <p className="text-sm font-medium mt-2" style={{ color: colors.textPrimary }}>
                Connected!
              </p>
            </ClayCard>
            <ClayCard color={colors.lavenderLight} className="text-center">
              <SadClayMascot size={100} />
              <p className="text-sm font-medium mt-2" style={{ color: colors.textPrimary }}>
                Error...
              </p>
            </ClayCard>
          </div>
        </section>

        {/* Terminal */}
        <section>
          <SectionTitle>Quick Start</SectionTitle>
          <ClayCard color={colors.textPrimary}>
            <div
              className="font-mono text-sm p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: colors.mint,
              }}
            >
              <pre>{`$ noverlink http 3000

  Tunnel created successfully!

  Public URL: https://api.noverlink.com
  Local:      http://localhost:3000

  Status: Connected
  Latency: 23ms`}</pre>
            </div>
          </ClayCard>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <ClayBlob color={colors.pink} size={20} />
            <ClayBlob color={colors.blue} size={20} />
            <ClayBlob color={colors.mint} size={20} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Claymation Design Prototype v1.0
          </p>
          <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
            Compare:{' '}
            <a
              href="/dev"
              className="underline hover:no-underline"
              style={{ color: colors.blue }}
            >
              Dark
            </a>
            {' / '}
            <a
              href="/dev/posthog"
              className="underline hover:no-underline"
              style={{ color: colors.blue }}
            >
              PostHog
            </a>
            {' / '}
            <a
              href="/dev/blueprint"
              className="underline hover:no-underline"
              style={{ color: colors.blue }}
            >
              Blueprint
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
