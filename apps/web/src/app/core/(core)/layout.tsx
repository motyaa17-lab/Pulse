'use client';

import { BootstrapGate } from '@/core/bootstrap/bootstrap-gate';

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return <BootstrapGate>{children}</BootstrapGate>;
}
