import { unsealData } from 'iron-session'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

type SessionData = {
  actor?: string
}

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get('upscale_session')

  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const session = await unsealData<SessionData>(cookie.value, {
      password: process.env.SESSION_SECRET!,
    })

    if (!session.actor) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
