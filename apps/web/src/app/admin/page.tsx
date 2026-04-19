'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type Overview = {
  ok: boolean;
  dashboard: { note?: string };
};

export default function AdminDashboardPage() {
  const q = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => apiFetch<Overview>('/admin/overview'),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Панель модерации</h1>
      <p className="mt-1 text-sm text-white/55">
        Здесь появятся метрики, очереди и инструменты модерации. Доступ защищён на сервере (
        <code className="rounded bg-black/30 px-1 py-0.5 text-xs">GET /admin/overview</code>).
      </p>
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#17212b]/80 p-5">
        {q.isLoading && <p className="text-sm text-white/50">Загрузка…</p>}
        {q.isError && (
          <p className="text-sm text-red-300">
            Не удалось загрузить обзор. Проверьте сеть и права доступа.
          </p>
        )}
        {q.data && <p className="text-sm text-white/70">{q.data.dashboard?.note ?? 'OK'}</p>}
      </div>
    </div>
  );
}
