import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken =
      request.cookies.get('admin_token')?.value ||
      request.cookies.get('adminToken')?.value;

    const isSignInPage = pathname === '/admin/signin';

    // Unauthenticated user attempting to access protected admin page
    if (!adminToken && !isSignInPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/signin';
      return NextResponse.redirect(url);
    }

    // Authenticated admin attempting to visit sign-in page
    if (adminToken && isSignInPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
