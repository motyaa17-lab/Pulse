'use client';

import { useCoreAuthStore } from '@/core/state/core-auth-store';

const DEFAULT_API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://pulse-production-b6ff.up.railway.app';

export const CORE_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');

export class CoreApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type CoreApiInit = Omit<RequestInit, 'body'> & {
  skipAuth?: boolean;
  body?: BodyInit | Record<string, unknown> | null;
};

export async function coreApiFetch<T>(path: string, init: CoreApiInit = {}): Promise<T> {
  const { skipAuth, body, ...rest } = init;
  const headers = new Headers(rest.headers);

  if (!skipAuth) {
    const accessToken = useCoreAuthStore.getState().accessToken;
    console.log('[API FETCH DEBUG]', {
      path,
      hasAccessToken: Boolean(accessToken),
      tokenStart: accessToken ? accessToken.slice(0, 12) : null,
      tokenLen: accessToken?.length ?? 0,
    });
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    payload = typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  }

  const res = await fetch(`${CORE_API_URL}${path}`, { ...rest, headers, body: payload });
  if (!res.ok) {
    throw new CoreApiError(res.status, `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
