'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ChatListItem } from '@/lib/types';

export default function ChatsIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-ink-muted">
          <p className="font-medium text-ink">Opening your inbox…</p>
        </div>
      }
    >
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const router = useRouter();
  const params = useSearchParams();
  const start = params.get('start');

  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats', ''],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
  });

  useEffect(() => {
    const run = async () => {
      if (start) {
        try {
          const chat = await apiFetch<{ id: string }>('/chats/direct', {
            method: 'POST',
            body: { peerUserId: start },
          });
          router.replace(`/chats/${chat.id}`);
        } catch {
          router.replace('/chats');
        }
        return;
      }
      if (isLoading) return;
      const first = data?.[0];
      if (first) router.replace(`/chats/${first.id}`);
    };
    void run();
  }, [data, isLoading, router, start]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-ink-muted">
      <p className="font-medium text-ink">Opening your inbox…</p>
      <p className="max-w-sm">If this takes long, create a chat from search or seed data.</p>
    </div>
  );
}
