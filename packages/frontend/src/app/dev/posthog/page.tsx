'use client';

import { useState } from 'react';

/**
 * PostHog-Inspired Design Prototype
 *
 * 風格特色：
 * - 米黃背景 (#F3F1E5)
 * - 2-3px 純黑邊框
 * - 按鈕有「物理感」陰影
 * - Bento Grid 佈局
 * - 大量 monospace 字體
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const colors = {
  cream: '#F3F1E5',
  creamDark: '#E8E5D7',
  creamDarker: '#D9D5C5',
  orange: '#F26522',
  orangeDark: '#D4561C',
  forestGreen: '#1D4D3C',
  forestGreenLight: '#2A6B54',
  darkRed: '#9B2C2C',
  darkRedLight: '#C53030',
  deepBlue: '#1E3A5F',
  amber: '#D69E2E',
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    200: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },
};

// ============================================================================
// SVG ILLUSTRATIONS (手繪風格)
// ============================================================================

/** 隧道蟲吉祥物 - 一隻正在挖隧道的可愛蟲子 */
function TunnelWormMascot({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身體 - 波浪形狀模擬蠕動 */}
      <path
        d="M20 50 Q30 35, 45 45 Q60 55, 75 45 Q85 38, 90 50"
        stroke={colors.black}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* 身體填充 */}
      <ellipse cx="35" cy="48" rx="12" ry="8" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      <ellipse cx="55" cy="48" rx="10" ry="7" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      <ellipse cx="73" cy="46" rx="8" ry="6" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="22" cy="50" r="14" fill={colors.orange} stroke={colors.black} strokeWidth="3" />
      {/* 眼睛 */}
      <circle cx="18" cy="47" r="4" fill={colors.white} stroke={colors.black} strokeWidth="2" />
      <circle cx="17" cy="46" r="2" fill={colors.black} />
      {/* 微笑 */}
      <path
        d="M15 54 Q22 60, 28 54"
        stroke={colors.black}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* 安全帽 */}
      <path
        d="M12 42 Q22 30, 32 42"
        stroke={colors.black}
        strokeWidth="2.5"
        fill={colors.amber}
      />
      <rect x="10" y="40" width="24" height="4" rx="2" fill={colors.amber} stroke={colors.black} strokeWidth="2" />
      {/* 尾巴 */}
      <circle cx="88" cy="48" r="5" fill={colors.orangeDark} stroke={colors.black} strokeWidth="2" />
    </svg>
  );
}

/** 挖掘中的隧道蟲 */
function DiggingWorm({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 隧道洞口 */}
      <ellipse cx="100" cy="40" rx="18" ry="25" fill={colors.gray[700]} />
      <ellipse cx="100" cy="40" rx="14" ry="20" fill={colors.gray[900]} />
      {/* 飛濺的土 */}
      <circle cx="75" cy="25" r="4" fill={colors.creamDarker} stroke={colors.black} strokeWidth="1.5" />
      <circle cx="82" cy="18" r="3" fill={colors.creamDarker} stroke={colors.black} strokeWidth="1.5" />
      <circle cx="70" cy="32" r="3" fill={colors.creamDarker} stroke={colors.black} strokeWidth="1.5" />
      <circle cx="78" cy="55" r="4" fill={colors.creamDarker} stroke={colors.black} strokeWidth="1.5" />
      {/* 蟲子身體露出 */}
      <ellipse cx="65" cy="40" rx="10" ry="7" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      <ellipse cx="50" cy="40" rx="10" ry="8" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      <ellipse cx="35" cy="40" rx="10" ry="8" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="20" cy="40" r="12" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      {/* 眼睛 */}
      <circle cx="16" cy="37" r="4" fill={colors.white} stroke={colors.black} strokeWidth="1.5" />
      <circle cx="15" cy="36" r="2" fill={colors.black} />
      {/* 決心的表情 */}
      <path d="M14 44 L24 44" stroke={colors.black} strokeWidth="2" strokeLinecap="round" />
      {/* 安全帽 */}
      <path d="M10 34 Q20 22, 30 34" stroke={colors.black} strokeWidth="2" fill={colors.amber} />
      <rect x="8" y="32" width="24" height="4" rx="2" fill={colors.amber} stroke={colors.black} strokeWidth="1.5" />
      {/* 動作線 */}
      <path d="M5 35 L-2 30" stroke={colors.black} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 40 L-3 40" stroke={colors.black} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 45 L-2 50" stroke={colors.black} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 成功連線的蟲子 */
function HappyWorm({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身體 */}
      <ellipse cx="55" cy="45" rx="8" ry="6" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="45" cy="42" rx="9" ry="7" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="32" cy="40" rx="10" ry="8" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      {/* 頭 */}
      <circle cx="18" cy="40" r="12" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      {/* 開心的眼睛 (閉眼笑) */}
      <path d="M12 36 Q16 32, 20 36" stroke={colors.black} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 大大的笑容 */}
      <path d="M10 44 Q18 54, 26 44" stroke={colors.black} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 腮紅 */}
      <circle cx="8" cy="42" r="3" fill="#FDA4AF" opacity="0.6" />
      <circle cx="26" cy="42" r="3" fill="#FDA4AF" opacity="0.6" />
      {/* 尾巴搖晃 */}
      <ellipse cx="65" cy="42" rx="6" ry="5" fill={colors.orangeDark} stroke={colors.black} strokeWidth="2" />
      {/* 星星 (開心) */}
      <path d="M68 25 L70 30 L75 30 L71 34 L73 39 L68 36 L63 39 L65 34 L61 30 L66 30 Z" fill={colors.amber} stroke={colors.black} strokeWidth="1.5" />
      <path d="M30 20 L31 23 L34 23 L32 25 L33 28 L30 26 L27 28 L28 25 L26 23 L29 23 Z" fill={colors.amber} stroke={colors.black} strokeWidth="1" />
    </svg>
  );
}

/** 錯誤狀態的蟲子 */
function SadWorm({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身體 (垂頭喪氣) */}
      <ellipse cx="55" cy="48" rx="8" ry="5" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="45" cy="50" rx="9" ry="6" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="32" cy="52" rx="10" ry="7" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
      {/* 頭 (低垂) */}
      <circle cx="18" cy="55" r="12" fill={colors.orange} stroke={colors.black} strokeWidth="2.5" />
      {/* 難過的眼睛 */}
      <circle cx="14" cy="52" r="4" fill={colors.white} stroke={colors.black} strokeWidth="1.5" />
      <circle cx="13" cy="53" r="2" fill={colors.black} />
      {/* 眼淚 */}
      <path d="M10 56 Q8 62, 10 65" stroke={colors.deepBlue} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 難過的嘴 */}
      <path d="M12 62 Q18 58, 24 62" stroke={colors.black} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 尾巴 (下垂) */}
      <ellipse cx="65" cy="50" rx="5" ry="4" fill={colors.orangeDark} stroke={colors.black} strokeWidth="2" />
      {/* 烏雲 */}
      <ellipse cx="55" cy="25" rx="12" ry="8" fill={colors.gray[400]} stroke={colors.black} strokeWidth="1.5" />
      <ellipse cx="45" cy="28" rx="8" ry="6" fill={colors.gray[400]} stroke={colors.black} strokeWidth="1.5" />
      <ellipse cx="65" cy="28" rx="8" ry="6" fill={colors.gray[400]} stroke={colors.black} strokeWidth="1.5" />
    </svg>
  );
}

/** 隧道圖示 */
function TunnelIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外框 */}
      <rect x="2" y="8" width="36" height="24" rx="12" fill={colors.creamDark} stroke={colors.black} strokeWidth="2.5" />
      {/* 內部隧道 */}
      <ellipse cx="20" cy="20" rx="10" ry="8" fill={colors.gray[700]} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="20" cy="20" rx="6" ry="5" fill={colors.gray[900]} />
      {/* 箭頭 */}
      <path d="M8 20 L14 20 M12 17 L14 20 L12 23" stroke={colors.forestGreen} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 20 L26 20 M28 17 L26 20 L28 23" stroke={colors.forestGreen} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 連線成功圖示 */
function ConnectedIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="16" fill={colors.forestGreen} stroke={colors.black} strokeWidth="2.5" />
      <path d="M12 20 L17 25 L28 14" stroke={colors.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 斷線圖示 */
function DisconnectedIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="16" fill={colors.darkRed} stroke={colors.black} strokeWidth="2.5" />
      <path d="M14 14 L26 26 M26 14 L14 26" stroke={colors.white} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Hero 插圖 - 蟲子穿越隧道 */
function HeroIllustration() {
  return (
    <svg
      width="100%"
      height="200"
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-lg mx-auto"
    >
      {/* 左邊電腦 */}
      <rect x="20" y="40" width="60" height="45" rx="4" fill={colors.creamDark} stroke={colors.black} strokeWidth="2.5" />
      <rect x="25" y="45" width="50" height="30" rx="2" fill={colors.gray[900]} stroke={colors.black} strokeWidth="1.5" />
      <text x="35" y="65" fill="#4ADE80" fontSize="10" fontFamily="monospace">&gt;_</text>
      <rect x="35" y="85" width="30" height="5" rx="2" fill={colors.gray[400]} stroke={colors.black} strokeWidth="1" />
      <text x="30" y="105" fill={colors.black} fontSize="8" fontFamily="sans-serif" fontWeight="bold">localhost</text>

      {/* 隧道 */}
      <ellipse cx="130" cy="62" rx="20" ry="25" fill={colors.gray[700]} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="130" cy="62" rx="14" ry="18" fill={colors.gray[900]} />

      {/* 隧道線 */}
      <path
        d="M145 62 Q200 62, 255 62"
        stroke={colors.black}
        strokeWidth="3"
        strokeDasharray="8 4"
        fill="none"
      />

      {/* 蟲子在隧道中 */}
      <g transform="translate(180, 50)">
        <ellipse cx="20" cy="12" rx="6" ry="5" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="7" ry="6" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
        <circle cx="3" cy="12" r="8" fill={colors.orange} stroke={colors.black} strokeWidth="2" />
        <circle cx="0" cy="10" r="3" fill={colors.white} stroke={colors.black} strokeWidth="1" />
        <circle cx="-1" cy="9" r="1.5" fill={colors.black} />
        <path d="M-4 15 Q3 19, 8 15" stroke={colors.black} strokeWidth="1.5" fill="none" />
      </g>

      {/* 右邊隧道出口 */}
      <ellipse cx="270" cy="62" rx="20" ry="25" fill={colors.gray[700]} stroke={colors.black} strokeWidth="2" />
      <ellipse cx="270" cy="62" rx="14" ry="18" fill={colors.gray[900]} />

      {/* 右邊地球/雲 */}
      <circle cx="340" cy="62" r="35" fill={colors.deepBlue} stroke={colors.black} strokeWidth="2.5" />
      <ellipse cx="330" cy="55" rx="15" ry="8" fill={colors.forestGreen} stroke={colors.black} strokeWidth="1.5" />
      <ellipse cx="350" cy="70" rx="12" ry="6" fill={colors.forestGreen} stroke={colors.black} strokeWidth="1.5" />
      <text x="315" y="100" fill={colors.black} fontSize="8" fontFamily="sans-serif" fontWeight="bold">The Internet</text>

      {/* 動作線 */}
      <path d="M160 50 L155 45" stroke={colors.orange} strokeWidth="2" strokeLinecap="round" />
      <path d="M160 62 L153 62" stroke={colors.orange} strokeWidth="2" strokeLinecap="round" />
      <path d="M160 74 L155 79" stroke={colors.orange} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function BentoCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        p-5 rounded-xl
        transition-all duration-200
        ${hover ? 'hover:-translate-x-0.5 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      style={{
        backgroundColor: colors.creamDark,
        border: `2px solid ${colors.black}`,
        boxShadow: hover ? undefined : '4px 4px 0px 0px rgba(0,0,0,1)',
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </div>
  );
}

function BrutalistButton({
  children,
  variant = 'primary',
  size = 'default',
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  onClick?: () => void;
}) {
  const baseStyles = `
    font-bold rounded-lg
    transition-all duration-150
    active:translate-x-1 active:translate-y-1 active:shadow-none
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.orange,
      color: colors.white,
      border: `3px solid ${colors.black}`,
      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    },
    secondary: {
      backgroundColor: colors.cream,
      color: colors.black,
      border: `2px solid ${colors.black}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.black,
      border: `2px solid transparent`,
      boxShadow: 'none',
    },
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]}`}
      style={variantStyles[variant]}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '2px 2px 0px 0px rgba(0,0,0,1)';
          e.currentTarget.style.transform = 'translate(2px, 2px)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = colors.creamDark;
        } else {
          e.currentTarget.style.backgroundColor = colors.creamDark;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
          e.currentTarget.style.transform = 'translate(0, 0)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = colors.cream;
        } else {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
  children,
}: {
  status: 'connected' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
}) {
  const statusStyles = {
    connected: { backgroundColor: colors.forestGreen, color: colors.white },
    warning: { backgroundColor: colors.amber, color: colors.black },
    error: { backgroundColor: colors.darkRed, color: colors.white },
    neutral: { backgroundColor: colors.gray[200], color: colors.gray[700] },
  };

  return (
    <span
      className="px-3 py-1 rounded-full font-mono text-sm font-medium"
      style={{
        ...statusStyles[status],
        border: `2px solid ${colors.black}`,
      }}
    >
      {children}
    </span>
  );
}

function CodeBadge({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-sm px-2 py-1 rounded"
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.black}`,
      }}
    >
      {children}
    </code>
  );
}

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
  return (
    <BentoCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: colors.black }}>
          {name}
        </h3>
        <StatusBadge status={status}>
          {/* eslint-disable-next-line sonarjs/no-nested-conditional -- Component conditional rendering */}
          {status === 'connected' ? 'Connected' : status === 'warning' ? 'Idle' : 'Error'}
        </StatusBadge>
      </div>

      {/* Connection Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: colors.gray[500] }}>
            Local:
          </span>
          <CodeBadge>localhost:{localPort}</CodeBadge>
        </div>
        {publicUrl && (
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: colors.gray[500] }}>
              Public:
            </span>
            <code
              className="font-mono text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.black}`,
                color: colors.orange,
              }}
            >
              {publicUrl}
            </code>
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className="mt-4 pt-4 flex gap-6"
        style={{ borderTop: `2px solid ${colors.black}` }}
      >
        <div>
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: colors.gray[500] }}
          >
            Requests
          </span>
          <p className="font-mono font-bold" style={{ color: colors.black }}>
            {requests}
          </p>
        </div>
        <div>
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: colors.gray[500] }}
          >
            Latency
          </span>
          <p className="font-mono font-bold" style={{ color: colors.black }}>
            {latency}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}

function MetricCard({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <BentoCard className="text-center">
      <p className="font-mono text-3xl font-bold" style={{ color: colors.black }}>
        {value}
      </p>
      <p className="text-sm font-medium mt-1" style={{ color: colors.gray[700] }}>
        {label}
      </p>
      {sublabel && (
        <p className="text-xs mt-0.5" style={{ color: colors.gray[500] }}>
          {sublabel}
        </p>
      )}
    </BentoCard>
  );
}

function Input({
  placeholder,
  mono = false,
}: {
  placeholder: string;
  mono?: boolean;
}) {
  return (
    <input
      className={`
        w-full px-4 py-3 rounded-lg
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${mono ? 'font-mono' : ''}
      `}
      style={{
        backgroundColor: colors.white,
        border: `2px solid ${colors.black}`,
        // @ts-expect-error CSS variable
        '--tw-ring-color': colors.orange,
      }}
      placeholder={placeholder}
    />
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2
        className="text-2xl font-bold pb-2"
        style={{
          color: colors.black,
          borderBottom: `3px solid ${colors.black}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PostHogPrototypePage() {
  const [activeTab, setActiveTab] = useState<'tunnels' | 'settings'>('tunnels');

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.cream }}
    >
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Logo - 隧道蟲吉祥物 */}
            <div
              className="rounded-2xl flex items-center justify-center p-2"
              style={{
                backgroundColor: colors.creamDark,
                border: `3px solid ${colors.black}`,
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              }}
            >
              <TunnelWormMascot size={60} />
            </div>
            <div>
              <h1
                className="text-4xl font-extrabold tracking-tight"
                style={{ color: colors.black }}
              >
                NOVERLINK
              </h1>
              <p className="font-mono text-sm" style={{ color: colors.gray[500] }}>
                Local tunnels, global reach.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2">
            {(['tunnels', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                className={`
                  px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider
                  transition-colors duration-150
                `}
                style={{
                  backgroundColor: activeTab === tab ? colors.black : 'transparent',
                  color: activeTab === tab ? colors.white : colors.black,
                  border: `2px solid ${colors.black}`,
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Hero Illustration */}
        <BentoCard hover={false} className="overflow-hidden">
          <HeroIllustration />
        </BentoCard>

        {/* Quick Stats - Bento Grid */}
        <Section title="Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard value="3" label="Active Tunnels" />
            <MetricCard value="45.2k" label="Total Requests" sublabel="this month" />
            <MetricCard value="23ms" label="Avg Latency" />
            <MetricCard value="99.9%" label="Uptime" />
          </div>
        </Section>

        {/* Tunnels - Bento Grid */}
        <Section title="Your Tunnels">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </Section>

        {/* Create New Tunnel */}
        <Section title="Create New Tunnel">
          <BentoCard hover={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.gray[500] }}
                >
                  Tunnel Name
                </label>
                <Input placeholder="my-tunnel" />
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.gray[500] }}
                >
                  Local Port
                </label>
                <Input placeholder="3000" mono />
              </div>
              <div className="flex items-end">
                <BrutalistButton>Create Tunnel</BrutalistButton>
              </div>
            </div>
          </BentoCard>
        </Section>

        {/* Buttons Demo */}
        <Section title="Buttons">
          <div className="flex flex-wrap gap-4">
            <BrutalistButton variant="primary">Primary</BrutalistButton>
            <BrutalistButton variant="secondary">Secondary</BrutalistButton>
            <BrutalistButton variant="ghost">Ghost</BrutalistButton>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <BrutalistButton size="sm">Small</BrutalistButton>
            <BrutalistButton size="default">Default</BrutalistButton>
            <BrutalistButton size="lg">Large</BrutalistButton>
          </div>
        </Section>

        {/* Status Badges Demo */}
        <Section title="Status Badges">
          <div className="flex flex-wrap gap-4">
            <StatusBadge status="connected">Connected</StatusBadge>
            <StatusBadge status="warning">Warning</StatusBadge>
            <StatusBadge status="error">Error</StatusBadge>
            <StatusBadge status="neutral">Neutral</StatusBadge>
          </div>
        </Section>

        {/* Code/Terminal Block */}
        <Section title="Quick Start">
          <div
            className="p-4 rounded-lg font-mono text-sm"
            style={{
              backgroundColor: colors.gray[900],
              color: '#4ADE80', // green-400
              border: `2px solid ${colors.black}`,
            }}
          >
            <pre>{`$ noverlink http 3000
✓ Tunnel created
→ https://api.noverlink.com

Forwarding:
  https://api.noverlink.com → http://localhost:3000`}</pre>
          </div>
        </Section>

        {/* Illustrations Showcase */}
        <Section title="Illustrations">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BentoCard className="flex flex-col items-center justify-center py-6">
              <TunnelWormMascot size={100} />
              <p className="text-sm font-medium mt-3" style={{ color: colors.gray[700] }}>
                Mascot
              </p>
            </BentoCard>
            <BentoCard className="flex flex-col items-center justify-center py-6">
              <DiggingWorm size={140} />
              <p className="text-sm font-medium mt-3" style={{ color: colors.gray[700] }}>
                Digging...
              </p>
            </BentoCard>
            <BentoCard className="flex flex-col items-center justify-center py-6">
              <HappyWorm size={100} />
              <p className="text-sm font-medium mt-3" style={{ color: colors.gray[700] }}>
                Connected!
              </p>
            </BentoCard>
            <BentoCard className="flex flex-col items-center justify-center py-6">
              <SadWorm size={100} />
              <p className="text-sm font-medium mt-3" style={{ color: colors.gray[700] }}>
                Error...
              </p>
            </BentoCard>
          </div>

          <div className="flex flex-wrap gap-6 items-center justify-center mt-4">
            <div className="flex items-center gap-2">
              <TunnelIcon size={40} />
              <span className="text-sm" style={{ color: colors.gray[600] }}>Tunnel</span>
            </div>
            <div className="flex items-center gap-2">
              <ConnectedIcon size={40} />
              <span className="text-sm" style={{ color: colors.gray[600] }}>Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <DisconnectedIcon size={40} />
              <span className="text-sm" style={{ color: colors.gray[600] }}>Disconnected</span>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer
          className="text-center pt-8"
          style={{ borderTop: `2px solid ${colors.black}` }}
        >
          <p className="font-mono text-sm" style={{ color: colors.gray[500] }}>
            PostHog-Inspired Design Prototype v3.0
          </p>
          <p className="text-xs mt-2" style={{ color: colors.gray[400] }}>
            Compare with original: <a href="/dev" className="underline">Dark Theme</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
