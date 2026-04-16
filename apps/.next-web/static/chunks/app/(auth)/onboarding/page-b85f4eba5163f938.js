(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [134],
  {
    447: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 5129));
    },
    848: (e, t, s) => {
      'use strict';
      s.d(t, { Zr: () => a });
      let n = (e) => (t) => {
          try {
            let s = e(t);
            if (s instanceof Promise) return s;
            return {
              then: (e) => n(e)(s),
              catch(e) {
                return this;
              },
            };
          } catch (e) {
            return {
              then(e) {
                return this;
              },
              catch: (t) => n(t)(e),
            };
          }
        },
        a = (e, t) => (s, a, r) => {
          let o,
            l = {
              storage: (function (e, t) {
                let s;
                try {
                  s = e();
                } catch (e) {
                  return;
                }
                return {
                  getItem: (e) => {
                    var t;
                    let n = (e) => (null === e ? null : JSON.parse(e, void 0)),
                      a = null != (t = s.getItem(e)) ? t : null;
                    return a instanceof Promise ? a.then(n) : n(a);
                  },
                  setItem: (e, t) => s.setItem(e, JSON.stringify(t, void 0)),
                  removeItem: (e) => s.removeItem(e),
                };
              })(() => window.localStorage),
              partialize: (e) => e,
              version: 0,
              merge: (e, t) => ({ ...t, ...e }),
              ...t,
            },
            i = !1,
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
                  s(...e));
              },
              a,
              r,
            );
          let f = () => {
              let e = l.partialize({ ...a() });
              return h.setItem(l.name, { state: e, version: l.version });
            },
            m = r.setState;
          r.setState = (e, t) => (m(e, t), f());
          let p = e((...e) => (s(...e), f()), a, r);
          r.getInitialState = () => p;
          let g = () => {
            var e, t;
            if (!h) return;
            let r = ++c;
            ((i = !1),
              u.forEach((e) => {
                var t;
                return e(null != (t = a()) ? t : p);
              }));
            let m =
              (null == (t = l.onRehydrateStorage)
                ? void 0
                : t.call(l, null != (e = a()) ? e : p)) || void 0;
            return n(h.getItem.bind(h))(l.name)
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
                let [n, i] = e;
                if ((s((o = l.merge(i, null != (t = a()) ? t : p)), !0), n)) return f();
              })
              .then(() => {
                r === c &&
                  (null == m || m(a(), void 0), (o = a()), (i = !0), d.forEach((e) => e(o)));
              })
              .catch((e) => {
                r === c && (null == m || m(void 0, e));
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
              rehydrate: () => g(),
              hasHydrated: () => i,
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
            l.skipHydration || g(),
            o || p
          );
        };
    },
    1620: (e, t, s) => {
      'use strict';
      s.d(t, { v: () => o });
      var n = s(7620);
      let a = (e) => {
          let t,
            s = new Set(),
            n = (e, n) => {
              let a = 'function' == typeof e ? e(t) : e;
              if (!Object.is(a, t)) {
                let e = t;
                ((t = (null != n ? n : 'object' != typeof a || null === a)
                  ? a
                  : Object.assign({}, t, a)),
                  s.forEach((s) => s(t, e)));
              }
            },
            a = () => t,
            r = {
              setState: n,
              getState: a,
              getInitialState: () => o,
              subscribe: (e) => (s.add(e), () => s.delete(e)),
            },
            o = (t = e(n, a, r));
          return r;
        },
        r = (e) => {
          let t = ((e) => (e ? a(e) : a))(e),
            s = (e) =>
              (function (e, t = (e) => e) {
                let s = n.useSyncExternalStore(
                  e.subscribe,
                  n.useCallback(() => t(e.getState()), [e, t]),
                  n.useCallback(() => t(e.getInitialState()), [e, t]),
                );
                return (n.useDebugValue(s), s);
              })(t, e);
          return (Object.assign(s, t), s);
        },
        o = (e) => (e ? r(e) : r);
    },
    2982: (e, t, s) => {
      'use strict';
      s.d(t, { H$: () => a, hD: () => r, nr: () => l });
      var n = s(3719);
      let a = 'http://localhost:4000';
      class r extends Error {
        constructor(e, t, s) {
          (super(t), (this.status = e), (this.body = s));
        }
      }
      async function o() {
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
      async function l(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: s, ...l } = t,
          i = new Headers(l.headers);
        if (!s) {
          let e = n.n.getState().accessToken;
          e && i.set('Authorization', 'Bearer '.concat(e));
          let t = n.n.getState().sessionId;
          t && i.set('x-session-fingerprint', t);
        }
        let c = l.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          i.has('Content-Type') || i.set('Content-Type', 'application/json'));
        let u = await fetch(''.concat(a).concat(e), { ...l, body: c, headers: i });
        if (401 === u.status && !s) {
          let t = await o();
          t &&
            (i.set('Authorization', 'Bearer '.concat(t)),
            (u = await fetch(''.concat(a).concat(e), { ...l, body: c, headers: i })));
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
    5129: (e, t, s) => {
      'use strict';
      (s.r(t), s.d(t, { default: () => c }));
      var n = s(4568),
        a = s(7541),
        r = s(7620),
        o = s(4595),
        l = s(3719),
        i = s(2982);
      function c() {
        let e = (0, a.useRouter)(),
          t = (0, l.n)((e) => e.accessToken),
          s = (0, l.n)((e) => e.hasHydrated);
        return (
          (0, r.useEffect)(() => {
            s && (t || e.replace('/login'));
          }, [s, t, e]),
          (0, n.jsxs)(o.P.div, {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            className:
              'rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70',
            children: [
              (0, n.jsx)('p', {
                className: 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted',
                children: 'Pulse',
              }),
              (0, n.jsx)('h1', {
                className: 'mt-2 font-display text-3xl font-semibold text-ink',
                children: 'You are in',
              }),
              (0, n.jsx)('p', {
                className: 'mt-2 text-sm text-ink-muted',
                children:
                  'Pulse keeps threads readable, reactions light, and motion subtle. Explore the demo inbox — it is pre-filled with realistic conversations.',
              }),
              (0, n.jsxs)('ul', {
                className: 'mt-6 space-y-3 text-sm text-ink',
                children: [
                  (0, n.jsxs)('li', {
                    className: 'flex gap-2',
                    children: [
                      (0, n.jsx)('span', {
                        className: 'mt-0.5 h-1.5 w-1.5 rounded-full bg-accent',
                      }),
                      'Direct chats collapse noise; channels stay broadcast-clean.',
                    ],
                  }),
                  (0, n.jsxs)('li', {
                    className: 'flex gap-2',
                    children: [
                      (0, n.jsx)('span', {
                        className: 'mt-0.5 h-1.5 w-1.5 rounded-full bg-accent',
                      }),
                      'Dark mode is tuned for late-night focus sessions.',
                    ],
                  }),
                  (0, n.jsxs)('li', {
                    className: 'flex gap-2',
                    children: [
                      (0, n.jsx)('span', {
                        className: 'mt-0.5 h-1.5 w-1.5 rounded-full bg-accent',
                      }),
                      'Sessions can be reviewed anytime from settings.',
                    ],
                  }),
                ],
              }),
              (0, n.jsx)('button', {
                type: 'button',
                onClick: async () => {
                  try {
                    await (0, i.nr)('/users/me');
                  } catch (e) {}
                  e.replace('/chats');
                },
                className:
                  'mt-8 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm',
                children: 'Open Pulse',
              }),
            ],
          })
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
  },
  (e) => {
    (e.O(0, [595, 587, 18, 358], () => e((e.s = 447))), (_N_E = e.O()));
  },
]);
