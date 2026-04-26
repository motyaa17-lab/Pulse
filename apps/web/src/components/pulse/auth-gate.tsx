'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const sessionCheckDone = useRef(false);

  // If auth tokens change (login/logout/switch), allow session check to run again.
  useEffect(() => {
    sessionCheckDone.current = false;
  }, [token, refreshToken]);

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
    sessionCheckDone.current = true;
    let cancelled = false;

    useAuthStore.getState().setSessionStatus('checking', null);
    console.log('[pulse-bootstrap] AuthGate: validating session (/users/me)');

    void (async () => {
      try {
        await apiFetch('/users/me');
        if (cancelled) return;
        useAuthStore.getState().setSessionStatus('ok', null);
        console.log('[pulse-bootstrap] AuthGate: /users/me ok');
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof ApiError ? e : null;
        if (err && (err.status === 401 || err.status === 403)) {
          console.warn('[pulse-bootstrap] AuthGate: session invalid → clear + /login');
          useAuthStore.getState().setSessionStatus('error', 'Сессия истекла. Войдите снова.');
          useAuthStore.getState().clear();
          if (pathname !== '/login') router.replace('/login');
          return;
        }
        useAuthStore.getState().setSessionStatus('error', 'Сервер недоступен. Обновите страницу.');
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
