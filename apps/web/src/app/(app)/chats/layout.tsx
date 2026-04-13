'use client';

import { ChatSidebar } from '@/components/pulse/chat-sidebar';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/cn';

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-surface">
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-20 w-[min(100%,360px)] transition-transform md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col border-r border-line/80 bg-sidebar dark:border-line/50">
          <ChatSidebar />
        </div>
      </div>
      {!sidebarOpen && (
        <button
          type="button"
          className="fixed left-3 top-3 z-30 rounded-full border border-line bg-surface-elevated px-3 py-1 text-xs shadow-sm md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          Chats
        </button>
      )}
      <main className="relative min-h-0 min-w-0 flex-1">{children}</main>
    </div>
  );
}
