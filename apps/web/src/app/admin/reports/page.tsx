'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

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

type ReportDetail = {
  report: AdminReportRow & {
    message: {
      id: string;
      senderId: string | null;
      text: string | null;
      createdAt: string;
      deletedAt: string | null;
      sender: {
        id: string;
        username: string;
        email: string;
        role: string;
        mutedUntil: string | null;
        bannedUntil: string | null;
      } | null;
    };
    chat: { id: string; type: string; title: string | null };
  };
  context: { id: string; senderId: string | null; text: string | null; createdAt: string }[];
};

export default function AdminReportsPage() {
  const q = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => apiFetch<AdminReportRow[]>('/admin/reports'),
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const detailQ = useQuery({
    queryKey: ['admin-report', openId],
    queryFn: () => apiFetch<ReportDetail>(`/admin/reports/${openId}`),
    enabled: Boolean(openId),
  });

  const rows = useMemo(() => q.data ?? [], [q.data]);

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
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    'align-top transition hover:bg-white/[0.03]',
                    openId === r.id && 'bg-white/[0.04]',
                  )}
                  onClick={() => setOpenId(r.id)}
                >
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

      {openId && (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#111921]/75 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Детали кейса
              </p>
              <p className="mt-1 font-mono text-[11px] text-white/55">
                report: {openId.slice(0, 12)}… · msg:{' '}
                {rows.find((x) => x.id === openId)?.messageId.slice(0, 12)}…
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
            >
              Закрыть
            </button>
          </div>

          {detailQ.isLoading && <p className="mt-4 text-sm text-white/55">Загрузка…</p>}
          {detailQ.isError && (
            <p className="mt-4 text-sm text-red-300">
              Не удалось загрузить детали (проверьте сеть/права).
            </p>
          )}
          {detailQ.data && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0e1621]/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Сообщение
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/80">
                  {detailQ.data.report.message?.text?.trim() || '—'}
                </p>
                <p className="mt-3 text-xs text-white/45">
                  {new Date(detailQ.data.report.message.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0e1621]/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Контекст
                </p>
                <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
                  {detailQ.data.context.map((m) => (
                    <div key={m.id} className="rounded-xl bg-white/[0.04] px-3 py-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-white/45">
                        <span className="font-mono">{m.id.slice(0, 10)}…</span>
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px] text-white/75">{m.text?.trim() || '—'}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/45">
                  chat: {detailQ.data.report.chat.id.slice(0, 12)}… ({detailQ.data.report.chat.type}
                  )
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
