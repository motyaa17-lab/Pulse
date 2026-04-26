'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const t = useT();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token) && sessionStatus === 'ok';

  // HARD ISOLATION: disable chats query + rendering on this page.
  // Goal: verify whether React #185 is caused by the chats query/data pipeline.
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats isolated test</p>
      <p className="mt-2 text-sm text-ink-muted">
        canQuery={String(canQuery)} hydrated={String(hasHydrated)} token={String(Boolean(token))}{' '}
        session=
        {sessionStatus}
      </p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>
    </div>
  );
}
