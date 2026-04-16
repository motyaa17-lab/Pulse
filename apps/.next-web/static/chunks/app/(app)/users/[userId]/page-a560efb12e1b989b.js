(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [267],
  {
    103: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 2398));
    },
    2398: (e, t, s) => {
      'use strict';
      (s.r(t), s.d(t, { default: () => u }));
      var n = s(4568),
        a = s(9664),
        r = s.n(a),
        l = s(7541),
        o = s(2995),
        i = s(2982),
        c = s(5095);
      function u() {
        var e, t, s, a;
        let u = (0, l.useParams)().userId,
          { data: d, isLoading: h } = (0, o.I)({
            queryKey: ['user', u],
            queryFn: () => (0, i.nr)('/users/'.concat(u)),
          }),
          m =
            null !=
            (s =
              null != (t = null == d ? void 0 : d.displayName)
                ? t
                : null == d
                  ? void 0
                  : d.username)
              ? s
              : h
                ? 'Loading…'
                : 'User',
          f = m.slice(0, 1).toUpperCase() || '?';
        return (0, n.jsxs)('div', {
          className: 'mx-auto max-w-lg px-6 py-10',
          children: [
            (0, n.jsx)(r(), {
              href: '/chats',
              className: 'text-sm text-accent',
              children: '← Back to chats',
            }),
            (0, n.jsxs)('section', {
              className: 'mt-6 rounded-2xl border border-line bg-surface-elevated p-5',
              children: [
                (0, n.jsxs)('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    (0, n.jsx)('div', {
                      className: 'relative h-14 w-14 shrink-0',
                      children: (null == d ? void 0 : d.avatarUrl)
                        ? (0, n.jsx)('img', {
                            src: d.avatarUrl,
                            alt: '',
                            className: 'h-14 w-14 rounded-full object-cover ring-1 ring-line/45',
                          })
                        : (0, n.jsx)('div', {
                            className: (0, c.cn)(
                              'flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ring-1 ring-line/40',
                              'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                            ),
                            children: f,
                          }),
                    }),
                    (0, n.jsxs)('div', {
                      className: 'min-w-0 flex-1',
                      children: [
                        (0, n.jsx)('h1', {
                          className: 'truncate font-display text-2xl font-semibold text-ink',
                          children: m,
                        }),
                        (0, n.jsxs)('p', {
                          className: 'mt-0.5 truncate text-sm text-ink-muted',
                          children: ['@', null != (a = null == d ? void 0 : d.username) ? a : '—'],
                        }),
                        (0, n.jsx)('p', {
                          className:
                            'mt-2 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25',
                          children: d
                            ? d.isOnline
                              ? 'Online'
                              : d.lastSeenAt
                                ? 'Last seen recently'
                                : 'Offline'
                            : '',
                        }),
                      ],
                    }),
                  ],
                }),
                (0, n.jsxs)('div', {
                  className: 'mt-5',
                  children: [
                    (0, n.jsx)('p', {
                      className: 'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                      children: 'About',
                    }),
                    (0, n.jsx)('p', {
                      className: 'mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink',
                      children: (null == d || null == (e = d.bio) ? void 0 : e.trim())
                        ? d.bio
                        : (0, n.jsx)('span', {
                            className: 'text-ink-muted',
                            children: 'No bio yet.',
                          }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
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
      async function l() {
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
          i = new Headers(o.headers);
        if (!s) {
          let e = n.n.getState().accessToken;
          e && i.set('Authorization', 'Bearer '.concat(e));
          let t = n.n.getState().sessionId;
          t && i.set('x-session-fingerprint', t);
        }
        let c = o.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          i.has('Content-Type') || i.set('Content-Type', 'application/json'));
        let u = await fetch(''.concat(a).concat(e), { ...o, body: c, headers: i });
        if (401 === u.status && !s) {
          let t = await l();
          t &&
            (i.set('Authorization', 'Bearer '.concat(t)),
            (u = await fetch(''.concat(a).concat(e), { ...o, body: c, headers: i })));
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
    5095: (e, t, s) => {
      'use strict';
      s.d(t, { cn: () => r });
      var n = s(2902),
        a = s(5643);
      function r() {
        for (var e = arguments.length, t = Array(e), s = 0; s < e; s++) t[s] = arguments[s];
        return (0, a.QP)((0, n.$)(t));
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
  },
  (e) => {
    (e.O(0, [887, 664, 995, 836, 587, 18, 358], () => e((e.s = 103))), (_N_E = e.O()));
  },
]);
