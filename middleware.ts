import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1'

  // 1. Enable HTTP Basic Auth for Vercel deployment only
  if (isProduction && process.env.ENABLE_BASIC_AUTH === 'true') {
    const authHeader = req.headers.get('authorization')
    const basicAuth = authHeader?.split(' ')[1]
    const [user, pass] = basicAuth ? atob(basicAuth).split(':') : []

    const validUser = process.env.HTUSER
    const validPass = process.env.HTPASS

    if (user !== validUser || pass !== validPass) {
      return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Area"',
        },
      })
    }
  }

  // 2. Supabase session-based protection for /cases/*
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const isProtected = req.nextUrl.pathname.startsWith('/cases', '/settings','/profile','/api')

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Apply to all routes
}
