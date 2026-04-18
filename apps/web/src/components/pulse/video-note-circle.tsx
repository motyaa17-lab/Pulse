'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toPublicUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n';

type Props = {
  src: string;
  className?: string;
};

/** Inline round video note: no native controls; tap = slight zoom + unmute + play; tap again = pause. */
export function VideoNoteCircle({ src, className }: Props) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(false);

  const href = toPublicUrl(src) ?? src;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const sync = () => setExpanded(!v.paused && !v.muted);
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    v.addEventListener('volumechange', sync);
    v.addEventListener('ended', sync);
    sync();
    return () => {
      v.removeEventListener('play', sync);
      v.removeEventListener('pause', sync);
      v.removeEventListener('volumechange', sync);
      v.removeEventListener('ended', sync);
    };
  }, [href]);

  const toggle = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.paused) {
      v.pause();
      v.muted = true;
      return;
    }
    v.muted = false;
    try {
      await v.play();
    } catch {
      v.muted = true;
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={cn(
        'relative block cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0 shadow-none outline-none ring-0',
        'transition-[transform,box-shadow] duration-200 ease-out',
        'focus-visible:ring-2 focus-visible:ring-accent/55',
        expanded && 'scale-[1.08] shadow-lg shadow-black/35 max-md:scale-[1.06]',
        className,
      )}
      aria-label={expanded ? t('videoNotePauseAria') : t('videoNotePlayAria')}
    >
      <video
        ref={videoRef}
        src={href}
        className="pointer-events-none block aspect-square h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onEnded={() => {
          const el = videoRef.current;
          if (el) {
            el.muted = true;
            el.pause();
          }
        }}
      />
    </button>
  );
}
