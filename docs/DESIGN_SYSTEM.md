# Noverlink Design System

## Design Philosophy

Noverlink 採用 **連線視覺化** 設計風格，核心理念：

> **「讓隧道可見」** — 將抽象的網路連線轉化為直覺的視覺語言

### 設計原則

| 原則 | 說明 |
|------|------|
| **清晰優先** | 狀態一目瞭然，不需要猜測 |
| **安靜專業** | 像基礎設施工具，不是遊戲 |
| **有呼吸感** | 充足留白、適當間距 |
| **連線意象** | 節點、線條、流動感貫穿設計 |

### 參考風格

- **Cloudflare Radar** — 網路拓撲視覺化
- **Tailscale** — 簡潔的連線狀態圖
- **Linear** — 現代專業的 UI 質感

---

## Core Visual Language

### 隧道視覺模型

```
┌─────────────┐                              ┌─────────────┐
│             │                              │             │
│    Local    │ ○━━━━━━━━━━━━━━━━━━━━━━━━━○ │   Public    │
│   :3000     │         tunnel-xyz           │  .nover.link│
│             │        ● Connected           │             │
└─────────────┘                              └─────────────┘
      ↑                     ↑                       ↑
   端點節點              連線狀態               端點節點
   (方形容器)          (線 + 狀態標籤)         (強調容器)
```

### 視覺元素定義

| 元素 | 視覺表現 | 用途 |
|------|----------|------|
| **端點節點** | 圓角方形容器 + 圖標 | 表示 Local/Public 端點 |
| **連線線** | 漸層水平線 | 表示隧道連接 |
| **流動點** | 小圓點 + 位移動畫 | 表示數據正在傳輸（可選） |
| **狀態標籤** | 圓角膠囊 + 狀態點 | 顯示連線狀態 |
| **狀態點** | 小圓點 (2-3px) | 快速辨識狀態 |

---

## Color System

### Primary Palette

以 **Teal** 為主色調，傳達：穩定、可靠、技術感

```css
/* 主色 - Teal */
--color-primary: #14b8a6;        /* teal-500 */
--color-primary-light: #2dd4bf;  /* teal-400 */
--color-primary-dark: #0d9488;   /* teal-600 */
--color-primary-subtle: #14b8a6/10; /* 背景用 */
```

### Semantic Colors

| 名稱 | 色碼 | 用途 |
|------|------|------|
| **Connected** | `teal-400` (#2dd4bf) | 連線中、健康、成功 |
| **Warning** | `amber-400` (#fbbf24) | 警告、閒置、高延遲 |
| **Error** | `rose-400` (#fb7185) | 斷線、錯誤、失敗 |
| **Neutral** | `slate-400` (#94a3b8) | 停用、未配置 |

### Background Layers

```css
/* 背景層次 - 由深到淺 */
--bg-base: #020617;      /* slate-950 - 頁面背景 */
--bg-surface: #0f172a;   /* slate-900 - 卡片背景 */
--bg-elevated: #1e293b;  /* slate-800 - 懸浮/選中 */
--bg-subtle: #334155;    /* slate-700 - 分隔線 */
```

### Text Hierarchy

```css
/* 文字層次 */
--text-primary: #ffffff;           /* 標題、重要數據 */
--text-secondary: #e2e8f0;         /* slate-200 - 主要內容 */
--text-tertiary: #94a3b8;          /* slate-400 - 次要說明 */
--text-muted: #64748b;             /* slate-500 - 佔位符、提示 */
```

### Border & Divider

```css
/* 邊框 */
--border-default: rgba(255,255,255,0.08);  /* 預設邊框 */
--border-hover: rgba(255,255,255,0.15);    /* hover 邊框 */
--border-active: rgba(20,184,166,0.3);     /* 選中/連線邊框 (teal) */
```

---

## Typography

### Font Stack

```css
/* 主要字體 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* 等寬字體 - 用於代碼、數據 */
font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale

| 名稱 | 大小 | 字重 | 用途 |
|------|------|------|------|
| **Display** | 32px | 600 | 頁面標題 |
| **Heading** | 20px | 600 | 區塊標題 |
| **Title** | 16px | 500 | 卡片標題 |
| **Body** | 14px | 400 | 主要內容 |
| **Caption** | 12px | 400 | 次要說明、標籤 |
| **Mono** | 13px | 400 | 代碼、端口、URL |

### 文字樣式規則

```css
/* 標題 */
.heading {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

/* 標籤 */
.label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

/* 數據展示 */
.data {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}

/* 連結/URL */
.url {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary-light);
}
```

---

## Spacing System

基於 4px 網格系統：

| Token | Value | 用途 |
|-------|-------|------|
| `space-1` | 4px | 圖標與文字間距 |
| `space-2` | 8px | 緊湊元素間距 |
| `space-3` | 12px | 列表項內邊距 |
| `space-4` | 16px | 標準內邊距 |
| `space-5` | 20px | 卡片內邊距 |
| `space-6` | 24px | 區塊間距 |
| `space-8` | 32px | 大區塊間距 |

---

## Border Radius

| Token | Value | 用途 |
|-------|-------|------|
| `radius-sm` | 4px | 小按鈕、標籤 |
| `radius-md` | 8px | 輸入框、列表項 |
| `radius-lg` | 12px | 卡片 |
| `radius-xl` | 16px | 大容器、面板 |
| `radius-2xl` | 20px | 視覺化容器 |
| `radius-full` | 9999px | 狀態點、膠囊標籤 |

---

## Component Patterns

### 1. 節點 (Node)

表示隧道的端點。

```tsx
// Local Node - 較淡、表示本地
<div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700
                flex items-center justify-center">
  <ComputerIcon className="w-7 h-7 text-slate-400" />
</div>

// Public Node - 強調、表示公網
<div className="w-16 h-16 rounded-2xl
                bg-gradient-to-br from-teal-500/20 to-cyan-500/20
                border border-teal-500/30
                flex items-center justify-center">
  <GlobeIcon className="w-7 h-7 text-teal-400" />
</div>
```

### 2. 連線 (Connection Line)

```tsx
// 基本連線
<div className="h-px bg-gradient-to-r from-slate-700 via-teal-500 to-slate-700" />

// 帶流動動畫的連線
<div className="relative h-px bg-gradient-to-r from-slate-700 via-teal-500 to-slate-700">
  <div
    className="absolute w-2 h-2 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50"
    style={{ animation: 'flowRight 2s linear infinite' }}
  />
</div>
```

### 3. 狀態標籤 (Status Badge)

```tsx
// Connected
<div className="px-3 py-1 bg-slate-900 border border-teal-500/30 rounded-full">
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
    <span className="text-xs font-medium text-teal-400">Connected</span>
  </div>
</div>

// Disconnected
<div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full">
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
    <span className="text-xs font-medium text-slate-400">Disconnected</span>
  </div>
</div>
```

### 4. 隧道卡片 (Tunnel Card)

```tsx
// Online Tunnel
<div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5
                flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 rounded-full bg-teal-400" />
    <span className="font-medium">api-gateway</span>
  </div>
  <div className="text-sm text-slate-400">12.4k requests</div>
</div>

// Offline Tunnel
<div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30
                flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 rounded-full bg-slate-600" />
    <span className="font-medium text-slate-400">db-admin</span>
  </div>
  <div className="text-sm text-slate-500">Offline</div>
</div>
```

### 5. 指標卡片 (Metric Card)

```tsx
<div className="text-center p-4 rounded-xl bg-slate-800/50">
  <div className="text-2xl font-semibold">23ms</div>
  <div className="text-xs text-slate-500 mt-1">Latency · avg</div>
</div>
```

### 6. 按鈕 (Buttons)

```tsx
// Primary Button
<button className="px-5 py-2.5 text-sm font-medium
                   bg-teal-500 text-white rounded-lg
                   hover:bg-teal-400 transition-colors">
  Create Tunnel
</button>

// Secondary Button
<button className="px-5 py-2.5 text-sm font-medium
                   border border-slate-700 text-white rounded-lg
                   hover:bg-slate-800 transition-colors">
  View Logs
</button>

// Ghost Button
<button className="px-4 py-2 text-sm text-slate-400
                   hover:text-white transition-colors">
  Settings
</button>
```

---

## Animation

### 使用原則

| 場景 | 是否動畫 | 說明 |
|------|----------|------|
| 連線建立 | ✅ | 一次性過渡 |
| 數據流動 | ✅ 可選 | 細微、低調 |
| 狀態切換 | ✅ | fade/scale 過渡 |
| 按鈕 hover | ✅ | 背景色過渡 |
| 背景 | ❌ | 保持靜態 |
| 文字 | ❌ | 保持靜態 |

### 動畫定義

```css
/* 標準過渡 */
.transition-default {
  transition: all 150ms ease;
}

/* 顏色過渡 */
.transition-colors {
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

/* 數據流動 (可選) */
@keyframes flowRight {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

/* 脈衝 (連線狀態) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Shadows & Effects

### 陰影層次

```css
/* 微弱陰影 - 卡片 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);

/* 標準陰影 - 懸浮元素 */
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);

/* 強調陰影 - 模態框 */
--shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
```

### 發光效果

**僅用於狀態指示**，不用於裝飾：

```css
/* 連線狀態發光 */
.glow-connected {
  box-shadow: 0 0 8px rgba(20,184,166,0.4);
}

/* 數據流動點發光 */
.glow-flow {
  box-shadow: 0 0 12px rgba(20,184,166,0.5);
}
```

---

## Grid Background (可選)

用於視覺化面板，提供空間感：

```tsx
<div
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  }}
/>
```

---

## Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* 大手機 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小桌面 */
--breakpoint-xl: 1280px;  /* 桌面 */
```

---

## Do's and Don'ts

### ✅ Do

1. **使用 Teal 表示連線/健康狀態**
2. **用節點+線條表示隧道關係**
3. **保持大量留白**
4. **等寬字體顯示 URL、端口、代碼**
5. **動畫僅用於狀態變化**
6. **高對比度確保可讀性**

### ❌ Don't

1. **避免純白背景** — 使用 slate-950/900
2. **避免過多動畫** — 保持專業感
3. **避免裝飾性發光** — 只用於狀態指示
4. **避免過小字體** — 最小 12px
5. **避免低對比度文字** — 確保 WCAG AA
6. **避免擁擠佈局** — 保持呼吸感

---

## File Structure

```
packages/ui-shared/src/
├── components/
│   ├── ui/              # shadcn/ui 基礎組件
│   └── tunnel/          # 隧道相關組件 (待建立)
│       ├── tunnel-node.tsx
│       ├── tunnel-line.tsx
│       ├── tunnel-card.tsx
│       ├── tunnel-status.tsx
│       └── tunnel-visualizer.tsx
├── lib/
│   └── utils.ts
└── styles.css           # Design tokens
```

---

## Quick Reference

### 顏色速查

| 用途 | Class |
|------|-------|
| 主色 | `text-teal-400`, `bg-teal-500`, `border-teal-500/30` |
| 連線中 | `text-teal-400`, `bg-teal-400` |
| 警告 | `text-amber-400`, `bg-amber-400` |
| 錯誤 | `text-rose-400`, `bg-rose-400` |
| 背景 | `bg-slate-950`, `bg-slate-900`, `bg-slate-800` |
| 文字 | `text-white`, `text-slate-200`, `text-slate-400` |
| 邊框 | `border-white/[0.08]`, `border-slate-700` |

### 間距速查

| 用途 | Class |
|------|-------|
| 卡片內邊距 | `p-4` 或 `p-5` |
| 列表項 | `py-3 px-4` |
| 區塊間距 | `space-y-6` 或 `space-y-8` |
| 元素間距 | `gap-3` 或 `gap-4` |

---

## Preview

```bash
# 查看設計比較
http://localhost:3000/dev/design-compare

# 選擇 "C: 連線視覺化" 查看此設計系統的實際效果
```
