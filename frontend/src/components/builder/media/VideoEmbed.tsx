'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VideoEmbedProps } from '../types'

const aspectRatioClasses = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
}

// Extract video ID from YouTube/Vimeo URLs
function getVideoId(url: string, provider: 'youtube' | 'vimeo' | 'custom'): string | null {
  if (!url) return null

  if (provider === 'youtube') {
    // Support various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
  }

  if (provider === 'vimeo') {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (match) return match[1]
  }

  return null
}

export default function VideoEmbed({
  id,
  className,
  styles,
  url,
  provider = 'youtube',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  aspectRatio = '16:9',
  poster,
  editable,
  onEdit,
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoId = getVideoId(url || '', provider)

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  // Build embed URL with parameters
  const getEmbedUrl = () => {
    if (!videoId) return null

    const params = new URLSearchParams()

    if (provider === 'youtube') {
      if (autoplay) params.append('autoplay', '1')
      if (muted) params.append('mute', '1')
      if (loop) params.append('loop', '1')
      if (!controls) params.append('controls', '0')
      params.append('rel', '0')
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
    }

    if (provider === 'vimeo') {
      if (autoplay) params.append('autoplay', '1')
      if (muted) params.append('muted', '1')
      if (loop) params.append('loop', '1')
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
    }

    return url
  }

  const embedUrl = getEmbedUrl()

  // Placeholder state
  if (!url) {
    return (
      <div
        id={id}
        className={cn(
          'bg-gray-900 flex items-center justify-center text-gray-400',
          aspectRatioClasses[aspectRatio],
          'rounded-xl overflow-hidden',
          className
        )}
        style={styles}
      >
        <div className="text-center p-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-300">Add Video</p>
          <p className="text-xs mt-1 text-gray-500">Paste a YouTube or Vimeo URL</p>
        </div>
      </div>
    )
  }

  // Show poster with play button before playing
  if (poster && !isPlaying && !autoplay) {
    return (
      <div
        id={id}
        className={cn(
          'relative cursor-pointer group',
          aspectRatioClasses[aspectRatio],
          'rounded-xl overflow-hidden',
          className
        )}
        style={styles}
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={poster}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // Custom video (direct URL)
  if (provider === 'custom' || !embedUrl) {
    return (
      <div
        id={id}
        className={cn(
          aspectRatioClasses[aspectRatio],
          'rounded-xl overflow-hidden bg-black',
          className
        )}
        style={styles}
      >
        <video
          src={url}
          poster={poster}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // YouTube/Vimeo embed
  return (
    <div
      id={id}
      className={cn(
        aspectRatioClasses[aspectRatio],
        'rounded-xl overflow-hidden bg-black',
        className
      )}
      style={styles}
    >
      <iframe
        src={embedUrl}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  )
}

VideoEmbed.displayName = 'VideoEmbed'

VideoEmbed.config = {
  id: 'video-embed',
  name: 'Video Embed',
  category: 'media',
  description: 'Embed YouTube, Vimeo, or custom video',
  defaultProps: {
    provider: 'youtube',
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
    aspectRatio: '16:9',
  },
  editableFields: [
    { name: 'url', label: 'Video URL', type: 'url' },
    { name: 'provider', label: 'Provider', type: 'select', options: ['youtube', 'vimeo', 'custom'], defaultValue: 'youtube' },
    { name: 'poster', label: 'Poster Image', type: 'image' },
    { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '4:3', '1:1', '21:9'], defaultValue: '16:9' },
    { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: false },
    { name: 'muted', label: 'Muted', type: 'boolean', defaultValue: false },
    { name: 'loop', label: 'Loop', type: 'boolean', defaultValue: false },
    { name: 'controls', label: 'Show Controls', type: 'boolean', defaultValue: true },
  ],
}
