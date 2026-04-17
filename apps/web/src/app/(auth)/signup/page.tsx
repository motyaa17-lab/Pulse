'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError, API_URL, apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

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
  const t = useT();
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
      className="w-full rounded-[26px] border border-white/12 bg-white/10 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-[28px] transition"
    >
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
          {t('brandPulse')}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          {t('signupHeading')}
        </h1>
        <p className="text-sm text-white/70">{t('signupSubtitle')}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="email">
            {t('fieldEmail')}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t('placeholderEmail')}
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-sky-400/20"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="username">
            {t('labelUsername')}
          </label>
          <input
            id="username"
            placeholder={t('placeholderUsername')}
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-emerald-400/20"
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="dn">
            {t('signupDisplayNameOptional')}
          </label>
          <input
            id="dn"
            placeholder={t('placeholderDisplayName')}
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-white/15"
            {...register('displayName')}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="password">
            {t('fieldPassword')}
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-sky-400/20"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="confirm">
            {t('fieldConfirmPassword')}
          </label>
          <input
            id="confirm"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-emerald-400/20"
            {...register('confirm')}
          />
          {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(34,211,238,0.22)] transition duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:shadow-none"
        >
          <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500 blur-xl opacity-40 transition group-hover:opacity-55" />
          {isSubmitting ? t('authCreatingAccount') : t('signupSubmit')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        {t('authHaveAccount')}{' '}
        <Link className="font-medium text-white underline-offset-4 hover:underline" href="/login">
          {t('authSignInLink')}
        </Link>
      </p>
    </motion.div>
  );
}
