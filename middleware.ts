import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1';

  // 1. Basic Auth (Vercel only)
  if (isProduction && process.env.ENABLE_BASIC_AUTH === 'true') {
    const authHeader = req.headers.get('authorization');
    const basicAuth = authHeader?.split(' ')[1];
    const [user, pass] = basicAuth ? atob(basicAuth).split(':') : [];

    if (
      user !== process.env.HTUSER ||
      pass !== process.env.HTPASS
    ) {
      return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Area"',
        },
      });
    }
  }

  // 2. Allow everything under /public without auth
  const isPublic = pathname.startsWith('/public') || pathname === '/';

  // 3. If route is NOT public and user is not logged in — redirect
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/public/login', req.url));
  }

  return res;
}

// Middleware should run on all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
