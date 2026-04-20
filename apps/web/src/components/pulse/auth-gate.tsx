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
  const sessionCheckDone = useRef(false);
  useEffect(() => {
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
  }, [hasHydrated, token, refreshToken, pathname, router]);

  useEffect(() => {
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

          const backoff = Math.min(6000, 450 * Math.pow(1.7, attempt - 1));
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
  }, [hasHydrated, token, refreshToken, router]);

  return <>{children}</>;
}
