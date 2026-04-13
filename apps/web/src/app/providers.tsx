'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useUiStore } from '@/stores/ui-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const theme = useUiStore((s) => s.theme);

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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
