import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add performance headers
  const response = NextResponse.next();
  
  // Add cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // API responses - short cache for dynamic content
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Static assets - long cache
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    // HTML pages - short cache
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
