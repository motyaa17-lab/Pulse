'use client';

import { AuthGate } from '@/components/pulse/auth-gate';
import { GlobalSearchShortcuts } from '@/components/pulse/global-search-shortcuts';
import { DesktopNotificationBridge } from '@/components/pulse/desktop-notification-bridge';
import { MobileTabBar } from '@/components/pulse/mobile-tab-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {/* Mobile: bounded flex column so chat list / thread get min-h-0 + scroll; desktop: no extra wrapper. */}
      <div className="max-md:fixed max-md:inset-0 max-md:flex max-md:h-[100svh] max-md:min-h-0 max-md:flex-col max-md:overflow-hidden md:contents">
        {children}
      </div>
      <MobileTabBar />
      <GlobalSearchShortcuts />
      <DesktopNotificationBridge />
    </AuthGate>
  );
}
