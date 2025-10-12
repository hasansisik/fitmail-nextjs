import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl
  
  // Check if this is a subdomain request
  const isAccountSubdomain = hostname === 'account.gozdedijital.xyz'
  const isPanelSubdomain = hostname === 'panel.gozdedijital.xyz'
  
  // Allowed paths for subdomains (logged-out pages)
  const allowedSubdomainPaths = [
    '/giris',
    '/kayit-ol', 
    '/sifremi-unuttum',
    '/sifre-sifirla'
  ]
  
  // If it's a subdomain and the path is not root (/) and not in allowed paths, redirect to root
  if ((isAccountSubdomain || isPanelSubdomain) && 
      pathname !== '/' && 
      !allowedSubdomainPaths.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  // Allow the request to continue
  return NextResponse.next()
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
}
