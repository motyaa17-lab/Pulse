/**
 * Minimal HS256 JWT verify for Edge middleware (Web Crypto only).
 * Matches access tokens issued by Nest `@nestjs/jwt` with default HS256.
 */
function base64UrlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i]! ^ b[i]!;
  return x === 0;
}

export async function verifyHs256JwtPayload(
  token: string,
  secretUtf8: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h64, p64, s64] = parts;
  if (!h64 || !p64 || !s64) return null;

  let headerAlg: string;
  try {
    const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(h64))) as { alg?: string };
    headerAlg = header.alg ?? '';
  } catch {
    return null;
  }
  if (headerAlg !== 'HS256') return null;

  const data = new TextEncoder().encode(`${h64}.${p64}`);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretUtf8),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, data);
  const expect = new Uint8Array(sigBuf);
  const actual = base64UrlToBytes(s64);
  if (!timingSafeEqual(expect, actual)) return null;

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(p64))) as Record<string, unknown>;
  } catch {
    return null;
  }
}
