'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks `visualViewport` so a fixed chat shell matches the visible area above the iOS keyboard
 * (Telegram-style: keyboard overlays, shell does not “slide” as a scrolling webpage).
 */
export function useMobileChatVisualFrame(enabled: boolean) {
  const [frame, setFrame] = useState<{ top: number; height: number }>(() => ({
    top: 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const sync = () => {
      if (vv) {
        setFrame({ top: vv.offsetTop, height: vv.height });
      } else {
        setFrame({ top: 0, height: window.innerHeight });
      }
    };

    sync();
    if (vv) {
      vv.addEventListener('resize', sync);
      vv.addEventListener('scroll', sync);
    } else {
      window.addEventListener('resize', sync);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', sync);
        vv.removeEventListener('scroll', sync);
      } else {
        window.removeEventListener('resize', sync);
      }
    };
  }, [enabled]);

  return frame;
}
