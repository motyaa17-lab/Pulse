import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Доступ запрещён — Pulse',
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0b1020] px-6 text-center text-white">
      <p className="font-display text-4xl font-semibold tracking-tight">403</p>
      <h1 className="mt-2 text-lg font-medium text-white/90">Недостаточно прав</h1>
      <p className="mt-2 max-w-md text-sm text-white/55">
        Эта область доступна только администраторам. Если вам нужен доступ, обратитесь к владельцу
        сервиса.
      </p>
      <Link
        href="/chats"
        className="mt-8 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
      >
        Вернуться в чаты
      </Link>
    </div>
  );
}
