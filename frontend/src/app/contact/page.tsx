'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Mail, MessageSquare, MapPin, Clock, Send, CheckCircle,
  Building2, Users, HelpCircle, Bug
} from 'lucide-react'

const contactReasons = [
  { id: 'general', label: 'General Inquiry', icon: MessageSquare },
  { id: 'sales', label: 'Sales / Enterprise', icon: Building2 },
  { id: 'support', label: 'Technical Support', icon: HelpCircle },
  { id: 'partnership', label: 'Partnership', icon: Users },
  { id: 'bug', label: 'Report a Bug', icon: Bug },
]

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@forma.app',
    description: 'For general inquiries',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    value: 'Available in-app',
    description: 'For quick questions',
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: '< 24 hours',
    description: 'We reply quickly',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'general',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSending(false)
    setSent(true)
  }

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
            <Link href="/contact" className="text-white font-medium">Contact</Link>
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

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Have a question, feedback, or want to learn more about FORMA?
              We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-forma-500/20 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-forma-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                <p className="text-forma-400 font-medium mb-1">{info.value}</p>
                <p className="text-sm text-white/40">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-white/60 mb-6">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setFormData({
                      name: '',
                      email: '',
                      reason: 'general',
                      subject: '',
                      message: '',
                    })
                  }}
                  className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {contactReasons.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, reason: reason.id })}
                        className={`p-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                          formData.reason === reason.id
                            ? 'bg-forma-500/20 border-forma-500 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <reason.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{reason.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white/60 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/60 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/60">
            Looking for quick answers? Check out our{' '}
            <Link href="/faq" className="text-forma-400 hover:text-forma-300 transition">
              FAQ page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-12">
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
