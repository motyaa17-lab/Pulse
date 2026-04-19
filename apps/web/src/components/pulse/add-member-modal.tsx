'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useT } from '@/lib/i18n';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';

type SearchUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type SearchResult = { users: SearchUser[] };

export function AddMemberModal({
  open,
  onClose,
  chatId,
  existingUserIds,
}: {
  open: boolean;
  onClose: () => void;
  chatId: string;
  existingUserIds: Set<string>;
}) {
  const t = useT();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 220);

  const { data: searchData, isFetching } = useQuery<SearchResult>({
    queryKey: ['search', debounced, 'add-member'],
    enabled: open && debounced.length >= 2,
    queryFn: () => apiFetch<SearchResult>(`/search?q=${encodeURIComponent(debounced)}`),
  });

  const add = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/members`, {
        method: 'POST',
        body: { userId, role: 'MEMBER' },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', chatId] });
      void qc.invalidateQueries({ queryKey: ['chats'] });
      onClose();
      setQ('');
    },
  });

  if (!open) return null;

  const users = (searchData?.users ?? []).filter((u) => !existingUserIds.has(u.id));

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm md:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-lift dark:border-line/55"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-line/45">
          <h2 className="font-display text-lg font-semibold text-ink">{t('addMemberTitle')}</h2>
          <button
            type="button"
            className="rounded-full p-2 text-ink-muted hover:bg-surface-muted"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm outline-none dark:border-line/45"
            placeholder={t('addMemberSearchPlaceholder')}
            autoFocus
          />
          {isFetching && <p className="mt-2 text-xs text-ink-muted">{t('searching')}</p>}
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  disabled={add.isPending}
                  onClick={() => add.mutate(u.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-muted/60 disabled:opacity-50"
                >
                  <span className="font-medium text-ink">{u.displayName ?? u.username}</span>
                  <span className="text-xs text-ink-muted">@{u.username}</span>
                  <span className="ml-auto text-xs text-accent">{t('addMemberInvite')}</span>
                </button>
              </li>
            ))}
            {!isFetching && debounced.length >= 2 && users.length === 0 && (
              <li className="py-4 text-center text-sm text-ink-muted">{t('noMatches')}</li>
            )}
          </ul>
        </div>
        {add.isError && (
          <p className="px-4 pb-3 text-center text-xs text-red-500">{t('addMemberFailed')}</p>
        )}
      </div>
    </div>
  );
}
