'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { useUiStore } from '@/stores/ui-store';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import { useT } from '@/lib/i18n';
type SearchUser = { id: string; username: string; displayName: string | null; avatarUrl: string | null };
type SearchChat = { id: string; type: string; title: string | null };
type SearchMessage = {
  id: string;
  chatId: string;
  text: string | null;
  snippet?: string;
  createdAt: string;
};

type SearchResult = {
  users: SearchUser[];
  chats: SearchChat[];
  messages: SearchMessage[];
};

export function SearchModal() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [q, setQ] = useState('');
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();

  const debounced = useDebouncedValue(q, 220);

  const { data, isFetching } = useQuery<SearchResult>({
    queryKey: ['search', debounced],
    enabled: open && debounced.length >= 2,
    queryFn: () => apiFetch<SearchResult>(`/search?q=${encodeURIComponent(debounced)}`),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-lift dark:bg-surface-elevated/95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-line px-4 py-3">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                aria-label={t('search')}
              />
              <p className="mt-1 text-[10px] text-ink-muted">⌘K · min 2 characters · results grouped</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3 text-sm">
              {isFetching && <p className="text-ink-muted">{t('searching')}</p>}
              {!isFetching && data && (
                <div className="space-y-4">
                  <Section title={t('people')}>
                    {data.users.map((u: SearchUser) => (
                      <button
                        key={u.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60"
                        onClick={async () => {
                          // One-step: create/open DM and navigate directly.
                          // Keeps the existing dedupe guarantees (client inflight + server serializable tx).
                          try {
                            const chat = await getOrCreateDirectChat(u.id);
                            setOpen(false);
                            // Ensure the sidebar picks up the chat even if it didn't exist before.
                            void qc.invalidateQueries({ queryKey: ['chats'] });
                            router.push(`/chats/${chat.id}`);
                          } catch {
                            setOpen(false);
                            router.push('/chats');
                          }
                        }}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-xs font-semibold text-accent">
                          {(u.displayName ?? u.username).slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <span className="font-medium text-ink">{u.displayName ?? u.username}</span>
                          <span className="ml-2 text-xs text-ink-muted">@{u.username}</span>
                        </span>
                      </button>
                    ))}
                  </Section>
                  <Section title={t('chats')}>
                    {data.chats.map((c: SearchChat) => (
                      <button
                        key={c.id}
                        type="button"
                        className="block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60"
                        onClick={() => {
                          setOpen(false);
                          router.push(`/chats/${c.id}`);
                        }}
                      >
                        <span className="font-medium text-ink">{c.title ?? 'Untitled'}</span>
                        <span className="ml-2 text-xs uppercase text-ink-muted">{c.type}</span>
                      </button>
                    ))}
                  </Section>
                  <Section title={t('messages')}>
                    {data.messages.map((m: SearchMessage) => (
                      <button
                        key={m.id}
                        type="button"
                        className="block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60"
                        onClick={() => {
                          setOpen(false);
                          router.push(`/chats/${m.chatId}?highlight=${m.id}`);
                        }}
                      >
                        <Highlight text={(m.snippet ?? m.text ?? '').trim()} needle={debounced} />
                        <div className="text-[10px] text-ink-muted">
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </Section>
                  {data.users.length === 0 &&
                    data.chats.length === 0 &&
                    data.messages.length === 0 &&
                    debounced.length >= 2 && <p className="text-ink-muted">{t('noMatches')}</p>}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Highlight({ text, needle }: { text: string; needle: string }) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i < 0) return <span className="text-ink">{text}</span>;
  const before = text.slice(0, i);
  const match = text.slice(i, i + needle.length);
  const after = text.slice(i + needle.length);
  return (
    <span className="text-ink">
      {before}
      <mark className="rounded bg-accent/25 px-0.5 text-ink">{match}</mark>
      {after}
    </span>
  );
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
