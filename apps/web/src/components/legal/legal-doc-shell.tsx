import type { ReactNode } from 'react';
import Link from 'next/link';

export function LegalDocShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-[#0b1020] dark:text-slate-100">
      <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0e1621]/95">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/login"
            className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            Pulse
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-white/70">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Условия использования
            </Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">
              Вход
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 pb-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <div className="mt-8 max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300 [&_a]:text-sky-600 [&_a]:underline-offset-2 hover:[&_a]:underline dark:[&_a]:text-sky-400 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:scroll-mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_li]:mt-1 [&_p]:mt-3 [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}
