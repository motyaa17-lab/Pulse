'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function WalletSettingsPage() {
  const t = useT();
  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('settings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settingsWallet')}</span>
        <span className="w-10" />
      </div>
      <p className="mt-4 text-sm text-white/55 md:text-ink-muted">
        Wallet is out of scope for now.
      </p>
    </div>
  );
}
