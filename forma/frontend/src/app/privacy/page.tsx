'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className={`min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black`}>
        {/* Content */}
        <section className={pageStyles.hero.wrapper}>
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
                      <li>Contact form: <Link href="/contact" className="text-violet-400 hover:text-violet-300">forma.app/contact</Link></li>
                    </ul>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  )
}
