'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface RegisterFormProps extends ModuleProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  logo?: string
  logoText?: string
  showSocialLogin?: boolean
  socialProviders?: Array<'google' | 'github' | 'apple' | 'facebook'>
  submitText?: string
  loginLink?: string
  loginText?: string
  showTerms?: boolean
  termsLink?: string
  privacyLink?: string
  variant?: 'simple' | 'card' | 'split'
  backgroundImage?: string
  showPasswordStrength?: boolean
}

const socialIcons: Record<string, React.ReactNode> = {
  google: (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  apple: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' }
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' }
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' }
  return { score: 5, label: 'Very Strong', color: 'bg-green-600' }
}

export default function RegisterForm({
  id,
  className,
  styles,
  title = 'Create your account',
  subtitle = 'Start your journey with us today',
  showLogo = true,
  logo,
  logoText = 'Forma',
  showSocialLogin = true,
  socialProviders = ['google', 'github'],
  submitText = 'Create account',
  loginLink = '/login',
  loginText = 'Already have an account? Sign in',
  showTerms = true,
  termsLink = '/terms',
  privacyLink = '/privacy',
  variant = 'card',
  backgroundImage,
  showPasswordStrength = true,
}: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  const formContent = (
    <div className="w-full max-w-md">
      {/* Logo */}
      {showLogo && (
        <div className="text-center mb-8">
          {logo ? (
            <img src={logo} alt={logoText} className="h-10 mx-auto" />
          ) : (
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl text-white font-bold text-xl">
              {logoText.charAt(0)}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Social Login */}
      {showSocialLogin && socialProviders.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {socialProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {socialIcons[provider]}
                <span className="text-sm font-medium text-gray-700 capitalize">{provider}</span>
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or register with email</span>
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {showPasswordStrength && password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Password strength: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all',
              confirmPassword && confirmPassword !== password
                ? 'border-red-300'
                : 'border-gray-300'
            )}
            required
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        {showTerms && (
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href={termsLink} className="text-indigo-600 hover:text-indigo-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href={privacyLink} className="text-indigo-600 hover:text-indigo-700">
                Privacy Policy
              </a>
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          {submitText}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-6 text-sm text-gray-600">
        <a href={loginLink} className="text-indigo-600 hover:text-indigo-700 font-medium">
          {loginText}
        </a>
      </p>
    </div>
  )

  if (variant === 'simple') {
    return (
      <div id={id} className={cn('py-12 px-4', className)} style={styles}>
        <div className="flex justify-center">{formContent}</div>
      </div>
    )
  }

  if (variant === 'split') {
    return (
      <div
        id={id}
        className={cn('min-h-screen flex', className)}
        style={styles}
      >
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          {formContent}
        </div>
        <div
          className="hidden lg:block flex-1 bg-cover bg-center"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      </div>
    )
  }

  return (
    <div
      id={id}
      className={cn('min-h-screen flex items-center justify-center p-4 bg-gray-50', className)}
      style={styles}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg">{formContent}</div>
    </div>
  )
}

RegisterForm.displayName = 'RegisterForm'

RegisterForm.config = {
  id: 'register-form',
  name: 'Register Form',
  category: 'forms',
  description: 'User registration form with password strength indicator',
  defaultProps: {
    title: 'Create your account',
    subtitle: 'Start your journey with us today',
    showLogo: true,
    logoText: 'Forma',
    showSocialLogin: true,
    socialProviders: ['google', 'github'],
    submitText: 'Create account',
    loginLink: '/login',
    loginText: 'Already have an account? Sign in',
    showTerms: true,
    termsLink: '/terms',
    privacyLink: '/privacy',
    variant: 'card',
    showPasswordStrength: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Create your account' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'showLogo', label: 'Show Logo', type: 'boolean', defaultValue: true },
    { name: 'logo', label: 'Logo Image', type: 'image' },
    { name: 'logoText', label: 'Logo Text', type: 'text', defaultValue: 'Forma' },
    { name: 'showSocialLogin', label: 'Show Social Login', type: 'boolean', defaultValue: true },
    { name: 'submitText', label: 'Submit Button Text', type: 'text', defaultValue: 'Create account' },
    { name: 'loginLink', label: 'Login Link', type: 'url' },
    { name: 'loginText', label: 'Login Text', type: 'text' },
    { name: 'showTerms', label: 'Show Terms Checkbox', type: 'boolean', defaultValue: true },
    { name: 'termsLink', label: 'Terms Link', type: 'url' },
    { name: 'privacyLink', label: 'Privacy Link', type: 'url' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'card', 'split'], defaultValue: 'card' },
    { name: 'backgroundImage', label: 'Background Image (Split)', type: 'image' },
    { name: 'showPasswordStrength', label: 'Show Password Strength', type: 'boolean', defaultValue: true },
  ],
}
