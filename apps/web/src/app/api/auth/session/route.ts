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
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const accessToken =
    typeof body === 'object' && body !== null && 'accessToken' in body
      ? (body as { accessToken: unknown }).accessToken
      : undefined;
  if (typeof accessToken !== 'string' || !accessToken) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const payload = await verifyHs256JwtPayload(accessToken, accessSecret());
  if (!payload?.sub) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === 'number' ? payload.exp : now + 900;
  if (exp <= now) {
    return NextResponse.json({ error: 'expired_token' }, { status: 401 });
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
