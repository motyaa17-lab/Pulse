'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';

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
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href={`/chats/${chatId}/group`}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          {t('groupSettingsBackToGroupSettings')}
        </Link>
        <span className="font-display text-lg font-semibold">
          {t('groupSettingsRecentActionsTitle')}
        </span>
        <span className="w-10" />
      </div>

      <p className="mt-3 text-sm text-white/55 md:text-ink-muted">
        {t('groupSettingsActionsSubtitle')}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <ul className="divide-y divide-white/10 md:divide-line/50">
          {(data?.items ?? []).length === 0 ? (
            <li className="px-4 py-4 text-sm text-white/55 md:text-ink-muted">
              {t('groupSettingsNoActions')}
            </li>
          ) : (
            (data?.items ?? []).map((a) => (
              <li key={a.id} className="px-4 py-3">
                <div className="text-[14px] text-white/90 md:text-ink">{a.text}</div>
                <div className="mt-1 text-[11px] text-white/45 md:text-ink-muted">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
