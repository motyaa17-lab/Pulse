'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCoreAuthStore } from '@/core/state/core-auth-store';

export default function CoreSignupStubPage() {
  const router = useRouter();
  const token = useCoreAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (token) {
      console.log('[CORE AUTH REDIRECT BLOCKED] authenticated on /core/signup → /core/chats');
      router.replace('/core/chats');
      return;
    }
    router.replace('/signup');
  }, [router, token]);

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
      <div className="px-6 text-center text-sm text-ink-muted">
        Перенаправляем на регистрацию…{' '}
        <Link className="underline" href="/signup" prefetch={false}>
          Открыть
        </Link>
      </div>
    </div>
  );
}
