'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toPublicUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n';

function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

export function VoiceMessageBubble({
  url,
  durationSec,
  isOutgoing,
}: {
  url: string;
  durationSec?: number | null;
  isOutgoing: boolean;
}) {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const src = toPublicUrl(url) ?? url;
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(durationSec ?? 0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime);
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setDur(Math.ceil(a.duration));
    };
    const onEnded = () => {
      setPlaying(false);
      setCur(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onErr = () => setBroken(true);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnded);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onErr);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onErr);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || broken) return;
    if (playing) {
      a.pause();
    } else {
      void a.play().catch(() => setBroken(true));
    }
  }, [broken, playing]);

  const total = dur || durationSec || 0;

  return (
    <div
      className={cn(
        'inline-flex max-w-[min(280px,90vw)] items-center gap-2 rounded-full py-1 pl-1 pr-3',
        isOutgoing
          ? 'bg-black/[0.14] text-bubble-out-ink dark:bg-black/25'
          : 'bg-black/[0.06] text-ink dark:bg-white/[0.1]',
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={toggle}
        disabled={broken}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition active:scale-[0.96]',
          isOutgoing
            ? 'bg-[#4a5d3a] text-white dark:bg-[#3d4f32]'
            : 'bg-[#3390ec] text-white dark:bg-[#2b7fd4]',
        )}
        aria-label={playing ? t('voicePauseAria') : t('voicePlayAria')}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-px"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex h-6 shrink-0 items-end gap-px opacity-90">
        {[3, 7, 4, 9, 5, 8, 5, 7, 4, 6, 3].map((h, i) => (
          <span
            key={i}
            className={cn(
              'w-[2px] shrink-0 rounded-full',
              isOutgoing
                ? 'bg-bubble-out-ink/35 dark:bg-bubble-out-ink/45'
                : 'bg-accent/50 dark:bg-accent/40',
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      {broken ? (
        <span className="text-[11px] font-medium opacity-80">{t('voicePlayError')}</span>
      ) : (
        <span
          className={cn(
            'min-w-[2.25rem] text-right text-[11px] font-semibold tabular-nums opacity-80',
            isOutgoing ? 'text-bubble-out-ink/90' : 'text-ink-muted',
          )}
        >
          {playing ? `${formatClock(cur)} / ${formatClock(total)}` : formatClock(total)}
        </span>
      )}
    </div>
  );
}
