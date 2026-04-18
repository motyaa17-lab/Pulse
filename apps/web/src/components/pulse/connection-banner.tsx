'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { reconnectSocket } from '@/lib/socket';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export function ConnectionBanner() {
  const t = useT();
  const token = useAuthStore((s) => s.accessToken);
  const wsConnected = useUiStore((s) => s.wsConnected);

  if (!token || wsConnected !== false) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-0 right-0 top-0 z-[10001] flex justify-center px-3 pt-[max(0.35rem,env(safe-area-inset-top))]',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-full border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-[13px] font-medium text-amber-50 shadow-lg backdrop-blur-md">
        <span className="min-w-0 flex-1">{t('wsOfflineBanner')}</span>
        <button
          type="button"
          onClick={() => reconnectSocket()}
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
        >
          {t('wsReconnect')}
        </button>
      </div>
    </div>
  );
}
