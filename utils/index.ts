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
