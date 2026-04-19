'use client';

import { AuthGate } from '@/components/pulse/auth-gate';
import { GlobalSearchShortcuts } from '@/components/pulse/global-search-shortcuts';
import { DesktopNotificationBridge } from '@/components/pulse/desktop-notification-bridge';
import { MobileTabBar } from '@/components/pulse/mobile-tab-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-[100dvh] pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:min-h-0 md:pb-0">
        {children}
      </div>
      <MobileTabBar />
      <GlobalSearchShortcuts />
      <DesktopNotificationBridge />
    </AuthGate>
  );
}
