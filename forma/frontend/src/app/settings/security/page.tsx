'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, Key, Smartphone, Lock, Eye, EyeOff, Check, X,
  AlertTriangle, Clock, Globe, Laptop, LogOut, AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/AdminLayout'

interface Session {
  id: string
  device: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

export default function SecurityPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)

  // Mock sessions data
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: 'Now',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      ip: '192.168.1.2',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: '3',
      device: 'Firefox on Windows',
      location: 'New York, NY',
      ip: '10.0.0.1',
      lastActive: '3 days ago',
      current: false,
    },
  ])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleRevokeSession = (sessionId: string) => {
    if (!confirm('Revoke this session?')) return
    // Mock revoke session
  }

  const handleRevokeAllSessions = () => {
    if (!confirm('Revoke all other sessions? You will need to log in again on those devices.')) return
    // Mock revoke all sessions
  }

  const passwordStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: '' }
    let score = 0
    if (newPassword.length >= 8) score++
    if (newPassword.length >= 12) score++
    if (/[A-Z]/.test(newPassword)) score++
    if (/[0-9]/.test(newPassword)) score++
    if (/[^A-Za-z0-9]/.test(newPassword)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-green-500' }
    return { score, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = passwordStrength()

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-forma-400" />
          Security
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Manage your account security settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Change Password */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-forma-400" />
            Change Password
          </h2>

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              Password changed successfully
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                placeholder="Confirm new password"
              />
              {confirmPassword && newPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {confirmPassword === newPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="px-4 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {changingPassword ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-forma-400" />
              Two-Factor Authentication
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              twoFactorEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <p className="text-white/60 text-sm mb-4">
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>

          {!twoFactorEnabled ? (
            <button
              onClick={() => setShowTwoFactorSetup(true)}
              className="px-4 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Enable 2FA
            </button>
          ) : (
            <button
              onClick={() => setTwoFactorEnabled(false)}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Disable 2FA
            </button>
          )}
        </div>

        {/* Active Sessions */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-forma-400" />
              Active Sessions
            </h2>
            <button
              onClick={handleRevokeAllSessions}
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Sign out all
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Laptop className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      {session.location} • {session.ip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.lastActive}
                  </span>
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              Use a unique password that you don't use on other sites
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              Enable two-factor authentication for an extra layer of security
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              Review your active sessions regularly and revoke any you don't recognize
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              Never share your password or authentication codes with anyone
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
