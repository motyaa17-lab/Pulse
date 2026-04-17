'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { useLanguageStore } from '@/stores/language-store';
import { useT } from '@/lib/i18n';
import type { MeUserDto } from '@/lib/types';

type SettingsTab = 'general' | 'privacy';

export default function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<SettingsTab>('general');

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });

  const patchShareLastSeen = useMutation({
    mutationFn: (shareLastSeen: boolean) =>
      apiFetch<MeUserDto>('/users/me', { method: 'PATCH', body: { shareLastSeen } }),
    onSuccess: (data) => {
      qc.setQueryData(['me'], data);
    },
  });

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

  const shareLastSeen = me?.shareLastSeen !== false;

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/chats" className="text-sm text-accent">
        ← {t('backToChats')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t('settings')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('settingsIntro')}</p>

      <div className="mt-6 flex gap-2 border-b border-line pb-2">
        {(['general', 'privacy'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium ${
              tab === id
                ? 'bg-surface-elevated text-ink ring-1 ring-line'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {id === 'general' ? t('settingsTabGeneral') : t('settingsTabPrivacy')}
          </button>
        ))}
      </div>

      {tab === 'general' ? (
        <>
          <section className="mt-6 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4">
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
          </section>
        </>
      ) : (
        <section className="mt-6 space-y-4 rounded-2xl border border-line bg-surface-elevated p-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{t('privacyLastSeenTitle')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {t('privacyLastSeenHint')}
            </p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/70 bg-surface-muted/30 px-3 py-3 dark:border-line/45 dark:bg-surface-muted/15">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-accent"
              checked={shareLastSeen}
              disabled={!me || patchShareLastSeen.isPending}
              onChange={(e) => {
                const next = e.target.checked;
                patchShareLastSeen.mutate(next);
              }}
            />
            <span className="text-sm text-ink">{t('showLastSeenToOthers')}</span>
          </label>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-line bg-surface-elevated p-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full rounded-xl border border-red-500/40 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5"
        >
          {t('signOut')}
        </button>
      </section>
    </div>
  );
}
