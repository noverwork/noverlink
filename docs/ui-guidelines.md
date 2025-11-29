# Noverlink Design System

> **Version:** 2.0
> **Last Updated:** 2025-01-XX
> **Status:** Production

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Specifications](#component-specifications)
7. [Animation Guidelines](#animation-guidelines)
8. [Accessibility](#accessibility)
9. [Implementation Checklist](#implementation-checklist)

---

## Design Philosophy

### Core Concept: 「讓隧道可見」

Noverlink 的設計核心是將**抽象的網路連線轉化為直覺的視覺語言**。使用者應該能夠：
- 一眼看出連線狀態
- 理解數據流向
- 快速定位問題

### 四大設計原則

| 原則 | 說明 | 實踐方式 |
|------|------|----------|
| **清晰優先** | 狀態一目瞭然，不需要猜測 | 使用語義化顏色、狀態點、明確的標籤 |
| **安靜專業** | 像基礎設施工具，不是遊戲 | 避免花俏動畫、保持視覺克制 |
| **有呼吸感** | 充足留白、適當間距 | 遵循 4px 網格、使用規範的間距 tokens |
| **連線意象** | 節點、線條、流動感貫穿設計 | 使用 TunnelNode、TunnelLine 等視覺元素 |

### 設計參考

- **Cloudflare Radar** — 網路拓撲視覺化
- **Tailscale** — 簡潔的連線狀態圖
- **Linear** — 現代專業的 UI 質感

---

## Design Tokens

所有 design tokens 定義在 `packages/ui-shared/src/styles.css`。

### CSS Variables 命名規範

```
--{category}-{property}-{variant}

Examples:
--color-primary
--color-primary-light
--bg-surface
--text-secondary
--border-default
--space-4
--radius-lg
```

### Token 分類

| 分類 | 前綴 | 說明 |
|------|------|------|
| Colors | `--color-*` | 語義化顏色 |
| Backgrounds | `--bg-*` | 背景色層級 |
| Text | `--text-*` | 文字顏色層級 |
| Border | `--border-*` | 邊框顏色 |
| Spacing | `--space-*` | 間距值 |
| Radius | `--radius-*` | 圓角值 |
| Shadow | `--shadow-*` | 陰影層級 |
| Font | `--font-*` | 字體族 |

---

## Color System

### Primary Palette — Teal

主色調傳達：**穩定、可靠、技術感**

| Token | Value | Tailwind | 用途 |
|-------|-------|----------|------|
| `--color-primary` | `#14b8a6` | `teal-500` | 主要互動元素 |
| `--color-primary-light` | `#2dd4bf` | `teal-400` | 連線狀態、高亮 |
| `--color-primary-dark` | `#0d9488` | `teal-600` | 按下狀態 |
| `--color-primary-subtle` | `rgba(20,184,166,0.1)` | `teal-500/10` | 背景tint |

### Semantic Colors（語義化顏色）

**這是最重要的部分 — 所有狀態顯示必須使用這些顏色**

| 狀態 | 色碼 | Tailwind | 使用場景 |
|------|------|----------|----------|
| **Connected / Success** | `#2dd4bf` | `teal-400` | 連線中、健康、成功、確認 |
| **Warning / Idle** | `#fbbf24` | `amber-400` | 警告、閒置、高延遲 (>100ms) |
| **Error / Disconnected** | `#fb7185` | `rose-400` | 斷線、錯誤、失敗、危險操作 |
| **Neutral / Disabled** | `#94a3b8` | `slate-400` | 停用、未配置、佔位 |
| **Info / Processing** | `#22d3ee` | `cyan-400` | 資訊提示、處理中 |

#### 語義色使用規則

```tsx
// ✅ CORRECT - 使用語義化顏色
<StatusDot status="connected" />  // teal-400
<StatusDot status="error" />      // rose-400

// ❌ WRONG - 硬編碼顏色
<div className="bg-green-500" />  // 不要使用 green
<div className="bg-red-500" />    // 使用 rose 而非 red
```

### Background Layers（背景層級）

由深到淺的層級系統，用於建立視覺深度：

| Token | Value | Tailwind | 用途 | Z-Index 參考 |
|-------|-------|----------|------|--------------|
| `--bg-base` | `#020617` | `slate-950` | 頁面背景 | 0 |
| `--bg-surface` | `#0f172a` | `slate-900` | 卡片、面板背景 | 1 |
| `--bg-elevated` | `#1e293b` | `slate-800` | 懸浮、選中、下拉選單 | 2 |
| `--bg-subtle` | `#334155` | `slate-700` | 分隔線、disabled 元素 | - |

#### 背景使用規則

```tsx
// 頁面容器
<main className="bg-slate-950 min-h-screen">

  // 卡片 - surface 層
  <div className="bg-slate-900 rounded-xl">

    // Hover 狀態 - elevated 層
    <button className="hover:bg-slate-800">

    // 下拉選單 - elevated 層
    <DropdownMenu className="bg-slate-800">
```

### Text Hierarchy（文字層級）

| Token | Value | Tailwind | 用途 | 範例 |
|-------|-------|----------|------|------|
| `--text-primary` | `#ffffff` | `text-white` | 標題、重要數據 | 頁面標題、數值 |
| `--text-secondary` | `#e2e8f0` | `text-slate-200` | 主要內容 | 段落、卡片標題 |
| `--text-tertiary` | `#94a3b8` | `text-slate-400` | 次要說明 | 標籤、副標題 |
| `--text-muted` | `#64748b` | `text-slate-500` | 佔位符、提示 | placeholder、時間戳 |

### Border Colors

| Token | Value | Tailwind | 用途 |
|-------|-------|----------|------|
| `--border-default` | `rgba(255,255,255,0.08)` | `border-white/[0.08]` | 預設邊框 |
| `--border-hover` | `rgba(255,255,255,0.15)` | `border-white/[0.15]` | Hover 邊框 |
| `--border-active` | `rgba(20,184,166,0.3)` | `border-teal-500/30` | 選中/連線邊框 |
| `--border-subtle` | `#334155` | `border-slate-700` | 分隔線 |

---

## Typography

### Font Stack

```css
/* 主要字體 - 系統字體優先 */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;

/* 等寬字體 - 用於代碼、數據、URL、端口 */
--font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code',
             'Consolas', 'Monaco', monospace;
```

### Type Scale

| 名稱 | Size | Weight | Line Height | Letter Spacing | 用途 |
|------|------|--------|-------------|----------------|------|
| `display` | 32px | 600 | 1.2 | -0.02em | 頁面主標題 |
| `heading` | 20px | 600 | 1.3 | -0.02em | 區塊標題 |
| `title` | 16px | 500 | 1.4 | -0.01em | 卡片標題、列表標題 |
| `body` | 14px | 400 | 1.5 | 0 | 主要內容 |
| `caption` | 12px | 400 | 1.4 | 0 | 次要說明、標籤 |
| `label` | 12px | 500 | 1 | 0.05em | 表單標籤 (uppercase) |
| `mono` | 13px | 400 | 1.4 | 0 | 代碼、端口、URL |

### Typography Classes

```tsx
// Display - 頁面標題
<h1 className="text-[32px] font-semibold tracking-tight text-white">
  Dashboard
</h1>

// Heading - 區塊標題
<h2 className="text-xl font-semibold tracking-tight text-white">
  Active Tunnels
</h2>

// Title - 卡片標題
<h3 className="text-base font-medium text-white">
  api-gateway
</h3>

// Body - 主要內容
<p className="text-sm text-slate-200">
  Your tunnel is now active and accepting connections.
</p>

// Caption - 次要說明
<span className="text-xs text-slate-400">
  Last updated 5 minutes ago
</span>

// Label - 表單標籤
<label className="text-xs font-medium uppercase tracking-wider text-slate-400">
  Local Port
</label>

// Mono - 技術數據
<code className="font-mono text-[13px] text-slate-200">
  :3000
</code>

// URL - 連結
<a className="font-mono text-xs text-teal-400 hover:text-teal-300">
  api.noverlink.com
</a>
```

### 等寬字體使用場景

**必須使用等寬字體的內容：**
- 端口號 (`:3000`, `:8080`)
- URL / Domain (`api.noverlink.com`)
- IP 地址 (`192.168.1.1`)
- Tunnel ID (`tunnel-xyz-abc`)
- 時間戳 (`2024-01-15 14:30:22`)
- 延遲數據 (`23ms`)
- 請求數 (`12.4k`)
- 代碼片段

---

## Spacing & Layout

### 4px Grid System

所有間距必須是 4px 的倍數：

| Token | Value | Tailwind | 用途 |
|-------|-------|----------|------|
| `space-0.5` | 2px | `gap-0.5`, `p-0.5` | 微間距（icon 內部） |
| `space-1` | 4px | `gap-1`, `p-1` | 圖標與文字間距 |
| `space-1.5` | 6px | `gap-1.5`, `p-1.5` | 緊湊按鈕內邊距 |
| `space-2` | 8px | `gap-2`, `p-2` | 緊湊元素間距 |
| `space-3` | 12px | `gap-3`, `p-3` | 列表項內邊距 |
| `space-4` | 16px | `gap-4`, `p-4` | 標準內邊距 |
| `space-5` | 20px | `gap-5`, `p-5` | 卡片內邊距 |
| `space-6` | 24px | `gap-6`, `p-6` | 區塊間距 |
| `space-8` | 32px | `gap-8`, `p-8` | 大區塊間距 |
| `space-10` | 40px | `gap-10`, `p-10` | 頁面邊距 |
| `space-12` | 48px | `gap-12`, `p-12` | 主要區塊分隔 |

### 標準佈局間距

```tsx
// 頁面容器
<div className="p-6 md:p-8 lg:p-10">

// 區塊之間
<section className="space-y-8">

// 卡片內部
<div className="p-4 md:p-5">

// 列表項
<li className="py-3 px-4">

// 按鈕組
<div className="flex gap-3">

// 表單欄位
<div className="space-y-4">

// 圖標與文字
<div className="flex items-center gap-2">
```

### Border Radius

| Token | Value | Tailwind | 用途 |
|-------|-------|----------|------|
| `radius-sm` | 4px | `rounded` | 小按鈕、tag |
| `radius-md` | 6px | `rounded-md` | 輸入框、小卡片 |
| `radius-lg` | 8px | `rounded-lg` | 標準按鈕、列表項 |
| `radius-xl` | 12px | `rounded-xl` | 卡片、面板 |
| `radius-2xl` | 16px | `rounded-2xl` | 節點、大容器 |
| `radius-3xl` | 20px | `rounded-3xl` | 視覺化容器 |
| `radius-full` | 9999px | `rounded-full` | 狀態點、膠囊、Avatar |

### 圓角使用規則

```tsx
// 狀態點 - full
<div className="w-2 h-2 rounded-full bg-teal-400" />

// 狀態標籤/Badge - full
<span className="px-3 py-1 rounded-full">Connected</span>

// 按鈕 - lg
<button className="rounded-lg">Create Tunnel</button>

// 輸入框 - md
<input className="rounded-md" />

// 卡片 - xl
<div className="rounded-xl">

// 節點 - 2xl
<div className="w-16 h-16 rounded-2xl">
```

---

## Component Specifications

### 1. Status Dot（狀態點）

最基本的狀態指示器。

```tsx
// Sizes
const sizes = {
  xs: 'w-1.5 h-1.5',  // 6px - 用於緊湊列表
  sm: 'w-2 h-2',      // 8px - 標準使用
  md: 'w-2.5 h-2.5',  // 10px - 強調
  lg: 'w-3 h-3',      // 12px - 大型顯示
};

// Usage
<div className={cn(
  'rounded-full',
  sizes.sm,
  status === 'connected' && 'bg-teal-400',
  status === 'warning' && 'bg-amber-400',
  status === 'error' && 'bg-rose-400',
  status === 'offline' && 'bg-slate-600',
)} />
```

### 2. Status Badge（狀態標籤）

帶文字的狀態指示器，使用 `PulseBadge` 元件。

**Variants:**
- `connected` - Teal，表示連線中
- `disconnected` - Rose，表示斷線
- `warning` - Amber，表示警告
- `info` - Cyan，表示資訊
- `neutral` - Slate，表示中性
- `processing` - Purple，表示處理中

**Appearances:**
- `dot` - 只有點 + 文字
- `pill` - 膠囊形狀背景
- `tag` - 左邊框標記

```tsx
import { PulseBadge } from '@noverlink/ui-shared';

// Basic
<PulseBadge variant="connected">Connected</PulseBadge>

// Pill style
<PulseBadge variant="connected" appearance="pill" pulse>
  Connected
</PulseBadge>

// No pulse animation
<PulseBadge variant="disconnected" pulse={false}>
  Disconnected
</PulseBadge>
```

### 3. Tunnel Node（節點）

表示隧道端點的視覺元素。

**Variants:**
- `local` - 本地端點（灰色背景）
- `public` - 公網端點（Teal 漸層）
- `relay` - 中繼節點（半透明）

**Sizes:**
- `sm` - 48x48px
- `default` - 64x64px
- `lg` - 80x80px

**Status:**
- `connected` - 正常顯示
- `disconnected` - 50% opacity
- `connecting` - pulse 動畫

```tsx
import { TunnelNode } from '@noverlink/ui-shared';

// Local node
<TunnelNode
  variant="local"
  label="Local"
  sublabel=":3000"
/>

// Public node with custom icon
<TunnelNode
  variant="public"
  label="Public"
  sublabel="api.noverlink.com"
  icon={<GlobeIcon />}
/>

// Connecting state
<TunnelNode
  variant="public"
  status="connecting"
/>
```

### 4. Tunnel Line（連線線）

表示隧道連接的視覺元素。

**Props:**
- `status` - connected | disconnected | connecting
- `direction` - horizontal | vertical
- `animated` - 是否顯示流動動畫
- `flowDirection` - forward | backward
- `label` - 連線上的標籤

```tsx
import { TunnelLine, TunnelConnection } from '@noverlink/ui-shared';

// Simple line
<TunnelLine status="connected" animated />

// With label
<TunnelLine
  status="connected"
  label="tunnel-xyz"
  animated
/>

// Complete connection visualization
<TunnelConnection
  localLabel="Local"
  localSublabel=":3000"
  publicLabel="Public"
  publicSublabel="api.noverlink.com"
  status="connected"
  tunnelName="tunnel-xyz"
  animated
/>
```

### 5. Tunnel Card（隧道卡片）

顯示單個隧道的卡片元件。

**Status:**
- `online` - Teal 邊框 + 背景 tint
- `offline` - 灰色邊框
- `error` - Rose 邊框 + 背景 tint

```tsx
import { TunnelCard } from '@noverlink/ui-shared';

// Online tunnel
<TunnelCard
  status="online"
  name="api-gateway"
  localPort={3000}
  publicUrl="api.noverlink.com"
  stats="12.4k requests"
/>

// Offline tunnel
<TunnelCard
  status="offline"
  name="db-admin"
/>

// With actions
<TunnelCard
  status="online"
  name="web-app"
  actions={
    <Button variant="ghost" size="sm">
      <SettingsIcon />
    </Button>
  }
/>
```

### 6. Metric Card（指標卡片）

顯示單個數據指標。

```tsx
import { MetricCard, TunnelStats } from '@noverlink/ui-shared';

// Single metric
<MetricCard
  value="23ms"
  label="Latency"
  sublabel="avg"
  trend="up"
/>

// Stats row
<TunnelStats
  requests="12.4k"
  bandwidth="1.2GB"
  latency="23ms"
  uptime="99.9%"
/>
```

### 7. Buttons（按鈕）

**GlowButton - Noverlink 風格按鈕**

Variants:
- `primary` - Teal 背景，主要操作
- `secondary` - 邊框按鈕，次要操作
- `ghost` - 無背景，輔助操作

```tsx
import { GlowButton } from '@noverlink/ui-shared';

// Primary action
<GlowButton variant="primary">
  Create Tunnel
</GlowButton>

// Secondary action
<GlowButton variant="secondary">
  View Logs
</GlowButton>

// Ghost action
<GlowButton variant="ghost">
  Settings
</GlowButton>

// Loading state
<GlowButton loading>
  Processing...
</GlowButton>

// With icon
<GlowButton variant="primary" size="icon">
  <PlusIcon />
</GlowButton>
```

**Button - shadcn/ui 標準按鈕**

用於通用場景，遵循 shadcn/ui 規範。

```tsx
import { Button } from '@noverlink/ui-shared';

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### 8. Input（輸入框）

```tsx
import { Input, InputGroup } from '@noverlink/ui-shared';

// Basic
<Input placeholder="Enter tunnel name..." />

// With label
<div className="space-y-2">
  <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
    Local Port
  </label>
  <Input type="number" placeholder="3000" />
</div>

// Monospace input (for technical data)
<Input className="font-mono" placeholder="192.168.1.1" />
```

### 9. Card（卡片）

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@noverlink/ui-shared';

<Card>
  <CardHeader>
    <CardTitle>Active Tunnels</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

---

## Animation Guidelines

### 使用原則

| 場景 | 動畫 | 說明 |
|------|------|------|
| 連線建立 | ✅ | 一次性 fade-in + scale |
| 數據流動 | ✅ 可選 | 使用 `TunnelLine` 的 `animated` |
| 狀態切換 | ✅ | 150ms ease transition |
| 按鈕 hover | ✅ | 背景色 150ms transition |
| Loading | ✅ | spin 或 pulse |
| 背景裝飾 | ❌ | 保持靜態 |
| 文字內容 | ❌ | 保持靜態 |

### 標準 Transitions

```css
/* 所有可過渡屬性 */
.transition-all {
  transition: all 150ms ease;
}

/* 僅顏色 - 最常用 */
.transition-colors {
  transition: color 150ms ease,
              background-color 150ms ease,
              border-color 150ms ease;
}

/* 透明度 */
.transition-opacity {
  transition: opacity 150ms ease;
}

/* 變形 */
.transition-transform {
  transition: transform 200ms ease;
}
```

### Keyframe Animations

已定義在 `styles.css`：

```css
/* 數據流動 - 向右 */
@keyframes flow-right { /* ... */ }

/* 數據流動 - 向左 */
@keyframes flow-left { /* ... */ }

/* 數據流動 - 向下 */
@keyframes flow-down { /* ... */ }

/* 數據流動 - 向上 */
@keyframes flow-up { /* ... */ }

/* 進度條 indeterminate */
@keyframes progress-indeterminate { /* ... */ }
```

### Loading States

```tsx
// Spinner
<svg className="animate-spin h-4 w-4" />

// Pulse (for connecting states)
<div className="animate-pulse" />

// Ping (for status dots)
<span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" />
```

---

## Shadows & Effects

### Shadow Scale

```css
/* 微弱陰影 - 卡片默認 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);

/* 標準陰影 - Hover、下拉選單 */
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);

/* 強調陰影 - Modal、Popover */
--shadow-lg: 0 8px 24px rgba(0,0,0,0.5);

/* 超大陰影 - 全屏 Modal */
--shadow-xl: 0 12px 40px rgba(0,0,0,0.6);
```

### Glow Effects

**僅用於狀態指示，不用於裝飾！**

```css
/* 連線狀態發光 */
.glow-connected {
  box-shadow: 0 0 8px rgba(45, 212, 191, 0.4);  /* teal-400 */
}

/* 數據流動點發光 */
.glow-flow {
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.5);
}

/* 錯誤狀態發光 */
.glow-error {
  box-shadow: 0 0 8px rgba(251, 113, 133, 0.4);  /* rose-400 */
}
```

### Grid Background

用於視覺化面板，提供空間感：

```tsx
// 點陣背景
<div
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  }}
/>
```

---

## Accessibility

### Color Contrast

所有文字必須達到 WCAG AA 標準（4.5:1 對比度）：

| 背景 | 最小文字色 | 對比度 |
|------|-----------|--------|
| `slate-950` | `slate-400` | 4.8:1 ✅ |
| `slate-900` | `slate-400` | 4.6:1 ✅ |
| `slate-800` | `slate-300` | 5.2:1 ✅ |

### Focus States

所有互動元素必須有明確的 focus 狀態：

```tsx
// 標準 focus ring
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">

// Input focus
<input className="focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
```

### Keyboard Navigation

- 所有互動元素必須可 Tab 到達
- 使用正確的 ARIA 屬性
- 下拉選單支持方向鍵導航

### 最小點擊區域

- 按鈕最小高度：32px (h-8)
- 可點擊區域最小：44x44px（mobile）

---

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px    /* 大手機 */
md: 768px    /* 平板 */
lg: 1024px   /* 小桌面 */
xl: 1280px   /* 桌面 */
2xl: 1536px  /* 大桌面 */
```

### 響應式模式

```tsx
// 卡片網格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 側邊欄佈局
<div className="flex flex-col lg:flex-row">
  <aside className="w-full lg:w-64" />
  <main className="flex-1" />
</div>

// 隱藏/顯示
<span className="hidden md:inline">Full text</span>
<span className="md:hidden">Short</span>
```

---

## Do's and Don'ts

### ✅ DO

1. **使用 Teal 表示連線/健康狀態** — 這是品牌色
2. **使用節點+線條表示隧道關係** — 核心視覺語言
3. **保持大量留白** — 讓界面呼吸
4. **等寬字體顯示技術數據** — URL、端口、ID、時間
5. **動畫僅用於狀態變化** — 保持專業感
6. **高對比度確保可讀性** — WCAG AA
7. **使用語義化顏色** — connected=teal, error=rose
8. **使用設計系統元件** — TunnelNode, TunnelLine, PulseBadge
9. **遵循 4px 網格** — 所有間距是 4 的倍數
10. **使用 CVA 管理 variants** — 保持一致性

### ❌ DON'T

1. **避免純白背景** — 使用 slate-950/900
2. **避免過多動畫** — 會讓界面看起來不專業
3. **避免裝飾性發光** — Glow 只用於狀態指示
4. **避免過小字體** — 最小 12px
5. **避免低對比度文字** — 確保 WCAG AA
6. **避免擁擠佈局** — 保持呼吸感
7. **避免使用 green/red** — 使用 teal/rose
8. **避免硬編碼顏色值** — 使用 design tokens
9. **避免不一致的圓角** — 遵循 radius scale
10. **避免隨意間距** — 使用 space tokens

---

## Implementation Checklist

### 新元件開發 Checklist

- [ ] 使用 CVA (class-variance-authority) 管理 variants
- [ ] 支持 `className` prop 允許覆寫
- [ ] 使用 `cn()` utility 合併 classes
- [ ] 使用 `forwardRef` 轉發 ref
- [ ] 定義並導出 TypeScript interface
- [ ] 顏色使用 design tokens
- [ ] 間距遵循 4px 網格
- [ ] 圓角遵循 radius scale
- [ ] 有適當的 hover/focus states
- [ ] 支持 disabled 狀態
- [ ] 滿足 accessibility 要求
- [ ] 文件放在正確位置：
  - 基礎 UI 元件 → `components/ui/`
  - 隧道相關元件 → `components/custom/`
- [ ] 在 `index.ts` 中導出

### 元件命名規範

```
{Domain}{Element}{Variant}

Examples:
- TunnelCard
- TunnelNode
- TunnelLine
- TunnelConnection
- PulseBadge
- StatusIndicator
- MetricCard
- GlowButton
```

### 檔案結構

```
packages/ui-shared/src/
├── components/
│   ├── ui/                    # shadcn/ui 基礎組件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── custom/                # Noverlink 自定義組件
│       ├── tunnel-node.tsx
│       ├── tunnel-line.tsx
│       ├── tunnel-card.tsx
│       ├── pulse-badge.tsx
│       ├── glow-button.tsx
│       └── index.ts
├── hooks/
│   └── use-mobile.ts
├── lib/
│   └── utils.ts               # cn() utility
├── styles.css                 # Design tokens & keyframes
└── index.ts                   # Public exports
```

---

## Quick Reference Cards

### 顏色速查

| 用途 | Tailwind Class |
|------|----------------|
| 主色 | `text-teal-400`, `bg-teal-500`, `border-teal-500/30` |
| 連線中 | `text-teal-400`, `bg-teal-400` |
| 警告 | `text-amber-400`, `bg-amber-400` |
| 錯誤 | `text-rose-400`, `bg-rose-400` |
| 背景-頁面 | `bg-slate-950` |
| 背景-卡片 | `bg-slate-900` |
| 背景-懸浮 | `bg-slate-800` |
| 文字-主要 | `text-white` |
| 文字-次要 | `text-slate-200` |
| 文字-輔助 | `text-slate-400` |
| 邊框 | `border-white/[0.08]`, `border-slate-700` |

### 間距速查

| 用途 | Tailwind Class |
|------|----------------|
| 圖標與文字 | `gap-2` |
| 元素間距 | `gap-3` 或 `gap-4` |
| 列表項 | `py-3 px-4` |
| 卡片內邊距 | `p-4` 或 `p-5` |
| 區塊間距 | `space-y-6` 或 `space-y-8` |
| 頁面邊距 | `p-6 md:p-8` |

### 圓角速查

| 用途 | Tailwind Class |
|------|----------------|
| 狀態點 | `rounded-full` |
| Badge | `rounded-full` |
| 按鈕 | `rounded-lg` |
| 輸入框 | `rounded-md` |
| 卡片 | `rounded-xl` |
| 節點 | `rounded-2xl` |

### 字體速查

| 用途 | Tailwind Class |
|------|----------------|
| 頁面標題 | `text-[32px] font-semibold` |
| 區塊標題 | `text-xl font-semibold` |
| 卡片標題 | `text-base font-medium` |
| 內文 | `text-sm` |
| 說明文字 | `text-xs text-slate-400` |
| 標籤 | `text-xs font-medium uppercase tracking-wider` |
| 技術數據 | `font-mono text-[13px]` |

---

## Preview & Development

```bash
# 啟動開發伺服器
npm run dev

# 查看設計比較頁面
http://localhost:3000/dev/design-compare
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-01-XX | 完整重寫，新增詳細規範 |
| 1.0 | 2024-XX-XX | 初始版本 |
