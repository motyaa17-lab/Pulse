'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import { CoreChatListPanel } from '@/core/chat/core-chat-list-panel';

export default function CoreChatsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname?.split('?')[0] ?? '';
  const isThread = /^\/core\/chats\/[^/]+$/.test(bare);

  return (
    <div className="relative flex min-h-0 w-full flex-1 overflow-hidden bg-surface text-ink dark:bg-[rgb(var(--tg-bg))] dark:text-white md:h-[100dvh] md:max-h-[100dvh]">
      <aside
        className={cn(
          'flex h-full min-h-0 w-[min(100%,420px)] max-w-full shrink-0 flex-col overflow-hidden border-r border-line/60 bg-surface-muted dark:border-white/[0.10] dark:bg-[rgb(var(--tg-panel))] md:relative md:z-20',
          isThread ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">Чаты (Core)</div>
          <Link
            href="/core/profile"
            className="text-xs font-semibold text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white"
          >
            Профиль
          </Link>
        </div>
        <CoreChatListPanel />
      </aside>

      <main className={cn('relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden')}>
        {children}
      </main>
    </div>
  );
}
