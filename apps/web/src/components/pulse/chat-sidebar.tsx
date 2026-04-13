'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ChatListItem } from '@/lib/types';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui-store';
import { motion } from 'framer-motion';

function formatListTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000);
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return t;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function chatLabel(chat: ChatListItem): string {
  return chat.title ?? chat.peer?.displayName ?? chat.peer?.username ?? 'Chat';
}

function chatInitial(chat: ChatListItem): string {
  return chatLabel(chat).slice(0, 1).toUpperCase() || '?';
}

function avatarSrc(chat: ChatListItem): string | null {
  return chat.avatarUrl ?? chat.peer?.avatarUrl ?? null;
}

export function ChatSidebar() {
  const pathname = usePathname();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats', search],
    queryFn: () =>
      apiFetch<ChatListItem[]>(`/chats${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  });

  const pinned = data?.filter((c: ChatListItem) => c.isPinned) ?? [];
  const rest = data?.filter((c: ChatListItem) => !c.isPinned && !c.isArchived) ?? [];
  const archived = data?.filter((c: ChatListItem) => c.isArchived) ?? [];

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-line/80 bg-sidebar dark:border-line/60">
      <div className="border-b border-line/80 px-2.5 pb-2 pt-2.5 dark:border-line/50">
        <div className="mb-2 flex items-center gap-2 px-1">
          <div className="font-display text-[1.05rem] font-semibold tracking-tight text-ink">Pulse</div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-8 items-center rounded-lg border border-line/90 bg-surface-muted/60 px-2.5 text-2xs font-medium text-ink-muted transition hover:border-accent/35 hover:text-ink dark:border-line/60 dark:bg-surface-elevated/40 dark:hover:border-accent/30"
            aria-label="Open search"
          >
            Search
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats"
          className="h-9 w-full rounded-lg border border-line/90 bg-surface-muted/70 px-3 text-[13px] text-ink placeholder:text-ink-muted/80 outline-none ring-accent/25 focus:border-accent/40 focus:ring-2 dark:border-line/55 dark:bg-surface-elevated/50 dark:focus:border-accent/35"
          aria-label="Filter conversations"
        />
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-1.5 py-1">
        {isLoading && (
          <div className="space-y-0.5 px-0.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2"
              >
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-surface-muted dark:bg-surface-elevated/80" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted dark:bg-surface-elevated/80" />
                  <div className="h-3 w-full animate-pulse rounded bg-surface-muted/80 dark:bg-surface-elevated/60" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && pinned.length > 0 && (
          <div className="mb-1">
            <p className="px-2 pb-1 pt-1 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted/90">
              Pinned
            </p>
            <div className="space-y-px">
              {pinned.map((c: ChatListItem) => (
                <ChatRow key={c.id} chat={c} active={pathname === `/chats/${c.id}`} />
              ))}
            </div>
          </div>
        )}
        <div className="space-y-px">
          {rest.map((c: ChatListItem) => (
            <ChatRow key={c.id} chat={c} active={pathname === `/chats/${c.id}`} />
          ))}
        </div>
        {!isLoading && archived.length > 0 && (
          <div className="mt-2">
            <p className="px-2 pb-1 pt-1 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted/90">
              Archived
            </p>
            <div className="space-y-px opacity-[0.88]">
              {archived.map((c: ChatListItem) => (
                <ChatRow key={c.id} chat={c} active={pathname === `/chats/${c.id}`} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line/80 p-1.5 dark:border-line/50">
        <div className="flex gap-1.5">
          <Link
            href="/settings"
            className="flex-1 rounded-lg border border-line/90 py-2 text-center text-2xs font-medium text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/50 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/40"
          >
            Settings
          </Link>
          <Link
            href="/sessions"
            className="flex-1 rounded-lg border border-line/90 py-2 text-center text-2xs font-medium text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/50 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/40"
          >
            Devices
          </Link>
        </div>
      </div>
    </aside>
  );
}

function ChatRow({ chat, active }: { chat: ChatListItem; active: boolean }) {
  const timeLabel = formatListTime(chat.lastMessageAt);
  const src = avatarSrc(chat);
  const label = chatLabel(chat);
  const preview = chat.lastMessagePreview?.trim() || ' ';

  return (
    <motion.div layout>
      <Link
        href={`/chats/${chat.id}`}
        className={cn(
          'group flex min-h-[3.25rem] items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
          'hover:bg-surface-muted/90 dark:hover:bg-surface-elevated/55',
          active &&
            'bg-accent/12 ring-1 ring-accent/25 dark:bg-accent/10 dark:ring-accent/20',
        )}
      >
        <div className="relative h-12 w-12 shrink-0">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-1 ring-line/60 dark:ring-line/40"
            />
          ) : (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-[0.95rem] font-semibold ring-1 ring-line/50 dark:ring-line/40',
                'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                'dark:from-accent/25 dark:to-accent/5',
              )}
            >
              {chatInitial(chat)}
            </div>
          )}
          {chat.isMuted && (
            <span
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-ink-muted ring-2 ring-sidebar dark:bg-ink-muted/80 dark:ring-sidebar"
              title="Muted"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-ink',
                active && 'text-ink',
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                'shrink-0 text-2xs tabular-nums text-ink-muted',
                chat.unreadCount > 0 && 'font-semibold text-accent dark:text-accent',
              )}
            >
              {timeLabel}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-[12px] leading-snug text-ink-muted">
              {preview}
            </p>
            {chat.unreadCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground shadow-sm dark:shadow-bubble-dark">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
