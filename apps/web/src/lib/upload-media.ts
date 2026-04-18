import { effectiveApiBase } from '@/lib/api';

export async function uploadMedia(
  file: File,
  kind: 'image' | 'voice' | 'file' | 'video',
  token: string,
  sessionId: string | null,
): Promise<{
  storageKey: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
}> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (sessionId) headers['x-session-fingerprint'] = sessionId;
  const res = await fetch(`${effectiveApiBase()}/media/upload`, {
    method: 'POST',
    headers,
    body: fd,
  });
  if (!res.ok) throw new Error('upload failed');
  return (await res.json()) as {
    storageKey: string;
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    kind: string;
  };
}
