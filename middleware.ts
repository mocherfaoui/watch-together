import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { checkRoomExists, getOrCreateUserRoom } from './utils/server-actions'
import { getRoomIdFromCookie, getRoomIdCookieOptions } from './utils'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  if (request.nextUrl.pathname === '/') {
    const existingRoomId = getRoomIdFromCookie(request.cookies)

    if (existingRoomId) {
      const roomExists = await checkRoomExists(existingRoomId)
      if (roomExists) {
        return NextResponse.redirect(
          new URL(`/room/${existingRoomId}`, request.url)
        )
      }
    }

    try {
      const roomId = await getOrCreateUserRoom()
      const cookieOpts = getRoomIdCookieOptions(roomId)
      const redirectResponse = NextResponse.redirect(
        new URL(`/room/${roomId}`, request.url)
      )
      redirectResponse.cookies.set(cookieOpts.name, cookieOpts.value, {
        httpOnly: cookieOpts.httpOnly,
        secure: cookieOpts.secure,
        sameSite: cookieOpts.sameSite,
        maxAge: cookieOpts.maxAge
      })
      return redirectResponse
    } catch (error) {
      console.error('Failed to create room in middleware:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
