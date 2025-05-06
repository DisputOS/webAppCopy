import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL === '1';

 

  // ✅ 2. Allow only /public/* and root / without auth
  const isPublicPath = pathname.startsWith('/public') || pathname.startsWith('/icons');


  // ✅ 3. Block access to everything else if not authenticated
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/public/login', req.url));
  }

  return res;
}

// ✅ 4. Apply middleware to all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
};
