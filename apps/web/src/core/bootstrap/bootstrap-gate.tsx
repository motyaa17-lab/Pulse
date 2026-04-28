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
  const inFlightAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // New token → allow a new one-shot validation.
    ranRef.current = false;
    try {
      inFlightAbortRef.current?.abort();
    } catch {
      /* ignore */
    } finally {
      inFlightAbortRef.current = null;
    }
  }, [stamp]);

  useEffect(() => {
    if (!isCore) return;
    if (!hasHydrated) return;
    if (!token) return;
    if (status === 'ok') return;

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
    const controller = new AbortController();
    inFlightAbortRef.current = controller;
    void (async () => {
      let finalStatus: 'ok' | 'error' | 'unauthenticated' = 'error';
      let finalError: string | null = null;
      const timeoutMs = 10_000;
      const timeoutErr = new Error('CORE_BOOTSTRAP_TIMEOUT');
      const timeoutId = window.setTimeout(() => {
        console.log('[CORE BOOTSTRAP TIMEOUT]', { ms: timeoutMs });
        try {
          controller.abort();
        } catch {
          /* ignore */
        }
      }, timeoutMs);
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(timeoutErr), timeoutMs + 250);
        });
        await Promise.race([
          coreApiFetch('/users/me', { signal: controller.signal }),
          timeoutPromise,
        ]);
        console.log('[CORE BOOTSTRAP ME OK]');
        finalStatus = 'ok';
        finalError = null;
        try {
          window.sessionStorage.setItem(key, '1');
        } catch {
          /* ignore */
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'CORE_BOOTSTRAP_TIMEOUT') {
          finalStatus = 'error';
          finalError = 'Таймаут проверки сессии. Проверьте соединение и попробуйте снова.';
          console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'timeout' });
        } else if (e instanceof DOMException && e.name === 'AbortError') {
          finalStatus = 'error';
          finalError = 'Таймаут проверки сессии. Проверьте соединение и попробуйте снова.';
          console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'abort' });
        } else {
          const apiErr = e instanceof CoreApiError ? e : null;
          if (apiErr && (apiErr.status === 401 || apiErr.status === 403)) {
            console.log('[CORE BOOTSTRAP ME ERROR]', {
              kind: 'unauthorized',
              status: apiErr.status,
            });
            finalStatus = 'unauthenticated';
            finalError = 'Нужно войти заново';
            useCoreAuthStore.getState().clear();
          } else {
            console.log('[CORE BOOTSTRAP ME ERROR]', { kind: 'other' });
            finalStatus = 'error';
            finalError = 'Сервер недоступен. Обновите страницу.';
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (inFlightAbortRef.current === controller) inFlightAbortRef.current = null;
        useCoreAuthStore.getState().setStatus(finalStatus, finalError);
        console.log('[CORE BOOTSTRAP FINAL STATUS]', { status: finalStatus });
      }
    })();

    return () => {
      cancelled = true;
      try {
        controller.abort();
      } catch {
        /* ignore */
      } finally {
        if (inFlightAbortRef.current === controller) inFlightAbortRef.current = null;
      }
    };
  }, [hasHydrated, isCore, key, stamp, status, token]);

  // Watchdog: if something ever leaves us stuck in 'checking', force a safe final state.
  useEffect(() => {
    if (!isCore) return;
    if (!hasHydrated) return;
    if (!token) return;
    if (status !== 'checking') return;

    const watchdogMs = 15_000;
    const id = window.setTimeout(() => {
      if (useCoreAuthStore.getState().status !== 'checking') return;
      console.warn('[CORE BOOTSTRAP WATCHDOG] forcing error exit', { ms: watchdogMs });
      try {
        inFlightAbortRef.current?.abort();
      } catch {
        /* ignore */
      } finally {
        inFlightAbortRef.current = null;
      }
      useCoreAuthStore
        .getState()
        .setStatus(
          'error',
          'Подключение к серверу заняло слишком много времени. Попробуйте войти заново.',
        );
    }, watchdogMs);

    return () => {
      window.clearTimeout(id);
    };
  }, [hasHydrated, isCore, status, token]);

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
