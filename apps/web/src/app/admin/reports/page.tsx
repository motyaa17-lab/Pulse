'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type AdminReportRow = {
  id: string;
  chatId: string;
  messageId: string;
  source: 'USER' | 'AUTOMATED';
  status: 'OPEN' | 'CLOSED';
  flags: string;
  note: string | null;
  textSnapshot: string | null;
  createdAt: string;
  reporter: { id: string; username: string; email: string } | null;
};

export default function AdminReportsPage() {
  const q = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => apiFetch<AdminReportRow[]>('/admin/reports'),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Жалобы и кейсы</h1>
      <p className="mt-2 text-sm text-white/55">
        Ручные жалобы и автоматически отмеченные подозрительные сообщения (эвристика по ссылкам,
        фразам и шаблонам).
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#17212b]/80">
        {q.isLoading && <p className="p-4 text-sm text-white/50">Загрузка…</p>}
        {q.isError && (
          <p className="p-4 text-sm text-red-300">Не удалось загрузить список (проверьте сеть).</p>
        )}
        {q.data && q.data.length === 0 && (
          <p className="p-6 text-center text-sm text-white/45">Пока нет записей.</p>
        )}
        {q.data && q.data.length > 0 && (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
              <tr>
                <th className="px-3 py-2.5">Когда</th>
                <th className="px-3 py-2.5">Источник</th>
                <th className="px-3 py-2.5">Чат / сообщение</th>
                <th className="px-3 py-2.5">Кто</th>
                <th className="px-3 py-2.5">Флаги / заметка</th>
                <th className="px-3 py-2.5">Текст</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-white/80">
              {q.data.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-white/55">
                    {new Date(r.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        r.source === 'AUTOMATED'
                          ? 'rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[11px] text-amber-100'
                          : 'rounded-md bg-sky-500/20 px-1.5 py-0.5 text-[11px] text-sky-100'
                      }
                    >
                      {r.source === 'AUTOMATED' ? 'Авто' : 'Пользователь'}
                    </span>
                    <div className="mt-1 text-[10px] uppercase text-white/35">{r.status}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-white/60">
                    <div>chat: {r.chatId.slice(0, 12)}…</div>
                    <div>msg: {r.messageId.slice(0, 12)}…</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {r.reporter ? (
                      <>
                        <div>@{r.reporter.username}</div>
                        <div className="text-white/40">{r.reporter.email}</div>
                      </>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                  <td className="max-w-[200px] px-3 py-2.5 text-xs">
                    {r.flags ? (
                      <span className="break-words text-amber-100/90">{r.flags}</span>
                    ) : null}
                    {r.note ? <div className="mt-1 break-words text-white/55">{r.note}</div> : null}
                    {!r.flags && !r.note ? '—' : null}
                  </td>
                  <td className="max-w-[280px] px-3 py-2.5 text-xs text-white/65">
                    <span className="line-clamp-4 break-words">
                      {r.textSnapshot?.trim() || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
