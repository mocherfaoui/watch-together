const YOUTUBE_IFRAME_ORIGINS = new Set([
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com'
])

export function isYouTubePlayerUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /youtube\.com|youtu\.be/i.test(url)
}

export function parseYouTubeIframeErrorCode(event: MessageEvent): number | null {
  if (!YOUTUBE_IFRAME_ORIGINS.has(event.origin)) return null
  if (typeof event.data !== 'string') return null
  let parsed: unknown
  try {
    parsed = JSON.parse(event.data)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const o = parsed as Record<string, unknown>
  if (typeof o.event !== 'string') return null
  if (o.event.toLowerCase() !== 'onerror') return null
  if (typeof o.info === 'number') return o.info
  if (typeof o.data === 'number') return o.data
  return null
}

export type YouTubeIframeErrorDescription = {
  title: string
  description: string
  showWatchOnYouTube: boolean
}

// https://developers.google.com/youtube/iframe_api_reference#onError
export function describeYouTubeIframeError(
  code: number
): YouTubeIframeErrorDescription {
  switch (code) {
    case 2:
      return {
        title: 'Invalid video URL',
        description:
          'The video ID looks malformed. Double-check the link and try again.',
        showWatchOnYouTube: false
      }
    case 5:
      return {
        title: 'Playback error',
        description:
          "YouTube's player ran into a problem. This usually clears up if you try again or pick another video.",
        showWatchOnYouTube: true
      }
    case 100:
      return {
        title: 'Video unavailable',
        description:
          'This video was removed, set to private, or never existed.',
        showWatchOnYouTube: false
      }
    case 101:
    case 150:
      return {
        title: 'Embedding disabled',
        description:
          "The video owner doesn't allow playback outside YouTube — common for music videos and licensed content. Pick a different video, or watch it directly on YouTube.",
        showWatchOnYouTube: true
      }
    default:
      return {
        title: 'This video cannot be played',
        description:
          'YouTube reported an unexpected playback error. Try a different video.',
        showWatchOnYouTube: true
      }
  }
}
