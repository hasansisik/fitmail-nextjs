import { NextRequest, NextResponse } from 'next/server';
import { isAccountSubdomain, isPanelSubdomain, activeDomains } from './config';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Check if it's account subdomain
  if (isAccountSubdomain(hostname)) {
    // If accessing root path on account subdomain, redirect to account page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/account', request.url));
    }
    // If accessing account path, serve it directly
    if (pathname === '/account') {
      return NextResponse.rewrite(new URL('/account', request.url));
    }
    // For other paths on account subdomain, serve them normally
    return NextResponse.next();
  }

  // Check if it's panel subdomain
  if (isPanelSubdomain(hostname)) {
    // If accessing root path on panel subdomain, redirect to admin page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/panel', request.url));
    }
    // If accessing panel path, serve it directly
    if (pathname === '/panel') {
      return NextResponse.rewrite(new URL('/panel', request.url));
    }
    // For other paths on panel subdomain, serve them normally
    return NextResponse.next();
  }

  // For main domain, serve normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
