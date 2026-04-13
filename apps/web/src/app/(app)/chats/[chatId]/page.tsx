'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { MessageThread } from '@/components/pulse/message-thread';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/cn';

type ChatDetail = {
  id: string;
  type: string;
  title: string | null;
  avatarUrl: string | null;
  peer?: {
    displayName: string | null;
    username: string;
    avatarUrl: string | null;
  } | null;
};

function typeLabel(type: string | undefined): string {
  switch (type) {
    case 'DIRECT':
      return 'Direct message';
    case 'GROUP':
      return 'Group';
    case 'CHANNEL':
      return 'Channel';
    case 'SAVED':
      return 'Saved';
    default:
      return type ?? '';
  }
}

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const setSidebar = useUiStore((s) => s.setSidebarOpen);
  const setDetails = useUiStore((s) => s.setDetailsOpen);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetail>(`/chats/${chatId}`),
  });

  const title =
    chat?.title ?? chat?.peer?.displayName ?? chat?.peer?.username ?? 'Conversation';

  const avatarSrc = chat?.avatarUrl ?? chat?.peer?.avatarUrl ?? null;
  const initial = title.slice(0, 1).toUpperCase() || '?';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-line/80 bg-surface-elevated/95 px-3 py-2 backdrop-blur-md dark:border-line/50 dark:bg-surface-elevated/90">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/80 text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink md:hidden dark:border-line/55 dark:hover:bg-surface-muted/50"
          onClick={() => setSidebar(true)}
          aria-label="Back to chat list"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="relative h-10 w-10 shrink-0">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-1 ring-line/60 dark:ring-line/40"
            />
          ) : (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-line/50',
                'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
              )}
            >
              {initial}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[1.05rem] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          <p className="truncate text-2xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            {typeLabel(chat?.type)}
          </p>
        </div>
        <button
          type="button"
          className="hidden h-9 shrink-0 items-center rounded-full border border-line/80 px-3 text-2xs font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/50 hover:text-ink md:inline-flex dark:border-line/55 dark:hover:bg-surface-elevated/60"
          onClick={() => setDetails(true)}
        >
          Info
        </button>
      </header>
      {chatId && <MessageThread chatId={chatId} />}
    </div>
  );
}
