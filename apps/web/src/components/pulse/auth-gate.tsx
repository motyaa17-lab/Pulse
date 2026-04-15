'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionCheckDone = useRef(false);
  useEffect(() => {
    if (!hasHydrated) return;
    const publicPaths = ['/login', '/signup', '/onboarding'];
    if (!token && !publicPaths.includes(pathname)) {
      console.log('[pulse-bootstrap] AuthGate: no token → /login', { pathname });
      router.replace('/login');
      return;
    }
    if (token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [hasHydrated, token, pathname, router]);

  useEffect(() => {
    if (!hasHydrated || !token) return;
    if (sessionCheckDone.current) return;
    sessionCheckDone.current = true;
    let cancelled = false;
    console.log('[pulse-bootstrap] AuthGate: validating session (/users/me)');
    void (async () => {
      try {
        await apiFetch('/users/me');
        if (!cancelled) console.log('[pulse-bootstrap] AuthGate: /users/me ok');
      } catch {
        if (cancelled) return;
        console.warn('[pulse-bootstrap] AuthGate: session invalid → clear + /login');
        disconnectSocket();
        useAuthStore.getState().clear();
        router.replace('/login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, token, router]);

  return <>{children}</>;
}
