/** HttpOnly cookie name — mirrored access JWT for Next.js middleware (same secret as API). */
export const PULSE_ACCESS_COOKIE = 'pulse_at';

/**
 * Mirrors the bearer access token into an httpOnly cookie so Edge middleware can enforce /admin.
 * Cleared on logout. Best-effort: API calls still use Authorization from the store.
 */
export async function syncAccessTokenCookie(accessToken: string | null): Promise<void> {
  try {
    if (!accessToken) {
      await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
      return;
    }
    await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
  } catch {
    /* ignore */
  }
}
