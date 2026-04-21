'use client';

import Link from 'next/link';
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

function Row({
  icon,
  title,
  right,
  href,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  right?: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-white/90 md:bg-surface-muted md:text-ink-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-white md:text-ink">
        {title}
      </span>
      {right ? (
        <span className="shrink-0 truncate text-[13px] text-white/45 md:text-ink-muted">
          {right}
        </span>
      ) : null}
      <span className="shrink-0 text-white/35 md:text-ink-muted">›</span>
    </div>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="block border-t border-white/10 first:border-t-0 hover:bg-white/[0.06] md:border-line/50"
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full border-t border-white/10 text-left first:border-t-0 hover:bg-white/[0.06] md:border-line/50"
    >
      {inner}
    </button>
  );
}

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
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/chats"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('backToChats')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settings')}</span>
        <span className="w-10" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <Row
          icon={<span className="text-[18px] font-bold">👤</span>}
          title={t('myProfile')}
          href="/profile"
        />
        <Row
          icon={<span className="text-[18px] font-bold">🧩</span>}
          title={t('settingsProxies')}
          right={t('settingsEnergySavingOff')}
          onClick={() => window.alert('Soon')}
        />
        <Row
          icon={<span className="text-[18px] font-bold">💳</span>}
          title={t('settingsWallet')}
          onClick={() => window.alert('Soon')}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <Row
          icon={<span className="text-[18px]">⭐</span>}
          title={t('settingsSavedMessages')}
          onClick={() => router.push('/chats')}
        />
        <Row
          icon={<span className="text-[18px]">📞</span>}
          title={t('settingsRecentCalls')}
          href="/calls"
        />
        <Row
          icon={<span className="text-[18px]">📱</span>}
          title={t('settingsDevices')}
          href="/sessions"
        />
        <Row
          icon={<span className="text-[18px]">🗂️</span>}
          title={t('settingsChatFolders')}
          onClick={() => window.alert('Soon')}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <Row
          icon={<span className="text-[18px]">🔔</span>}
          title={t('settingsNotificationsAndSounds')}
          onClick={() => window.alert('See toggles below')}
        />
        <Row
          icon={<span className="text-[18px]">🔒</span>}
          title={t('settingsPrivacyRow')}
          onClick={() => window.alert('See toggles below')}
        />
        <Row
          icon={<span className="text-[18px]">💾</span>}
          title={t('settingsDataAndStorage')}
          onClick={() => window.alert('Soon')}
        />
        <Row
          icon={<span className="text-[18px]">🎨</span>}
          title={t('settingsAppearanceRow')}
          onClick={() => window.alert('See options below')}
        />
        <Row
          icon={<span className="text-[18px]">🌐</span>}
          title={t('settingsLanguageRow')}
          right={language === 'ru' ? t('wordRussian') : t('wordEnglish')}
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
        />
        <Row
          icon={<span className="text-[18px]">🔋</span>}
          title={t('settingsPowerSaving')}
          right={t('settingsEnergySavingOff')}
          onClick={() => window.alert('Soon')}
        />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80">
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

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80">
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

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80">
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
    </div>
  );
}
