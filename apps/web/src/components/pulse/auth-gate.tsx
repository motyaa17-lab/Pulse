'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const publicPaths = ['/login', '/signup', '/onboarding'];
    if (!token && !publicPaths.includes(pathname)) {
      router.replace('/login');
      return;
    }
    if (token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [token, pathname, router]);

  return <>{children}</>;
}
