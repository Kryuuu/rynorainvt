import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths that require authentication
  const isAdminPath = pathname.startsWith('/admin');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isVendorPath = pathname.startsWith('/vendor');
  const isEditorPath = pathname.startsWith('/editor');

  if (!isAdminPath && !isDashboardPath && !isVendorPath && !isEditorPath) {
    return NextResponse.next();
  }

  // Check for session cookies
  // 1. Check custom Rynora session cookie
  const rynoraSession = request.cookies.get('rynora_auth_session')?.value;
  // 2. Check Supabase auth token cookies (e.g. sb-*-auth-token)
  const allCookies = request.cookies.getAll();
  const hasSupabaseToken = allCookies.some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  const isAuthenticated = Boolean(rynoraSession || hasSupabaseToken);

  // If not authenticated, redirect to /login with redirect parameter
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing /admin, verify if user is authorized Super Admin
  if (isAdminPath) {
    let isSuperAdmin = false;
    if (rynoraSession) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rynoraSession));
        if (parsed.email === 'ahmadshawity@gmail.com' || parsed.role === 'admin') {
          isSuperAdmin = true;
        }
      } catch {}
    }

    // If authenticated user is NOT super admin, redirect to /dashboard?error=unauthorized_admin
    // which triggers the luxury 403 Forbidden Penolakan Akses modal & banner.
    if (!isSuperAdmin) {
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/vendor/:path*',
    '/editor/:path*',
  ],
};
