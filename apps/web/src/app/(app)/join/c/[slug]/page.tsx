'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { useT } from '@/lib/i18n';

export default function JoinChannelSlugPage() {
  const params = useParams<{ slug: string }>();
  const raw = params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const decoded = slug ? decodeURIComponent(slug) : '';
  const router = useRouter();
  const t = useT();
  const [err, setErr] = useState<string | null>(null);

  const join = useMutation({
    mutationFn: (s: string) =>
      apiFetch<ChatDetailForDrawer>('/chats/join/channel', {
        method: 'POST',
        body: { slug: s },
      }),
    onSuccess: (chat) => {
      router.replace(`/chats/${chat.id}`);
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError && e.status === 404) {
        setErr(t('joinChannelNotFound'));
      } else if (e instanceof ApiError && e.status === 403) {
        setErr(t('joinChannelForbidden'));
      } else {
        setErr(t('joinChannelFailed'));
      }
    },
  });

  useEffect(() => {
    if (!decoded || decoded.length < 2) {
      setErr(t('joinChannelInvalidSlug'));
      return;
    }
    join.mutate(decoded);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per slug
  }, [decoded]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center text-white md:text-ink">
      {join.isPending && !err && (
        <>
          <p className="text-lg font-medium md:text-ink">{t('joinChannelWorking')}</p>
          <p className="mt-2 text-sm text-white/60 md:text-ink-muted">{t('commonLoading')}</p>
        </>
      )}
      {err && (
        <>
          <p className="max-w-md text-lg font-medium md:text-ink">{err}</p>
          <Link
            href="/chats"
            className="mt-6 text-sm font-semibold text-sky-300 underline md:text-accent"
          >
            {t('joinGroupBackToList')}
          </Link>
        </>
      )}
    </div>
  );
}
