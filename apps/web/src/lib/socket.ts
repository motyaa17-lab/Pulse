'use client';

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

function effectiveWsUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_WS_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000'
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

export function getSocket(): Socket | null {
  return socket;
}

function wireSocketLifecycle(s: Socket) {
  const sync = () => {
    try {
      useUiStore.getState().setWsConnected(s.connected);
    } catch {
      /* ignore */
    }
  };
  s.off('connect', sync);
  s.off('disconnect', sync);
  s.on('connect', sync);
  s.on('disconnect', sync);
  sync();
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;
  const token = useAuthStore.getState().accessToken;
  socket = io(effectiveWsUrl(), {
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: Boolean(token),
  });
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
  try {
    useUiStore.getState().setWsConnected(null);
  } catch {
    /* ignore */
  }
  socket?.disconnect();
  socket = null;
  if (presenceTimer) {
    clearInterval(presenceTimer);
    presenceTimer = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return connectSocket();
}
