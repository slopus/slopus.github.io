import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'

const bricolageGrotesque = Bricolage_Grotesque({
  weight: ['400', '700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Happy.',
  alternates: {
    canonical: '/terms/',
  },
  openGraph: {
    url: '/terms/',
  },
}

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className={`${bricolageGrotesque.className} text-4xl md:text-5xl font-bold text-black mb-2`}>
            Terms of Use
          </h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose max-w-none space-y-6 text-gray-900">
          
          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using Happy, you agree to be bound by these Terms of Use. 
              If you do not agree to these terms, do not use Happy.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>About Happy</h2>
            <p>
              Happy is a free, open-source mobile client for AI code assistance, released under the MIT License. 
              The software is provided as-is by the open-source community without any warranties or guarantees.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>License</h2>
            <p>
              Happy is licensed under the MIT License. This means you are free to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Use the software for any purpose, including commercial use</li>
              <li>Modify the source code</li>
              <li>Distribute copies of the software</li>
              <li>Distribute modified versions</li>
            </ul>
            <p className="mt-3">
              The full MIT License text is available in the source code repository.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Acceptable Use</h2>
            <p>
              You agree to use Happy responsibly and in compliance with all applicable laws. You must not:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Use Happy for any illegal or unauthorized purpose</li>
              <li>Attempt to harm, disable, or impair the functionality of Happy</li>
              <li>Use Happy to generate harmful, offensive, or inappropriate content</li>
              <li>Violate the terms of service of any AI services you connect to through Happy</li>
              <li>Attempt to reverse engineer security features or encryption protocols</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Third-Party Services</h2>
            <p>
              Happy may connect to third-party AI services (such as Claude, OpenAI, etc.). You acknowledge that:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>You are responsible for complying with their terms of service</li>
              <li>You need valid API keys and accounts with these services</li>
              <li>Happy is not responsible for the availability or performance of third-party services</li>
              <li>Costs associated with API usage are your responsibility</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Independence and Disclaimers</h2>
            <p>
              <strong>Happy is an independent, community-driven project.</strong> We are not affiliated with, 
              endorsed by, or connected to Anthropic, Claude, OpenAI, or any other AI service providers. 
              Happy is a third-party client that works with publicly available APIs.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Limitation of Liability</h2>
            <p>
              <strong>IMPORTANT:</strong> Happy is provided "AS IS" without warranty of any kind. 
              The developers, contributors, and distributors of Happy shall not be liable for:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Any direct, indirect, incidental, or consequential damages</li>
              <li>Data loss, corruption, or security breaches</li>
              <li>Interruption of business or loss of profits</li>
              <li>Costs of substitute goods or services</li>
              <li>Any claims arising from your use of third-party AI services</li>
              <li>Any damages resulting from software bugs, errors, or malfunctions</li>
            </ul>
            <p className="mt-3">
              <strong>Your use of Happy is entirely at your own risk.</strong>
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Data and Privacy</h2>
            <p>
              Happy does not collect, store, or transmit any personal data or usage information. 
              All data remains on your local devices and in your direct communications with AI services. 
              See our <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Intellectual Property</h2>
            <p>
              Happy respects intellectual property rights. As an open-source project:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>The source code is available under the MIT License</li>
              <li>You retain ownership of any code or content you create using Happy</li>
              <li>You are responsible for ensuring your use complies with applicable IP laws</li>
              <li>Third-party AI services have their own intellectual property policies</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Modifications to Terms</h2>
            <p>
              These terms may be updated from time to time. Changes will be reflected in the source code repository 
              and on this website. Your continued use of Happy after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Termination</h2>
            <p>
              You may stop using Happy at any time by uninstalling the software. These terms remain in effect 
              regarding your past use of Happy and any ongoing obligations or liabilities.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              where you use the software, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Contact</h2>
            <p>
              For questions about these Terms of Use, please visit our{' '}
              <a 
                href="https://github.com/slopus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                GitHub repository
              </a>{' '}
              or open an issue in the project's issue tracker.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>Happy - Free & Open Source Mobile Client for AI Code Assistance</p>
          <p className="mt-2">MIT Licensed • Community Driven • Use at Your Own Risk</p>
        </div>
      </div>
    </main>
  )
} 
