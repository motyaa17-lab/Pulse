'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { TgCard, TgNav, TgPage } from '@/components/telegram/telegram-ui';

type RecentActions = {
  items: { id: string; text: string; createdAt: string }[];
};

export default function GroupRecentActionsPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['chat-recent-actions', chatId],
    queryFn: () => apiFetch<RecentActions>(`/chats/${chatId}/recent-actions`),
  });

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/60 md:text-ink-muted">
        {t('commonLoading')}
      </div>
    );
  }

  return (
    <TgPage className="max-w-lg">
      <TgNav
        title={t('groupSettingsRecentActionsTitle')}
        backHref={`/chats/${chatId}/group`}
        backLabel={t('groupSettingsBackToGroupSettings')}
      />

      <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">
        {t('groupSettingsActionsSubtitle')}
      </p>

      <TgCard className="mt-4">
        {(data?.items ?? []).length === 0 ? (
          <div className="px-4 py-4 text-[13px] text-ink-muted dark:text-white/55">
            {t('groupSettingsNoActions')}
          </div>
        ) : (
          <ul>
            {(data?.items ?? []).map((a) => (
              <li key={a.id} className="tg-row cursor-default">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] text-ink dark:text-white">{a.text}</div>
                  <div className="mt-0.5 text-[12px] text-ink-muted dark:text-white/55">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TgCard>
    </TgPage>
  );
}
