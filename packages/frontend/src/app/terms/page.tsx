import Link from 'next/link';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-8">
          Last updated: December 2025
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          {/* HOSTED SERVICE SECTION */}
          <div className="p-6 rounded-xl border border-teal-500/20 bg-teal-500/5">
            <h2 className="text-2xl font-bold text-teal-400 mb-6">
              Hosted Service (noverlink.com)
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Service Agreement
                </h3>
                <p>
                  By using the hosted service at noverlink.com, you agree to
                  these terms. We provide tunnel services on a subscription
                  basis with different plans (Sandbox, Starter, Pro).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Acceptable Use
                </h3>
                <p className="mb-3">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Use the service for illegal activities</li>
                  <li>Distribute malware or conduct cyber attacks</li>
                  <li>Host phishing, scam, or fraudulent content</li>
                  <li>Abuse or overload the infrastructure</li>
                  <li>Resell the service without authorization</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Termination &amp; Enforcement
                </h3>
                <p className="mb-3">
                  We reserve the right to terminate your account immediately and
                  without prior notice if we detect illegal activity or
                  violation of these terms. In such cases:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>No refund will be provided</li>
                  <li>Your data may be preserved for legal purposes</li>
                  <li>
                    We may disclose your IP address, payment information, and
                    usage logs to law enforcement authorities upon lawful
                    request
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Service Availability &amp; Liability
                </h3>
                <p>
                  We strive to provide reliable service but do not guarantee
                  100% uptime. Our total liability is limited to the amount you
                  paid for the service in the past 12 months. We are not liable
                  for indirect, incidental, special, or consequential damages,
                  including lost profits or data loss.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Refunds
                </h3>
                <p>
                  Refund requests within 7 days of purchase will be considered
                  on a case-by-case basis. No refunds for accounts terminated
                  due to policy violations.
                </p>
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
                  License
                </h3>
                <p>
                  Noverlink is free and open source software licensed under the{' '}
                  <a
                    href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    GNU Affero General Public License v3.0 (AGPL-3.0)
                  </a>
                  . You can view, modify, and distribute the source code
                  according to the license terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Warranty
                </h3>
                <p>
                  The software is provided &quot;as is&quot;, without warranty
                  of any kind, express or implied. The authors and contributors
                  are not liable for any damages arising from its use. Use at
                  your own risk.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your Responsibility
                </h3>
                <p>
                  When self-hosting, you are solely responsible for your own
                  infrastructure, security, terms of service, privacy policies,
                  and compliance with applicable laws.
                </p>
              </section>
            </div>
          </div>

          {/* CONTACT */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions? Open an issue on{' '}
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
            href="/privacy"
            className="text-teal-400 hover:text-teal-300 text-sm"
          >
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
