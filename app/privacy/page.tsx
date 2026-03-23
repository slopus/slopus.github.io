import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'

const bricolageGrotesque = Bricolage_Grotesque({
  weight: ['400', '700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Happy.',
  alternates: {
    canonical: '/privacy/',
  },
  openGraph: {
    url: '/privacy/',
  },
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className={`${bricolageGrotesque.className} text-4xl md:text-5xl font-bold text-black mb-2`}>
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose max-w-none space-y-6 text-gray-900">
          
          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>About Happy</h2>
            <p>
              Happy is a free, open-source project released under the MIT License. The source code is publicly available, 
              and anyone can inspect, modify, and distribute it according to the terms of the MIT License.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Data Collection</h2>
            <p>
              <strong>We do not collect any data, telemetry, or personal information.</strong> Happy operates with complete privacy:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>No user accounts or registration required</li>
              <li>No analytics or tracking</li>
              <li>No usage statistics or telemetry</li>
              <li>No cookies or local storage for tracking purposes</li>
              <li>No server-side data storage</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>End-to-End Encryption</h2>
            <p>
              All communications between your mobile device and computer are protected by end-to-end encryption. 
              This means that your conversations and code remain private and secure, with no third parties able to intercept 
              or read your data.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Third-Party Services</h2>
            <p>
              Happy may connect to external AI services (such as Claude) based on your configuration. When using such services:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>You are subject to their respective privacy policies and terms of service</li>
              <li>Happy does not store or log your interactions with these services</li>
              <li>Your API keys and credentials are stored locally on your device</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Disclaimers</h2>
            <p>
              <strong>We are not responsible for:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Any damages, losses, or issues arising from the use of Happy</li>
              <li>The accuracy, reliability, or performance of the software</li>
              <li>Any data loss or security breaches on your local device</li>
              <li>The behavior or policies of third-party AI services you choose to use</li>
            </ul>
            
            <p className="mt-4">
              <strong>Happy is provided "AS IS" without warranty of any kind.</strong> Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Independence</h2>
            <p>
              Happy is an independent, community-driven project. <strong>We are not associated with, affiliated with, 
              or endorsed by Anthropic, Claude, or any other AI service providers.</strong> Happy is a third-party client 
              that works with various AI APIs.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Open Source Commitment</h2>
            <p>
              As an open-source project under the MIT License:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>All source code is publicly auditable</li>
              <li>You can verify our privacy practices yourself</li>
              <li>You can modify and distribute the software freely</li>
              <li>Community contributions and security reviews are welcome</li>
            </ul>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Changes to Privacy Policy</h2>
            <p>
              Since Happy is open source and collects no data, changes to this privacy policy will be reflected in the 
              source code repository. We recommend checking the repository periodically for updates.
            </p>
          </section>

          <section>
            <h2 className={`${bricolageGrotesque.className} text-2xl font-bold mb-3`}>Contact</h2>
            <p>
              For questions about this privacy policy or Happy in general, please visit our{' '}
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
          <p className="mt-2">MIT Licensed • Community Driven • Privacy First</p>
        </div>
      </div>
    </main>
  )
} 
