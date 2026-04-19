'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';

export function CreateChannelModal({
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
  const [handle, setHandle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>('/chats/channels', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          handle: isPrivate ? undefined : handle.trim() || undefined,
          isPrivate,
        },
      }),
    onSuccess: (chat) => {
      void qc.invalidateQueries({ queryKey: ['chats'] });
      onCreated(chat.id);
      onClose();
      setTitle('');
      setDescription('');
      setHandle('');
      setIsPrivate(false);
    },
  });

  if (!open) return null;

  const handleOk = isPrivate || !handle.trim() || /^[a-z0-9_]{3,32}$/i.test(handle.trim());
  const canSubmit = title.trim().length >= 1 && handleOk && !create.isPending;

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
          <h2 className="font-display text-lg font-semibold text-ink">{t('createChannelTitle')}</h2>
          <button
            type="button"
            className="rounded-full p-2 text-ink-muted hover:bg-surface-muted"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('createChannelNameLabel')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm outline-none dark:border-line/45"
            />
          </label>
          {!isPrivate && (
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('createChannelHandleLabel')}
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
                maxLength={32}
                className="mt-1 w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm outline-none dark:border-line/45"
                placeholder="pulse_news"
              />
              <span className="mt-1 block text-[11px] text-ink-muted">
                {t('createChannelHandleHint')}
              </span>
            </label>
          )}
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('createChannelDescLabel')}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line bg-surface-muted/30 px-3 py-2 text-sm outline-none dark:border-line/45"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-line text-accent"
            />
            {t('createChannelPrivateLabel')}
          </label>
          <p className="text-[11px] text-ink-muted">
            {isPrivate ? t('createChannelPrivateInviteHint') : t('createChannelPrivateHint')}
          </p>
        </div>
        <div className="border-t border-line p-3 dark:border-line/45">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => create.mutate()}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t('createChannelSubmit')}
          </button>
        </div>
        {create.isError && (
          <p className="px-4 pb-3 text-center text-xs text-red-500">{t('createChannelFailed')}</p>
        )}
      </div>
    </div>
  );
}
