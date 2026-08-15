import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.cookies.has('multazim-session')) {
    const signIn = new URL('/sign-in', request.url);
    signIn.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace/:path*', '/organization/:path*', '/profile/:path*', '/dashboard/:path*', '/journeys/:path*',
    '/universe/:path*', '/frameworks/:path*', '/assessment/:path*', '/evidence/:path*', '/gaps/:path*',
    '/matrix/:path*', '/calendar/:path*', '/notifications/:path*', '/audits/:path*', '/regulatory-updates/:path*', '/documents/:path*'],
};
