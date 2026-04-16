(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [72],
  {
    533: (e, t, s) => {
      'use strict';
      (s.r(t), s.d(t, { default: () => f }));
      var a = s(4568),
        n = s(9664),
        r = s.n(n),
        o = s(7541),
        l = s(7620),
        i = s(3631),
        c = s(3916),
        d = s(2935),
        u = s(2982),
        m = s(3719),
        h = s(4595);
      let p = c.Ik({ email: c.Yj().email(), password: c.Yj().min(8) });
      function f() {
        let e = (0, o.useRouter)(),
          t = (0, m.n)((e) => e.setTokens),
          s = (0, m.n)((e) => e.accessToken),
          n = (0, m.n)((e) => e.hasHydrated);
        (0, l.useEffect)(() => {
          n && s && e.replace('/chats');
        }, [n, s, e]);
        let {
            register: c,
            handleSubmit: f,
            formState: { errors: x, isSubmitting: b },
            setError: k,
          } = (0, i.mN)({ resolver: (0, d.u)(p) }),
          y = async (s) => {
            try {
              let a = await (0, u.nr)('/auth/login', { method: 'POST', body: s, skipAuth: !0 });
              (t(a), e.replace('/onboarding'));
            } catch (e) {
              k('root', { message: 'Could not sign in. Check your credentials.' });
            }
          };
        return (0, a.jsxs)(h.P.div, {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          className:
            'rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70',
          children: [
            (0, a.jsxs)('div', {
              className: 'mb-8 space-y-2',
              children: [
                (0, a.jsx)('p', {
                  className: 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted',
                  children: 'Pulse',
                }),
                (0, a.jsx)('h1', {
                  className: 'font-display text-3xl font-semibold text-ink',
                  children: 'Welcome back',
                }),
                (0, a.jsx)('p', {
                  className: 'text-sm text-ink-muted',
                  children: 'Sign in to continue your conversations.',
                }),
              ],
            }),
            (0, a.jsxs)('form', {
              className: 'space-y-4',
              onSubmit: f(y),
              noValidate: !0,
              children: [
                (0, a.jsxs)('div', {
                  children: [
                    (0, a.jsx)('label', {
                      className: 'mb-1 block text-xs font-medium text-ink-muted',
                      htmlFor: 'email',
                      children: 'Email',
                    }),
                    (0, a.jsx)('input', {
                      id: 'email',
                      type: 'email',
                      autoComplete: 'email',
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30',
                      ...c('email'),
                    }),
                    x.email &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        role: 'alert',
                        children: x.email.message,
                      }),
                  ],
                }),
                (0, a.jsxs)('div', {
                  children: [
                    (0, a.jsx)('label', {
                      className: 'mb-1 block text-xs font-medium text-ink-muted',
                      htmlFor: 'password',
                      children: 'Password',
                    }),
                    (0, a.jsx)('input', {
                      id: 'password',
                      type: 'password',
                      autoComplete: 'current-password',
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30',
                      ...c('password'),
                    }),
                    x.password &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        role: 'alert',
                        children: x.password.message,
                      }),
                  ],
                }),
                x.root &&
                  (0, a.jsx)('p', {
                    className: 'text-sm text-red-500',
                    role: 'alert',
                    children: x.root.message,
                  }),
                (0, a.jsx)('button', {
                  type: 'submit',
                  disabled: b,
                  className:
                    'flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60',
                  children: b ? 'Signing in…' : 'Sign in',
                }),
              ],
            }),
            (0, a.jsxs)('p', {
              className: 'mt-6 text-center text-sm text-ink-muted',
              children: [
                'New to Pulse?',
                ' ',
                (0, a.jsx)(r(), {
                  className: 'font-medium text-accent underline-offset-4 hover:underline',
                  href: '/signup',
                  children: 'Create an account',
                }),
              ],
            }),
          ],
        });
      }
    },
    2982: (e, t, s) => {
      'use strict';
      s.d(t, { H$: () => n, hD: () => r, nr: () => l });
      var a = s(3719);
      let n = 'http://localhost:4000';
      class r extends Error {
        constructor(e, t, s) {
          (super(t), (this.status = e), (this.body = s));
        }
      }
      async function o() {
        let e = a.n.getState().refreshToken;
        if (!e) return null;
        let t = await fetch(''.concat(n, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!t.ok) return (a.n.getState().clear(), null);
        let s = await t.json();
        return (a.n.getState().setTokens(s), s.accessToken);
      }
      async function l(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: s, ...l } = t,
          i = new Headers(l.headers);
        if (!s) {
          let e = a.n.getState().accessToken;
          e && i.set('Authorization', 'Bearer '.concat(e));
          let t = a.n.getState().sessionId;
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
        let d = await fetch(''.concat(n).concat(e), { ...l, body: c, headers: i });
        if (401 === d.status && !s) {
          let t = await o();
          t &&
            (i.set('Authorization', 'Bearer '.concat(t)),
            (d = await fetch(''.concat(n).concat(e), { ...l, body: c, headers: i })));
        }
        let u = await d.text(),
          m = null;
        if (u)
          try {
            m = JSON.parse(u);
          } catch (e) {
            m = { raw: u };
          }
        if (!d.ok) {
          let e =
            'object' == typeof m && null !== m && 'message' in m ? String(m.message) : d.statusText;
          throw new r(d.status, e, m);
        }
        return m;
      }
    },
    3719: (e, t, s) => {
      'use strict';
      s.d(t, { n: () => r });
      var a = s(1620),
        n = s(848);
      let r = (0, a.v)()(
        (0, n.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: s, refreshToken: a, sessionId: n } = t;
              return e({ accessToken: s, refreshToken: a, sessionId: null != n ? n : null });
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
    5421: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 533));
    },
  },
  (e) => {
    (e.O(0, [664, 595, 402, 587, 18, 358], () => e((e.s = 5421))), (_N_E = e.O()));
  },
]);
