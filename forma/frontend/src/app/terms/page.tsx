'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

export default function TermsPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
              <p className="text-white/60 mb-12">Last updated: January 2025</p>

              <div className="prose prose-invert prose-lg max-w-none">
                <div className="space-y-8 text-white/80">
                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By accessing or using FORMA ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
                    </p>
                    <p>
                      These Terms apply to all visitors, users, and others who access or use the Service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                    <p>
                      FORMA is an AI-powered React development platform that allows users to create, generate, and export React components and applications. The Service includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Visual drag-and-drop builder</li>
                      <li>AI-powered component generation</li>
                      <li>Project management and collaboration tools</li>
                      <li>Code export functionality</li>
                      <li>Component marketplace</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                    <p>
                      To use certain features of the Service, you must register for an account. When you register, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and account</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized use</li>
                    </ul>
                    <p className="mt-4">
                      We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Subscriptions and Payments</h2>
                    <h3 className="text-xl font-medium text-white mb-3">Billing</h3>
                    <p>
                      Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or yearly), depending on the subscription plan you select.
                    </p>

                    <h3 className="text-xl font-medium text-white mb-3 mt-6">Free Trial</h3>
                    <p>
                      We may offer a free trial for certain subscription plans. At the end of the trial period, you will be automatically charged unless you cancel before the trial ends.
                    </p>

                    <h3 className="text-xl font-medium text-white mb-3 mt-6">Cancellation</h3>
                    <p>
                      You can cancel your subscription at any time through your account settings. Cancellation will take effect at the end of the current billing period. No refunds will be provided for partial billing periods.
                    </p>

                    <h3 className="text-xl font-medium text-white mb-3 mt-6">Refunds</h3>
                    <p>
                      We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be made within 30 days of your initial purchase.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
                    <h3 className="text-xl font-medium text-white mb-3">Your Content</h3>
                    <p>
                      You retain ownership of any content, code, or materials you create using the Service ("Your Content"). By using the Service, you grant us a limited license to host, store, and display Your Content solely for the purpose of providing the Service to you.
                    </p>

                    <h3 className="text-xl font-medium text-white mb-3 mt-6">Generated Content</h3>
                    <p>
                      Components and code generated by our AI are provided for your use. You own the output generated specifically for your projects. However, similar outputs may be generated for other users.
                    </p>

                    <h3 className="text-xl font-medium text-white mb-3 mt-6">Our Content</h3>
                    <p>
                      The Service and its original content (excluding Your Content), features, and functionality are and will remain the exclusive property of FORMA. Our trademarks and trade dress may not be used without our prior written consent.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe upon the rights of others</li>
                      <li>Transmit malicious code or interfere with the Service</li>
                      <li>Attempt to gain unauthorized access to systems or data</li>
                      <li>Use the Service for any illegal or unauthorized purpose</li>
                      <li>Generate content that is harmful, offensive, or violates third-party rights</li>
                      <li>Resell or redistribute the Service without authorization</li>
                      <li>Use automated systems to access the Service in a manner that exceeds reasonable use</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">7. Marketplace</h2>
                    <p>
                      If you sell components through our Marketplace, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Only sell content you have the right to distribute</li>
                      <li>Provide accurate descriptions of your components</li>
                      <li>Honor any warranties or support commitments you make</li>
                      <li>Comply with our Marketplace guidelines</li>
                    </ul>
                    <p className="mt-4">
                      We take a commission on Marketplace sales as specified in our Marketplace terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
                    <p>
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                    </p>
                    <p className="mt-4">
                      WE DO NOT WARRANT THE ACCURACY, COMPLETENESS, OR USEFULNESS OF AI-GENERATED CONTENT. YOU ARE RESPONSIBLE FOR REVIEWING AND TESTING ANY GENERATED CODE BEFORE USE IN PRODUCTION.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                    <p>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, FORMA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                    <p className="mt-4">
                      IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE PAST TWELVE MONTHS.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
                    <p>
                      You agree to defend, indemnify, and hold harmless FORMA and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                    <p>
                      We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                    <p className="mt-4">
                      By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
                    <p>
                      If you have any questions about these Terms, please contact us at:
                    </p>
                    <ul className="list-none mt-4 space-y-2">
                      <li>Email: legal@forma.app</li>
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
