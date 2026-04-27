'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const t = useT();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-ink-muted">Выберите чат</div>
      <span className="sr-only">{t('openingInbox')}</span>
    </div>
  );
}
