import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Админ — Pulse',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0e1621] text-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-white/[0.08] bg-[#17212b]/95 px-4 py-3 backdrop-blur-md">
        <Link href="/chats" className="text-sm font-semibold text-white/70 hover:text-white">
          ← Чаты
        </Link>
        <span className="font-display text-lg font-semibold tracking-tight">Pulse Admin</span>
        <nav className="ml-auto flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin"
            className="rounded-lg px-2 py-1 text-white/75 hover:bg-white/10 hover:text-white"
          >
            Обзор
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-lg px-2 py-1 text-white/75 hover:bg-white/10 hover:text-white"
          >
            Жалобы и кейсы
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
