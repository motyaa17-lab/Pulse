'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

export function BootstrapSplash() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  return (
    <AnimatePresence>
      {!hasHydrated && (
        <motion.div
          key="bootstrap-splash"
          role="status"
          aria-live="polite"
          aria-label="Loading Pulse"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface"
        >
          <motion.div
            initial={{ opacity: 0.88, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="font-display text-[1.65rem] font-semibold tracking-tight text-ink">Pulse</p>
            <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-ink-muted">
              Xasma
            </p>
          </motion.div>
          <motion.div
            className="mt-10 h-[2px] w-12 overflow-hidden rounded-full bg-line/55 dark:bg-line/50"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.25 }}
          >
            <motion.div
              className="h-full w-1/2 rounded-full bg-accent/90"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 0.75,
                ease: [0.45, 0, 0.55, 1],
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
