'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { useLanguageStore } from '@/stores/language-store';
import { useT } from '@/lib/i18n';

export default function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useT();
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
        ← {t('backToChats')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t('settings')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('settingsIntro')}</p>

      <section className="mt-8 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">{t('appearance')}</h2>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                theme === mode
                  ? 'border-accent bg-accent/10 text-ink'
                  : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              {mode === 'light'
                ? t('themeLight')
                : mode === 'dark'
                  ? t('themeDark')
                  : t('themeSystem')}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">{t('languageSection')}</h2>
        <div className="flex flex-wrap gap-2">
          {(['en', 'ru'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded-full border px-3 py-1 text-xs uppercase ${
                language === lang
                  ? 'border-accent bg-accent/10 text-ink'
                  : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              {lang === 'en' ? t('wordEnglish') : t('wordRussian')}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">{t('sessions')}</h2>
        <p className="text-xs text-ink-muted">{t('sessionsIntro')}</p>
        <Link
          href="/sessions"
          className="inline-flex rounded-xl border border-line px-3 py-2 text-sm text-accent"
        >
          {t('openDeviceList')}
        </Link>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
        <h2 className="text-sm font-semibold text-ink">{t('account')}</h2>
        <Link
          href="/profile"
          className="inline-flex rounded-xl border border-line px-3 py-2 text-sm text-accent"
        >
          {t('myProfile')}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-500"
        >
          {t('signOut')}
        </button>
      </section>
    </div>
  );
}
