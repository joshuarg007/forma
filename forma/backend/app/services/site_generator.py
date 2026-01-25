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

    # Analytics tracking script (privacy-friendly)
    ANALYTICS_SCRIPT = '''
<script>
(function() {
  // Forma Analytics - Privacy-friendly tracking
  const FORMA_API = '{api_url}';
  const PROJECT_ID = '{project_id}';

  // Get UTM params
  const urlParams = new URLSearchParams(window.location.search);
  const utm = {
    source: urlParams.get('utm_source'),
    medium: urlParams.get('utm_medium'),
    campaign: urlParams.get('utm_campaign')
  };

  // Track page view
  function trackPageView() {
    fetch(FORMA_API + '/api/track/' + PROJECT_ID + '/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        screen_width: window.screen.width
      })
    }).catch(function() {});
  }

  // Track custom events
  window.formaTrack = function(eventName, category, value, properties) {
    fetch(FORMA_API + '/api/track/' + PROJECT_ID + '/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_category: category,
        event_value: value,
        page_path: window.location.pathname,
        properties: properties
      })
    }).catch(function() {});
  };

  // Track page view on load
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // Track outbound link clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link && link.hostname !== window.location.hostname) {
      window.formaTrack('outbound_click', 'link', null, { url: link.href });
    }
  });
})();
</script>'''

    # E-commerce JavaScript (cart, checkout)
    ECOMMERCE_SCRIPT = '''
<script>
(function() {
  // Forma E-commerce Handler
  const FORMA_API = '{api_url}';
  const PROJECT_ID = '{project_id}';
  const CART_KEY = 'forma_cart_' + PROJECT_ID;

  // Cart state
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // Update cart display
  function updateCartDisplay() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    // Update mini cart
    const miniCart = document.querySelector('[data-mini-cart]');
    if (miniCart) {
      if (cart.length === 0) {
        miniCart.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
      } else {
        let total = 0;
        miniCart.innerHTML = cart.map(item => {
          total += item.price * item.quantity;
          return `
            <div class="flex items-center gap-3 py-3 border-b border-gray-100">
              ${item.image ? `<img src="${item.image}" class="w-12 h-12 object-cover rounded" />` : ''}
              <div class="flex-1">
                <div class="font-medium text-sm">${item.name}</div>
                <div class="text-gray-500 text-xs">${item.variant || ''}</div>
                <div class="text-gray-900 text-sm">$${(item.price / 100).toFixed(2)} × ${item.quantity}</div>
              </div>
              <button onclick="formaCart.remove('${item.id}')" class="text-gray-400 hover:text-red-500">×</button>
            </div>
          `;
        }).join('') + `
          <div class="pt-4 mt-2">
            <div class="flex justify-between font-semibold mb-3">
              <span>Total</span>
              <span>$${(total / 100).toFixed(2)}</span>
            </div>
            <button onclick="formaCart.checkout()" class="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Checkout</button>
          </div>
        `;
      }
    }

    // Update full cart page
    const cartPage = document.querySelector('[data-cart-page]');
    if (cartPage) {
      renderCartPage(cartPage);
    }
  }

  function renderCartPage(container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p class="text-gray-500 mb-6">Add some products to get started</p>
          <a href="/" class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Continue Shopping</a>
        </div>
      `;
      return;
    }

    let total = 0;
    container.innerHTML = `
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          ${cart.map(item => {
            total += item.price * item.quantity;
            return `
              <div class="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
                ${item.image ? `<img src="${item.image}" class="w-24 h-24 object-cover rounded-lg" />` : '<div class="w-24 h-24 bg-gray-100 rounded-lg"></div>'}
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">${item.name}</h3>
                  <p class="text-gray-500 text-sm">${item.variant || ''}</p>
                  <div class="text-indigo-600 font-medium mt-1">$${(item.price / 100).toFixed(2)}</div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <button onclick="formaCart.remove('${item.id}')" class="text-gray-400 hover:text-red-500 text-sm">Remove</button>
                  <div class="flex items-center gap-2 bg-gray-100 rounded-lg">
                    <button onclick="formaCart.updateQty('${item.id}', ${item.quantity - 1})" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg">−</button>
                    <span class="w-8 text-center">${item.quantity}</span>
                    <button onclick="formaCart.updateQty('${item.id}', ${item.quantity + 1})" class="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-r-lg">+</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span>$${(total / 100).toFixed(2)}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>$${(total / 100).toFixed(2)}</span>
            </div>
            <button onclick="formaCart.checkout()" class="w-full mt-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    `;
  }

  // Global cart API
  window.formaCart = {
    add: function(productId, name, price, quantity, variant, image) {
      const existing = cart.find(item => item.id === productId && item.variant === variant);
      if (existing) {
        existing.quantity += quantity || 1;
      } else {
        cart.push({ id: productId, name, price, quantity: quantity || 1, variant, image });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartDisplay();
      // Track event
      if (window.formaTrack) window.formaTrack('add_to_cart', 'ecommerce', price / 100, { product_id: productId });
    },

    remove: function(productId) {
      cart = cart.filter(item => item.id !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartDisplay();
    },

    updateQty: function(productId, quantity) {
      if (quantity <= 0) {
        this.remove(productId);
        return;
      }
      const item = cart.find(item => item.id === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartDisplay();
      }
    },

    clear: function() {
      cart = [];
      localStorage.removeItem(CART_KEY);
      updateCartDisplay();
    },

    getItems: function() {
      return cart;
    },

    getTotal: function() {
      return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    checkout: async function(email, name) {
      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // Prompt for email if not provided
      if (!email) {
        email = prompt('Enter your email for checkout:');
        if (!email) return;
      }

      try {
        const response = await fetch(FORMA_API + '/api/store/' + PROJECT_ID + '/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
              variant_name: item.variant
            })),
            customer_email: email,
            customer_name: name,
            success_url: window.location.origin + '/order-success',
            cancel_url: window.location.origin + '/cart'
          })
        });

        const result = await response.json();
        if (result.checkout_url) {
          // Track event
          if (window.formaTrack) window.formaTrack('begin_checkout', 'ecommerce', this.getTotal() / 100);
          // Clear cart and redirect
          this.clear();
          window.location.href = result.checkout_url;
        } else {
          throw new Error(result.detail || 'Checkout failed');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed: ' + error.message);
      }
    }
  };

  // Add to cart buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.addToCart;
      const name = this.dataset.productName;
      const price = parseInt(this.dataset.productPrice);
      const variant = this.dataset.productVariant;
      const image = this.dataset.productImage;
      window.formaCart.add(productId, name, price, 1, variant, image);
    });
  });

  // Initialize display
  updateCartDisplay();
})();
</script>'''

    # Auth JavaScript (for deployed sites with user authentication)
    AUTH_SCRIPT = '''
<script>
(function() {
  // Forma Auth Handler
  const FORMA_API = '{api_url}';
  const PROJECT_ID = '{project_id}';
  const AUTH_KEY = 'forma_auth_' + PROJECT_ID;

  // Auth state
  let authState = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

  // Update auth UI
  function updateAuthDisplay() {
    const isLoggedIn = authState && authState.access_token;

    // Show/hide auth-dependent elements
    document.querySelectorAll('[data-auth-show]').forEach(el => {
      el.style.display = isLoggedIn ? '' : 'none';
    });
    document.querySelectorAll('[data-auth-hide]').forEach(el => {
      el.style.display = isLoggedIn ? 'none' : '';
    });

    // Update user info displays
    if (isLoggedIn && authState.user) {
      document.querySelectorAll('[data-auth-name]').forEach(el => {
        el.textContent = authState.user.name || authState.user.email;
      });
      document.querySelectorAll('[data-auth-email]').forEach(el => {
        el.textContent = authState.user.email;
      });
      document.querySelectorAll('[data-auth-avatar]').forEach(el => {
        if (authState.user.avatar_url) {
          el.src = authState.user.avatar_url;
        }
      });
    }
  }

  // Check token expiration
  function isTokenExpired() {
    if (!authState || !authState.expires_at) return true;
    return new Date(authState.expires_at) < new Date();
  }

  // Get auth headers
  function getAuthHeaders() {
    if (!authState || !authState.access_token) return {};
    return { 'Authorization': 'Bearer ' + authState.access_token };
  }

  // Global auth API
  window.formaAuth = {
    isLoggedIn: function() {
      return authState && authState.access_token && !isTokenExpired();
    },

    getUser: function() {
      return authState ? authState.user : null;
    },

    getToken: function() {
      return authState ? authState.access_token : null;
    },

    register: async function(email, password, name) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Registration failed');
        }

        authState = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: new Date(Date.now() + result.expires_in * 1000).toISOString(),
          user: result.user
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
        updateAuthDisplay();

        if (window.formaTrack) window.formaTrack('sign_up', 'auth');
        return { success: true, user: result.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    login: async function(email, password) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Login failed');
        }

        authState = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: new Date(Date.now() + result.expires_in * 1000).toISOString(),
          user: result.user
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
        updateAuthDisplay();

        if (window.formaTrack) window.formaTrack('login', 'auth');
        return { success: true, user: result.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    logout: async function() {
      try {
        if (authState && authState.access_token) {
          await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/logout', {
            method: 'POST',
            headers: getAuthHeaders()
          });
        }
      } catch (e) {}

      authState = null;
      localStorage.removeItem(AUTH_KEY);
      updateAuthDisplay();

      if (window.formaTrack) window.formaTrack('logout', 'auth');
      return { success: true };
    },

    updateProfile: async function(data) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Update failed');
        }

        authState.user = result.user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
        updateAuthDisplay();

        return { success: true, user: result.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    changePassword: async function(currentPassword, newPassword) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Password change failed');
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    forgotPassword: async function(email) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    resetPassword: async function(token, newPassword) {
      try {
        const response = await fetch(FORMA_API + '/api/site-auth/' + PROJECT_ID + '/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, new_password: newPassword })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Password reset failed');
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Fetch wrapper with auth
    fetch: async function(url, options = {}) {
      options.headers = { ...options.headers, ...getAuthHeaders() };
      return fetch(url, options);
    }
  };

  // Handle login forms
  document.querySelectorAll('form[data-auth-login]').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const email = formData.get('email');
      const password = formData.get('password');
      const submitBtn = this.querySelector('button[type="submit"]');
      const errorEl = this.querySelector('[data-auth-error]');

      if (submitBtn) submitBtn.disabled = true;
      if (errorEl) errorEl.textContent = '';

      const result = await window.formaAuth.login(email, password);

      if (result.success) {
        const redirect = this.dataset.authRedirect || '/dashboard';
        window.location.href = redirect;
      } else {
        if (errorEl) errorEl.textContent = result.error;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  // Handle register forms
  document.querySelectorAll('form[data-auth-register]').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const email = formData.get('email');
      const password = formData.get('password');
      const name = formData.get('name');
      const submitBtn = this.querySelector('button[type="submit"]');
      const errorEl = this.querySelector('[data-auth-error]');

      if (submitBtn) submitBtn.disabled = true;
      if (errorEl) errorEl.textContent = '';

      const result = await window.formaAuth.register(email, password, name);

      if (result.success) {
        const redirect = this.dataset.authRedirect || '/dashboard';
        window.location.href = redirect;
      } else {
        if (errorEl) errorEl.textContent = result.error;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  // Handle logout buttons
  document.querySelectorAll('[data-auth-logout]').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      await window.formaAuth.logout();
      const redirect = this.dataset.authRedirect || '/';
      window.location.href = redirect;
    });
  });

  // Protect pages that require auth
  if (document.body.dataset.authRequired === 'true') {
    if (!window.formaAuth.isLoggedIn()) {
      const loginUrl = document.body.dataset.authLoginUrl || '/login';
      window.location.href = loginUrl + '?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }

  // Initialize display
  updateAuthDisplay();
})();
</script>'''

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

        # E-commerce components
        'product-grid': '''<section class="py-16 px-6 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
    <p class="text-gray-600 mb-8">{subtitle}</p>
    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" data-product-grid>
      {product_cards}
    </div>
  </div>
</section>''',

        'card-product': '''<div class="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition group">
  <a href="{product_url}" class="block">
    <div class="aspect-square bg-gray-100 overflow-hidden">
      <img src="{image_url}" alt="{name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-1">{name}</h3>
      <p class="text-gray-500 text-sm line-clamp-2 mb-3">{description}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold text-gray-900">${price}</span>
          {compare_price}
        </div>
        <button
          data-add-to-cart="{product_id}"
          data-product-name="{name}"
          data-product-price="{price_cents}"
          data-product-image="{image_url}"
          class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
        >Add</button>
      </div>
    </div>
  </a>
</div>''',

        'product-detail': '''<section class="py-12 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12">
      <div class="space-y-4">
        <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          <img src="{image_url}" alt="{name}" class="w-full h-full object-cover" id="main-image" />
        </div>
        <div class="grid grid-cols-4 gap-2" id="image-thumbnails">
          {image_thumbnails}
        </div>
      </div>
      <div>
        <nav class="text-sm text-gray-500 mb-4">{breadcrumb}</nav>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <div class="flex items-center gap-4 mb-6">
          <span class="text-3xl font-bold text-gray-900">${price}</span>
          {compare_price}
          {badge}
        </div>
        <p class="text-gray-600 mb-6">{description}</p>
        {variant_selector}
        <div class="flex items-center gap-4 mb-8">
          <div class="flex items-center bg-gray-100 rounded-lg">
            <button onclick="updateQty(-1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-lg text-lg">−</button>
            <input type="number" id="quantity" value="1" min="1" class="w-16 text-center bg-transparent focus:outline-none" />
            <button onclick="updateQty(1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-r-lg text-lg">+</button>
          </div>
          <button
            id="add-to-cart-btn"
            data-add-to-cart="{product_id}"
            data-product-name="{name}"
            data-product-price="{price_cents}"
            data-product-image="{image_url}"
            class="flex-1 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
        </div>
        <div class="prose text-gray-600">{long_description}</div>
      </div>
    </div>
  </div>
</section>''',

        'cart': '''<section class="py-12 px-6 bg-gray-50 min-h-screen">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
    <div data-cart-page></div>
  </div>
</section>''',

        'cart-mini': '''<div class="relative">
  <button id="cart-toggle" class="p-2 text-gray-600 hover:text-gray-900 relative">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
    <span data-cart-count class="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center hidden">0</span>
  </button>
  <div id="cart-dropdown" class="hidden absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
    <h3 class="font-semibold text-gray-900 mb-3">Your Cart</h3>
    <div data-mini-cart class="max-h-80 overflow-y-auto"></div>
  </div>
</div>
<script>
document.getElementById('cart-toggle').addEventListener('click', function() {
  document.getElementById('cart-dropdown').classList.toggle('hidden');
});
document.addEventListener('click', function(e) {
  if (!e.target.closest('#cart-toggle') && !e.target.closest('#cart-dropdown')) {
    document.getElementById('cart-dropdown').classList.add('hidden');
  }
});
</script>''',

        'checkout': '''<section class="py-12 px-6 bg-gray-50 min-h-screen">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
    <form id="checkout-form" class="space-y-8">
      <div class="bg-white p-6 rounded-xl border border-gray-200">
        <h2 class="font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="your@email.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" name="name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Full name" />
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-gray-200">
        <h2 class="font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <div class="space-y-4">
          <input type="text" name="address1" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Street address" />
          <input type="text" name="address2" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Apartment, suite, etc. (optional)" />
          <div class="grid grid-cols-2 gap-4">
            <input type="text" name="city" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="City" />
            <input type="text" name="state" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="State" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <input type="text" name="postal" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="ZIP / Postal code" />
            <select name="country" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>
      </div>
      <button type="submit" class="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">Continue to Payment</button>
    </form>
  </div>
</section>
<script>
document.getElementById('checkout-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const email = formData.get('email');
  const name = formData.get('name');
  window.formaCart.checkout(email, name);
});
</script>''',

        'order-summary': '''<div class="bg-white p-6 rounded-xl border border-gray-200">
  <h2 class="font-semibold text-gray-900 mb-4">Order Summary</h2>
  <div data-mini-cart class="space-y-3"></div>
  <div class="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
    <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span data-cart-subtotal>$0.00</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Shipping</span><span>Calculated at checkout</span></div>
  </div>
  <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-lg">
    <span>Total</span>
    <span data-cart-total>$0.00</span>
  </div>
</div>''',

        # Auth components
        'auth-login': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form data-auth-login data-auth-redirect="{redirect_url}" class="bg-white p-8 rounded-2xl shadow-sm space-y-6">
      <div data-auth-error class="text-red-500 text-sm text-center"></div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" name="password" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Enter your password" />
      </div>
      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2">
          <input type="checkbox" name="remember" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <span class="text-gray-600">Remember me</span>
        </label>
        <a href="{forgot_password_url}" class="text-indigo-600 hover:text-indigo-700">{forgot_password_text}</a>
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
      <p class="text-center text-gray-600 text-sm">Don't have an account? <a href="{register_url}" class="text-indigo-600 hover:text-indigo-700 font-medium">{register_text}</a></p>
    </form>
  </div>
</section>''',

        'auth-register': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form data-auth-register data-auth-redirect="{redirect_url}" class="bg-white p-8 rounded-2xl shadow-sm space-y-6">
      <div data-auth-error class="text-red-500 text-sm text-center"></div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input type="text" name="name" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Your name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" name="password" required minlength="8" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="At least 8 characters" />
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
      <p class="text-center text-gray-600 text-sm">Already have an account? <a href="{login_url}" class="text-indigo-600 hover:text-indigo-700 font-medium">{login_text}</a></p>
    </form>
  </div>
</section>''',

        'auth-forgot-password': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form id="forgot-password-form" class="bg-white p-8 rounded-2xl shadow-sm space-y-6">
      <div id="forgot-error" class="text-red-500 text-sm text-center hidden"></div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" name="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="you@example.com" />
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
      <p class="text-center text-gray-600 text-sm"><a href="{login_url}" class="text-indigo-600 hover:text-indigo-700 font-medium">&larr; Back to login</a></p>
    </form>
    <div id="forgot-success" class="hidden bg-white p-8 rounded-2xl shadow-sm text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </div>
      <p class="text-gray-900 font-medium">{success_message}</p>
      <a href="{login_url}" class="inline-block mt-4 text-indigo-600 hover:text-indigo-700">Back to login</a>
    </div>
  </div>
</section>
<script>
document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = new FormData(this).get('email');
  const result = await window.formaAuth.forgotPassword(email);
  if (result.success) {
    this.classList.add('hidden');
    document.getElementById('forgot-success').classList.remove('hidden');
  } else {
    document.getElementById('forgot-error').textContent = result.error;
    document.getElementById('forgot-error').classList.remove('hidden');
  }
});
</script>''',

        'auth-reset-password': '''<section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
  <div class="w-full max-w-md">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>
    <p class="text-gray-600 text-center mb-8">{subtitle}</p>
    <form id="reset-password-form" class="bg-white p-8 rounded-2xl shadow-sm space-y-6">
      <div id="reset-error" class="text-red-500 text-sm text-center hidden"></div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
        <input type="password" name="password" required minlength="8" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="At least 8 characters" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <input type="password" name="confirm" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="Confirm your password" />
      </div>
      <button type="submit" class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">{submit_text}</button>
    </form>
    <div id="reset-success" class="hidden bg-white p-8 rounded-2xl shadow-sm text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </div>
      <p class="text-gray-900 font-medium">{success_message}</p>
      <a href="{login_url}" class="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Sign in</a>
    </div>
  </div>
</section>
<script>
document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const password = formData.get('password');
  const confirm = formData.get('confirm');

  if (password !== confirm) {
    document.getElementById('reset-error').textContent = 'Passwords do not match';
    document.getElementById('reset-error').classList.remove('hidden');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    document.getElementById('reset-error').textContent = 'Invalid reset link';
    document.getElementById('reset-error').classList.remove('hidden');
    return;
  }

  const result = await window.formaAuth.resetPassword(token, password);
  if (result.success) {
    this.classList.add('hidden');
    document.getElementById('reset-success').classList.remove('hidden');
  } else {
    document.getElementById('reset-error').textContent = result.error;
    document.getElementById('reset-error').classList.remove('hidden');
  }
});
</script>''',

        'user-profile': '''<section class="py-12 px-6 bg-gray-50 min-h-screen" data-auth-required="true">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-100">
        <div class="flex items-center gap-6">
          <img data-auth-avatar src="https://placehold.co/100" alt="Avatar" class="w-20 h-20 rounded-full object-cover" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900" data-auth-name>User</h2>
            <p class="text-gray-500" data-auth-email>user@example.com</p>
          </div>
        </div>
      </div>
      <form id="profile-form" class="p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input type="text" name="name" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
          <input type="url" name="avatar_url" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition" placeholder="https://..." />
        </div>
        <button type="submit" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
      </form>
      <div class="p-8 border-t border-gray-100">
        <h3 class="font-semibold text-gray-900 mb-4">Change Password</h3>
        <form id="password-form" class="space-y-4">
          <div id="password-message" class="text-sm hidden"></div>
          <input type="password" name="current" required placeholder="Current password" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition" />
          <input type="password" name="new" required minlength="8" placeholder="New password" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition" />
          <button type="submit" class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Change Password</button>
        </form>
      </div>
      <div class="p-8 border-t border-gray-100">
        <button data-auth-logout data-auth-redirect="/" class="text-red-600 hover:text-red-700 font-medium">Sign Out</button>
      </div>
    </div>
  </div>
</section>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const user = window.formaAuth.getUser();
  if (user) {
    document.querySelector('[name="name"]').value = user.name || '';
    document.querySelector('[name="avatar_url"]').value = user.avatar_url || '';
  }
});
document.getElementById('profile-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const result = await window.formaAuth.updateProfile({
    name: formData.get('name'),
    avatar_url: formData.get('avatar_url')
  });
  if (result.success) {
    alert('Profile updated!');
    location.reload();
  }
});
document.getElementById('password-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const msgEl = document.getElementById('password-message');
  const result = await window.formaAuth.changePassword(formData.get('current'), formData.get('new'));
  msgEl.classList.remove('hidden', 'text-green-600', 'text-red-600');
  if (result.success) {
    msgEl.textContent = 'Password changed successfully';
    msgEl.classList.add('text-green-600');
    this.reset();
  } else {
    msgEl.textContent = result.error;
    msgEl.classList.add('text-red-600');
  }
});
</script>''',

        'user-menu': '''<div class="relative" data-auth-show style="display:none">
  <button id="user-menu-btn" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
    <img data-auth-avatar src="https://placehold.co/32" alt="" class="w-8 h-8 rounded-full object-cover" />
    <span data-auth-name class="text-sm font-medium text-gray-700 hidden md:block">User</span>
    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </button>
  <div id="user-menu-dropdown" class="hidden absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
    <a href="{profile_url}" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      Profile
    </a>
    <a href="{settings_url}" class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      Settings
    </a>
    <div class="border-t border-gray-100 my-1"></div>
    <button data-auth-logout class="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      Sign Out
    </button>
  </div>
</div>
<a href="{login_url}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium" data-auth-hide>Sign In</a>
<script>
document.getElementById('user-menu-btn')?.addEventListener('click', function() {
  document.getElementById('user-menu-dropdown').classList.toggle('hidden');
});
document.addEventListener('click', function(e) {
  if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-menu-dropdown')) {
    document.getElementById('user-menu-dropdown')?.classList.add('hidden');
  }
});
</script>''',
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
        },
        'product-grid': {
            'title': 'Our Products',
            'subtitle': 'Browse our collection',
            'product_cards': '''
      <div class="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition group">
        <div class="aspect-square bg-gray-100"></div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 mb-1">Product Name</h3>
          <p class="text-gray-500 text-sm mb-3">Product description</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$29.99</span>
            <button class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition group">
        <div class="aspect-square bg-gray-100"></div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 mb-1">Another Product</h3>
          <p class="text-gray-500 text-sm mb-3">Another description</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$49.99</span>
            <button class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
          </div>
        </div>
      </div>'''
        },
        'card-product': {
            'name': 'Product Name',
            'description': 'Product description',
            'price': '29.99',
            'price_cents': '2999',
            'image_url': 'https://placehold.co/400',
            'product_url': '#',
            'product_id': '',
            'compare_price': ''
        },
        'product-detail': {
            'name': 'Product Name',
            'description': 'This is an amazing product with great features.',
            'long_description': '<p>Detailed product description goes here.</p>',
            'price': '99.99',
            'price_cents': '9999',
            'image_url': 'https://placehold.co/600',
            'product_id': '',
            'breadcrumb': '<a href="/" class="hover:text-gray-900">Home</a> / <a href="/products" class="hover:text-gray-900">Products</a> / <span class="text-gray-900">Product</span>',
            'compare_price': '',
            'badge': '',
            'image_thumbnails': '',
            'variant_selector': ''
        },
        'cart': {},
        'cart-mini': {},
        'checkout': {},
        'order-summary': {},
        'auth-login': {
            'title': 'Welcome back',
            'subtitle': 'Sign in to your account',
            'submit_text': 'Sign In',
            'redirect_url': '/dashboard',
            'forgot_password_url': '/forgot-password',
            'forgot_password_text': 'Forgot password?',
            'register_url': '/register',
            'register_text': 'Create an account'
        },
        'auth-register': {
            'title': 'Create an account',
            'subtitle': 'Get started for free',
            'submit_text': 'Create Account',
            'redirect_url': '/dashboard',
            'login_url': '/login',
            'login_text': 'Sign in'
        },
        'auth-forgot-password': {
            'title': 'Forgot password?',
            'subtitle': 'Enter your email and we\'ll send you a reset link.',
            'submit_text': 'Send Reset Link',
            'login_url': '/login',
            'success_message': 'Check your email for a password reset link.'
        },
        'auth-reset-password': {
            'title': 'Reset password',
            'subtitle': 'Enter your new password below.',
            'submit_text': 'Reset Password',
            'login_url': '/login',
            'success_message': 'Your password has been reset successfully!'
        },
        'user-profile': {
            'title': 'Your Profile'
        },
        'user-menu': {
            'profile_url': '/profile',
            'settings_url': '/settings',
            'login_url': '/login'
        }
    }

    def __init__(self, project_name: str = "My Site", project_id: str = None, api_url: str = None, analytics_enabled: bool = True):
        self.project_name = project_name
        self.project_id = project_id or ""
        self.api_url = api_url or "https://api.forma.app"
        self.analytics_enabled = analytics_enabled

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

        # Check if page has e-commerce components
        ecommerce_types = ['product-grid', 'product-detail', 'card-product', 'cart', 'cart-mini', 'checkout', 'order-summary']
        has_ecommerce = any(
            c.get('type', '') in ecommerce_types
            for c in components
        )

        # Check if page has auth components
        auth_types = ['auth-login', 'auth-register', 'auth-forgot-password', 'auth-reset-password', 'user-profile', 'user-menu']
        has_auth = any(
            c.get('type', '') in auth_types
            for c in components
        )

        # Generate scripts
        scripts = []

        # Analytics script (if enabled)
        if self.analytics_enabled and self.project_id:
            scripts.append(self.ANALYTICS_SCRIPT.format(
                api_url=self.api_url,
                project_id=self.project_id
            ))

        # Form handler script (if page has forms)
        if has_forms and self.project_id:
            scripts.append(self.FORM_HANDLER_SCRIPT.format(
                api_url=self.api_url,
                project_id=self.project_id
            ))

        # E-commerce script (if page has e-commerce components)
        if has_ecommerce and self.project_id:
            scripts.append(self.ECOMMERCE_SCRIPT.format(
                api_url=self.api_url,
                project_id=self.project_id
            ))

        # Auth script (if page has auth components)
        if has_auth and self.project_id:
            scripts.append(self.AUTH_SCRIPT.format(
                api_url=self.api_url,
                project_id=self.project_id
            ))

        scripts_html = '\n'.join(scripts)

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
{scripts_html}
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
