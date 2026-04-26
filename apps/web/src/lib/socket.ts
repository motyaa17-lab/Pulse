'use client';

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

function effectiveWsUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_WS_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000'
      : 'https://pulse-production-b6ff.up.railway.app')
  ).replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return window.location.origin;
    }
  }
  return configured;
}

let socket: Socket | null = null;
let presenceTimer: ReturnType<typeof setInterval> | null = null;
const lifecycleWired = new WeakMap<Socket, () => void>();

export function getSocket(): Socket | null {
  return socket;
}

function wireSocketLifecycle(s: Socket) {
  if (lifecycleWired.has(s)) {
    // Ensure store reflects current state without re-wiring handlers.
    try {
      useUiStore.getState().setWsConnected(s.connected);
    } catch {
      /* ignore */
    }
    return;
  }

  const sync = () => {
    try {
      useUiStore.getState().setWsConnected(s.connected);
    } catch {
      /* ignore */
    }
  };

  s.on('connect', sync);
  s.on('disconnect', sync);
  lifecycleWired.set(s, sync);
  sync();
}

export function connectSocket(): Socket {
  const token = useAuthStore.getState().accessToken;
  // Important: keep a single Socket instance.
  // Multiple components call connectSocket() on mount; if we recreate the socket while it's still
  // connecting, we can end up with a storm of connect/disconnect events and state updates.
  if (socket) {
    try {
      // Keep auth token in sync for reconnects.
      socket.auth = { token };
      if (token && !socket.connected) socket.connect();
    } catch {
      /* ignore */
    }
    console.count('[SOCKET] connectSocket reuse');
    console.log('deps:', { hasToken: Boolean(token), connected: Boolean(socket.connected) });
    wireSocketLifecycle(socket);
    return socket;
  }

  socket = io(effectiveWsUrl(), {
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: Boolean(token),
  });
  console.count('[SOCKET] connectSocket create');
  console.log('deps:', { hasToken: Boolean(token), autoConnect: Boolean(token) });
  wireSocketLifecycle(socket);
  if (presenceTimer) {
    clearInterval(presenceTimer);
    presenceTimer = null;
  }
  // Keep online TTL fresh. Lightweight MVP ping.
  presenceTimer = setInterval(() => {
    try {
      if (socket?.connected) socket.emit('presence:ping');
    } catch {
      /* ignore */
    }
  }, 45_000);
  return socket;
}

export function disconnectSocket() {
  console.count('[SOCKET] disconnectSocket');
  console.log('deps:', { hadSocket: Boolean(socket), connected: Boolean(socket?.connected) });
  try {
    useUiStore.getState().setWsConnected(null);
  } catch {
    /* ignore */
  }
  if (socket) {
    const sync = lifecycleWired.get(socket);
    if (sync) {
      socket.off('connect', sync);
      socket.off('disconnect', sync);
      lifecycleWired.delete(socket);
    }
  }
  socket?.disconnect();
  socket = null;
  if (presenceTimer) {
    clearInterval(presenceTimer);
    presenceTimer = null;
  }
}

export function reconnectSocket() {
  console.count('[SOCKET] reconnectSocket');
  console.log('deps:', {});
  disconnectSocket();
  return connectSocket();
}
