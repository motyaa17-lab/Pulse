import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function toPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Already absolute (http/https) or protocol-relative.
  if (/^(https?:)?\/\//i.test(url)) return url;
  // Relative to API host.
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
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
  const res = await fetch(`${API_URL}/auth/refresh`, {
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
  let res = await fetch(`${API_URL}${path}`, { ...rest, body: payload, headers });
  if (res.status === 401 && !skipAuth) {
    const next = await refreshAccess();
    if (next) {
      headers.set('Authorization', `Bearer ${next}`);
      res = await fetch(`${API_URL}${path}`, { ...rest, body: payload, headers });
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

export { API_URL };
