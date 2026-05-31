import { useAuthStore } from '@/stores/auth-store';

const DEFAULT_API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://pulse-production-b6ff.up.railway.app';

/** Build-time API base (no browser heuristics). */
export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

/**
 * API/media base for the current runtime. On HTTPS production, if the bundle still
 * defaults to localhost (missing `NEXT_PUBLIC_API_URL`), use same-origin so uploads
 * and fetches hit the deployed host (typical Railway single-service setup).
 */
export function effectiveApiBase(): string {
  const configured = getApiUrl();
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return window.location.origin;
    }
  }
  return configured;
}

/** @deprecated Prefer getApiUrl() or effectiveApiBase() — fixed at module load for legacy imports. */
export const API_URL = getApiUrl();

export function toPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = effectiveApiBase();

  if (url.startsWith('/')) {
    return `${base}${url}`;
  }

  if (/^(https?:)?\/\//i.test(url)) {
    try {
      const normalized = url.startsWith('//') ? `https:${url}` : url;
      const u = new URL(normalized);
      const devHost =
        u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]';
      if (devHost) {
        return `${base}${u.pathname}${u.search}${u.hash}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  return `${base}/${url}`;
}

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  const rt = useAuthStore.getState().refreshToken;
  if (!rt) return null;

  refreshInFlight = (async () => {
    const res = await fetch(`${effectiveApiBase()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) {
      // Only clear auth state if the refresh token itself is invalid/expired.
      // Network errors, misconfigured API base, or transient server issues should not log the user out.
      if (res.status === 401 || res.status === 403) {
        useAuthStore.getState().clear();
      }
      return null;
    }
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      sessionId?: string;
    };
    useAuthStore.getState().setTokens(data);
    return data.accessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

type ApiInit = Omit<RequestInit, 'body'> & {
  skipAuth?: boolean;
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { skipAuth, body, ...rest } = init;

  const headers = new Headers(rest.headers);
  if (!skipAuth) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    payload = typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  }

  const origin = API_URL;
  const res = await fetch(`${origin}${path}`, { ...rest, body: payload, headers });
  if (!res.ok) {
    // Diagnostic: keep errors simple and deterministic (no refresh/retry/redirects).
    throw new ApiError(res.status, `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
