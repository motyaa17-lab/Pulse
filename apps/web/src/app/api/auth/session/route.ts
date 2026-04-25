import { NextResponse } from 'next/server';
import { PULSE_ACCESS_COOKIE } from '@/lib/session-cookie';
import { verifyHs256JwtPayload } from '@/lib/verify-hs256-jwt';

function accessSecret() {
  return process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Keep this endpoint non-fatal for the app shell.
    const res = NextResponse.json({ ok: false, error: 'invalid_json' });
    res.cookies.set(PULSE_ACCESS_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }
  const accessToken =
    typeof body === 'object' && body !== null && 'accessToken' in body
      ? (body as { accessToken: unknown }).accessToken
      : undefined;
  if (typeof accessToken !== 'string' || !accessToken) {
    const res = NextResponse.json({ ok: false, error: 'missing_token' });
    res.cookies.set(PULSE_ACCESS_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  const payload = await verifyHs256JwtPayload(accessToken, accessSecret());
  if (!payload?.sub) {
    const res = NextResponse.json({ ok: false, error: 'invalid_token' });
    res.cookies.set(PULSE_ACCESS_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === 'number' ? payload.exp : now + 900;
  if (exp <= now) {
    const res = NextResponse.json({ ok: false, error: 'expired_token' });
    res.cookies.set(PULSE_ACCESS_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }
  const maxAge = Math.max(60, exp - now);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PULSE_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PULSE_ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
