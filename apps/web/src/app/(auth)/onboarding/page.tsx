'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';

export default function OnboardingPage() {
  const t = useT();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) router.replace('/login');
  }, [hasHydrated, token, router]);

  const finish = () => router.replace('/chats');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {t('brandPulse')}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{t('onboardingTitle')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('onboardingBody')}</p>
      <ul className="mt-6 space-y-3 text-sm text-ink">
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          {t('onboardingBullet1')}
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          {t('onboardingBullet2')}
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          {t('onboardingBullet3')}
        </li>
      </ul>
      <button
        type="button"
        onClick={async () => {
          try {
            await apiFetch('/users/me');
          } catch {
            /* ignore */
          }
          finish();
        }}
        className="mt-8 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm"
      >
        {t('onboardingCta')}
      </button>
    </motion.div>
  );
}
