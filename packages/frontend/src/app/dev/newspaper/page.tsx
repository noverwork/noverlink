'use client';

import { useEffect,useState } from 'react';

/**
 * Newspaper / Editorial Design Prototype
 *
 * Style features:
 * - Cream/off-white backgrounds like vintage newsprint
 * - Deep black text with sepia accents
 * - Bold serif typography (Georgia, Times New Roman)
 * - Multi-column layouts like broadsheet newspapers
 * - Hairline rules and ornamental dividers
 * - Drop caps for article starts
 * - Pull quotes
 * - "Breaking News" banners
 * - Classic masthead design
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const colors = {
  // Backgrounds
  paper: '#FDF5E6', // Old Lace
  paperDark: '#FAF3E0',
  paperDarker: '#F5ECD7',
  cardBg: '#FFFEF8',

  // Text
  ink: '#1a1a1a',
  inkLight: '#3d3d3d',
  inkMuted: '#6b6b6b',

  // Accents
  sepia: '#8B4513',
  sepiaLight: '#A0522D',
  burgundy: '#800020',
  gold: '#B8860B',

  // Breaking news
  breaking: '#C41E3A',
  breakingBg: '#FFF0F0',

  // Borders
  rule: '#1a1a1a',
  ruleLight: '#4a4a4a',
  ruleFaint: '#d0d0d0',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================================================
// COMPONENTS
// ============================================================================

/** Masthead - The newspaper header */
function Masthead() {
  const today = new Date();
  const editionNumber = Math.floor(
    (today.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <header className="text-center py-6 border-b-4 border-double" style={{ borderColor: colors.ink }}>
      {/* Top bar with date and edition */}
      <div
        className="flex justify-between items-center text-xs uppercase tracking-widest mb-4 px-4"
        style={{ color: colors.inkMuted, fontFamily: 'Georgia, serif' }}
      >
        <span>VOL. CXXIII No. {editionNumber}</span>
        <span>{formatDate(today)}</span>
        <span>PRICE: FREE</span>
      </div>

      {/* Decorative line */}
      <OrnamentalDivider />

      {/* Main title */}
      <h1
        className="text-6xl md:text-7xl font-black tracking-tight my-4"
        style={{
          fontFamily: 'Georgia, Times New Roman, serif',
          color: colors.ink,
          letterSpacing: '-0.02em',
        }}
      >
        THE NOVERLINK DAILY
      </h1>

      {/* Subtitle */}
      <p
        className="text-sm italic mb-4"
        style={{ fontFamily: 'Georgia, serif', color: colors.inkMuted }}
      >
        &quot;All the Tunnels That Are Fit to Print&quot;
      </p>

      {/* Decorative line */}
      <OrnamentalDivider />

      {/* Bottom bar */}
      <div
        className="flex justify-center items-center gap-8 text-xs uppercase tracking-wider mt-4"
        style={{ color: colors.inkMuted, fontFamily: 'Georgia, serif' }}
      >
        <span>FOUNDED 2024</span>
        <span>-</span>
        <span>SERVING DEVELOPERS WORLDWIDE</span>
        <span>-</span>
        <span>EVENING EDITION</span>
      </div>
    </header>
  );
}

/** Ornamental divider with decorative elements */
function OrnamentalDivider({ style = 'default' }: { style?: 'default' | 'simple' | 'fancy' }) {
  if (style === 'simple') {
    return (
      <div className="flex items-center justify-center my-4">
        <div className="h-px flex-1 max-w-16" style={{ backgroundColor: colors.ruleFaint }} />
        <span className="px-4" style={{ color: colors.inkMuted }}>
          ~
        </span>
        <div className="h-px flex-1 max-w-16" style={{ backgroundColor: colors.ruleFaint }} />
      </div>
    );
  }

  if (style === 'fancy') {
    return (
      <div className="flex items-center justify-center my-6">
        <div className="h-px flex-1 max-w-24" style={{ backgroundColor: colors.rule }} />
        <span
          className="px-4 text-lg"
          style={{ color: colors.sepia, fontFamily: 'Georgia, serif' }}
        >
          - * -
        </span>
        <div className="h-px flex-1 max-w-24" style={{ backgroundColor: colors.rule }} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="h-px flex-1 max-w-32" style={{ backgroundColor: colors.ruleFaint }} />
      <span className="px-3 text-sm" style={{ color: colors.inkMuted }}>
        * * *
      </span>
      <div className="h-px flex-1 max-w-32" style={{ backgroundColor: colors.ruleFaint }} />
    </div>
  );
}

/** Breaking News Banner */
function BreakingNewsBanner({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="py-2 px-4 text-center border-y-2"
      style={{
        backgroundColor: colors.breakingBg,
        borderColor: colors.breaking,
      }}
    >
      <span
        className="inline-block mr-3 px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
        style={{
          backgroundColor: visible ? colors.breaking : 'transparent',
          color: visible ? '#fff' : colors.breaking,
          border: `1px solid ${colors.breaking}`,
          fontFamily: 'Georgia, serif',
          transition: 'all 0.2s',
        }}
      >
        BREAKING
      </span>
      <span
        className="font-bold uppercase tracking-wide"
        style={{
          fontFamily: 'Georgia, serif',
          color: colors.breaking,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/** Section header styled like newspaper section headers */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="h-1" style={{ backgroundColor: colors.ink }} />
      <h2
        className="text-lg font-bold uppercase tracking-widest py-2"
        style={{
          fontFamily: 'Georgia, serif',
          color: colors.ink,
          borderBottom: `1px solid ${colors.ruleFaint}`,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

/** Drop cap for article starts */
function DropCap({ letter }: { letter: string }) {
  return (
    <span
      className="float-left text-6xl font-bold leading-none mr-2 mt-1"
      style={{
        fontFamily: 'Georgia, Times New Roman, serif',
        color: colors.ink,
      }}
    >
      {letter}
    </span>
  );
}

/** Pull quote component */
function PullQuote({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <blockquote className="my-6 py-4 px-6 border-y-2" style={{ borderColor: colors.ink }}>
      <p
        className="text-2xl italic text-center leading-relaxed"
        style={{ fontFamily: 'Georgia, serif', color: colors.ink }}
      >
        &ldquo;{children}&rdquo;
      </p>
      {attribution && (
        <footer
          className="text-sm text-center mt-3 uppercase tracking-wider"
          style={{ color: colors.inkMuted }}
        >
          - {attribution}
        </footer>
      )}
    </blockquote>
  );
}

/** Headline article - the main featured story */
function HeadlineArticle({
  headline,
  subheadline,
  byline,
  date,
  content,
  imageCaption,
}: {
  headline: string;
  subheadline?: string;
  byline: string;
  date: string;
  content: string;
  imageCaption?: string;
}) {
  const firstLetter = content.charAt(0);
  const restOfContent = content.slice(1);

  return (
    <article className="mb-8">
      {/* Headline */}
      <h1
        className="text-4xl md:text-5xl font-bold leading-tight mb-3"
        style={{
          fontFamily: 'Georgia, Times New Roman, serif',
          color: colors.ink,
        }}
      >
        {headline}
      </h1>

      {/* Subheadline */}
      {subheadline && (
        <h2
          className="text-xl italic mb-4"
          style={{
            fontFamily: 'Georgia, serif',
            color: colors.inkLight,
          }}
        >
          {subheadline}
        </h2>
      )}

      {/* Byline */}
      <div
        className="flex items-center gap-2 text-sm mb-4 pb-3 border-b"
        style={{
          fontFamily: 'Georgia, serif',
          borderColor: colors.ruleFaint,
        }}
      >
        <span className="uppercase tracking-wider" style={{ color: colors.inkMuted }}>
          By
        </span>
        <span className="font-semibold" style={{ color: colors.ink }}>
          {byline}
        </span>
        <span style={{ color: colors.inkMuted }}>|</span>
        <span className="italic" style={{ color: colors.inkMuted }}>
          {date}
        </span>
      </div>

      {/* Image placeholder */}
      <div
        className="mb-4 p-8 text-center border"
        style={{
          backgroundColor: colors.paperDarker,
          borderColor: colors.ruleFaint,
        }}
      >
        <div
          className="text-6xl mb-2"
          style={{ filter: 'grayscale(100%)', opacity: 0.7 }}
        >
          &lt;&gt;
        </div>
        {imageCaption && (
          <p
            className="text-xs italic mt-2"
            style={{ fontFamily: 'Georgia, serif', color: colors.inkMuted }}
          >
            {imageCaption}
          </p>
        )}
      </div>

      {/* Content with drop cap */}
      <div
        className="text-lg leading-relaxed text-justify"
        style={{ fontFamily: 'Georgia, serif', color: colors.ink }}
      >
        <DropCap letter={firstLetter} />
        <p>{restOfContent}</p>
      </div>
    </article>
  );
}

/** Article card for smaller stories */
function ArticleCard({
  headline,
  summary,
  byline,
  category,
}: {
  headline: string;
  summary: string;
  byline?: string;
  category?: string;
}) {
  return (
    <article className="mb-6 pb-6 border-b" style={{ borderColor: colors.ruleFaint }}>
      {category && (
        <span
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: colors.sepia }}
        >
          {category}
        </span>
      )}
      <h3
        className="text-xl font-bold leading-tight mt-1 mb-2"
        style={{
          fontFamily: 'Georgia, Times New Roman, serif',
          color: colors.ink,
        }}
      >
        {headline}
      </h3>
      <p
        className="text-sm leading-relaxed mb-2"
        style={{ fontFamily: 'Georgia, serif', color: colors.inkLight }}
      >
        {summary}
      </p>
      {byline && (
        <span
          className="text-xs italic"
          style={{ color: colors.inkMuted }}
        >
          By {byline}
        </span>
      )}
    </article>
  );
}

/** Tunnel status presented as a news story */
function TunnelStatusArticle({
  name,
  status,
  localPort,
  publicUrl,
  requests,
  latency,
}: {
  name: string;
  status: 'online' | 'offline' | 'warning';
  localPort: number;
  publicUrl?: string;
  requests: string;
  latency: string;
}) {
  const statusText = {
    online: 'OPERATIONAL',
    offline: 'SUSPENDED',
    warning: 'UNDER OBSERVATION',
  };

  const statusEmoji = {
    online: 'LIVE',
    offline: 'DOWN',
    warning: 'CAUTION',
  };

  return (
    <div
      className="p-4 mb-4 border"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.ruleFaint,
      }}
    >
      {/* Status badge */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5"
          style={{
            backgroundColor:
              // eslint-disable-next-line sonarjs/no-nested-conditional -- Status color mapping
              status === 'online' ? colors.ink : status === 'warning' ? colors.gold : colors.burgundy,
            color: '#fff',
          }}
        >
          {statusEmoji[status]}
        </span>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color: colors.inkMuted }}
        >
          TUNNEL REPORT
        </span>
      </div>

      {/* Headline */}
      <h4
        className="text-lg font-bold mb-2"
        style={{ fontFamily: 'Georgia, serif', color: colors.ink }}
      >
        {name.toUpperCase()} — {statusText[status]}
      </h4>

      {/* Details */}
      <div
        className="grid grid-cols-2 gap-2 text-sm border-t pt-2 mt-2"
        style={{
          fontFamily: 'Georgia, serif',
          borderColor: colors.ruleFaint,
        }}
      >
        <div>
          <span style={{ color: colors.inkMuted }}>Local Port:</span>{' '}
          <span className="font-mono" style={{ color: colors.ink }}>
            {localPort}
          </span>
        </div>
        <div>
          <span style={{ color: colors.inkMuted }}>Requests:</span>{' '}
          <span style={{ color: colors.ink }}>{requests}</span>
        </div>
        {publicUrl && (
          <div className="col-span-2">
            <span style={{ color: colors.inkMuted }}>Public Address:</span>{' '}
            <span className="font-mono text-xs" style={{ color: colors.sepia }}>
              {publicUrl}
            </span>
          </div>
        )}
        <div>
          <span style={{ color: colors.inkMuted }}>Latency:</span>{' '}
          <span style={{ color: colors.ink }}>{latency}</span>
        </div>
      </div>
    </div>
  );
}

/** Market data style metrics sidebar */
function MetricsSidebar({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; change?: string }>;
}) {
  return (
    <div
      className="border p-4"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.ink,
      }}
    >
      <h3
        className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b"
        style={{
          fontFamily: 'Georgia, serif',
          color: colors.ink,
          borderColor: colors.ruleFaint,
        }}
      >
        MARKET DATA
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="flex justify-between items-baseline text-sm border-b pb-2"
            style={{
              fontFamily: 'Georgia, serif',
              borderColor: colors.ruleFaint,
            }}
          >
            <span style={{ color: colors.inkMuted }}>{metric.label}</span>
            <div className="text-right">
              <span className="font-bold" style={{ color: colors.ink }}>
                {metric.value}
              </span>
              {metric.change && (
                <span
                  className="text-xs ml-2"
                  style={{
                    color: metric.change.startsWith('+') ? '#228B22' : colors.burgundy,
                  }}
                >
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Classified ad style component */
function ClassifiedAd({
  title,
  content,
  contact,
}: {
  title: string;
  content: string;
  contact?: string;
}) {
  return (
    <div
      className="p-3 mb-3 border text-sm"
      style={{
        backgroundColor: colors.paperDark,
        borderColor: colors.ruleFaint,
        fontFamily: 'Georgia, serif',
      }}
    >
      <h4
        className="font-bold uppercase text-xs tracking-wider mb-1"
        style={{ color: colors.ink }}
      >
        {title}
      </h4>
      <p className="leading-snug" style={{ color: colors.inkLight }}>
        {content}
      </p>
      {contact && (
        <p
          className="text-xs italic mt-2"
          style={{ color: colors.sepia }}
        >
          {contact}
        </p>
      )}
    </div>
  );
}

/** Weather box style status overview */
function WeatherBox({
  status,
  description,
  details,
}: {
  status: string;
  description: string;
  details: Array<{ label: string; value: string }>;
}) {
  return (
    <div
      className="border p-4 text-center"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.ink,
      }}
    >
      <h3
        className="text-sm font-bold uppercase tracking-widest mb-2"
        style={{
          fontFamily: 'Georgia, serif',
          color: colors.ink,
        }}
      >
        SYSTEM FORECAST
      </h3>

      {/* Main status */}
      <div
        className="text-3xl font-bold my-3"
        style={{
          fontFamily: 'Georgia, serif',
          color: colors.ink,
        }}
      >
        {status}
      </div>
      <p
        className="text-sm italic mb-4"
        style={{ color: colors.inkMuted }}
      >
        {description}
      </p>

      {/* Details grid */}
      <div
        className="grid grid-cols-2 gap-2 text-xs border-t pt-3"
        style={{ borderColor: colors.ruleFaint }}
      >
        {details.map((detail, i) => (
          <div key={i}>
            <div style={{ color: colors.inkMuted }}>{detail.label}</div>
            <div className="font-semibold" style={{ color: colors.ink }}>
              {detail.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Footer with edition info */
function NewspaperFooter() {
  return (
    <footer
      className="mt-12 pt-6 border-t-4 border-double text-center"
      style={{ borderColor: colors.ink }}
    >
      <OrnamentalDivider style="fancy" />

      <p
        className="text-sm italic mb-4"
        style={{ fontFamily: 'Georgia, serif', color: colors.inkMuted }}
      >
        &quot;The truth shall set your packets free&quot;
      </p>

      <div
        className="text-xs uppercase tracking-widest space-x-4"
        style={{ color: colors.inkMuted }}
      >
        <a href="/dev" className="hover:underline">
          MODERN EDITION
        </a>
        <span>|</span>
        <a href="/dev/blueprint" className="hover:underline">
          BLUEPRINT EDITION
        </a>
        <span>|</span>
        <a href="/dev/anti-design" className="hover:underline">
          CHAOS EDITION
        </a>
      </div>

      <p
        className="text-xs mt-6"
        style={{ fontFamily: 'Georgia, serif', color: colors.inkMuted }}
      >
        Copyright MMXXIV The Noverlink Daily. All Rights Reserved.
      </p>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function NewspaperPrototypePage() {
  const currentTime = formatTime(new Date());

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.paper }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Masthead */}
        <Masthead />

        {/* Breaking News */}
        <div className="mt-4">
          <BreakingNewsBanner>
            TUNNEL TRAFFIC REACHES ALL-TIME HIGH - 1 MILLION REQUESTS SERVED TODAY
          </BreakingNewsBanner>
        </div>

        {/* Main content grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main column - 8 cols */}
          <main className="lg:col-span-8">
            {/* Lead story */}
            <HeadlineArticle
              headline="LOCAL PORT 3000 NOW ACCESSIBLE TO THE WORLD"
              subheadline="Revolutionary tunneling technology bridges the gap between development and deployment"
              byline="STAFF CORRESPONDENT"
              date={formatDate(new Date())}
              content="In a development that promises to transform the landscape of local development, Noverlink has successfully established a secure tunnel connecting localhost to the global internet. The achievement, hailed by developers worldwide, represents a significant milestone in the ongoing effort to streamline the development workflow."
              imageCaption="An artist's rendition of data packets traversing the secure tunnel infrastructure"
            />

            <PullQuote attribution="A Satisfied Developer">
              Finally, I can share my local work without deploying to staging servers.
              This changes everything.
            </PullQuote>

            {/* Secondary articles in columns */}
            <div className="mt-8">
              <SectionHeader>LATEST DISPATCHES</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <ArticleCard
                  category="INFRASTRUCTURE"
                  headline="Relay Servers Report Record Uptime"
                  summary="The backbone of the Noverlink network continues its streak of 99.9% availability, officials report with satisfaction."
                  byline="Tech Desk"
                />
                <ArticleCard
                  category="SECURITY"
                  headline="End-to-End Encryption Standard Adopted"
                  summary="All tunnel traffic now protected by military-grade encryption protocols, ensuring peace of mind for developers."
                  byline="Security Correspondent"
                />
                <ArticleCard
                  category="BUSINESS"
                  headline="Free Tier Remains Commitment"
                  summary="Company executives reaffirm dedication to generous free tier, bucking industry trend of restrictive pricing."
                  byline="Business Desk"
                />
                <ArticleCard
                  category="COMMUNITY"
                  headline="Developer Survey Shows High Satisfaction"
                  summary="Nine in ten users report improved productivity after adopting Noverlink for their webhook testing needs."
                  byline="Community Editor"
                />
              </div>
            </div>

            {/* Tunnel Reports Section */}
            <div className="mt-8">
              <SectionHeader>TUNNEL STATUS REPORTS</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TunnelStatusArticle
                  name="api-gateway"
                  status="online"
                  localPort={3000}
                  publicUrl="api.noverlink.com"
                  requests="12.4k"
                  latency="23ms"
                />
                <TunnelStatusArticle
                  name="web-server"
                  status="online"
                  localPort={8080}
                  publicUrl="app.noverlink.com"
                  requests="8.2k"
                  latency="31ms"
                />
                <TunnelStatusArticle
                  name="db-admin"
                  status="warning"
                  localPort={5432}
                  requests="124"
                  latency="--"
                />
                <TunnelStatusArticle
                  name="staging-env"
                  status="offline"
                  localPort={9000}
                  requests="0"
                  latency="--"
                />
              </div>
            </div>
          </main>

          {/* Sidebar - 4 cols */}
          <aside className="lg:col-span-4">
            {/* Weather/Status Box */}
            <WeatherBox
              status="CLEAR SKIES"
              description="All systems nominal. Expect smooth sailing."
              details={[
                { label: 'Active Tunnels', value: '3' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Avg Latency', value: '23ms' },
                { label: 'Daily Peak', value: '2.4k/min' },
              ]}
            />

            {/* Market Data */}
            <div className="mt-6">
              <MetricsSidebar
                metrics={[
                  { label: 'Total Requests', value: '45.2k', change: '+12%' },
                  { label: 'Bandwidth Used', value: '12.4 GB', change: '+8%' },
                  { label: 'Active Sessions', value: '847', change: '+3%' },
                  { label: 'Avg Response', value: '23ms', change: '-5%' },
                  { label: 'Error Rate', value: '0.01%', change: '-15%' },
                ]}
              />
            </div>

            {/* Classifieds */}
            <div className="mt-6">
              <SectionHeader>NOTICES & CLASSIFIEDS</SectionHeader>
              <ClassifiedAd
                title="WEBHOOK TESTING"
                content="Need to test webhooks locally? Noverlink provides instant public URLs. No signup required for basic usage."
                contact="Visit noverlink.com"
              />
              <ClassifiedAd
                title="CUSTOM DOMAINS"
                content="Premium subscribers enjoy custom subdomain support. Make your tunnels professional and memorable."
                contact="Upgrade at noverlink.com/pricing"
              />
              <ClassifiedAd
                title="CLI AVAILABLE"
                content="Command-line enthusiasts rejoice! The noverlink CLI tool supports all major platforms. Rust-powered for speed."
                contact="cargo install noverlink"
              />
              <ClassifiedAd
                title="HELP WANTED"
                content="Seeking experienced tunnel operators for high-traffic deployments. Must enjoy the thrill of packet forwarding."
              />
            </div>

            {/* Quick Links styled as table of contents */}
            <div
              className="mt-6 p-4 border"
              style={{ borderColor: colors.ink }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-3"
                style={{ fontFamily: 'Georgia, serif', color: colors.ink }}
              >
                TODAY&rsquo;S INDEX
              </h3>
              <ul
                className="space-y-2 text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {[
                  { section: 'Front Page', page: 'A1' },
                  { section: 'Tunnel Reports', page: 'A3' },
                  { section: 'Market Data', page: 'B1' },
                  { section: 'Classifieds', page: 'C4' },
                  { section: 'Editorial', page: 'D1' },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b border-dotted pb-1"
                    style={{ borderColor: colors.ruleFaint }}
                  >
                    <span style={{ color: colors.inkLight }}>{item.section}</span>
                    <span style={{ color: colors.inkMuted }}>{item.page}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time stamp */}
            <div
              className="mt-6 text-center text-xs uppercase tracking-wider"
              style={{ color: colors.inkMuted }}
            >
              Last updated: {currentTime}
            </div>
          </aside>
        </div>

        {/* Footer */}
        <NewspaperFooter />
      </div>
    </div>
  );
}
