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

// Product IDs from Polar Dashboard - configure in environment
const POLAR_PRODUCTS = {
  hobbyist: process.env.NEXT_PUBLIC_POLAR_HOBBYIST_PRODUCT_ID || '',
  pro: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || '',
};

export function BillingsPage() {
  const plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: [
        '1 concurrent tunnel',
        '1 GB bandwidth/month',
        'Community support',
        'HTTP/HTTPS only',
      ],
      cta: 'Current Plan',
      current: true,
    },
    {
      name: 'Hobbyist',
      price: '$12',
      yearlyPrice: '$99',
      period: '/month',
      features: [
        '5 concurrent tunnels',
        '50 GB bandwidth/month',
        'Email support',
        'HTTP/HTTPS + TCP/UDP',
        'Custom subdomains',
      ],
      cta: 'Upgrade to Hobbyist',
      current: false,
      popular: true,
      productId: POLAR_PRODUCTS.hobbyist,
    },
    {
      name: 'Pro',
      price: '$39',
      yearlyPrice: '$349',
      period: '/month',
      features: [
        'Unlimited tunnels',
        '500 GB bandwidth/month',
        'Priority support',
        'All protocols',
        'Custom domains',
        'Dedicated relay servers',
        'Team features',
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
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Billing & Subscription
        </h2>
        <p className="text-slate-400 mt-1">
          Choose a plan that works for you. No hidden fees.
        </p>
      </div>

      {/* Current Usage */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Current Usage</h3>
          <PulseBadge variant="connected" appearance="pill">
            Free Plan
          </PulseBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tunnels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Tunnels Used</span>
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
              <span className="text-sm text-slate-400">Bandwidth Used</span>
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
            <span className="text-sm text-slate-400">Billing Period</span>
            <div className="text-xl font-medium text-white">
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
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Payment History</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <ReceiptIcon className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm text-slate-400">
            No payment history yet. Upgrade to a paid plan to see invoices here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const getBorderClass = () => {
    if (plan.popular) return 'border-teal-500/50';
    if (plan.current) return 'border-teal-500/30';
    return 'border-slate-800';
  };

  const getBgClass = () => {
    if (plan.popular) return 'bg-gradient-to-b from-teal-500/10 to-slate-900/50';
    return 'bg-slate-900/50';
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-6 flex flex-col h-full',
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
        <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          <span className="text-slate-400 ml-1">{plan.period}</span>
        </div>
        {plan.yearlyPrice && (
          <div className="text-sm text-slate-500 mt-1">
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
                'h-5 w-5 mr-2 flex-shrink-0',
                plan.current || plan.popular ? 'text-teal-400' : 'text-slate-500'
              )}
            />
            <span className="text-slate-300">{feature}</span>
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
