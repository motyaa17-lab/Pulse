'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const res = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        sessionId?: string;
      }>('/auth/login', {
        method: 'POST',
        body: data,
        skipAuth: true,
      });
      setTokens(res);
      router.replace('/onboarding');
    } catch {
      setError('root', { message: 'Could not sign in. Check your credentials.' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70"
    >
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Pulse</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted">Sign in to continue your conversations.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-sm text-red-500" role="alert">
            {errors.root.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Pulse?{' '}
        <Link className="font-medium text-accent underline-offset-4 hover:underline" href="/signup">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
