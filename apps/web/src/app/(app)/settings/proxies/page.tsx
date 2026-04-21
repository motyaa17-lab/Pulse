'use client';

import Link from 'next/link';
import { useUiStore } from '@/stores/ui-store';
import { useT } from '@/lib/i18n';

export default function ProxiesSettingsPage() {
  const t = useT();
  const theme = useUiStore((s) => s.theme);
  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('settings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settingsProxies')}</span>
        <span className="w-10" />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('settingsProxies')}
          </h2>
        </div>
        <div className="space-y-3 px-4 pb-4 text-sm text-white/70 md:text-ink-muted">
          <p>
            Telegram iOS uses proxies at the connection layer. In Pulse Web, proxies are handled by
            your browser/network, so this screen will focus on UI parity and future server-side
            proxy support.
          </p>
          <p>
            Current theme mode:{' '}
            <span className="font-semibold text-white md:text-ink">{theme}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
