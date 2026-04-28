'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MessageDto } from '@/lib/types';
import { coreApiFetch, CoreApiError } from '@/core/api/core-api';
import { useCoreAuthStore } from '@/core/state/core-auth-store';

export default function CoreChatThreadPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params?.chatId ?? '';
  const qc = useQueryClient();
  const token = useCoreAuthStore((s) => s.accessToken);
  const hasHydrated = useCoreAuthStore((s) => s.hasHydrated);
  const canQuery = hasHydrated && Boolean(token) && Boolean(chatId);

  const [text, setText] = useState('');

  const { data, isLoading, isError, error } = useQuery<{
    items: MessageDto[];
    nextCursor: string | null;
  }>({
    queryKey: ['core-messages', chatId],
    queryFn: () => coreApiFetch(`/chats/${chatId}/messages?take=80`),
    enabled: canQuery,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const unauthorized =
    isError && error instanceof CoreApiError && (error.status === 401 || error.status === 403);

  const messages = data?.items ?? [];

  const send = useMutation<MessageDto | null, Error, { text: string }>({
    mutationFn: async (vars) => {
      const body = { text: vars.text };
      if (!body.text.trim()) return null;
      return coreApiFetch<MessageDto>(`/chats/${chatId}/messages`, { method: 'POST', body });
    },
    onSuccess: (msg) => {
      if (!msg) return;
      qc.setQueryData<{ items: MessageDto[]; nextCursor: string | null }>(
        ['core-messages', chatId],
        (old) => {
          if (!old) return { items: [msg], nextCursor: null };
          if (old.items.some((m) => m.id === msg.id)) return old;
          return { ...old, items: [...old.items, msg] };
        },
      );
    },
  });

  const canSend = useMemo(() => text.trim().length > 0 && !send.isPending, [text, send.isPending]);

  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-ink-muted">Неверный чат</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white">
      <div className="border-b border-line/60 px-4 py-3 dark:border-white/[0.10]">
        <div className="text-sm font-semibold">Чат</div>
        <div className="mt-0.5 text-xs text-ink-muted">id: {chatId}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? <div className="text-sm text-ink-muted">Загрузка…</div> : null}
        {unauthorized ? <div className="text-sm text-ink-muted">Нужно войти заново</div> : null}
        {isError && !unauthorized ? (
          <div className="text-sm text-ink-muted">Ошибка загрузки</div>
        ) : null}

        {!isLoading && !isError && messages.length === 0 ? (
          <div className="text-sm text-ink-muted">Нет сообщений</div>
        ) : null}

        {!isLoading && !isError && messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-surface-elevated/70 px-3 py-2 dark:bg-white/[0.06]"
              >
                <div className="text-[13px] text-ink dark:text-white/90">{m.text ?? ' '}</div>
                <div className="mt-1 text-[10px] text-ink-muted">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-line/60 p-3 dark:border-white/[0.10]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSend) return;
          const cur = text;
          setText('');
          void send.mutateAsync({ text: cur }).catch(() => {
            setText(cur);
          });
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Сообщение…"
            className="min-h-[44px] w-full resize-none rounded-2xl border border-line/60 bg-surface-elevated/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-4 focus:ring-sky-400/15 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/45"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="h-[44px] shrink-0 rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
}
