'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError, API_URL, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';

const schema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .min(3)
      .regex(/^[a-z0-9_]+$/i, 'Letters, numbers, underscore'),
    displayName: z.string().min(1).max(80).optional(),
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords must match' });

type Form = z.infer<typeof schema>;

export default function SignupPage() {
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
      }>('/auth/register', {
        method: 'POST',
        body: {
          email: data.email,
          username: data.username,
          password: data.password,
          displayName: data.displayName,
        },
        skipAuth: true,
      });
      setTokens(res);
      router.replace('/onboarding');
    } catch (e) {
      // Surface the real failure in dev (status/message), instead of a generic banner.
      // This also makes it obvious when the API server isn't reachable.
      // eslint-disable-next-line no-console
      console.error('Signup failed', e);

      const message =
        e instanceof ApiError
          ? `${e.message} (HTTP ${e.status})`
          : `Could not reach API server at ${API_URL}`;

      setError('root', { message });
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
        <h1 className="font-display text-3xl font-semibold text-ink">Create your space</h1>
        <p className="text-sm text-ink-muted">Original identity, familiar rhythm.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="dn">
            Display name (optional)
          </label>
          <input id="dn" className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2" {...register('displayName')} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            className="w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
            {...register('confirm')}
          />
          {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm disabled:opacity-60"
        >
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link className="font-medium text-accent underline-offset-4 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
