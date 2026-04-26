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

function SegmentedPill({
  value,
  items,
  onChange,
}: {
  value: string;
  items: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const update = () => {
    const wrap = wrapRef.current;
    const btn = btnRefs.current[value];
    if (!wrap || !btn) return;
    const wr = wrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const left = br.left - wr.left;
    const width = br.width;
    // Guard against ResizeObserver feedback loops: only update state if the numbers actually changed.
    setPill((cur) => {
      if (cur && Math.abs(cur.left - left) < 0.5 && Math.abs(cur.width - width) < 0.5) return cur;
      return { left, width };
    });
  };

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items.length]);

  useEffect(() => {
    update();
    const onResize = () => update();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative flex shrink-0 items-center rounded-xl bg-surface-elevated/70 p-1 shadow-sm ring-1 ring-line/60 dark:bg-white/[0.08] dark:ring-white/[0.10]"
    >
      {pill ? (
        <div
          aria-hidden
          className="absolute bottom-1 top-1 rounded-[0.65rem] bg-surface-muted shadow-sm transition-[transform,width] duration-200 ease-out dark:bg-white/15"
          style={{ width: pill.width, transform: `translateX(${pill.left}px)` }}
        />
      ) : null}
      {items.map((seg) => {
        const activeSeg = value === seg.id;
        return (
          <button
            key={seg.id}
            ref={(el) => {
              btnRefs.current[seg.id] = el;
            }}
            type="button"
            onClick={() => onChange(seg.id)}
            className={cn(
              'relative z-[1] min-w-[4.1rem] rounded-[0.65rem] px-3 py-1.5 text-[13px] font-semibold transition',
              activeSeg
                ? 'text-ink dark:text-white'
                : 'text-ink-muted hover:text-ink dark:text-white/70 dark:hover:text-white',
            )}
            aria-pressed={activeSeg}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

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
  if (i < 0) return <span className="text-ink dark:text-white/90">{text}</span>;
  const before = text.slice(0, i);
  const match = text.slice(i, i + needle.length);
  const after = text.slice(i + needle.length);
  return (
    <span className="text-ink dark:text-white/90">
      {before}
      <mark className="rounded bg-accent/20 px-0.5 text-ink dark:bg-sky-500/35 dark:text-white">
        {match}
      </mark>
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
    'block w-full px-3 py-2.5 text-left text-[13px] font-medium text-ink transition hover:bg-surface-muted/80 dark:text-white/90 dark:hover:bg-white/10';
  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-[60] mt-2 min-w-[13.5rem] overflow-hidden rounded-2xl border border-line/70 bg-surface-elevated/95 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-[26px] dark:border-white/12 dark:bg-[rgb(var(--tg-bg))]/92 dark:shadow-[0_22px_60px_rgba(0,0,0,0.6)]"
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
  const pathnameBare = pathname?.split('?')[0] ?? '';
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(accessToken) && sessionStatus === 'ok';
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
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
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
  // Reserved for future interactions (e.g., measuring story strip), currently unused.
  const listScrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery,
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
      enabled: canQuery,
    },
  );

  const activeChatId = useMemo(() => {
    const parts = pathnameBare.split('/').filter(Boolean);
    return parts[0] === 'chats' && parts[1] ? parts[1] : null;
  }, [pathnameBare]);

  const unreadTotal = useMemo(() => {
    const rows = data ?? [];
    let sum = 0;
    for (const c of rows) {
      if (activeChatId && c.id === activeChatId) continue;
      if (c.unreadCount > 0) sum += c.unreadCount;
    }
    return sum;
  }, [activeChatId, data]);

  const baseTitle = t('chats');
  const nextTitle =
    unreadTotal > 0 ? `(${unreadTotal}) ${baseTitle} · Pulse` : `${baseTitle} · Pulse`;
  const lastTitleRef = useRef<string>('');
  const lastBadgeRef = useRef<number | null>(null);

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
    console.count('[EFFECT] chat-sidebar focus-event listener');
    console.log('deps:', {});
    const onFocusEvt = () => {
      setSearchFocused(true);
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener('pulse:focus-sidebar-search', onFocusEvt);
    return () => window.removeEventListener('pulse:focus-sidebar-search', onFocusEvt);
  }, []);

  useEffect(() => {
    console.count('[EFFECT] chat-sidebar create-menu outside-click');
    console.log('deps:', { createMenuPlacement });
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
    console.count('[EFFECT] chat-sidebar search outside-click');
    console.log('deps:', { searchFocused });
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
    console.count('[EFFECT] chat-sidebar search escape-key');
    console.log('deps:', { searchFocused });
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
    console.count('[EFFECT] chat-sidebar pending focus');
    console.log('deps:', {
      pendingSidebarSearchFocus,
      pathnameBare: (pathname?.split('?')[0] ?? '') || null,
      sidebarOpen,
    });
    if (!pendingSidebarSearchFocus) return;
    const bare = pathname?.split('?')[0] ?? '';
    if (bare !== '/chats' && bare !== '/chats/') return;
    // Only update store if values actually change (avoids update loops).
    console.count('[ACTION] chat-sidebar setPendingSidebarSearchFocus(false)');
    console.log('deps:', { from: true, to: false });
    setPendingSidebarSearchFocus(false);
    if (!sidebarOpen) {
      console.count('[ACTION] chat-sidebar setSidebarOpen(true)');
      console.log('deps:', { from: sidebarOpen, to: true });
      setSidebarOpen(true);
    }
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('pulse:focus-sidebar-search'));
    });
  }, [
    pendingSidebarSearchFocus,
    pathname,
    sidebarOpen,
    setPendingSidebarSearchFocus,
    setSidebarOpen,
  ]);

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
    console.count('[EFFECT] chat-sidebar openMenu auto-close');
    console.log('deps:', { openMenuId: openMenuId ?? null });
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    const t = window.setTimeout(() => window.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', close);
    };
  }, [openMenuId]);

  useEffect(() => {
    console.count('[EFFECT] chat-sidebar socket chat:updated');
    console.log('deps:', {
      hasToken: Boolean(accessToken),
      pathnameBare: (pathname?.split('?')[0] ?? '') || null,
    });
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
    console.count('[EFFECT] title/badge RUN');
    console.log('deps:', {
      chatsLen: data?.length ?? 0,
      unreadTotal,
      activeChatId,
      pathnameBare: pathnameBare || null,
    });

    // Update title only if it actually changes (avoid storms).
    if (typeof document !== 'undefined' && lastTitleRef.current !== nextTitle) {
      console.count('[ACTION] setTitle');
      console.log('deps:', { from: lastTitleRef.current || null, to: nextTitle });
      document.title = nextTitle;
      lastTitleRef.current = nextTitle;
    }

    // Update app badge only on primitive change.
    if (
      typeof navigator !== 'undefined' &&
      ('setAppBadge' in navigator || 'clearAppBadge' in navigator)
    ) {
      const nextBadge = unreadTotal > 0 ? unreadTotal : 0;
      if (lastBadgeRef.current !== nextBadge) {
        console.count('[ACTION] setUnreadBadge');
        console.log('deps:', { from: lastBadgeRef.current, to: nextBadge });
        lastBadgeRef.current = nextBadge;
        void (
          nextBadge > 0
            ? (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(
                nextBadge,
              )
            : (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
        ).catch(() => undefined);
      }
    }
  }, [activeChatId, data?.length, nextTitle, pathnameBare, unreadTotal]);

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

  // Stories are shown compact near the title now.
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
                className={cn(
                  'inline-flex min-h-[36px] items-center rounded-full bg-surface-elevated/70 px-3 text-[14px] font-semibold text-accent shadow-sm ring-1 ring-line/60',
                  'dark:bg-white/[0.08] dark:text-[#58a6ff] dark:ring-white/[0.10]',
                  'md:hidden',
                )}
                aria-pressed={editMode}
              >
                {editMode ? t('chatsDone') : t('chatsEdit')}
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 md:justify-start">
                <h1 className="min-w-0 truncate text-center font-display text-[20px] font-semibold tracking-tight text-ink dark:text-white md:text-left md:text-4xl">
                  {t('chats')}
                </h1>
                {/* Telegram iOS: small story circles next to title */}
                <div className="hidden max-w-[46vw] min-w-0 md:hidden sm:block">
                  <StoriesStrip variant="compact" embedded />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center overflow-hidden rounded-full bg-surface-elevated/70 shadow-sm ring-1 ring-line/60 dark:bg-white/[0.08] dark:ring-white/[0.10] md:hidden">
                <button
                  type="button"
                  className="grid h-9 w-10 place-items-center text-ink-muted transition active:bg-line/25 dark:text-white/75 dark:active:bg-white/[0.08]"
                  onClick={() => router.push('/settings/security')}
                  aria-label="Shield"
                >
                  <span className="text-[17px]" aria-hidden>
                    🛡️
                  </span>
                </button>
                <div className="h-6 w-px bg-line/60 dark:bg-white/[0.10]" aria-hidden />
                <div className="relative shrink-0" ref={createHeaderWrapRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setCreateMenuPlacement((p) => (p === 'header' ? 'closed' : 'header'))
                    }
                    className="grid h-9 w-10 place-items-center text-ink transition active:bg-line/25 dark:text-white/85 dark:active:bg-white/[0.08]"
                    aria-expanded={createMenuPlacement === 'header'}
                    aria-haspopup="menu"
                    aria-label={t('sidebarCreateMenuAria')}
                  >
                    <span className="text-[18px]" aria-hidden>
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
                <div className="h-6 w-px bg-line/60 dark:bg-white/[0.10]" aria-hidden />
                <button
                  type="button"
                  className="grid h-9 w-10 place-items-center text-ink-muted transition active:bg-line/25 dark:text-white/75 dark:active:bg-white/[0.08]"
                  onClick={() => router.push('/compose')}
                  aria-label="New message"
                >
                  <span className="text-[17px]" aria-hidden>
                    ✍️
                  </span>
                </button>
              </div>

              {/* Desktop: keep the + button with the same menu */}
              <div className="relative hidden shrink-0 md:block" ref={createHeaderWrapRef}>
                <button
                  type="button"
                  onClick={() =>
                    setCreateMenuPlacement((p) => (p === 'header' ? 'closed' : 'header'))
                  }
                  className="grid h-12 w-12 place-items-center rounded-full border border-line/70 bg-surface-elevated/70 text-xl font-light text-ink shadow-sm backdrop-blur transition hover:bg-surface-elevated/90 dark:border-white/10 dark:bg-white/[0.07] dark:text-white/90"
                  aria-expanded={createMenuPlacement === 'header'}
                  aria-haspopup="menu"
                  aria-label={t('sidebarCreateMenuAria')}
                >
                  ＋
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
            </div>
          </div>

          <div ref={searchBlockRef} className="relative mt-3 md:mt-4">
            <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface-elevated/70 px-3.5 py-2 shadow-inner dark:border-white/[0.08] dark:bg-[rgb(var(--tg-search))] md:px-4 md:py-2.5">
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
          <div className="mt-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SegmentedPill
                value={folderId ? `folder:${folderId}` : chip}
                items={[
                  { id: 'all', label: t('chatsChipAll') },
                  { id: 'telegram', label: t('chatsChipTelegram') },
                  { id: 'channels', label: t('chatsChipChannels') },
                  { id: 'groups', label: t('chatsChipGroups') },
                  { id: 'direct', label: t('chatsChipDirect') },
                ]}
                onChange={(id) => {
                  setFolderId(null);
                  setChip(id as typeof chip);
                }}
              />
              {(folders?.items ?? []).map((f) => {
                const activeFolder = folderId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setChip('all');
                      setFolderId((cur) => (cur === f.id ? null : f.id));
                    }}
                    className={cn(
                      'shrink-0 rounded-xl bg-surface-elevated/70 px-3 py-2 text-[13px] font-semibold shadow-sm ring-1 ring-line/60 transition dark:bg-white/[0.08] dark:ring-white/[0.10]',
                      activeFolder
                        ? 'text-ink dark:text-white'
                        : 'text-ink-muted hover:bg-surface-elevated/90 hover:text-ink dark:text-white/70 dark:hover:bg-white/[0.10] dark:hover:text-white',
                    )}
                  >
                    {f.title}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Moved to the list as a sticky row to avoid overlaying taps on the first chat row. */}
        </header>

        <div
          ref={listScrollRef}
          className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 pb-[max(1rem,calc(4.25rem+env(safe-area-inset-bottom)))] md:pb-24"
        >
          <div className="sticky top-0 z-10 bg-surface-muted/90 px-3 pb-2 pt-2 backdrop-blur md:bg-transparent dark:bg-[rgb(var(--tg-panel))]/92">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowUnreadOnly((v) => !v)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] transition touch-manipulation',
                  showUnreadOnly
                    ? 'border-accent/80 bg-accent/15 text-ink dark:border-[#3390ec] dark:bg-[#3390ec]/25 dark:text-white'
                    : 'border-line/70 bg-surface-elevated/70 text-ink-muted hover:bg-surface-elevated/90 hover:text-ink dark:border-white/12 dark:bg-white/[0.06] dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white/90',
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
              className="relative flex w-full items-center gap-3 px-3 py-2 text-left transition active:bg-line/25 dark:active:bg-white/[0.08]"
              aria-label={t('archivedChats')}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#2f98ff] text-white shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                <div className="truncate text-[16px] font-semibold leading-tight text-ink dark:text-white">
                  {t('archivedChats')}
                </div>
                <div className="mt-0.5 truncate text-[14px] leading-snug text-ink-muted dark:text-white/55">
                  {showArchived ? t('archivedTapToHide') : t('archivedTapToShow')}
                </div>
              </div>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-line/70 px-2 text-[12px] font-bold text-ink-muted dark:bg-white/12 dark:text-white/80">
                {archivedRaw.length}
              </span>
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 h-px bg-line/60 dark:bg-white/[0.10] left-[5rem]"
              />
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
            <div className="mb-0">
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
                className=""
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
          <div className="">
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
            <div className="mt-2 opacity-[0.9]">
              <div className="">
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
  const typingIds = useUiStore((s) => s.typingByChat?.[chat.id] ?? []);
  const isTyping = typingIds.length > 0;
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
          'relative flex items-stretch gap-0 transition',
          // Telegram iOS-like pinned subtle background (no rounding)
          chat.isPinned && !active && 'bg-surface-elevated/50 dark:bg-[rgb(var(--tg-pinned))]',
          chat.isMuted && 'opacity-[0.92]',
        )}
      >
        {editMode && (
          <div className="flex items-center pl-2 pr-1 md:hidden">
            <span
              className="inline-flex h-9 w-7 items-center justify-center rounded-full text-ink-muted dark:text-white/45"
              aria-hidden
            >
              ≡
            </span>
          </div>
        )}
        <Link
          href={chatHref(chat)}
          className={cn(
            // iOS Telegram: larger avatar + more vertical whitespace
            'relative z-[1] flex min-h-[76px] min-w-0 flex-1 items-center gap-3 px-3 py-3',
            active
              ? 'bg-line/30 dark:bg-white/[0.08]'
              : 'active:bg-line/25 dark:active:bg-white/[0.08]',
            editMode && 'pl-2',
          )}
          onClick={() => useUiStore.getState().setSidebarOpen(false)}
        >
          <div className="relative h-14 w-14 shrink-0">
            <SafeAvatar
              url={rawAvatar}
              label={chatInitial(chat, t)}
              className="h-14 w-14 rounded-full ring-1 ring-line/35 dark:ring-white/12"
              fallbackClassName="bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-[1.05rem] text-white"
            />
            {chat.isMuted ? (
              <span
                className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-ink/55 ring-2 ring-surface-muted dark:bg-white/65 dark:ring-[rgb(var(--tg-panel))]"
                title={t('mutedTooltip')}
              />
            ) : (
              chat.type === 'DIRECT' &&
              chat.peer?.isOnline && (
                <span
                  className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#4dcd5e] ring-[2.5px] ring-surface-muted dark:ring-[rgb(var(--tg-panel))]"
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
                  'min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight text-ink dark:text-white',
                )}
              >
                {label}
              </span>
              {chat.isPinned && (
                <span
                  className="shrink-0 text-[0.7rem] text-ink-muted dark:text-white/45"
                  title={t('pinned')}
                  aria-hidden
                >
                  📌
                </span>
              )}
              <span
                className={cn(
                  'shrink-0 text-[13px] tabular-nums text-ink-muted dark:text-white/50',
                  chat.unreadCount > 0 && 'font-semibold text-accent dark:text-[#58a6ff]',
                )}
              >
                {timeLabel}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <p
                className={cn(
                  'min-w-0 flex-1 truncate text-[14px] leading-snug',
                  isTyping
                    ? 'text-emerald-600 dark:text-emerald-300/90'
                    : 'text-ink-muted dark:text-white/55',
                )}
              >
                {preview}
              </p>
              {chat.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold leading-none text-white shadow-none dark:bg-[#3390ec]">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="relative z-[1] hidden shrink-0 items-center pr-1 md:flex">
          <motion.button
            type="button"
            className={cn(
              'flex h-10 w-9 items-center justify-center rounded-2xl text-ink-muted transition hover:bg-surface-muted/70 hover:text-ink dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white',
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
                className="absolute right-0 top-full z-50 mt-1 min-w-[9.5rem] rounded-2xl border border-line/70 bg-surface-elevated/95 py-1 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-[26px] dark:border-white/12 dark:bg-[rgb(var(--tg-bg))]/92 dark:shadow-[0_22px_60px_rgba(0,0,0,0.6)]"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={pinPending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-ink transition hover:bg-surface-muted/80 disabled:opacity-50 dark:text-white/90 dark:hover:bg-white/10"
                  onClick={() => onPinToggle(!chat.isPinned)}
                >
                  {chat.isPinned ? t('unpin') : t('pin')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={archivePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-ink transition hover:bg-surface-muted/80 disabled:opacity-50 dark:text-white/90 dark:hover:bg-white/10"
                  onClick={() => onArchiveToggle(!chat.isArchived)}
                >
                  {chat.isArchived ? t('unarchive') : t('archive')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={mutePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-ink transition hover:bg-surface-muted/80 disabled:opacity-50 dark:text-white/90 dark:hover:bg-white/10"
                  onClick={() => onMuteToggle(!chat.isMuted)}
                >
                  {chat.isMuted ? t('unmute') : t('mute')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={hidePending}
                  className="w-full px-3 py-2 text-left text-[12.5px] font-medium text-ink transition hover:bg-surface-muted/80 disabled:opacity-50 dark:text-white/90 dark:hover:bg-white/10"
                  onClick={() => confirmHide()}
                >
                  {t('hideChat')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* iOS-style inset separator: starts after avatar + gaps (edit handle only on small screens). */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute bottom-0 right-0 z-0 h-px bg-line/60 dark:bg-white/[0.10]',
            // px-3 + h-14 + gap-3 = 0.75rem + 3.5rem + 0.75rem = 5rem
            // md+: reorder handle hidden; row still uses pl-2 in edit mode
            editMode ? 'left-[7.25rem] md:left-[4.75rem]' : 'left-[5rem]',
          )}
        />
      </div>
    </motion.div>
  );
}
