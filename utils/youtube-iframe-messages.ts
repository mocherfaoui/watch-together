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
    console.log('Parsed:', parsed)
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
