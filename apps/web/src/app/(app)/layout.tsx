'use client';

import { AuthGate } from '@/components/pulse/auth-gate';
import { SearchModal } from '@/components/pulse/search-modal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {children}
      <SearchModal />
    </AuthGate>
  );
}
