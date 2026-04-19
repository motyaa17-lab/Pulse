'use client';

import { AuthGate } from '@/components/pulse/auth-gate';
import { SearchModal } from '@/components/pulse/search-modal';
import { DesktopNotificationBridge } from '@/components/pulse/desktop-notification-bridge';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {children}
      <SearchModal />
      <DesktopNotificationBridge />
    </AuthGate>
  );
}
