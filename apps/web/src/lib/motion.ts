import { useUiStore } from '@/stores/ui-store';

export function tgEase() {
  // Close to iOS UIKit easeInOut feel.
  return [0.2, 0.8, 0.2, 1] as const;
}

export function tgSpring() {
  return { type: 'spring', stiffness: 520, damping: 36, mass: 0.9 } as const;
}

export function tgFadeIn(reduceMotion: boolean) {
  return reduceMotion
    ? ({ initial: false, animate: { opacity: 1 }, transition: { duration: 0 } } as const)
    : ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.18, ease: tgEase() },
      } as const);
}

export function tgSheetPop(reduceMotion: boolean) {
  return reduceMotion
    ? ({
        initial: false,
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      } as const)
    : ({
        initial: { opacity: 0, y: 14, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: tgSpring(),
      } as const);
}

export function useReduceMotion(): boolean {
  return useUiStore((s) => s.reduceMotion);
}
