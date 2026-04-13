'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_URL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { MessageDto } from '@/lib/types';
import { cn } from '@/lib/cn';

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Composer({
  chatId,
  replyTo,
  onCancelReply,
}: {
  chatId: string;
  replyTo: MessageDto | null;
  onCancelReply: () => void;
}) {
  const [text, setText] = useState('');
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);

  const send = useMutation({
    mutationFn: async () => {
      const body = {
        text: text.trim(),
        replyToMessageId: replyTo?.id,
      };
      if (!body.text) return;
      await apiFetch(`/chats/${chatId}/messages`, {
        method: 'POST',
        body,
      });
    },
    onSuccess: async () => {
      setText('');
      onCancelReply();
      await qc.invalidateQueries({ queryKey: ['messages', chatId] });
      await qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (text.trim()) send.mutate();
      }
    },
    [send, text],
  );

  const upload = async (file: File, kind: 'image' | 'voice' | 'file' | 'video') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (sessionId) headers['x-session-fingerprint'] = sessionId;
    const res = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: fd,
    });
    if (!res.ok) throw new Error('upload failed');
    return (await res.json()) as {
      storageKey: string;
      url: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      kind: string;
    };
  };

  const canSend = Boolean(text.trim()) && !send.isPending;

  return (
    <div className="shrink-0 border-t border-line/80 bg-surface-elevated/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md dark:border-line/50 dark:bg-surface-elevated/95">
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-line/80 bg-surface-muted/60 px-3 py-2 dark:border-line/50 dark:bg-surface-muted/40">
          <div className="min-w-0 flex-1 border-l-[3px] border-accent/50 pl-2">
            <p className="text-2xs font-semibold uppercase tracking-wide text-accent">Reply</p>
            <p className="truncate text-[13px] text-ink">{replyTo.text || 'Attachment'}</p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink"
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-line/90 bg-surface-muted/50 p-1.5 dark:border-line/55 dark:bg-surface-muted/35">
        <label
          className={cn(
            'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink-muted transition',
            'hover:bg-surface-elevated hover:text-accent dark:hover:bg-surface-elevated/60',
          )}
          title="Attach file"
        >
          <PaperclipIcon className="opacity-90" />
          <input
            type="file"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const kind = f.type.startsWith('image/')
                ? 'image'
                : f.type.startsWith('video/')
                  ? 'video'
                  : 'file';
              const meta = await upload(f, kind);
              await apiFetch(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: {
                  text: '',
                  attachments: [
                    {
                      storageKey: meta.storageKey,
                      kind: meta.kind,
                      fileName: meta.fileName,
                      mimeType: meta.mimeType,
                      sizeBytes: meta.sizeBytes,
                      url: meta.url,
                    },
                  ],
                },
              });
              await qc.invalidateQueries({ queryKey: ['messages', chatId] });
              await qc.invalidateQueries({ queryKey: ['chats'] });
              e.target.value = '';
            }}
          />
        </label>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message"
          className={cn(
            'max-h-36 min-h-[2.75rem] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-snug text-ink placeholder:text-ink-muted/70 outline-none',
          )}
          aria-label="Message text"
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={() => send.mutate()}
          title="Send"
          className={cn(
            'mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
            canSend
              ? 'bg-bubble-out text-bubble-out-ink shadow-sm hover:brightness-110 dark:hover:brightness-110'
              : 'cursor-not-allowed bg-surface-muted text-ink-muted/50 dark:bg-surface-elevated/50',
          )}
          aria-label="Send message"
        >
          {send.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bubble-out-ink/30 border-t-bubble-out-ink" />
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
      <p className="mt-1.5 px-1 text-center text-2xs text-ink-muted/80">
        <kbd className="rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50">Enter</kbd>{' '}
        to send ·{' '}
        <kbd className="rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50">
          Shift+Enter
        </kbd>{' '}
        new line
      </p>
    </div>
  );
}
