(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [781],
  {
    156: (t, e, s) => {
      'use strict';
      (s.r(e), s.d(e, { default: () => h }));
      var i = s(4568),
        n = s(9664),
        r = s.n(n),
        a = s(4869),
        o = s(2995),
        u = s(1562),
        c = s(2982);
      function h() {
        let t = (0, a.jE)(),
          { data: e } = (0, o.I)({ queryKey: ['sessions'], queryFn: () => (0, c.nr)('/sessions') }),
          s = (0, u.n)({
            mutationFn: (t) => (0, c.nr)('/sessions/'.concat(t), { method: 'DELETE' }),
            onSuccess: () => t.invalidateQueries({ queryKey: ['sessions'] }),
          }),
          n = (0, u.n)({
            mutationFn: () => (0, c.nr)('/sessions/revoke-others', { method: 'POST' }),
            onSuccess: () => t.invalidateQueries({ queryKey: ['sessions'] }),
          });
        return (0, i.jsxs)('div', {
          className: 'mx-auto max-w-2xl px-6 py-10',
          children: [
            (0, i.jsx)(r(), {
              href: '/settings',
              className: 'text-sm text-accent',
              children: '← Settings',
            }),
            (0, i.jsx)('h1', {
              className: 'mt-4 font-display text-3xl font-semibold text-ink',
              children: 'Devices',
            }),
            (0, i.jsx)('p', {
              className: 'mt-2 text-sm text-ink-muted',
              children: 'Active sessions for your Pulse account.',
            }),
            (0, i.jsx)('button', {
              type: 'button',
              className:
                'mt-6 rounded-xl border border-line px-3 py-2 text-sm text-ink hover:border-accent/40',
              onClick: () => n.mutate(),
              children: 'Sign out other sessions',
            }),
            (0, i.jsx)('ul', {
              className: 'mt-6 space-y-3',
              children:
                null == e
                  ? void 0
                  : e.map((t) => {
                      var e, n;
                      return (0, i.jsx)(
                        'li',
                        {
                          className:
                            'rounded-2xl border border-line bg-surface-elevated p-4 text-sm text-ink',
                          children: (0, i.jsxs)('div', {
                            className: 'flex items-start justify-between gap-3',
                            children: [
                              (0, i.jsxs)('div', {
                                children: [
                                  (0, i.jsx)('p', {
                                    className: 'font-medium',
                                    children: null != (e = t.userAgent) ? e : 'Unknown device',
                                  }),
                                  (0, i.jsx)('p', {
                                    className: 'text-xs text-ink-muted',
                                    children: null != (n = t.ip) ? n : 'IP unknown',
                                  }),
                                  (0, i.jsxs)('p', {
                                    className: 'mt-1 text-[11px] text-ink-muted',
                                    children: [
                                      'Last active ',
                                      new Date(t.lastActiveAt).toLocaleString(),
                                    ],
                                  }),
                                  t.isCurrent &&
                                    (0, i.jsx)('span', {
                                      className:
                                        'mt-2 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent',
                                      children: 'This device',
                                    }),
                                ],
                              }),
                              !t.isCurrent &&
                                (0, i.jsx)('button', {
                                  type: 'button',
                                  className: 'text-xs text-red-500',
                                  onClick: () => s.mutate(t.id),
                                  children: 'Revoke',
                                }),
                            ],
                          }),
                        },
                        t.id,
                      );
                    }),
            }),
          ],
        });
      }
    },
    730: (t, e, s) => {
      'use strict';
      s.d(e, { $: () => o, s: () => a });
      var i = s(5635),
        n = s(8458),
        r = s(8306),
        a = class extends n.k {
          #t;
          #e;
          #s;
          #i;
          constructor(t) {
            (super(),
              (this.#t = t.client),
              (this.mutationId = t.mutationId),
              (this.#s = t.mutationCache),
              (this.#e = []),
              (this.state = t.state || o()),
              this.setOptions(t.options),
              this.scheduleGc());
          }
          setOptions(t) {
            ((this.options = t), this.updateGcTime(this.options.gcTime));
          }
          get meta() {
            return this.options.meta;
          }
          addObserver(t) {
            this.#e.includes(t) ||
              (this.#e.push(t),
              this.clearGcTimeout(),
              this.#s.notify({ type: 'observerAdded', mutation: this, observer: t }));
          }
          removeObserver(t) {
            ((this.#e = this.#e.filter((e) => e !== t)),
              this.scheduleGc(),
              this.#s.notify({ type: 'observerRemoved', mutation: this, observer: t }));
          }
          optionalRemove() {
            this.#e.length ||
              ('pending' === this.state.status ? this.scheduleGc() : this.#s.remove(this));
          }
          continue() {
            return this.#i?.continue() ?? this.execute(this.state.variables);
          }
          async execute(t) {
            let e = () => {
                this.#n({ type: 'continue' });
              },
              s = {
                client: this.#t,
                meta: this.options.meta,
                mutationKey: this.options.mutationKey,
              };
            this.#i = (0, r.II)({
              fn: () =>
                this.options.mutationFn
                  ? this.options.mutationFn(t, s)
                  : Promise.reject(Error('No mutationFn found')),
              onFail: (t, e) => {
                this.#n({ type: 'failed', failureCount: t, error: e });
              },
              onPause: () => {
                this.#n({ type: 'pause' });
              },
              onContinue: e,
              retry: this.options.retry ?? 0,
              retryDelay: this.options.retryDelay,
              networkMode: this.options.networkMode,
              canRun: () => this.#s.canRun(this),
            });
            let i = 'pending' === this.state.status,
              n = !this.#i.canStart();
            try {
              if (i) e();
              else {
                (this.#n({ type: 'pending', variables: t, isPaused: n }),
                  this.#s.config.onMutate && (await this.#s.config.onMutate(t, this, s)));
                let e = await this.options.onMutate?.(t, s);
                e !== this.state.context &&
                  this.#n({ type: 'pending', context: e, variables: t, isPaused: n });
              }
              let r = await this.#i.start();
              return (
                await this.#s.config.onSuccess?.(r, t, this.state.context, this, s),
                await this.options.onSuccess?.(r, t, this.state.context, s),
                await this.#s.config.onSettled?.(
                  r,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                ),
                await this.options.onSettled?.(r, null, t, this.state.context, s),
                this.#n({ type: 'success', data: r }),
                r
              );
            } catch (e) {
              try {
                await this.#s.config.onError?.(e, t, this.state.context, this, s);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onError?.(e, t, this.state.context, s);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.#s.config.onSettled?.(
                  void 0,
                  e,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                );
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onSettled?.(void 0, e, t, this.state.context, s);
              } catch (t) {
                Promise.reject(t);
              }
              throw (this.#n({ type: 'error', error: e }), e);
            } finally {
              this.#s.runNext(this);
            }
          }
          #n(t) {
            ((this.state = ((e) => {
              switch (t.type) {
                case 'failed':
                  return { ...e, failureCount: t.failureCount, failureReason: t.error };
                case 'pause':
                  return { ...e, isPaused: !0 };
                case 'continue':
                  return { ...e, isPaused: !1 };
                case 'pending':
                  return {
                    ...e,
                    context: t.context,
                    data: void 0,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    isPaused: t.isPaused,
                    status: 'pending',
                    variables: t.variables,
                    submittedAt: Date.now(),
                  };
                case 'success':
                  return {
                    ...e,
                    data: t.data,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    status: 'success',
                    isPaused: !1,
                  };
                case 'error':
                  return {
                    ...e,
                    data: void 0,
                    error: t.error,
                    failureCount: e.failureCount + 1,
                    failureReason: t.error,
                    isPaused: !1,
                    status: 'error',
                  };
              }
            })(this.state)),
              i.jG.batch(() => {
                (this.#e.forEach((e) => {
                  e.onMutationUpdate(t);
                }),
                  this.#s.notify({ mutation: this, type: 'updated', action: t }));
              }));
          }
        };
      function o() {
        return {
          context: void 0,
          data: void 0,
          error: null,
          failureCount: 0,
          failureReason: null,
          isPaused: !1,
          status: 'idle',
          variables: void 0,
          submittedAt: 0,
        };
      }
    },
    1562: (t, e, s) => {
      'use strict';
      s.d(e, { n: () => h });
      var i = s(7620),
        n = s(730),
        r = s(5635),
        a = s(2844),
        o = s(9950),
        u = class extends a.Q {
          #t;
          #r = void 0;
          #a;
          #o;
          constructor(t, e) {
            (super(), (this.#t = t), this.setOptions(e), this.bindMethods(), this.#u());
          }
          bindMethods() {
            ((this.mutate = this.mutate.bind(this)), (this.reset = this.reset.bind(this)));
          }
          setOptions(t) {
            let e = this.options;
            ((this.options = this.#t.defaultMutationOptions(t)),
              (0, o.f8)(this.options, e) ||
                this.#t
                  .getMutationCache()
                  .notify({ type: 'observerOptionsUpdated', mutation: this.#a, observer: this }),
              e?.mutationKey &&
              this.options.mutationKey &&
              (0, o.EN)(e.mutationKey) !== (0, o.EN)(this.options.mutationKey)
                ? this.reset()
                : this.#a?.state.status === 'pending' && this.#a.setOptions(this.options));
          }
          onUnsubscribe() {
            this.hasListeners() || this.#a?.removeObserver(this);
          }
          onMutationUpdate(t) {
            (this.#u(), this.#c(t));
          }
          getCurrentResult() {
            return this.#r;
          }
          reset() {
            (this.#a?.removeObserver(this), (this.#a = void 0), this.#u(), this.#c());
          }
          mutate(t, e) {
            return (
              (this.#o = e),
              this.#a?.removeObserver(this),
              (this.#a = this.#t.getMutationCache().build(this.#t, this.options)),
              this.#a.addObserver(this),
              this.#a.execute(t)
            );
          }
          #u() {
            let t = this.#a?.state ?? (0, n.$)();
            this.#r = {
              ...t,
              isPending: 'pending' === t.status,
              isSuccess: 'success' === t.status,
              isError: 'error' === t.status,
              isIdle: 'idle' === t.status,
              mutate: this.mutate,
              reset: this.reset,
            };
          }
          #c(t) {
            r.jG.batch(() => {
              if (this.#o && this.hasListeners()) {
                let e = this.#r.variables,
                  s = this.#r.context,
                  i = {
                    client: this.#t,
                    meta: this.options.meta,
                    mutationKey: this.options.mutationKey,
                  };
                if (t?.type === 'success') {
                  try {
                    this.#o.onSuccess?.(t.data, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#o.onSettled?.(t.data, null, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                } else if (t?.type === 'error') {
                  try {
                    this.#o.onError?.(t.error, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#o.onSettled?.(void 0, t.error, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                }
              }
              this.listeners.forEach((t) => {
                t(this.#r);
              });
            });
          }
        },
        c = s(4869);
      function h(t, e) {
        let s = (0, c.jE)(e),
          [n] = i.useState(() => new u(s, t));
        i.useEffect(() => {
          n.setOptions(t);
        }, [n, t]);
        let a = i.useSyncExternalStore(
            i.useCallback((t) => n.subscribe(r.jG.batchCalls(t)), [n]),
            () => n.getCurrentResult(),
            () => n.getCurrentResult(),
          ),
          h = i.useCallback(
            (t, e) => {
              n.mutate(t, e).catch(o.lQ);
            },
            [n],
          );
        if (a.error && (0, o.GU)(n.options.throwOnError, [a.error])) throw a.error;
        return { ...a, mutate: h, mutateAsync: a.mutate };
      }
    },
    1912: (t, e, s) => {
      Promise.resolve().then(s.bind(s, 156));
    },
    2982: (t, e, s) => {
      'use strict';
      s.d(e, { H$: () => n, hD: () => r, nr: () => o });
      var i = s(3719);
      let n = 'http://localhost:4000';
      class r extends Error {
        constructor(t, e, s) {
          (super(e), (this.status = t), (this.body = s));
        }
      }
      async function a() {
        let t = i.n.getState().refreshToken;
        if (!t) return null;
        let e = await fetch(''.concat(n, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: t }),
        });
        if (!e.ok) return (i.n.getState().clear(), null);
        let s = await e.json();
        return (i.n.getState().setTokens(s), s.accessToken);
      }
      async function o(t) {
        let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: s, ...o } = e,
          u = new Headers(o.headers);
        if (!s) {
          let t = i.n.getState().accessToken;
          t && u.set('Authorization', 'Bearer '.concat(t));
          let e = i.n.getState().sessionId;
          e && u.set('x-session-fingerprint', e);
        }
        let c = o.body;
        null == c ||
          c instanceof FormData ||
          ('object' != typeof c ||
            c instanceof Blob ||
            c instanceof ArrayBuffer ||
            (c = JSON.stringify(c)),
          u.has('Content-Type') || u.set('Content-Type', 'application/json'));
        let h = await fetch(''.concat(n).concat(t), { ...o, body: c, headers: u });
        if (401 === h.status && !s) {
          let e = await a();
          e &&
            (u.set('Authorization', 'Bearer '.concat(e)),
            (h = await fetch(''.concat(n).concat(t), { ...o, body: c, headers: u })));
        }
        let l = await h.text(),
          d = null;
        if (l)
          try {
            d = JSON.parse(l);
          } catch (t) {
            d = { raw: l };
          }
        if (!h.ok) {
          let t =
            'object' == typeof d && null !== d && 'message' in d ? String(d.message) : h.statusText;
          throw new r(h.status, t, d);
        }
        return d;
      }
    },
    3719: (t, e, s) => {
      'use strict';
      s.d(e, { n: () => r });
      var i = s(1620),
        n = s(848);
      let r = (0, i.v)()(
        (0, n.Zr)(
          (t) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (e) => {
              let { accessToken: s, refreshToken: i, sessionId: n } = e;
              return t({ accessToken: s, refreshToken: i, sessionId: null != n ? n : null });
            },
            clear: () => t({ accessToken: null, refreshToken: null, sessionId: null }),
          }),
          {
            name: 'pulse-auth',
            partialize: (t) => ({
              accessToken: t.accessToken,
              refreshToken: t.refreshToken,
              sessionId: t.sessionId,
            }),
            onRehydrateStorage: () => (t, e) => {
              (console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
                error: e instanceof Error ? e.message : null != e ? e : null,
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
  },
  (t) => {
    (t.O(0, [887, 664, 995, 587, 18, 358], () => t((t.s = 1912))), (_N_E = t.O()));
  },
]);
