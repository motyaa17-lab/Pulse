'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { coreApiFetch } from '@/core/api/core-api';
import { useCoreAuthStore } from '@/core/state/core-auth-store';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof schema>;

function safeInternalPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw.includes('\0')) return null;
  return raw;
}

function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useCoreAuthStore((s) => s.setTokens);
  const token = useCoreAuthStore((s) => s.accessToken);
  const hasHydrated = useCoreAuthStore((s) => s.hasHydrated);
  const next = safeInternalPath(searchParams.get('next'));

  useEffect(() => {
    if (!hasHydrated) return;
    if (token) router.replace(next ?? '/core/chats');
  }, [hasHydrated, token, router, next]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const res = await coreApiFetch<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: data,
        skipAuth: true,
      });
      setTokens({ accessToken: res.accessToken });
      console.log('[CORE LOGIN SUCCESS] navigating /core/chats');
      router.replace('/core/chats');
    } catch {
      setError('root', { message: t('loginErrorCredentials') });
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
          {t('loginHeading')}
        </h1>
        <p className="text-sm text-white/70">{t('loginSubtitle')}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="email">
            {t('fieldEmail')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('placeholderEmail')}
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-sky-400/20"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70" htmlFor="password">
            {t('fieldPassword')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-white/8 focus:ring-4 focus:ring-emerald-400/20"
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
          className="group relative flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(56,189,248,0.25)] transition duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:shadow-none"
        >
          <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 blur-xl opacity-40 transition group-hover:opacity-55" />
          {isSubmitting ? t('authSigningIn') : t('authSignIn')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        {t('authSignupPrompt')}{' '}
        <Link
          className="font-medium text-white underline-offset-4 hover:underline"
          href="/signup"
          prefetch={false}
        >
          {t('authCreateAccount')}
        </Link>
      </p>
    </motion.div>
  );
}

export default function CoreLoginPage() {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0b1220] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_30%_20%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(700px_circle_at_70%_30%,rgba(16,185,129,0.14),transparent_62%)]" />
      <div className="relative w-full max-w-[440px]">
        <Suspense
          fallback={
            <div className="w-full rounded-[26px] border border-white/12 bg-white/10 p-8 text-center text-sm text-white/60">
              …
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
