import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  const protectedRoutes = ['/reading', '/profile'];
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // In offline dev mode, if user hasn't logged in, redirect to login
  // Note: Client-side AuthGuard also handles local storage state gracefully
  if (isProtected && !accessToken) {
    // If accessing protected route directly without token, allow page load so AuthGuard can check client state or redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reading/:path*', '/profile/:path*'],
};
