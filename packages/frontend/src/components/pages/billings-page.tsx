'use client';

import {
  cn,
  GlowButton,
  PulseBadge,
  SegmentedProgress,
} from '@noverlink/ui-shared';

import { DashboardLayout } from '../dashboard-layout';

interface Plan {
  name: string;
  price: string;
  yearlyPrice?: string;
  period: string;
  features: string[];
  cta: string;
  current?: boolean;
  popular?: boolean;
  productId?: string;
}

const POLAR_PRODUCTS = {
  starter: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID || '',
  pro: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || '',
};

export function BillingsPage() {
  const plans: Plan[] = [
    {
      name: 'Sandbox',
      price: '$0',
      period: '/month',
      features: [
        '1 tunnel',
        '1 GB bandwidth/mo',
        '1hr session limit',
        'Random subdomain',
      ],
      cta: 'Current Plan',
      current: true,
    },
    {
      name: 'Starter',
      price: '$12',
      period: '/month',
      features: [
        '3 concurrent tunnels',
        '30 GB bandwidth/mo',
        'No session limit',
        'Reserved subdomains',
      ],
      cta: 'Upgrade to Starter',
      current: false,
      popular: true,
      productId: POLAR_PRODUCTS.starter,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited tunnels',
        '100 GB bandwidth/mo',
        'Custom domains (coming soon)',
        'IP allowlist (coming soon)',
      ],
      cta: 'Upgrade to Pro',
      current: false,
      productId: POLAR_PRODUCTS.pro,
    },
  ];

  // Usage data (demo)
  const usage = {
    tunnels: { used: 0, max: 1 },
    bandwidth: { used: 0, max: 1024 }, // MB
    billingPeriod: null as string | null,
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2
          className="text-3xl text-white uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.7) scaleX(0.85)',
            transformOrigin: 'left',
            letterSpacing: '0.05em',
          }}
        >
          Billing & Subscription
        </h2>
        <p
          className="text-white/50 mt-2 text-xs"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Choose a plan that works for you. No hidden fees.
        </p>
      </div>

      {/* Current Usage */}
      <div className="p-6 bg-[#111] border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-xl text-white uppercase"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
              transform: 'scaleY(0.75) scaleX(0.9)',
              transformOrigin: 'left',
              letterSpacing: '0.03em',
            }}
          >
            Current Usage
          </h3>
          <PulseBadge variant="connected" appearance="pill">
            Sandbox
          </PulseBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tunnels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-[0.65rem] text-white/50"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Tunnels Used
              </span>
              <span className="text-sm font-mono text-white">
                {usage.tunnels.used} / {usage.tunnels.max}
              </span>
            </div>
            <SegmentedProgress
              value={usage.tunnels.used}
              max={usage.tunnels.max}
              segments={usage.tunnels.max}
            />
          </div>

          {/* Bandwidth */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-[0.65rem] text-white/50"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Bandwidth Used
              </span>
              <span className="text-sm font-mono text-white">
                {usage.bandwidth.used} MB / {usage.bandwidth.max / 1024} GB
              </span>
            </div>
            <SegmentedProgress
              value={usage.bandwidth.used}
              max={usage.bandwidth.max}
              segments={10}
            />
          </div>

          {/* Billing Period */}
          <div className="space-y-3">
            <span
              className="text-[0.65rem] text-white/50"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Billing Period
            </span>
            <div className="text-xl font-mono text-white">
              {usage.billingPeriod || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      {/* Payment History */}
      <div className="p-6 bg-[#111] border border-white/10 mt-8">
        <h3
          className="text-xl text-white mb-4 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            transformOrigin: 'left',
            letterSpacing: '0.03em',
          }}
        >
          Payment History
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-white/5 border border-white/10 flex items-center justify-center">
            <ReceiptIcon className="w-6 h-6 text-white/40" />
          </div>
          <p
            className="text-xs text-white/50"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.1em',
            }}
          >
            No payment history yet. Upgrade to a paid plan to see invoices here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const getBorderClass = () => {
    if (plan.popular) return 'border-[#00ff00]/50';
    if (plan.current) return 'border-[#00ff00]/30';
    return 'border-white/10';
  };

  const getBgClass = () => {
    if (plan.popular)
      return 'bg-gradient-to-b from-[#00ff00]/10 to-[#111]';
    return 'bg-[#111]';
  };

  return (
    <div
      className={cn(
        'relative border-2 p-6 flex flex-col h-full',
        getBorderClass(),
        getBgClass()
      )}
    >
      {/* Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <PulseBadge variant="connected" appearance="pill" pulse={false}>
            POPULAR
          </PulseBadge>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6 pt-2">
        <h3
          className="text-xl text-white mb-2 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            transformOrigin: 'left',
            letterSpacing: '0.03em',
          }}
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline">
          <span
            className="text-4xl text-white"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
            }}
          >
            {plan.price}
          </span>
          <span
            className="text-white/50 ml-1 text-xs"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '0.1em',
            }}
          >
            {plan.period}
          </span>
        </div>
        {plan.yearlyPrice && (
          <div className="text-sm text-white/40 mt-1">
            or {plan.yearlyPrice}/year (save ~30%)
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm">
            <CheckIcon
              className={cn(
                'h-5 w-5 mr-2 shrink-0',
                plan.current || plan.popular
                  ? 'text-[#00ff00]'
                  : 'text-white/40'
              )}
            />
            <span className="text-white/60">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <PlanCtaButton plan={plan} />
    </div>
  );
}

function PlanCtaButton({ plan }: { plan: Plan }) {
  if (plan.current) {
    return (
      <GlowButton variant="secondary" className="w-full" disabled>
        {plan.cta}
      </GlowButton>
    );
  }

  const checkoutUrl = plan.productId
    ? `/api/checkout?products=${plan.productId}`
    : '#';

  const handleClick = () => {
    window.location.href = checkoutUrl;
  };

  return (
    <GlowButton
      variant={plan.popular ? 'primary' : 'secondary'}
      className="w-full"
      onClick={handleClick}
    >
      {plan.cta}
    </GlowButton>
  );
}

// Icon components
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}
