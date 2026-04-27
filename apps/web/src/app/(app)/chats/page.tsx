'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const t = useT();

  const { data, isLoading, isError, error } = useQuery<string>({
    queryKey: ['chats-local-ok'],
    queryFn: async () => 'ok',
    enabled: true,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats static query</p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>

      <div className="mt-4 w-full max-w-xl text-left text-sm text-ink">
        {isLoading ? <div>Loading…</div> : null}
        {isError ? (
          <div>Error: {error instanceof Error ? error.message : 'Failed to load chats'}</div>
        ) : null}
        {!isLoading && !isError ? <div>{data}</div> : null}
      </div>
    </div>
  );
}
