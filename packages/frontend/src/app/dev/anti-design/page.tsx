'use client';

import { useEffect,useState } from 'react';

/**
 * Anti-Design Prototype
 *
 * A deliberately ugly, chaotic design inspired by 90s GeoCities pages.
 * Features:
 * - Clashing neon colors
 * - Comic Sans and multiple conflicting fonts
 * - Marquee/scrolling text effects
 * - Rotating and blinking elements
 * - Misaligned layouts
 * - Eye-hurting gradient backgrounds
 * - Random sizes and positions
 * - Excessive borders and shadows
 */

// ============================================================================
// CSS KEYFRAMES (injected into head)
// ============================================================================

const cssAnimations = `
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes rainbow {
  0% { color: #ff0000; }
  14% { color: #ff7f00; }
  28% { color: #ffff00; }
  42% { color: #00ff00; }
  57% { color: #0000ff; }
  71% { color: #4b0082; }
  85% { color: #8f00ff; }
  100% { color: #ff0000; }
}

@keyframes rainbow-bg {
  0% { background-color: #ff0000; }
  14% { background-color: #ff7f00; }
  28% { background-color: #ffff00; }
  42% { background-color: #00ff00; }
  57% { background-color: #0000ff; }
  71% { background-color: #4b0082; }
  85% { background-color: #8f00ff; }
  100% { background-color: #ff0000; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wobble {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff; }
  50% { box-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff; }
}

@keyframes skew-jitter {
  0%, 100% { transform: skewX(0deg); }
  25% { transform: skewX(2deg); }
  75% { transform: skewX(-2deg); }
}

@keyframes color-shift {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

body {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>🔥</text></svg>") 16 0, auto;
}
`;

// ============================================================================
// DESIGN TOKENS (ugly on purpose)
// ============================================================================

const uglyColors = {
  hotPink: '#FF00FF',
  limeGreen: '#00FF00',
  electricYellow: '#FFFF00',
  cyanBlue: '#00FFFF',
  neonOrange: '#FF6600',
  acidPurple: '#9900FF',
  bloodRed: '#FF0000',
  vomitGreen: '#99FF00',
  babyBlue: '#00CCFF',
  burntOrange: '#FF9900',

  // Backgrounds
  uglyPink: '#FF69B4',
  uglyGreen: '#32CD32',
  uglyYellow: '#FFD700',

  // Text shadows
  glowPink: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF',
  glowGreen: '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00',
  glowCyan: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
};

// ============================================================================
// COMPONENTS
// ============================================================================

function useStyleInjection() {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = cssAnimations;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
}

function MarqueeText({ children, speed = 10 }: { children: React.ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div
        className="inline-block"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BlinkingText({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        animation: 'blink 0.5s step-end infinite',
        color: color || uglyColors.hotPink,
      }}
    >
      {children}
    </span>
  );
}

function RainbowText({ children, size = '2rem' }: { children: React.ReactNode; size?: string }) {
  return (
    <span
      style={{
        animation: 'rainbow 2s linear infinite',
        fontSize: size,
        fontFamily: 'Comic Sans MS, cursive',
        fontWeight: 'bold',
        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
      }}
    >
      {children}
    </span>
  );
}

function SpinningElement({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block"
      style={{ animation: 'spin 3s linear infinite' }}
    >
      {children}
    </span>
  );
}

function WobblyCard({ children, borderColor }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div
      style={{
        background: `linear-gradient(45deg, ${uglyColors.hotPink}, ${uglyColors.electricYellow}, ${uglyColors.cyanBlue})`,
        padding: '4px',
        animation: 'wobble 0.3s ease-in-out infinite',
        transform: 'rotate(-2deg)',
      }}
    >
      <div
        style={{
          backgroundColor: '#000',
          padding: '20px',
          border: `5px dashed ${borderColor || uglyColors.limeGreen}`,
          boxShadow: `10px 10px 0 ${uglyColors.acidPurple}, -5px -5px 0 ${uglyColors.neonOrange}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function UglyButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variants = {
    primary: {
      background: `linear-gradient(180deg, ${uglyColors.limeGreen} 0%, ${uglyColors.vomitGreen} 50%, ${uglyColors.limeGreen} 100%)`,
      color: '#000',
      border: `4px outset ${uglyColors.limeGreen}`,
    },
    secondary: {
      background: `linear-gradient(180deg, ${uglyColors.cyanBlue} 0%, ${uglyColors.babyBlue} 50%, ${uglyColors.cyanBlue} 100%)`,
      color: '#000',
      border: `4px outset ${uglyColors.cyanBlue}`,
    },
    danger: {
      background: `linear-gradient(180deg, ${uglyColors.bloodRed} 0%, ${uglyColors.neonOrange} 50%, ${uglyColors.bloodRed} 100%)`,
      color: '#FFF',
      border: `4px outset ${uglyColors.bloodRed}`,
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...variants[variant],
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '10px 25px',
        cursor: 'pointer',
        textShadow: variant === 'danger' ? '1px 1px 0 #000' : 'none',
        animation: 'bounce 0.5s ease-in-out infinite',
        boxShadow: '5px 5px 0 #000',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.borderStyle = 'inset';
        e.currentTarget.style.transform = 'translate(2px, 2px)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.borderStyle = 'outset';
        e.currentTarget.style.transform = 'translate(0, 0)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderStyle = 'outset';
        e.currentTarget.style.transform = 'translate(0, 0)';
      }}
    >
      {children}
    </button>
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
  const statusColors = {
    connected: uglyColors.limeGreen,
    warning: uglyColors.electricYellow,
    error: uglyColors.bloodRed,
  };

  const statusEmojis = {
    connected: '✅',
    warning: '⚠️',
    error: '💀',
  };

  // eslint-disable-next-line sonarjs/pseudo-random -- Visual effect only
  const randomRotation = Math.random() * 6 - 3;

  return (
    <div
      style={{
        backgroundColor: '#000080',
        border: `6px ridge ${statusColors[status]}`,
        padding: '15px',
        transform: `rotate(${randomRotation}deg)`,
        boxShadow: `
          inset 2px 2px 0 ${uglyColors.cyanBlue},
          inset -2px -2px 0 ${uglyColors.hotPink},
          8px 8px 0 ${uglyColors.acidPurple}
        `,
        animation: status === 'error' ? 'shake 0.3s ease-in-out infinite' : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          borderBottom: `3px dotted ${uglyColors.hotPink}`,
          paddingBottom: '10px',
        }}
      >
        <span
          style={{
            fontFamily: 'Impact, sans-serif',
            fontSize: '24px',
            color: uglyColors.electricYellow,
            textShadow: '2px 2px 0 #000',
          }}
        >
          {statusEmojis[status]} {name}
        </span>
        <span
          style={{
            fontFamily: 'Comic Sans MS, cursive',
            fontSize: '14px',
            padding: '5px 10px',
            backgroundColor: statusColors[status],
            color: '#000',
            border: '3px double #000',
            animation: status === 'connected' ? 'pulse-glow 1s infinite' : undefined,
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {/* Connection Info */}
      <div
        style={{
          fontFamily: 'Courier New, monospace',
          backgroundColor: '#000',
          padding: '10px',
          border: `2px inset ${uglyColors.limeGreen}`,
          marginBottom: '10px',
        }}
      >
        <div style={{ color: uglyColors.limeGreen }}>
          &gt;&gt; LOCAL: <span style={{ color: uglyColors.cyanBlue }}>localhost:{localPort}</span>
        </div>
        {publicUrl && (
          <div style={{ color: uglyColors.limeGreen }}>
            &gt;&gt; PUBLIC: <span style={{ color: uglyColors.hotPink }}>{publicUrl}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '5px 15px',
            backgroundColor: uglyColors.acidPurple,
            border: '3px groove gold',
          }}
        >
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '20px', color: '#FFF' }}>
            {requests}
          </div>
          <div style={{ fontFamily: 'Comic Sans MS, cursive', fontSize: '12px', color: uglyColors.electricYellow }}>
            REQUESTS
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '5px 15px',
            backgroundColor: uglyColors.neonOrange,
            border: '3px groove gold',
          }}
        >
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '20px', color: '#000' }}>
            {latency}
          </div>
          <div style={{ fontFamily: 'Comic Sans MS, cursive', fontSize: '12px', color: '#000' }}>
            LATENCY
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${uglyColors.hotPink}, ${uglyColors.acidPurple}, ${uglyColors.cyanBlue})`,
        padding: '3px',
        animation: 'skew-jitter 0.5s ease-in-out infinite',
      }}
    >
      <div
        style={{
          backgroundColor: '#2F4F4F',
          padding: '15px',
          textAlign: 'center',
          border: `4px double ${uglyColors.electricYellow}`,
        }}
      >
        <div style={{ fontSize: '30px', marginBottom: '5px' }}>{emoji}</div>
        <div
          style={{
            fontFamily: 'Impact, sans-serif',
            fontSize: '32px',
            color: uglyColors.limeGreen,
            textShadow: uglyColors.glowGreen,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: 'Comic Sans MS, cursive',
            fontSize: '14px',
            color: uglyColors.electricYellow,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: uglyColors.bloodRed,
        padding: '10px 20px',
        border: `5px outset ${uglyColors.neonOrange}`,
        marginBottom: '20px',
        transform: 'skewX(-5deg)',
      }}
    >
      <h2
        style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '28px',
          color: uglyColors.electricYellow,
          textShadow: '3px 3px 0 #000',
          margin: 0,
          transform: 'skewX(5deg)',
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function UglyInput({ placeholder, label }: { placeholder: string; label: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label
        style={{
          display: 'block',
          fontFamily: 'Comic Sans MS, cursive',
          fontSize: '16px',
          color: uglyColors.limeGreen,
          marginBottom: '5px',
          textShadow: '1px 1px 0 #000',
        }}
      >
        {label}:
      </label>
      <input
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          fontFamily: 'Courier New, monospace',
          fontSize: '16px',
          backgroundColor: '#000',
          color: uglyColors.limeGreen,
          border: `4px inset ${uglyColors.cyanBlue}`,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AntiDesignPrototypePage() {
  useStyleInjection();
  // eslint-disable-next-line sonarjs/pseudo-random -- Visual effect only
  const [visitorCount] = useState(() => Math.floor(Math.random() * 99999) + 10000);
  const [activeTab, setActiveTab] = useState<'tunnels' | 'settings'>('tunnels');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          linear-gradient(45deg,
            ${uglyColors.hotPink} 0%,
            ${uglyColors.electricYellow} 25%,
            ${uglyColors.limeGreen} 50%,
            ${uglyColors.cyanBlue} 75%,
            ${uglyColors.acidPurple} 100%
          )`,
        backgroundSize: '400% 400%',
        animation: 'color-shift 10s ease infinite',
        padding: '20px',
      }}
    >
      {/* Tiled background pattern */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF00FF' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Under Construction Banner */}
        <div
          style={{
            backgroundColor: '#FFD700',
            padding: '10px',
            textAlign: 'center',
            border: '5px dashed #000',
            marginBottom: '20px',
          }}
        >
          <MarqueeText speed={8}>
            <span style={{ fontFamily: 'Comic Sans MS, cursive', fontSize: '20px', fontWeight: 'bold' }}>
              🚧 UNDER CONSTRUCTION 🚧 WELCOME TO NOVERLINK 🚧 BEST VIEWED WITH NETSCAPE NAVIGATOR 🚧 SIGN MY GUESTBOOK 🚧
            </span>
          </MarqueeText>
        </div>

        {/* Header */}
        <header
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '30px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: `8px ridge ${uglyColors.hotPink}`,
            boxShadow: `0 0 30px ${uglyColors.hotPink}`,
          }}
        >
          {/* Spinning stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
            <SpinningElement>⭐</SpinningElement>
            <SpinningElement>🌟</SpinningElement>
            <SpinningElement>✨</SpinningElement>
            <SpinningElement>💫</SpinningElement>
            <SpinningElement>⭐</SpinningElement>
          </div>

          <h1>
            <RainbowText size="4rem">NOVERLINK</RainbowText>
          </h1>

          <p
            style={{
              fontFamily: 'Papyrus, fantasy',
              fontSize: '24px',
              color: uglyColors.cyanBlue,
              textShadow: uglyColors.glowCyan,
              margin: '10px 0',
            }}
          >
            ~*~*~ The ULTIMATE Tunneling Solution ~*~*~
          </p>

          <p
            style={{
              fontFamily: 'Comic Sans MS, cursive',
              fontSize: '16px',
              color: uglyColors.electricYellow,
            }}
          >
            <BlinkingText>NEW!</BlinkingText> Now with 100% more CHAOS! <BlinkingText>WOW!</BlinkingText>
          </p>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            {(['tunnels', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'Comic Sans MS, cursive',
                  fontSize: '18px',
                  padding: '10px 30px',
                  backgroundColor: activeTab === tab ? uglyColors.hotPink : uglyColors.limeGreen,
                  color: '#000',
                  border: `4px ${activeTab === tab ? 'inset' : 'outset'} ${activeTab === tab ? uglyColors.hotPink : uglyColors.limeGreen}`,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {tab === 'tunnels' ? '🔗 ' : '⚙️ '}{tab}
              </button>
            ))}
          </div>

          {/* Visitor Counter */}
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#000',
              display: 'inline-block',
              border: '3px solid #808080',
            }}
          >
            <span style={{ fontFamily: 'Courier New, monospace', color: '#0F0', fontSize: '14px' }}>
              You are visitor #
            </span>
            <span
              style={{
                fontFamily: 'Courier New, monospace',
                color: uglyColors.bloodRed,
                fontSize: '18px',
                padding: '0 5px',
                backgroundColor: '#000',
                border: '1px inset #666',
              }}
            >
              {visitorCount}
            </span>
          </div>
        </header>

        {/* Metrics Section */}
        <section style={{ marginBottom: '30px' }}>
          <SectionHeader>📊 SYSTEM METRICS 📊</SectionHeader>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            <MetricCard value="3" label="Active Tunnels" emoji="🚀" />
            <MetricCard value="45.2k" label="Total Requests" emoji="📨" />
            <MetricCard value="23ms" label="Avg Latency" emoji="⚡" />
            <MetricCard value="99.9%" label="Uptime" emoji="💯" />
          </div>
        </section>

        {/* Tunnels Section */}
        <section style={{ marginBottom: '30px' }}>
          <SectionHeader>🌐 YOUR TUNNELS 🌐</SectionHeader>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
            }}
          >
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

        {/* Create Tunnel Form */}
        <section style={{ marginBottom: '30px' }}>
          <SectionHeader>✨ CREATE NEW TUNNEL ✨</SectionHeader>
          <WobblyCard>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                alignItems: 'end',
              }}
            >
              <UglyInput label="🏷️ Tunnel Name" placeholder="my-awesome-tunnel" />
              <UglyInput label="🔌 Local Port" placeholder="3000" />
              <div>
                <UglyButton variant="primary">
                  🚀 CREATE TUNNEL NOW! 🚀
                </UglyButton>
              </div>
            </div>
          </WobblyCard>
        </section>

        {/* Buttons Demo */}
        <section style={{ marginBottom: '30px' }}>
          <SectionHeader>🔘 BUTTONS DEMO 🔘</SectionHeader>
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 128, 0.8)',
              padding: '30px',
              border: `6px groove ${uglyColors.electricYellow}`,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              <UglyButton variant="primary">PRIMARY</UglyButton>
              <UglyButton variant="secondary">SECONDARY</UglyButton>
              <UglyButton variant="danger">DANGER!!!</UglyButton>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <BlinkingText color={uglyColors.electricYellow}>
                *** CLICK THE BUTTONS!!! ***
              </BlinkingText>
            </div>
          </div>
        </section>

        {/* Terminal Section */}
        <section style={{ marginBottom: '30px' }}>
          <SectionHeader>💻 COMMAND LINE 💻</SectionHeader>
          <div
            style={{
              backgroundColor: '#000',
              padding: '20px',
              fontFamily: 'Courier New, monospace',
              fontSize: '14px',
              color: uglyColors.limeGreen,
              border: `4px inset ${uglyColors.limeGreen}`,
              boxShadow: `inset 0 0 20px ${uglyColors.limeGreen}`,
            }}
          >
            <pre style={{ margin: 0 }}>
{`C:\\NOVERLINK> noverlink.exe http 3000

  ███╗   ██╗ ██████╗ ██╗   ██╗███████╗██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗
  ████╗  ██║██╔═══██╗██║   ██║██╔════╝██╔══██╗██║     ██║████╗  ██║██║ ██╔╝
  ██╔██╗ ██║██║   ██║██║   ██║█████╗  ██████╔╝██║     ██║██╔██╗ ██║█████╔╝
  ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██║     ██║██║╚██╗██║██╔═██╗
  ██║ ╚████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████╗██║██║ ╚████║██║  ██╗
  ╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝

  [*] Initializing tunnel...
  [*] Connecting to relay server...
  [+] SUCCESS! Tunnel created!

  > Public URL: https://api.noverlink.com
  > Forwarding: localhost:3000

  [!] READY TO ROCK AND ROLL!!!`}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '30px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: `5px ridge ${uglyColors.acidPurple}`,
          }}
        >
          {/* Animated GIF placeholders */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <SpinningElement>🌈</SpinningElement>
            <span style={{ fontSize: '40px' }}>👷</span>
            <SpinningElement>🌈</SpinningElement>
          </div>

          <p style={{ fontFamily: 'Comic Sans MS, cursive', color: uglyColors.electricYellow, fontSize: '18px' }}>
            Made with 💖 and questionable taste
          </p>

          <div style={{ marginTop: '15px' }}>
            <MarqueeText speed={15}>
              <span style={{ fontFamily: 'Times New Roman, serif', fontSize: '14px', color: uglyColors.cyanBlue }}>
                🔥 Anti-Design Prototype v6.9.0 🔥 Best viewed at 800x600 resolution 🔥 Netscape Navigator 4.0+ 🔥
                IE 5.5 Compatible 🔥 This page is Y2K compliant 🔥 Webmaster: admin@noverlink.com 🔥
              </span>
            </MarqueeText>
          </div>

          <div style={{ marginTop: '20px' }}>
            <a
              href="/dev"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                color: uglyColors.hotPink,
                fontSize: '16px',
                textDecoration: 'underline',
                marginRight: '20px',
              }}
            >
              [Dark Theme]
            </a>
            <a
              href="/dev/posthog"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                color: uglyColors.limeGreen,
                fontSize: '16px',
                textDecoration: 'underline',
                marginRight: '20px',
              }}
            >
              [PostHog Theme]
            </a>
            <a
              href="/dev/blueprint"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                color: uglyColors.cyanBlue,
                fontSize: '16px',
                textDecoration: 'underline',
              }}
            >
              [Blueprint Theme]
            </a>
          </div>

          {/* GeoCities-style badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {['HTML', 'CSS', 'JAVASCRIPT', 'REACT', 'CHAOS'].map((badge) => (
              <span
                key={badge}
                style={{
                  padding: '5px 10px',
                  backgroundColor: uglyColors.acidPurple,
                  color: '#FFF',
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: '10px',
                  border: '2px outset #999',
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Guestbook link */}
          <div style={{ marginTop: '20px' }}>
            <BlinkingText color={uglyColors.limeGreen}>
              📝 SIGN MY GUESTBOOK! 📝
            </BlinkingText>
          </div>
        </footer>
      </div>
    </div>
  );
}
