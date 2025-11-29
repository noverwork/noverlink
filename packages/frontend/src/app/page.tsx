'use client';

import { GlowButton, TunnelConnection } from '@noverlink/ui-shared';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/8">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-lg text-white">Noverlink</span>
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
        <h1 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-white mb-6">
          Expose localhost to the world
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Secure tunnels for webhooks, demos, and development.
          A better alternative to ngrok with unlimited tunnels.
        </p>
        <div className="flex items-center justify-center gap-4">
          <GlowButton variant="primary" size="lg" asChild>
            <Link href="/login">Start for Free</Link>
          </GlowButton>
          <GlowButton variant="secondary" size="lg" asChild>
            <Link href="/docs">View Documentation</Link>
          </GlowButton>
        </div>

        {/* Tunnel Visualization Demo */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-slate-900 border border-white/8 rounded-xl overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-white/8">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-teal-400" />
              <span className="ml-2 text-xs text-slate-400">Terminal</span>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-[13px] text-left border-b border-white/8">
              <p className="text-slate-400">$ noverlink http 3000</p>
              <p className="mt-2 text-teal-400">✓ Tunnel established</p>
            </div>

            {/* Tunnel Visualization */}
            <div className="p-8 bg-slate-900/50">
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
        <h2 className="text-xl font-semibold tracking-tight text-white text-center mb-16">
          Why Noverlink?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Unlimited Tunnels"
            description="Run as many tunnels as you need. No artificial limits on your infrastructure."
          />
          <FeatureCard
            title="High Performance"
            description="Rust-powered relay server for minimal latency and maximum throughput."
          />
          <FeatureCard
            title="Secure & Private"
            description="End-to-end encryption. Your traffic stays between you and your users."
          />
          <FeatureCard
            title="Custom Subdomains"
            description="Reserve your subdomain. Access your tunnel at myapp.yourdomain.com."
          />
          <FeatureCard
            title="Request Inspector"
            description="Debug webhooks with full request/response logging and replay."
          />
          <FeatureCard
            title="Real-time Dashboard"
            description="Monitor active tunnels, traffic, and usage from a modern web UI."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-xl font-semibold tracking-tight text-white text-center mb-4">
          Simple Pricing
        </h2>
        <p className="text-sm text-slate-400 text-center mb-16">
          Start free, upgrade when you need more
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <PricingCard
            plan="Free"
            price="$0"
            features={['1 tunnel', '1 GB bandwidth/mo', 'Random subdomain']}
          />
          <PricingCard
            plan="Hobbyist"
            price="$12"
            features={['5 tunnels', '10 GB bandwidth/mo', 'Reserved subdomains', 'Request inspector']}
          />
          <PricingCard
            plan="Pro"
            price="$39"
            features={['Unlimited tunnels', '100 GB bandwidth/mo', 'Custom domains', 'Priority support']}
            comingSoon
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-white mb-6">
          Ready to get started?
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          Create your first tunnel in under 30 seconds.
        </p>
        <GlowButton variant="primary" size="lg" asChild>
          <Link href="/login">Get Started for Free</Link>
        </GlowButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            © 2024 Noverlink. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-5 rounded-xl border border-white/8 bg-slate-900 hover:border-white/15 transition-colors">
      <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function getCardClassName(comingSoon?: boolean, highlighted?: boolean): string {
  if (comingSoon) {
    return 'border-white/8 bg-slate-900/50 opacity-60';
  }
  if (highlighted) {
    return 'border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50';
  }
  return 'border-white/8 bg-slate-900 hover:border-white/15';
}

function PricingCard({
  plan,
  price,
  features,
  highlighted,
  comingSoon,
}: {
  plan: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-xl border transition-colors relative ${getCardClassName(comingSoon, highlighted)}`}
    >
      {comingSoon && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-700 text-[10px] font-medium uppercase tracking-wider text-slate-300">
          Coming Soon
        </div>
      )}
      <h3 className="text-base font-medium text-white">{plan}</h3>
      <p className="text-[32px] font-semibold text-white mt-2 mb-4">
        {price}
        <span className="text-sm font-normal text-slate-500">/mo</span>
      </p>
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="text-sm text-slate-400 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-teal-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
