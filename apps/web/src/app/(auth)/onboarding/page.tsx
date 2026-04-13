'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  const finish = () => router.replace('/chats');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Pulse</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">You are in</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Pulse keeps threads readable, reactions light, and motion subtle. Explore the demo inbox —
        it is pre-filled with realistic conversations.
      </p>
      <ul className="mt-6 space-y-3 text-sm text-ink">
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          Direct chats collapse noise; channels stay broadcast-clean.
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          Dark mode is tuned for late-night focus sessions.
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          Sessions can be reviewed anytime from settings.
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
        Open Pulse
      </button>
    </motion.div>
  );
}
