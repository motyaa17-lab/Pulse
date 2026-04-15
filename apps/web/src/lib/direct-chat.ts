import { apiFetch } from '@/lib/api';

/** Dedupe concurrent POST /chats/direct for the same peer (e.g. React Strict Mode double effect). */
const inflight = new Map<string, Promise<{ id: string }>>();

export function getOrCreateDirectChat(peerUserId: string): Promise<{ id: string }> {
  let p = inflight.get(peerUserId);
  if (!p) {
    p = apiFetch<{ id: string }>('/chats/direct', {
      method: 'POST',
      body: { peerUserId },
    }).finally(() => {
      inflight.delete(peerUserId);
    });
    inflight.set(peerUserId, p);
  }
  return p;
}
