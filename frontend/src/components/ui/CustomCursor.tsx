'use client'

import { useEffect, useRef } from 'react'

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const isVisible = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check for mobile/touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      isVisible.current = true
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleMouseLeave = () => {
      isVisible.current = false
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    const handleMouseEnter = () => {
      isVisible.current = true
    }
    document.addEventListener('mouseenter', handleMouseEnter)

    // Hide default cursor
    document.body.style.cursor = 'none'
    const style = document.createElement('style')
    style.id = 'custom-cursor-style'
    style.textContent = `
      * { cursor: none !important; }
      a, button, [role="button"], input, textarea, select { cursor: none !important; }
    `
    document.head.appendChild(style)

    let animId: number
    let time = 0
    const hueOffset = Math.random() * 360 // Random starting color

    const animate = () => {
      time += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Don't draw if cursor is offscreen
      if (!isVisible.current) {
        animId = requestAnimationFrame(animate)
        return
      }

      const { x, y } = mousePos.current

      // RGB color - very slow cycle, desaturated, random start
      const hue = (time * 8 + hueOffset) % 360
      const rgb = hslToRgb(hue / 360, 0.5, 0.6)

      // Arrow cursor shape - standard pointer style
      ctx.globalCompositeOperation = 'source-over'

      // Very subtle glow behind arrow
      const glowSize = 6
      const outerGlow = ctx.createRadialGradient(x + 4, y + 7, 0, x + 4, y + 7, glowSize)
      outerGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.09)`)
      outerGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

      ctx.beginPath()
      ctx.arc(x + 4, y + 7, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()

      // Standard cursor arrow path
      ctx.beginPath()
      ctx.moveTo(x, y)           // Top tip
      ctx.lineTo(x, y + 17)      // Down left edge
      ctx.lineTo(x + 4, y + 13)  // Notch in
      ctx.lineTo(x + 7, y + 19)  // Tail down
      ctx.lineTo(x + 10, y + 18) // Tail right
      ctx.lineTo(x + 6, y + 12)  // Notch back
      ctx.lineTo(x + 11, y + 12) // Right point
      ctx.closePath()

      // White fill
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Very subtle RGB border
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
      ctx.lineWidth = 1
      ctx.stroke()

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.body.style.cursor = 'auto'
      const styleEl = document.getElementById('custom-cursor-style')
      if (styleEl) styleEl.remove()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
