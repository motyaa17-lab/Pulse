import { useAuthStore } from '@/stores/auth-store';

const DEFAULT_API_URL = 'http://localhost:4000';

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

async function refreshAccess(): Promise<string | null> {
  const rt = useAuthStore.getState().refreshToken;
  if (!rt) return null;
  const res = await fetch(`${effectiveApiBase()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });
  if (!res.ok) {
    useAuthStore.getState().clear();
    return null;
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
  };
  useAuthStore.getState().setTokens(data);
  return data.accessToken;
}

type ApiInit = Omit<RequestInit, 'body'> & {
  skipAuth?: boolean;
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { skipAuth, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const sid = useAuthStore.getState().sessionId;
    if (sid) headers.set('x-session-fingerprint', sid);
  }
  let payload: BodyInit | undefined = rest.body as BodyInit | undefined;
  if (payload !== undefined && payload !== null && !(payload instanceof FormData)) {
    if (
      typeof payload === 'object' &&
      !(payload instanceof Blob) &&
      !(payload instanceof ArrayBuffer)
    ) {
      payload = JSON.stringify(payload);
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  const origin = effectiveApiBase();
  let res = await fetch(`${origin}${path}`, { ...rest, body: payload, headers });
  if (res.status === 401 && !skipAuth) {
    const next = await refreshAccess();
    if (next) {
      headers.set('Authorization', `Bearer ${next}`);
      res = await fetch(`${origin}${path}`, { ...rest, body: payload, headers });
    }
  }
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  if (!res.ok) {
    const msg =
      typeof json === 'object' && json !== null && 'message' in json
        ? String((json as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, msg, json);
  }
  return json as T;
}
