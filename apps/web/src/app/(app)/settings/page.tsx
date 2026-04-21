'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore, type VisualPreset } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { useLanguageStore } from '@/stores/language-store';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import type { MeUserDto } from '@/lib/types';
import {
  TgCard,
  TgChevron,
  TgIconBadge,
  TgNav,
  TgPage,
  TgRow,
} from '@/components/telegram/telegram-ui';

export default function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const visualPreset = useUiStore((s) => s.visualPreset);
  const setVisualPreset = useUiStore((s) => s.setVisualPreset);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);
  const hideChatListPreviews = useUiStore((s) => s.hideChatListPreviews);
  const setHideChatListPreviews = useUiStore((s) => s.setHideChatListPreviews);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();

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

  const patchNotif = useMutation({
    mutationFn: (body: {
      notificationSoundEnabled?: boolean;
      notificationDesktopEnabled?: boolean;
      notificationShowPreview?: boolean;
      notificationMentionOnlyInChannels?: boolean;
    }) => apiFetch<MeUserDto>('/users/me', { method: 'PATCH', body }),
    onSuccess: (data) => {
      qc.setQueryData(['me'], data);
      if (data.notificationPrefs) setSoundEnabled(data.notificationPrefs.soundEnabled);
    },
  });

  useEffect(() => {
    const p = me?.notificationPrefs;
    if (!p) return;
    setSoundEnabled(p.soundEnabled);
  }, [me?.notificationPrefs?.soundEnabled, setSoundEnabled, me?.notificationPrefs]);

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
    <TgPage className="dark:bg-[rgb(var(--tg-bg))] dark:text-white">
      <TgNav title={t('settings')} backHref="/chats" backLabel={`← ${t('backToChats')}`} />

      <div className="mt-6 space-y-4">
        <TgCard>
          <TgRow href="/profile">
            <TgIconBadge>👤</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('myProfile')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/settings/proxies">
            <TgIconBadge>🧩</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsProxies')}
            </span>
            <span className="text-[13px] text-ink-muted dark:text-white/45">
              {t('settingsEnergySavingOff')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/settings/wallet">
            <TgIconBadge>💳</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsWallet')}
            </span>
            <TgChevron />
          </TgRow>
        </TgCard>

        <TgCard>
          <TgRow onClick={() => router.push('/saved')}>
            <TgIconBadge>⭐</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsSavedMessages')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/calls">
            <TgIconBadge>📞</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsRecentCalls')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/sessions">
            <TgIconBadge>📱</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsDevices')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/settings/folders">
            <TgIconBadge>🗂️</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsChatFolders')}
            </span>
            <TgChevron />
          </TgRow>
        </TgCard>

        <TgCard>
          <TgRow
            onClick={() =>
              document.getElementById('tg-notifications')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <TgIconBadge>🔔</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsNotificationsAndSounds')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow
            onClick={() =>
              document.getElementById('tg-privacy')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <TgIconBadge>🔒</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsPrivacyRow')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/settings/data">
            <TgIconBadge>💾</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsDataAndStorage')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow
            onClick={() =>
              document.getElementById('tg-appearance')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <TgIconBadge>🎨</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsAppearanceRow')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>
            <TgIconBadge>🌐</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsLanguageRow')}
            </span>
            <span className="text-[13px] text-ink-muted dark:text-white/45">
              {language === 'ru' ? t('wordRussian') : t('wordEnglish')}
            </span>
            <TgChevron />
          </TgRow>
          <TgRow href="/settings/power">
            <TgIconBadge>🔋</TgIconBadge>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {t('settingsPowerSaving')}
            </span>
            <span className="text-[13px] text-ink-muted dark:text-white/45">
              {t('settingsEnergySavingOff')}
            </span>
            <TgChevron />
          </TgRow>
        </TgCard>
      </div>

      <div
        id="tg-notifications"
        className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
          {t('settingsNotificationsTitle')}
        </h2>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50">
          <input
            type="checkbox"
            className="mt-1"
            checked={soundEnabled}
            disabled={!me || patchNotif.isPending}
            onChange={(e) => {
              const v = e.target.checked;
              setSoundEnabled(v);
              patchNotif.mutate({ notificationSoundEnabled: v });
            }}
          />
          <span>
            <span className="block text-sm font-medium text-white md:text-ink">
              {t('soundEffectsLabel')}
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('soundEffectsHint')}
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50">
          <input
            type="checkbox"
            className="mt-1"
            checked={me?.notificationPrefs?.desktopEnabled ?? false}
            disabled={!me || patchNotif.isPending}
            onChange={(e) => patchNotif.mutate({ notificationDesktopEnabled: e.target.checked })}
          />
          <span>
            <span className="block text-sm font-medium text-white md:text-ink">
              {t('notifyDesktopLabel')}
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('notifyDesktopHint')}
            </span>
          </span>
        </label>
      </div>

      <div
        id="tg-privacy"
        className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
          {t('settingsPrivacyRow')}
        </h2>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50">
          <input
            type="checkbox"
            className="mt-1"
            checked={shareLastSeen}
            disabled={!me || patchShareLastSeen.isPending}
            onChange={(e) => patchShareLastSeen.mutate(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-white md:text-ink">
              {t('showLastSeenToOthers')}
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('privacyLastSeenHint')}
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50">
          <input
            type="checkbox"
            className="mt-1"
            checked={hideChatListPreviews}
            onChange={(e) => setHideChatListPreviews(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-white md:text-ink">
              {t('privacyHideChatPreviews')}
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('privacyHideChatPreviewsHint')}
            </span>
          </span>
        </label>
      </div>

      <div
        id="tg-appearance"
        className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80"
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
          {t('settingsAppearanceRow')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold',
                theme === mode
                  ? 'border-[#3390ec]/60 bg-[#3390ec]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/70',
              )}
            >
              {mode === 'light'
                ? t('themeLight')
                : mode === 'dark'
                  ? t('themeDark')
                  : t('themeSystem')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            ['default', 'ocean', 'sunset', 'forest'] as const satisfies readonly VisualPreset[]
          ).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setVisualPreset(p)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold',
                visualPreset === p
                  ? 'border-[#3390ec]/60 bg-[#3390ec]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/70',
              )}
            >
              {p === 'default'
                ? t('presetDefault')
                : p === 'ocean'
                  ? t('presetOcean')
                  : p === 'sunset'
                    ? t('presetSunset')
                    : t('presetForest')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-red-500/35 bg-red-500/5 p-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full rounded-xl border border-red-400/50 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
        >
          {t('signOut')}
        </button>
      </div>
    </TgPage>
  );
}
