import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">
          Last updated: December 2025
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          {/* INTRO */}
          <section>
            <p>
              Noverlink is open source. You can inspect exactly how your data is
              handled by reviewing our{' '}
              <a
                href="https://github.com/noverwork/noverlink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 underline"
              >
                source code
              </a>
              .
            </p>
          </section>

          {/* HOSTED SERVICE SECTION */}
          <div className="p-6 rounded-xl border border-teal-500/20 bg-teal-500/5">
            <h2 className="text-2xl font-bold text-teal-400 mb-6">
              Hosted Service (noverlink.com)
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Account Data
                </h3>
                <p className="mb-3">When you create an account, we collect:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Name and email address</li>
                  <li>
                    Password (hashed with Argon2, never stored in plain text)
                  </li>
                  <li>
                    OAuth provider ID if you sign in with Google or GitHub (not
                    your OAuth tokens)
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tunnel &amp; Connection Data
                </h3>
                <p className="mb-3">When you use tunnels, we collect:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Subdomain names you create</li>
                  <li>Connection timestamps and duration</li>
                  <li>Your source IP address</li>
                  <li>CLI version</li>
                  <li>Bandwidth and request counts (for usage limits)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Traffic Data (Request Inspector)
                </h3>
                <p className="mb-3">
                  For the replay and debugging feature, we temporarily store:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>HTTP request/response headers</li>
                  <li>
                    Request/response bodies (up to 64KB, larger truncated)
                  </li>
                  <li>Request timing and status codes</li>
                </ul>
                <p className="mt-3 text-slate-400">
                  This data can be deleted by you at any time from the
                  dashboard.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Billing Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>
                    Payment is processed by Polar.sh (we never see your card
                    details)
                  </li>
                  <li>
                    We store subscription IDs and billing email to link payments
                    to your account
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Data Retention &amp; Law Enforcement
                </h3>
                <p className="mb-3">
                  For security and legal compliance, we retain the following
                  data for a minimum of 6 months:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Source IP addresses</li>
                  <li>Connection logs and timestamps</li>
                  <li>Payment and billing information</li>
                </ul>
                <p className="mt-3 text-slate-400">
                  This data may be disclosed to law enforcement authorities upon
                  lawful request.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  What We Don&apos;t Do
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Use third-party tracking or analytics</li>
                  <li>
                    Sell or share your data with third parties for marketing
                  </li>
                  <li>Store your payment card details</li>
                </ul>
              </section>
            </div>
          </div>

          {/* SELF-HOSTED SECTION */}
          <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50">
            <h2 className="text-2xl font-bold text-slate-300 mb-6">
              Self-Hosted (Open Source)
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  We Collect Nothing
                </h3>
                <p>
                  When you self-host Noverlink, we have no access to your data.
                  Your instance runs entirely on your own infrastructure.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your Responsibility
                </h3>
                <p>
                  You are solely responsible for how data is collected, stored,
                  and processed on your self-hosted instance. You should create
                  your own privacy policy for your users if applicable.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Telemetry
                </h3>
                <p>
                  The open source software does not phone home or send any data
                  to us. You can verify this by reviewing the source code.
                </p>
              </section>
            </div>
          </div>

          {/* CONTACT */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Privacy questions? Open an issue on{' '}
              <a
                href="https://github.com/noverwork/noverlink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 underline"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link
            href="/terms"
            className="text-teal-400 hover:text-teal-300 text-sm"
          >
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
