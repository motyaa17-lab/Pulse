'use client';

import { useMemo, useState } from 'react';
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

export function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (chatId: string) => void;
}) {
  const t = useT();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 220);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [onlyAdminsCanAddMembers, setOnlyAdminsCanAddMembers] = useState(false);
  const [inviteEnabled, setInviteEnabled] = useState(true);
  const selectedIds = useMemo(() => new Set(selected.map((u) => u.id)), [selected]);

  const { data: searchData, isFetching } = useQuery<SearchResult>({
    queryKey: ['search', debounced, 'group-pick'],
    enabled: open && debounced.length >= 2,
    queryFn: () => apiFetch<SearchResult>(`/search?q=${encodeURIComponent(debounced)}`),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>('/chats/groups', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          memberUserIds: selected.map((u) => u.id),
          onlyAdminsCanAddMembers,
          inviteEnabled,
        },
      }),
    onSuccess: (chat) => {
      void qc.invalidateQueries({ queryKey: ['chats'] });
      onCreated(chat.id);
      onClose();
      setTitle('');
      setDescription('');
      setSelected([]);
      setQ('');
      setOnlyAdminsCanAddMembers(false);
      setInviteEnabled(true);
    },
  });

  if (!open) return null;

  const toggleUser = (u: SearchUser) => {
    if (selectedIds.has(u.id)) {
      setSelected((s) => s.filter((x) => x.id !== u.id));
    } else {
      setSelected((s) => [...s, u]);
    }
  };

  const canSubmit = title.trim().length >= 1 && selected.length >= 1 && !create.isPending;

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
        className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-lift dark:border-line/55"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-line/45">
          <h2 className="font-display text-lg font-semibold text-ink">{t('createGroupTitle')}</h2>
          <button
            type="button"
            className="rounded-full p-2 text-ink-muted hover:bg-surface-muted"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(90vh-8rem)] space-y-3 overflow-y-auto px-4 py-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('createGroupNameLabel')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm text-ink outline-none focus:border-accent dark:border-line/45"
              placeholder={t('createGroupNamePlaceholder')}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('createGroupDescLabel')}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm text-ink outline-none focus:border-accent dark:border-line/45"
              placeholder={t('createGroupDescPlaceholder')}
            />
          </label>
          <div className="space-y-2 rounded-xl border border-line/60 p-3 dark:border-line/40">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={onlyAdminsCanAddMembers}
                onChange={(e) => setOnlyAdminsCanAddMembers(e.target.checked)}
              />
              <span>
                <span className="font-medium text-ink">{t('createGroupOnlyAdminsAdd')}</span>
                <span className="mt-0.5 block text-[11px] text-ink-muted">
                  {t('createGroupOnlyAdminsAddHint')}
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={inviteEnabled}
                onChange={(e) => setInviteEnabled(e.target.checked)}
              />
              <span>
                <span className="font-medium text-ink">{t('createGroupInviteLinkOn')}</span>
                <span className="mt-0.5 block text-[11px] text-ink-muted">
                  {t('createGroupInviteLinkOnHint')}
                </span>
              </span>
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('createGroupMembersLabel')}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">{t('createGroupMembersHint')}</p>
            {selected.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u)}
                    className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                  >
                    @{u.username} ×
                  </button>
                ))}
              </div>
            )}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm outline-none dark:border-line/45"
              placeholder={t('createGroupSearchPeople')}
            />
            {isFetching && <p className="mt-2 text-xs text-ink-muted">{t('searching')}</p>}
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {(searchData?.users ?? []).map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => toggleUser(u)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm ${
                      selectedIds.has(u.id) ? 'bg-accent/15' : 'hover:bg-surface-muted/60'
                    }`}
                  >
                    <span className="font-medium text-ink">{u.displayName ?? u.username}</span>
                    <span className="text-xs text-ink-muted">@{u.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-line p-3 dark:border-line/45">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => create.mutate()}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t('createGroupSubmit')}
          </button>
        </div>
        {create.isError && (
          <p className="px-4 pb-3 text-center text-xs text-red-500">{t('createGroupFailed')}</p>
        )}
      </div>
    </div>
  );
}
