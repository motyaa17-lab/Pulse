'use client';

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
  const isChatRoute = pathname?.startsWith('/chats/') ?? false;

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#070B14]">
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-20 w-full transition-transform md:static md:w-[min(100%,420px)] md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // Mobile: one-screen navigation (no split view)
          isChatRoute && 'hidden md:block',
        )}
      >
        <div className="flex h-full flex-col border-r border-white/10 bg-[#070B14]">
          <ChatSidebar />
        </div>
      </div>
      {!sidebarOpen && (
        <button
          type="button"
          className="fixed left-3 top-3 z-30 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white shadow-sm backdrop-blur md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label={t('mobileOpenChatsAria')}
        >
          {t('chats')}
        </button>
      )}
      <main className={cn('relative min-h-0 min-w-0 flex-1', !isChatRoute && 'hidden md:block')}>
        {children}
      </main>
    </div>
  );
}
