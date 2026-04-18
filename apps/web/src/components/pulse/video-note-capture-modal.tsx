'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n';

function pickVideoMime(): string {
  const cands = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const c of cands) {
    try {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return '';
}

export function VideoNoteCaptureModal({
  open,
  onClose,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  onRecorded: (file: File, durationSec: number) => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const startPreview = useCallback(async () => {
    setErr(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      const el = videoRef.current;
      if (el) {
        el.srcObject = stream;
        await el.play().catch(() => undefined);
      }
    } catch {
      setErr(t('videoNoteCameraDenied'));
    }
  }, [facing, stopStream, t]);

  useEffect(() => {
    if (!open) {
      stopStream();
      setRecording(false);
      setSec(0);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    void startPreview();
    return () => {
      stopStream();
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [open, facing, startPreview, stopStream]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === 'recording') rec.stop();
  }, []);

  const toggleRecord = useCallback(() => {
    if (recording) {
      stopRecording();
      return;
    }
    const stream = streamRef.current;
    if (!stream) return;
    setErr(null);
    chunksRef.current = [];
    const mime = pickVideoMime();
    try {
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        setRecording(false);
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' });
        const ms = Date.now() - startedAtRef.current;
        const dur = Math.max(1, Math.round(ms / 1000));
        if (ms < 700 || blob.size < 2000) {
          setErr(t('videoNoteTooShort'));
          window.setTimeout(() => setErr(null), 2600);
          return;
        }
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `video-note-${Date.now()}.${ext}`, { type: blob.type });
        onRecorded(file, dur);
        onClose();
      };
      recorderRef.current = rec;
      startedAtRef.current = Date.now();
      setSec(0);
      rec.start(200);
      setRecording(true);
      tickRef.current = setInterval(() => {
        setSec(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
      }, 300);
    } catch {
      setErr(t('videoNoteRecordError'));
    }
  }, [onClose, onRecorded, recording, stopRecording, t]);

  useEffect(() => {
    if (!recording) return;
    if (sec < 60) return;
    stopRecording();
  }, [recording, sec, stopRecording]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={t('videoNoteCaptureAria')}
    >
      <div
        className="absolute inset-0 bg-[#0a1624]/80 backdrop-blur-2xl"
        aria-hidden
        onClick={() => !recording && onClose()}
      />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {err && (
          <p className="mb-2 max-w-sm text-center text-[13px] text-red-300" role="alert">
            {err}
          </p>
        )}
        <div className="relative w-full max-w-[min(100%,22rem)] shrink-0 overflow-hidden rounded-[2rem] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-2 ring-white/15">
          <video
            ref={videoRef}
            className="aspect-[9/16] max-h-[min(72vh,640px)] w-full object-cover"
            playsInline
            muted
          />
          {recording && (
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {sec}s
            </div>
          )}
        </div>

        <div className="mt-5 flex w-full max-w-sm items-center justify-center gap-6">
          <button
            type="button"
            disabled={recording}
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white shadow-lg ring-1 ring-white/20 transition hover:bg-white/18 disabled:opacity-40"
            title={t('videoNoteFlipCamera')}
            aria-label={t('videoNoteFlipCamera')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 10c-1.5-3-4.5-5-8-5-4 0-7.5 2.5-9 6M4 14c1.5 3 4.5 5 8 5 4 0 7.5-2.5 9-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 10V6H8M20 14v4h-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleRecord}
            className={cn(
              'h-16 w-16 rounded-full border-4 border-white/90 shadow-xl transition active:scale-95',
              recording ? 'bg-red-500 ring-4 ring-red-400/40' : 'bg-red-600 hover:bg-red-500',
            )}
            aria-pressed={recording}
            aria-label={recording ? t('videoNoteStop') : t('videoNoteStart')}
          />
          <button
            type="button"
            disabled={recording}
            onClick={onClose}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/16 disabled:opacity-40"
            aria-label={t('close')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-3 max-w-xs text-center text-[11px] leading-snug text-white/55">
          {t('videoNoteHint')}
        </p>
      </div>
    </div>
  );
}
