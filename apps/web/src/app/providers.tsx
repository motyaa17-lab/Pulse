'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BootstrapSplash } from '@/components/pulse/bootstrap-splash';
import { ConnectionBanner } from '@/components/pulse/connection-banner';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { getQueryClient } from '@/lib/query-client';

function applyVisualPreset(preset: string) {
  if (typeof document === 'undefined') return;
  if (!preset || preset === 'default') {
    delete document.documentElement.dataset.visualPreset;
  } else {
    document.documentElement.dataset.visualPreset = preset;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const qc = getQueryClient();
  const theme = useUiStore((s) => s.theme);
  const visualPreset = useUiStore((s) => s.visualPreset);

  useEffect(() => {
    const p = useAuthStore.persist;
    if (p == null) {
      if (!useAuthStore.getState().hasHydrated) {
        useAuthStore.setState({ hasHydrated: true });
      }
      return;
    }

    const finish = () => {
      if (!useAuthStore.getState().hasHydrated) {
        useAuthStore.setState({ hasHydrated: true });
      }
    };

    if (p.hasHydrated()) {
      queueMicrotask(finish);
    }

    const unsub = p.onFinishHydration(() => {
      queueMicrotask(finish);
    });

    const fallback = window.setTimeout(() => {
      if (!useAuthStore.getState().hasHydrated) {
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
    <QueryClientProvider client={qc}>
      <ConnectionBanner />
      {children}
      <BootstrapSplash />
    </QueryClientProvider>
  );
}
