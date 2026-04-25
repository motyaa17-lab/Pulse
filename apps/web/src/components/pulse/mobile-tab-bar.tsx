'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ChatListItem, MeUserDto } from '@/lib/types';
import { cn } from '@/lib/cn';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

function hideMobileTabBar(pathname: string | null): boolean {
  const bare = pathname?.split('?')[0] ?? '';
  const parts = bare.split('/').filter(Boolean);
  if (parts[0] !== 'chats') return false;
  if (parts.length < 2) return false;
  if (parts[1] === 'explore') return false;
  return true;
}

function TabItem({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-w-0 flex-1 touch-manipulation select-none flex-col items-center gap-0.5 py-1.5 transition active:scale-[0.98]',
        active
          ? 'text-accent dark:text-[#3390ec]'
          : 'text-ink-muted hover:text-ink dark:text-white/65 dark:hover:text-white/85',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'relative grid h-10 w-[2.75rem] place-items-center rounded-2xl transition',
          active &&
            'bg-accent/10 ring-1 ring-accent/25 dark:bg-[#3390ec]/18 dark:ring-1 dark:ring-[#3390ec]/35',
        )}
      >
        {children}
      </span>
      <span className="max-w-full truncate px-0.5 text-[0.62rem] font-semibold leading-tight tracking-tight">
        {label}
      </span>
    </Link>
  );
}

function ContactsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CallsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const setPending = useUiStore((s) => s.setPendingSidebarSearchFocus);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token) && sessionStatus === 'ok';

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
    enabled: canQuery,
  });

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    staleTime: 20_000,
    enabled: canQuery,
  });

  if (hideMobileTabBar(pathname)) return null;

  const bare = pathname?.split('?')[0] ?? '';
  const contactsActive = bare === '/contacts';
  const callsActive = bare === '/calls';
  const chatsActive = /^\/chats\/?$/.test(bare) || bare.startsWith('/chats/explore');
  const settingsActive =
    bare.startsWith('/settings') || bare.startsWith('/profile') || bare.startsWith('/sessions');

  const unreadTotal = (chats ?? []).reduce(
    (n, c) => n + (c.unreadCount > 0 ? c.unreadCount : 0),
    0,
  );
  const unreadLabel = unreadTotal > 9999 ? '9…' : unreadTotal > 99 ? '99+' : String(unreadTotal);

  const onSearchTap = () => {
    const p = pathname?.split('?')[0] ?? '';
    if (p === '/chats' || p === '/chats/') {
      setSidebarOpen(true);
      window.dispatchEvent(new CustomEvent('pulse:focus-sidebar-search'));
      return;
    }
    setPending(true);
    router.push('/chats');
  };

  const initial = (me?.displayName ?? me?.username ?? '?').slice(0, 1).toUpperCase();

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[200] hidden max-md:flex max-md:justify-center max-md:px-3 max-md:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Capture taps inside tabbar zone to prevent “tap-through” to chat rows. */}
      <div className="absolute inset-0 z-0" aria-hidden />
      <div className="pointer-events-auto relative z-10 flex w-full max-w-[420px] items-end gap-2">
        <nav
          role="navigation"
          className="flex min-w-0 flex-1 items-stretch justify-around rounded-[26px] border border-line/70 bg-surface-elevated/95 px-1 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#1a242e]/98 dark:shadow-[0_12px_40px_rgba(0,0,0,0.62)]"
          aria-label={t('tabBarNavAria')}
        >
          <TabItem href="/contacts" active={contactsActive} label={t('tabBarContacts')}>
            <ContactsIcon />
          </TabItem>
          <TabItem href="/calls" active={callsActive} label={t('tabBarCalls')}>
            <CallsIcon />
          </TabItem>
          <TabItem href="/chats" active={chatsActive} label={t('tabBarChats')}>
            {unreadTotal > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-[#e53935] px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                {unreadLabel}
              </span>
            )}
            <ChatsIcon />
          </TabItem>
          <TabItem href="/settings" active={settingsActive} label={t('tabBarSettings')}>
            <SafeAvatar
              url={me?.avatarUrl ?? null}
              label={initial}
              className="h-[1.35rem] w-[1.35rem] rounded-full ring-1 ring-line/45 dark:ring-white/25"
              fallbackClassName="text-[10px] font-bold text-ink/85 dark:text-white/90"
            />
          </TabItem>
        </nav>
        <button
          type="button"
          onClick={onSearchTap}
          className="pointer-events-auto grid h-12 w-12 shrink-0 touch-manipulation place-items-center rounded-full border border-line/70 bg-surface-elevated/95 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition hover:bg-surface-elevated active:scale-[0.97] dark:border-white/[0.12] dark:bg-[#1a242e]/98 dark:text-white/90 dark:shadow-[0_12px_40px_rgba(0,0,0,0.62)] dark:hover:bg-white/[0.08]"
          aria-label={t('search')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
