(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [109],
  {
    336: (e, t, n) => {
      'use strict';
      (n.r(t), n.d(t, { default: () => p }));
      var s = n(4568),
        a = n(9664),
        r = n.n(a),
        i = n(7541),
        l = n(4043),
        o = n(3719),
        c = n(2982),
        u = n(4683),
        d = n(6563),
        h = n(8646);
      function p() {
        let e = (0, l.n)((e) => e.theme),
          t = (0, l.n)((e) => e.setTheme),
          n = (0, o.n)((e) => e.clear),
          a = (0, o.n)((e) => e.refreshToken),
          p = (0, d.n)((e) => e.language),
          g = (0, d.n)((e) => e.setLanguage),
          m = (0, h.k)(),
          f = (0, i.useRouter)(),
          x = async () => {
            try {
              a && (await (0, c.nr)('/auth/logout', { method: 'POST', body: { refreshToken: a } }));
            } catch (e) {}
            ((0, u.G1)(), n(), f.replace('/login'));
          };
        return (0, s.jsxs)('div', {
          className: 'mx-auto max-w-lg px-6 py-10',
          children: [
            (0, s.jsxs)(r(), {
              href: '/chats',
              className: 'text-sm text-accent',
              children: ['← ', m('backToChats')],
            }),
            (0, s.jsx)('h1', {
              className: 'mt-4 font-display text-3xl font-semibold text-ink',
              children: m('settings'),
            }),
            (0, s.jsx)('p', {
              className: 'mt-2 text-sm text-ink-muted',
              children: 'Appearance, sessions, and account basics.',
            }),
            (0, s.jsxs)('section', {
              className: 'mt-8 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4',
              children: [
                (0, s.jsx)('h2', {
                  className: 'text-sm font-semibold text-ink',
                  children: m('appearance'),
                }),
                (0, s.jsx)('div', {
                  className: 'flex flex-wrap gap-2',
                  children: ['light', 'dark', 'system'].map((n) =>
                    (0, s.jsx)(
                      'button',
                      {
                        type: 'button',
                        onClick: () => t(n),
                        className: 'rounded-full border px-3 py-1 text-xs capitalize '.concat(
                          e === n
                            ? 'border-accent bg-accent/10 text-ink'
                            : 'border-line text-ink-muted hover:text-ink',
                        ),
                        children: n,
                      },
                      n,
                    ),
                  ),
                }),
              ],
            }),
            (0, s.jsxs)('section', {
              className: 'mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4',
              children: [
                (0, s.jsx)('h2', {
                  className: 'text-sm font-semibold text-ink',
                  children: 'Language',
                }),
                (0, s.jsx)('div', {
                  className: 'flex flex-wrap gap-2',
                  children: ['en', 'ru'].map((e) =>
                    (0, s.jsx)(
                      'button',
                      {
                        type: 'button',
                        onClick: () => g(e),
                        className: 'rounded-full border px-3 py-1 text-xs uppercase '.concat(
                          p === e
                            ? 'border-accent bg-accent/10 text-ink'
                            : 'border-line text-ink-muted hover:text-ink',
                        ),
                        children: e,
                      },
                      e,
                    ),
                  ),
                }),
              ],
            }),
            (0, s.jsxs)('section', {
              className: 'mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4',
              children: [
                (0, s.jsx)('h2', {
                  className: 'text-sm font-semibold text-ink',
                  children: m('sessions'),
                }),
                (0, s.jsx)('p', {
                  className: 'text-xs text-ink-muted',
                  children: 'Review signed-in devices and revoke access.',
                }),
                (0, s.jsx)(r(), {
                  href: '/sessions',
                  className:
                    'inline-flex rounded-xl border border-line px-3 py-2 text-sm text-accent',
                  children: m('openDeviceList'),
                }),
              ],
            }),
            (0, s.jsxs)('section', {
              className: 'mt-4 space-y-3 rounded-2xl border border-line bg-surface-elevated p-4',
              children: [
                (0, s.jsx)('h2', {
                  className: 'text-sm font-semibold text-ink',
                  children: m('account'),
                }),
                (0, s.jsx)(r(), {
                  href: '/profile',
                  className:
                    'inline-flex rounded-xl border border-line px-3 py-2 text-sm text-accent',
                  children: m('myProfile'),
                }),
                (0, s.jsx)('button', {
                  type: 'button',
                  onClick: () => void x(),
                  className: 'rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-500',
                  children: m('signOut'),
                }),
              ],
            }),
          ],
        });
      }
    },
    848: (e, t, n) => {
      'use strict';
      n.d(t, { Zr: () => a });
      let s = (e) => (t) => {
          try {
            let n = e(t);
            if (n instanceof Promise) return n;
            return {
              then: (e) => s(e)(n),
              catch(e) {
                return this;
              },
            };
          } catch (e) {
            return {
              then(e) {
                return this;
              },
              catch: (t) => s(t)(e),
            };
          }
        },
        a = (e, t) => (n, a, r) => {
          let i,
            l = {
              storage: (function (e, t) {
                let n;
                try {
                  n = e();
                } catch (e) {
                  return;
                }
                return {
                  getItem: (e) => {
                    var t;
                    let s = (e) => (null === e ? null : JSON.parse(e, void 0)),
                      a = null != (t = n.getItem(e)) ? t : null;
                    return a instanceof Promise ? a.then(s) : s(a);
                  },
                  setItem: (e, t) => n.setItem(e, JSON.stringify(t, void 0)),
                  removeItem: (e) => n.removeItem(e),
                };
              })(() => window.localStorage),
              partialize: (e) => e,
              version: 0,
              merge: (e, t) => ({ ...t, ...e }),
              ...t,
            },
            o = !1,
            c = 0,
            u = new Set(),
            d = new Set(),
            h = l.storage;
          if (!h)
            return e(
              (...e) => {
                (console.warn(
                  `[zustand persist middleware] Unable to update item '${l.name}', the given storage is currently unavailable.`,
                ),
                  n(...e));
              },
              a,
              r,
            );
          let p = () => {
              let e = l.partialize({ ...a() });
              return h.setItem(l.name, { state: e, version: l.version });
            },
            g = r.setState;
          r.setState = (e, t) => (g(e, t), p());
          let m = e((...e) => (n(...e), p()), a, r);
          r.getInitialState = () => m;
          let f = () => {
            var e, t;
            if (!h) return;
            let r = ++c;
            ((o = !1),
              u.forEach((e) => {
                var t;
                return e(null != (t = a()) ? t : m);
              }));
            let g =
              (null == (t = l.onRehydrateStorage)
                ? void 0
                : t.call(l, null != (e = a()) ? e : m)) || void 0;
            return s(h.getItem.bind(h))(l.name)
              .then((e) => {
                if (e)
                  if ('number' != typeof e.version || e.version === l.version) return [!1, e.state];
                  else {
                    if (l.migrate) {
                      let t = l.migrate(e.state, e.version);
                      return t instanceof Promise ? t.then((e) => [!0, e]) : [!0, t];
                    }
                    console.error(
                      "State loaded from storage couldn't be migrated since no migrate function was provided",
                    );
                  }
                return [!1, void 0];
              })
              .then((e) => {
                var t;
                if (r !== c) return;
                let [s, o] = e;
                if ((n((i = l.merge(o, null != (t = a()) ? t : m)), !0), s)) return p();
              })
              .then(() => {
                r === c &&
                  (null == g || g(a(), void 0), (i = a()), (o = !0), d.forEach((e) => e(i)));
              })
              .catch((e) => {
                r === c && (null == g || g(void 0, e));
              });
          };
          return (
            (r.persist = {
              setOptions: (e) => {
                ((l = { ...l, ...e }), e.storage && (h = e.storage));
              },
              clearStorage: () => {
                null == h || h.removeItem(l.name);
              },
              getOptions: () => l,
              rehydrate: () => f(),
              hasHydrated: () => o,
              onHydrate: (e) => (
                u.add(e),
                () => {
                  u.delete(e);
                }
              ),
              onFinishHydration: (e) => (
                d.add(e),
                () => {
                  d.delete(e);
                }
              ),
            }),
            l.skipHydration || f(),
            i || m
          );
        };
    },
    1192: (e, t, n) => {
      Promise.resolve().then(n.bind(n, 336));
    },
    1620: (e, t, n) => {
      'use strict';
      n.d(t, { v: () => i });
      var s = n(7620);
      let a = (e) => {
          let t,
            n = new Set(),
            s = (e, s) => {
              let a = 'function' == typeof e ? e(t) : e;
              if (!Object.is(a, t)) {
                let e = t;
                ((t = (null != s ? s : 'object' != typeof a || null === a)
                  ? a
                  : Object.assign({}, t, a)),
                  n.forEach((n) => n(t, e)));
              }
            },
            a = () => t,
            r = {
              setState: s,
              getState: a,
              getInitialState: () => i,
              subscribe: (e) => (n.add(e), () => n.delete(e)),
            },
            i = (t = e(s, a, r));
          return r;
        },
        r = (e) => {
          let t = ((e) => (e ? a(e) : a))(e),
            n = (e) =>
              (function (e, t = (e) => e) {
                let n = s.useSyncExternalStore(
                  e.subscribe,
                  s.useCallback(() => t(e.getState()), [e, t]),
                  s.useCallback(() => t(e.getInitialState()), [e, t]),
                );
                return (s.useDebugValue(n), n);
              })(t, e);
          return (Object.assign(n, t), n);
        },
        i = (e) => (e ? r(e) : r);
    },
    2982: (e, t, n) => {
      'use strict';
      n.d(t, { H$: () => a, hD: () => r, nr: () => l });
      var s = n(3719);
      let a = 'http://localhost:4000';
      class r extends Error {
        constructor(e, t, n) {
          (super(t), (this.status = e), (this.body = n));
        }
      }
      async function i() {
        let e = s.n.getState().refreshToken;
        if (!e) return null;
        let t = await fetch(''.concat(a, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!t.ok) return (s.n.getState().clear(), null);
        let n = await t.json();
        return (s.n.getState().setTokens(n), n.accessToken);
      }
      async function l(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: n, ...l } = t,
          o = new Headers(l.headers);
        if (!n) {
          let e = s.n.getState().accessToken;
          e && o.set('Authorization', 'Bearer '.concat(e));
          let t = s.n.getState().sessionId;
          t && o.set('x-session-fingerprint', t);
        }
        let c = l.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          o.has('Content-Type') || o.set('Content-Type', 'application/json'));
        let u = await fetch(''.concat(a).concat(e), { ...l, body: c, headers: o });
        if (401 === u.status && !n) {
          let t = await i();
          t &&
            (o.set('Authorization', 'Bearer '.concat(t)),
            (u = await fetch(''.concat(a).concat(e), { ...l, body: c, headers: o })));
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
    3719: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => r });
      var s = n(1620),
        a = n(848);
      let r = (0, s.v)()(
        (0, a.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: n, refreshToken: s, sessionId: a } = t;
              return e({ accessToken: n, refreshToken: s, sessionId: null != a ? a : null });
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
    4043: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => s });
      let s = (0, n(1620).v)((e) => ({
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
      n.d(t, { G1: () => u, Ol: () => o, cH: () => c });
      var s = n(2838),
        a = n(3719);
      let r = 'http://localhost:4000',
        i = null,
        l = null;
      function o() {
        return i;
      }
      function c() {
        if (null == i ? void 0 : i.connected) return i;
        let e = a.n.getState().accessToken;
        return (
          (i = (0, s.io)(r, {
            transports: ['websocket', 'polling'],
            auth: { token: e },
            autoConnect: !!e,
          })),
          l && (clearInterval(l), (l = null)),
          (l = setInterval(() => {
            try {
              (null == i ? void 0 : i.connected) && i.emit('presence:ping');
            } catch (e) {}
          }, 45e3)),
          i
        );
      }
      function u() {
        (null == i || i.disconnect(), (i = null), l && (clearInterval(l), (l = null)));
      }
    },
    6563: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => r });
      var s = n(1620),
        a = n(848);
      let r = (0, s.v)()(
        (0, a.Zr)((e) => ({ language: 'en', setLanguage: (t) => e({ language: t }) }), {
          name: 'pulse-language',
        }),
      );
    },
    8646: (e, t, n) => {
      'use strict';
      n.d(t, { k: () => i });
      var s = n(7620),
        a = n(6563);
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
        return (0, s.useMemo)(
          () => (t) => {
            var n, s, i;
            return null !=
              (i =
                null !=
                (s = (null != (n = r[null != e ? e : a.n.getState().language]) ? n : r.en)[t])
                  ? s
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
    (e.O(0, [664, 818, 587, 18, 358], () => e((e.s = 1192))), (_N_E = e.O()));
  },
]);
