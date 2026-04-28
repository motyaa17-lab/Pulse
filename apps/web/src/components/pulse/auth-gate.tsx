'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

const checkedTokenStamps = new Set<string>();
const clearedTokenStamps = new Set<string>();

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/chats' || pathname.startsWith('/chats/')) {
    console.log('[AUTHGATE] hard bypass /chats');
    return <>{children}</>;
  }

  return <AuthGateInner>{children}</AuthGateInner>;
}

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const checkedTokensRef = useRef<Set<string>>(new Set());

  const stamp = useMemo(() => (token ? token.slice(0, 16) : 'anon'), [token]);
  const sessionDoneKey = useMemo(() => `pulse:sessionChecked:${stamp}`, [stamp]);

  // Fully one-shot validation: depends only on hydration + current token-stamp.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) return;
    if (sessionStatus === 'ok') return;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionDoneKey) === '1') {
        console.log('[AUTHGATE SKIP SAME TOKEN]', { stamp, reason: 'sessionStorage' });
        checkedTokensRef.current.add(stamp);
        checkedTokenStamps.add(stamp);
        return;
      }
    } catch {
      /* ignore */
    }

    if (checkedTokensRef.current.has(stamp) || checkedTokenStamps.has(stamp)) {
      console.log('[AUTHGATE SKIP SAME TOKEN]', { stamp, reason: 'moduleSet' });
      checkedTokensRef.current.add(stamp);
      return;
    }

    let cancelled = false;

    console.log('[AUTHGATE VALIDATE]', { stamp, pathname });
    checkedTokensRef.current.add(stamp);
    checkedTokenStamps.add(stamp);
    // Idempotent due to store guards.
    useAuthStore.getState().setSessionStatus('checking', null);

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
          console.warn('[pulse-bootstrap] AuthGate: session invalid → clear');
          nextStatus = 'error';
          nextError = 'Сессия истекла. Войдите снова.';
          if (!clearedTokenStamps.has(stamp)) {
            clearedTokenStamps.add(stamp);
            useAuthStore.getState().clear();
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
  }, [hasHydrated, token, stamp, sessionDoneKey, sessionStatus]);

  // Critical: avoid mounting the full app while we are still validating session.
  // Otherwise, many screens mount and fire React Query subscriptions in parallel,
  // which can devolve into an update storm and trigger React #185.
  const isPublicPath =
    pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  const hasAnyToken = Boolean(token || refreshToken);
  const blockAppMount = hasHydrated && hasAnyToken && sessionStatus === 'checking' && !isPublicPath;

  return blockAppMount ? null : <>{children}</>;
}
