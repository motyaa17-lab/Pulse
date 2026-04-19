import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PULSE_ACCESS_COOKIE } from '@/lib/session-cookie';
import { verifyHs256JwtPayload } from '@/lib/verify-hs256-jwt';

function accessSecret() {
  return process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(PULSE_ACCESS_COOKIE)?.value;
  if (!token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  const payload = await verifyHs256JwtPayload(token, accessSecret());
  if (!payload?.sub) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : 0;
  if (exp > 0 && exp < Math.floor(Date.now() / 1000)) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  const role = String(payload.role ?? 'USER').toUpperCase();
  if (role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
