'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError, toPublicUrl } from '@/lib/api';
import { VideoNoteCaptureModal } from '@/components/pulse/video-note-capture-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useDraftStore } from '@/stores/draft-store';
import { bumpChatListPreview } from '@/lib/chat-query-helpers';
import { bumpMetaFromMessage } from '@/lib/chat-preview-meta';
import { playMessageSendSound } from '@/lib/sound-feedback';
import { useUiStore } from '@/stores/ui-store';
import type { MessageDto, MeUserDto } from '@/lib/types';
import { cn } from '@/lib/cn';
import { getSocket } from '@/lib/socket';
import { decodeJwtSub } from '@/lib/jwt';
import { uploadMedia } from '@/lib/upload-media';
import { usePendingAttachmentsStore } from '@/stores/pending-attachments-store';
import { useT } from '@/lib/i18n';

type MessagesQueryData = { items: MessageDto[]; nextCursor: string | null };
const EMPTY_PENDING: never[] = [];

type SendMutationCtx = { prev: MessagesQueryData | undefined; tempId: string };

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 10v1a7 7 0 01-14 0v-1M12 19v3M8 22h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VideoCamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 10l4-2v8l-4-2v-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="3" y="6" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function pickVoiceMimeType(): string {
  const cands = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  for (const c of cands) {
    try {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return '';
}

export function Composer({
  chatId,
  replyTo,
  onCancelReply,
  editing,
  onCancelEdit,
}: {
  chatId: string;
  replyTo: MessageDto | null;
  onCancelReply: () => void;
  editing: MessageDto | null;
  onCancelEdit: () => void;
}) {
  const t = useT();
  const [text, setText] = useState('');
  const [uiSending, setUiSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);
  const draft = useDraftStore((s) => s.drafts[chatId] ?? '');
  const setDraft = useDraftStore((s) => s.setDraft);
  const clearDraft = useDraftStore((s) => s.clearDraft);
  const pending = usePendingAttachmentsStore((s) => s.byChat[chatId]) ?? EMPTY_PENDING;
  const addPending = usePendingAttachmentsStore((s) => s.add);
  const removePending = usePendingAttachmentsStore((s) => s.remove);
  const clearPending = usePendingAttachmentsStore((s) => s.clear);
  const soundEnabled = useUiStore((s) => s.soundEnabled);

  const voiceMicBtnRef = useRef<HTMLButtonElement>(null);
  const voiceArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceTickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<BlobPart[]>([]);
  const voiceStartedAtRef = useRef(0);
  const voicePointerDownRef = useRef(false);
  const voiceStartCoordsRef = useRef({ x: 0, y: 0 });
  const voiceCancelledRef = useRef(false);
  const [voiceUi, setVoiceUi] = useState<'idle' | 'arming' | 'recording'>('idle');
  const [voiceSlideCancel, setVoiceSlideCancel] = useState(false);
  const [voiceSec, setVoiceSec] = useState(0);
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const [videoCaptureOpen, setVideoCaptureOpen] = useState(false);

  const { data: meUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });

  useEffect(() => {
    if (!editing) return;
    setText(editing.text ?? '');
    // Put cursor at end on enter-edit.
    window.setTimeout(() => {
      const el = taRef.current;
      if (!el) return;
      el.focus();
      const v = el.value;
      el.setSelectionRange(v.length, v.length);
    }, 0);
  }, [editing?.id]);

  useEffect(() => {
    // Restore per-chat draft when switching chats (only for normal compose mode).
    if (editing) return;
    setText(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    // Persist drafts automatically per chat (only for normal compose mode).
    if (editing) return;
    setDraft(chatId, text);
  }, [chatId, editing, setDraft, text]);

  useEffect(() => {
    return () => {
      if (voiceArmTimer.current) clearTimeout(voiceArmTimer.current);
      if (voiceTickTimer.current) clearInterval(voiceTickTimer.current);
      voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  type SendVars = { text: string; replyTo: MessageDto | null; attachments: any[] };

  const send = useMutation<MessageDto | null, Error, SendVars, SendMutationCtx | undefined>({
    mutationFn: async (vars: SendVars) => {
      const body = {
        text: vars.text,
        replyToMessageId: vars.replyTo?.id,
        attachments: vars.attachments.length ? vars.attachments : undefined,
      };
      if (!body.text?.trim() && !body.attachments?.length) return null;
      return apiFetch<MessageDto>(`/chats/${chatId}/messages`, {
        method: 'POST',
        body,
      });
    },
    onMutate: (vars: SendVars) => {
      const myId = decodeJwtSub(token) ?? meUser?.id ?? null;
      if ((!vars.text?.trim() && !vars.attachments.length) || !myId) return undefined;

      const prev = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
      const tempId = `optimistic:${Date.now()}`;
      const atts = vars.attachments;
      const mediaOnly = atts.length > 0 && !vars.text?.trim();
      let optimisticType = 'TEXT';
      if (mediaOnly) {
        const k0 = atts[0]?.kind;
        if (k0 === 'voice') optimisticType = 'VOICE';
        else if (k0 === 'image') optimisticType = 'IMAGE';
        else if (k0 === 'video') optimisticType = 'VIDEO';
        else optimisticType = 'FILE';
      }
      const optimistic: MessageDto = {
        id: tempId,
        chatId,
        senderId: myId,
        type: optimisticType,
        text: vars.text?.trim() ? vars.text : null,
        clientTempId: null,
        replyToMessageId: vars.replyTo?.id ?? null,
        forwardedFromMessageId: null,
        editedAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        attachments: vars.attachments.map((a: any, i: number) => ({
          id: `optimistic-att:${i}`,
          kind: a.kind,
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          url: a.url,
          durationSec: a.durationSec ?? null,
        })),
        reactions: [],
        replyTo: vars.replyTo
          ? {
              id: vars.replyTo.id,
              text: vars.replyTo.text,
              senderId: vars.replyTo.senderId,
              deletedAt: vars.replyTo.deletedAt ?? null,
            }
          : undefined,
        deliveryStatus: 'SENDING',
      };

      qc.setQueryData<MessagesQueryData>(
        ['messages', chatId],
        (old: MessagesQueryData | undefined) => {
          if (!old) {
            return { items: [optimistic], nextCursor: null };
          }
          return { ...old, items: [...old.items, optimistic] };
        },
      );

      return { prev, tempId };
    },
    onError: (_err: Error, _vars: SendVars, ctx: SendMutationCtx | undefined) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(['messages', chatId], ctx.prev);
      }
    },
    onSuccess: (
      serverMsg: MessageDto | null,
      _vars: SendVars,
      ctx: SendMutationCtx | undefined,
    ) => {
      if (serverMsg) {
        qc.setQueryData<MessagesQueryData>(
          ['messages', chatId],
          (old: MessagesQueryData | undefined) => {
            if (!old) {
              return { items: [serverMsg], nextCursor: null };
            }
            const withoutThisTemp = old.items.filter((m: MessageDto) => m.id !== ctx?.tempId);
            const hasId = withoutThisTemp.some((m: MessageDto) => m.id === serverMsg.id);
            const merged = hasId ? withoutThisTemp : [...withoutThisTemp, serverMsg];
            return { ...old, items: merged };
          },
        );
        const meta = bumpMetaFromMessage(serverMsg);
        bumpChatListPreview(qc, chatId, meta.preview, serverMsg.createdAt, {
          lastMessageType: meta.lastMessageType,
          lastAttachmentKind: meta.lastAttachmentKind,
        });
        if (soundEnabled) playMessageSendSound();
      }
    },
    onSettled: () => {
      setUiSending(false);
    },
  });

  const edit = useMutation<
    MessageDto,
    Error,
    { text: string; messageId: string },
    { prev: MessagesQueryData | undefined }
  >({
    mutationFn: async (vars: { text: string; messageId: string }) => {
      return apiFetch<MessageDto>(`/chats/${chatId}/messages/${vars.messageId}`, {
        method: 'PATCH',
        body: { text: vars.text },
      });
    },
    onMutate: async (vars: { text: string; messageId: string }) => {
      const prev = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
      qc.setQueryData<MessagesQueryData>(
        ['messages', chatId],
        (old: MessagesQueryData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((m) =>
              m.id === vars.messageId
                ? { ...m, text: vars.text, editedAt: new Date().toISOString() }
                : m,
            ),
          };
        },
      );
      return { prev } as { prev: MessagesQueryData | undefined };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(['messages', chatId], ctx.prev);
    },
    onSuccess: (updated: MessageDto) => {
      qc.setQueryData<MessagesQueryData>(
        ['messages', chatId],
        (old: MessagesQueryData | undefined) => {
          if (!old) return old;
          return { ...old, items: old.items.map((m) => (m.id === updated.id ? updated : m)) };
        },
      );
      const meta = bumpMetaFromMessage(updated);
      bumpChatListPreview(qc, chatId, meta.preview, updated.createdAt, {
        lastMessageType: meta.lastMessageType,
        lastAttachmentKind: meta.lastAttachmentKind,
      });
    },
    onSettled: () => setUiSending(false),
  });

  const triggerSend = useCallback(() => {
    const bodyText = text.trim();
    const attachmentInputs = pending.map((p) => ({
      storageKey: p.storageKey,
      kind: p.kind,
      fileName: p.fileName,
      mimeType: p.mimeType,
      sizeBytes: p.sizeBytes,
      url: p.url,
      ...(p.durationSec != null ? { durationSec: p.durationSec } : {}),
    }));
    if (!bodyText && attachmentInputs.length === 0) return;

    if (editing) {
      setText('');
      onCancelEdit();
      setUiSending(true);
      window.setTimeout(() => setUiSending(false), 250);
      edit.mutate({ text: bodyText, messageId: editing.id });
      return;
    }

    setText('');
    clearDraft(chatId);
    clearPending(chatId);
    onCancelReply();
    try {
      getSocket()?.emit('message:typing', { chatId, typing: false });
    } catch {
      /* ignore */
    }
    setUiSending(true);
    window.setTimeout(() => setUiSending(false), 250);
    send.mutate({ text: bodyText, replyTo, attachments: attachmentInputs });
  }, [
    chatId,
    clearDraft,
    clearPending,
    edit,
    editing,
    onCancelEdit,
    onCancelReply,
    pending,
    replyTo,
    send,
    text,
  ]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        triggerSend();
      }
    },
    [triggerSend],
  );

  const canSend = Boolean(text.trim() || pending.length);

  const resizeTextarea = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, 132);
    el.style.height = `${Math.max(next, 40)}px`;
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  const beginVoiceRecording = useCallback(
    async (pointerId: number) => {
      if (editing || !token) return;
      if (!voicePointerDownRef.current) {
        setVoiceUi('idle');
        return;
      }
      voiceCancelledRef.current = false;
      voiceChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!voicePointerDownRef.current) {
          stream.getTracks().forEach((tr) => tr.stop());
          setVoiceUi('idle');
          return;
        }
        voiceStreamRef.current = stream;
        const mime = pickVoiceMimeType();
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        rec.ondataavailable = (ev) => {
          if (ev.data.size > 0) voiceChunksRef.current.push(ev.data);
        };
        rec.onstop = () => {
          if (voiceTickTimer.current) {
            clearInterval(voiceTickTimer.current);
            voiceTickTimer.current = null;
          }
          voiceStreamRef.current?.getTracks().forEach((tr) => tr.stop());
          voiceStreamRef.current = null;
          voiceRecorderRef.current = null;
          setVoiceUi('idle');
          setVoiceSlideCancel(false);
          setVoiceSec(0);
          try {
            voiceMicBtnRef.current?.releasePointerCapture(pointerId);
          } catch {
            /* ignore */
          }
          if (voiceCancelledRef.current) return;
          const blob = new Blob(voiceChunksRef.current, { type: rec.mimeType || 'audio/webm' });
          const ms = Date.now() - voiceStartedAtRef.current;
          if (ms < 550 || blob.size < 200) {
            setVoiceErr(t('voiceTooShort'));
            window.setTimeout(() => setVoiceErr(null), 2400);
            return;
          }
          const dur = Math.max(1, Math.round(ms / 1000));
          const ext = blob.type.includes('webm')
            ? 'webm'
            : blob.type.includes('mp4') || blob.type.includes('m4a')
              ? 'm4a'
              : 'ogg';
          const file = new File([blob], `voice-${Date.now()}.${ext}`, {
            type: blob.type || 'audio/webm',
          });
          void (async () => {
            try {
              const meta = await uploadMedia(file, 'voice', token, sessionId);
              addPending(chatId, {
                localId: `pending:${Date.now()}`,
                storageKey: meta.storageKey,
                url: meta.url,
                fileName: meta.fileName,
                mimeType: meta.mimeType,
                sizeBytes: meta.sizeBytes,
                kind: 'voice',
                createdAt: Date.now(),
                durationSec: dur,
              });
            } catch {
              setVoiceErr(t('voiceRecordError'));
              window.setTimeout(() => setVoiceErr(null), 2800);
            }
          })();
        };
        voiceRecorderRef.current = rec;
        voiceStartedAtRef.current = Date.now();
        rec.start(140);
        setVoiceUi('recording');
        setVoiceSec(0);
        voiceTickTimer.current = setInterval(() => {
          setVoiceSec(Math.max(0, Math.floor((Date.now() - voiceStartedAtRef.current) / 1000)));
        }, 250);
        try {
          voiceMicBtnRef.current?.setPointerCapture(pointerId);
        } catch {
          /* ignore */
        }
      } catch {
        setVoiceUi('idle');
        setVoiceErr(t('voiceMicDenied'));
        window.setTimeout(() => setVoiceErr(null), 3200);
      }
    },
    [addPending, chatId, editing, sessionId, t, token],
  );

  const abortVoiceArm = useCallback(() => {
    if (voiceArmTimer.current) {
      clearTimeout(voiceArmTimer.current);
      voiceArmTimer.current = null;
    }
    setVoiceUi('idle');
  }, []);

  const onVoiceMicPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (editing || e.button !== 0) return;
      e.preventDefault();
      voicePointerDownRef.current = true;
      voiceStartCoordsRef.current = { x: e.clientX, y: e.clientY };
      voiceCancelledRef.current = false;
      setVoiceSlideCancel(false);
      setVoiceErr(null);
      setVoiceUi('arming');
      if (voiceArmTimer.current) clearTimeout(voiceArmTimer.current);
      const pid = e.pointerId;
      voiceArmTimer.current = setTimeout(() => {
        voiceArmTimer.current = null;
        if (!voicePointerDownRef.current) {
          setVoiceUi('idle');
          return;
        }
        void beginVoiceRecording(pid);
      }, 95);
    },
    [beginVoiceRecording, editing],
  );

  const onVoiceMicPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (voiceRecorderRef.current?.state !== 'recording') return;
    const dy = e.clientY - voiceStartCoordsRef.current.y;
    const cancelZone = dy < -52;
    voiceCancelledRef.current = cancelZone;
    setVoiceSlideCancel(cancelZone);
  }, []);

  const onVoiceMicPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      voicePointerDownRef.current = false;
      try {
        if (voiceMicBtnRef.current?.hasPointerCapture(e.pointerId)) {
          voiceMicBtnRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      if (voiceArmTimer.current) {
        abortVoiceArm();
        return;
      }
      const rec = voiceRecorderRef.current;
      if (rec && rec.state === 'recording') {
        rec.stop();
      }
    },
    [abortVoiceArm],
  );

  return (
    <div
      className={cn(
        'shrink-0 touch-manipulation px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md',
        'border-t border-white/[0.08] bg-[#0e1621]/96 md:border-line/75 md:bg-surface-elevated/98 dark:md:border-line/45 dark:md:bg-surface-elevated/98',
      )}
    >
      {editing && (
        <div className="mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35">
          <div className="min-w-0 flex-1 border-l-2 border-amber-500/60 pl-2">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400">
              {t('composerEditing')}
            </p>
            <p className="truncate text-[12.5px] leading-snug text-ink">
              {editing.text || t('message')}
            </p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink"
            onClick={() => {
              setText('');
              onCancelEdit();
            }}
            aria-label={t('cancelEditAria')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      {replyTo && (
        <div className="mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35">
          <div className="min-w-0 flex-1 border-l-2 border-accent/55 pl-2">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-accent">
              {t('msgReply')}
            </p>
            <p className="truncate text-[12.5px] leading-snug text-ink">
              {replyTo.text || t('composerAttachment')}
            </p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink"
            onClick={onCancelReply}
            aria-label={t('cancelReplyAria')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      {pending.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {pending.map((p) => (
            <div
              key={p.localId}
              className="group flex max-w-full items-center gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35"
            >
              {p.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toPublicUrl(p.url) ?? p.url}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover ring-1 ring-line/45 dark:ring-line/35"
                />
              ) : p.kind === 'voice' ? (
                <div className="flex h-9 w-12 items-end justify-center gap-0.5 rounded-lg bg-surface-elevated/70 px-1 ring-1 ring-line/45 dark:bg-surface-elevated/40 dark:ring-line/35">
                  {[4, 7, 5, 9, 6, 8, 5, 7, 4].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 shrink-0 rounded-full bg-accent/80"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated/70 text-xs font-semibold text-ink-muted ring-1 ring-line/45 dark:bg-surface-elevated/40 dark:ring-line/35">
                  {p.kind === 'video' ? t('videoKind') : t('fileKind')}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {p.kind === 'voice' ? t('voiceNote') : p.fileName}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {p.kind === 'voice'
                    ? p.durationSec != null
                      ? `${p.durationSec}s · ${t('voiceHoldToRecord')}`
                      : t('voiceRecordingHint')
                    : `${Math.max(1, Math.round(p.sizeBytes / 1024))} KB`}
                </p>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink"
                onClick={() => removePending(chatId, p.localId)}
                aria-label={t('removeAttachmentAria')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {(voiceUi === 'recording' || voiceUi === 'arming') && (
        <div
          className={cn(
            'mb-2 flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-[13px] font-medium shadow-lg',
            voiceSlideCancel
              ? 'border-red-500/45 bg-red-950/35 text-red-100'
              : 'border-[#3390ec]/35 bg-[#17212b]/95 text-white',
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] opacity-80">
              {voiceUi === 'arming' ? t('commonLoading') : t('voiceRecording')}
            </span>
            <span className="truncate">
              {voiceUi === 'recording'
                ? voiceSlideCancel
                  ? t('voiceSlideToCancel')
                  : `${t('voiceReleaseToSend')} · ${voiceSec}s`
                : t('voiceHoldToRecord')}
            </span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-end justify-center gap-0.5 rounded-xl bg-black/20 px-1 py-1">
            {[5, 9, 6, 11, 7, 10, 6, 9, 5].map((h, i) => (
              <span
                key={i}
                className={cn(
                  'w-0.5 shrink-0 rounded-full bg-white/85',
                  voiceUi === 'recording' && !voiceSlideCancel && 'animate-pulse',
                )}
                style={{ height: `${h}px`, animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      )}
      {voiceErr && (
        <p
          className="mb-1.5 px-1 text-center text-[11px] text-red-600 dark:text-red-400"
          role="alert"
        >
          {voiceErr}
        </p>
      )}
      <div className="flex items-end gap-1 rounded-[1.65rem] border border-line/80 bg-surface-muted/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-white/[0.08] dark:bg-[#111921] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <label
          className={cn(
            'mb-px flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[1rem] text-ink-muted transition',
            'hover:bg-surface-elevated/90 hover:text-accent active:scale-[0.97] dark:hover:bg-surface-elevated/55',
          )}
          title={t('attachFile')}
        >
          <PaperclipIcon className="h-[1.15rem] w-[1.15rem] opacity-90" />
          <input
            type="file"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const kind = f.type.startsWith('image/')
                ? 'image'
                : f.type.startsWith('video/')
                  ? 'video'
                  : f.type.startsWith('audio/')
                    ? 'voice'
                    : 'file';
              if (!token) return;
              const meta = await uploadMedia(f, kind, token, sessionId);
              addPending(chatId, {
                localId: `pending:${Date.now()}`,
                storageKey: meta.storageKey,
                url: meta.url,
                fileName: meta.fileName,
                mimeType: meta.mimeType,
                sizeBytes: meta.sizeBytes,
                kind: kind,
                createdAt: Date.now(),
              });
              e.target.value = '';
            }}
          />
        </label>
        {!editing && (
          <button
            type="button"
            disabled={!token}
            onClick={() => setVideoCaptureOpen(true)}
            className={cn(
              'mb-px flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] text-ink-muted transition',
              'hover:bg-surface-elevated/90 hover:text-accent active:scale-[0.97] dark:hover:bg-surface-elevated/55',
            )}
            title={t('videoNoteOpen')}
            aria-label={t('videoNoteOpenAria')}
          >
            <VideoCamIcon className="h-[1.15rem] w-[1.15rem] opacity-90" />
          </button>
        )}
        {!editing && (
          <button
            ref={voiceMicBtnRef}
            type="button"
            disabled={!token}
            onPointerDown={onVoiceMicPointerDown}
            onPointerMove={onVoiceMicPointerMove}
            onPointerUp={onVoiceMicPointerUp}
            onPointerCancel={onVoiceMicPointerUp}
            className={cn(
              'touch-none mb-px flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-[1rem] text-ink-muted transition',
              'hover:bg-surface-elevated/90 hover:text-accent active:scale-[0.97] dark:hover:bg-surface-elevated/55',
              voiceUi === 'recording' && 'bg-accent/15 text-accent',
            )}
            title={t('voiceHoldToRecord')}
            aria-label={t('voiceMicAria')}
          >
            <MicIcon className="h-[1.15rem] w-[1.15rem] opacity-90" />
          </button>
        )}
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            if (editing) return;

            if (typingDebounce.current) clearTimeout(typingDebounce.current);
            typingDebounce.current = setTimeout(() => {
              const s = getSocket();
              if (!s?.connected) return;
              const typing = Boolean(next.trim());
              try {
                s.emit('message:typing', { chatId, typing });
              } catch {
                /* ignore */
              }
            }, 120);

            if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
            typingStopTimer.current = setTimeout(() => {
              try {
                getSocket()?.emit('message:typing', { chatId, typing: false });
              } catch {
                /* ignore */
              }
            }, 2200);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
            if (typingDebounce.current) clearTimeout(typingDebounce.current);
            try {
              getSocket()?.emit('message:typing', { chatId, typing: false });
            } catch {
              /* ignore */
            }
          }}
          placeholder={editing ? t('editMessage') : t('message')}
          className={cn(
            'mb-px max-h-[8.25rem] min-h-[2.5rem] flex-1 resize-none bg-transparent py-2.5 pr-1 text-[16px] leading-snug text-ink placeholder:text-ink-muted/65 outline-none dark:text-white dark:placeholder:text-white/45 md:text-[15px] md:leading-[1.45] md:dark:text-ink md:dark:placeholder:text-ink-muted/65',
          )}
          aria-label={t('messageTextAria')}
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={triggerSend}
          title={t('sendMessage')}
          className={cn(
            'mb-px flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
            canSend
              ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/10 ring-1 ring-black/[0.05] hover:brightness-[1.04] active:scale-[0.96] dark:shadow-black/35 dark:ring-white/10'
              : 'cursor-not-allowed bg-surface-muted/80 text-ink-muted/45 dark:bg-surface-elevated/45',
          )}
          aria-label={t('sendMessage')}
        >
          {uiSending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bubble-out-ink/30 border-t-bubble-out-ink" />
          ) : (
            <SendIcon className="ml-px h-[1.05rem] w-[1.05rem]" />
          )}
        </button>
      </div>
      {send.isError && (
        <p
          className="mt-1.5 px-2 text-center text-[11px] leading-snug text-red-600 dark:text-red-400"
          role="alert"
        >
          <span className="font-semibold">{t('sendFailed')}</span>{' '}
          <span className="opacity-90">
            {send.error instanceof ApiError
              ? `${send.error.message} (HTTP ${send.error.status})`
              : send.error instanceof Error
                ? send.error.message
                : String(send.error)}
          </span>
        </p>
      )}
      <p className="mt-1 hidden px-1 text-center text-[0.625rem] text-ink-muted/75 md:block">
        <kbd className="rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50">
          Enter
        </kbd>{' '}
        {t('composerHintSend')} ·{' '}
        <kbd className="rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50">
          Shift+Enter
        </kbd>{' '}
        {t('composerHintNewLine')}
      </p>
      <VideoNoteCaptureModal
        open={videoCaptureOpen}
        onClose={() => setVideoCaptureOpen(false)}
        onRecorded={async (file, durationSec) => {
          if (!token) return;
          try {
            const meta = await uploadMedia(file, 'video', token, sessionId);
            addPending(chatId, {
              localId: `pending:${Date.now()}`,
              storageKey: meta.storageKey,
              url: meta.url,
              fileName: meta.fileName,
              mimeType: meta.mimeType,
              sizeBytes: meta.sizeBytes,
              kind: 'video',
              createdAt: Date.now(),
              durationSec,
            });
          } catch {
            setVoiceErr(t('videoNoteRecordError'));
            window.setTimeout(() => setVoiceErr(null), 2800);
          }
        }}
      />
    </div>
  );
}
