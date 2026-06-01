'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/chats' || pathname.startsWith('/chats/')) {
    return <>{children}</>;
  }

  return <AuthGateInner>{children}</AuthGateInner>;
}

// Deduplicate the in-flight /users/me validation across React StrictMode's
// double-mount (dev) and across components, keyed by the token stamp. Sharing a
// single promise guarantees the session status always settles even if the
// component that started the check unmounts before it resolves.
const validationInFlight = new Map<string, Promise<void>>();

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);

  const stamp = useMemo(() => (token ? token.slice(0, 16) : 'anon'), [token]);
  const sessionDoneKey = useMemo(() => `pulse:sessionChecked:${stamp}`, [stamp]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) return;
    if (sessionStatus === 'ok') return;

    // Already validated this token earlier in this tab session.
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionDoneKey) === '1') {
        useAuthStore.getState().setSessionStatus('ok', null);
        return;
      }
    } catch {
      /* ignore */
    }

    useAuthStore.getState().setSessionStatus('checking', null);

    const run =
      validationInFlight.get(stamp) ??
      (async () => {
        let nextStatus: 'ok' | 'error' = 'error';
        let nextError: string | null = null;
        try {
          await apiFetch('/users/me');
          nextStatus = 'ok';
          nextError = null;
          try {
            if (typeof window !== 'undefined') window.sessionStorage.setItem(sessionDoneKey, '1');
          } catch {
            /* ignore */
          }
        } catch (e) {
          const err = e instanceof ApiError ? e : null;
          if (err && (err.status === 401 || err.status === 403)) {
            nextStatus = 'error';
            nextError = 'Сессия истекла. Войдите снова.';
            useAuthStore.getState().clear();
          } else {
            nextStatus = 'error';
            nextError = 'Сервер недоступен. Обновите страницу.';
          }
        } finally {
          // Always settle: never leave the app stuck on the loading splash.
          useAuthStore.getState().setSessionStatus(nextStatus, nextError);
          validationInFlight.delete(stamp);
        }
      })();

    validationInFlight.set(stamp, run);
    void run;
  }, [hasHydrated, token, stamp, sessionDoneKey, sessionStatus]);

  // Avoid mounting the full app while we are still validating the session.
  const isPublicPath =
    pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  const hasAnyToken = Boolean(token || refreshToken);
  const blockAppMount = hasHydrated && hasAnyToken && sessionStatus === 'checking' && !isPublicPath;

  return blockAppMount ? null : <>{children}</>;
}
