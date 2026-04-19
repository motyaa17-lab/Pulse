import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Жалобы — Pulse Admin',
  robots: { index: false, follow: false },
};

export default function AdminReportsPlaceholderPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Жалобы и кейсы</h1>
      <p className="mt-2 text-sm text-white/55">
        Заглушка: сюда можно подключить список репортов, назначение модераторам и историю решений.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-[#17212b]/40 px-4 py-10 text-center text-sm text-white/45">
        Нет активных кейсов (MVP).
      </div>
    </div>
  );
}
