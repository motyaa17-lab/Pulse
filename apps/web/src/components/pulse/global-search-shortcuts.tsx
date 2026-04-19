'use client';

import { useEffect } from 'react';

/** Cmd/Ctrl+K and / focus the sidebar chat search (no modal). */
export function GlobalSearchShortcuts() {
  useEffect(() => {
    const focus = () => {
      window.dispatchEvent(new CustomEvent('pulse:focus-sidebar-search'));
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focus();
        return;
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const el = e.target as HTMLElement | null;
        if (
          el &&
          (el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.tagName === 'SELECT' ||
            el.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
