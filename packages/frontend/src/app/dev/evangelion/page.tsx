'use client';

import { useEffect, useState } from 'react';

/**
 * Evangelion Title Card Style UI Prototype
 *
 * 真正的 EVA 標題卡風格：
 * - Matisse EB 明朝體風格（粗襯線、機械式壓縮）
 * - 純黑底白字，極簡
 * - 模糊、顆粒、銳化效果
 * - 集數標題卡格式
 * - 沒有複雜 UI，就是大字報
 */

// ============================================================================
// CSS
// ============================================================================

const cssStyles = `
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

@keyframes flicker {
  0% { opacity: 0.97; }
  5% { opacity: 0.95; }
  10% { opacity: 0.97; }
  15% { opacity: 0.94; }
  20% { opacity: 0.98; }
  50% { opacity: 0.96; }
  80% { opacity: 0.97; }
  90% { opacity: 0.94; }
  100% { opacity: 0.98; }
}

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

@keyframes subtitle-reveal {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.eva-title {
  font-family: 'Times New Roman', 'Georgia', 'Noto Serif CJK TC', 'Source Han Serif TC', serif;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transform: scaleY(0.7) scaleX(0.85);
  text-align: center;
  line-height: 1;
  animation: title-reveal 0.8s ease-out forwards;
  text-shadow: 0 0 60px rgba(255,255,255,0.2);
}

.eva-subtitle {
  font-family: 'Helvetica Neue', 'Arial', sans-serif;
  font-weight: 400;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  opacity: 0;
  animation: subtitle-reveal 0.5s ease-out 0.5s forwards;
}
`;

// ============================================================================
// COMPONENTS
// ============================================================================

/** Film grain overlay */
function GrainOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        width: '200%',
        height: '200%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.08, // 降低顆粒強度
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        animation: 'grain 0.5s steps(10) infinite',
      }}
    />
  );
}

/** Screen flicker effect - 改成更微妙的效果 */
function FlickerOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        backgroundColor: 'rgba(0,0,0,0.02)', // 幾乎透明
        animation: 'flicker 0.15s infinite',
      }}
    />
  );
}

/** EVA Title Card - the core component */
function EvaTitleCard({
  title,
  subtitle,
  number,
}: {
  title: string;
  subtitle?: string;
  number?: string;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a', // 深灰而非純黑，更舒適
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        position: 'relative',
      }}
    >
      {/* Episode number */}
      {number && (
        <div
          className="eva-subtitle"
          style={{
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            marginBottom: '30px',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          第{number}話
        </div>
      )}

      {/* Main title */}
      <h1
        className="eva-title"
        style={{
          fontSize: 'clamp(4rem, 15vw, 12rem)',
          margin: 0,
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="eva-subtitle"
          style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)',
            marginTop: '40px',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Simple text card */
function TextCard({
  children,
  size = 'large',
  compressed = true,
}: {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'huge';
  compressed?: boolean;
}) {
  const sizes = {
    small: 'clamp(1.5rem, 4vw, 3rem)',
    medium: 'clamp(2.5rem, 6vw, 5rem)',
    large: 'clamp(4rem, 10vw, 8rem)',
    huge: 'clamp(5rem, 15vw, 12rem)',
  };

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        padding: '80px 40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: "'Times New Roman', Georgia, 'Noto Serif CJK TC', serif",
          fontWeight: 900,
          fontSize: sizes[size],
          color: '#fff',
          textShadow: '0 0 40px rgba(255,255,255,0.1)', // 微光暈增加可讀性
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transform: compressed ? 'scaleY(0.7) scaleX(0.85)' : 'none',
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/** Status text in EVA style */
function StatusText({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const colors = {
    default: '#fff',
    warning: '#FFB800',
    success: '#00FF00',
  };

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)', // 提高可讀性
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 900,
          fontSize: '1.5rem',
          color: colors[variant],
          transform: 'scaleY(0.8) scaleX(0.9)',
          letterSpacing: '0.05em',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** Tunnel card in EVA style */
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
    <div
      style={{
        backgroundColor: '#0a0a0a',
        borderLeft: `4px solid ${statusColors[status]}`,
        padding: '30px 40px',
        marginBottom: '2px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
              fontSize: '2rem',
              color: '#fff',
              transform: 'scaleY(0.75) scaleX(0.9)',
              transformOrigin: 'left',
              letterSpacing: '0.02em',
            }}
          >
            UNIT-{id}
          </div>
          <div
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: '10px',
            }}
          >
            {name}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: statusColors[status],
            padding: '4px 12px',
            border: `1px solid ${statusColors[status]}`,
            textShadow: `0 0 10px ${statusColors[status]}`,
          }}
        >
          {status}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.8)',
        }}
      >
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

/** Section divider */
function Divider() {
  return (
    <div
      style={{
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        margin: '0',
      }}
    />
  );
}

/** Navigation in EVA style */
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
    <nav
      style={{
        backgroundColor: '#111',
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}
    >
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
            transition: 'all 0.2s',
          }}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EvangelionPrototypePage() {
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState('title');
  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Inject styles
    const style = document.createElement('style');
    style.innerHTML = cssStyles;
    document.head.appendChild(style);

    // Auto-hide title after 3 seconds
    const timer = setTimeout(() => {
      setShowTitle(false);
      setSection('status');
    }, 3000);

    return () => {
      document.head.removeChild(style);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      <GrainOverlay />
      <FlickerOverlay />

      {/* Opening title card */}
      {showTitle && (
        <EvaTitleCard
          number="壱"
          title="NOVERLINK"
          subtitle="Tunneling System"
        />
      )}

      {/* Main interface */}
      {!showTitle && (
        <>
          {/* Header */}
          <TextCard size="large" compressed>
            NOVERLINK
          </TextCard>

          {/* Navigation */}
          <EvaNav
            items={['status', 'tunnels', 'terminal']}
            active={section}
            onSelect={setSection}
          />

          {/* Content */}
          {section === 'status' && (
            <div>
              <TextCard size="medium">
                SYSTEM ACTIVE
              </TextCard>
              <Divider />
              <StatusText label="Active Tunnels" value="03" variant="success" />
              <StatusText label="Total Requests" value="45.2K" />
              <StatusText label="Avg Latency" value="23MS" />
              <StatusText label="Uptime" value="99.9%" variant="success" />
              <StatusText label="Error Rate" value="0.01%" />
              <Divider />
              <div style={{ padding: '60px 40px', backgroundColor: '#0a0a0a', textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    fontSize: '0.7rem',
                    letterSpacing: '0.3em',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                  }}
                >
                  All Systems Nominal
                </div>
              </div>
            </div>
          )}

          {section === 'tunnels' && (
            <div>
              <TextCard size="small">
                ACTIVE CONNECTIONS
              </TextCard>
              <Divider />
              <TunnelCard
                id="01"
                name="api-gateway"
                port={3000}
                url="api.noverlink.com"
                status="connected"
              />
              <TunnelCard
                id="02"
                name="web-server"
                port={8080}
                url="app.noverlink.com"
                status="connected"
              />
              <TunnelCard
                id="03"
                name="db-admin"
                port={5432}
                status="idle"
              />
              <TunnelCard
                id="04"
                name="staging"
                port={9000}
                status="disconnected"
              />
            </div>
          )}

          {section === 'terminal' && (
            <div>
              <TextCard size="small">
                COMMAND INTERFACE
              </TextCard>
              <Divider />
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  padding: '40px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  color: '#00FF00',
                  lineHeight: 1.8,
                  textShadow: '0 0 10px rgba(0,255,0,0.3)',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.5)' }}># NOVERLINK SYSTEM v1.0.0</div>
                <div>&gt; Initializing...</div>
                <div>&gt; Connection established</div>
                <div>&gt; Tunnel: api-gateway → api.noverlink.com</div>
                <div>&gt; Status: <span style={{ color: '#00FF00' }}>READY</span></div>
                <div style={{ marginTop: '20px' }}>
                  <span style={{ color: '#fff' }}>$</span>{' '}
                  <span style={{ opacity: 0.5 }}>_</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              backgroundColor: '#0a0a0a',
              padding: '60px 40px',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <p
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.4)',
                fontStyle: 'italic',
              }}
            >
              God is in his heaven. All is right with the world.
            </p>
            <div style={{ marginTop: '30px' }}>
              <a
                href="/dev"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  letterSpacing: '0.1em',
                  marginRight: '30px',
                }}
              >
                [OTHER STYLES]
              </a>
              <button
                onClick={() => setShowTitle(true)}
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'none',
                  border: 'none',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                [REPLAY TITLE]
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
