'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forma-950 via-forma-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-forma-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logos/forma-logo-mark.png"
              alt="FORMA - AI-Powered React App Builder"
              width={128}
              height={118}
              className="h-8 w-auto md:hidden"
            />
            <Image
              src="/logos/forma-logo-full.png"
              alt="FORMA - AI-Powered React App Builder"
              width={360}
              height={98}
              className="h-8 w-auto hidden md:block"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-white/70 hover:text-white transition">Features</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition">Pricing</Link>
            <Link href="/about" className="text-white/70 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-white/70 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/auth?mode=register"
              className="px-4 py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-white/60 mb-12">Last updated: January 2025</p>

            <div className="prose prose-invert prose-lg max-w-none">
              <div className="space-y-8 text-white/80">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                  <p>
                    FORMA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
                  </p>
                  <p>
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                  <h3 className="text-xl font-medium text-white mb-3">Personal Information</h3>
                  <p>We may collect personal information that you voluntarily provide to us when you:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Register for an account</li>
                    <li>Make a purchase or subscribe to a plan</li>
                    <li>Contact us for support</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  <p className="mt-4">This information may include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name and email address</li>
                    <li>Billing information and payment details</li>
                    <li>Profile information</li>
                    <li>Communication preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium text-white mb-3 mt-6">Automatically Collected Information</h3>
                  <p>When you access our platform, we may automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information (browser type, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send administrative information, updates, and security alerts</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Provide customer support</li>
                    <li>Send promotional communications (with your consent)</li>
                    <li>Monitor and analyze usage patterns and trends</li>
                    <li>Detect, prevent, and address technical issues</li>
                    <li>Protect against fraudulent or illegal activity</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing</h2>
                  <p>We may share your information in the following situations:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, analytics, email delivery)</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>With Your Consent:</strong> In any other cases with your explicit consent</li>
                  </ul>
                  <p className="mt-4">
                    We do not sell your personal information to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and audits</li>
                    <li>Access controls and authentication measures</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p className="mt-4">
                    However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
                  <p>Depending on your location, you may have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and receive a copy of your personal data</li>
                    <li>Rectify inaccurate personal data</li>
                    <li>Request deletion of your personal data</li>
                    <li>Object to or restrict processing of your personal data</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at privacy@forma.app.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies</h2>
                  <p>
                    We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
                  <p>
                    Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you interact with.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                  <p>
                    Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <ul className="list-none mt-4 space-y-2">
                    <li>Email: privacy@forma.app</li>
                    <li>Contact form: <Link href="/contact" className="text-forma-400 hover:text-forma-300">forma.app/contact</Link></li>
                  </ul>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logos/forma-logo-full.png"
                  alt="FORMA - AI-Powered React App Builder"
                  width={360}
                  height={98}
                  className="h-7 w-auto"
                />
              </Link>
              <p className="text-sm text-white/40">
                AI-powered React development platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} FORMA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
