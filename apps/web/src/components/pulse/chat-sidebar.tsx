'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, toPublicUrl } from '@/lib/api';
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

function MagnifierIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'grid h-11 w-11 place-items-center rounded-2xl transition',
        active
          ? 'bg-white/14 text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]'
          : 'text-white/70 hover:bg-white/8 hover:text-white',
      )}
    >
      {children}
    </span>
  );
}

export function ChatSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
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
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-[#070B14] text-white">
      {/* Mobile-first centered column (desktop preview) */}
      <div className="mx-auto flex h-full w-full max-w-[420px] flex-col">
        <header className="shrink-0 px-4 pb-3 pt-10">
          <div className="flex items-end justify-between">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">Chats</h1>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur transition hover:bg-white/12 hover:text-white active:scale-[0.99]"
            >
              Search
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/9 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
              <MagnifierIcon className="text-white/55" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for messages or users..."
                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 outline-none"
                aria-label={t('filterConversations')}
              />
            </div>
          </div>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-24">
          {!isLoading && archived.length > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="mx-2 mt-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-2xl border border-white/10 bg-white/7 px-3 py-3 text-left text-sm text-white/85 shadow-[0_10px_26px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white/10 active:scale-[0.99]"
              aria-label="Archived chats"
            >
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-tight">Archived Chats</div>
                <div className="mt-0.5 text-[12.5px] text-white/50">
                  {showArchived ? 'Tap to hide' : 'Tap to view'}
                </div>
              </div>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/12 px-2 text-[12px] font-bold text-white/80">
                {archived.length}
              </span>
            </button>
          )}
          {isLoading && (
            <div className="space-y-2 px-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-white/10" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && pinned.length > 0 && (
            <div className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
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
          <div className="space-y-1">
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
          {!isLoading && archived.length > 0 && showArchived && (
            <div className="mt-2">
              <p className="px-3 pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
                {t('archived')}
              </p>
              <div className="space-y-1 opacity-[0.9]">
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
      </div>

      {/* Floating bottom navigation */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-4 md:hidden">
        <div className="mx-auto w-full max-w-[420px] px-4">
          <nav className="pointer-events-auto rounded-[22px] border border-white/12 bg-white/10 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-[28px]">
            <div className="grid grid-cols-5 items-center gap-1">
              <Link href="/chats" className="contents" aria-label="Chats">
                <NavIcon active={pathname?.startsWith('/chats')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavIcon>
              </Link>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="contents"
                aria-label="Search"
              >
                <NavIcon>
                  <MagnifierIcon />
                </NavIcon>
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="contents"
                aria-label="New chat"
              >
                <NavIcon>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </NavIcon>
              </button>
              <Link href="/profile" className="contents" aria-label="Profile">
                <NavIcon active={pathname === '/profile'}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20 21a8 8 0 0 0-16 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </NavIcon>
              </Link>
              <Link href="/settings" className="contents" aria-label="Settings">
                <NavIcon active={pathname === '/settings'}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.5-2-3.5-2.4.6a8 8 0 0 0-1.7-1L13 3h-2L8.6 7.6a8 8 0 0 0-1.7 1L4.5 8 2.5 11.5l2 1.5a7.9 7.9 0 0 0 .1 2l-2 1.5 2 3.5 2.4-.6a8 8 0 0 0 1.7 1L11 21h2l2.4-4.6a8 8 0 0 0 1.7-1l2.4.6 2-3.5-2-1.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavIcon>
              </Link>
            </div>
          </nav>
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
  const src = toPublicUrl(avatarSrc(chat));
  const label = chatLabel(chat);
  const isTyping = useUiStore((s) => s.typingByChat?.[chat.id] ?? false);
  const preview = isTyping ? 'Typing…' : chat.lastMessagePreview?.trim() || ' ';

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
          'flex items-stretch gap-0 rounded-2xl transition',
          'active:scale-[0.99]',
          active ? 'bg-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.4)]' : 'hover:bg-white/6',
        )}
      >
        <Link
          href={`/chats/${chat.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3"
        >
          <div className="relative h-12 w-12 shrink-0">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15"
              />
            ) : (
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-[0.95rem] font-semibold ring-1 ring-white/15',
                  'bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white',
                )}
              >
                {chatInitial(chat)}
              </div>
            )}
            {chat.isMuted && (
              <span
                className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-white/65 ring-2 ring-[#070B14]"
                title="Muted"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight text-white',
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  'shrink-0 text-[0.72rem] tabular-nums text-white/55',
                  chat.unreadCount > 0 && 'font-bold text-sky-300',
                )}
              >
                {timeLabel}
              </span>
            </div>
            <div className="mt-px flex items-center gap-1.5">
              <p
                className={cn(
                  'min-w-0 flex-1 truncate text-[13px] leading-snug',
                  isTyping ? 'text-emerald-300/90' : 'text-white/55',
                )}
              >
                {preview}
              </p>
              {chat.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-400 px-1.5 text-[10px] font-bold leading-none text-[#06101f] shadow-[0_8px_18px_rgba(56,189,248,0.25)]">
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
              'flex h-10 w-9 items-center justify-center rounded-2xl text-white/55 transition hover:bg-white/10 hover:text-white',
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
                className="absolute right-0 top-full z-50 mt-1 min-w-[9.5rem] rounded-2xl border border-white/12 bg-[#0B1020]/85 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.6)] backdrop-blur-[26px]"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={pinPending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                  onClick={() => onPinToggle(!chat.isPinned)}
                >
                  {chat.isPinned ? t('unpin') : t('pin')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={archivePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                  onClick={() => onArchiveToggle(!chat.isArchived)}
                >
                  {chat.isArchived ? t('unarchive') : t('archive')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={mutePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                  onClick={() => onMuteToggle(!chat.isMuted)}
                >
                  {chat.isMuted ? t('unmute') : t('mute')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={hidePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50"
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
