(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [944],
  {
    661: (e, t, n) => {
      'use strict';
      (n.r(t), n.d(t, { default: () => b }));
      var s = n(4568),
        a = n(7541),
        r = n(7620),
        l = n(2982),
        i = n(3719),
        o = n(4683);
      function c(e) {
        let { children: t } = e,
          n = (0, a.useRouter)(),
          c = (0, a.usePathname)(),
          u = (0, i.n)((e) => e.accessToken),
          d = (0, i.n)((e) => e.hasHydrated),
          h = (0, r.useRef)(!1);
        return (
          (0, r.useEffect)(() => {
            if (d) {
              if (!u && !['/login', '/signup', '/onboarding'].includes(c)) {
                (console.log('[pulse-bootstrap] AuthGate: no token → /login', { pathname: c }),
                  n.replace('/login'));
                return;
              }
              u ? (0, o.cH)() : (0, o.G1)();
            }
          }, [d, u, c, n]),
          (0, r.useEffect)(() => {
            if (!d || !u || h.current) return;
            h.current = !0;
            let e = !1;
            return (
              console.log('[pulse-bootstrap] AuthGate: validating session (/users/me)'),
              (async () => {
                try {
                  (await (0, l.nr)('/users/me'),
                    e || console.log('[pulse-bootstrap] AuthGate: /users/me ok'));
                } catch (t) {
                  if (e) return;
                  (console.warn('[pulse-bootstrap] AuthGate: session invalid → clear + /login'),
                    (0, o.G1)(),
                    i.n.getState().clear(),
                    n.replace('/login'));
                }
              })(),
              () => {
                e = !0;
              }
            );
          }, [d, u, n]),
          (0, s.jsx)(s.Fragment, { children: t })
        );
      }
      var u = n(4869),
        d = n(2995),
        h = n(9100),
        p = n(4595),
        f = n(4043),
        m = n(7444),
        g = n(8646);
      function x() {
        let e = (0, f.n)((e) => e.searchOpen),
          t = (0, f.n)((e) => e.setSearchOpen),
          [n, i] = (0, r.useState)(''),
          o = (0, a.useRouter)(),
          c = (0, u.jE)(),
          x = (0, g.k)(),
          b = (function (e, t) {
            let [n, s] = (0, r.useState)(e);
            return (
              (0, r.useEffect)(() => {
                let t = setTimeout(() => s(e), 220);
                return () => clearTimeout(t);
              }, [e, t]),
              n
            );
          })(n, 220),
          { data: k, isFetching: j } = (0, d.I)({
            queryKey: ['search', b],
            enabled: e && b.length >= 2,
            queryFn: () => (0, l.nr)('/search?q='.concat(encodeURIComponent(b))),
          });
        return (
          (0, r.useEffect)(() => {
            let e = (e) => {
              ('Escape' === e.key && t(!1),
                (e.metaKey || e.ctrlKey) && 'k' === e.key && (e.preventDefault(), t(!0)));
            };
            return (
              window.addEventListener('keydown', e),
              () => window.removeEventListener('keydown', e)
            );
          }, [t]),
          (0, s.jsx)(h.N, {
            children:
              e &&
              (0, s.jsx)(p.P.div, {
                className:
                  'fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm',
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                onClick: () => t(!1),
                children: (0, s.jsxs)(p.P.div, {
                  initial: { opacity: 0, y: 8, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: 8, scale: 0.98 },
                  className:
                    'w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-lift dark:bg-surface-elevated/95',
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    (0, s.jsxs)('div', {
                      className: 'border-b border-line px-4 py-3',
                      children: [
                        (0, s.jsx)('input', {
                          autoFocus: !0,
                          value: n,
                          onChange: (e) => i(e.target.value),
                          placeholder: x('searchPlaceholder'),
                          className:
                            'w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted',
                          'aria-label': x('search'),
                        }),
                        (0, s.jsx)('p', {
                          className: 'mt-1 text-[10px] text-ink-muted',
                          children: '⌘K \xb7 min 2 characters \xb7 results grouped',
                        }),
                      ],
                    }),
                    (0, s.jsxs)('div', {
                      className: 'max-h-[50vh] overflow-y-auto p-3 text-sm',
                      children: [
                        j &&
                          (0, s.jsx)('p', {
                            className: 'text-ink-muted',
                            children: x('searching'),
                          }),
                        !j &&
                          k &&
                          (0, s.jsxs)('div', {
                            className: 'space-y-4',
                            children: [
                              (0, s.jsx)(y, {
                                title: x('people'),
                                children: k.users.map((e) => {
                                  var n, a;
                                  return (0, s.jsxs)(
                                    'button',
                                    {
                                      type: 'button',
                                      className:
                                        'flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                      onClick: async () => {
                                        try {
                                          let n = await (0, m.X)(e.id);
                                          (t(!1),
                                            c.invalidateQueries({ queryKey: ['chats'] }),
                                            o.push('/chats/'.concat(n.id)));
                                        } catch (e) {
                                          (t(!1), o.push('/chats'));
                                        }
                                      },
                                      children: [
                                        (0, s.jsx)('span', {
                                          className:
                                            'flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-xs font-semibold text-accent',
                                          children: (null != (n = e.displayName) ? n : e.username)
                                            .slice(0, 1)
                                            .toUpperCase(),
                                        }),
                                        (0, s.jsxs)('span', {
                                          children: [
                                            (0, s.jsx)('span', {
                                              className: 'font-medium text-ink',
                                              children:
                                                null != (a = e.displayName) ? a : e.username,
                                            }),
                                            (0, s.jsxs)('span', {
                                              className: 'ml-2 text-xs text-ink-muted',
                                              children: ['@', e.username],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    e.id,
                                  );
                                }),
                              }),
                              (0, s.jsx)(y, {
                                title: x('chats'),
                                children: k.chats.map((e) => {
                                  var n;
                                  return (0, s.jsxs)(
                                    'button',
                                    {
                                      type: 'button',
                                      className:
                                        'block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                      onClick: () => {
                                        (t(!1), o.push('/chats/'.concat(e.id)));
                                      },
                                      children: [
                                        (0, s.jsx)('span', {
                                          className: 'font-medium text-ink',
                                          children: null != (n = e.title) ? n : 'Untitled',
                                        }),
                                        (0, s.jsx)('span', {
                                          className: 'ml-2 text-xs uppercase text-ink-muted',
                                          children: e.type,
                                        }),
                                      ],
                                    },
                                    e.id,
                                  );
                                }),
                              }),
                              (0, s.jsx)(y, {
                                title: x('messages'),
                                children: k.messages.map((e) => {
                                  var n, a;
                                  return (0, s.jsxs)(
                                    'button',
                                    {
                                      type: 'button',
                                      className:
                                        'block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                      onClick: () => {
                                        (t(!1),
                                          o.push(
                                            '/chats/'.concat(e.chatId, '?highlight=').concat(e.id),
                                          ));
                                      },
                                      children: [
                                        (0, s.jsx)(v, {
                                          text: (null != (a = null != (n = e.snippet) ? n : e.text)
                                            ? a
                                            : ''
                                          ).trim(),
                                          needle: b,
                                        }),
                                        (0, s.jsx)('div', {
                                          className: 'text-[10px] text-ink-muted',
                                          children: new Date(e.createdAt).toLocaleString(),
                                        }),
                                      ],
                                    },
                                    e.id,
                                  );
                                }),
                              }),
                              0 === k.users.length &&
                                0 === k.chats.length &&
                                0 === k.messages.length &&
                                b.length >= 2 &&
                                (0, s.jsx)('p', {
                                  className: 'text-ink-muted',
                                  children: x('noMatches'),
                                }),
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              }),
          })
        );
      }
      function y(e) {
        let { title: t, children: n } = e;
        return (0, s.jsxs)('div', {
          children: [
            (0, s.jsx)('p', {
              className: 'mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted',
              children: t,
            }),
            (0, s.jsx)('div', { className: 'space-y-1', children: n }),
          ],
        });
      }
      function v(e) {
        let { text: t, needle: n } = e,
          a = t.toLowerCase().indexOf(n.toLowerCase());
        if (a < 0) return (0, s.jsx)('span', { className: 'text-ink', children: t });
        let r = t.slice(0, a),
          l = t.slice(a, a + n.length),
          i = t.slice(a + n.length);
        return (0, s.jsxs)('span', {
          className: 'text-ink',
          children: [
            r,
            (0, s.jsx)('mark', { className: 'rounded bg-accent/25 px-0.5 text-ink', children: l }),
            i,
          ],
        });
      }
      function b(e) {
        let { children: t } = e;
        return (0, s.jsxs)(c, { children: [t, (0, s.jsx)(x, {})] });
      }
    },
    2034: (e, t, n) => {
      Promise.resolve().then(n.bind(n, 661));
    },
    2982: (e, t, n) => {
      'use strict';
      n.d(t, { H$: () => a, hD: () => r, nr: () => i });
      var s = n(3719);
      let a = 'http://localhost:4000';
      class r extends Error {
        constructor(e, t, n) {
          (super(t), (this.status = e), (this.body = n));
        }
      }
      async function l() {
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
      async function i(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: n, ...i } = t,
          o = new Headers(i.headers);
        if (!n) {
          let e = s.n.getState().accessToken;
          e && o.set('Authorization', 'Bearer '.concat(e));
          let t = s.n.getState().sessionId;
          t && o.set('x-session-fingerprint', t);
        }
        let c = i.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          o.has('Content-Type') || o.set('Content-Type', 'application/json'));
        let u = await fetch(''.concat(a).concat(e), { ...i, body: c, headers: o });
        if (401 === u.status && !n) {
          let t = await l();
          t &&
            (o.set('Authorization', 'Bearer '.concat(t)),
            (u = await fetch(''.concat(a).concat(e), { ...i, body: c, headers: o })));
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
        l = null,
        i = null;
      function o() {
        return l;
      }
      function c() {
        if (null == l ? void 0 : l.connected) return l;
        let e = a.n.getState().accessToken;
        return (
          (l = (0, s.io)(r, {
            transports: ['websocket', 'polling'],
            auth: { token: e },
            autoConnect: !!e,
          })),
          i && (clearInterval(i), (i = null)),
          (i = setInterval(() => {
            try {
              (null == l ? void 0 : l.connected) && l.emit('presence:ping');
            } catch (e) {}
          }, 45e3)),
          l
        );
      }
      function u() {
        (null == l || l.disconnect(), (l = null), i && (clearInterval(i), (i = null)));
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
    7444: (e, t, n) => {
      'use strict';
      n.d(t, { X: () => r });
      var s = n(2982);
      let a = new Map();
      function r(e) {
        let t = a.get(e);
        return (
          t ||
            ((t = (0, s.nr)('/chats/direct', { method: 'POST', body: { peerUserId: e } }).finally(
              () => {
                a.delete(e);
              },
            )),
            a.set(e, t)),
          t
        );
      }
    },
    8646: (e, t, n) => {
      'use strict';
      n.d(t, { k: () => l });
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
      function l() {
        let e = (0, a.n)((e) => e.language);
        return (0, s.useMemo)(
          () => (t) => {
            var n, s, l;
            return null !=
              (l =
                null !=
                (s = (null != (n = r[null != e ? e : a.n.getState().language]) ? n : r.en)[t])
                  ? s
                  : r.en[t])
              ? l
              : t;
          },
          [e],
        );
      }
    },
    9100: (e, t, n) => {
      'use strict';
      n.d(t, { N: () => v });
      var s = n(4568),
        a = n(7620),
        r = n(5971),
        l = n(3847),
        i = n(8683),
        o = n(2015),
        c = n(3449),
        u = n(9070);
      function d(e, t) {
        if ('function' == typeof e) return e(t);
        null != e && (e.current = t);
      }
      class h extends a.Component {
        getSnapshotBeforeUpdate(e) {
          let t = this.props.childRef.current;
          if ((0, c.s)(t) && e.isPresent && !this.props.isPresent && !1 !== this.props.pop) {
            let e = t.offsetParent,
              n = ((0, c.s)(e) && e.offsetWidth) || 0,
              s = ((0, c.s)(e) && e.offsetHeight) || 0,
              a = getComputedStyle(t),
              r = this.props.sizeRef.current;
            ((r.height = parseFloat(a.height)),
              (r.width = parseFloat(a.width)),
              (r.top = t.offsetTop),
              (r.left = t.offsetLeft),
              (r.right = n - r.width - r.left),
              (r.bottom = s - r.height - r.top));
          }
          return null;
        }
        componentDidUpdate() {}
        render() {
          return this.props.children;
        }
      }
      function p(e) {
        var t, n;
        let { children: r, isPresent: l, anchorX: i, anchorY: o, root: c, pop: p } = e,
          f = (0, a.useId)(),
          m = (0, a.useRef)(null),
          g = (0, a.useRef)({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
          { nonce: x } = (0, a.useContext)(u.Q),
          y = (function (...e) {
            return a.useCallback(
              (function (...e) {
                return (t) => {
                  let n = !1,
                    s = e.map((e) => {
                      let s = d(e, t);
                      return (n || 'function' != typeof s || (n = !0), s);
                    });
                  if (n)
                    return () => {
                      for (let t = 0; t < s.length; t++) {
                        let n = s[t];
                        'function' == typeof n ? n() : d(e[t], null);
                      }
                    };
                };
              })(...e),
              e,
            );
          })(
            m,
            null != (n = null == (t = r.props) ? void 0 : t.ref) ? n : null == r ? void 0 : r.ref,
          );
        return (
          (0, a.useInsertionEffect)(() => {
            let { width: e, height: t, top: n, left: s, right: a, bottom: r } = g.current;
            if (l || !1 === p || !m.current || !e || !t) return;
            m.current.dataset.motionPopId = f;
            let u = document.createElement('style');
            x && (u.nonce = x);
            let d = null != c ? c : document.head;
            return (
              d.appendChild(u),
              u.sheet &&
                u.sheet.insertRule(
                  '\n          [data-motion-pop-id="'
                    .concat(
                      f,
                      '"] {\n            position: absolute !important;\n            width: ',
                    )
                    .concat(e, 'px !important;\n            height: ')
                    .concat(t, 'px !important;\n            ')
                    .concat(
                      'left' === i ? 'left: '.concat(s) : 'right: '.concat(a),
                      'px !important;\n            ',
                    )
                    .concat(
                      'bottom' === o ? 'bottom: '.concat(r) : 'top: '.concat(n),
                      'px !important;\n          }\n        ',
                    ),
                ),
              () => {
                var e;
                (null == (e = m.current) || e.removeAttribute('data-motion-pop-id'),
                  d.contains(u) && d.removeChild(u));
              }
            );
          }, [l]),
          (0, s.jsx)(h, {
            isPresent: l,
            childRef: m,
            sizeRef: g,
            pop: p,
            children: !1 === p ? r : a.cloneElement(r, { ref: y }),
          })
        );
      }
      let f = (e) => {
        let {
            children: t,
            initial: n,
            isPresent: r,
            onExitComplete: i,
            custom: c,
            presenceAffectsLayout: u,
            mode: d,
            anchorX: h,
            anchorY: f,
            root: g,
          } = e,
          x = (0, l.M)(m),
          y = (0, a.useId)(),
          v = !0,
          b = (0, a.useMemo)(
            () => (
              (v = !1),
              {
                id: y,
                initial: n,
                isPresent: r,
                custom: c,
                onExitComplete: (e) => {
                  for (let t of (x.set(e, !0), x.values())) if (!t) return;
                  i && i();
                },
                register: (e) => (x.set(e, !1), () => x.delete(e)),
              }
            ),
            [r, x, i],
          );
        return (
          u && v && (b = { ...b }),
          (0, a.useMemo)(() => {
            x.forEach((e, t) => x.set(t, !1));
          }, [r]),
          a.useEffect(() => {
            r || x.size || !i || i();
          }, [r]),
          (t = (0, s.jsx)(p, {
            pop: 'popLayout' === d,
            isPresent: r,
            anchorX: h,
            anchorY: f,
            root: g,
            children: t,
          })),
          (0, s.jsx)(o.t.Provider, { value: b, children: t })
        );
      };
      function m() {
        return new Map();
      }
      var g = n(6472);
      let x = (e) => e.key || '';
      function y(e) {
        let t = [];
        return (
          a.Children.forEach(e, (e) => {
            (0, a.isValidElement)(e) && t.push(e);
          }),
          t
        );
      }
      let v = (e) => {
        let {
            children: t,
            custom: n,
            initial: o = !0,
            onExitComplete: c,
            presenceAffectsLayout: u = !0,
            mode: d = 'sync',
            propagate: h = !1,
            anchorX: p = 'left',
            anchorY: m = 'top',
            root: v,
          } = e,
          [b, k] = (0, g.xQ)(h),
          j = (0, a.useMemo)(() => y(t), [t]),
          w = h && !b ? [] : j.map(x),
          C = (0, a.useRef)(!0),
          S = (0, a.useRef)(j),
          N = (0, l.M)(() => new Map()),
          T = (0, a.useRef)(new Set()),
          [O, E] = (0, a.useState)(j),
          [P, M] = (0, a.useState)(j);
        (0, i.E)(() => {
          ((C.current = !1), (S.current = j));
          for (let e = 0; e < P.length; e++) {
            let t = x(P[e]);
            w.includes(t) ? (N.delete(t), T.current.delete(t)) : !0 !== N.get(t) && N.set(t, !1);
          }
        }, [P, w.length, w.join('-')]);
        let I = [];
        if (j !== O) {
          let e = [...j];
          for (let t = 0; t < P.length; t++) {
            let n = P[t],
              s = x(n);
            w.includes(s) || (e.splice(t, 0, n), I.push(n));
          }
          return ('wait' === d && I.length && (e = I), M(y(e)), E(j), null);
        }
        let { forceRender: R } = (0, a.useContext)(r.L);
        return (0, s.jsx)(s.Fragment, {
          children: P.map((e) => {
            let t = x(e),
              a = (!h || !!b) && (j === P || w.includes(t));
            return (0, s.jsx)(
              f,
              {
                isPresent: a,
                initial: (!C.current || !!o) && void 0,
                custom: n,
                presenceAffectsLayout: u,
                mode: d,
                root: v,
                onExitComplete: a
                  ? void 0
                  : () => {
                      if (T.current.has(t) || !N.has(t)) return;
                      (T.current.add(t), N.set(t, !0));
                      let e = !0;
                      (N.forEach((t) => {
                        t || (e = !1);
                      }),
                        e && (null == R || R(), M(S.current), h && (null == k || k()), c && c()));
                    },
                anchorX: p,
                anchorY: m,
                children: e,
              },
              t,
            );
          }),
        });
      };
    },
  },
  (e) => {
    (e.O(0, [887, 595, 995, 818, 587, 18, 358], () => e((e.s = 2034))), (_N_E = e.O()));
  },
]);
