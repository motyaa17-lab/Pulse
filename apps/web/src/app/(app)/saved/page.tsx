'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';

type SavedChat = { chatId: string };

export default function SavedPage() {
  const router = useRouter();
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-chat'],
    queryFn: () => apiFetch<SavedChat>('/users/me/saved-chat'),
  });

  useEffect(() => {
    if (!data?.chatId) return;
    router.replace(`/chats/${data.chatId}`);
  }, [data?.chatId, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/60 md:text-ink-muted">
      {isLoading ? t('commonLoading') : t('settingsSavedMessages')}
    </div>
  );
}
