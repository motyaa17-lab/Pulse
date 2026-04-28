'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCoreAuthStore } from '@/core/state/core-auth-store';
import { CoreApiError, coreApiFetch } from '@/core/api/core-api';

export function BootstrapGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isCore = pathname === '/core' || pathname.startsWith('/core/');
  const hasHydrated = useCoreAuthStore((s) => s.hasHydrated);
  const token = useCoreAuthStore((s) => s.accessToken);
  const status = useCoreAuthStore((s) => s.status);
  const err = useCoreAuthStore((s) => s.error);

  const stamp = useMemo(() => (token ? token.slice(0, 16) : 'anon'), [token]);
  const key = useMemo(() => `pulse:core:sessionChecked:${stamp}`, [stamp]);
  const ranRef = useRef(false);

  useEffect(() => {
    // New token → allow a new one-shot validation.
    ranRef.current = false;
  }, [stamp]);

  useEffect(() => {
    if (!isCore) return;
    if (!hasHydrated) return;
    if (!token) return;
    if (status === 'ok') return;
    if (status === 'checking') return;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(key) === '1') {
        console.log('[AUTHGATE SKIP SAME TOKEN]', { stamp, reason: 'core-sessionStorage' });
        useCoreAuthStore.getState().setStatus('ok', null);
        return;
      }
    } catch {
      /* ignore */
    }

    if (ranRef.current) return;
    ranRef.current = true;

    console.log('[CORE BOOTSTRAP START]', { stamp });
    useCoreAuthStore.getState().setStatus('checking', null);

    let cancelled = false;
    void (async () => {
      let finalStatus: 'ok' | 'error' | 'unauthenticated' = 'error';
      let finalError: string | null = null;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        console.log('[CORE BOOTSTRAP TIMEOUT]', { ms: 8000 });
        controller.abort();
      }, 8000);
      try {
        await coreApiFetch('/users/me', { signal: controller.signal });
        if (cancelled) return;
        console.log('[CORE BOOTSTRAP ME OK]');
        finalStatus = 'ok';
        finalError = null;
        try {
          window.sessionStorage.setItem(key, '1');
        } catch {
          /* ignore */
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof DOMException && e.name === 'AbortError') {
          finalStatus = 'error';
          finalError = 'Таймаут проверки сессии. Проверьте соединение и попробуйте снова.';
          console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'abort' });
          return;
        }
        const apiErr = e instanceof CoreApiError ? e : null;
        if (apiErr && (apiErr.status === 401 || apiErr.status === 403)) {
          console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'unauthorized', status: apiErr.status });
          finalStatus = 'unauthenticated';
          finalError = 'Нужно войти заново';
          useCoreAuthStore.getState().clear();
          return;
        }
        console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'other' });
        finalStatus = 'error';
        finalError = 'Сервер недоступен. Обновите страницу.';
      } finally {
        window.clearTimeout(timeoutId);
        if (cancelled) return;
        useCoreAuthStore.getState().setStatus(finalStatus, finalError);
        console.log('[CORE BOOTSTRAP FINAL STATUS]', { status: finalStatus });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isCore, key, stamp, status, token]);

  if (!isCore) return <>{children}</>;

  if (!hasHydrated) {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
        <div className="text-sm text-ink-muted">Загрузка…</div>
      </div>
    );
  }

  // If on core login/signup route, never block the UI.
  if (pathname.startsWith('/core/login') || pathname.startsWith('/core/signup')) {
    // If already authenticated, the page should navigate away; we just avoid rendering a blocker.
    if (token && status === 'ok') {
      console.log('[CORE AUTH REDIRECT BLOCKED] authenticated on auth route', { pathname });
    }
    return <>{children}</>;
  }

  if (!token) {
    // Core protected area without token: always go to core login.
    router.replace('/core/login');
    return null;
  }

  if (status === 'checking') {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
        <div className="text-sm text-ink-muted">Подключаемся к серверу…</div>
      </div>
    );
  }

  if (status === 'error' || status === 'unauthenticated') {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
        <div className="px-6 text-center">
          <div className="text-sm text-ink-muted">{err ?? 'Ошибка авторизации'}</div>
          <button
            type="button"
            className="mt-4 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              router.replace('/core/login');
            }}
          >
            Войти заново
          </button>
        </div>
      </div>
    );
  }

  if (status === 'ok') {
    console.log('[CORE BOOTSTRAP OK] render children');
  }
  return <>{children}</>;
}
