'use client';

import Link from 'next/link';
import { useUiStore } from '@/stores/ui-store';
import { useT } from '@/lib/i18n';

export default function PowerSavingSettingsPage() {
  const t = useT();
  const reduceMotion = useUiStore((s) => s.reduceMotion);
  const setReduceMotion = useUiStore((s) => s.setReduceMotion);
  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('settings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settingsPowerSaving')}</span>
        <span className="w-10" />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
          {t('settingsPowerSaving')}
        </h2>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50">
          <input
            type="checkbox"
            className="mt-1"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-white md:text-ink">
              Reduce motion
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              Disables non-essential animations (Telegram-like “Reduce Motion”).
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
