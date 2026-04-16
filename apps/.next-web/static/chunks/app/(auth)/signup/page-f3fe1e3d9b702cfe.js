(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [271],
  {
    2982: (e, s, t) => {
      'use strict';
      t.d(s, { H$: () => n, hD: () => r, nr: () => l });
      var a = t(3719);
      let n = 'http://localhost:4000';
      class r extends Error {
        constructor(e, s, t) {
          (super(s), (this.status = e), (this.body = t));
        }
      }
      async function o() {
        let e = a.n.getState().refreshToken;
        if (!e) return null;
        let s = await fetch(''.concat(n, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!s.ok) return (a.n.getState().clear(), null);
        let t = await s.json();
        return (a.n.getState().setTokens(t), t.accessToken);
      }
      async function l(e) {
        let s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: t, ...l } = s,
          i = new Headers(l.headers);
        if (!t) {
          let e = a.n.getState().accessToken;
          e && i.set('Authorization', 'Bearer '.concat(e));
          let s = a.n.getState().sessionId;
          s && i.set('x-session-fingerprint', s);
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
        if (401 === d.status && !t) {
          let s = await o();
          s &&
            (i.set('Authorization', 'Bearer '.concat(s)),
            (d = await fetch(''.concat(n).concat(e), { ...l, body: c, headers: i })));
        }
        let m = await d.text(),
          u = null;
        if (m)
          try {
            u = JSON.parse(m);
          } catch (e) {
            u = { raw: m };
          }
        if (!d.ok) {
          let e =
            'object' == typeof u && null !== u && 'message' in u ? String(u.message) : d.statusText;
          throw new r(d.status, e, u);
        }
        return u;
      }
    },
    3208: (e, s, t) => {
      'use strict';
      (t.r(s), t.d(s, { default: () => p }));
      var a = t(4568),
        n = t(9664),
        r = t.n(n),
        o = t(7541),
        l = t(3631),
        i = t(3916),
        c = t(2935),
        d = t(2982),
        m = t(3719),
        u = t(4595);
      let x = i
        .Ik({
          email: i.Yj().email(),
          username: i
            .Yj()
            .min(3)
            .regex(/^[a-z0-9_]+$/i, 'Letters, numbers, underscore'),
          displayName: i.Yj().min(1).max(80).optional(),
          password: i.Yj().min(8),
          confirm: i.Yj().min(8),
        })
        .refine((e) => e.password === e.confirm, {
          path: ['confirm'],
          message: 'Passwords must match',
        });
      function p() {
        let e = (0, o.useRouter)(),
          s = (0, m.n)((e) => e.setTokens),
          {
            register: t,
            handleSubmit: n,
            formState: { errors: i, isSubmitting: p },
            setError: f,
          } = (0, l.mN)({ resolver: (0, c.u)(x) }),
          h = async (t) => {
            try {
              let a = await (0, d.nr)('/auth/register', {
                method: 'POST',
                body: {
                  email: t.email,
                  username: t.username,
                  password: t.password,
                  displayName: t.displayName,
                },
                skipAuth: !0,
              });
              (s(a), e.replace('/onboarding'));
            } catch (e) {
              (console.error('Signup failed', e),
                f('root', {
                  message:
                    e instanceof d.hD
                      ? ''.concat(e.message, ' (HTTP ').concat(e.status, ')')
                      : 'Could not reach API server at '.concat(d.H$),
                }));
            }
          };
        return (0, a.jsxs)(u.P.div, {
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
                  children: 'Create your space',
                }),
                (0, a.jsx)('p', {
                  className: 'text-sm text-ink-muted',
                  children: 'Original identity, familiar rhythm.',
                }),
              ],
            }),
            (0, a.jsxs)('form', {
              className: 'space-y-4',
              onSubmit: n(h),
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
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2',
                      ...t('email'),
                    }),
                    i.email &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        children: i.email.message,
                      }),
                  ],
                }),
                (0, a.jsxs)('div', {
                  children: [
                    (0, a.jsx)('label', {
                      className: 'mb-1 block text-xs font-medium text-ink-muted',
                      htmlFor: 'username',
                      children: 'Username',
                    }),
                    (0, a.jsx)('input', {
                      id: 'username',
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2',
                      ...t('username'),
                    }),
                    i.username &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        children: i.username.message,
                      }),
                  ],
                }),
                (0, a.jsxs)('div', {
                  children: [
                    (0, a.jsx)('label', {
                      className: 'mb-1 block text-xs font-medium text-ink-muted',
                      htmlFor: 'dn',
                      children: 'Display name (optional)',
                    }),
                    (0, a.jsx)('input', {
                      id: 'dn',
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2',
                      ...t('displayName'),
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
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2',
                      ...t('password'),
                    }),
                    i.password &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        children: i.password.message,
                      }),
                  ],
                }),
                (0, a.jsxs)('div', {
                  children: [
                    (0, a.jsx)('label', {
                      className: 'mb-1 block text-xs font-medium text-ink-muted',
                      htmlFor: 'confirm',
                      children: 'Confirm password',
                    }),
                    (0, a.jsx)('input', {
                      id: 'confirm',
                      type: 'password',
                      className:
                        'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2',
                      ...t('confirm'),
                    }),
                    i.confirm &&
                      (0, a.jsx)('p', {
                        className: 'mt-1 text-xs text-red-500',
                        children: i.confirm.message,
                      }),
                  ],
                }),
                i.root &&
                  (0, a.jsx)('p', { className: 'text-sm text-red-500', children: i.root.message }),
                (0, a.jsx)('button', {
                  type: 'submit',
                  disabled: p,
                  className:
                    'w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm disabled:opacity-60',
                  children: p ? 'Creating…' : 'Create account',
                }),
              ],
            }),
            (0, a.jsxs)('p', {
              className: 'mt-6 text-center text-sm text-ink-muted',
              children: [
                'Already have an account?',
                ' ',
                (0, a.jsx)(r(), {
                  className: 'font-medium text-accent underline-offset-4 hover:underline',
                  href: '/login',
                  children: 'Sign in',
                }),
              ],
            }),
          ],
        });
      }
    },
    3719: (e, s, t) => {
      'use strict';
      t.d(s, { n: () => r });
      var a = t(1620),
        n = t(848);
      let r = (0, a.v)()(
        (0, n.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (s) => {
              let { accessToken: t, refreshToken: a, sessionId: n } = s;
              return e({ accessToken: t, refreshToken: a, sessionId: null != n ? n : null });
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
            onRehydrateStorage: () => (e, s) => {
              (console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
                error: s instanceof Error ? s.message : null != s ? s : null,
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
    7170: (e, s, t) => {
      Promise.resolve().then(t.bind(t, 3208));
    },
  },
  (e) => {
    (e.O(0, [664, 595, 402, 587, 18, 358], () => e((e.s = 7170))), (_N_E = e.O()));
  },
]);
