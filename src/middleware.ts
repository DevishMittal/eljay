import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated by looking for auth token in cookies
  const authToken = request.cookies.get('auth_token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If user is not authenticated and trying to access a protected route
  if (!authToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access login page
  if (authToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
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
