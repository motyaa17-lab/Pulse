'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';

export function TgPage({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('tg-page', className)}>{children}</div>;
}

export function TgNav({
  title,
  backHref,
  backLabel,
  right,
}: {
  title: React.ReactNode;
  backHref: string;
  backLabel: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="tg-nav">
      <Link href={backHref} className="tg-nav-back">
        {backLabel}
      </Link>
      <div className="tg-nav-title">{title}</div>
      <div className="w-10">{right}</div>
    </div>
  );
}

export function TgCard({
  title,
  children,
  className,
}: {
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('tg-card', className)}>
      {title ? <div className="tg-card-title">{title}</div> : null}
      {children}
    </section>
  );
}

export function TgRow({
  children,
  href,
  onClick,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={cn('tg-row', className)}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn('tg-row', className)}>
      {children}
    </button>
  );
}

export function TgIconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink-muted dark:bg-white/8 dark:text-white/90">
      {children}
    </span>
  );
}

export function TgChevron() {
  return <span className="tg-chevron">›</span>;
}
