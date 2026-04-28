'use client';

import { useCoreAuthStore } from '@/core/state/core-auth-store';

const DEFAULT_API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://pulse-production-b6ff.up.railway.app';

export const CORE_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');

function coreEffectiveApiBase(): string {
  const configured = CORE_API_URL;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return window.location.origin;
    }
  }
  return configured;
}

let coreApiBaseLogged = false;

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

  const base = coreEffectiveApiBase();
  const url = `${base}${path}`;
  if (!coreApiBaseLogged && typeof window !== 'undefined') {
    coreApiBaseLogged = true;
    console.log('[CORE API BASE]', {
      configured: CORE_API_URL,
      effective: base,
      origin: window.location.origin,
      protocol: window.location.protocol,
    });
  }

  if (!skipAuth) {
    const accessToken = useCoreAuthStore.getState().accessToken;
    console.log('[CORE API TOKEN]', {
      path,
      hasAccessToken: Boolean(accessToken),
      tokenStart: accessToken ? accessToken.slice(0, 12) : null,
      tokenLen: accessToken?.length ?? 0,
    });
    if (!accessToken) {
      // Core must never silently send unauthenticated requests for protected endpoints.
      throw new CoreApiError(401, 'HTTP 401');
    }
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    payload = typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  }

  const method = (rest.method ?? 'GET').toUpperCase();
  console.log('[CORE API REQUEST]', {
    method,
    path,
    url,
    hasAuthHeader: headers.has('Authorization'),
    contentType: headers.get('Content-Type'),
  });
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, body: payload });
  } catch (e) {
    const elapsedMs =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
    console.warn('[CORE API NETWORK ERROR]', {
      method,
      path,
      url,
      elapsedMs: Math.round(elapsedMs),
      name: e instanceof Error ? e.name : null,
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
  const elapsedMs =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
  console.log('[CORE API RESPONSE]', {
    method,
    path,
    url,
    status: res.status,
    ok: res.ok,
    elapsedMs: Math.round(elapsedMs),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.log('[CORE API 401]', { path, status: res.status });
      // Core: if token is rejected, clear and force user back to core login.
      useCoreAuthStore.getState().clear();
      if (typeof window !== 'undefined') {
        window.location.assign('/core/login');
      }
    }
    throw new CoreApiError(res.status, `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
