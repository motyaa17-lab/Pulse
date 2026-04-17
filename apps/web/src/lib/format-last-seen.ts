import type { Language } from '@/stores/language-store';
import type { I18nKey } from '@/lib/i18n';

export function formatLastSeenAt(
  iso: string,
  lang: Language,
  labels: { today: string; yesterday: string },
): string {
  const d = new Date(iso);
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startToday - startD) / 86400000);
  const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (dayDiff === 0) return `${labels.today} ${timeStr}`;
  if (dayDiff === 1) return `${labels.yesterday} ${timeStr}`;
  if (d.getFullYear() === now.getFullYear()) {
    const dateOnly = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return `${dateOnly}, ${timeStr}`;
  }
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type PresencePeer = {
  isOnline?: boolean;
  lastSeenAt?: string | null;
  lastSeenVisible?: boolean;
};

export function directChatPresenceSubtitle(
  peer: PresencePeer | null | undefined,
  t: (k: I18nKey) => string,
  lang: Language,
): string {
  if (!peer) return '';
  if (peer.isOnline) return t('online');
  const visible = peer.lastSeenVisible !== false;
  if (!visible) return t('lastSeenHidden');
  if (peer.lastSeenAt) {
    return formatLastSeenAt(peer.lastSeenAt, lang, {
      today: t('today'),
      yesterday: t('yesterday'),
    });
  }
  return t('offline');
}
