'use client';

import { useState } from 'react';

/**
 * Blueprint Design Prototype
 *
 * 風格特色：
 * - 深藍色工程圖紙背景
 * - 白色/淺藍線條
 * - 網格背景
 * - 尺寸標註、技術註解
 * - 全 Monospace 字體
 * - 像建築藍圖或電路圖
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const colors = {
  // 背景層級
  bgDeep: '#0A1628',
  bgBase: '#0D1B2A',
  bgLight: '#1B2838',
  bgPanel: '#152232',

  // 線條
  lineStrong: '#4A90D9',
  lineMedium: '#2D5A87',
  lineSubtle: '#1E3A5F',
  lineGrid: 'rgba(74, 144, 217, 0.15)',

  // 強調色
  accent: '#00D9FF',
  accentGlow: 'rgba(0, 217, 255, 0.3)',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4757',

  // 文字
  textPrimary: '#E0E7FF',
  textSecondary: '#8BA3C7',
  textMuted: '#5A7A9A',
  textAccent: '#00D9FF',
};

// ============================================================================
// SVG COMPONENTS
// ============================================================================

/** 網格背景 */
function GridBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: colors.bgDeep }}
    >
      {/* 大網格 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${colors.lineGrid} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.lineGrid} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      {/* 小網格 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74, 144, 217, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 144, 217, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px',
        }}
      />
      {/* 內容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** 角落標記 */
function CornerMarks() {
  const markStyle = {
    stroke: colors.lineMedium,
    strokeWidth: 1,
    fill: 'none',
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 左上 */}
      <svg className="absolute top-4 left-4" width="30" height="30" viewBox="0 0 30 30">
        <path d="M0 20 L0 0 L20 0" {...markStyle} />
        <circle cx="0" cy="0" r="3" fill={colors.lineMedium} />
      </svg>
      {/* 右上 */}
      <svg className="absolute top-4 right-4" width="30" height="30" viewBox="0 0 30 30">
        <path d="M10 0 L30 0 L30 20" {...markStyle} />
        <circle cx="30" cy="0" r="3" fill={colors.lineMedium} />
      </svg>
      {/* 左下 */}
      <svg className="absolute bottom-4 left-4" width="30" height="30" viewBox="0 0 30 30">
        <path d="M0 10 L0 30 L20 30" {...markStyle} />
        <circle cx="0" cy="30" r="3" fill={colors.lineMedium} />
      </svg>
      {/* 右下 */}
      <svg className="absolute bottom-4 right-4" width="30" height="30" viewBox="0 0 30 30">
        <path d="M10 30 L30 30 L30 10" {...markStyle} />
        <circle cx="30" cy="30" r="3" fill={colors.lineMedium} />
      </svg>
    </div>
  );
}

/** 尺寸標註線 - 備用元件 */
export function DimensionLine({
  width,
  label,
  className = '',
}: {
  width: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${className}`} style={{ width }}>
      <svg width="10" height="20" viewBox="0 0 10 20">
        <line x1="5" y1="0" x2="5" y2="20" stroke={colors.lineMedium} strokeWidth="1" />
        <line x1="0" y1="3" x2="10" y2="3" stroke={colors.lineMedium} strokeWidth="1" />
      </svg>
      <div
        className="flex-1 border-t border-dashed mx-1"
        style={{ borderColor: colors.lineMedium }}
      />
      <span
        className="font-mono text-xs px-2"
        style={{ color: colors.textMuted }}
      >
        {label}
      </span>
      <div
        className="flex-1 border-t border-dashed mx-1"
        style={{ borderColor: colors.lineMedium }}
      />
      <svg width="10" height="20" viewBox="0 0 10 20">
        <line x1="5" y1="0" x2="5" y2="20" stroke={colors.lineMedium} strokeWidth="1" />
        <line x1="0" y1="3" x2="10" y2="3" stroke={colors.lineMedium} strokeWidth="1" />
      </svg>
    </div>
  );
}

/** 藍圖面板 */
function BlueprintPanel({
  children,
  title,
  annotation,
  className = '',
}: {
  children: React.ReactNode;
  title?: string;
  annotation?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative p-5 ${className}`}
      style={{
        backgroundColor: colors.bgPanel,
        border: `1px solid ${colors.lineSubtle}`,
      }}
    >
      {/* 角落裝飾 */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
        style={{ borderColor: colors.lineStrong }}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2"
        style={{ borderColor: colors.lineStrong }}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2"
        style={{ borderColor: colors.lineStrong }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
        style={{ borderColor: colors.lineStrong }}
      />

      {/* 標題 */}
      {title && (
        <div
          className="absolute -top-3 left-4 px-2 font-mono text-xs uppercase tracking-widest"
          style={{ backgroundColor: colors.bgPanel, color: colors.textMuted }}
        >
          {title}
        </div>
      )}

      {/* 註解 */}
      {annotation && (
        <div
          className="absolute -bottom-3 right-4 px-2 font-mono text-xs"
          style={{ backgroundColor: colors.bgPanel, color: colors.textMuted }}
        >
          {annotation}
        </div>
      )}

      {children}
    </div>
  );
}

/** 藍圖按鈕 */
function BlueprintButton({
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
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'transparent',
      color: colors.accent,
      border: `2px solid ${colors.accent}`,
      boxShadow: `0 0 10px ${colors.accentGlow}, inset 0 0 10px ${colors.accentGlow}`,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      border: `1px solid ${colors.lineMedium}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  };

  return (
    <button
      className={`
        font-mono uppercase tracking-wider
        transition-all duration-200
        hover:brightness-125
        ${sizeStyles[size]}
      `}
      style={variantStyles[variant]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** 狀態指示器 */
function StatusIndicator({
  status,
  label,
}: {
  status: 'online' | 'offline' | 'warning';
  label: string;
}) {
  const statusColors = {
    online: colors.success,
    offline: colors.error,
    warning: colors.warning,
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColors[status] }}
        />
        {status === 'online' && (
          <div
            className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: statusColors[status], opacity: 0.5 }}
          />
        )}
      </div>
      <span
        className="font-mono text-xs uppercase tracking-wider"
        style={{ color: statusColors[status] }}
      >
        {label}
      </span>
    </div>
  );
}

/** 隧道架構圖 */
function TunnelSchematic() {
  return (
    <svg
      width="100%"
      height="180"
      viewBox="0 0 600 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-2xl mx-auto"
    >
      {/* 左邊 - 本地節點 */}
      <g>
        {/* 外框 */}
        <rect
          x="40" y="50" width="100" height="80"
          stroke={colors.lineStrong}
          strokeWidth="2"
          fill="none"
        />
        {/* 內框 */}
        <rect
          x="50" y="60" width="80" height="60"
          stroke={colors.lineMedium}
          strokeWidth="1"
          strokeDasharray="4 2"
          fill="none"
        />
        {/* 中心點 */}
        <circle cx="90" cy="90" r="4" fill={colors.accent} />
        <circle cx="90" cy="90" r="8" stroke={colors.accent} strokeWidth="1" fill="none" />
        {/* 標籤 */}
        <text
          x="90" y="145"
          fill={colors.textSecondary}
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
        >
          LOCAL NODE
        </text>
        <text
          x="90" y="158"
          fill={colors.accent}
          fontSize="11"
          fontFamily="monospace"
          textAnchor="middle"
        >
          :3000
        </text>
        {/* 尺寸標註 */}
        <text x="20" y="95" fill={colors.textMuted} fontSize="8" fontFamily="monospace">A</text>
      </g>

      {/* 連線 - 隧道 */}
      <g>
        {/* 主線 */}
        <line
          x1="140" y1="90" x2="260" y2="90"
          stroke={colors.accent}
          strokeWidth="2"
        />
        {/* 動態點 */}
        <circle cx="180" cy="90" r="3" fill={colors.accent}>
          <animate
            attributeName="cx"
            values="150;250;150"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        {/* 箭頭 */}
        <polygon
          points="255,85 265,90 255,95"
          fill={colors.accent}
        />
        {/* 隧道標籤 */}
        <rect x="175" y="65" width="50" height="16" fill={colors.bgDeep} />
        <text
          x="200" y="76"
          fill={colors.textMuted}
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          TUNNEL
        </text>
        {/* 加密符號 */}
        <text x="200" y="110" fill={colors.success} fontSize="8" fontFamily="monospace" textAnchor="middle">
          ◈ ENCRYPTED
        </text>
      </g>

      {/* 中間 - Relay */}
      <g>
        {/* 六角形 */}
        <polygon
          points="300,50 340,70 340,110 300,130 260,110 260,70"
          stroke={colors.lineStrong}
          strokeWidth="2"
          fill="none"
        />
        <polygon
          points="300,60 330,75 330,105 300,120 270,105 270,75"
          stroke={colors.lineMedium}
          strokeWidth="1"
          strokeDasharray="4 2"
          fill="none"
        />
        {/* 中心 */}
        <circle cx="300" cy="90" r="6" fill={colors.success} />
        <text
          x="300" y="145"
          fill={colors.textSecondary}
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
        >
          RELAY
        </text>
        <text x="248" y="95" fill={colors.textMuted} fontSize="8" fontFamily="monospace">B</text>
      </g>

      {/* 連線 - 到公網 */}
      <g>
        <line
          x1="340" y1="90" x2="460" y2="90"
          stroke={colors.accent}
          strokeWidth="2"
        />
        <circle cx="420" cy="90" r="3" fill={colors.accent}>
          <animate
            attributeName="cx"
            values="350;450;350"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <polygon
          points="455,85 465,90 455,95"
          fill={colors.accent}
        />
      </g>

      {/* 右邊 - 公網 */}
      <g>
        {/* 外框 */}
        <rect
          x="460" y="50" width="100" height="80"
          stroke={colors.lineStrong}
          strokeWidth="2"
          fill="none"
        />
        {/* 地球圖案 */}
        <circle cx="510" cy="90" r="25" stroke={colors.lineMedium} strokeWidth="1" fill="none" />
        <ellipse cx="510" cy="90" rx="25" ry="10" stroke={colors.lineMedium} strokeWidth="1" fill="none" />
        <ellipse cx="510" cy="90" rx="10" ry="25" stroke={colors.lineMedium} strokeWidth="1" fill="none" />
        <line x1="485" y1="90" x2="535" y2="90" stroke={colors.lineMedium} strokeWidth="1" />
        {/* 標籤 */}
        <text
          x="510" y="145"
          fill={colors.textSecondary}
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
        >
          PUBLIC
        </text>
        <text
          x="510" y="158"
          fill={colors.accent}
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          api.noverlink.com
        </text>
        <text x="572" y="95" fill={colors.textMuted} fontSize="8" fontFamily="monospace">C</text>
      </g>

      {/* 底部尺寸標註 */}
      <line x1="40" y1="170" x2="560" y2="170" stroke={colors.lineSubtle} strokeWidth="1" strokeDasharray="4 2" />
      <text x="300" y="178" fill={colors.textMuted} fontSize="8" fontFamily="monospace" textAnchor="middle">
        520px — TOTAL SPAN
      </text>
    </svg>
  );
}

/** 隧道卡片 */
function TunnelCard({
  name,
  status,
  localPort,
  publicUrl,
  latency,
  requests,
}: {
  name: string;
  status: 'online' | 'offline' | 'warning';
  localPort: number;
  publicUrl?: string;
  latency: string;
  requests: string;
}) {
  return (
    <BlueprintPanel annotation={`ID: ${name.toUpperCase()}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-sm"
            style={{ color: colors.textPrimary }}
          >
            {name}
          </span>
          <StatusIndicator
            status={status}
            label={status}
          />
        </div>

        {/* 連線資訊 */}
        <div
          className="p-3 font-mono text-xs space-y-2"
          style={{
            backgroundColor: colors.bgDeep,
            border: `1px dashed ${colors.lineSubtle}`,
          }}
        >
          <div className="flex justify-between">
            <span style={{ color: colors.textMuted }}>LOCAL</span>
            <span style={{ color: colors.textPrimary }}>:{localPort}</span>
          </div>
          {publicUrl && (
            <div className="flex justify-between">
              <span style={{ color: colors.textMuted }}>PUBLIC</span>
              <span style={{ color: colors.accent }}>{publicUrl}</span>
            </div>
          )}
        </div>

        {/* 指標 */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div
            className="p-2"
            style={{ border: `1px solid ${colors.lineSubtle}` }}
          >
            <div
              className="font-mono text-lg"
              style={{ color: colors.textPrimary }}
            >
              {latency}
            </div>
            <div
              className="font-mono text-xs uppercase"
              style={{ color: colors.textMuted }}
            >
              Latency
            </div>
          </div>
          <div
            className="p-2"
            style={{ border: `1px solid ${colors.lineSubtle}` }}
          >
            <div
              className="font-mono text-lg"
              style={{ color: colors.textPrimary }}
            >
              {requests}
            </div>
            <div
              className="font-mono text-xs uppercase"
              style={{ color: colors.textMuted }}
            >
              Requests
            </div>
          </div>
        </div>
      </div>
    </BlueprintPanel>
  );
}

/** 指標卡片 */
function MetricCard({
  value,
  label,
  unit,
}: {
  value: string;
  label: string;
  unit?: string;
}) {
  return (
    <div
      className="p-4 text-center"
      style={{
        backgroundColor: colors.bgPanel,
        border: `1px solid ${colors.lineSubtle}`,
      }}
    >
      <div className="flex items-baseline justify-center gap-1">
        <span
          className="font-mono text-2xl"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-mono text-sm"
            style={{ color: colors.textMuted }}
          >
            {unit}
          </span>
        )}
      </div>
      <div
        className="font-mono text-xs uppercase tracking-wider mt-1"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
    </div>
  );
}

/** 輸入框 */
function BlueprintInput({
  placeholder,
  label,
}: {
  placeholder: string;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <label
        className="font-mono text-xs uppercase tracking-wider"
        style={{ color: colors.textMuted }}
      >
        {label}
      </label>
      <input
        className="w-full px-3 py-2 font-mono text-sm focus:outline-none"
        style={{
          backgroundColor: colors.bgDeep,
          border: `1px solid ${colors.lineSubtle}`,
          color: colors.textPrimary,
        }}
        placeholder={placeholder}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 10px ${colors.accentGlow}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.lineSubtle;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

/** Section 標題 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className="h-px flex-1"
        style={{ backgroundColor: colors.lineSubtle }}
      />
      <h2
        className="font-mono text-sm uppercase tracking-widest"
        style={{ color: colors.textSecondary }}
      >
        {children}
      </h2>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: colors.lineSubtle }}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BlueprintPrototypePage() {
  const [activeTab, setActiveTab] = useState<'tunnels' | 'settings'>('tunnels');

  return (
    <GridBackground>
      <CornerMarks />

      <div className="max-w-5xl mx-auto p-8 space-y-12">
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          {/* Logo */}
          <div className="inline-block">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              {/* 外框 */}
              <rect
                x="5" y="5" width="50" height="50"
                stroke={colors.lineStrong}
                strokeWidth="2"
                fill="none"
              />
              {/* 內框 */}
              <rect
                x="12" y="12" width="36" height="36"
                stroke={colors.lineMedium}
                strokeWidth="1"
                strokeDasharray="4 2"
                fill="none"
              />
              {/* N 字 */}
              <path
                d="M20 42 L20 18 L40 42 L40 18"
                stroke={colors.accent}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h1
            className="font-mono text-3xl tracking-widest"
            style={{ color: colors.textPrimary }}
          >
            NOVERLINK
          </h1>
          <p
            className="font-mono text-xs uppercase tracking-[0.3em]"
            style={{ color: colors.textMuted }}
          >
            Tunnel Infrastructure System — v1.0.0
          </p>

          {/* Navigation */}
          <nav className="flex justify-center gap-1 pt-4">
            {(['tunnels', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: activeTab === tab ? colors.bgLight : 'transparent',
                  color: activeTab === tab ? colors.accent : colors.textMuted,
                  border: `1px solid ${activeTab === tab ? colors.accent : colors.lineSubtle}`,
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Schematic */}
        <section>
          <SectionTitle>System Architecture</SectionTitle>
          <BlueprintPanel title="SCHEMATIC" annotation="REV 1.0">
            <TunnelSchematic />
          </BlueprintPanel>
        </section>

        {/* Metrics */}
        <section>
          <SectionTitle>System Metrics</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard value="3" label="Active Tunnels" />
            <MetricCard value="45.2" label="Total Requests" unit="k" />
            <MetricCard value="23" label="Avg Latency" unit="ms" />
            <MetricCard value="99.9" label="Uptime" unit="%" />
          </div>
        </section>

        {/* Tunnels */}
        <section>
          <SectionTitle>Tunnel Registry</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TunnelCard
              name="api-gateway"
              status="online"
              localPort={3000}
              publicUrl="api.noverlink.com"
              latency="23ms"
              requests="12.4k"
            />
            <TunnelCard
              name="web-server"
              status="online"
              localPort={8080}
              publicUrl="app.noverlink.com"
              latency="31ms"
              requests="8.2k"
            />
            <TunnelCard
              name="db-admin"
              status="warning"
              localPort={5432}
              latency="--"
              requests="124"
            />
            <TunnelCard
              name="failed-tunnel"
              status="offline"
              localPort={9000}
              latency="--"
              requests="0"
            />
          </div>
        </section>

        {/* Create Tunnel */}
        <section>
          <SectionTitle>New Tunnel Configuration</SectionTitle>
          <BlueprintPanel title="CONFIG" annotation="DRAFT">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BlueprintInput label="Tunnel Name" placeholder="my-tunnel" />
              <BlueprintInput label="Local Port" placeholder="3000" />
              <div className="flex items-end">
                <BlueprintButton variant="primary">
                  Initialize Tunnel
                </BlueprintButton>
              </div>
            </div>
          </BlueprintPanel>
        </section>

        {/* Controls */}
        <section>
          <SectionTitle>Interface Controls</SectionTitle>
          <BlueprintPanel>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <BlueprintButton variant="primary">Primary</BlueprintButton>
                <BlueprintButton variant="secondary">Secondary</BlueprintButton>
                <BlueprintButton variant="ghost">Ghost</BlueprintButton>
              </div>
              <div className="flex flex-wrap gap-4">
                <BlueprintButton variant="primary" size="sm">Small</BlueprintButton>
                <BlueprintButton variant="primary" size="default">Default</BlueprintButton>
                <BlueprintButton variant="primary" size="lg">Large</BlueprintButton>
              </div>
            </div>
          </BlueprintPanel>
        </section>

        {/* Terminal */}
        <section>
          <SectionTitle>Command Interface</SectionTitle>
          <BlueprintPanel title="TERMINAL" annotation="STDOUT">
            <div
              className="p-4 font-mono text-sm"
              style={{
                backgroundColor: colors.bgDeep,
                border: `1px solid ${colors.lineSubtle}`,
                color: colors.success,
              }}
            >
              <pre>{`$ noverlink http 3000
[INFO] Initializing tunnel...
[INFO] Establishing secure connection...
[OK] Tunnel created successfully

Endpoint: https://api.noverlink.com
Status: ONLINE
Latency: 23ms`}</pre>
            </div>
          </BlueprintPanel>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="h-px w-16"
              style={{ backgroundColor: colors.lineSubtle }}
            />
            <span
              className="font-mono text-xs"
              style={{ color: colors.textMuted }}
            >
              ◈
            </span>
            <div
              className="h-px w-16"
              style={{ backgroundColor: colors.lineSubtle }}
            />
          </div>
          <p
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: colors.textMuted }}
          >
            Blueprint Design Prototype v1.0
          </p>
          <p
            className="font-mono text-xs mt-2"
            style={{ color: colors.textMuted }}
          >
            Compare:{' '}
            <a href="/dev" className="underline" style={{ color: colors.accent }}>
              Dark
            </a>
            {' · '}
            <a href="/dev/posthog" className="underline" style={{ color: colors.accent }}>
              PostHog
            </a>
          </p>
        </footer>
      </div>
    </GridBackground>
  );
}
