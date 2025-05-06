import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // ✅ 1. Allow only /public/* and root / without auth
  const isPublicPath =
    pathname === '/' || pathname.startsWith('/public');

  // ✅ 2. Block access to everything else if not authenticated
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/public/login', req.url));
  }

  return res;
}

// ✅ 3. Apply middleware to all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
};
