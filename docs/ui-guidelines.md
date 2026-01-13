# Noverlink Design System

> **Version:** 4.0 — Evangelion Title Card Style
> **Last Updated:** 2025-01-03
> **Status:** Active
> **Reference:** `/dev/evangelion`

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Specifications](#component-specifications)
6. [Effects & Overlays](#effects--overlays)
7. [Animation Guidelines](#animation-guidelines)
8. [Implementation Checklist](#implementation-checklist)

---

## Design Philosophy

### Core Concept: EVA Title Card Aesthetic (標題卡美學)

靈感來自《新世紀福音戰士》的經典標題卡設計——**極簡、衝擊、大膽**。

用「大字報」的方式呈現技術資訊，讓每個畫面都像是在宣告重要訊息。

### 風格關鍵字

| 關鍵字 | 說明 |
|--------|------|
| **Stark (極端對比)** | 深灰背景 + 純白文字，高對比但舒適 |
| **Compressed (壓縮)** | 文字被機械式壓扁，造成視覺張力 |
| **Minimal (極簡)** | 大量留白，只留必要資訊 |
| **Cinematic (電影感)** | 像在看動畫的過場標題 |

### 三大設計支柱

#### 1. Title Card Hierarchy (標題卡層級)

- **大字報優先：** 重要資訊用超大壓縮文字
- **Episode 格式：** `TUNNEL.01`、`STATUS.00` 這種編號方式
- **少即是多：** 每個畫面只傳達一個核心訊息

#### 2. Mechanical Compression (機械壓縮)

- **scaleY(0.7) + scaleX(0.85)** — 核心視覺特徵
- 模擬 Matisse EB 明朝體的緊湊感
- 營造「壓迫感」與「緊張感」

#### 3. Film Aesthetic (膠片質感)

- 輕微的顆粒噪點
- 微弱的畫面閃爍
- 狀態指示器發光效果
- 整體像是在看 CRT 螢幕

### 設計參考

- **Neon Genesis Evangelion** — 標題卡、NERV 介面
- **Fontworks Matisse EB** — 壓縮明朝體
- **2001: A Space Odyssey** — HAL 9000 介面

---

## Color System

### Primary Palette — Deep Dark

極簡的黑白灰，只在狀態指示時使用彩色。

| Token | Value | 用途 |
|-------|-------|------|
| `--color-bg` | `#0a0a0a` | 主要背景（深灰，非純黑） |
| `--color-bg-elevated` | `#111111` | 導航、hover 狀態 |
| `--color-bg-card` | `#0a0a0a` | 卡片背景 |

### Text Colors

| Token | Value | 用途 |
|-------|-------|------|
| `--text-primary` | `#FFFFFF` | 主標題、重要內容 |
| `--text-secondary` | `rgba(255,255,255,0.8)` | 次要內容 |
| `--text-muted` | `rgba(255,255,255,0.6)` | 標籤、說明文字 |
| `--text-subtle` | `rgba(255,255,255,0.4)` | 佔位符、次要提示 |

### Status Colors（語義化顏色）

只有狀態指示使用彩色，且帶有發光效果。

| 狀態 | 色碼 | 使用場景 |
|------|------|----------|
| **Connected / Success** | `#00FF00` | 連線中、健康、成功 |
| **Warning / Idle** | `#FFB800` | 警告、閒置、高延遲 |
| **Error / Disconnected** | `#FF0000` | 斷線、錯誤、失敗 |

**發光效果：**
```css
/* Status glow */
.status-connected {
  color: #00FF00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}
```

### Border Colors

| Token | Value | 用途 |
|-------|-------|------|
| `--border-default` | `rgba(255,255,255,0.15)` | 分隔線、卡片邊框 |
| `--border-status` | `currentColor` | 狀態指示邊框（與狀態顏色相同） |

---

## Typography

### Font Stack

```css
/* 標題字體 - 壓縮襯線 */
--font-title: 'Times New Roman', 'Georgia',
              'Noto Serif CJK TC', 'Source Han Serif TC', serif;

/* 副標題/UI - 瑞士無襯線 */
--font-ui: 'Helvetica Neue', 'Arial', -apple-system, sans-serif;

/* 等寬字體 - 技術數據 */
--font-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;
```

### The Compression Transform

**這是整個設計系統的核心！**

```css
.eva-title {
  font-family: var(--font-title);
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;

  /* 關鍵：機械壓縮 */
  transform: scaleY(0.7) scaleX(0.85);

  /* 微光暈增加可讀性 */
  text-shadow: 0 0 60px rgba(255,255,255,0.2);
}
```

### Type Scale

| 名稱 | Size | Weight | Transform | 用途 |
|------|------|--------|-----------|------|
| `display` | clamp(4rem, 15vw, 12rem) | 900 | compressed | 全螢幕標題卡 |
| `title` | clamp(4rem, 10vw, 8rem) | 900 | compressed | 頁面主標題 |
| `heading-1` | clamp(2.5rem, 6vw, 5rem) | 900 | compressed | 區塊大標題 |
| `heading-2` | clamp(1.5rem, 4vw, 3rem) | 900 | compressed | 區塊標題 |
| `ui-label` | 0.8rem | 400 | none | UI 標籤 |
| `ui-small` | 0.7rem | 400 | none | 小型 UI 文字 |
| `mono` | 0.9rem | 400 | none | 技術數據 |

### UI Text Style

副標題和介面文字使用無襯線字體，寬字距。

```css
.eva-ui-text {
  font-family: var(--font-ui);
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
}
```

### Typography Classes

```tsx
// Display - 全螢幕標題卡
<h1 style={{
  fontFamily: "'Times New Roman', Georgia, serif",
  fontWeight: 900,
  fontSize: 'clamp(4rem, 15vw, 12rem)',
  color: '#fff',
  transform: 'scaleY(0.7) scaleX(0.85)',
  textShadow: '0 0 60px rgba(255,255,255,0.2)',
}}>
  NOVERLINK
</h1>

// Episode Header - 集數標題
<div style={{ borderLeft: '4px solid #00FF00', padding: '30px 40px' }}>
  <span style={{ fontWeight: 900, transform: 'scaleY(0.75) scaleX(0.9)' }}>
    TUNNEL<span style={{ color: '#00FF00' }}>.01</span>
  </span>
</div>

// UI Label - 介面標籤
<span style={{
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: '0.8rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)',
}}>
  ACTIVE TUNNELS
</span>

// Mono - 技術數據
<code style={{
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  color: 'rgba(255,255,255,0.8)',
}}>
  localhost:3000
</code>
```

---

## Spacing & Layout

### Minimal Composition

EVA 風格強調大量留白和居中構圖。

```tsx
// 全螢幕標題卡
<div style={{
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0a0a0a',
}}>
  <h1 className="eva-title">TUNNEL ACTIVE</h1>
</div>
```

### Padding Standards

| 元素 | Padding |
|------|---------|
| 標題卡區塊 | `80px 40px` |
| 內容區塊 | `40px` |
| 列表項目 | `20px 40px` |
| 狀態標籤 | `4px 12px` |

### Border Standards

| 用途 | 樣式 |
|------|------|
| 分隔線 | `1px solid rgba(255,255,255,0.15)` |
| 狀態邊框 | `4px solid [status-color]` (左邊) |
| 狀態標籤 | `1px solid [status-color]` |

---

## Component Specifications

### 1. Title Card（標題卡）

全螢幕的衝擊性標題展示。

```tsx
function TitleCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      padding: '80px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}>
      <h1 style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        fontWeight: 900,
        fontSize: 'clamp(4rem, 10vw, 8rem)',
        color: '#fff',
        textTransform: 'uppercase',
        transform: 'scaleY(0.7) scaleX(0.85)',
        textShadow: '0 0 40px rgba(255,255,255,0.1)',
        margin: 0,
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: '0.9rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '30px',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

### 2. Episode Header（集數標題）

`TUNNEL.01` 格式的標題。

```tsx
function EpisodeHeader({
  label,
  number,
  title,
  status = 'connected',
}: {
  label: string;
  number: string;
  title?: string;
  status?: 'connected' | 'warning' | 'error';
}) {
  const statusColors = {
    connected: '#00FF00',
    warning: '#FFB800',
    error: '#FF0000',
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      borderLeft: `4px solid ${statusColors[status]}`,
      padding: '30px 40px',
    }}>
      <div style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        fontWeight: 900,
        fontSize: '2rem',
        color: '#fff',
        transform: 'scaleY(0.75) scaleX(0.9)',
        transformOrigin: 'left',
      }}>
        {label}<span style={{ color: statusColors[status] }}>.{number}</span>
      </div>
      {title && (
        <p style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '10px',
        }}>
          {title}
        </p>
      )}
    </div>
  );
}
```

### 3. Status Row（狀態列）

簡潔的 label + value 格式。

```tsx
function StatusRow({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colors = {
    default: '#fff',
    success: '#00FF00',
    warning: '#FFB800',
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      padding: '20px 40px',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: '0.8rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        fontWeight: 900,
        fontSize: '1.5rem',
        color: colors[variant],
        transform: 'scaleY(0.8) scaleX(0.9)',
      }}>
        {value}
      </span>
    </div>
  );
}
```

### 4. Tunnel Card（隧道卡片）

```tsx
function TunnelCard({
  id,
  name,
  port,
  url,
  status,
}: {
  id: string;
  name: string;
  port: number;
  url?: string;
  status: 'connected' | 'disconnected' | 'idle';
}) {
  const statusColors = {
    connected: '#00FF00',
    disconnected: '#FF0000',
    idle: '#FFB800',
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      borderLeft: `4px solid ${statusColors[status]}`,
      padding: '30px 40px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            fontSize: '2rem',
            color: '#fff',
            transform: 'scaleY(0.75) scaleX(0.9)',
            transformOrigin: 'left',
          }}>
            UNIT-{id}
          </div>
          <div style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '10px',
          }}>
            {name}
          </div>
        </div>
        <span style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: statusColors[status],
          padding: '4px 12px',
          border: `1px solid ${statusColors[status]}`,
          textShadow: `0 0 10px ${statusColors[status]}`,
          alignSelf: 'flex-start',
        }}>
          {status}
        </span>
      </div>
      <div style={{
        marginTop: '20px',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.8)',
      }}>
        <div>localhost:{port}</div>
        {url && (
          <div style={{ color: statusColors[status], marginTop: '5px' }}>
            → {url}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Navigation（導航）

```tsx
function EvaNav({
  items,
  active,
  onSelect,
}: {
  items: string[];
  active: string;
  onSelect: (item: string) => void;
}) {
  return (
    <nav style={{
      backgroundColor: '#111',
      display: 'flex',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
    }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          style={{
            flex: 1,
            padding: '20px',
            backgroundColor: active === item ? '#fff' : 'transparent',
            color: active === item ? '#000' : '#fff',
            border: 'none',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
```

### 6. Terminal Output（終端輸出）

```tsx
<div style={{
  backgroundColor: '#0a0a0a',
  padding: '40px',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  color: '#00FF00',
  lineHeight: 1.8,
  textShadow: '0 0 10px rgba(0,255,0,0.3)',
}}>
  <div style={{ color: 'rgba(255,255,255,0.5)' }}># NOVERLINK SYSTEM v1.0.0</div>
  <div>&gt; Initializing...</div>
  <div>&gt; Connection established</div>
  <div>&gt; Tunnel: api-gateway → api.noverlink.com</div>
  <div>&gt; Status: <span style={{ color: '#00FF00' }}>READY</span></div>
</div>
```

---

## Effects & Overlays

### Film Grain

輕微的噪點效果，增加膠片質感。

```tsx
function GrainOverlay() {
  return (
    <div style={{
      position: 'fixed',
      inset: '-50%',
      width: '200%',
      height: '200%',
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: 0.08,
      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      animation: 'grain 0.5s steps(10) infinite',
    }} />
  );
}
```

### Grain Animation

```css
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}
```

### Status Glow

狀態顏色帶有發光效果。

```css
.status-connected {
  color: #00FF00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.status-warning {
  color: #FFB800;
  text-shadow: 0 0 10px rgba(255, 184, 0, 0.5);
}

.status-error {
  color: #FF0000;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}
```

---

## Animation Guidelines

### 使用原則

EVA 風格的動畫應該**克制且有目的**。

| 場景 | 動畫 | 說明 |
|------|------|------|
| 標題出現 | ✅ | 淡入 + 壓縮變形 |
| 狀態切換 | ✅ | 快速淡入 (200ms) |
| 導航切換 | ✅ | 背景色過渡 |
| 背景效果 | ✅ | 顆粒移動（微妙） |
| 複雜動畫 | ❌ | 避免花俏的載入動畫 |

### Title Reveal Animation

```css
@keyframes title-reveal {
  0% {
    opacity: 0;
    transform: scaleY(0.7) scaleX(0.85);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: scaleY(0.7) scaleX(0.85);
  }
}

.eva-title {
  animation: title-reveal 0.8s ease-out forwards;
}
```

### Subtitle Reveal

```css
@keyframes subtitle-reveal {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.eva-subtitle {
  opacity: 0;
  animation: subtitle-reveal 0.5s ease-out 0.5s forwards;
}
```

---

## Do's and Don'ts

### ✅ DO

1. **使用壓縮變形** — `scaleY(0.7) scaleX(0.85)` 是核心
2. **大量留白** — 讓標題有呼吸空間
3. **深灰背景** — `#0a0a0a` 而非純黑，更舒適
4. **狀態發光** — 彩色只用於狀態，且帶發光
5. **寬字距 UI 文字** — `letter-spacing: 0.2em`
6. **集數格式** — `TUNNEL.01` 這種命名
7. **極簡構圖** — 一個畫面一個重點
8. **等寬字體顯示技術數據** — ports, URLs, IPs

### ❌ DON'T

1. **避免純黑背景** — 太刺眼，用 `#0a0a0a`
2. **避免過多顏色** — 只有狀態用彩色
3. **避免細字體** — 標題要 900 weight
4. **避免沒有壓縮的標題** — 失去 EVA 感
5. **避免複雜佈局** — 保持極簡
6. **避免圓角** — 幾乎不用，頂多輕微
7. **避免過強的 grain** — opacity 控制在 0.08
8. **避免 colorful UI** — 這不是 PostHog

---

## Quick Reference

### 顏色速查

| 用途 | Value |
|------|-------|
| 頁面背景 | `#0a0a0a` |
| 提升背景 | `#111111` |
| 主要文字 | `#FFFFFF` |
| 次要文字 | `rgba(255,255,255,0.8)` |
| 標籤文字 | `rgba(255,255,255,0.6)` |
| 提示文字 | `rgba(255,255,255,0.4)` |
| 分隔線 | `rgba(255,255,255,0.15)` |
| 成功/連線 | `#00FF00` |
| 警告/閒置 | `#FFB800` |
| 錯誤/斷線 | `#FF0000` |

### 壓縮速查

| 元素 | Transform |
|------|-----------|
| 大標題 | `scaleY(0.7) scaleX(0.85)` |
| 中標題 | `scaleY(0.75) scaleX(0.9)` |
| 數值 | `scaleY(0.8) scaleX(0.9)` |
| 一般文字 | 無壓縮 |

### 字體速查

| 用途 | Font |
|------|------|
| 標題 | Times New Roman, Georgia, serif |
| UI 文字 | Helvetica Neue, Arial, sans-serif |
| 技術數據 | SF Mono, Consolas, monospace |

---

## NERV Tagline

> *God is in his heaven. All is right with the world.*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 4.0 | 2025-01-03 | Evangelion Title Card style |
| 3.0 | 2025-01-XX | PostHog-inspired redesign |
| 2.0 | 2025-01-XX | 完整重寫 |
| 1.0 | 2024-XX-XX | 初始版本 |
