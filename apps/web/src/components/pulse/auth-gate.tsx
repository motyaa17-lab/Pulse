'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const sessionCheckDone = useRef(false);
  const bypassForChats = pathname === '/chats' || pathname?.startsWith('/chats/');

  // If auth tokens change (login/logout/switch), allow session check to run again.
  useEffect(() => {
    if (bypassForChats) return;
    sessionCheckDone.current = false;
  }, [bypassForChats, token, refreshToken]);

  useEffect(() => {
    if (bypassForChats) return;
    if (!hasHydrated) return;
    const publicPaths = ['/login', '/signup', '/onboarding'];
    if (!token && !refreshToken && !publicPaths.includes(pathname)) {
      console.log('[pulse-bootstrap] AuthGate: no token → /login', { pathname });
      router.replace('/login');
      return;
    }
    if (token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [bypassForChats, hasHydrated, token, refreshToken, pathname, router]);

  useEffect(() => {
    if (bypassForChats) return;
    if (!hasHydrated) return;
    if (!token && !refreshToken) return;
    if (sessionCheckDone.current) return;
    sessionCheckDone.current = true;
    let cancelled = false;

    useAuthStore.getState().setSessionStatus('checking', null);
    console.log('[pulse-bootstrap] AuthGate: validating session (/users/me)');

    let attempt = 0;
    const run = () => {
      attempt += 1;
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
            disconnectSocket();
            useAuthStore.getState().clear();
            router.replace('/login');
            return;
          }

          // For local/dev ergonomics: if backend is down, don't keep the UI in an infinite
          // "checking" state; surface an error and allow navigation to login.
          const backoff = Math.min(6000, 450 * Math.pow(1.7, attempt - 1));
          if (attempt >= 3) {
            useAuthStore
              .getState()
              .setSessionStatus(
                'error',
                'Сервер недоступен. Запустите бэкенд и обновите страницу.',
              );
            return;
          }
          useAuthStore
            .getState()
            .setSessionStatus('checking', 'Сервер просыпается… пытаемся подключиться снова.');
          window.setTimeout(() => {
            if (cancelled) return;
            run();
          }, backoff);
        }
      })();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bypassForChats, hasHydrated, token, refreshToken, router]);

  // Critical: avoid mounting the full app while we are still validating session.
  // Otherwise, many screens mount and fire React Query subscriptions in parallel,
  // which can devolve into an update storm and trigger React #185.
  const isPublicPath =
    pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  const hasAnyToken = Boolean(token || refreshToken);
  const blockAppMount = hasHydrated && hasAnyToken && sessionStatus === 'checking' && !isPublicPath;

  if (bypassForChats) return <>{children}</>;
  return blockAppMount ? null : <>{children}</>;
}
