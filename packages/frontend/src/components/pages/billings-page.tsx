import { cn } from '../../lib/utils';
import { DashboardLayout } from '../dashboard-layout';

function getPlanBorderClass(plan: { popular?: boolean; current?: boolean }) {
  if (plan.popular) {
    return 'border-blue-500 shadow-lg';
  }
  if (plan.current) {
    return 'border-green-500';
  }
  return 'border-gray-700';
}

function getPlanButtonClass(plan: {
  current?: boolean;
  comingSoon?: boolean;
  popular?: boolean;
}) {
  if (plan.current || plan.comingSoon) {
    return 'bg-gray-700 text-gray-400 cursor-not-allowed';
  }
  if (plan.popular) {
    return 'bg-blue-600 text-white hover:bg-blue-700';
  }
  return 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600';
}

export function BillingsPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: [
        '1 concurrent tunnel',
        '1 GB bandwidth/month',
        'Basic support',
        'HTTP/HTTPS only',
      ],
      cta: 'Current Plan',
      current: true,
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      features: [
        '10 concurrent tunnels',
        '100 GB bandwidth/month',
        'Priority support',
        'HTTP/HTTPS + TCP/UDP',
        'Custom domains',
      ],
      cta: 'Upgrade to Pro',
      current: false,
      popular: true,
    },
    {
      name: 'Pro Plus',
      price: '$49',
      period: '/month',
      features: [
        'Unlimited tunnels',
        '1 TB bandwidth/month',
        '24/7 Priority support',
        'All protocols',
        'Custom domains',
        'Dedicated relay servers',
      ],
      cta: 'Coming Soon',
      current: false,
      comingSoon: true,
    },
  ];

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold text-white mb-2">
        Billing & Subscription
      </h2>
      <p className="text-gray-400 mb-8">
        Choose a plan that works for you. No hidden fees.
      </p>

      {/* Current Usage */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">Tunnels Used</div>
            <div className="text-2xl font-bold text-white">0 / 1</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Bandwidth Used</div>
            <div className="text-2xl font-bold text-white">0 / 1 GB</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Billing Period</div>
            <div className="text-2xl font-bold text-white">-</div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'bg-gray-800 rounded-lg border-2 p-6 relative',
              getPlanBorderClass(plan)
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
            )}
            {plan.comingSoon && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  COMING SOON
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-gray-400 ml-1">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={cn(
                'w-full py-2 px-4 rounded-md font-medium',
                getPlanButtonClass(plan)
              )}
              disabled={plan.current || plan.comingSoon}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Payment History
        </h3>
        <div className="text-sm text-gray-400">
          No payment history yet. Upgrade to a paid plan to see invoices here.
        </div>
      </div>
    </DashboardLayout>
  );
}
