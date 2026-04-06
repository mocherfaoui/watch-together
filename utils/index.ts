export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function trackEvent(eventName: string) {
  if (typeof umami === 'undefined') return

  umami.track(eventName)
}

const ROOM_ID_COOKIE = 'watch-together-room-id'

export function getRoomIdFromCookie(
  cookieStore: Pick<Map<string, { value: string }>, 'get'>
): string | null {
  const cookie = cookieStore.get(ROOM_ID_COOKIE)
  return cookie?.value ?? null
}

export function getRoomIdCookieOptions(roomId: string) {
  return {
    name: ROOM_ID_COOKIE,
    value: roomId,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

const randomVideos = [
  'https://www.youtube.com/watch?v=ZHGw78IJryE',
  'https://www.youtube.com/watch?v=uQauaVbPEAA',
  'https://www.youtube.com/watch?v=4iQmPv_dTI0',
  'https://www.youtube.com/watch?v=rKlA5tRu6f0',
  'https://www.youtube.com/watch?v=-5EQIiabJvk',
  'https://www.youtube.com/watch?v=l9uMoTMbyrQ',
  'https://www.youtube.com/watch?v=19aPQJ2HYc8',
  'https://www.youtube.com/watch?v=0AwxHCI_BnA',
  'https://www.youtube.com/watch?v=4SZEDBFPpgw',
  'https://www.youtube.com/watch?v=A45gzN0cgow',
  'https://www.youtube.com/watch?v=FE3C4XpWl6M',
  'https://www.youtube.com/watch?v=wpqm-05R2Jk',
  'https://www.youtube.com/watch?v=TvZpn322LxE',
  'https://www.youtube.com/watch?v=qLrnkK2YEcE',
  'https://www.youtube.com/watch?v=0ScYz9sNaQk',
  'https://www.youtube.com/watch?v=Ak4vLEBxIo4',
  'https://www.youtube.com/watch?v=2lXD0vv-ds8',
  'https://www.youtube.com/watch?v=YCi4erc-QeQ',
  'https://www.youtube.com/watch?v=85E9Q5Wx210',
  'https://www.youtube.com/watch?v=hbe3CQamF8k',
  'https://www.youtube.com/watch?v=u7K72X4eo_s',
  'https://www.youtube.com/watch?v=ZWmrfgj0MZI'
]

export function getRandomVideo(): string {
  return randomVideos[Math.floor(Math.random() * randomVideos.length)]
}
