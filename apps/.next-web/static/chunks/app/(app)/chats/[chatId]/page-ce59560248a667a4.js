(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [185],
  {
    2982: (e, t, n) => {
      'use strict';
      n.d(t, { H$: () => a, hD: () => l, nr: () => i });
      var r = n(3719);
      let a = 'http://localhost:4000';
      class l extends Error {
        constructor(e, t, n) {
          (super(t), (this.status = e), (this.body = n));
        }
      }
      async function s() {
        let e = r.n.getState().refreshToken;
        if (!e) return null;
        let t = await fetch(''.concat(a, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!t.ok) return (r.n.getState().clear(), null);
        let n = await t.json();
        return (r.n.getState().setTokens(n), n.accessToken);
      }
      async function i(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: n, ...i } = t,
          d = new Headers(i.headers);
        if (!n) {
          let e = r.n.getState().accessToken;
          e && d.set('Authorization', 'Bearer '.concat(e));
          let t = r.n.getState().sessionId;
          t && d.set('x-session-fingerprint', t);
        }
        let o = i.body;
        null == o ||
          o instanceof FormData ||
          ('object' != typeof o ||
            o instanceof Blob ||
            o instanceof ArrayBuffer ||
            (o = JSON.stringify(o)),
          d.has('Content-Type') || d.set('Content-Type', 'application/json'));
        let c = await fetch(''.concat(a).concat(e), { ...i, body: o, headers: d });
        if (401 === c.status && !n) {
          let t = await s();
          t &&
            (d.set('Authorization', 'Bearer '.concat(t)),
            (c = await fetch(''.concat(a).concat(e), { ...i, body: o, headers: d })));
        }
        let u = await c.text(),
          m = null;
        if (u)
          try {
            m = JSON.parse(u);
          } catch (e) {
            m = { raw: u };
          }
        if (!c.ok) {
          let e =
            'object' == typeof m && null !== m && 'message' in m ? String(m.message) : c.statusText;
          throw new l(c.status, e, m);
        }
        return m;
      }
    },
    3719: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => l });
      var r = n(1620),
        a = n(848);
      let l = (0, r.v)()(
        (0, a.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: n, refreshToken: r, sessionId: a } = t;
              return e({ accessToken: n, refreshToken: r, sessionId: null != a ? a : null });
            },
            clear: () => e({ accessToken: null, refreshToken: null, sessionId: null }),
          }),
          {
            name: 'pulse-auth',
            partialize: (e) => ({
              accessToken: e.accessToken,
              refreshToken: e.refreshToken,
              sessionId: e.sessionId,
            }),
            onRehydrateStorage: () => (e, t) => {
              (console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
                error: t instanceof Error ? t.message : null != t ? t : null,
              }),
                queueMicrotask(() => {
                  (console.log('[pulse-bootstrap] persist microtask: set hasHydrated true'),
                    l.setState({ hasHydrated: !0 }));
                }));
            },
          },
        ),
      );
    },
    4043: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => r });
      let r = (0, n(1620).v)((e) => ({
        theme: 'system',
        sidebarOpen: !0,
        detailsOpen: !1,
        searchOpen: !1,
        typingByChat: {},
        setTheme: (t) => e({ theme: t }),
        toggleSidebar: () => e((e) => ({ sidebarOpen: !e.sidebarOpen })),
        setSidebarOpen: (t) => e({ sidebarOpen: t }),
        setDetailsOpen: (t) => e({ detailsOpen: t }),
        setSearchOpen: (t) => e({ searchOpen: t }),
        setTypingForChat: (t, n) =>
          e((e) => ({
            typingByChat: n
              ? { ...e.typingByChat, [t]: !0 }
              : Object.fromEntries(
                  Object.entries(e.typingByChat).filter((e) => {
                    let [n] = e;
                    return n !== t;
                  }),
                ),
          })),
      }));
    },
    4683: (e, t, n) => {
      'use strict';
      n.d(t, { G1: () => c, Ol: () => d, cH: () => o });
      var r = n(2838),
        a = n(3719);
      let l = 'http://localhost:4000',
        s = null,
        i = null;
      function d() {
        return s;
      }
      function o() {
        if (null == s ? void 0 : s.connected) return s;
        let e = a.n.getState().accessToken;
        return (
          (s = (0, r.io)(l, {
            transports: ['websocket', 'polling'],
            auth: { token: e },
            autoConnect: !!e,
          })),
          i && (clearInterval(i), (i = null)),
          (i = setInterval(() => {
            try {
              (null == s ? void 0 : s.connected) && s.emit('presence:ping');
            } catch (e) {}
          }, 45e3)),
          s
        );
      }
      function c() {
        (null == s || s.disconnect(), (s = null), i && (clearInterval(i), (i = null)));
      }
    },
    5095: (e, t, n) => {
      'use strict';
      n.d(t, { cn: () => l });
      var r = n(2902),
        a = n(5643);
      function l() {
        for (var e = arguments.length, t = Array(e), n = 0; n < e; n++) t[n] = arguments[n];
        return (0, a.QP)((0, r.$)(t));
      }
    },
    6563: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => l });
      var r = n(1620),
        a = n(848);
      let l = (0, r.v)()(
        (0, a.Zr)((e) => ({ language: 'en', setLanguage: (t) => e({ language: t }) }), {
          name: 'pulse-language',
        }),
      );
    },
    8646: (e, t, n) => {
      'use strict';
      n.d(t, { k: () => s });
      var r = n(7620),
        a = n(6563);
      let l = {
        en: {
          settings: 'Settings',
          appearance: 'Appearance',
          sessions: 'Sessions',
          signOut: 'Sign out',
          search: 'Search',
          online: 'Online',
          lastSeenRecently: 'Last seen recently',
          offline: 'Offline',
          sendMessage: 'Send message',
          message: 'Message',
          editMessage: 'Edit message',
          backToChats: 'Back to chats',
          account: 'Account',
          myProfile: 'My Profile',
          openDeviceList: 'Open device list',
          filterConversations: 'Filter conversations',
          pinned: 'Pinned',
          archived: 'Archived',
          pin: 'Pin',
          unpin: 'Unpin',
          archive: 'Archive',
          unarchive: 'Unarchive',
          mute: 'Mute',
          unmute: 'Unmute',
          hideChat: 'Hide chat',
          searchPlaceholder: 'Search people, chats, messages…',
          searching: 'Searching…',
          people: 'People',
          chats: 'Chats',
          messages: 'Messages',
          noMatches: 'No matches',
          typing: 'Typing…',
          directMessage: 'Direct message',
          group: 'Group',
          channel: 'Channel',
          saved: 'Saved',
          openingInbox: 'Opening your inbox',
          syncingChats: 'Syncing your chats…',
          noConversationsYet: 'No conversations yet',
          openingChat: 'Opening a chat…',
        },
        ru: {
          settings: 'Настройки',
          appearance: 'Внешний вид',
          sessions: 'Сессии',
          signOut: 'Выйти',
          search: 'Поиск',
          online: 'В сети',
          lastSeenRecently: 'Был недавно',
          offline: 'Не в сети',
          sendMessage: 'Отправить сообщение',
          message: 'Сообщение',
          editMessage: 'Редактировать сообщение',
          backToChats: 'Назад к чатам',
          account: 'Аккаунт',
          myProfile: 'Мой профиль',
          openDeviceList: 'Открыть список устройств',
          filterConversations: 'Фильтр диалогов',
          pinned: 'Закреплённые',
          archived: 'Архив',
          pin: 'Закрепить',
          unpin: 'Открепить',
          archive: 'В архив',
          unarchive: 'Из архива',
          mute: 'Выключить звук',
          unmute: 'Включить звук',
          hideChat: 'Скрыть чат',
          searchPlaceholder: 'Поиск людей, чатов, сообщений…',
          searching: 'Поиск…',
          people: 'Люди',
          chats: 'Чаты',
          messages: 'Сообщения',
          noMatches: 'Ничего не найдено',
          typing: 'Печатает…',
          directMessage: 'Личные сообщения',
          group: 'Группа',
          channel: 'Канал',
          saved: 'Избранное',
          openingInbox: 'Открываем ваш список чатов',
          syncingChats: 'Синхронизация чатов…',
          noConversationsYet: 'Пока нет диалогов',
          openingChat: 'Открываем чат…',
        },
      };
      function s() {
        let e = (0, a.n)((e) => e.language);
        return (0, r.useMemo)(
          () => (t) => {
            var n, r, s;
            return null !=
              (s =
                null !=
                (r = (null != (n = l[null != e ? e : a.n.getState().language]) ? n : l.en)[t])
                  ? r
                  : l.en[t])
              ? s
              : t;
          },
          [e],
        );
      }
    },
    9384: (e, t, n) => {
      'use strict';
      (n.r(t), n.d(t, { default: () => U }));
      var r = n(4568),
        a = n(9664),
        l = n.n(a),
        s = n(7620),
        i = n(7541),
        d = n(4869),
        o = n(2995),
        c = n(2982),
        u = n(5913);
      function m(e, t, n, r) {
        e.setQueriesData({ queryKey: ['chats'] }, (e) => {
          if (!e) return e;
          let a = e.findIndex((e) => e.id === t);
          if (a < 0) return e;
          let l = [...e];
          return (
            (l[a] = { ...l[a], lastMessagePreview: n.slice(0, 160), lastMessageAt: r }),
            l.sort((e, t) =>
              e.isPinned !== t.isPinned
                ? e.isPinned
                  ? -1
                  : 1
                : new Date(t.lastMessageAt).getTime() - new Date(e.lastMessageAt).getTime(),
            ),
            l
          );
        });
      }
      var h = n(4683),
        x = n(3719),
        p = n(5095);
      function f(e) {
        if (!e) return null;
        let t = e.split('.');
        if (t.length < 2) return null;
        try {
          let e = t[1].replace(/-/g, '+').replace(/_/g, '/'),
            n = e.length % 4 == 0 ? '' : '='.repeat(4 - (e.length % 4)),
            r = atob(e + n),
            a = JSON.parse(r);
          return 'string' == typeof a.sub ? a.sub : null;
        } catch (e) {
          return null;
        }
      }
      async function g(e, t, n, r) {
        let a = new FormData();
        (a.append('file', e), a.append('kind', t));
        let l = { Authorization: 'Bearer '.concat(n) };
        r && (l['x-session-fingerprint'] = r);
        let s = await fetch(''.concat(c.H$, '/media/upload'), {
          method: 'POST',
          headers: l,
          body: a,
        });
        if (!s.ok) throw Error('upload failed');
        return await s.json();
      }
      var b = n(1620);
      let v = (0, b.v)((e) => ({
        byChat: {},
        add: (t, n) =>
          e((e) => {
            var r;
            return {
              byChat: {
                ...e.byChat,
                [t]: [...(null != (r = e.byChat[t]) ? r : []), { ...n, chatId: t }],
              },
            };
          }),
        remove: (t, n) =>
          e((e) => {
            var r;
            return {
              byChat: {
                ...e.byChat,
                [t]: (null != (r = e.byChat[t]) ? r : []).filter((e) => e.localId !== n),
              },
            };
          }),
        clear: (t) =>
          e((e) => {
            let { [t]: n, ...r } = e.byChat;
            return { byChat: r };
          }),
      }));
      var y = n(1562),
        k = n(848);
      let w = (0, b.v)()(
        (0, k.Zr)(
          (e) => ({
            drafts: {},
            setDraft: (t, n) =>
              e((e) => {
                if (!n) {
                  let { [t]: n, ...r } = e.drafts;
                  return { drafts: r };
                }
                return { drafts: { ...e.drafts, [t]: n } };
              }),
            clearDraft: (t) =>
              e((e) => {
                let { [t]: n, ...r } = e.drafts;
                return { drafts: r };
              }),
          }),
          { name: 'pulse-drafts' },
        ),
      );
      var j = n(8646);
      let N = [];
      function T(e) {
        let { className: t } = e;
        return (0, r.jsx)('svg', {
          className: t,
          width: '22',
          height: '22',
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': !0,
          children: (0, r.jsx)('path', {
            d: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
            stroke: 'currentColor',
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        });
      }
      function C(e) {
        let { className: t } = e;
        return (0, r.jsx)('svg', {
          className: t,
          width: '20',
          height: '20',
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': !0,
          children: (0, r.jsx)('path', {
            d: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
            stroke: 'currentColor',
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        });
      }
      function I(e) {
        var t;
        let { chatId: n, replyTo: a, onCancelReply: l, editing: i, onCancelEdit: u } = e,
          b = (0, j.k)(),
          [k, I] = (0, s.useState)(''),
          [S, D] = (0, s.useState)(!1),
          M = (0, s.useRef)(null),
          E = (0, s.useRef)(null),
          A = (0, s.useRef)(null),
          L = (0, d.jE)(),
          O = (0, x.n)((e) => e.accessToken),
          P = (0, x.n)((e) => e.sessionId),
          R = w((e) => {
            var t;
            return null != (t = e.drafts[n]) ? t : '';
          }),
          B = w((e) => e.setDraft),
          F = w((e) => e.clearDraft),
          _ = null != (t = v((e) => e.byChat[n])) ? t : N,
          z = v((e) => e.add),
          Q = v((e) => e.remove),
          U = v((e) => e.clear),
          { data: W } = (0, o.I)({ queryKey: ['me'], queryFn: () => (0, c.nr)('/users/me') });
        ((0, s.useEffect)(() => {
          var e;
          i &&
            (I(null != (e = i.text) ? e : ''),
            window.setTimeout(() => {
              let e = M.current;
              if (!e) return;
              e.focus();
              let t = e.value;
              e.setSelectionRange(t.length, t.length);
            }, 0));
        }, [null == i ? void 0 : i.id]),
          (0, s.useEffect)(() => {
            i || I(R);
          }, [n]),
          (0, s.useEffect)(() => {
            i || B(n, k);
          }, [n, i, B, k]));
        let H = (0, y.n)({
            mutationFn: async (e) => {
              var t, r, a;
              let l = {
                text: e.text,
                replyToMessageId: null == (t = e.replyTo) ? void 0 : t.id,
                attachments: e.attachments.length ? e.attachments : void 0,
              };
              return (null == (r = l.text) ? void 0 : r.trim()) ||
                (null == (a = l.attachments) ? void 0 : a.length)
                ? (0, c.nr)('/chats/'.concat(n, '/messages'), { method: 'POST', body: l })
                : null;
            },
            onMutate: (e) => {
              var t, r, a, l, s, i, d, o;
              let c = null != (i = null != (s = f(O)) ? s : null == W ? void 0 : W.id) ? i : null;
              if ((!(null == (t = e.text) ? void 0 : t.trim()) && !e.attachments.length) || !c)
                return;
              let u = L.getQueryData(['messages', n]),
                m = 'optimistic:'.concat(Date.now()),
                h = {
                  id: m,
                  chatId: n,
                  senderId: c,
                  type:
                    !e.attachments.length || (null == (r = e.text) ? void 0 : r.trim())
                      ? 'TEXT'
                      : 'FILE',
                  text: (null == (a = e.text) ? void 0 : a.trim()) ? e.text : null,
                  clientTempId: null,
                  replyToMessageId:
                    null != (d = null == (l = e.replyTo) ? void 0 : l.id) ? d : null,
                  forwardedFromMessageId: null,
                  editedAt: null,
                  deletedAt: null,
                  createdAt: new Date().toISOString(),
                  attachments: e.attachments.map((e, t) => {
                    var n;
                    return {
                      id: 'optimistic-att:'.concat(t),
                      kind: e.kind,
                      fileName: e.fileName,
                      mimeType: e.mimeType,
                      sizeBytes: e.sizeBytes,
                      url: e.url,
                      durationSec: null != (n = e.durationSec) ? n : null,
                    };
                  }),
                  reactions: [],
                  replyTo: e.replyTo
                    ? {
                        id: e.replyTo.id,
                        text: e.replyTo.text,
                        senderId: e.replyTo.senderId,
                        deletedAt: null != (o = e.replyTo.deletedAt) ? o : null,
                      }
                    : void 0,
                  deliveryStatus: 'SENDING',
                };
              return (
                L.setQueryData(['messages', n], (e) =>
                  e ? { ...e, items: [...e.items, h] } : { items: [h], nextCursor: null },
                ),
                { prev: u, tempId: m }
              );
            },
            onError: (e, t, r) => {
              (null == r ? void 0 : r.prev) !== void 0 && L.setQueryData(['messages', n], r.prev);
            },
            onSuccess: (e, t, r) => {
              if (e) {
                var a;
                (L.setQueryData(['messages', n], (t) => {
                  if (!t) return { items: [e], nextCursor: null };
                  let n = t.items.filter((e) => e.id !== (null == r ? void 0 : r.tempId)),
                    a = n.some((t) => t.id === e.id) ? n : [...n, e];
                  return { ...t, items: a };
                }),
                  m(
                    L,
                    n,
                    (null == (a = e.text) ? void 0 : a.trim()) ? e.text.slice(0, 160) : '[Media]',
                    e.createdAt,
                  ));
              }
            },
            onSettled: () => {
              D(!1);
            },
          }),
          K = (0, y.n)({
            mutationFn: async (e) =>
              (0, c.nr)('/chats/'.concat(n, '/messages/').concat(e.messageId), {
                method: 'PATCH',
                body: { text: e.text },
              }),
            onMutate: async (e) => {
              let t = L.getQueryData(['messages', n]);
              return (
                L.setQueryData(['messages', n], (t) =>
                  t
                    ? {
                        ...t,
                        items: t.items.map((t) =>
                          t.id === e.messageId
                            ? { ...t, text: e.text, editedAt: new Date().toISOString() }
                            : t,
                        ),
                      }
                    : t,
                ),
                { prev: t }
              );
            },
            onError: (e, t, r) => {
              (null == r ? void 0 : r.prev) && L.setQueryData(['messages', n], r.prev);
            },
            onSuccess: (e) => {
              var t;
              (L.setQueryData(['messages', n], (t) =>
                t ? { ...t, items: t.items.map((t) => (t.id === e.id ? e : t)) } : t,
              ),
                m(
                  L,
                  n,
                  (null == (t = e.text) ? void 0 : t.trim()) ? e.text.slice(0, 160) : '[Media]',
                  e.createdAt,
                ));
            },
            onSettled: () => D(!1),
          }),
          Y = (0, s.useCallback)(() => {
            let e = k.trim(),
              t = _.map((e) => ({
                storageKey: e.storageKey,
                kind: e.kind,
                fileName: e.fileName,
                mimeType: e.mimeType,
                sizeBytes: e.sizeBytes,
                url: e.url,
              }));
            if (e || 0 !== t.length) {
              if (i) {
                (I(''),
                  u(),
                  D(!0),
                  window.setTimeout(() => D(!1), 250),
                  K.mutate({ text: e, messageId: i.id }));
                return;
              }
              (I(''), F(n), U(n), l());
              try {
                var r;
                null == (r = (0, h.Ol)()) || r.emit('message:typing', { chatId: n, typing: !1 });
              } catch (e) {}
              (D(!0),
                window.setTimeout(() => D(!1), 250),
                H.mutate({ text: e, replyTo: a, attachments: t }));
            }
          }, [n, F, U, K, i, u, l, _, a, H, k]),
          q = (0, s.useCallback)(
            (e) => {
              'Enter' !== e.key || e.shiftKey || (e.preventDefault(), Y());
            },
            [Y],
          ),
          V = !!(k.trim() || _.length),
          G = (0, s.useCallback)(() => {
            let e = M.current;
            if (!e) return;
            e.style.height = '0px';
            let t = Math.min(e.scrollHeight, 132);
            e.style.height = ''.concat(Math.max(t, 40), 'px');
          }, []);
        return (
          (0, s.useLayoutEffect)(() => {
            G();
          }, [k, G]),
          (0, r.jsxs)('div', {
            className:
              'shrink-0 border-t border-line/75 bg-surface-elevated/98 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md dark:border-line/45 dark:bg-surface-elevated/98',
            children: [
              i &&
                (0, r.jsxs)('div', {
                  className:
                    'mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                  children: [
                    (0, r.jsxs)('div', {
                      className: 'min-w-0 flex-1 border-l-2 border-amber-500/60 pl-2',
                      children: [
                        (0, r.jsx)('p', {
                          className:
                            'text-[0.6rem] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400',
                          children: 'Editing',
                        }),
                        (0, r.jsx)('p', {
                          className: 'truncate text-[12.5px] leading-snug text-ink',
                          children: i.text || 'Message',
                        }),
                      ],
                    }),
                    (0, r.jsx)('button', {
                      type: 'button',
                      className:
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                      onClick: () => {
                        (I(''), u());
                      },
                      'aria-label': 'Cancel edit',
                      children: (0, r.jsx)('svg', {
                        width: '16',
                        height: '16',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        'aria-hidden': !0,
                        children: (0, r.jsx)('path', {
                          d: 'M18 6L6 18M6 6l12 12',
                          stroke: 'currentColor',
                          strokeWidth: '2',
                          strokeLinecap: 'round',
                        }),
                      }),
                    }),
                  ],
                }),
              a &&
                (0, r.jsxs)('div', {
                  className:
                    'mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                  children: [
                    (0, r.jsxs)('div', {
                      className: 'min-w-0 flex-1 border-l-2 border-accent/55 pl-2',
                      children: [
                        (0, r.jsx)('p', {
                          className:
                            'text-[0.6rem] font-bold uppercase tracking-[0.1em] text-accent',
                          children: 'Reply',
                        }),
                        (0, r.jsx)('p', {
                          className: 'truncate text-[12.5px] leading-snug text-ink',
                          children: a.text || 'Attachment',
                        }),
                      ],
                    }),
                    (0, r.jsx)('button', {
                      type: 'button',
                      className:
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                      onClick: l,
                      'aria-label': 'Cancel reply',
                      children: (0, r.jsx)('svg', {
                        width: '16',
                        height: '16',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        'aria-hidden': !0,
                        children: (0, r.jsx)('path', {
                          d: 'M18 6L6 18M6 6l12 12',
                          stroke: 'currentColor',
                          strokeWidth: '2',
                          strokeLinecap: 'round',
                        }),
                      }),
                    }),
                  ],
                }),
              _.length > 0 &&
                (0, r.jsx)('div', {
                  className: 'mb-1.5 flex flex-wrap gap-1.5',
                  children: _.map((e) =>
                    (0, r.jsxs)(
                      'div',
                      {
                        className:
                          'group flex max-w-full items-center gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                        children: [
                          'image' === e.kind
                            ? (0, r.jsx)('img', {
                                src: e.url,
                                alt: '',
                                className:
                                  'h-9 w-9 rounded-lg object-cover ring-1 ring-line/45 dark:ring-line/35',
                              })
                            : (0, r.jsx)('div', {
                                className:
                                  'flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated/70 text-xs font-semibold text-ink-muted ring-1 ring-line/45 dark:bg-surface-elevated/40 dark:ring-line/35',
                                children: 'video' === e.kind ? 'VID' : 'FILE',
                              }),
                          (0, r.jsxs)('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              (0, r.jsx)('p', {
                                className: 'truncate text-[12.5px] font-medium text-ink',
                                children: e.fileName,
                              }),
                              (0, r.jsxs)('p', {
                                className: 'text-[11px] text-ink-muted',
                                children: [Math.max(1, Math.round(e.sizeBytes / 1024)), ' KB'],
                              }),
                            ],
                          }),
                          (0, r.jsx)('button', {
                            type: 'button',
                            className:
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                            onClick: () => Q(n, e.localId),
                            'aria-label': 'Remove attachment',
                            children: (0, r.jsx)('svg', {
                              width: '16',
                              height: '16',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              'aria-hidden': !0,
                              children: (0, r.jsx)('path', {
                                d: 'M18 6L6 18M6 6l12 12',
                                stroke: 'currentColor',
                                strokeWidth: '2',
                                strokeLinecap: 'round',
                              }),
                            }),
                          }),
                        ],
                      },
                      e.localId,
                    ),
                  ),
                }),
              (0, r.jsxs)('div', {
                className:
                  'flex items-end gap-1 rounded-[1.35rem] border border-line/80 bg-surface-muted/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-line/50 dark:bg-surface-muted/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
                children: [
                  (0, r.jsxs)('label', {
                    className: (0, p.cn)(
                      'mb-px flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[1rem] text-ink-muted transition',
                      'hover:bg-surface-elevated/90 hover:text-accent active:scale-[0.97] dark:hover:bg-surface-elevated/55',
                    ),
                    title: 'Attach file',
                    children: [
                      (0, r.jsx)(T, { className: 'h-[1.15rem] w-[1.15rem] opacity-90' }),
                      (0, r.jsx)('input', {
                        type: 'file',
                        className: 'sr-only',
                        onChange: async (e) => {
                          var t;
                          let r = null == (t = e.target.files) ? void 0 : t[0];
                          if (!r) return;
                          let a = r.type.startsWith('image/')
                            ? 'image'
                            : r.type.startsWith('video/')
                              ? 'video'
                              : 'file';
                          if (!O) return;
                          let l = await g(r, a, O, P);
                          (z(n, {
                            localId: 'pending:'.concat(Date.now()),
                            storageKey: l.storageKey,
                            url: l.url,
                            fileName: l.fileName,
                            mimeType: l.mimeType,
                            sizeBytes: l.sizeBytes,
                            kind: a,
                            createdAt: Date.now(),
                          }),
                            (e.target.value = ''));
                        },
                      }),
                    ],
                  }),
                  (0, r.jsx)('textarea', {
                    ref: M,
                    rows: 1,
                    value: k,
                    onChange: (e) => {
                      let t = e.target.value;
                      (I(t),
                        i ||
                          (A.current && clearTimeout(A.current),
                          (A.current = setTimeout(() => {
                            let e = (0, h.Ol)();
                            if (!(null == e ? void 0 : e.connected)) return;
                            let r = !!t.trim();
                            try {
                              e.emit('message:typing', { chatId: n, typing: r });
                            } catch (e) {}
                          }, 120)),
                          E.current && clearTimeout(E.current),
                          (E.current = setTimeout(() => {
                            try {
                              var e;
                              null == (e = (0, h.Ol)()) ||
                                e.emit('message:typing', { chatId: n, typing: !1 });
                            } catch (e) {}
                          }, 2200))));
                    },
                    onKeyDown: q,
                    onBlur: () => {
                      (E.current && clearTimeout(E.current), A.current && clearTimeout(A.current));
                      try {
                        var e;
                        null == (e = (0, h.Ol)()) ||
                          e.emit('message:typing', { chatId: n, typing: !1 });
                      } catch (e) {}
                    },
                    placeholder: b(i ? 'editMessage' : 'message'),
                    className: (0, p.cn)(
                      'mb-px max-h-[8.25rem] min-h-[2.5rem] flex-1 resize-none bg-transparent py-2.5 pr-1 text-[15px] leading-[1.45] text-ink placeholder:text-ink-muted/65 outline-none',
                    ),
                    'aria-label': 'Message text',
                  }),
                  (0, r.jsx)('button', {
                    type: 'button',
                    disabled: !V,
                    onClick: Y,
                    title: b('sendMessage'),
                    className: (0, p.cn)(
                      'mb-px flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                      V
                        ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/10 ring-1 ring-black/[0.05] hover:brightness-[1.04] active:scale-[0.96] dark:shadow-black/35 dark:ring-white/10'
                        : 'cursor-not-allowed bg-surface-muted/80 text-ink-muted/45 dark:bg-surface-elevated/45',
                    ),
                    'aria-label': b('sendMessage'),
                    children: S
                      ? (0, r.jsx)('span', {
                          className:
                            'h-4 w-4 animate-spin rounded-full border-2 border-bubble-out-ink/30 border-t-bubble-out-ink',
                        })
                      : (0, r.jsx)(C, { className: 'ml-px h-[1.05rem] w-[1.05rem]' }),
                  }),
                ],
              }),
              (0, r.jsxs)('p', {
                className: 'mt-1 px-1 text-center text-[0.625rem] text-ink-muted/75',
                children: [
                  (0, r.jsx)('kbd', {
                    className:
                      'rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50',
                    children: 'Enter',
                  }),
                  ' ',
                  'to send \xb7',
                  ' ',
                  (0, r.jsx)('kbd', {
                    className:
                      'rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50',
                    children: 'Shift+Enter',
                  }),
                  ' ',
                  'new line',
                ],
              }),
            ],
          })
        );
      }
      var S = n(7509);
      let D = ['\uD83D\uDC4D', '❤️', '\uD83D\uDE02', '\uD83C\uDF89', '\uD83D\uDC40'];
      function M(e, t, n) {
        return Math.max(t, Math.min(n, e));
      }
      function E(e) {
        let {
            open: t,
            anchorRef: n,
            onClose: a,
            actions: l,
            showReactions: i,
            onReact: d,
            closeOnScrollEl: o,
          } = e,
          c = (0, s.useRef)(null),
          [u, m] = (0, s.useState)({ top: 0, left: 0, origin: 'top' }),
          h = (0, s.useMemo)(() => l.filter((e) => !e.disabled), [l]);
        return ((0, s.useLayoutEffect)(() => {
          if (!t) return;
          let e = n.current;
          if (!e) return;
          let r = e.getBoundingClientRect(),
            a = i ? 176 : 140,
            l = window.innerWidth,
            s = window.innerHeight,
            d = r.bottom + 8 + a < s - 10,
            o = d ? r.bottom + 8 : r.top - 8 - a,
            c = M(r.right - 248, 10, l - 248 - 10);
          m({ top: M(o, 10, s - a - 10), left: c, origin: d ? 'top' : 'bottom' });
        }, [t, n, i, h.length]),
        (0, s.useEffect)(() => {
          if (!t) return;
          let e = (e) => {
              'Escape' === e.key && a();
            },
            r = (e) => {
              let t = e.target;
              if (!t) return;
              let r = c.current,
                l = n.current;
              !(r && r.contains(t)) && ((l && l.contains(t)) || a());
            };
          return (
            window.addEventListener('keydown', e),
            window.addEventListener('mousedown', r),
            () => {
              (window.removeEventListener('keydown', e),
                window.removeEventListener('mousedown', r));
            }
          );
        }, [t, a, n]),
        (0, s.useEffect)(() => {
          if (!t) return;
          let e = null == o ? void 0 : o.current;
          if (!e) return;
          let n = () => a();
          return (
            e.addEventListener('scroll', n, { passive: !0 }),
            () => e.removeEventListener('scroll', n)
          );
        }, [t, a, o]),
        t && 'undefined' != typeof document)
          ? (0, S.createPortal)(
              (0, r.jsxs)('div', {
                ref: c,
                className: (0, p.cn)(
                  'fixed z-[120] w-[248px] overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift backdrop-blur',
                  'dark:border-line/55 dark:bg-surface-elevated/98',
                ),
                style: { top: u.top, left: u.left },
                role: 'menu',
                'aria-label': 'Message actions',
                children: [
                  i &&
                    (0, r.jsxs)('div', {
                      className:
                        'flex items-center justify-between gap-1 border-b border-line/70 px-2.5 py-2 dark:border-line/45',
                      children: [
                        D.map((e) =>
                          (0, r.jsx)(
                            'button',
                            {
                              type: 'button',
                              className:
                                'flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-surface-muted/80 active:scale-[0.98] dark:hover:bg-surface-muted/35',
                              onClick: () => {
                                (d(e), a());
                              },
                              'aria-label': 'React '.concat(e),
                              children: e,
                            },
                            e,
                          ),
                        ),
                        (0, r.jsx)('div', {
                          className:
                            'ml-auto pl-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted',
                          children: 'React',
                        }),
                      ],
                    }),
                  (0, r.jsx)('div', {
                    className: 'py-1',
                    children: h.map((e) =>
                      (0, r.jsx)(
                        'button',
                        {
                          type: 'button',
                          className: (0, p.cn)(
                            'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] font-medium',
                            e.danger
                              ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
                              : 'text-ink hover:bg-surface-muted/75 dark:hover:bg-surface-muted/35',
                          ),
                          onClick: () => {
                            (e.onSelect(), a());
                          },
                          role: 'menuitem',
                          children: (0, r.jsx)('span', {
                            className: 'truncate',
                            children: e.label,
                          }),
                        },
                        e.id,
                      ),
                    ),
                  }),
                ],
              }),
              document.body,
            )
          : null;
      }
      var A = n(4595);
      function L(e) {
        let { className: t } = e;
        return (0, r.jsx)('svg', {
          viewBox: '0 0 24 24',
          fill: 'none',
          className: t,
          'aria-hidden': !0,
          children: (0, r.jsx)('path', {
            d: 'M20 6L9 17l-5-5',
            stroke: 'currentColor',
            strokeWidth: '2.2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        });
      }
      function O(e) {
        let { className: t } = e;
        return (0, r.jsxs)('svg', {
          viewBox: '0 0 24 24',
          fill: 'none',
          className: t,
          'aria-hidden': !0,
          children: [
            (0, r.jsx)('path', {
              d: 'M7 13l3 3L21 5',
              stroke: 'currentColor',
              strokeWidth: '2.2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
            (0, r.jsx)('path', {
              d: 'M3 13l3 3',
              stroke: 'currentColor',
              strokeWidth: '2.2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              opacity: '0.95',
            }),
          ],
        });
      }
      function P(e, t) {
        if ('SYSTEM' === e.type || 'SYSTEM' === t.type || e.senderId !== t.senderId) return !1;
        let n = new Date(e.createdAt).getTime();
        return 3e5 > Math.abs(new Date(t.createdAt).getTime() - n);
      }
      function R(e) {
        var t, n, a;
        let { chatId: l } = e,
          b = (0, d.jE)(),
          y = (0, x.n)((e) => e.accessToken),
          k = (0, x.n)((e) => e.hasHydrated),
          w = f(y),
          j = (0, x.n)((e) => e.sessionId),
          N = v((e) => e.add),
          T = (0, s.useRef)(null),
          C = (0, s.useRef)(0),
          [S, D] = (0, s.useState)(!1),
          M = (0, s.useRef)(null),
          [E, A] = (0, s.useState)(null),
          [L, O] = (0, s.useState)(null),
          [P, R] = (0, s.useState)(null),
          [F, _] = (0, s.useState)(null),
          z = (0, i.useSearchParams)().get('highlight'),
          [Q, U] = (0, s.useState)(null),
          { data: W } = (0, o.I)({ queryKey: ['me'], queryFn: () => (0, c.nr)('/users/me') }),
          H = null != (n = null != w ? w : null == W ? void 0 : W.id) ? n : null,
          { data: K } = (0, o.I)({
            queryKey: ['chats', ''],
            queryFn: () => (0, c.nr)('/chats'),
            enabled: !!P,
          }),
          { data: Y, isLoading: q } = (0, o.I)({
            queryKey: ['messages', l],
            queryFn: () => (0, c.nr)('/chats/'.concat(l, '/messages?take=80')),
          }),
          V = null != (a = null == Y ? void 0 : Y.items) ? a : [],
          G = null == (t = V[V.length - 1]) ? void 0 : t.id;
        (0, s.useEffect)(
          () => () => {
            M.current && clearTimeout(M.current);
          },
          [],
        );
        let J = () => {
            M.current && (clearTimeout(M.current), (M.current = null));
          },
          Z = (e) => {
            J();
          },
          $ = () => {
            (J(),
              (M.current = setTimeout(() => {
                M.current = null;
              }, 220)));
          };
        (0, s.useEffect)(() => {
          if (!y) return;
          let e = (0, h.cH)(),
            t = () => {
              e.emit('chat:join', { chatId: l });
            };
          (e.connected && t(), e.on('connect', t));
          let n = (e) => {
              b.setQueryData(['messages', l], e);
            },
            r = (e) => {
              var t;
              if (!e || 'object' != typeof e || !('id' in e))
                return void b.invalidateQueries({ queryKey: ['messages', l] });
              (n((t) => {
                if (!t) return { items: [e], nextCursor: null };
                if (t.items.some((t) => t.id === e.id))
                  return { ...t, items: t.items.map((t) => (t.id === e.id ? e : t)) };
                let n = t.items.filter((t) => {
                  var n, r;
                  return (
                    !t.id.startsWith('optimistic:') ||
                    ((!e.clientTempId || t.clientTempId !== e.clientTempId) &&
                      !(
                        t.senderId === e.senderId &&
                        (null != (n = t.text) ? n : '') === (null != (r = e.text) ? r : '') &&
                        12e4 >
                          Math.abs(
                            new Date(e.createdAt).getTime() - new Date(t.createdAt).getTime(),
                          )
                      ))
                  );
                });
                return { ...t, items: [...n, e] };
              }),
                m(
                  b,
                  l,
                  (null == (t = e.text) ? void 0 : t.trim()) ? e.text.slice(0, 160) : '[Media]',
                  e.createdAt,
                ));
            },
            a = (e) => {
              if (!e || 'object' != typeof e || !('id' in e))
                return void b.invalidateQueries({ queryKey: ['messages', l] });
              n((t) => (t ? { ...t, items: t.items.map((t) => (t.id === e.id ? e : t)) } : t));
            },
            s = (e) => {
              e &&
                'object' == typeof e &&
                e.messageId &&
                e.reactions &&
                n((t) =>
                  t
                    ? {
                        ...t,
                        items: t.items.map((t) =>
                          t.id === e.messageId ? { ...t, reactions: e.reactions } : t,
                        ),
                      }
                    : t,
                );
            },
            i = (e) => {
              if (!(null == e ? void 0 : e.chatId) || e.chatId !== l || !e.messageId || !e.userId)
                return;
              let t = null == W ? void 0 : W.id;
              t &&
                e.userId !== t &&
                n((n) => {
                  if (!n) return n;
                  let r = n.items.find((t) => t.id === e.messageId);
                  if (!r) return n;
                  let a = new Date(r.createdAt).getTime();
                  return {
                    ...n,
                    items: n.items.map((e) =>
                      e.senderId !== t || 'READ' === e.deliveryStatus
                        ? e
                        : new Date(e.createdAt).getTime() <= a
                          ? { ...e, deliveryStatus: 'DELIVERED' }
                          : e,
                    ),
                  };
                });
            },
            d = (e) => {
              if (!(null == e ? void 0 : e.chatId) || e.chatId !== l || !e.messageId || !e.userId)
                return;
              let t = null == W ? void 0 : W.id;
              t &&
                e.userId !== t &&
                n((n) => {
                  if (!n) return n;
                  let r = n.items.find((t) => t.id === e.messageId);
                  if (!r) return n;
                  let a = new Date(r.createdAt).getTime();
                  return {
                    ...n,
                    items: n.items.map((e) =>
                      e.senderId !== t
                        ? e
                        : new Date(e.createdAt).getTime() <= a
                          ? { ...e, deliveryStatus: 'READ' }
                          : e,
                    ),
                  };
                });
            };
          return (
            e.on('message:new', r),
            e.on('message:updated', a),
            e.on('reaction:update', s),
            e.on('message:deliveredUpdate', i),
            e.on('message:readUpdate', d),
            () => {
              (e.off('connect', t),
                e.emit('chat:leave', { chatId: l }),
                e.off('message:new', r),
                e.off('message:updated', a),
                e.off('reaction:update', s),
                e.off('message:deliveredUpdate', i),
                e.off('message:readUpdate', d));
            }
          );
        }, [y, l, H, b]);
        let X = (0, u.Te)({
            count: V.length,
            getScrollElement: () => T.current,
            estimateSize: () => 82,
            overscan: 14,
          }),
          ee = X.getVirtualItems();
        ((0, s.useEffect)(() => {
          if (!z || 0 === V.length) return;
          let e = V.findIndex((e) => e.id === z);
          if (e < 0) return;
          (X.scrollToIndex(e, { align: 'center' }), U(z));
          let t = window.setTimeout(() => U(null), 2200);
          return () => clearTimeout(t);
        }, [z, V.length]),
          (0, s.useEffect)(() => {
            let e = T.current;
            e && 0 !== V.length && (e.scrollTop = e.scrollHeight);
          }, [l, V.length]),
          (0, s.useEffect)(() => {
            (A(null), O(null), R(null), _(null));
          }, [l]));
        let et = async (e) => {
          var t, n;
          if (P && !P.deletedAt) {
            if (!(null == (t = P.text) ? void 0 : t.trim()))
              return void window.alert(
                'This message type cannot be forwarded yet (MVP: text only).',
              );
            try {
              let t = await (0, c.nr)('/chats/'.concat(e, '/messages'), {
                method: 'POST',
                body: { text: P.text, forwardedFromMessageId: P.id },
              });
              (m(
                b,
                e,
                (null == (n = t.text) ? void 0 : n.trim()) ? t.text.slice(0, 160) : '[Forwarded]',
                t.createdAt,
              ),
                R(null));
            } catch (e) {
              window.alert('Failed to forward message.');
            }
          }
        };
        (0, s.useEffect)(() => {
          let e = T.current;
          if (!e) return;
          let t = () => _(null);
          return (
            e.addEventListener('scroll', t, { passive: !0 }),
            () => e.removeEventListener('scroll', t)
          );
        }, []);
        let en = async (e) => {
            let t = (0, h.Ol)();
            try {
              (await (0, c.nr)('/chats/'.concat(l, '/messages/').concat(e.id, '/read'), {
                method: 'POST',
              }),
                null == t || t.emit('message:read', { chatId: l, messageId: e.id }));
            } catch (e) {}
          },
          er = async (e) => {
            try {
              await (0, c.nr)('/chats/'.concat(l, '/messages/').concat(e.id, '/delivered'), {
                method: 'POST',
              });
            } catch (e) {}
          };
        return ((0, s.useEffect)(() => {
          let e = V[V.length - 1];
          e && (er(e), en(e));
        }, [l, G]),
        k && !H)
          ? (0, r.jsx)('div', {
              className: 'flex min-h-0 flex-1 flex-col',
              children: (0, r.jsx)('div', {
                className:
                  'flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-ink-muted',
                children: 'Loading…',
              }),
            })
          : (0, r.jsxs)('div', {
              className: 'flex min-h-0 flex-1 flex-col',
              children: [
                (0, r.jsxs)('div', {
                  ref: T,
                  className:
                    'scrollbar-thin chat-thread-bg relative isolate min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-1.5 md:px-5 md:py-2.5',
                  onDragEnter: (e) => {
                    (e.preventDefault(), e.stopPropagation(), (C.current += 1), D(!0));
                  },
                  onDragOver: (e) => {
                    (e.preventDefault(), e.stopPropagation(), S || D(!0));
                  },
                  onDragLeave: (e) => {
                    (e.preventDefault(),
                      e.stopPropagation(),
                      (C.current = Math.max(0, C.current - 1)),
                      0 === C.current && D(!1));
                  },
                  onDrop: async (e) => {
                    var t;
                    (e.preventDefault(), e.stopPropagation(), (C.current = 0), D(!1));
                    let n = Array.from(null != (t = e.dataTransfer.files) ? t : []);
                    if (n.length && y)
                      for (let e of n) {
                        let t = e.type.startsWith('image/')
                          ? 'image'
                          : e.type.startsWith('video/')
                            ? 'video'
                            : 'file';
                        try {
                          let n = await g(e, t, y, j);
                          N(l, {
                            localId: 'pending:'
                              .concat(Date.now(), '-')
                              .concat(Math.random().toString(16).slice(2)),
                            storageKey: n.storageKey,
                            url: n.url,
                            fileName: n.fileName,
                            mimeType: n.mimeType,
                            sizeBytes: n.sizeBytes,
                            kind: t,
                            createdAt: Date.now(),
                          });
                        } catch (e) {}
                      }
                  },
                  children: [
                    S &&
                      (0, r.jsx)('div', {
                        className:
                          'pointer-events-none absolute inset-0 z-[50] flex items-center justify-center',
                        children: (0, r.jsx)('div', {
                          className:
                            'rounded-2xl border border-line/70 bg-surface-elevated/85 px-4 py-3 text-sm font-semibold text-ink shadow-lg backdrop-blur dark:border-line/45 dark:bg-surface-elevated/65',
                          children: 'Drop files to upload',
                        }),
                      }),
                    q &&
                      (0, r.jsx)('div', {
                        className: 'space-y-2',
                        children: [1, 2, 3, 4, 5, 6].map((e) =>
                          (0, r.jsx)(
                            'div',
                            {
                              className: (0, p.cn)(
                                'h-12 animate-pulse rounded-[1.125rem]',
                                e % 2 == 0
                                  ? 'ml-auto w-[70%] bg-bubble-out/18'
                                  : 'mr-auto w-[66%] bg-bubble-in/45',
                              ),
                            },
                            e,
                          ),
                        ),
                      }),
                    !q &&
                      0 === V.length &&
                      (0, r.jsxs)('div', {
                        className:
                          'flex h-full flex-col items-center justify-center px-6 text-center',
                        children: [
                          (0, r.jsx)('div', {
                            className:
                              'flex h-12 w-12 items-center justify-center rounded-2xl border border-line/60 bg-surface-elevated/90 shadow-sm backdrop-blur',
                            children: (0, r.jsx)('svg', {
                              width: '22',
                              height: '22',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              'aria-hidden': !0,
                              children: (0, r.jsx)('path', {
                                d: 'M8 10h8M8 14h5M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z',
                                stroke: 'currentColor',
                                className: 'text-ink-muted',
                                strokeWidth: '2',
                                strokeLinejoin: 'round',
                              }),
                            }),
                          }),
                          (0, r.jsx)('p', {
                            className: 'mt-4 font-display text-xl font-semibold text-ink',
                            children: 'Quiet here',
                          }),
                          (0, r.jsx)('p', {
                            className: 'mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted',
                            children: 'Send the first message to start the conversation.',
                          }),
                        ],
                      }),
                    (0, r.jsx)('div', {
                      style: { height: X.getTotalSize(), position: 'relative', width: '100%' },
                      children: ee.map((e) => {
                        let t = V[e.index];
                        if (!t) return null;
                        let n = e.index > 0 ? V[e.index - 1] : void 0,
                          a = e.index < V.length - 1 ? V[e.index + 1] : void 0,
                          s = F === t.id;
                        return (0, r.jsx)(
                          'div',
                          {
                            ref: X.measureElement,
                            'data-index': e.index,
                            className: (0, p.cn)(
                              'absolute left-0 top-0 w-full',
                              s ? 'z-[30]' : 'z-[1]',
                            ),
                            style: { transform: 'translateY('.concat(e.start, 'px)') },
                            children: (0, r.jsx)(B, {
                              m: t,
                              prev: n,
                              next: a,
                              myId: null != H ? H : void 0,
                              highlighted: Q === t.id,
                              onReply: () => A(t),
                              onForward: () => R(t),
                              onEdit: () => {
                                (A(null), O(t));
                              },
                              onDelete: () => {
                                (A(null), O(null));
                              },
                              menuOpen: F === t.id,
                              setMenuOpen: (e) => _(e ? t.id : null),
                              chatId: l,
                              onMessageRowEnter: Z,
                              onMessageRowLeave: $,
                              closeOnScrollEl: T,
                            }),
                          },
                          t.id,
                        );
                      }),
                    }),
                  ],
                }),
                (0, r.jsx)(I, {
                  chatId: l,
                  replyTo: E,
                  onCancelReply: () => A(null),
                  editing: L,
                  onCancelEdit: () => O(null),
                }),
                P &&
                  (0, r.jsx)('div', {
                    className:
                      'fixed inset-0 z-[130] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center',
                    role: 'dialog',
                    'aria-label': 'Forward message',
                    onMouseDown: () => R(null),
                    children: (0, r.jsxs)('div', {
                      className:
                        'w-full max-w-md overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift dark:border-line/55 dark:bg-surface-elevated/98',
                      onMouseDown: (e) => e.stopPropagation(),
                      children: [
                        (0, r.jsxs)('div', {
                          className:
                            'flex items-center gap-2 border-b border-line/70 px-3 py-2.5 dark:border-line/45',
                          children: [
                            (0, r.jsx)('div', {
                              className: 'font-display text-[0.95rem] font-semibold text-ink',
                              children: 'Forward to…',
                            }),
                            (0, r.jsx)('button', {
                              type: 'button',
                              className:
                                'ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-surface-muted/35',
                              onClick: () => R(null),
                              'aria-label': 'Close',
                              children: (0, r.jsx)('svg', {
                                width: '16',
                                height: '16',
                                viewBox: '0 0 24 24',
                                fill: 'none',
                                'aria-hidden': !0,
                                children: (0, r.jsx)('path', {
                                  d: 'M18 6L6 18M6 6l12 12',
                                  stroke: 'currentColor',
                                  strokeWidth: '2',
                                  strokeLinecap: 'round',
                                }),
                              }),
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'max-h-[55vh] overflow-y-auto p-1.5',
                          children: [
                            (null != K ? K : []).map((e) => {
                              var t, n, a, l, s, i, d;
                              let o =
                                  null !=
                                  (i =
                                    null !=
                                    (s =
                                      null != (l = e.title)
                                        ? l
                                        : null == (t = e.peer)
                                          ? void 0
                                          : t.displayName)
                                      ? s
                                      : null == (n = e.peer)
                                        ? void 0
                                        : n.username)
                                    ? i
                                    : 'Chat',
                                c =
                                  null !=
                                  (d = null == (a = e.lastMessagePreview) ? void 0 : a.trim())
                                    ? d
                                    : '';
                              return (0, r.jsxs)(
                                'button',
                                {
                                  type: 'button',
                                  className:
                                    'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-muted/80 dark:hover:bg-surface-muted/35',
                                  onClick: () => void et(e.id),
                                  children: [
                                    (0, r.jsx)('div', {
                                      className:
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-xs font-semibold text-accent ring-1 ring-line/45 dark:from-accent/25 dark:to-accent/5 dark:ring-line/35',
                                      children: o.slice(0, 1).toUpperCase() || '?',
                                    }),
                                    (0, r.jsxs)('div', {
                                      className: 'min-w-0 flex-1',
                                      children: [
                                        (0, r.jsx)('div', {
                                          className:
                                            'truncate text-[12.5px] font-semibold text-ink',
                                          children: o,
                                        }),
                                        (0, r.jsx)('div', {
                                          className: 'truncate text-[11.5px] text-ink-muted',
                                          children: c || ' ',
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                e.id,
                              );
                            }),
                            0 === (null != K ? K : []).length &&
                              (0, r.jsx)('div', {
                                className: 'px-3 py-6 text-center text-sm text-ink-muted',
                                children: 'No chats found.',
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
              ],
            });
      }
      function B(e) {
        var t, n;
        let {
            m: a,
            prev: l,
            next: i,
            myId: o,
            highlighted: u,
            onReply: h,
            onForward: x,
            onEdit: f,
            onDelete: g,
            menuOpen: b,
            setMenuOpen: v,
            chatId: y,
            onMessageRowEnter: k,
            onMessageRowLeave: w,
            closeOnScrollEl: j,
          } = e,
          N = (0, d.jE)(),
          T = !!a.deletedAt,
          C = 'SYSTEM' === a.type,
          I = (0, s.useRef)(null),
          S = (0, s.useMemo)(
            () => Date.now() - new Date(a.createdAt).getTime() < 2500,
            [a.createdAt],
          ),
          D = (e, t) => {
            N.setQueryData(['messages', y], (n) =>
              n
                ? { ...n, items: n.items.map((n) => (n.id === e ? { ...n, reactions: t } : n)) }
                : n,
            );
          },
          M = async (e, t) => {
            var n, r;
            let a = null != o ? o : null == (n = N.getQueryData(['me'])) ? void 0 : n.id;
            if (!a) return;
            let l = N.getQueryData(['messages', y]),
              s = null == l || null == (r = l.items) ? void 0 : r.find((t) => t.id === e);
            if (!s) return;
            let i = s.reactions.find((e) => e.emoji === t),
              d = !!(null == i ? void 0 : i.userIds.includes(a)),
              u = s.reactions.map((e) => ({
                emoji: e.emoji,
                count: e.count,
                userIds: [...e.userIds],
              }));
            D(
              e,
              (function (e, t, n, r) {
                let a = e.map((e) => ({ emoji: e.emoji, count: e.count, userIds: [...e.userIds] })),
                  l = a.findIndex((e) => e.emoji === t);
                if (r)
                  return l >= 0
                    ? a[l].userIds.includes(n)
                      ? e
                      : ((a[l] = {
                          emoji: t,
                          userIds: [...a[l].userIds, n],
                          count: a[l].count + 1,
                        }),
                        a)
                    : [...a, { emoji: t, userIds: [n], count: 1 }];
                if (l < 0) return e;
                let s = a[l].userIds.filter((e) => e !== n);
                return (
                  0 === s.length
                    ? a.splice(l, 1)
                    : (a[l] = { emoji: t, userIds: s, count: s.length }),
                  a
                );
              })(s.reactions, t, a, !d),
            );
            try {
              let n;
              ((n = d
                ? await (0, c.nr)(
                    '/chats/'
                      .concat(y, '/messages/')
                      .concat(e, '/reactions?emoji=')
                      .concat(encodeURIComponent(t)),
                    { method: 'DELETE' },
                  )
                : await (0, c.nr)('/chats/'.concat(y, '/messages/').concat(e, '/reactions'), {
                    method: 'POST',
                    body: { emoji: t },
                  })),
                D(e, n));
            } catch (t) {
              D(e, u);
            }
          },
          R = async () => {
            if (!(o && a.senderId === o && !T) || !window.confirm('Delete this message?')) return;
            (g(), v(!1));
            let e = N.getQueryData(['messages', y]);
            N.setQueryData(['messages', y], (e) =>
              e
                ? {
                    ...e,
                    items: e.items.map((e) =>
                      e.id === a.id ? { ...e, deletedAt: new Date().toISOString(), text: null } : e,
                    ),
                  }
                : e,
            );
            try {
              let e = await (0, c.nr)('/chats/'.concat(y, '/messages/').concat(a.id), {
                method: 'DELETE',
              });
              (N.setQueryData(['messages', y], (t) =>
                t ? { ...t, items: t.items.map((t) => (t.id === e.id ? e : t)) } : t,
              ),
                m(N, y, 'Message deleted', e.createdAt));
            } catch (t) {
              N.setQueryData(['messages', y], e);
            }
          },
          B = async (e) => {
            try {
              var t, n, r;
              let l =
                  null !=
                  (r =
                    null == (n = N.getQueryData(['chat', y])) || null == (t = n.pinnedMessage)
                      ? void 0
                      : t.id)
                    ? r
                    : null,
                s = await (0, c.nr)('/chats/'.concat(y, '/pin-message'), {
                  method: 'POST',
                  body: { messageId: e && l === e ? null : e },
                });
              N.setQueryData(['chat', y], (e) => {
                var t, n;
                return e
                  ? {
                      ...e,
                      pinnedMessage: s.pinnedMessageId
                        ? {
                            id: a.id,
                            text: a.text,
                            senderId: null != (t = a.senderId) ? t : null,
                            createdAt: a.createdAt,
                            deletedAt: null != (n = a.deletedAt) ? n : null,
                            sender: null,
                          }
                        : null,
                    }
                  : e;
              });
            } catch (e) {
              (console.error('[pin-message] failed', e),
                window.alert('Failed to pin message. Check server logs / migration.'));
            }
          };
        if (C)
          return (0, r.jsx)('div', {
            className: 'mb-1.5 mt-2 flex justify-center first:mt-0',
            children: (0, r.jsx)('span', {
              className:
                'rounded-full bg-surface-muted/95 px-2.5 py-0.5 text-[0.65rem] font-semibold text-ink-muted shadow-sm ring-1 ring-line/35 dark:bg-surface-elevated/90 dark:ring-line/40 dark:text-ink-muted/90',
              children: a.text,
            }),
          });
        let F = !!(o && a.senderId === o),
          _ = F && !T && 'TEXT' === a.type,
          z = F && !T,
          Q = !!(a.text && !T),
          U =
            !l ||
            !(function (e, t) {
              let n = new Date(e),
                r = new Date(t);
              return (
                n.getFullYear() === r.getFullYear() &&
                n.getMonth() === r.getMonth() &&
                n.getDate() === r.getDate()
              );
            })(l.createdAt, a.createdAt),
          W = !l || 'SYSTEM' === l.type || !P(l, a),
          H = !i || 'SYSTEM' === i.type || !P(a, i),
          K = (0, s.useMemo)(() => {
            var e, t, n, r;
            return [
              { id: 'reply', label: 'Reply', onSelect: h },
              {
                id: 'forward',
                label: 'Forward',
                disabled: T || !(null == (e = a.text) ? void 0 : e.trim()),
                onSelect: () => {
                  (v(!1), x());
                },
              },
              {
                id: 'pin',
                label:
                  (null !=
                  (r =
                    null == (n = N.getQueryData(['chat', y])) || null == (t = n.pinnedMessage)
                      ? void 0
                      : t.id)
                    ? r
                    : null) === a.id
                    ? 'Unpin message'
                    : 'Pin message',
                disabled: T,
                onSelect: () => B(a.id),
              },
              {
                id: 'copy',
                label: 'Copy text',
                disabled: !Q,
                onSelect: async () => {
                  var e;
                  let t = null != (e = a.text) ? e : '';
                  try {
                    await navigator.clipboard.writeText(t);
                  } catch (n) {
                    let e = document.createElement('textarea');
                    ((e.value = t),
                      (e.style.position = 'fixed'),
                      (e.style.left = '-9999px'),
                      document.body.appendChild(e),
                      e.select(),
                      document.execCommand('copy'),
                      e.remove());
                  }
                },
              },
              {
                id: 'edit',
                label: 'Edit',
                disabled: !_,
                onSelect: () => {
                  (v(!1), f());
                },
              },
              { id: 'delete', label: 'Delete message', danger: !0, disabled: !z, onSelect: R },
            ];
          }, [Q, z, _, T, a.id, a.text, f, x, h, v]),
          Y = (0, p.cn)(
            'rounded-[1.25rem]',
            !W && F && 'rounded-tr-[0.55rem]',
            !W && !F && 'rounded-tl-[0.55rem]',
            !H && F && 'rounded-br-[0.55rem]',
            !H && !F && 'rounded-bl-[0.55rem]',
          );
        return (0, r.jsxs)(A.P.div, {
          layout: 'position',
          initial: !!S && { opacity: 0, y: 6, scale: 0.992 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.16, ease: [0.2, 0.8, 0.2, 1] },
          className: U ? (W ? 'mt-5' : 'mt-3') : W ? 'mt-3' : 'mt-[3px]',
          children: [
            U &&
              (0, r.jsx)('div', {
                className: 'mb-2 flex justify-center',
                children: (0, r.jsx)('span', {
                  className:
                    'rounded-full bg-surface-elevated/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-muted/90 shadow-sm ring-1 ring-line/35 backdrop-blur dark:bg-surface-elevated/85 dark:ring-line/40',
                  children: (function (e) {
                    let t = new Date(e),
                      n = new Date(),
                      r = new Date(n.getFullYear(), n.getMonth(), n.getDate()),
                      a = new Date(t.getFullYear(), t.getMonth(), t.getDate()),
                      l = Math.round((r.getTime() - a.getTime()) / 864e5);
                    return 0 === l
                      ? 'Today'
                      : 1 === l
                        ? 'Yesterday'
                        : t.toLocaleDateString(void 0, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: t.getFullYear() !== n.getFullYear() ? 'numeric' : void 0,
                          });
                  })(a.createdAt),
                }),
              }),
            (0, r.jsx)('div', {
              className: (0, p.cn)('flex w-full', F ? 'justify-end' : 'justify-start'),
              children: (0, r.jsxs)('div', {
                className: (0, p.cn)(
                  'group relative max-w-[min(100%,34rem)] pt-8 -mt-8',
                  F ? 'ml-auto' : 'mr-auto',
                ),
                onMouseEnter: () => k(a.id),
                onMouseLeave: w,
                children: [
                  (0, r.jsx)('button', {
                    ref: I,
                    type: 'button',
                    className: (0, p.cn)(
                      'absolute top-1 z-[45] flex h-7 w-7 items-center justify-center rounded-full border border-line/80 bg-surface-elevated text-ink-muted shadow-sm transition',
                      'hover:bg-surface-muted hover:text-ink dark:border-line/55 dark:bg-surface-muted/35',
                      F ? 'right-0' : 'left-0',
                      b ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    ),
                    onClick: () => v(!b),
                    'aria-label': 'Message actions',
                    children: (0, r.jsx)('svg', {
                      width: '16',
                      height: '16',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      'aria-hidden': !0,
                      children: (0, r.jsx)('path', {
                        d: 'M5 12h.01M12 12h.01M19 12h.01',
                        stroke: 'currentColor',
                        strokeWidth: '3',
                        strokeLinecap: 'round',
                      }),
                    }),
                  }),
                  (0, r.jsx)(E, {
                    open: b,
                    anchorRef: I,
                    onClose: () => v(!1),
                    actions: K,
                    showReactions: !T,
                    onReact: (e) => M(a.id, e),
                    closeOnScrollEl: j,
                  }),
                  (0, r.jsxs)('div', {
                    className: (0, p.cn)(
                      'relative z-[1] px-[0.7rem] py-[0.45rem] text-[13.5px] leading-[1.42]',
                      Y,
                      F
                        ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/[0.07] ring-1 ring-black/[0.06] dark:shadow-lg dark:shadow-black/40 dark:ring-white/10'
                        : 'bg-bubble-in/98 text-ink shadow-sm ring-1 ring-line/45 dark:bg-bubble-in dark:text-ink/95 dark:ring-line/40 dark:shadow-black/20',
                      u && 'ring-2 ring-accent/55',
                      T && 'opacity-75',
                    ),
                    onDoubleClick: () => {
                      C || T || M(a.id, '❤️');
                    },
                    children: [
                      a.replyTo &&
                        (0, r.jsx)('div', {
                          className: (0, p.cn)(
                            'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                            F
                              ? 'border-bubble-out-ink/45'
                              : 'border-accent/55 dark:border-accent/45',
                          ),
                          children: a.replyTo.deletedAt
                            ? 'Original message removed'
                            : a.replyTo.text,
                        }),
                      a.forwardedFromMessageId &&
                        (0, r.jsxs)('div', {
                          className: (0, p.cn)(
                            'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                            F
                              ? 'border-bubble-out-ink/45'
                              : 'border-accent/55 dark:border-accent/45',
                          ),
                          children: [
                            (0, r.jsx)('span', {
                              className: 'font-bold uppercase tracking-[0.1em]',
                              children: 'Forwarded',
                            }),
                            ' ',
                            a.forwardedFromUser
                              ? (0, r.jsxs)('span', {
                                  className: 'opacity-90',
                                  children: [
                                    'from ',
                                    null != (n = a.forwardedFromUser.displayName)
                                      ? n
                                      : a.forwardedFromUser.username,
                                  ],
                                })
                              : null,
                          ],
                        }),
                      (0, r.jsx)('p', {
                        className: (0, p.cn)(
                          'whitespace-pre-wrap break-words',
                          T && 'italic opacity-75',
                        ),
                        children: T
                          ? 'Message deleted'
                          : a.text
                            ? a.text
                                .split(/(https?:\/\/[^\s]+)/g)
                                .map((e, t) =>
                                  /^https?:\/\//.test(e)
                                    ? (0, r.jsx)(
                                        'a',
                                        {
                                          href: e,
                                          className:
                                            'break-all underline decoration-current/40 underline-offset-2 hover:decoration-current',
                                          target: '_blank',
                                          rel: 'noreferrer',
                                          children: e,
                                        },
                                        t,
                                      )
                                    : (0, r.jsx)('span', { children: e }, t),
                                )
                            : null,
                      }),
                      (null == (t = a.attachments) ? void 0 : t.length) > 0 &&
                        (0, r.jsx)('div', {
                          className: 'mt-2 space-y-2',
                          children: a.attachments.map((e) =>
                            'image' === e.kind
                              ? (0, r.jsx)(
                                  'img',
                                  {
                                    src: e.url,
                                    alt: e.fileName,
                                    className: 'max-h-56 w-full rounded-xl object-cover',
                                  },
                                  e.id,
                                )
                              : (0, r.jsx)(
                                  'a',
                                  {
                                    href: e.url,
                                    className: (0, p.cn)(
                                      'block rounded-xl px-3 py-2 text-2xs font-medium underline-offset-2 hover:underline',
                                      F
                                        ? 'bg-black/10 text-bubble-out-ink'
                                        : 'bg-black/5 text-accent dark:bg-black/20',
                                    ),
                                    target: '_blank',
                                    rel: 'noreferrer',
                                    children: e.fileName,
                                  },
                                  e.id,
                                ),
                          ),
                        }),
                      (0, r.jsxs)('div', {
                        className: (0, p.cn)(
                          'mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0 text-[0.625rem] tabular-nums',
                          F ? 'justify-end text-bubble-out-ink/70' : 'text-ink-muted',
                        ),
                        children: [
                          (0, r.jsx)('span', {
                            children: new Date(a.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                          }),
                          a.editedAt &&
                            (0, r.jsx)('span', { className: 'opacity-75', children: 'edited' }),
                          F &&
                            H &&
                            a.deliveryStatus &&
                            (0, r.jsx)('span', {
                              className: 'ml-0.5 inline-flex items-center gap-0.5 opacity-80',
                              'aria-label': a.deliveryStatus,
                              children:
                                'SENDING' === a.deliveryStatus
                                  ? (0, r.jsx)('span', {
                                      className: 'text-[9px] font-bold uppercase tracking-[0.06em]',
                                      children: '…',
                                    })
                                  : 'SENT' === a.deliveryStatus
                                    ? (0, r.jsx)(L, { className: 'h-3 w-3' })
                                    : (0, r.jsx)(O, { className: 'h-3 w-3' }),
                            }),
                        ],
                      }),
                      a.reactions.length > 0 &&
                        (0, r.jsx)('div', {
                          className: 'mt-1 flex flex-wrap gap-0.5',
                          children: a.reactions.map((e, t) =>
                            (0, r.jsxs)(
                              'button',
                              {
                                type: 'button',
                                className: (0, p.cn)(
                                  'rounded-full border px-1.5 py-px text-[0.65rem] transition',
                                  F
                                    ? 'border-white/30 bg-black/12 hover:bg-black/18'
                                    : 'border-line/55 bg-surface-elevated/50 hover:bg-surface-elevated/80 dark:border-line/45',
                                ),
                                onClick: () => M(a.id, e.emoji),
                                children: [e.emoji, ' ', e.count],
                              },
                              ''.concat(a.id, '-').concat(e.emoji, '-').concat(t),
                            ),
                          ),
                        }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        });
      }
      function F(e) {
        switch (e) {
          case 'DIRECT':
            return 'Direct message';
          case 'GROUP':
            return 'Group';
          case 'CHANNEL':
            return 'Channel';
          case 'SAVED':
            return 'Saved messages';
          default:
            return null != e ? e : 'Chat';
        }
      }
      function _(e) {
        let { title: t, hint: n } = e;
        return (0, r.jsxs)('section', {
          className:
            'rounded-xl border border-line/55 bg-surface-muted/25 px-3 py-3 dark:border-line/40 dark:bg-surface-muted/15',
          children: [
            (0, r.jsx)('h3', {
              className: 'text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted',
              children: t,
            }),
            (0, r.jsx)('p', {
              className: 'mt-1.5 text-[13px] leading-snug text-ink-muted/90',
              children: n,
            }),
          ],
        });
      }
      function z(e) {
        var t, n, a, i, d, o, c, u, m, h, x;
        let { open: f, onClose: g, chat: b } = e,
          v = (0, s.useRef)(g);
        if (
          ((v.current = g),
          (0, s.useEffect)(() => {
            if (!f) return;
            let e = (e) => {
              'Escape' === e.key && v.current();
            };
            return (
              window.addEventListener('keydown', e),
              () => window.removeEventListener('keydown', e)
            );
          }, [f]),
          (0, s.useEffect)(() => {
            if (!f || 'undefined' == typeof document) return;
            let e = document.body.style.overflow;
            return (
              (document.body.style.overflow = 'hidden'),
              () => {
                document.body.style.overflow = e;
              }
            );
          }, [f]),
          !f || 'undefined' == typeof document)
        )
          return null;
        let y = (null == b ? void 0 : b.type) === 'DIRECT',
          k =
            null !=
            (u =
              null !=
              (c =
                null != (o = null == b || null == (t = b.peer) ? void 0 : t.displayName)
                  ? o
                  : null == b
                    ? void 0
                    : b.title)
                ? c
                : null == b || null == (n = b.peer)
                  ? void 0
                  : n.username)
              ? u
              : 'Conversation',
          w = null == b || null == (a = b.peer) ? void 0 : a.username,
          j =
            y && null != (m = null == b || null == (i = b.peer) ? void 0 : i.avatarUrl)
              ? m
              : null == b
                ? void 0
                : b.avatarUrl,
          N = null == b || null == (d = b.peer) ? void 0 : d.id,
          T =
            y && (null == b ? void 0 : b.peer)
              ? b.peer.isOnline
                ? 'Online'
                : b.peer.lastSeenAt
                  ? 'Last seen recently'
                  : 'Offline'
              : null,
          C = k.slice(0, 1).toUpperCase() || '?';
        return (0, S.createPortal)(
          (0, r.jsxs)(r.Fragment, {
            children: [
              (0, r.jsx)('button', {
                type: 'button',
                className: 'fixed inset-0 z-[100] bg-ink/25 backdrop-blur-[2px] dark:bg-black/45',
                'aria-label': 'Close chat info',
                onClick: g,
              }),
              (0, r.jsxs)('aside', {
                className: (0, p.cn)(
                  'fixed inset-y-0 right-0 z-[101] flex h-dvh max-h-dvh w-[min(100%,22rem)] flex-col border-l border-line/80 bg-surface-elevated shadow-[0_0_40px_rgba(0,0,0,0.12)]',
                  'dark:border-line/50 dark:bg-surface-elevated/98 dark:shadow-[0_0_48px_rgba(0,0,0,0.45)]',
                ),
                role: 'dialog',
                'aria-modal': 'true',
                'aria-labelledby': 'chat-details-title',
                onClick: (e) => e.stopPropagation(),
                children: [
                  (0, r.jsxs)('div', {
                    className:
                      'flex shrink-0 items-center justify-between border-b border-line/70 px-4 py-3 dark:border-line/45',
                    children: [
                      (0, r.jsx)('h2', {
                        id: 'chat-details-title',
                        className: 'font-display text-lg font-semibold text-ink',
                        children: 'Chat info',
                      }),
                      (0, r.jsx)('button', {
                        type: 'button',
                        className:
                          'rounded-full p-2 text-ink-muted transition hover:bg-surface-muted hover:text-ink',
                        onClick: g,
                        'aria-label': 'Close',
                        children: (0, r.jsx)('svg', {
                          width: '18',
                          height: '18',
                          viewBox: '0 0 24 24',
                          fill: 'none',
                          'aria-hidden': !0,
                          children: (0, r.jsx)('path', {
                            d: 'M18 6L6 18M6 6l12 12',
                            stroke: 'currentColor',
                            strokeWidth: '2',
                            strokeLinecap: 'round',
                          }),
                        }),
                      }),
                    ],
                  }),
                  (0, r.jsxs)('div', {
                    className: 'scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5',
                    children: [
                      y
                        ? (0, r.jsxs)('div', {
                            className: 'flex flex-col items-center text-center',
                            children: [
                              (0, r.jsxs)(l(), {
                                href: N ? '/users/'.concat(N) : '#',
                                onClick: () => {
                                  N && g();
                                },
                                className: (0, p.cn)(
                                  'group flex flex-col items-center text-center',
                                  !N && 'pointer-events-none',
                                ),
                                'aria-label': 'Open profile',
                                children: [
                                  (0, r.jsx)('div', {
                                    className: 'relative h-[4.5rem] w-[4.5rem] shrink-0',
                                    children: j
                                      ? (0, r.jsx)('img', {
                                          src: j,
                                          alt: '',
                                          className:
                                            'h-full w-full rounded-full object-cover ring-2 ring-line/40 transition group-hover:ring-accent/35 dark:ring-line/35',
                                        })
                                      : (0, r.jsx)('div', {
                                          className: (0, p.cn)(
                                            'flex h-full w-full items-center justify-center rounded-full text-2xl font-semibold ring-2 ring-line/35 transition group-hover:ring-accent/35',
                                            'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                                          ),
                                          children: C,
                                        }),
                                  }),
                                  (0, r.jsx)('p', {
                                    className:
                                      'mt-4 font-display text-lg font-semibold leading-tight text-ink',
                                    children: k,
                                  }),
                                  w
                                    ? (0, r.jsxs)('p', {
                                        className: 'mt-1 text-sm text-ink-muted',
                                        children: ['@', w],
                                      })
                                    : null,
                                  T
                                    ? (0, r.jsx)('p', {
                                        className: 'mt-1 text-sm text-ink-muted',
                                        children: T,
                                      })
                                    : null,
                                  (0, r.jsx)('p', {
                                    className:
                                      'mt-2 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100',
                                    children: 'View profile',
                                  }),
                                ],
                              }),
                              (0, r.jsx)('p', {
                                className:
                                  'mt-3 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25',
                                children: F(null == b ? void 0 : b.type),
                              }),
                            ],
                          })
                        : (0, r.jsxs)('div', {
                            children: [
                              (0, r.jsx)('div', {
                                className: 'flex justify-center',
                                children: (0, r.jsx)('div', {
                                  className: 'relative h-16 w-16 shrink-0',
                                  children: j
                                    ? (0, r.jsx)('img', {
                                        src: j,
                                        alt: '',
                                        className:
                                          'h-full w-full rounded-2xl object-cover ring-2 ring-line/40 dark:ring-line/35',
                                      })
                                    : (0, r.jsx)('div', {
                                        className: (0, p.cn)(
                                          'flex h-full w-full items-center justify-center rounded-2xl text-xl font-semibold ring-2 ring-line/35',
                                          'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                                        ),
                                        children: (null != (h = null == b ? void 0 : b.title)
                                          ? h
                                          : '?'
                                        )
                                          .slice(0, 1)
                                          .toUpperCase(),
                                      }),
                                }),
                              }),
                              (0, r.jsx)('p', {
                                className:
                                  'mt-4 text-center font-display text-lg font-semibold text-ink',
                                children:
                                  null != (x = null == b ? void 0 : b.title)
                                    ? x
                                    : F(null == b ? void 0 : b.type),
                              }),
                              (0, r.jsx)('p', {
                                className:
                                  'mt-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted',
                                children: F(null == b ? void 0 : b.type),
                              }),
                              (null == b ? void 0 : b.role) &&
                                (0, r.jsxs)('p', {
                                  className: 'mt-4 text-center text-sm text-ink-muted',
                                  children: [
                                    'Your role: ',
                                    (0, r.jsx)('span', {
                                      className: 'font-medium text-ink',
                                      children: b.role,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                      !y &&
                        (null == b ? void 0 : b.members) &&
                        b.members.length > 0 &&
                        (0, r.jsxs)('div', {
                          className: 'mt-8',
                          children: [
                            (0, r.jsxs)('p', {
                              className:
                                'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                              children: ['Members (', b.members.length, ')'],
                            }),
                            (0, r.jsx)('ul', {
                              className: 'mt-2 space-y-2',
                              children: b.members.map((e) => {
                                var t;
                                return (0, r.jsxs)(
                                  'li',
                                  {
                                    className:
                                      'flex items-center gap-2 rounded-lg border border-line/60 px-2 py-2 text-sm dark:border-line/45',
                                    children: [
                                      (0, r.jsx)('span', {
                                        className: 'min-w-0 flex-1 truncate font-medium text-ink',
                                        children:
                                          null != (t = e.user.displayName) ? t : e.user.username,
                                      }),
                                      (0, r.jsx)('span', {
                                        className: 'shrink-0 text-2xs uppercase text-ink-muted',
                                        children: e.role,
                                      }),
                                    ],
                                  },
                                  e.userId,
                                );
                              }),
                            }),
                          ],
                        }),
                      y &&
                        (null == b ? void 0 : b.role) &&
                        (0, r.jsxs)('p', {
                          className: 'mt-8 text-center text-sm text-ink-muted',
                          children: [
                            'Your role: ',
                            (0, r.jsx)('span', {
                              className: 'font-medium text-ink',
                              children: b.role,
                            }),
                          ],
                        }),
                      (0, r.jsxs)('div', {
                        className: 'mt-8 space-y-3',
                        children: [
                          (0, r.jsx)('p', {
                            className:
                              'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                            children: 'Shared',
                          }),
                          (0, r.jsx)(_, {
                            title: 'Media',
                            hint: 'Photos and videos shared in this chat will appear here.',
                          }),
                          (0, r.jsx)(_, {
                            title: 'Files',
                            hint: 'Documents and other files will appear here.',
                          }),
                          (0, r.jsx)(_, {
                            title: 'Links',
                            hint: 'Links from messages will be listed here.',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          document.body,
        );
      }
      var Q = n(4043);
      function U() {
        var e, t, n, a, u, m, x, f, g, b, v;
        let y = (0, i.useParams)().chatId,
          k = (0, i.useRouter)(),
          w = (0, d.jE)(),
          N = (0, Q.n)((e) => e.setSidebarOpen),
          T = (0, Q.n)((e) => e.detailsOpen),
          C = (0, Q.n)((e) => e.setDetailsOpen),
          I = (0, Q.n)((e) => {
            var t, n;
            return null != (n = null == (t = e.typingByChat) ? void 0 : t[y]) && n;
          }),
          S = (0, Q.n)((e) => e.setTypingForChat),
          D = (0, j.k)();
        ((0, s.useEffect)(() => {
          C(!1);
        }, [y, C]),
          (0, s.useEffect)(() => {
            let e = (0, h.cH)(),
              t = () => e.emit('chat:join', { chatId: y });
            (e.connected && t(), e.on('connect', t));
            let n = (e) => {
              var t, n;
              if (!(null == e ? void 0 : e.chatId) || e.chatId !== y) return;
              let r = null == (t = w.getQueryData(['me'])) ? void 0 : t.id;
              S(y, (null != (n = e.userIds) ? n : []).filter((e) => e && e !== r).length > 0);
            };
            return (
              e.on('typing:update', n),
              () => {
                (e.off('connect', t),
                  e.emit('chat:leave', { chatId: y }),
                  e.off('typing:update', n),
                  S(y, !1));
              }
            );
          }, [y, w, S]));
        let { data: M } = (0, o.I)({
            queryKey: ['chat', y],
            queryFn: () => (0, c.nr)('/chats/'.concat(y)),
          }),
          E =
            null !=
            (f =
              null !=
              (x =
                null != (m = null == M ? void 0 : M.title)
                  ? m
                  : null == M || null == (e = M.peer)
                    ? void 0
                    : e.displayName)
                ? x
                : null == M || null == (t = M.peer)
                  ? void 0
                  : t.username)
              ? f
              : 'Conversation',
          A =
            null !=
            (b =
              null != (g = null == M ? void 0 : M.avatarUrl)
                ? g
                : null == M || null == (n = M.peer)
                  ? void 0
                  : n.avatarUrl)
              ? b
              : null,
          L =
            (null == M ? void 0 : M.type) === 'DIRECT'
              ? null == M || null == (a = M.peer)
                ? void 0
                : a.id
              : null,
          O =
            (null == M ? void 0 : M.type) === 'DIRECT' && (null == M ? void 0 : M.peer)
              ? D(M.peer.isOnline ? 'online' : M.peer.lastSeenAt ? 'lastSeenRecently' : 'offline')
              : (function (e, t) {
                  switch (t) {
                    case 'DIRECT':
                      return e('directMessage');
                    case 'GROUP':
                      return e('group');
                    case 'CHANNEL':
                      return e('channel');
                    case 'SAVED':
                      return e('saved');
                    default:
                      return null != t ? t : '';
                  }
                })(D, null == M ? void 0 : M.type),
          P = I && (null == M ? void 0 : M.type) === 'DIRECT' ? D('typing') : O,
          B = E.slice(0, 1).toUpperCase() || '?',
          F = null != (v = null == M ? void 0 : M.pinnedMessage) ? v : null;
        return (0, r.jsxs)('div', {
          className: 'flex h-full min-h-0 flex-col',
          children: [
            (0, r.jsxs)('header', {
              className:
                'flex shrink-0 items-center gap-2.5 border-b border-line/75 bg-surface-elevated/98 px-3 py-1.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-line/45 dark:bg-surface-elevated/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]',
              children: [
                (0, r.jsx)('button', {
                  type: 'button',
                  className:
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/75 text-ink-muted transition hover:bg-surface-muted/90 hover:text-ink md:hidden dark:border-line/50 dark:hover:bg-surface-muted/45',
                  onClick: () => N(!0),
                  'aria-label': 'Back to chat list',
                  children: (0, r.jsx)('svg', {
                    width: '18',
                    height: '18',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    'aria-hidden': !0,
                    children: (0, r.jsx)('path', {
                      d: 'M15 18l-6-6 6-6',
                      stroke: 'currentColor',
                      strokeWidth: '2',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }),
                  }),
                }),
                L
                  ? (0, r.jsx)(l(), {
                      href: '/users/'.concat(L),
                      className: 'relative h-9 w-9 shrink-0 md:h-10 md:w-10',
                      'aria-label': 'Open profile',
                      children: A
                        ? (0, r.jsx)('img', {
                            src: A,
                            alt: '',
                            className:
                              'h-9 w-9 rounded-full object-cover ring-1 ring-line/55 transition hover:ring-accent/35 dark:ring-line/35 md:h-10 md:w-10',
                          })
                        : (0, r.jsx)('div', {
                            className: (0, p.cn)(
                              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 transition hover:ring-accent/35 md:h-10 md:w-10 md:text-sm',
                              'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
                            ),
                            children: B,
                          }),
                    })
                  : (0, r.jsx)('div', {
                      className: 'relative h-9 w-9 shrink-0 md:h-10 md:w-10',
                      children: A
                        ? (0, r.jsx)('img', {
                            src: A,
                            alt: '',
                            className:
                              'h-9 w-9 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35 md:h-10 md:w-10',
                          })
                        : (0, r.jsx)('div', {
                            className: (0, p.cn)(
                              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 md:h-10 md:w-10 md:text-sm',
                              'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
                            ),
                            children: B,
                          }),
                    }),
                (0, r.jsxs)('div', {
                  className: 'min-w-0 flex-1 py-0.5',
                  children: [
                    (0, r.jsx)('h1', {
                      className:
                        'truncate font-display text-[0.98rem] font-semibold leading-tight tracking-tight text-ink md:text-[1.0625rem]',
                      children: E,
                    }),
                    (0, r.jsx)('p', {
                      className:
                        'mt-0.5 truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-muted/85',
                      children: P,
                    }),
                  ],
                }),
                (0, r.jsx)('button', {
                  type: 'button',
                  className:
                    'inline-flex h-8 shrink-0 items-center rounded-full border border-line/75 px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/55 hover:text-ink dark:border-line/50 dark:hover:bg-surface-elevated/55',
                  onClick: () => C(!0),
                  children: 'Info',
                }),
              ],
            }),
            F &&
              (0, r.jsxs)('button', {
                type: 'button',
                onClick: () => k.push('/chats/'.concat(y, '?highlight=').concat(F.id)),
                className:
                  'flex shrink-0 items-center gap-2 border-b border-line/60 bg-surface-elevated/90 px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-muted/60 dark:border-line/45 dark:bg-surface-elevated/95',
                'aria-label': 'Pinned message',
                children: [
                  (0, r.jsx)('span', {
                    className:
                      'inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted',
                    children: 'Pinned',
                  }),
                  (0, r.jsx)('span', {
                    className: 'min-w-0 flex-1 truncate text-[13px] text-ink',
                    children: F.deletedAt
                      ? 'Message deleted'
                      : (null == (u = F.text) ? void 0 : u.trim())
                        ? F.text
                        : 'Attachment',
                  }),
                  (0, r.jsx)('span', {
                    className: 'shrink-0 text-[11px] font-semibold text-accent',
                    children: 'View',
                  }),
                ],
              }),
            (0, r.jsx)(z, { open: T, onClose: () => C(!1), chat: M }),
            y && (0, r.jsx)(R, { chatId: y }),
          ],
        });
      }
    },
    9563: (e, t, n) => {
      Promise.resolve().then(n.bind(n, 9384));
    },
  },
  (e) => {
    (e.O(0, [887, 664, 595, 995, 836, 818, 126, 587, 18, 358], () => e((e.s = 9563))),
      (_N_E = e.O()));
  },
]);
