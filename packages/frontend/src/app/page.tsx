'use client';

import {
  EvaFlickerOverlay,
  EvaGrainOverlay,
  GlowButton,
  TunnelConnection,
} from '@noverlink/ui-shared';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* EVA Overlays */}
      <EvaGrainOverlay />
      <EvaFlickerOverlay />

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Noverlink"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span
              className="text-lg text-white"
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontWeight: 900,
                transform: 'scaleY(0.75) scaleX(0.9)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              NOVERLINK
            </span>
          </div>
          <nav>
            <GlowButton variant="primary" asChild>
              <Link href="/login">Login</Link>
            </GlowButton>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1
          className="text-[32px] md:text-[56px] text-white mb-6 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.7) scaleX(0.85)',
            letterSpacing: '0.02em',
            textShadow: '0 0 60px rgba(255,255,255,0.1)',
          }}
        >
          EXPOSE LOCALHOST TO THE WORLD
        </h1>
        <p
          className="text-sm md:text-base text-white/50 max-w-2xl mx-auto mb-10"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.1em',
          }}
        >
          Secure tunnels for webhooks, demos, and development. Open source.
          Self-host free or let us handle it.
        </p>
        <div className="flex items-center justify-center gap-4">
          <GlowButton variant="primary" size="lg" asChild>
            <Link href="/login">Try the Sandbox</Link>
          </GlowButton>
          <GlowButton variant="secondary" size="lg" asChild>
            <a
              href="https://github.com/noverwork/noverlink"
              target="_blank"
              rel="noopener noreferrer"
            >
              Self-Host (Free)
            </a>
          </GlowButton>
        </div>

        {/* Tunnel Visualization Demo */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-[#111] border border-white/10 overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-[#0a0a0a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="w-3 h-3 bg-[#ff0000]" />
              <div className="w-3 h-3 bg-[#ffb800]" />
              <div className="w-3 h-3 bg-[#00ff00]" />
              <span className="ml-2 text-xs text-white/40 font-mono uppercase tracking-wider">
                TERMINAL
              </span>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-[13px] text-left border-b border-white/10">
              <p className="text-white/60">$ noverlink http 3000</p>
              <p className="mt-2 text-[#00ff00]">OK TUNNEL ESTABLISHED</p>
            </div>

            {/* Tunnel Visualization */}
            <div className="p-8 bg-[#0a0a0a]">
              <TunnelConnection
                localLabel="Local"
                localSublabel=":3000"
                publicLabel="Public"
                publicSublabel="myapp.noverlink.com"
                status="connected"
                tunnelName="tunnel-abc123"
                animated
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <h2
          className="text-2xl text-white text-center mb-16 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            letterSpacing: '0.03em',
          }}
        >
          WHY NOVERLINK?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="OPEN SOURCE"
            description="AGPL-3.0 licensed. Self-host on your own server for free, or use our managed service."
          />
          <FeatureCard
            title="HIGH PERFORMANCE"
            description="Rust-powered relay server for minimal latency and maximum throughput."
          />
          <FeatureCard
            title="SECURE BY DEFAULT"
            description="TLS encryption in transit. Self-host for complete data control."
          />
          <FeatureCard
            title="CUSTOM SUBDOMAINS"
            description="Reserve your subdomain. Access your tunnel at myapp.yourdomain.com."
          />
          <FeatureCard
            title="REQUEST INSPECTOR"
            description="Debug webhooks with full request/response logging and replay."
          />
          <FeatureCard
            title="REAL-TIME DASHBOARD"
            description="Monitor active tunnels, traffic, and usage from a modern web UI."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-24">
        <h2
          className="text-2xl text-white text-center mb-4 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            letterSpacing: '0.03em',
          }}
        >
          SIMPLE PRICING
        </h2>
        <p
          className="text-xs text-white/40 text-center mb-16"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Self-host for free, or let us handle the infrastructure
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <PricingCard
            plan="SELF-HOSTED"
            price="$0"
            features={[
              'Unlimited everything',
              'Full data control',
              'Your own infrastructure',
              'Community support',
            ]}
            cta={{
              label: 'View on GitHub',
              href: 'https://github.com/noverwork/noverlink',
            }}
          />
          <PricingCard
            plan="SANDBOX"
            price="$0"
            features={[
              '1 tunnel',
              '1 GB bandwidth/mo',
              '1hr session limit',
              'Random subdomain',
            ]}
            cta={{ label: 'Try Now', href: '/login' }}
            subdued
          />
          <PricingCard
            plan="STARTER"
            price="$12"
            features={[
              '3 concurrent tunnels',
              '30 GB bandwidth/mo',
              'Reserved subdomains',
              'No session limit',
            ]}
            highlighted
            cta={{ label: 'Get Started', href: '/login' }}
          />
          <PricingCard
            plan="PRO"
            price="$29"
            features={[
              'Unlimited tunnels',
              '100 GB bandwidth/mo',
              'Custom domains (coming soon)',
              'IP allowlist (coming soon)',
            ]}
            cta={{ label: 'Get Started', href: '/login' }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2
          className="text-2xl text-white mb-6 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            letterSpacing: '0.03em',
          }}
        >
          READY TO GET STARTED?
        </h2>
        <p
          className="text-xs text-white/40 mb-8"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Create your first tunnel in under 30 seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <GlowButton variant="primary" size="lg" asChild>
            <Link href="/login">Try the Sandbox</Link>
          </GlowButton>
          <GlowButton variant="secondary" size="lg" asChild>
            <a
              href="https://github.com/noverwork/noverlink"
              target="_blank"
              rel="noopener noreferrer"
            >
              Self-Host (Free)
            </a>
          </GlowButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <p
            className="text-[0.65rem] text-white/30"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            2024 NOVERLINK. ALL RIGHTS RESERVED.
          </p>
          <div
            className="flex items-center gap-6 text-[0.65rem] text-white/40"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            <Link href="/docs" className="hover:text-[#00ff00] transition-colors">
              Docs
            </Link>
            <Link href="/terms" className="hover:text-[#00ff00] transition-colors">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#00ff00] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 border border-white/10 bg-[#111] hover:border-[#00ff00]/30 transition-colors">
      <h3
        className="text-base text-white mb-2 uppercase"
        style={{
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 900,
          transform: 'scaleY(0.8) scaleX(0.9)',
          transformOrigin: 'left',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </h3>
      <p
        className="text-xs text-white/50"
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          letterSpacing: '0.05em',
        }}
      >
        {description}
      </p>
    </div>
  );
}

function getCardClassName(
  comingSoon?: boolean,
  highlighted?: boolean,
  subdued?: boolean
): string {
  if (comingSoon) {
    return 'border-white/10 bg-[#111] opacity-60';
  }
  if (subdued) {
    return 'border-white/5 bg-[#0a0a0a] hover:border-white/10';
  }
  if (highlighted) {
    return 'border-[#00ff00]/30 bg-[#00ff00]/5 hover:border-[#00ff00]/50 shadow-[0_0_20px_rgba(0,255,0,0.1)]';
  }
  return 'border-white/10 bg-[#111] hover:border-white/20';
}

function getButtonClassName(
  highlighted?: boolean,
  comingSoon?: boolean
): string {
  if (highlighted) {
    return 'bg-[#00ff00] text-black hover:bg-[#00ff00]/80 font-mono uppercase tracking-wider';
  }
  if (comingSoon) {
    return 'bg-[#1a1a1a] text-white/30 cursor-not-allowed font-mono uppercase tracking-wider';
  }
  return 'bg-[#1a1a1a] text-white/60 hover:bg-[#222] font-mono uppercase tracking-wider';
}

function PricingCard({
  plan,
  price,
  features,
  highlighted,
  comingSoon,
  subdued,
  cta,
}: {
  plan: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
  subdued?: boolean;
  cta?: { label: string; href: string };
}) {
  const isExternal = cta?.href.startsWith('http');

  return (
    <div
      className={`p-5 border transition-colors relative flex flex-col ${getCardClassName(
        comingSoon,
        highlighted,
        subdued
      )}`}
    >
      {comingSoon && (
        <div
          className="absolute top-3 right-3 px-2 py-0.5 bg-white/10 text-[10px] text-white/50"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Coming Soon
        </div>
      )}
      <h3
        className="text-base text-white uppercase"
        style={{
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 900,
          transform: 'scaleY(0.8) scaleX(0.9)',
          transformOrigin: 'left',
          letterSpacing: '0.02em',
        }}
      >
        {plan}
      </h3>
      <p
        className="text-[32px] text-white mt-2 mb-4"
        style={{
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 900,
        }}
      >
        {price}
        {price !== '$0' && (
          <span
            className="text-sm text-white/30"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: 400,
            }}
          >
            /mo
          </span>
        )}
      </p>
      <ul className="space-y-3 flex-1">
        {features.map((feature) => (
          <li
            key={feature}
            className="text-sm text-white/50 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-[#00ff00] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-6">
          {isExternal ? (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-2 px-4 text-sm transition-colors ${getButtonClassName(
                highlighted,
                comingSoon
              )}`}
            >
              {cta.label}
            </a>
          ) : (
            <Link
              href={cta.href}
              className={`block w-full text-center py-2 px-4 text-sm transition-colors ${getButtonClassName(
                highlighted,
                comingSoon
              )}`}
            >
              {cta.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
