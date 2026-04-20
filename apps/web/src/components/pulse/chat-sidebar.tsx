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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [storiesExpanded, setStoriesExpanded] = useState(false);
  const storiesPullPxRef = useRef(0);
  const storiesRafRef = useRef<number | null>(null);
  const storiesWrapRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
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

  const pinnedRaw = listFiltered.filter((c: ChatListItem) => c.isPinned && !c.isArchived);
  const restRaw = listFiltered.filter((c: ChatListItem) => !c.isPinned && !c.isArchived);
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

  const STORIES_COMPACT_H = 72;
  const STORIES_FULL_H = 132;
  const storiesExtraMax = STORIES_FULL_H - STORIES_COMPACT_H;
  const storiesHeightMobile = storiesExpanded ? STORIES_FULL_H : STORIES_COMPACT_H;
  const storiesCollapseTimerRef = useRef<number | null>(null);
  const storiesLastAppliedHRef = useRef<number>(STORIES_COMPACT_H);
  const storiesLastAppliedAtRef = useRef<number>(0);

  const setStoriesHeight = (h: number) => {
    const el = storiesWrapRef.current;
    if (!el) return;
    // Only mutate style; avoid rerendering the whole sidebar on scroll.
    el.style.maxHeight = `${h}px`;
  };

  // Keep DOM height in sync when expanded toggles.
  useEffect(() => {
    setStoriesHeight(storiesExpanded ? STORIES_FULL_H : STORIES_COMPACT_H);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storiesExpanded]);

  // Native, passive touch listeners for the pull-to-expand interaction.
  // React synthetic touch events are non-passive and can contribute to scroll jank.
  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop !== 0) return;
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
      storiesPullPxRef.current = 0;
      if (!storiesExpanded) setStoriesHeight(STORIES_COMPACT_H);
    };

    const onTouchMove = (e: TouchEvent) => {
      const start = touchStartYRef.current;
      if (start == null) return;
      if (el.scrollTop !== 0) return;
      if (storiesExpanded) return;
      const y = e.touches[0]?.clientY ?? start;
      const dy = y - start;
      if (dy <= 0) return;

      const nextPull = Math.min(storiesExtraMax, dy);
      storiesPullPxRef.current = nextPull;
      if (storiesRafRef.current != null) return;

      storiesRafRef.current = requestAnimationFrame(() => {
        storiesRafRef.current = null;

        // Throttle layout updates: changing header height forces re-layout of the list below.
        // Apply at ~30fps and only if the delta is meaningful.
        const now = performance.now();
        if (now - storiesLastAppliedAtRef.current < 33) return;
        const nextH = STORIES_COMPACT_H + storiesPullPxRef.current;
        if (Math.abs(nextH - storiesLastAppliedHRef.current) < 3) return;

        storiesLastAppliedAtRef.current = now;
        storiesLastAppliedHRef.current = nextH;
        setStoriesHeight(nextH);
      });
    };

    const end = () => {
      const pulled = storiesPullPxRef.current;
      touchStartYRef.current = null;
      storiesPullPxRef.current = 0;
      if (!storiesExpanded && pulled >= 48) {
        setStoriesExpanded(true);
        return;
      }
      storiesLastAppliedHRef.current = STORIES_COMPACT_H;
      setStoriesHeight(STORIES_COMPACT_H);
    };

    const cancel = () => {
      touchStartYRef.current = null;
      storiesPullPxRef.current = 0;
      const h = storiesExpanded ? STORIES_FULL_H : STORIES_COMPACT_H;
      storiesLastAppliedHRef.current = h;
      setStoriesHeight(h);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    el.addEventListener('touchcancel', cancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', cancel);
    };
  }, [storiesExpanded]);

  // Avoid collapsing stories *during* scroll: it causes a full sidebar rerender and can jank.
  // Instead, debounce the collapse until scrolling settles.
  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!storiesExpanded) return;
      if (el.scrollTop <= 8) return;
      if (storiesCollapseTimerRef.current != null) {
        window.clearTimeout(storiesCollapseTimerRef.current);
      }
      storiesCollapseTimerRef.current = window.setTimeout(() => {
        storiesCollapseTimerRef.current = null;
        setStoriesExpanded(false);
      }, 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (storiesCollapseTimerRef.current != null) {
        window.clearTimeout(storiesCollapseTimerRef.current);
        storiesCollapseTimerRef.current = null;
      }
    };
  }, [storiesExpanded]);

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-[#17212b] text-white">
      {/* Full width on mobile, centered preview on desktop */}
      <div className="flex h-full min-h-0 w-full flex-col md:mx-auto md:max-w-[420px]">
        <header className="shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:pt-10">
          <div className="flex items-end justify-between gap-2.5 md:gap-3">
            <div className="flex min-w-0 flex-1 items-end gap-2.5 md:gap-3">
              <div className="hidden md:block">
                <AppMenu pathname={pathname} />
              </div>
              <h1 className="min-w-0 flex-1 truncate font-display text-2xl font-semibold tracking-tight text-white md:text-4xl">
                {t('chats')}
              </h1>
            </div>
            <div className="relative shrink-0" ref={createHeaderWrapRef}>
              <button
                type="button"
                onClick={() =>
                  setCreateMenuPlacement((p) => (p === 'header' ? 'closed' : 'header'))
                }
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-xl font-light text-white/90 backdrop-blur transition hover:bg-white/12 hover:text-white active:scale-[0.99] md:h-12 md:w-12"
                aria-expanded={createMenuPlacement === 'header'}
                aria-haspopup="menu"
                aria-label={t('sidebarCreateMenuAria')}
              >
                +
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

          <div ref={searchBlockRef} className="relative mt-3 md:mt-4">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#111921] px-3.5 py-2.5 shadow-inner md:px-4 md:py-3">
              <MagnifierIcon className="shrink-0 text-white/55" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full min-w-0 bg-transparent text-[14px] text-white placeholder:text-white/40 outline-none"
                aria-label={t('search')}
                aria-autocomplete="list"
                aria-expanded={searchFocused}
              />
            </div>
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full z-[55] mt-1 max-h-[min(52vh,22rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#111921]/98 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/45">
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
          <div className="mt-2 flex justify-end">
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
        </header>

        <div
          ref={storiesWrapRef}
          className="relative overflow-hidden border-b border-white/[0.06] md:border-b-0"
          style={{ maxHeight: storiesHeightMobile }}
        >
          <div className="hidden md:block">
            <StoriesStrip variant="full" />
          </div>
          <div className="md:hidden">
            <StoriesStrip variant={storiesExpanded ? 'full' : 'compact'} />
          </div>
        </div>

        <div
          ref={listScrollRef}
          className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 pb-[max(1rem,calc(4.25rem+env(safe-area-inset-bottom)))] md:pb-24"
        >
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
          active ? 'bg-white/[0.1] shadow-[0_8px_28px_rgba(0,0,0,0.35)]' : 'hover:bg-white/[0.05]',
          chat.isMuted && 'opacity-[0.88]',
        )}
      >
        <Link
          href={`/chats/${chat.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3"
          onClick={() => useUiStore.getState().setSidebarOpen(false)}
        >
          <div className="relative h-12 w-12 shrink-0">
            <SafeAvatar
              url={rawAvatar}
              label={chatInitial(chat, t)}
              className="h-12 w-12 rounded-full ring-1 ring-white/12"
              fallbackClassName="bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-[0.95rem] text-white"
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
