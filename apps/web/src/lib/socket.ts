'use client';

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;
let presenceTimer: ReturnType<typeof setInterval> | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;
  const token = useAuthStore.getState().accessToken;
  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: Boolean(token),
  });
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
