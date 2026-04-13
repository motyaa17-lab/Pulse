'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

export default function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const router = useRouter();

  const logout = async () => {
    try {
      if (refreshToken) {
        await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } });
      }
    } catch {
      /* ignore */
    }
    disconnectSocket();
    clear();
    router.replace('/login');
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/chats" className="text-sm text-accent">
        ← Back to chats
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Settings</h1>
      <p className="mt-2 text-sm text-ink-muted">Appearance, sessions, and account basics.</p>

      <section className="mt-8 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">Appearance</h2>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                theme === t
                  ? 'border-accent bg-accent/10 text-ink'
                  : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">Sessions</h2>
        <p className="text-xs text-ink-muted">Review signed-in devices and revoke access.</p>
        <Link
          href="/sessions"
          className="inline-flex rounded-xl border border-line px-3 py-2 text-sm text-accent"
        >
          Open device list
        </Link>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">Account</h2>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-500"
        >
          Sign out everywhere on this device
        </button>
      </section>
    </div>
  );
}
