"""Static Site Generator - Converts canvas components to deployable HTML"""
import json
from typing import Dict, List, Any, Optional
from datetime import datetime


class StaticSiteGenerator:
    """
    Generates static HTML files from Forma canvas components.

    Converts the visual builder's component tree into production-ready
    HTML with Tailwind CSS for instant deployment.
    """

    # Form handling JavaScript (injected into pages with forms)
    FORM_HANDLER_SCRIPT = '''
<script>
(function() {
  // Forma Form Handler
  const FORMA_API = '{api_url}';
  const PROJECT_ID = '{project_id}';

  document.querySelectorAll('form[data-forma-form]').forEach(function(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formSlug = form.dataset.formaForm;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending...';
      }

      try {
        const response = await fetch(FORMA_API + '/api/submit/' + PROJECT_ID + '/' + formSlug, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: data, page_url: window.location.href })
        });

        const result = await response.json();

        if (result.success) {
          // Show success message
          form.style.display = 'none';
          const successEl = document.getElementById(form.id.replace('-form', '-success'));
          if (successEl) successEl.classList.remove('hidden');

          // Redirect if specified
          if (result.redirect_url) {
            window.location.href = result.redirect_url;
          }
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('Something went wrong. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
})();
</script>'''

    # Component type to HTML template mapping
    COMPONENT_TEMPLATES = {
        'hero-centered': '''<section class="bg-gradient-to-br from-indigo-600 to-purple-700 py-20 px-8 text-center text-white">
  <h1 class="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
  <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">{subtitle}</p>
  <div class="flex gap-4 justify-center flex-wrap">
    <a href="{cta_link}" class="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition">{cta_text}</a>
    <a href="{secondary_link}" class="px-8 py-3 border border-white/50 rounded-lg hover:bg-white/10 transition">{secondary_text}</a>
  </div>
</section>''',

        'hero-split': '''<section class="bg-gray-900 py-20 px-8">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1 text-white">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
      <p class="text-gray-400 text-lg mb-8">{subtitle}</p>
      <a href="{cta_link}" class="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">{cta_text}</a>
    </div>
    <div class="flex-1">
      <img src="{image_url}" alt="{image_alt}" class="rounded-xl shadow-2xl w-full" />
    </div>
  </div>
</section>''',

        'navbar': '''<nav class="bg-white border-b border-gray-200 px-6 py-4">
  <div class="max-w-6xl mx-auto flex items-center justify-between">
    <a href="/" class="font-bold text-xl text-gray-900">{logo_text}</a>
    <div class="hidden md:flex gap-8 text-gray-600">
      {nav_links}
    </div>
    <a href="{cta_link}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">{cta_text}</a>
  </div>
</nav>''',

        'section-features': '''<section class="bg-gray-50 py-20 px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      {feature_cards}
    </div>
  </div>
</section>''',

        'section-pricing': '''<section class="bg-white py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      {pricing_cards}
    </div>
  </div>
</section>''',

        'section-testimonials': '''<section class="bg-gray-900 py-20 px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-white mb-12">{title}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      {testimonial_cards}
    </div>
  </div>
</section>''',

        'section-faq': '''<section class="bg-white py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
    <div class="space-y-4">
      {faq_items}
    </div>
  </div>
</section>''',

        'section-cta': '''<section class="bg-indigo-600 py-20 px-8 text-center">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
    <p class="text-indigo-100 text-lg mb-8">{subtitle}</p>
    <a href="{cta_link}" class="inline-block px-10 py-4 bg-white text-indigo-600 rounded-lg font-medium text-lg hover:bg-gray-100 transition">{cta_text}</a>
  </div>
</section>''',

        'footer': '''<footer class="bg-gray-900 py-16 px-8 text-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-4 gap-12 mb-12">
      <div>
        <div class="font-bold text-xl mb-4">{logo_text}</div>
        <p class="text-gray-400">{tagline}</p>
      </div>
      {footer_columns}
    </div>
    <div class="border-t border-gray-800 pt-8 text-center text-gray-500">
      <p>{copyright}</p>
    </div>
  </div>
</footer>''',

        'container': '''<div class="max-w-6xl mx-auto px-6 py-12">
  {children}
</div>''',

        'grid-2col': '''<div class="grid md:grid-cols-2 gap-8 px-6 py-12 max-w-6xl mx-auto">
  {children}
</div>''',

        'grid-3col': '''<div class="grid md:grid-cols-3 gap-8 px-6 py-12 max-w-6xl mx-auto">
  {children}
</div>''',

        'section': '''<section class="py-16 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
    <p class="text-gray-600">{content}</p>
  </div>
</section>''',

        'spacer': '''<div class="h-16"></div>''',

        'divider': '''<div class="max-w-6xl mx-auto px-6"><hr class="border-gray-200" /></div>''',

        # Dashboard components
        'sidebar': '''<aside class="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
  <div class="p-4 border-b border-gray-800">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">{logo_initial}</div>
      <span class="font-semibold">{app_name}</span>
    </div>
  </div>
  <nav class="flex-1 p-4 space-y-1">{nav_items}</nav>
</aside>''',

        'dashboard-layout': '''<div class="min-h-screen bg-gray-100">
  <header class="bg-white border-b border-gray-200 px-6 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="font-bold text-xl text-gray-900">{title}</h1>
      {header_actions}
    </div>
  </header>
  <main class="max-w-7xl mx-auto p-6">{content}</main>
</div>''',

        # Form components
        'form-contact': '''<section class="py-16 px-6 bg-gray-50">
  <div class="max-w-xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form id="contact-form" class="space-y-6" data-forma-form="{form_slug}">
      <input type="hidden" name="_honeypot" value="" />
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name <span class="text-red-500">*</span></label>
        <input type="text" name="name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Your name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address <span class="text-red-500">*</span></label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Message <span class="text-red-500">*</span></label>
        <textarea name="message" required rows="4" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-none" placeholder="Your message"></textarea>
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition flex items-center justify-center gap-2">
        {submit_text}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </button>
    </form>
    <div id="form-success" class="hidden p-8 rounded-2xl bg-green-50 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </div>
      <p class="text-lg font-medium text-green-800">{success_message}</p>
    </div>
  </div>
</section>''',

        'form-newsletter': '''<section class="py-12 px-6 bg-indigo-600">
  <div class="max-w-xl mx-auto text-center">
    <h2 class="text-2xl font-bold text-white mb-2">{title}</h2>
    <p class="text-indigo-100 mb-6">{subtitle}</p>
    <form id="newsletter-form" class="flex gap-3 max-w-md mx-auto" data-forma-form="{form_slug}">
      <input type="hidden" name="_honeypot" value="" />
      <input type="email" name="email" required class="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 outline-none" placeholder="Enter your email" />
      <button type="submit" class="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition">{submit_text}</button>
    </form>
    <div id="newsletter-success" class="hidden mt-4 text-white font-medium">{success_message}</div>
  </div>
</section>''',

        'form-login': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form id="login-form" class="bg-white p-8 rounded-2xl shadow-sm space-y-6" data-forma-form="{form_slug}">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" name="password" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Enter your password" />
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
    </form>
  </div>
</section>''',

        'form-register': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form id="register-form" class="bg-white p-8 rounded-2xl shadow-sm space-y-6" data-forma-form="{form_slug}">
      <input type="hidden" name="_honeypot" value="" />
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input type="text" name="name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Your name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" name="password" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Create a password" />
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
    </form>
  </div>
</section>''',
    }

    # Default props for components
    DEFAULT_PROPS = {
        'hero-centered': {
            'title': 'Welcome to Our Platform',
            'subtitle': 'Build something amazing with our powerful tools',
            'cta_text': 'Get Started',
            'cta_link': '#',
            'secondary_text': 'Learn More',
            'secondary_link': '#'
        },
        'hero-split': {
            'title': 'Grow Your Business',
            'subtitle': 'Everything you need to succeed online',
            'cta_text': 'Get Started',
            'cta_link': '#',
            'image_url': 'https://placehold.co/600x400',
            'image_alt': 'Hero image'
        },
        'navbar': {
            'logo_text': 'Logo',
            'nav_links': '<a href="#" class="hover:text-gray-900 transition">Home</a><a href="#" class="hover:text-gray-900 transition">Features</a><a href="#" class="hover:text-gray-900 transition">Pricing</a>',
            'cta_text': 'Sign Up',
            'cta_link': '#'
        },
        'section-features': {
            'title': 'Features',
            'feature_cards': '''
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Fast Performance</h3>
        <p class="text-gray-500">Lightning-fast load times for better user experience.</p>
      </div>
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Secure by Default</h3>
        <p class="text-gray-500">Enterprise-grade security for your peace of mind.</p>
      </div>
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Easy to Use</h3>
        <p class="text-gray-500">Intuitive interface that anyone can master.</p>
      </div>'''
        },
        'section-pricing': {
            'title': 'Pricing',
            'pricing_cards': '''
      <div class="p-8 rounded-xl border-2 border-gray-200">
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Basic</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$29<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600"><li>5 Projects</li><li>10GB Storage</li><li>Email Support</li></ul>
        <a href="#" class="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition">Choose Plan</a>
      </div>
      <div class="p-8 rounded-xl border-2 border-indigo-600 bg-indigo-50 relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-full">Popular</span>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Pro</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$59<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600"><li>Unlimited Projects</li><li>100GB Storage</li><li>Priority Support</li></ul>
        <a href="#" class="block w-full py-3 bg-indigo-600 text-white rounded-lg font-medium text-center hover:bg-indigo-700 transition">Choose Plan</a>
      </div>
      <div class="p-8 rounded-xl border-2 border-gray-200">
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Enterprise</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$99<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600"><li>Everything in Pro</li><li>1TB Storage</li><li>Dedicated Support</li></ul>
        <a href="#" class="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition">Contact Sales</a>
      </div>'''
        },
        'section-testimonials': {
            'title': 'What People Say',
            'testimonial_cards': '''
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"This product changed everything for our business."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div><div class="font-medium text-white">Sarah Johnson</div><div class="text-sm text-gray-500">CEO, TechCorp</div></div>
        </div>
      </div>
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"Incredible tool that saved us countless hours."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div><div class="font-medium text-white">Mike Chen</div><div class="text-sm text-gray-500">CTO, StartupXYZ</div></div>
        </div>
      </div>
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"Best investment we've made for productivity."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div><div class="font-medium text-white">Emily Davis</div><div class="text-sm text-gray-500">Founder, DesignCo</div></div>
        </div>
      </div>'''
        },
        'section-cta': {
            'title': 'Ready to get started?',
            'subtitle': 'Join thousands of happy customers today',
            'cta_text': 'Start Free Trial',
            'cta_link': '#'
        },
        'footer': {
            'logo_text': 'Logo',
            'tagline': 'Building the future, one step at a time.',
            'footer_columns': '''
      <div><div class="font-medium mb-4">Product</div><ul class="space-y-2 text-gray-400"><li><a href="#" class="hover:text-white transition">Features</a></li><li><a href="#" class="hover:text-white transition">Pricing</a></li></ul></div>
      <div><div class="font-medium mb-4">Company</div><ul class="space-y-2 text-gray-400"><li><a href="#" class="hover:text-white transition">About</a></li><li><a href="#" class="hover:text-white transition">Blog</a></li></ul></div>
      <div><div class="font-medium mb-4">Legal</div><ul class="space-y-2 text-gray-400"><li><a href="#" class="hover:text-white transition">Privacy</a></li><li><a href="#" class="hover:text-white transition">Terms</a></li></ul></div>''',
            'copyright': f'&copy; {datetime.now().year} Your Company. All rights reserved.'
        },
        'section': {
            'title': 'Section Title',
            'content': 'Add your content here.'
        },
        'section-faq': {
            'title': 'Frequently Asked Questions',
            'faq_items': '''
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">What is your refund policy?</summary>
        <div class="px-6 pb-4 text-gray-600">We offer a 30-day money-back guarantee.</div>
      </details>
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">How do I get started?</summary>
        <div class="px-6 pb-4 text-gray-600">Sign up and follow our quick-start guide.</div>
      </details>'''
        },
        'form-contact': {
            'title': 'Get in Touch',
            'subtitle': 'Have a question? We\'d love to hear from you.',
            'form_slug': 'contact',
            'submit_text': 'Send Message',
            'success_message': 'Thank you! Your message has been sent.'
        },
        'form-newsletter': {
            'title': 'Subscribe to our newsletter',
            'subtitle': 'Get the latest updates directly to your inbox.',
            'form_slug': 'newsletter',
            'submit_text': 'Subscribe',
            'success_message': 'Thanks for subscribing!'
        },
        'form-login': {
            'title': 'Welcome back',
            'subtitle': 'Sign in to your account',
            'form_slug': 'login',
            'submit_text': 'Sign In'
        },
        'form-register': {
            'title': 'Create an account',
            'subtitle': 'Get started for free',
            'form_slug': 'register',
            'submit_text': 'Create Account'
        }
    }

    def __init__(self, project_name: str = "My Site", project_id: str = None, api_url: str = None):
        self.project_name = project_name
        self.project_id = project_id or ""
        self.api_url = api_url or "https://api.forma.app"

    def _render_component(self, component: Dict[str, Any]) -> str:
        """Render a single component to HTML."""
        comp_type = component.get('type', '')
        props = component.get('props', {})

        # If component has custom code (AI-generated), use that
        if component.get('code'):
            return f"<!-- AI Generated: {component.get('name', comp_type)} -->\n{component['code']}"

        # Get template for this component type
        template = self.COMPONENT_TEMPLATES.get(comp_type)
        if not template:
            return f"<!-- Unknown component: {comp_type} -->"

        # Merge default props with provided props
        defaults = self.DEFAULT_PROPS.get(comp_type, {})
        merged_props = {**defaults, **props}

        # Render template with props
        try:
            return template.format(**merged_props)
        except KeyError as e:
            # If a prop is missing, try with defaults
            return template.format(**defaults)

    def _generate_nav_links(self, pages: List[Dict[str, Any]], current_slug: str) -> str:
        """Generate navigation links for multi-page sites."""
        links = []
        for page in pages:
            slug = page.get('slug', 'home')
            name = page.get('name', slug.title())
            href = '/' if slug == 'home' else f'/{slug}.html'
            active = 'text-indigo-600 font-medium' if slug == current_slug else 'text-gray-600 hover:text-gray-900'
            links.append(f'<a href="{href}" class="{active} transition">{name}</a>')
        return '\n      '.join(links)

    def generate_page(
        self,
        page: Dict[str, Any],
        all_pages: List[Dict[str, Any]] = None,
        design_system: Dict[str, Any] = None
    ) -> str:
        """
        Generate HTML for a single page.

        Args:
            page: Page data with canvas_components
            all_pages: All pages (for navigation)
            design_system: Design tokens (colors, fonts, etc.)

        Returns:
            Complete HTML document
        """
        components = page.get('canvas_components', [])
        page_name = page.get('name', 'Home')
        page_slug = page.get('slug', 'home')

        # Render all components
        components_html = []
        for component in components:
            html = self._render_component(component)
            components_html.append(html)

        body_content = '\n\n'.join(components_html)

        # Check if page has form components
        has_forms = any(
            c.get('type', '').startswith('form-')
            for c in components
        )

        # Generate form handler script if needed
        form_script = ""
        if has_forms and self.project_id:
            form_script = self.FORM_HANDLER_SCRIPT.format(
                api_url=self.api_url,
                project_id=self.project_id
            )

        # Generate HTML document
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{page_name} - {self.project_name}">
  <title>{page_name} | {self.project_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Smooth scrolling */
    html {{ scroll-behavior: smooth; }}
    /* Custom focus styles */
    :focus-visible {{ outline: 2px solid #6366f1; outline-offset: 2px; }}
  </style>
</head>
<body class="min-h-screen bg-white">
{body_content}
{form_script}
</body>
</html>'''

        return html

    def generate_site(
        self,
        pages: List[Dict[str, Any]],
        design_system: Dict[str, Any] = None
    ) -> Dict[str, bytes]:
        """
        Generate a complete static site.

        Args:
            pages: List of page data with canvas_components
            design_system: Design tokens

        Returns:
            Dict mapping file paths to file contents (bytes)
        """
        files = {}

        for page in pages:
            slug = page.get('slug', 'home')

            # Generate HTML for this page
            html = self.generate_page(page, pages, design_system)

            # Determine file path
            if slug == 'home':
                file_path = 'index.html'
            else:
                file_path = f'{slug}.html'

            files[file_path] = html.encode('utf-8')

        # Generate robots.txt
        files['robots.txt'] = b'''User-agent: *
Allow: /

Sitemap: /sitemap.xml'''

        # Generate basic sitemap
        sitemap_urls = []
        for page in pages:
            slug = page.get('slug', 'home')
            path = '/' if slug == 'home' else f'/{slug}.html'
            sitemap_urls.append(f'  <url><loc>{{base_url}}{path}</loc></url>')

        sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(sitemap_urls)}
</urlset>'''
        files['sitemap.xml'] = sitemap.encode('utf-8')

        # Generate _headers for Cloudflare Pages (security headers)
        files['_headers'] = b'''/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable'''

        # Generate _redirects for SPA-style routing (optional)
        files['_redirects'] = b'''# Redirect www to non-www
# https://www.example.com/* https://example.com/:splat 301'''

        return files


# Singleton instance
site_generator = StaticSiteGenerator()
