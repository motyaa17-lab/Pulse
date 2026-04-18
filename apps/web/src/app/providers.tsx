'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BootstrapSplash } from '@/components/pulse/bootstrap-splash';
import { ConnectionBanner } from '@/components/pulse/connection-banner';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

function applyVisualPreset(preset: string) {
  if (typeof document === 'undefined') return;
  if (!preset || preset === 'default') {
    delete document.documentElement.dataset.visualPreset;
  } else {
    document.documentElement.dataset.visualPreset = preset;
  }
}

function logBootstrapState(reason: string) {
  const s = useAuthStore.getState();
  const p = useAuthStore.persist;
  console.warn(`[pulse-bootstrap] ${reason}`, {
    storeHasHydrated: s.hasHydrated,
    persistHasHydrated: p?.hasHydrated?.() ?? null,
    hasAccessToken: Boolean(s.accessToken),
    hasRefreshToken: Boolean(s.refreshToken),
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const theme = useUiStore((s) => s.theme);
  const visualPreset = useUiStore((s) => s.visualPreset);

  useEffect(() => {
    console.log('[pulse-bootstrap] Providers mount: bootstrap effect start');
    const p = useAuthStore.persist;
    if (p == null) {
      logBootstrapState('no persist API — forcing hasHydrated');
      useAuthStore.setState({ hasHydrated: true });
      return;
    }

    const finish = () => {
      if (!useAuthStore.getState().hasHydrated) {
        console.log('[pulse-bootstrap] onFinishHydration / sync: set hasHydrated true');
        useAuthStore.setState({ hasHydrated: true });
      }
    };

    if (p.hasHydrated()) {
      console.log('[pulse-bootstrap] persist already hydrated before subscribe');
      queueMicrotask(finish);
    }

    const unsub = p.onFinishHydration((state) => {
      console.log('[pulse-bootstrap] persist.onFinishHydration', {
        hasToken: Boolean(state.accessToken),
      });
      queueMicrotask(finish);
    });

    const fallback = window.setTimeout(() => {
      if (!useAuthStore.getState().hasHydrated) {
        logBootstrapState('FALLBACK 2500ms — forcing hasHydrated to unblock UI');
        useAuthStore.setState({ hasHydrated: true });
      }
    }, 2500);

    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      if (theme === 'dark') root.classList.add('dark');
      else if (theme === 'light') root.classList.remove('dark');
      else {
        const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefers);
      }
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const fn = () => apply();
      mq.addEventListener('change', fn);
      return () => mq.removeEventListener('change', fn);
    }
  }, [theme]);

  useEffect(() => {
    applyVisualPreset(visualPreset);
  }, [visualPreset]);

  return (
    <QueryClientProvider client={client}>
      <ConnectionBanner />
      {children}
      <BootstrapSplash />
    </QueryClientProvider>
  );
}
