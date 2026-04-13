export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-surface via-surface-muted to-surface-elevated dark:from-surface dark:via-surface-muted dark:to-surface">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
