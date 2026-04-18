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
import { useT, type I18nKey } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';
import { connectSocket } from '@/lib/socket';
import { bumpChatListPreview } from '@/lib/chat-query-helpers';

function formatListTime(iso: string, t: (k: I18nKey) => string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000);
  const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return timeStr;
  if (diffDays === 1) return t('yesterday');
  if (diffDays < 7) return d.toLocaleDateString(locale, { weekday: 'short' });
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

function chatLabel(chat: ChatListItem, t: (k: I18nKey) => string): string {
  return chat.title ?? chat.peer?.displayName ?? chat.peer?.username ?? t('chatFallback');
}

function formatChatListPreviewLine(chat: ChatListItem, t: (k: I18nKey) => string): string {
  const raw = chat.lastMessagePreview?.trim();
  if (raw) return raw;
  const type = chat.lastMessageType;
  const kind = chat.lastAttachmentKind;
  if (type === 'SYSTEM') return t('previewSystem');
  if (type === 'VOICE' || kind === 'voice') return t('previewVoice');
  if (type === 'IMAGE' || kind === 'image') return t('previewPhoto');
  if (type === 'VIDEO' || kind === 'video') return t('previewVideo');
  if (type === 'FILE' || kind === 'file') return t('previewFile');
  if (type && type !== 'TEXT') return t('previewMediaGeneric');
  return ' ';
}

function chatInitial(chat: ChatListItem, t: (k: I18nKey) => string): string {
  return chatLabel(chat, t).slice(0, 1).toUpperCase() || '?';
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

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppMenu({ pathname, variant }: { pathname: string | null; variant: 'header' | 'dock' }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const menuAbove = variant === 'dock';
  const dockActive =
    pathname === '/settings' || pathname === '/profile' || pathname === '/sessions';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const timer = window.setTimeout(() => window.addEventListener('click', close), 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', close);
    };
  }, [open]);

  const btnClass =
    variant === 'header'
      ? cn(
          'shrink-0 rounded-2xl border border-white/12 bg-white/8 p-2.5 text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white/12 hover:text-white active:scale-[0.99]',
        )
      : cn(
          'grid h-11 w-11 place-items-center rounded-2xl bg-transparent transition',
          dockActive
            ? 'bg-white/14 text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]'
            : 'text-white/70 hover:bg-white/8 hover:text-white',
        );

  return (
    <div className="relative">
      <button
        type="button"
        className={btnClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('mainMenuAria')}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <HamburgerIcon />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 min-w-[12.5rem] rounded-2xl border border-white/12 bg-[#0B1020]/92 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.6)] backdrop-blur-[26px]',
            menuAbove ? 'bottom-full left-0 mb-2' : 'left-0 top-full mt-2',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href="/settings"
            role="menuitem"
            className="block px-3 py-2.5 text-left text-[13px] font-medium text-white/90 transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            {t('settings')}
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2.5 text-left text-[13px] font-medium text-white/90 transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            {t('myProfile')}
          </Link>
          <Link
            href="/sessions"
            role="menuitem"
            className="block px-3 py-2.5 text-left text-[13px] font-medium text-white/90 transition hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            {t('mainMenuSessions')}
          </Link>
        </div>
      )}
    </div>
  );
}

export function ChatSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();
  const locale = useLanguageStore((s) => (s.language === 'ru' ? 'ru-RU' : 'en-US'));
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

  useEffect(() => {
    const s = connectSocket();
    const onChatUpdated = (payload: unknown) => {
      const p = payload as {
        chatId?: string;
        lastMessageAt?: string;
        preview?: string;
        lastMessageType?: string;
        lastAttachmentKind?: string | null;
      };
      if (!p?.chatId || !p.lastMessageAt) return;
      bumpChatListPreview(qc, p.chatId, p.preview ?? '', p.lastMessageAt, {
        lastMessageType: p.lastMessageType,
        lastAttachmentKind: p.lastAttachmentKind ?? undefined,
      });
    };
    s.on('chat:updated', onChatUpdated);
    return () => {
      s.off('chat:updated', onChatUpdated);
    };
  }, [qc]);

  const pinned = data?.filter((c: ChatListItem) => c.isPinned && !c.isArchived) ?? [];
  const rest = data?.filter((c: ChatListItem) => !c.isPinned && !c.isArchived) ?? [];
  const archived = data?.filter((c: ChatListItem) => c.isArchived) ?? [];

  const reorderPinned = useMutation({
    mutationFn: (chatIds: string[]) =>
      apiFetch<{ ok: boolean }>(`/chats/pins/reorder`, { method: 'POST', body: { chatIds } }),
  });

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-[#17212b] text-white">
      {/* Full width on mobile, centered preview on desktop */}
      <div className="flex h-full w-full flex-col md:mx-auto md:max-w-[420px]">
        <header className="shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:pt-10">
          <div className="flex items-end justify-between gap-2.5 md:gap-3">
            <div className="flex min-w-0 flex-1 items-end gap-2.5 md:gap-3">
              <AppMenu pathname={pathname} variant="header" />
              <h1 className="min-w-0 flex-1 truncate font-display text-2xl font-semibold tracking-tight text-white md:text-4xl">
                {t('chats')}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur transition hover:bg-white/12 hover:text-white active:scale-[0.99]"
            >
              {t('search')}
            </button>
          </div>

          <div className="mt-3 md:mt-4">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#111921] px-3.5 py-2.5 shadow-inner md:px-4 md:py-3">
              <MagnifierIcon className="text-white/55" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('chatListSearchPlaceholder')}
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
              aria-label={t('archivedChats')}
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
                <div className="font-semibold leading-tight">{t('archivedChats')}</div>
                <div className="mt-0.5 text-[12.5px] text-white/50">
                  {showArchived ? t('archivedTapToHide') : t('archivedTapToShow')}
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
                      locale={locale}
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
                locale={locale}
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
                    locale={locale}
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
          <nav className="pointer-events-auto rounded-[22px] border border-white/[0.08] bg-[#111921]/95 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-[24px]">
            <div className="grid grid-cols-4 items-center gap-1">
              <div className="flex justify-center">
                <AppMenu pathname={pathname} variant="dock" />
              </div>
              <Link href="/chats" className="contents" aria-label={t('chats')}>
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
                aria-label={t('search')}
              >
                <NavIcon>
                  <MagnifierIcon />
                </NavIcon>
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="contents"
                aria-label={t('newChatAria')}
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
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}

function ChatRow({
  chat,
  locale,
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
  locale: string;
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
  const timeLabel = formatListTime(chat.lastMessageAt, t, locale);
  const src = toPublicUrl(avatarSrc(chat));
  const label = chatLabel(chat, t);
  const isTyping = useUiStore((s) => s.typingByChat?.[chat.id] ?? false);
  const preview = isTyping ? t('typing') : formatChatListPreviewLine(chat, t);

  const confirmHide = () => {
    if (!window.confirm(t('hideChatConfirm'))) {
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
          'flex items-stretch gap-0 rounded-xl transition md:rounded-2xl',
          'active:scale-[0.99]',
          active ? 'bg-white/[0.1] shadow-[0_8px_28px_rgba(0,0,0,0.35)]' : 'hover:bg-white/[0.05]',
          chat.isMuted && 'opacity-[0.88]',
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
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/12"
              />
            ) : (
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-[0.95rem] font-semibold ring-1 ring-white/12',
                  'bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white',
                )}
              >
                {chatInitial(chat, t)}
              </div>
            )}
            {chat.isMuted ? (
              <span
                className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-white/65 ring-2 ring-[#17212b]"
                title={t('mutedTooltip')}
              />
            ) : (
              chat.type === 'DIRECT' &&
              chat.peer?.isOnline && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#4dcd5e] ring-[2.5px] ring-[#17212b]"
                  title={t('online')}
                  aria-hidden
                />
              )
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
                  chat.unreadCount > 0 && 'font-semibold text-[#3390ec]',
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
                <span className="flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-[#3390ec] px-1 text-[10px] font-bold leading-none text-white shadow-none">
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
            aria-label={t('chatActionsAria')}
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
