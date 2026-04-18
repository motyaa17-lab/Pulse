'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n';

const MAX_MS = 60_000;
const RING_R = 48;
const RING_C = 2 * Math.PI * RING_R;

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

/** Minimal constraints — tall `ideal` height often causes heavy crop / “zoom” on front cameras. */
function buildVideoConstraints(facing: 'user' | 'environment'): MediaTrackConstraints {
  return { facingMode: facing };
}

type Mode = 'live' | 'record' | 'preview';

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
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  /** Active segment start (resets on resume after pause). */
  const segmentStartRef = useRef(0);
  /** Sum of completed recording segments (excludes current segment). */
  const recordedMsRef = useRef(0);
  const pausedRef = useRef(false);

  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [mode, setMode] = useState<Mode>('live');
  const [recordMs, setRecordMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
  }, []);

  const startCamera = useCallback(async () => {
    setErr(null);
    stopStream();
    clearPreview();
    setMode('live');
    setRecordMs(0);
    setPaused(false);
    recordedMsRef.current = 0;
    segmentStartRef.current = 0;
    pausedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: buildVideoConstraints(facing),
      });
      streamRef.current = stream;
      const el = liveVideoRef.current;
      if (el) {
        el.srcObject = stream;
        await el.play().catch(() => undefined);
      }
    } catch {
      setErr(t('videoNoteCameraDenied'));
    }
  }, [clearPreview, facing, stopStream, t]);

  useEffect(() => {
    if (!open) {
      stopStream();
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      clearPreview();
      setMode('live');
      setRecordMs(0);
      setPaused(false);
      setTorchOn(false);
      return;
    }
    void startCamera();
    return () => {
      stopStream();
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [open, facing, startCamera, stopStream, clearPreview]);

  const discardRecording = useCallback(async () => {
    const rec = recorderRef.current;
    if (rec) {
      try {
        rec.onstop = null;
        if (rec.state === 'recording' || rec.state === 'paused') rec.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    recordedMsRef.current = 0;
    segmentStartRef.current = 0;
    pausedRef.current = false;
    setMode('live');
    setRecordMs(0);
    setPaused(false);
    clearPreview();
    await startCamera();
  }, [clearPreview, startCamera]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mode === 'record') void discardRecording();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, mode, discardRecording]);

  const startRecording = useCallback(() => {
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
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        let activeMs = recordedMsRef.current;
        if (!pausedRef.current) activeMs += Date.now() - segmentStartRef.current;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' });
        if (activeMs < 550 || blob.size < 1500) {
          setErr(t('videoNoteTooShort'));
          window.setTimeout(() => setErr(null), 2600);
          void startCamera();
          setMode('live');
          return;
        }
        stopStream();
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewBlob(blob);
        setPreviewUrl(url);
        setRecordMs(activeMs);
        setMode('preview');
      };
      recorderRef.current = rec;
      recordedMsRef.current = 0;
      segmentStartRef.current = Date.now();
      pausedRef.current = false;
      setRecordMs(0);
      setPaused(false);
      rec.start(250);
      setMode('record');
      tickRef.current = setInterval(() => {
        let ms = recordedMsRef.current;
        if (!pausedRef.current) ms += Date.now() - segmentStartRef.current;
        setRecordMs(ms);
        if (ms >= MAX_MS) {
          const r = recorderRef.current;
          if (r && (r.state === 'recording' || r.state === 'paused')) r.stop();
        }
      }, 80);
    } catch {
      setErr(t('videoNoteRecordError'));
    }
  }, [startCamera, stopStream, t]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && (rec.state === 'recording' || rec.state === 'paused')) rec.stop();
  }, []);

  const togglePause = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === 'inactive') return;
    if (typeof rec.pause !== 'function') return;
    try {
      if (rec.state === 'recording') {
        rec.pause();
        recordedMsRef.current += Date.now() - segmentStartRef.current;
        pausedRef.current = true;
        setPaused(true);
      } else if (rec.state === 'paused') {
        rec.resume();
        segmentStartRef.current = Date.now();
        pausedRef.current = false;
        setPaused(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (mode !== 'preview' || !previewUrl) return;
    const pv = previewVideoRef.current;
    if (pv) {
      pv.src = previewUrl;
      void pv.play().catch(() => undefined);
    }
  }, [mode, previewUrl]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities?.() as { torch?: boolean } | undefined;
      if (!caps?.torch) return;
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      });
      setTorchOn((v) => !v);
    } catch {
      /* ignore */
    }
  }, [torchOn]);

  const sendPreview = useCallback(() => {
    if (!previewBlob) return;
    const dur = Math.max(1, Math.round(recordMs / 1000));
    const ext = previewBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const file = new File([previewBlob], `video-note-${Date.now()}.${ext}`, {
      type: previewBlob.type,
    });
    onRecorded(file, dur);
    onClose();
  }, [onClose, onRecorded, previewBlob, recordMs]);

  const retake = useCallback(() => {
    clearPreview();
    setMode('live');
    setRecordMs(0);
    void startCamera();
  }, [clearPreview, startCamera]);

  const progressPct = Math.min(100, (recordMs / MAX_MS) * 100);
  const dash = (progressPct / 100) * RING_C;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/40 backdrop-blur-[32px]"
      role="dialog"
      aria-modal="true"
      aria-label={t('videoNoteCaptureAria')}
    >
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {err && (
          <p
            className="mb-2 max-w-sm shrink-0 self-center text-center text-[13px] text-red-200"
            role="alert"
          >
            {err}
          </p>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden py-1">
            <div className="relative mx-auto w-[min(88vw,340px)] shrink-0 aspect-square max-h-[min(50dvh,calc(100dvh-15rem))]">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <circle
                  cx="50"
                  cy="50"
                  r={RING_R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="text-white/30"
                />
                {mode === 'record' && (
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_R}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${RING_C}`}
                    className="text-[#3390ec]"
                  />
                )}
              </svg>
              <div className="absolute inset-[5.5%] overflow-hidden rounded-full bg-black ring-[3px] ring-white/30 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                {mode === 'preview' && previewUrl ? (
                  <video
                    ref={previewVideoRef}
                    key={previewUrl}
                    className="h-full w-full object-cover"
                    playsInline
                    loop
                    muted={false}
                  />
                ) : (
                  <video
                    ref={liveVideoRef}
                    className="h-full w-full object-cover"
                    playsInline
                    muted
                  />
                )}
              </div>
            </div>

            {mode === 'record' && (
              <button
                type="button"
                onClick={togglePause}
                className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c5e6ff] text-black shadow-md ring-2 ring-white/50"
                aria-label={paused ? t('videoNoteResume') : t('videoNotePause')}
              >
                {paused ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="relative flex w-full max-w-[min(100%,400px)] shrink-0 flex-col items-center self-center pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
            {mode === 'preview' ? (
              <div className="flex w-full items-center justify-between gap-3 px-1 pt-2">
                <button
                  type="button"
                  onClick={retake}
                  className="rounded-full bg-white/20 px-5 py-2.5 text-[14px] font-semibold text-white ring-1 ring-white/30 backdrop-blur-md"
                >
                  {t('videoNoteRetake')}
                </button>
                <button
                  type="button"
                  onClick={sendPreview}
                  className="grid h-[3.75rem] w-[3.75rem] shrink-0 place-items-center rounded-full bg-[#3390ec] text-white shadow-lg ring-4 ring-[#3390ec]/30"
                  aria-label={t('videoNoteSend')}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 19V5M12 5l7 7M12 5l-7 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="mt-3 flex w-full items-stretch gap-2 rounded-[2rem] bg-white/25 px-2 py-2 pl-3 shadow-[0_14px_44px_rgba(0,0,0,0.28)] ring-1 ring-white/35 backdrop-blur-2xl">
                <button
                  type="button"
                  disabled={mode === 'record'}
                  onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-zinc-900 shadow-sm transition enabled:active:scale-95 disabled:opacity-35"
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
                  disabled={mode === 'record'}
                  onClick={() => void toggleTorch()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-zinc-900 shadow-sm transition enabled:active:scale-95 disabled:opacity-35"
                  aria-label={t('videoNoteFlash')}
                >
                  {torchOn ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 4l16 16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1">
                  {mode === 'record' ? (
                    <>
                      <span className="font-mono text-[16px] font-semibold tabular-nums text-zinc-900">
                        {Math.floor(recordMs / 60000)}:
                        {String(Math.floor((recordMs % 60000) / 1000)).padStart(2, '0')},
                        {String(Math.floor((recordMs % 1000) / 10)).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => void discardRecording()}
                        className="mt-0.5 text-[14px] font-semibold text-[#3390ec]"
                      >
                        {t('videoNoteCancel')}
                      </button>
                    </>
                  ) : (
                    <p className="px-1 text-center text-[11px] font-medium leading-snug text-zinc-800/85">
                      {t('videoNoteRecordIdleHint')}
                    </p>
                  )}
                </div>

                {mode === 'live' ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="mr-1 grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center self-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white/60 transition active:scale-95"
                    aria-label={t('videoNoteStart')}
                  >
                    <span className="h-[14px] w-[14px] rounded-[3px] bg-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="mr-1 grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center self-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white/60 transition active:scale-95"
                    aria-label={t('videoNoteStop')}
                  >
                    <span className="h-[14px] w-[14px] rounded-[2px] bg-white" />
                  </button>
                )}
              </div>
            )}

            {mode !== 'preview' && (
              <button
                type="button"
                onClick={() => (mode === 'record' ? void discardRecording() : onClose())}
                className="mt-2 text-[13px] font-medium text-white/75 underline-offset-2 hover:text-white hover:underline"
              >
                {mode === 'record' ? t('videoNoteCloseHint') : t('close')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
