import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1';

  // ✅ 1. Basic Auth (Vercel only)
  if (isProduction && process.env.ENABLE_BASIC_AUTH === 'true') {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      // 👈 якщо немає заголовка — викликаємо prompt
      return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Area"',
        },
      });
    }

    try {
      const basicAuth = authHeader.split(' ')[1];
      const [user, pass] = atob(basicAuth).split(':');

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
    } catch {
      return new NextResponse('Bad auth format', { status: 400 });
    }
  }

  // ✅ 2. Allow only /public/* and root / without auth
  const isPublicPath =
    pathname === '/' || pathname.startsWith('/public');

  // ✅ 3. Block access to everything else if not authenticated
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/public/login', req.url));
  }

  return res;
}

// ✅ 4. Apply middleware to all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
