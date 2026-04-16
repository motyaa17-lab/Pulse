(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [411],
  {
    2226: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 5379));
    },
    2982: (e, t, s) => {
      'use strict';
      s.d(t, { H$: () => a, hD: () => r, nr: () => o });
      var n = s(3719);
      let a = 'http://localhost:4000';
      class r extends Error {
        constructor(e, t, s) {
          (super(t), (this.status = e), (this.body = s));
        }
      }
      async function i() {
        let e = n.n.getState().refreshToken;
        if (!e) return null;
        let t = await fetch(''.concat(a, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!t.ok) return (n.n.getState().clear(), null);
        let s = await t.json();
        return (n.n.getState().setTokens(s), s.accessToken);
      }
      async function o(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: s, ...o } = t,
          l = new Headers(o.headers);
        if (!s) {
          let e = n.n.getState().accessToken;
          e && l.set('Authorization', 'Bearer '.concat(e));
          let t = n.n.getState().sessionId;
          t && l.set('x-session-fingerprint', t);
        }
        let c = o.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          l.has('Content-Type') || l.set('Content-Type', 'application/json'));
        let u = await fetch(''.concat(a).concat(e), { ...o, body: c, headers: l });
        if (401 === u.status && !s) {
          let t = await i();
          t &&
            (l.set('Authorization', 'Bearer '.concat(t)),
            (u = await fetch(''.concat(a).concat(e), { ...o, body: c, headers: l })));
        }
        let d = await u.text(),
          h = null;
        if (d)
          try {
            h = JSON.parse(d);
          } catch (e) {
            h = { raw: d };
          }
        if (!u.ok) {
          let e =
            'object' == typeof h && null !== h && 'message' in h ? String(h.message) : u.statusText;
          throw new r(u.status, e, h);
        }
        return h;
      }
    },
    3719: (e, t, s) => {
      'use strict';
      s.d(t, { n: () => r });
      var n = s(1620),
        a = s(848);
      let r = (0, n.v)()(
        (0, a.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: s, refreshToken: n, sessionId: a } = t;
              return e({ accessToken: s, refreshToken: n, sessionId: null != a ? a : null });
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
                    r.setState({ hasHydrated: !0 }));
                }));
            },
          },
        ),
      );
    },
    5379: (e, t, s) => {
      'use strict';
      (s.r(t), s.d(t, { default: () => d }));
      var n = s(4568),
        a = s(7620),
        r = s(7541),
        i = s(4869),
        o = s(2995),
        l = s(2982),
        c = s(7444),
        u = s(8646);
      function d() {
        let e = (0, u.k)();
        return (0, n.jsx)(a.Suspense, {
          fallback: (0, n.jsxs)('div', {
            className: 'flex h-full flex-col items-center justify-center px-6 text-center',
            children: [
              (0, n.jsx)('div', {
                className:
                  'flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm',
                children: (0, n.jsx)('svg', {
                  width: '22',
                  height: '22',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  'aria-hidden': !0,
                  children: (0, n.jsx)('path', {
                    d: 'M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z',
                    stroke: 'currentColor',
                    className: 'text-ink-muted',
                    strokeWidth: '2',
                    strokeLinejoin: 'round',
                  }),
                }),
              }),
              (0, n.jsx)('p', {
                className: 'mt-4 font-display text-xl font-semibold text-ink',
                children: e('openingInbox'),
              }),
              (0, n.jsx)('p', {
                className: 'mt-1 max-w-sm text-sm leading-relaxed text-ink-muted',
                children: 'Getting things ready. This usually takes a moment.',
              }),
            ],
          }),
          children: (0, n.jsx)(h, {}),
        });
      }
      function h() {
        var e;
        let t = (0, r.useRouter)(),
          s = (0, r.useSearchParams)().get('start'),
          d = (0, i.jE)(),
          h = (0, u.k)(),
          { data: m, isLoading: f } = (0, o.I)({
            queryKey: ['chats', ''],
            queryFn: () => (0, l.nr)('/chats'),
          });
        return ((0, a.useEffect)(() => {
          (async () => {
            if (s) {
              try {
                let e = await (0, c.X)(s);
                (d.invalidateQueries({ queryKey: ['chats'] }), t.replace('/chats/'.concat(e.id)));
              } catch (e) {
                t.replace('/chats');
              }
              return;
            }
            if (f) return;
            let e = null == m ? void 0 : m[0];
            e && t.replace('/chats/'.concat(e.id));
          })();
        }, [m, f, d, t, s]),
        f)
          ? (0, n.jsxs)('div', {
              className: 'flex h-full flex-col items-center justify-center px-6 text-center',
              children: [
                (0, n.jsx)('div', {
                  className:
                    'flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm',
                  children: (0, n.jsx)('svg', {
                    width: '22',
                    height: '22',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    'aria-hidden': !0,
                    children: (0, n.jsx)('path', {
                      d: 'M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z',
                      stroke: 'currentColor',
                      className: 'text-ink-muted',
                      strokeWidth: '2',
                      strokeLinejoin: 'round',
                    }),
                  }),
                }),
                (0, n.jsx)('p', {
                  className: 'mt-4 font-display text-xl font-semibold text-ink',
                  children: h('openingInbox'),
                }),
                (0, n.jsx)('p', {
                  className: 'mt-1 max-w-sm text-sm leading-relaxed text-ink-muted',
                  children: h('syncingChats'),
                }),
              ],
            })
          : (null != (e = null == m ? void 0 : m.length) ? e : 0) > 0
            ? (0, n.jsx)('div', {
                className:
                  'flex h-full flex-col items-center justify-center px-6 text-center text-sm text-ink-muted',
                children: (0, n.jsx)('p', {
                  className: 'font-medium text-ink',
                  children: h('openingChat'),
                }),
              })
            : (0, n.jsxs)('div', {
                className: 'flex h-full flex-col items-center justify-center px-6 text-center',
                children: [
                  (0, n.jsx)('div', {
                    className:
                      'flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm',
                    children: (0, n.jsx)('svg', {
                      width: '22',
                      height: '22',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      'aria-hidden': !0,
                      children: (0, n.jsx)('path', {
                        d: 'M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z',
                        stroke: 'currentColor',
                        className: 'text-ink-muted',
                        strokeWidth: '2',
                        strokeLinejoin: 'round',
                      }),
                    }),
                  }),
                  (0, n.jsx)('p', {
                    className: 'mt-4 font-display text-xl font-semibold text-ink',
                    children: h('noConversationsYet'),
                  }),
                  (0, n.jsxs)('p', {
                    className: 'mt-1 max-w-sm text-sm leading-relaxed text-ink-muted',
                    children: [
                      'Start a direct chat from Search (',
                      (0, n.jsx)('kbd', {
                        className: 'rounded border border-line/70 px-1 py-px text-[11px]',
                        children: 'Ctrl',
                      }),
                      '+',
                      (0, n.jsx)('kbd', {
                        className: 'rounded border border-line/70 px-1 py-px text-[11px]',
                        children: 'K',
                      }),
                      '), or invite someone to message you.',
                    ],
                  }),
                ],
              });
      }
    },
    6563: (e, t, s) => {
      'use strict';
      s.d(t, { n: () => r });
      var n = s(1620),
        a = s(848);
      let r = (0, n.v)()(
        (0, a.Zr)((e) => ({ language: 'en', setLanguage: (t) => e({ language: t }) }), {
          name: 'pulse-language',
        }),
      );
    },
    7444: (e, t, s) => {
      'use strict';
      s.d(t, { X: () => r });
      var n = s(2982);
      let a = new Map();
      function r(e) {
        let t = a.get(e);
        return (
          t ||
            ((t = (0, n.nr)('/chats/direct', { method: 'POST', body: { peerUserId: e } }).finally(
              () => {
                a.delete(e);
              },
            )),
            a.set(e, t)),
          t
        );
      }
    },
    7541: (e, t, s) => {
      'use strict';
      var n = s(3041);
      (s.o(n, 'useParams') &&
        s.d(t, {
          useParams: function () {
            return n.useParams;
          },
        }),
        s.o(n, 'usePathname') &&
          s.d(t, {
            usePathname: function () {
              return n.usePathname;
            },
          }),
        s.o(n, 'useRouter') &&
          s.d(t, {
            useRouter: function () {
              return n.useRouter;
            },
          }),
        s.o(n, 'useSearchParams') &&
          s.d(t, {
            useSearchParams: function () {
              return n.useSearchParams;
            },
          }));
    },
    8646: (e, t, s) => {
      'use strict';
      s.d(t, { k: () => i });
      var n = s(7620),
        a = s(6563);
      let r = {
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
      function i() {
        let e = (0, a.n)((e) => e.language);
        return (0, n.useMemo)(
          () => (t) => {
            var s, n, i;
            return null !=
              (i =
                null !=
                (n = (null != (s = r[null != e ? e : a.n.getState().language]) ? s : r.en)[t])
                  ? n
                  : r.en[t])
              ? i
              : t;
          },
          [e],
        );
      }
    },
  },
  (e) => {
    (e.O(0, [887, 995, 587, 18, 358], () => e((e.s = 2226))), (_N_E = e.O()));
  },
]);
