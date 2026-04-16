(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [101],
  {
    462: (t, e, s) => {
      'use strict';
      (s.r(e), s.d(e, { default: () => m }));
      var i = s(4568),
        n = s(9664),
        a = s.n(n),
        r = s(7620),
        o = s(4869),
        l = s(2995),
        u = s(1562),
        c = s(2982),
        h = s(5095),
        d = s(3719);
      function m() {
        var t, e, s, n, m;
        let p = (0, o.jE)(),
          f = (0, d.n)((t) => t.accessToken),
          x = (0, d.n)((t) => t.sessionId),
          { data: y, isLoading: b } = (0, l.I)({
            queryKey: ['me'],
            queryFn: () => (0, c.nr)('/users/me'),
          }),
          [v, g] = (0, r.useState)(''),
          [j, k] = (0, r.useState)(''),
          [w, C] = (0, r.useState)(''),
          [N, S] = (0, r.useState)(null),
          [P, M] = (0, r.useState)(null),
          [O, T] = (0, r.useState)(!1);
        (0, r.useEffect)(() => {
          var t, e, s, i;
          y &&
            (g(null != (t = y.displayName) ? t : ''),
            k(null != (e = y.username) ? e : ''),
            C(null != (s = y.bio) ? s : ''),
            S(null != (i = y.avatarUrl) ? i : null));
        }, [
          null == y ? void 0 : y.id,
          null == y ? void 0 : y.avatarUrl,
          null == y ? void 0 : y.bio,
          null == y ? void 0 : y.displayName,
          null == y ? void 0 : y.username,
        ]);
        let R = (0, u.n)({
            mutationFn: (t) => (0, c.nr)('/users/me', { method: 'PATCH', body: t }),
            onSuccess: (t) => {
              p.setQueryData(['me'], t);
            },
          }),
          E = (0, u.n)({
            mutationFn: () =>
              (0, c.nr)('/users/me', {
                method: 'PATCH',
                body: {
                  displayName: v.trim() || null,
                  username: j.trim() || null,
                  bio: w.trim() || null,
                  avatarUrl: N,
                },
              }),
            onSuccess: (t) => {
              p.setQueryData(['me'], t);
            },
          }),
          A = async (t) => {
            if (!f) throw Error('Not authenticated');
            if ((M(null), !t.type.startsWith('image/')))
              return void M('Please choose an image file.');
            if (t.size > 5242880) return void M('Image is too large. Max 5MB.');
            T(!0);
            let e = new FormData();
            (e.append('file', t), e.append('kind', 'image'));
            let s = { Authorization: 'Bearer '.concat(f) };
            x && (s['x-session-fingerprint'] = x);
            let i = await fetch(''.concat(c.H$, '/media/upload'), {
              method: 'POST',
              headers: s,
              body: e,
            });
            try {
              if (!i.ok) throw Error('upload failed');
              let t = await i.json();
              (S(t.url), await R.mutateAsync({ avatarUrl: t.url }));
            } catch (t) {
              M('Upload failed. Please try again.');
            } finally {
              T(!1);
            }
          },
          I = (
            null !=
            (e =
              null != (t = null == y ? void 0 : y.displayName)
                ? t
                : null == y
                  ? void 0
                  : y.username)
              ? e
              : 'Me'
          )
            .slice(0, 1)
            .toUpperCase();
        return (0, i.jsxs)('div', {
          className: 'mx-auto max-w-lg px-6 py-10',
          children: [
            (0, i.jsx)(a(), {
              href: '/settings',
              className: 'text-sm text-accent',
              children: '← Settings',
            }),
            (0, i.jsx)('h1', {
              className: 'mt-4 font-display text-3xl font-semibold text-ink',
              children: 'My Profile',
            }),
            (0, i.jsx)('p', {
              className: 'mt-2 text-sm text-ink-muted',
              children: 'How others see you in chats.',
            }),
            (0, i.jsxs)('section', {
              className: 'mt-8 rounded-2xl border border-line bg-surface-elevated p-4',
              children: [
                (0, i.jsxs)('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    (0, i.jsx)('div', {
                      className: 'relative h-14 w-14 shrink-0',
                      children: N
                        ? (0, i.jsx)('img', {
                            src: N,
                            alt: '',
                            className: 'h-14 w-14 rounded-full object-cover ring-1 ring-line/45',
                          })
                        : (0, i.jsx)('div', {
                            className: (0, h.cn)(
                              'flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ring-1 ring-line/40',
                              'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                            ),
                            children: I,
                          }),
                    }),
                    (0, i.jsxs)('div', {
                      className: 'min-w-0 flex-1',
                      children: [
                        (0, i.jsx)('div', {
                          className: 'truncate text-sm font-semibold text-ink',
                          children:
                            null !=
                            (n =
                              null != (s = null == y ? void 0 : y.displayName)
                                ? s
                                : null == y
                                  ? void 0
                                  : y.username)
                              ? n
                              : b
                                ? 'Loading…'
                                : '—',
                        }),
                        (0, i.jsxs)('div', {
                          className: 'truncate text-xs text-ink-muted',
                          children: ['@', null != (m = null == y ? void 0 : y.username) ? m : '—'],
                        }),
                      ],
                    }),
                    (0, i.jsxs)('label', {
                      className:
                        'inline-flex cursor-pointer items-center rounded-xl border border-line px-3 py-2 text-sm text-ink-muted hover:text-ink',
                      children: [
                        O ? 'Uploading…' : 'Change avatar',
                        (0, i.jsx)('input', {
                          type: 'file',
                          accept: 'image/*',
                          className: 'sr-only',
                          onChange: async (t) => {
                            var e;
                            let s = null == (e = t.target.files) ? void 0 : e[0];
                            if (s)
                              try {
                                await A(s);
                              } finally {
                                t.target.value = '';
                              }
                          },
                        }),
                      ],
                    }),
                  ],
                }),
                P && (0, i.jsx)('p', { className: 'mt-2 text-sm text-red-500', children: P }),
                (0, i.jsxs)('div', {
                  className: 'mt-5 space-y-3',
                  children: [
                    (0, i.jsxs)('div', {
                      children: [
                        (0, i.jsx)('label', {
                          className:
                            'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                          children: 'Display name',
                        }),
                        (0, i.jsx)('input', {
                          value: v,
                          onChange: (t) => g(t.target.value),
                          className:
                            'mt-1 h-10 w-full rounded-xl border border-line bg-surface-muted/40 px-3 text-sm text-ink outline-none focus:border-accent/40',
                          placeholder: 'Your name',
                        }),
                      ],
                    }),
                    (0, i.jsxs)('div', {
                      children: [
                        (0, i.jsx)('label', {
                          className:
                            'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                          children: 'Username',
                        }),
                        (0, i.jsx)('input', {
                          value: j,
                          onChange: (t) => k(t.target.value),
                          className:
                            'mt-1 h-10 w-full rounded-xl border border-line bg-surface-muted/40 px-3 text-sm text-ink outline-none focus:border-accent/40',
                          placeholder: 'handle',
                        }),
                        (0, i.jsx)('p', {
                          className: 'mt-1 text-xs text-ink-muted',
                          children: 'Letters, numbers, underscore. 3–32 chars.',
                        }),
                      ],
                    }),
                    (0, i.jsxs)('div', {
                      children: [
                        (0, i.jsx)('label', {
                          className:
                            'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                          children: 'Bio / About',
                        }),
                        (0, i.jsx)('textarea', {
                          value: w,
                          onChange: (t) => C(t.target.value),
                          rows: 4,
                          className:
                            'mt-1 w-full resize-none rounded-xl border border-line bg-surface-muted/40 px-3 py-2 text-sm text-ink outline-none focus:border-accent/40',
                          placeholder: 'A short about section…',
                        }),
                      ],
                    }),
                  ],
                }),
                (0, i.jsxs)('div', {
                  className: 'mt-5 flex items-center gap-2',
                  children: [
                    (0, i.jsx)('button', {
                      type: 'button',
                      onClick: () => E.mutate(),
                      disabled: E.isPending || R.isPending || O,
                      className: (0, h.cn)(
                        'inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold',
                        E.isPending || R.isPending || O
                          ? 'cursor-not-allowed border-line text-ink-muted'
                          : 'border-accent/35 bg-accent/10 text-ink hover:border-accent/55',
                      ),
                      children: 'Save changes',
                    }),
                    E.isError &&
                      (0, i.jsx)('span', {
                        className: 'text-xs text-red-500',
                        children: 'Failed to save.',
                      }),
                    E.isSuccess &&
                      (0, i.jsx)('span', {
                        className: 'text-xs text-ink-muted',
                        children: 'Saved.',
                      }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
    },
    730: (t, e, s) => {
      'use strict';
      s.d(e, { $: () => o, s: () => r });
      var i = s(5635),
        n = s(8458),
        a = s(8306),
        r = class extends n.k {
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
            this.#i = (0, a.II)({
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
              let a = await this.#i.start();
              return (
                await this.#s.config.onSuccess?.(a, t, this.state.context, this, s),
                await this.options.onSuccess?.(a, t, this.state.context, s),
                await this.#s.config.onSettled?.(
                  a,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                ),
                await this.options.onSettled?.(a, null, t, this.state.context, s),
                this.#n({ type: 'success', data: a }),
                a
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
      s.d(e, { n: () => c });
      var i = s(7620),
        n = s(730),
        a = s(5635),
        r = s(2844),
        o = s(9950),
        l = class extends r.Q {
          #t;
          #a = void 0;
          #r;
          #o;
          constructor(t, e) {
            (super(), (this.#t = t), this.setOptions(e), this.bindMethods(), this.#l());
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
                  .notify({ type: 'observerOptionsUpdated', mutation: this.#r, observer: this }),
              e?.mutationKey &&
              this.options.mutationKey &&
              (0, o.EN)(e.mutationKey) !== (0, o.EN)(this.options.mutationKey)
                ? this.reset()
                : this.#r?.state.status === 'pending' && this.#r.setOptions(this.options));
          }
          onUnsubscribe() {
            this.hasListeners() || this.#r?.removeObserver(this);
          }
          onMutationUpdate(t) {
            (this.#l(), this.#u(t));
          }
          getCurrentResult() {
            return this.#a;
          }
          reset() {
            (this.#r?.removeObserver(this), (this.#r = void 0), this.#l(), this.#u());
          }
          mutate(t, e) {
            return (
              (this.#o = e),
              this.#r?.removeObserver(this),
              (this.#r = this.#t.getMutationCache().build(this.#t, this.options)),
              this.#r.addObserver(this),
              this.#r.execute(t)
            );
          }
          #l() {
            let t = this.#r?.state ?? (0, n.$)();
            this.#a = {
              ...t,
              isPending: 'pending' === t.status,
              isSuccess: 'success' === t.status,
              isError: 'error' === t.status,
              isIdle: 'idle' === t.status,
              mutate: this.mutate,
              reset: this.reset,
            };
          }
          #u(t) {
            a.jG.batch(() => {
              if (this.#o && this.hasListeners()) {
                let e = this.#a.variables,
                  s = this.#a.context,
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
                t(this.#a);
              });
            });
          }
        },
        u = s(4869);
      function c(t, e) {
        let s = (0, u.jE)(e),
          [n] = i.useState(() => new l(s, t));
        i.useEffect(() => {
          n.setOptions(t);
        }, [n, t]);
        let r = i.useSyncExternalStore(
            i.useCallback((t) => n.subscribe(a.jG.batchCalls(t)), [n]),
            () => n.getCurrentResult(),
            () => n.getCurrentResult(),
          ),
          c = i.useCallback(
            (t, e) => {
              n.mutate(t, e).catch(o.lQ);
            },
            [n],
          );
        if (r.error && (0, o.GU)(n.options.throwOnError, [r.error])) throw r.error;
        return { ...r, mutate: c, mutateAsync: r.mutate };
      }
    },
    2982: (t, e, s) => {
      'use strict';
      s.d(e, { H$: () => n, hD: () => a, nr: () => o });
      var i = s(3719);
      let n = 'http://localhost:4000';
      class a extends Error {
        constructor(t, e, s) {
          (super(e), (this.status = t), (this.body = s));
        }
      }
      async function r() {
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
          l = new Headers(o.headers);
        if (!s) {
          let t = i.n.getState().accessToken;
          t && l.set('Authorization', 'Bearer '.concat(t));
          let e = i.n.getState().sessionId;
          e && l.set('x-session-fingerprint', e);
        }
        let u = o.body;
        null == u ||
          u instanceof FormData ||
          ('object' != typeof u ||
            u instanceof Blob ||
            u instanceof ArrayBuffer ||
            (u = JSON.stringify(u)),
          l.has('Content-Type') || l.set('Content-Type', 'application/json'));
        let c = await fetch(''.concat(n).concat(t), { ...o, body: u, headers: l });
        if (401 === c.status && !s) {
          let e = await r();
          e &&
            (l.set('Authorization', 'Bearer '.concat(e)),
            (c = await fetch(''.concat(n).concat(t), { ...o, body: u, headers: l })));
        }
        let h = await c.text(),
          d = null;
        if (h)
          try {
            d = JSON.parse(h);
          } catch (t) {
            d = { raw: h };
          }
        if (!c.ok) {
          let t =
            'object' == typeof d && null !== d && 'message' in d ? String(d.message) : c.statusText;
          throw new a(c.status, t, d);
        }
        return d;
      }
    },
    3719: (t, e, s) => {
      'use strict';
      s.d(e, { n: () => a });
      var i = s(1620),
        n = s(848);
      let a = (0, i.v)()(
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
                    a.setState({ hasHydrated: !0 }));
                }));
            },
          },
        ),
      );
    },
    5095: (t, e, s) => {
      'use strict';
      s.d(e, { cn: () => a });
      var i = s(2902),
        n = s(5643);
      function a() {
        for (var t = arguments.length, e = Array(t), s = 0; s < t; s++) e[s] = arguments[s];
        return (0, n.QP)((0, i.$)(e));
      }
    },
    5984: (t, e, s) => {
      Promise.resolve().then(s.bind(s, 462));
    },
  },
  (t) => {
    (t.O(0, [887, 664, 995, 836, 587, 18, 358], () => t((t.s = 5984))), (_N_E = t.O()));
  },
]);
