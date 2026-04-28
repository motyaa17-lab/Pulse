'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

const checkedTokenStamps = new Set<string>();

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/chats' || pathname.startsWith('/chats/')) {
    console.log('[AUTHGATE] hard bypass /chats');
    return <>{children}</>;
  }

  return <AuthGateInner>{children}</AuthGateInner>;
}

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const sessionCheckDone = useRef(false);
  const didRedirectLoginRef = useRef(false);

  const stamp = useMemo(() => {
    return token ? token.slice(0, 16) : refreshToken ? refreshToken.slice(0, 16) : 'anon';
  }, [token, refreshToken]);
  const sessionDoneKey = useMemo(() => `pulse:sessionChecked:${stamp}`, [stamp]);

  // If auth tokens change (login/logout/switch), allow session check to run again.
  useEffect(() => {
    sessionCheckDone.current = false;
    didRedirectLoginRef.current = false;
    checkedTokenStamps.delete(stamp);
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(sessionDoneKey);
    } catch {
      /* ignore */
    }
  }, [token, refreshToken, sessionDoneKey, stamp]);

  useEffect(() => {
    if (!hasHydrated) return;
    const publicPaths = ['/login', '/signup', '/onboarding'];
    if (!token && !refreshToken && !publicPaths.includes(pathname)) {
      console.log('[pulse-bootstrap] AuthGate: no token → /login', { pathname });
      if (pathname !== '/login') router.replace('/login');
      return;
    }
  }, [hasHydrated, token, refreshToken, pathname, router]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token && !refreshToken) return;
    if (sessionCheckDone.current) return;
    if (sessionStatus === 'checking' || sessionStatus === 'ok') return;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionDoneKey) === '1') {
        console.log('[AUTHGATE SKIP SAME TOKEN]', { stamp, reason: 'sessionStorage' });
        sessionCheckDone.current = true;
        checkedTokenStamps.add(stamp);
        return;
      }
    } catch {
      /* ignore */
    }

    if (checkedTokenStamps.has(stamp)) {
      console.log('[AUTHGATE SKIP SAME TOKEN]', { stamp, reason: 'moduleSet' });
      sessionCheckDone.current = true;
      return;
    }

    sessionCheckDone.current = true;
    let cancelled = false;

    console.log('[AUTHGATE VALIDATE]', { stamp, pathname });
    useAuthStore.getState().setSessionStatus('checking', null);
    checkedTokenStamps.add(stamp);

    void (async () => {
      let nextStatus: 'ok' | 'error' = 'error';
      let nextError: string | null = null;

      try {
        const timeoutMs = 10_000;
        const timeoutErr = new Error('AUTH_GATE_TIMEOUT');
        const timeoutPromise = new Promise<never>((_, reject) => {
          const id = window.setTimeout(() => reject(timeoutErr), timeoutMs);
          // best effort cleanup if the race resolves first
          void id;
        });

        await Promise.race([apiFetch('/users/me'), timeoutPromise]);
        if (cancelled) return;
        nextStatus = 'ok';
        nextError = null;
        try {
          if (typeof window !== 'undefined') window.sessionStorage.setItem(sessionDoneKey, '1');
        } catch {
          /* ignore */
        }
        console.log('[pulse-bootstrap] AuthGate: /users/me ok');
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.message === 'AUTH_GATE_TIMEOUT') {
          nextStatus = 'error';
          nextError = 'Таймаут проверки сессии. Проверьте соединение и попробуйте снова.';
          console.warn('[pulse-bootstrap] AuthGate: /users/me timeout');
          return;
        }

        const err = e instanceof ApiError ? e : null;
        if (err && (err.status === 401 || err.status === 403)) {
          console.warn('[pulse-bootstrap] AuthGate: session invalid → clear + /login');
          nextStatus = 'error';
          nextError = 'Сессия истекла. Войдите снова.';
          useAuthStore.getState().clear();
          if (!didRedirectLoginRef.current && pathname !== '/login') {
            didRedirectLoginRef.current = true;
            router.replace('/login');
          }
          return;
        }
        nextStatus = 'error';
        nextError = 'Сервер недоступен. Обновите страницу.';
      } finally {
        if (cancelled) return;
        // Never keep 'checking' forever: always settle to ok/error.
        useAuthStore.getState().setSessionStatus(nextStatus, nextError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, token, refreshToken, sessionStatus, router, pathname]);

  // Critical: avoid mounting the full app while we are still validating session.
  // Otherwise, many screens mount and fire React Query subscriptions in parallel,
  // which can devolve into an update storm and trigger React #185.
  const isPublicPath =
    pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  const hasAnyToken = Boolean(token || refreshToken);
  const blockAppMount = hasHydrated && hasAnyToken && sessionStatus === 'checking' && !isPublicPath;

  return blockAppMount ? null : <>{children}</>;
}
