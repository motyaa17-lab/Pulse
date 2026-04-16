'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ChatListItem } from '@/lib/types';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui-store';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

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
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats', search],
    queryFn: () =>
      apiFetch<ChatListItem[]>(`/chats${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  });

  const hideChat = useMutation({
    mutationFn: (chatId: string) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/hide-from-list`, { method: 'POST' }),
    onSuccess: (_res: { ok: boolean }, chatId: string) => {
      qc.setQueriesData<ChatListItem[]>(
        { queryKey: ['chats'] },
        (old: ChatListItem[] | undefined) => (old ? old.filter((c) => c.id !== chatId) : old),
      );
      setOpenMenuId(null);
      if (pathname === `/chats/${chatId}`) router.replace('/chats');
    },
  });

  const pinChat = useMutation({
    mutationFn: ({ chatId, on }: { chatId: string; on: boolean }) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/pin`, { method: 'POST', body: { on } }),
    onSuccess: (_res: { ok: boolean }, vars: { chatId: string; on: boolean }) => {
      qc.setQueriesData<ChatListItem[]>(
        { queryKey: ['chats'] },
        (old: ChatListItem[] | undefined) => {
          if (!old) return old;
          const next = old.map((c) => (c.id === vars.chatId ? { ...c, isPinned: vars.on } : c));
          // Keep ordering consistent with server: pinned first, then by lastMessageAt desc.
          next.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });
          return next;
        },
      );
    },
  });

  const archiveChat = useMutation({
    mutationFn: ({ chatId, on }: { chatId: string; on: boolean }) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/archive`, { method: 'POST', body: { on } }),
    onSuccess: (_res: { ok: boolean }, vars: { chatId: string; on: boolean }) => {
      qc.setQueriesData<ChatListItem[]>(
        { queryKey: ['chats'] },
        (old: ChatListItem[] | undefined) => {
          if (!old) return old;
          const next = old.map((c) => (c.id === vars.chatId ? { ...c, isArchived: vars.on } : c));
          next.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });
          return next;
        },
      );
      setOpenMenuId(null);
    },
  });

  const muteChat = useMutation({
    mutationFn: ({ chatId, on }: { chatId: string; on: boolean }) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/mute`, {
        method: 'POST',
        body: {
          // MVP: treat "muted" as a long-lived setting.
          until: on ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        },
      }),
    onSuccess: (_res: { ok: boolean }, vars: { chatId: string; on: boolean }) => {
      qc.setQueriesData<ChatListItem[]>(
        { queryKey: ['chats'] },
        (old: ChatListItem[] | undefined) => {
          if (!old) return old;
          return old.map((c) => (c.id === vars.chatId ? { ...c, isMuted: vars.on } : c));
        },
      );
      setOpenMenuId(null);
    },
  });

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    const t = window.setTimeout(() => window.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', close);
    };
  }, [openMenuId]);

  const pinned = data?.filter((c: ChatListItem) => c.isPinned && !c.isArchived) ?? [];
  const rest = data?.filter((c: ChatListItem) => !c.isPinned && !c.isArchived) ?? [];
  const archived = data?.filter((c: ChatListItem) => c.isArchived) ?? [];

  const reorderPinned = useMutation({
    mutationFn: (chatIds: string[]) =>
      apiFetch<{ ok: boolean }>(`/chats/pins/reorder`, { method: 'POST', body: { chatIds } }),
  });

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-line/80 bg-sidebar dark:border-line/60">
      <div className="border-b border-line/70 px-2.5 pb-2 pt-2 dark:border-line/45">
        <div className="mb-1.5 flex items-center gap-2 px-0.5">
          <div className="font-display text-[0.98rem] font-semibold tracking-tight text-ink">
            Pulse
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-7 items-center rounded-md border border-line/90 bg-surface-muted/50 px-2 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/80 hover:text-ink dark:border-line/55 dark:bg-surface-elevated/35 dark:hover:border-accent/30"
            aria-label={t('search')}
          >
            {t('search')}
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('filterConversations')}
          className="h-8 w-full rounded-md border border-line/90 bg-surface-muted/60 px-2.5 text-[12.5px] text-ink placeholder:text-ink-muted/75 outline-none ring-accent/20 focus:border-accent/40 focus:ring-[3px] dark:border-line/50 dark:bg-surface-elevated/45 dark:focus:border-accent/35"
          aria-label={t('filterConversations')}
        />
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-1 py-0.5">
        {isLoading && (
          <div className="space-y-0.5 px-0.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-md px-1.5 py-1">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-muted dark:bg-surface-elevated/80" />
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
            <p className="px-2 pb-0.5 pt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80">
              {t('pinned')}
            </p>
            <Reorder.Group
              axis="y"
              values={pinned}
              onReorder={(next: ChatListItem[]) => {
                // Optimistically reorder locally in cache.
                qc.setQueriesData<ChatListItem[]>(
                  { queryKey: ['chats'] },
                  (old: ChatListItem[] | undefined) => {
                    if (!old) return old;
                    const pinnedIds = new Set(next.map((x) => x.id));
                    const nextPinned = next.map((x, idx) => ({ ...x, pinOrder: idx }));
                    const rest = old.filter((c) => !pinnedIds.has(c.id));
                    return [...nextPinned, ...rest];
                  },
                );
                void reorderPinned.mutateAsync(next.map((x) => x.id)).catch(() => void 0);
              }}
              className="space-y-px"
            >
              {pinned.map((c: ChatListItem) => (
                <Reorder.Item key={c.id} value={c} className="cursor-grab active:cursor-grabbing">
                  <ChatRow
                    chat={c}
                    active={pathname === `/chats/${c.id}`}
                    menuOpen={openMenuId === c.id}
                    onToggleMenu={() => setOpenMenuId((open) => (open === c.id ? null : c.id))}
                    onHide={() => hideChat.mutate(c.id)}
                    onPinToggle={(on) => pinChat.mutate({ chatId: c.id, on })}
                    onArchiveToggle={(on) => archiveChat.mutate({ chatId: c.id, on })}
                    onMuteToggle={(on) => muteChat.mutate({ chatId: c.id, on })}
                    hidePending={hideChat.isPending}
                    pinPending={pinChat.isPending}
                    archivePending={archiveChat.isPending}
                    mutePending={muteChat.isPending}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}
        <div className="space-y-px">
          {rest.map((c: ChatListItem) => (
            <ChatRow
              key={c.id}
              chat={c}
              active={pathname === `/chats/${c.id}`}
              menuOpen={openMenuId === c.id}
              onToggleMenu={() => setOpenMenuId((open) => (open === c.id ? null : c.id))}
              onHide={() => hideChat.mutate(c.id)}
              onPinToggle={(on) => pinChat.mutate({ chatId: c.id, on })}
              onArchiveToggle={(on) => archiveChat.mutate({ chatId: c.id, on })}
              onMuteToggle={(on) => muteChat.mutate({ chatId: c.id, on })}
              hidePending={hideChat.isPending}
              pinPending={pinChat.isPending}
              archivePending={archiveChat.isPending}
              mutePending={muteChat.isPending}
            />
          ))}
        </div>
        {!isLoading && archived.length > 0 && (
          <div className="mt-2">
            <p className="px-2 pb-0.5 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80">
              {t('archived')}
            </p>
            <div className="space-y-px opacity-[0.88]">
              {archived.map((c: ChatListItem) => (
                <ChatRow
                  key={c.id}
                  chat={c}
                  active={pathname === `/chats/${c.id}`}
                  menuOpen={openMenuId === c.id}
                  onToggleMenu={() => setOpenMenuId((open) => (open === c.id ? null : c.id))}
                  onHide={() => hideChat.mutate(c.id)}
                  onPinToggle={(on) => pinChat.mutate({ chatId: c.id, on })}
                  onArchiveToggle={(on) => archiveChat.mutate({ chatId: c.id, on })}
                  onMuteToggle={(on) => muteChat.mutate({ chatId: c.id, on })}
                  hidePending={hideChat.isPending}
                  pinPending={pinChat.isPending}
                  archivePending={archiveChat.isPending}
                  mutePending={muteChat.isPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line/70 p-1.5 dark:border-line/45">
        <div className="flex gap-1">
          <Link
            href="/settings"
            className="flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45"
          >
            {t('settings')}
          </Link>
          <Link
            href="/sessions"
            className="flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45"
          >
            {t('sessions')}
          </Link>
        </div>
      </div>
    </aside>
  );
}

function ChatRow({
  chat,
  active,
  menuOpen,
  onToggleMenu,
  onHide,
  onPinToggle,
  onArchiveToggle,
  onMuteToggle,
  hidePending,
  pinPending,
  archivePending,
  mutePending,
}: {
  chat: ChatListItem;
  active: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onHide: () => void;
  onPinToggle: (on: boolean) => void;
  onArchiveToggle: (on: boolean) => void;
  onMuteToggle: (on: boolean) => void;
  hidePending: boolean;
  pinPending: boolean;
  archivePending: boolean;
  mutePending: boolean;
}) {
  const t = useT();
  const timeLabel = formatListTime(chat.lastMessageAt);
  const src = avatarSrc(chat);
  const label = chatLabel(chat);
  const preview = chat.lastMessagePreview?.trim() || ' ';

  const confirmHide = () => {
    if (
      !window.confirm(
        // Keep this dialog simple for MVP i18n.
        t('hideChat'),
      )
    ) {
      return;
    }
    onHide();
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }}
      className="group/row relative"
    >
      <div
        className={cn(
          'flex min-h-[2.75rem] items-stretch gap-0 rounded-md transition-colors',
          'hover:bg-surface-muted/85 dark:hover:bg-surface-elevated/50',
          active &&
            'bg-accent/[0.11] dark:bg-accent/[0.09] before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-accent',
        )}
      >
        <Link
          href={`/chats/${chat.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1"
        >
          <div className="relative h-10 w-10 shrink-0">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className="h-10 w-10 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35"
              />
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-[0.8125rem] font-semibold ring-1 ring-line/45 dark:ring-line/35',
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
                  'min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight text-ink',
                  active && 'text-ink',
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  'shrink-0 text-[0.65rem] tabular-nums text-ink-muted/90',
                  chat.unreadCount > 0 && 'font-bold text-accent dark:text-accent',
                )}
              >
                {timeLabel}
              </span>
            </div>
            <div className="mt-px flex items-center gap-1.5">
              <p className="min-w-0 flex-1 truncate text-[11.5px] leading-snug text-ink-muted/95 group-hover/row:text-ink-muted">
                {preview}
              </p>
              {chat.unreadCount > 0 && (
                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-accent-foreground shadow-sm dark:shadow-bubble-dark">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="relative flex shrink-0 items-center pr-1">
          <motion.button
            type="button"
            className={cn(
              'flex h-8 w-7 items-center justify-center rounded-md text-ink-muted/55 transition hover:bg-surface-elevated/80 hover:text-ink',
              'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus:opacity-100',
              menuOpen && 'opacity-100',
            )}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Chat actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleMenu();
            }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="text-lg leading-none">⋯</span>
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.985 }}
                transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-lg border border-line/90 bg-surface-elevated py-0.5 shadow-lift dark:border-line/55 dark:bg-surface-elevated/98"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={pinPending}
                  className="w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40"
                  onClick={() => onPinToggle(!chat.isPinned)}
                >
                  {chat.isPinned ? t('unpin') : t('pin')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={archivePending}
                  className="w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40"
                  onClick={() => onArchiveToggle(!chat.isArchived)}
                >
                  {chat.isArchived ? t('unarchive') : t('archive')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={mutePending}
                  className="w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40"
                  onClick={() => onMuteToggle(!chat.isMuted)}
                >
                  {chat.isMuted ? t('unmute') : t('mute')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={hidePending}
                  className="w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40"
                  onClick={() => confirmHide()}
                >
                  {t('hideChat')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
