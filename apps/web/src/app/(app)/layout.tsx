'use client';

import { AuthGate } from '@/components/pulse/auth-gate';
import { GlobalSearchShortcuts } from '@/components/pulse/global-search-shortcuts';
import { DesktopNotificationBridge } from '@/components/pulse/desktop-notification-bridge';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {children}
      <GlobalSearchShortcuts />
      <DesktopNotificationBridge />
    </AuthGate>
  );
}
