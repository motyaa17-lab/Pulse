'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import type { ChatListItem } from '@/lib/types';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui-store';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import { CreateGroupModal } from '@/components/pulse/create-group-modal';
import { CreateChannelModal } from '@/components/pulse/create-channel-modal';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { useT, type I18nKey } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';
import { connectSocket } from '@/lib/socket';
import { bumpChatListPreview } from '@/lib/chat-query-helpers';
import { decodeJwtSub } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth-store';
import { StoriesStrip } from '@/components/pulse/stories-strip';
import { chatHref } from '@/lib/chat-route';

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

type SearchUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};
type SearchChat = { id: string; type: string; title: string | null };
type SearchMessage = {
  id: string;
  chatId: string;
  text: string | null;
  snippet?: string;
  createdAt: string;
};
type SearchResult = {
  users: SearchUser[];
  chats: SearchChat[];
  messages: SearchMessage[];
};

function SearchHighlight({ text, needle }: { text: string; needle: string }) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i < 0) return <span className="text-white/90">{text}</span>;
  const before = text.slice(0, i);
  const match = text.slice(i, i + needle.length);
  const after = text.slice(i + needle.length);
  return (
    <span className="text-white/90">
      {before}
      <mark className="rounded bg-sky-500/35 px-0.5 text-white">{match}</mark>
      {after}
    </span>
  );
}

function SidebarCreateMenu({
  onClose,
  onNewGroup,
  onNewChannel,
  onExploreChannels,
  onJoinGroup,
  onJoinChannel,
  t,
}: {
  onClose: () => void;
  onNewGroup: () => void;
  onNewChannel: () => void;
  onExploreChannels: () => void;
  onJoinGroup: () => void;
  onJoinChannel: () => void;
  t: (k: I18nKey) => string;
}) {
  const itemClass =
    'block w-full px-3 py-2.5 text-left text-[13px] font-medium text-white/90 transition hover:bg-white/10';
  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-[60] mt-2 min-w-[13.5rem] overflow-hidden rounded-2xl border border-white/12 bg-[#0B1020]/96 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.6)] backdrop-blur-[26px]"
    >
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          onClose();
          onNewGroup();
        }}
      >
        {t('searchNewGroup')}
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          onClose();
          onNewChannel();
        }}
      >
        {t('searchNewChannel')}
      </button>
      <button
        type="button"
        role="menuitem"
        className={cn(itemClass, 'text-[#ffb347]')}
        onClick={() => {
          onClose();
          onExploreChannels();
        }}
      >
        {t('searchExploreChannels')}
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          onClose();
          onJoinGroup();
        }}
      >
        {t('searchJoinByGroupLink')}
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          onClose();
          onJoinChannel();
        }}
      >
        {t('searchJoinByChannelLink')}
      </button>
    </div>
  );
}

function MagnifierIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

function AppMenu({ pathname }: { pathname: string | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);

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
    'shrink-0 rounded-2xl border border-white/12 bg-white/8 p-2.5 text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white/12 hover:text-white active:scale-[0.99]';

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
          className="absolute left-0 top-full z-50 mt-2 min-w-[12.5rem] rounded-2xl border border-white/12 bg-[#0B1020]/92 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.6)] backdrop-blur-[26px]"
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const t = useT();
  const locale = useLanguageStore((s) => (s.language === 'ru' ? 'ru-RU' : 'en-US'));
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 220);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [createMenuPlacement, setCreateMenuPlacement] = useState<'closed' | 'header'>('closed');
  const createHeaderWrapRef = useRef<HTMLDivElement>(null);
  const pendingSidebarSearchFocus = useUiStore((s) => s.pendingSidebarSearchFocus);
  const setPendingSidebarSearchFocus = useUiStore((s) => s.setPendingSidebarSearchFocus);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const searchBlockRef = useRef<HTMLDivElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [chip, setChip] = useState<'all' | 'telegram' | 'channels' | 'groups' | 'direct'>('all');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const storiesWrapRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
  });

  const { data: globalSearch, isFetching: globalSearchFetching } = useQuery<SearchResult>({
    queryKey: ['search', debouncedSearch],
    enabled: debouncedSearch.trim().length >= 2,
    queryFn: () =>
      apiFetch<SearchResult>(`/search?q=${encodeURIComponent(debouncedSearch.trim())}`),
  });

  const { data: folders } = useQuery<{ items: { id: string; title: string; chatIds: string[] }[] }>(
    {
      queryKey: ['folders'],
      queryFn: () => apiFetch(`/folders`),
    },
  );

  const listFiltered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => {
      const label = (c.title ?? c.peer?.displayName ?? c.peer?.username ?? '').toLowerCase();
      const uname = (c.peer?.username ?? '').toLowerCase();
      const needle = q.startsWith('@') ? q.slice(1) : q;
      const preview = (c.lastMessagePreview ?? '').toLowerCase();
      return label.includes(needle) || preview.includes(needle) || uname.includes(needle);
    });
  }, [data, search]);

  const chipFiltered = useMemo(() => {
    if (chip === 'all') return listFiltered;
    if (chip === 'direct') return listFiltered.filter((c) => c.type === 'DIRECT');
    if (chip === 'groups') return listFiltered.filter((c) => c.type === 'GROUP');
    if (chip === 'channels') return listFiltered.filter((c) => c.type === 'CHANNEL');
    // “Telegram” in the iOS UI is commonly a folder; approximate it as channels.
    return listFiltered.filter((c) => c.type === 'CHANNEL');
  }, [chip, listFiltered]);

  const folderFiltered = useMemo(() => {
    if (!folderId) return chipFiltered;
    const f = folders?.items.find((x) => x.id === folderId);
    if (!f) return chipFiltered;
    const set = new Set(f.chatIds);
    return chipFiltered.filter((c) => set.has(c.id));
  }, [chipFiltered, folderId, folders?.items]);

  useEffect(() => {
    const onFocusEvt = () => {
      setSearchFocused(true);
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener('pulse:focus-sidebar-search', onFocusEvt);
    return () => window.removeEventListener('pulse:focus-sidebar-search', onFocusEvt);
  }, []);

  useEffect(() => {
    if (createMenuPlacement === 'closed') return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (createHeaderWrapRef.current?.contains(t)) return;
      setCreateMenuPlacement('closed');
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [createMenuPlacement]);

  useEffect(() => {
    if (!searchFocused) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchBlockRef.current?.contains(t)) return;
      setSearchFocused(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [searchFocused]);

  useEffect(() => {
    if (!searchFocused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchFocused]);

  useEffect(() => {
    if (!pendingSidebarSearchFocus) return;
    const bare = pathname?.split('?')[0] ?? '';
    if (bare !== '/chats' && bare !== '/chats/') return;
    setPendingSidebarSearchFocus(false);
    setSidebarOpen(true);
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('pulse:focus-sidebar-search'));
    });
  }, [pendingSidebarSearchFocus, pathname, setPendingSidebarSearchFocus, setSidebarOpen]);

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
        lastMessageSenderId?: string | null;
      };
      if (!p?.chatId || !p.lastMessageAt) return;
      const bare = pathname?.split('?')[0] ?? '';
      const parts = bare.split('/').filter(Boolean);
      const activeChatId = parts[0] === 'chats' && parts[1] ? parts[1] : null;
      const myId = decodeJwtSub(accessToken);
      const bumpUnread = Boolean(
        p.lastMessageSenderId &&
        myId &&
        p.lastMessageSenderId !== myId &&
        p.chatId !== activeChatId,
      );
      bumpChatListPreview(qc, p.chatId, p.preview ?? '', p.lastMessageAt, {
        lastMessageType: p.lastMessageType,
        lastAttachmentKind: p.lastAttachmentKind ?? undefined,
        bumpUnread,
      });
    };
    s.on('chat:updated', onChatUpdated);
    return () => {
      s.off('chat:updated', onChatUpdated);
    };
  }, [accessToken, pathname, qc]);

  useEffect(() => {
    const bare = pathname?.split('?')[0] ?? '';
    const parts = bare.split('/').filter(Boolean);
    const activeChatId = parts[0] === 'chats' && parts[1] ? parts[1] : null;

    const prev = document.title;
    const base = t('chats');
    const n = (data ?? []).reduce((sum, c) => {
      if (activeChatId && c.id === activeChatId) return sum;
      return sum + (c.unreadCount > 0 ? c.unreadCount : 0);
    }, 0);
    document.title = n > 0 ? `(${n}) ${base} · Pulse` : `${base} · Pulse`;

    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      void (
        n > 0
          ? (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(n)
          : (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
      ).catch(() => undefined);
    }

    return () => {
      document.title = prev;
      if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
        void (navigator as Navigator & { clearAppBadge: () => Promise<void> })
          .clearAppBadge()
          .catch(() => undefined);
      }
    };
  }, [data, pathname, t]);

  const pinnedRaw = folderFiltered.filter((c: ChatListItem) => c.isPinned && !c.isArchived);
  const restRaw = folderFiltered.filter((c: ChatListItem) => !c.isPinned && !c.isArchived);
  const archivedRaw = data?.filter((c: ChatListItem) => c.isArchived) ?? [];
  const unreadFilter = (list: ChatListItem[]) =>
    !showUnreadOnly ? list : list.filter((c) => c.unreadCount > 0);
  const pinned = unreadFilter(pinnedRaw);
  const rest = unreadFilter(restRaw);
  const archived = unreadFilter(archivedRaw);
  const searchNeedle = debouncedSearch.trim();

  const reorderPinned = useMutation({
    mutationFn: (chatIds: string[]) =>
      apiFetch<{ ok: boolean }>(`/chats/pins/reorder`, { method: 'POST', body: { chatIds } }),
  });

  const storiesCollapseTimerRef = useRef<number | null>(null);

  // Stories now live above search (Telegram-like). Keep ref for potential future use.
  useEffect(() => {
    return () => {
      if (storiesCollapseTimerRef.current != null) {
        window.clearTimeout(storiesCollapseTimerRef.current);
        storiesCollapseTimerRef.current = null;
      }
    };
  }, []);

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-surface-muted text-ink dark:bg-[rgb(var(--tg-panel))] dark:text-white">
      {/* Full width on mobile, centered preview on desktop */}
      <div className="flex h-full min-h-0 w-full flex-col md:mx-auto md:max-w-[420px]">
        <header className="shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:pt-10">
          <div className="flex items-center justify-between gap-2.5 md:items-end md:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 md:items-end md:gap-3">
              <div className="hidden md:block">
                <AppMenu pathname={pathname} />
              </div>
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="inline-flex min-h-[44px] items-center px-1 text-[14px] font-semibold text-[#58a6ff] md:hidden"
                aria-pressed={editMode}
              >
                {editMode ? t('chatsDone') : t('chatsEdit')}
              </button>
              <h1 className="min-w-0 flex-1 truncate text-center font-display text-[20px] font-semibold tracking-tight text-white md:text-left md:text-4xl">
                {t('chats')}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 active:scale-[0.99] md:hidden"
                onClick={() => router.push('/settings/security')}
                aria-label="Shield"
              >
                <span className="text-[18px]" aria-hidden>
                  🛡️
                </span>
              </button>
              <div className="relative shrink-0" ref={createHeaderWrapRef}>
                <button
                  type="button"
                  onClick={() =>
                    setCreateMenuPlacement((p) => (p === 'header' ? 'closed' : 'header'))
                  }
                  className="grid h-11 w-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 active:scale-[0.99] md:h-12 md:w-12 md:rounded-full md:border md:border-white/10 md:bg-white/[0.07] md:text-xl md:font-light md:text-white/90 md:backdrop-blur"
                  aria-expanded={createMenuPlacement === 'header'}
                  aria-haspopup="menu"
                  aria-label={t('sidebarCreateMenuAria')}
                >
                  <span className="text-[18px] md:text-inherit" aria-hidden>
                    ＋
                  </span>
                </button>
                {createMenuPlacement === 'header' && (
                  <SidebarCreateMenu
                    t={t}
                    onClose={() => setCreateMenuPlacement('closed')}
                    onNewGroup={() => setGroupModalOpen(true)}
                    onNewChannel={() => setChannelModalOpen(true)}
                    onExploreChannels={() => {
                      setCreateMenuPlacement('closed');
                      router.push('/chats/explore');
                    }}
                    onJoinGroup={() => {
                      setCreateMenuPlacement('closed');
                      router.push('/join');
                    }}
                    onJoinChannel={() => {
                      setCreateMenuPlacement('closed');
                      router.push('/join/channel');
                    }}
                  />
                )}
              </div>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 active:scale-[0.99] md:hidden"
                onClick={() => router.push('/compose')}
                aria-label="New message"
              >
                <span className="text-[18px]" aria-hidden>
                  ✍️
                </span>
              </button>
            </div>
          </div>

          {/* Telegram-like: stories above the search bar (no interaction with chats list scroll). */}
          <div ref={storiesWrapRef} className="mt-3 md:mt-4">
            <StoriesStrip variant="full" />
          </div>

          <div ref={searchBlockRef} className="relative mt-3 md:mt-4">
            <div className="flex items-center gap-2 rounded-full border border-line/70 bg-surface-elevated/70 px-3.5 py-2.5 shadow-inner dark:border-white/[0.08] dark:bg-[rgb(var(--tg-search))] md:px-4 md:py-3">
              <MagnifierIcon className="shrink-0 text-ink-muted dark:text-white/55" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full min-w-0 bg-transparent text-[14px] text-ink placeholder:text-ink-muted outline-none dark:text-white dark:placeholder:text-white/40"
                aria-label={t('search')}
                aria-autocomplete="list"
                aria-expanded={searchFocused}
              />
            </div>
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full z-[55] mt-1 max-h-[min(52vh,22rem)] overflow-y-auto rounded-2xl border border-line/70 bg-surface-elevated/95 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgb(var(--tg-search))]/98 dark:shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
                <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted dark:text-white/45">
                  {t('searchHint')}
                </p>
                {searchNeedle.length < 2 && (
                  <p className="px-3 pb-2 text-[13px] text-white/55">{t('searchMinCharsHint')}</p>
                )}
                {searchNeedle.length >= 2 && globalSearchFetching && (
                  <p className="px-3 text-[13px] text-white/55">{t('searching')}</p>
                )}
                {searchNeedle.length >= 2 && !globalSearchFetching && globalSearch && (
                  <div className="space-y-3 px-2 pb-1">
                    <div>
                      <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                        {t('people')}
                      </p>
                      <div className="space-y-0.5">
                        {globalSearch.users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.08]"
                            onClick={async () => {
                              setSearchFocused(false);
                              try {
                                const chat = await getOrCreateDirectChat(u.id);
                                void qc.invalidateQueries({ queryKey: ['chats'] });
                                router.push(`/chats/${chat.id}`);
                              } catch {
                                router.push('/chats');
                              }
                            }}
                          >
                            <SafeAvatar
                              url={u.avatarUrl}
                              label={(u.displayName ?? u.username).slice(0, 1).toUpperCase()}
                              className="h-9 w-9 shrink-0 rounded-full ring-1 ring-white/12"
                              fallbackClassName="text-xs font-semibold text-sky-200"
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-white">
                                {u.displayName ?? u.username}
                              </span>
                              <span className="block truncate text-xs text-white/50">
                                @{u.username}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                        {t('chats')}
                      </p>
                      <div className="space-y-0.5">
                        {globalSearch.chats.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="block w-full rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.08]"
                            onClick={() => {
                              setSearchFocused(false);
                              router.push(`/chats/${c.id}`);
                            }}
                          >
                            <span className="font-medium text-white">
                              {c.title ?? t('searchUntitled')}
                            </span>
                            <span className="ml-2 text-xs uppercase text-white/45">{c.type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                        {t('messages')}
                      </p>
                      <div className="space-y-0.5">
                        {globalSearch.messages.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className="block w-full rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.08]"
                            onClick={() => {
                              setSearchFocused(false);
                              router.push(`/chats/${m.chatId}?highlight=${m.id}`);
                            }}
                          >
                            <div className="text-[13px] text-white/90">
                              <SearchHighlight
                                text={(m.snippet ?? m.text ?? '').trim() || ' '}
                                needle={searchNeedle}
                              />
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/45">
                              {new Date(m.createdAt).toLocaleString(locale)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {globalSearch.users.length === 0 &&
                      globalSearch.chats.length === 0 &&
                      globalSearch.messages.length === 0 && (
                        <p className="px-2 py-1 text-[13px] text-white/50">{t('noMatches')}</p>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                { id: 'all', label: t('chatsChipAll') },
                { id: 'telegram', label: t('chatsChipTelegram') },
                { id: 'channels', label: t('chatsChipChannels') },
                { id: 'groups', label: t('chatsChipGroups') },
                { id: 'direct', label: t('chatsChipDirect') },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChip(c.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition',
                  chip === c.id
                    ? 'bg-white/12 text-white'
                    : 'bg-[#111921] text-white/70 hover:bg-white/[0.08]',
                )}
              >
                {c.label}
              </button>
            ))}
            {(folders?.items ?? []).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFolderId((cur) => (cur === f.id ? null : f.id))}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition',
                  folderId === f.id
                    ? 'bg-[#3390ec]/22 text-white'
                    : 'bg-[#111921] text-white/70 hover:bg-white/[0.08]',
                )}
              >
                {f.title}
              </button>
            ))}
          </div>
          {/* Moved to the list as a sticky row to avoid overlaying taps on the first chat row. */}
        </header>

        <div
          ref={listScrollRef}
          className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 pb-[max(1rem,calc(4.25rem+env(safe-area-inset-bottom)))] md:pb-24"
        >
          <div className="sticky top-0 z-10 -mx-2 bg-[#17212b] px-2 pb-2 pt-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowUnreadOnly((v) => !v)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] transition touch-manipulation',
                  showUnreadOnly
                    ? 'border-[#3390ec] bg-[#3390ec]/25 text-white'
                    : 'border-white/12 bg-white/[0.06] text-white/65 hover:bg-white/10 hover:text-white/90',
                )}
                aria-pressed={showUnreadOnly}
                aria-label={t('filterUnreadOnlyAria')}
              >
                {t('filterUnreadOnly')}
              </button>
            </div>
          </div>
          {!isLoading && archivedRaw.length > 0 && (
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
                {archivedRaw.length}
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
                dragListener={editMode}
                className="space-y-px"
              >
                {pinned.map((c: ChatListItem) => (
                  <Reorder.Item
                    key={c.id}
                    value={c}
                    className={cn(
                      editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                    )}
                  >
                    <ChatRow
                      chat={c}
                      locale={locale}
                      active={pathname === `/chats/${c.id}`}
                      editMode={editMode}
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
                editMode={editMode}
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
          {!isLoading && archivedRaw.length > 0 && showArchived && (
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
                    editMode={editMode}
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

      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreated={(id) => {
          setGroupModalOpen(false);
          router.push(`/chats/${id}`);
        }}
      />
      <CreateChannelModal
        open={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        onCreated={(id) => {
          setChannelModalOpen(false);
          router.push(`/chats/${id}`);
        }}
      />
    </aside>
  );
}

function ChatRow({
  chat,
  locale,
  active,
  editMode,
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
  editMode?: boolean;
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
  const rawAvatar = avatarSrc(chat);
  const label = chatLabel(chat, t);
  const isTyping = useUiStore((s) => s.typingByChat?.[chat.id] ?? false);
  const hideListPreviews = useUiStore((s) => s.hideChatListPreviews);
  const preview = isTyping
    ? t('typing')
    : hideListPreviews
      ? t('listPreviewHidden')
      : formatChatListPreviewLine(chat, t);

  const confirmHide = () => {
    if (!window.confirm(t('hideChatConfirm'))) {
      return;
    }
    onHide();
  };

  return (
    <motion.div
      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }}
      className="group/row relative"
    >
      <div
        className={cn(
          'flex items-stretch gap-0 rounded-xl transition md:rounded-2xl',
          'active:scale-[0.99]',
          chat.isPinned && !active && 'bg-[#1f2a36]',
          active ? 'bg-white/[0.1] shadow-[0_8px_28px_rgba(0,0,0,0.35)]' : 'hover:bg-white/[0.05]',
          chat.isMuted && 'opacity-[0.88]',
        )}
      >
        {editMode && (
          <div className="flex items-center pl-2 pr-1 md:hidden">
            <span
              className="inline-flex h-9 w-7 items-center justify-center rounded-full text-white/45"
              aria-hidden
            >
              ≡
            </span>
          </div>
        )}
        <Link
          href={chatHref(chat)}
          className={cn('flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5', editMode && 'pl-2')}
          onClick={() => useUiStore.getState().setSidebarOpen(false)}
        >
          <div className="relative h-11 w-11 shrink-0">
            <SafeAvatar
              url={rawAvatar}
              label={chatInitial(chat, t)}
              className="h-11 w-11 rounded-full ring-1 ring-white/12"
              fallbackClassName="bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-[0.9rem] text-white"
            />
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
              {chat.isPinned && (
                <span
                  className="shrink-0 text-[0.7rem] text-white/45"
                  title={t('pinned')}
                  aria-hidden
                >
                  📌
                </span>
              )}
              <span
                className={cn(
                  'shrink-0 text-[0.7rem] tabular-nums text-white/50',
                  chat.unreadCount > 0 && 'font-semibold text-[#3390ec]',
                )}
              >
                {timeLabel}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <p
                className={cn(
                  'min-w-0 flex-1 truncate text-[12.5px] leading-snug',
                  isTyping ? 'text-emerald-300/90' : 'text-white/55',
                )}
              >
                {preview}
              </p>
              {chat.unreadCount > 0 && (
                <span className="flex h-[1.05rem] min-w-[1.05rem] shrink-0 items-center justify-center rounded-full bg-[#3390ec] px-1 text-[9px] font-bold leading-none text-white shadow-none">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="relative hidden shrink-0 items-center pr-1 md:flex">
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
