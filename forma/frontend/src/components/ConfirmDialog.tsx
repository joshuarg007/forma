'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6" />,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      button: 'bg-red-500 hover:bg-red-600',
      ring: 'ring-red-500/20',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-600',
      ring: 'ring-amber-500/20',
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600',
      ring: 'ring-blue-500/20',
    },
  }

  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
            className={`relative w-full max-w-md bg-forma-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ${styles.ring}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} ${styles.iconColor} flex items-center justify-center mb-5`}>
                {styles.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-white mb-2">
                {title}
              </h2>

              {/* Description */}
              <p className="text-white/60 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl ${styles.button} text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
