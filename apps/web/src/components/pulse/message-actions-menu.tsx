'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type Action = {
  id: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

const EMOJIS = ['👍', '❤️', '😂', '🎉', '👀'] as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function MessageActionsMenu({
  open,
  anchorRef,
  onClose,
  actions,
  showReactions,
  onReact,
  closeOnScrollEl,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  actions: Action[];
  showReactions: boolean;
  onReact: (emoji: string) => void;
  closeOnScrollEl?: React.RefObject<HTMLElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; origin: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    origin: 'top',
  });

  const enabledActions = useMemo(() => actions.filter((a) => !a.disabled), [actions]);

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const w = 248;
    const h = showReactions ? 176 : 140;
    const pad = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const preferBelow = r.bottom + 8 + h < vh - pad;
    const top = preferBelow ? r.bottom + 8 : r.top - 8 - h;
    const left = clamp(r.right - w, pad, vw - w - pad);
    setPos({ top: clamp(top, pad, vh - h - pad), left, origin: preferBelow ? 'top' : 'bottom' });
  }, [open, anchorRef, showReactions, enabledActions.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      const menu = menuRef.current;
      const anchor = anchorRef.current;
      if (menu && menu.contains(t)) return;
      if (anchor && anchor.contains(t)) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const el = closeOnScrollEl?.current;
    if (!el) return;
    const onScroll = () => onClose();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, onClose, closeOnScrollEl]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[120] w-[248px] overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift backdrop-blur',
        'dark:border-line/55 dark:bg-surface-elevated/98',
      )}
      style={{ top: pos.top, left: pos.left }}
      role="menu"
      aria-label="Message actions"
    >
      {showReactions && (
        <div className="flex items-center justify-between gap-1 border-b border-line/70 px-2.5 py-2 dark:border-line/45">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-surface-muted/80 active:scale-[0.98] dark:hover:bg-surface-muted/35"
              onClick={() => {
                onReact(e);
                onClose();
              }}
              aria-label={`React ${e}`}
            >
              {e}
            </button>
          ))}
          <div className="ml-auto pl-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            React
          </div>
        </div>
      )}
      <div className="py-1">
        {enabledActions.map((a) => (
          <button
            key={a.id}
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] font-medium',
              a.danger
                ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
                : 'text-ink hover:bg-surface-muted/75 dark:hover:bg-surface-muted/35',
            )}
            onClick={() => {
              a.onSelect();
              onClose();
            }}
            role="menuitem"
          >
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

