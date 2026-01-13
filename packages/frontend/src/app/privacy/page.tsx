import { EvaFlickerOverlay, EvaGrainOverlay } from '@noverlink/ui-shared';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <EvaGrainOverlay />
      <EvaFlickerOverlay />
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="text-[#00ff00] hover:text-[#00cc00] text-sm mb-8 inline-block uppercase tracking-wider"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            &larr; Back to Home
          </Link>

          <h1
            className="text-3xl text-white mb-2 uppercase"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
              transform: 'scaleY(0.8) scaleX(0.9)',
              transformOrigin: 'left',
              letterSpacing: '0.02em',
            }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-white/50 text-sm mb-8 uppercase tracking-wider"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            Last updated: December 2025
          </p>

          <div
            className="space-y-8 text-white/80 leading-relaxed"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            {/* INTRO */}
            <section>
              <p>
                Noverlink is open source. You can inspect exactly how your data is
                handled by reviewing our{' '}
                <a
                  href="https://github.com/noverwork/noverlink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff00] hover:text-[#00cc00] underline"
                >
                  source code
                </a>
                .
              </p>
            </section>

            {/* HOSTED SERVICE SECTION */}
            <div className="p-6 rounded-xl border border-[#00ff00]/20 bg-[#00ff00]/5">
              <h2
                className="text-2xl text-[#00ff00] mb-6 uppercase"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontWeight: 900,
                  transform: 'scaleY(0.8) scaleX(0.9)',
                  transformOrigin: 'left',
                  letterSpacing: '0.02em',
                }}
              >
                Hosted Service (noverlink.com)
              </h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Account Data
                  </h3>
                  <p className="mb-3">When you create an account, we collect:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/60">
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
                  <ul className="list-disc list-inside space-y-2 text-white/60">
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
                  <ul className="list-disc list-inside space-y-2 text-white/60">
                    <li>HTTP request/response headers</li>
                    <li>
                      Request/response bodies (up to 64KB, larger truncated)
                    </li>
                    <li>Request timing and status codes</li>
                  </ul>
                  <p className="mt-3 text-white/60">
                    This data can be deleted by you at any time from the
                    dashboard.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Billing Data
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-white/60">
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
                  <ul className="list-disc list-inside space-y-2 text-white/60">
                    <li>Source IP addresses</li>
                    <li>Connection logs and timestamps</li>
                    <li>Payment and billing information</li>
                  </ul>
                  <p className="mt-3 text-white/60">
                    This data may be disclosed to law enforcement authorities upon
                    lawful request.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    What We Don&apos;t Do
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-white/60">
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
            <div className="p-6 rounded-xl border border-white/10 bg-[#111]">
              <h2
                className="text-2xl text-white/80 mb-6 uppercase"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontWeight: 900,
                  transform: 'scaleY(0.8) scaleX(0.9)',
                  transformOrigin: 'left',
                  letterSpacing: '0.02em',
                }}
              >
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
              <h2 className="text-xl font-semibold text-white mb-3 uppercase">Contact</h2>
              <p>
                Privacy questions? Open an issue on{' '}
                <a
                  href="https://github.com/noverwork/noverlink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff00] hover:text-[#00cc00] underline"
                >
                  GitHub
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/terms"
              className="text-[#00ff00] hover:text-[#00cc00] text-sm uppercase tracking-wider"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
