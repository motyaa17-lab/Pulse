'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCoreAuthStore } from '@/core/state/core-auth-store';
import { CoreApiError, coreApiFetch } from '@/core/api/core-api';

export function BootstrapGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCore = pathname === '/core' || pathname.startsWith('/core/');
  const hasHydrated = useCoreAuthStore((s) => s.hasHydrated);
  const token = useCoreAuthStore((s) => s.accessToken);
  const status = useCoreAuthStore((s) => s.status);
  const err = useCoreAuthStore((s) => s.error);

  const stamp = useMemo(() => (token ? token.slice(0, 16) : 'anon'), [token]);
  const key = useMemo(() => `pulse:core:sessionChecked:${stamp}`, [stamp]);
  const ranRef = useRef(false);

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

    console.log('[AUTHGATE VALIDATE]', { stamp, scope: 'core' });
    useCoreAuthStore.getState().setStatus('checking', null);

    let cancelled = false;
    void (async () => {
      try {
        const timeoutMs = 10_000;
        const timeoutErr = new Error('CORE_BOOTSTRAP_TIMEOUT');
        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(timeoutErr), timeoutMs);
        });

        await Promise.race([coreApiFetch('/users/me'), timeoutPromise]);
        if (cancelled) return;
        useCoreAuthStore.getState().setStatus('ok', null);
        try {
          window.sessionStorage.setItem(key, '1');
        } catch {
          /* ignore */
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.message === 'CORE_BOOTSTRAP_TIMEOUT') {
          useCoreAuthStore
            .getState()
            .setStatus(
              'error',
              'Таймаут проверки сессии. Проверьте соединение и попробуйте снова.',
            );
          return;
        }
        const apiErr = e instanceof CoreApiError ? e : null;
        if (apiErr && (apiErr.status === 401 || apiErr.status === 403)) {
          useCoreAuthStore.getState().setStatus('error', 'Нужно войти заново');
          useCoreAuthStore.getState().clear();
          return;
        }
        useCoreAuthStore.getState().setStatus('error', 'Сервер недоступен. Обновите страницу.');
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

  // If on core login route, never block the UI.
  if (pathname.startsWith('/core/login') || pathname.startsWith('/core/signup')) {
    return <>{children}</>;
  }

  if (!token) return <>{children}</>;

  if (status === 'checking') {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
        <div className="text-sm text-ink-muted">Подключаемся к серверу…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
        <div className="px-6 text-center">
          <div className="text-sm text-ink-muted">{err ?? 'Ошибка авторизации'}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
