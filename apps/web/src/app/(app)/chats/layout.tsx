'use client';

import { useEffect } from 'react';
import { ChatSidebar } from '@/components/pulse/chat-sidebar';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/cn';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n';

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const pathname = usePathname();
  const barePath = pathname?.split('?')[0] ?? '';
  const isChatRoute = /^\/chats\/[^/]+$/.test(barePath);
  const isChatIndex = barePath === '/chats' || barePath === '/chats/';

  useEffect(() => {
    if (isChatRoute) {
      setSidebarOpen(false);
    } else if (isChatIndex) {
      setSidebarOpen(true);
    }
  }, [barePath, isChatIndex, isChatRoute, setSidebarOpen]);

  const showListBackdrop = isChatRoute && sidebarOpen;

  return (
    <div className="mobile-chats-shell relative flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#0e1621]">
      {showListBackdrop && (
        <button
          type="button"
          className="fixed inset-0 z-[35] bg-black/45 backdrop-blur-[1px] md:hidden"
          aria-label={t('mobileCloseChatsListAria')}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          'flex h-full min-h-0 w-[min(100%,420px)] max-w-full shrink-0 flex-col border-r border-black/20 bg-[#17212b] transition-[transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:relative md:z-20 md:translate-x-0',
          'fixed inset-y-0 left-0 z-40 md:static',
          sidebarOpen
            ? 'translate-x-0 shadow-[8px_0_32px_rgba(0,0,0,0.45)]'
            : '-translate-x-full md:translate-x-0 md:shadow-none',
        )}
      >
        <ChatSidebar />
      </div>
      <main
        className={cn(
          'relative flex min-h-0 min-w-0 flex-1 flex-col',
          !isChatRoute && 'hidden md:flex',
        )}
      >
        {children}
      </main>
    </div>
  );
}
