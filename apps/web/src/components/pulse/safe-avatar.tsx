'use client';

import { useEffect, useState } from 'react';
import { toPublicUrl } from '@/lib/api';
import { cn } from '@/lib/cn';

type SafeAvatarProps = {
  url: string | null | undefined;
  /** First letter for fallback. */
  label: string;
  /** Outer frame: size, rounding, ring (e.g. `h-12 w-12 rounded-full`). */
  className?: string;
  /** Extra classes on the image (`object-cover` applied by default). */
  imgClassName?: string;
  /** Fallback panel inside the frame. */
  fallbackClassName?: string;
};

/**
 * Avatar with `toPublicUrl` + load error fallback (avoids broken-image icon on bad URLs).
 */
export function SafeAvatar({
  url,
  label,
  className,
  imgClassName,
  fallbackClassName,
}: SafeAvatarProps) {
  const [broken, setBroken] = useState(false);
  const resolved = url ? toPublicUrl(url) : null;

  useEffect(() => {
    setBroken(false);
  }, [url]);

  const initial = label.trim().slice(0, 1).toUpperCase() || '?';
  const showImg = Boolean(resolved && !broken);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved!}
          alt=""
          className={cn('h-full w-full object-cover', imgClassName)}
          onError={() => setBroken(true)}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center font-semibold',
            fallbackClassName,
          )}
          aria-hidden
        >
          {initial}
        </div>
      )}
    </div>
  );
}
