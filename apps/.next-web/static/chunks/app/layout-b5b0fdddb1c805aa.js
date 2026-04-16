(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [177],
  {
    730: (e, t, s) => {
      'use strict';
      s.d(t, { $: () => o, s: () => a });
      var i = s(5635),
        r = s(8458),
        n = s(8306),
        a = class extends r.k {
          #e;
          #t;
          #s;
          #i;
          constructor(e) {
            (super(),
              (this.#e = e.client),
              (this.mutationId = e.mutationId),
              (this.#s = e.mutationCache),
              (this.#t = []),
              (this.state = e.state || o()),
              this.setOptions(e.options),
              this.scheduleGc());
          }
          setOptions(e) {
            ((this.options = e), this.updateGcTime(this.options.gcTime));
          }
          get meta() {
            return this.options.meta;
          }
          addObserver(e) {
            this.#t.includes(e) ||
              (this.#t.push(e),
              this.clearGcTimeout(),
              this.#s.notify({ type: 'observerAdded', mutation: this, observer: e }));
          }
          removeObserver(e) {
            ((this.#t = this.#t.filter((t) => t !== e)),
              this.scheduleGc(),
              this.#s.notify({ type: 'observerRemoved', mutation: this, observer: e }));
          }
          optionalRemove() {
            this.#t.length ||
              ('pending' === this.state.status ? this.scheduleGc() : this.#s.remove(this));
          }
          continue() {
            return this.#i?.continue() ?? this.execute(this.state.variables);
          }
          async execute(e) {
            let t = () => {
                this.#r({ type: 'continue' });
              },
              s = {
                client: this.#e,
                meta: this.options.meta,
                mutationKey: this.options.mutationKey,
              };
            this.#i = (0, n.II)({
              fn: () =>
                this.options.mutationFn
                  ? this.options.mutationFn(e, s)
                  : Promise.reject(Error('No mutationFn found')),
              onFail: (e, t) => {
                this.#r({ type: 'failed', failureCount: e, error: t });
              },
              onPause: () => {
                this.#r({ type: 'pause' });
              },
              onContinue: t,
              retry: this.options.retry ?? 0,
              retryDelay: this.options.retryDelay,
              networkMode: this.options.networkMode,
              canRun: () => this.#s.canRun(this),
            });
            let i = 'pending' === this.state.status,
              r = !this.#i.canStart();
            try {
              if (i) t();
              else {
                (this.#r({ type: 'pending', variables: e, isPaused: r }),
                  this.#s.config.onMutate && (await this.#s.config.onMutate(e, this, s)));
                let t = await this.options.onMutate?.(e, s);
                t !== this.state.context &&
                  this.#r({ type: 'pending', context: t, variables: e, isPaused: r });
              }
              let n = await this.#i.start();
              return (
                await this.#s.config.onSuccess?.(n, e, this.state.context, this, s),
                await this.options.onSuccess?.(n, e, this.state.context, s),
                await this.#s.config.onSettled?.(
                  n,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                ),
                await this.options.onSettled?.(n, null, e, this.state.context, s),
                this.#r({ type: 'success', data: n }),
                n
              );
            } catch (t) {
              try {
                await this.#s.config.onError?.(t, e, this.state.context, this, s);
              } catch (e) {
                Promise.reject(e);
              }
              try {
                await this.options.onError?.(t, e, this.state.context, s);
              } catch (e) {
                Promise.reject(e);
              }
              try {
                await this.#s.config.onSettled?.(
                  void 0,
                  t,
                  this.state.variables,
                  this.state.context,
                  this,
                  s,
                );
              } catch (e) {
                Promise.reject(e);
              }
              try {
                await this.options.onSettled?.(void 0, t, e, this.state.context, s);
              } catch (e) {
                Promise.reject(e);
              }
              throw (this.#r({ type: 'error', error: t }), t);
            } finally {
              this.#s.runNext(this);
            }
          }
          #r(e) {
            ((this.state = ((t) => {
              switch (e.type) {
                case 'failed':
                  return { ...t, failureCount: e.failureCount, failureReason: e.error };
                case 'pause':
                  return { ...t, isPaused: !0 };
                case 'continue':
                  return { ...t, isPaused: !1 };
                case 'pending':
                  return {
                    ...t,
                    context: e.context,
                    data: void 0,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    isPaused: e.isPaused,
                    status: 'pending',
                    variables: e.variables,
                    submittedAt: Date.now(),
                  };
                case 'success':
                  return {
                    ...t,
                    data: e.data,
                    failureCount: 0,
                    failureReason: null,
                    error: null,
                    status: 'success',
                    isPaused: !1,
                  };
                case 'error':
                  return {
                    ...t,
                    data: void 0,
                    error: e.error,
                    failureCount: t.failureCount + 1,
                    failureReason: e.error,
                    isPaused: !1,
                    status: 'error',
                  };
              }
            })(this.state)),
              i.jG.batch(() => {
                (this.#t.forEach((t) => {
                  t.onMutationUpdate(e);
                }),
                  this.#s.notify({ mutation: this, type: 'updated', action: e }));
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
    2188: (e, t, s) => {
      'use strict';
      s.d(t, { Providers: () => q });
      var i = s(4568),
        r = s(9950),
        n = s(8239),
        a = s(5635),
        o = s(2844),
        u = class extends o.Q {
          constructor(e = {}) {
            (super(), (this.config = e), (this.#n = new Map()));
          }
          #n;
          build(e, t, s) {
            let i = t.queryKey,
              a = t.queryHash ?? (0, r.F$)(i, t),
              o = this.get(a);
            return (
              o ||
                ((o = new n.X({
                  client: e,
                  queryKey: i,
                  queryHash: a,
                  options: e.defaultQueryOptions(t),
                  state: s,
                  defaultOptions: e.getQueryDefaults(i),
                })),
                this.add(o)),
              o
            );
          }
          add(e) {
            this.#n.has(e.queryHash) ||
              (this.#n.set(e.queryHash, e), this.notify({ type: 'added', query: e }));
          }
          remove(e) {
            let t = this.#n.get(e.queryHash);
            t &&
              (e.destroy(),
              t === e && this.#n.delete(e.queryHash),
              this.notify({ type: 'removed', query: e }));
          }
          clear() {
            a.jG.batch(() => {
              this.getAll().forEach((e) => {
                this.remove(e);
              });
            });
          }
          get(e) {
            return this.#n.get(e);
          }
          getAll() {
            return [...this.#n.values()];
          }
          find(e) {
            let t = { exact: !0, ...e };
            return this.getAll().find((e) => (0, r.MK)(t, e));
          }
          findAll(e = {}) {
            let t = this.getAll();
            return Object.keys(e).length > 0 ? t.filter((t) => (0, r.MK)(e, t)) : t;
          }
          notify(e) {
            a.jG.batch(() => {
              this.listeners.forEach((t) => {
                t(e);
              });
            });
          }
          onFocus() {
            a.jG.batch(() => {
              this.getAll().forEach((e) => {
                e.onFocus();
              });
            });
          }
          onOnline() {
            a.jG.batch(() => {
              this.getAll().forEach((e) => {
                e.onOnline();
              });
            });
          }
        },
        l = s(730),
        h = class extends o.Q {
          constructor(e = {}) {
            (super(),
              (this.config = e),
              (this.#a = new Set()),
              (this.#o = new Map()),
              (this.#u = 0));
          }
          #a;
          #o;
          #u;
          build(e, t, s) {
            let i = new l.s({
              client: e,
              mutationCache: this,
              mutationId: ++this.#u,
              options: e.defaultMutationOptions(t),
              state: s,
            });
            return (this.add(i), i);
          }
          add(e) {
            this.#a.add(e);
            let t = c(e);
            if ('string' == typeof t) {
              let s = this.#o.get(t);
              s ? s.push(e) : this.#o.set(t, [e]);
            }
            this.notify({ type: 'added', mutation: e });
          }
          remove(e) {
            if (this.#a.delete(e)) {
              let t = c(e);
              if ('string' == typeof t) {
                let s = this.#o.get(t);
                if (s)
                  if (s.length > 1) {
                    let t = s.indexOf(e);
                    -1 !== t && s.splice(t, 1);
                  } else s[0] === e && this.#o.delete(t);
              }
            }
            this.notify({ type: 'removed', mutation: e });
          }
          canRun(e) {
            let t = c(e);
            if ('string' != typeof t) return !0;
            {
              let s = this.#o.get(t),
                i = s?.find((e) => 'pending' === e.state.status);
              return !i || i === e;
            }
          }
          runNext(e) {
            let t = c(e);
            if ('string' != typeof t) return Promise.resolve();
            {
              let s = this.#o.get(t)?.find((t) => t !== e && t.state.isPaused);
              return s?.continue() ?? Promise.resolve();
            }
          }
          clear() {
            a.jG.batch(() => {
              (this.#a.forEach((e) => {
                this.notify({ type: 'removed', mutation: e });
              }),
                this.#a.clear(),
                this.#o.clear());
            });
          }
          getAll() {
            return Array.from(this.#a);
          }
          find(e) {
            let t = { exact: !0, ...e };
            return this.getAll().find((e) => (0, r.nJ)(t, e));
          }
          findAll(e = {}) {
            return this.getAll().filter((t) => (0, r.nJ)(e, t));
          }
          notify(e) {
            a.jG.batch(() => {
              this.listeners.forEach((t) => {
                t(e);
              });
            });
          }
          resumePausedMutations() {
            let e = this.getAll().filter((e) => e.state.isPaused);
            return a.jG.batch(() => Promise.all(e.map((e) => e.continue().catch(r.lQ))));
          }
        };
      function c(e) {
        return e.options.scope?.id;
      }
      var d = s(9382),
        f = s(4189);
      function p(e) {
        return {
          onFetch: (t, s) => {
            let i = t.options,
              n = t.fetchOptions?.meta?.fetchMore?.direction,
              a = t.state.data?.pages || [],
              o = t.state.data?.pageParams || [],
              u = { pages: [], pageParams: [] },
              l = 0,
              h = async () => {
                let s = !1,
                  h = (0, r.ZM)(t.options, t.fetchOptions),
                  c = async (e, i, n) => {
                    if (s) return Promise.reject();
                    if (null == i && e.pages.length) return Promise.resolve(e);
                    let a = (() => {
                        let e = {
                          client: t.client,
                          queryKey: t.queryKey,
                          pageParam: i,
                          direction: n ? 'backward' : 'forward',
                          meta: t.options.meta,
                        };
                        return (
                          (0, r.ox)(
                            e,
                            () => t.signal,
                            () => (s = !0),
                          ),
                          e
                        );
                      })(),
                      o = await h(a),
                      { maxPages: u } = t.options,
                      l = n ? r.ZZ : r.y9;
                    return { pages: l(e.pages, o, u), pageParams: l(e.pageParams, i, u) };
                  };
                if (n && a.length) {
                  let e = 'backward' === n,
                    t = { pages: a, pageParams: o },
                    s = (
                      e
                        ? function (e, { pages: t, pageParams: s }) {
                            return t.length > 0
                              ? e.getPreviousPageParam?.(t[0], t, s[0], s)
                              : void 0;
                          }
                        : m
                    )(i, t);
                  u = await c(t, s, e);
                } else {
                  let t = e ?? a.length;
                  do {
                    let e = 0 === l ? (o[0] ?? i.initialPageParam) : m(i, u);
                    if (l > 0 && null == e) break;
                    ((u = await c(u, e)), l++);
                  } while (l < t);
                }
                return u;
              };
            t.options.persister
              ? (t.fetchFn = () =>
                  t.options.persister?.(
                    h,
                    {
                      client: t.client,
                      queryKey: t.queryKey,
                      meta: t.options.meta,
                      signal: t.signal,
                    },
                    s,
                  ))
              : (t.fetchFn = h);
          },
        };
      }
      function m(e, { pages: t, pageParams: s }) {
        let i = t.length - 1;
        return t.length > 0 ? e.getNextPageParam(t[i], t, s[i], s) : void 0;
      }
      var y = class {
          #l;
          #s;
          #h;
          #c;
          #d;
          #f;
          #p;
          #m;
          constructor(e = {}) {
            ((this.#l = e.queryCache || new u()),
              (this.#s = e.mutationCache || new h()),
              (this.#h = e.defaultOptions || {}),
              (this.#c = new Map()),
              (this.#d = new Map()),
              (this.#f = 0));
          }
          mount() {
            (this.#f++,
              1 === this.#f &&
                ((this.#p = d.m.subscribe(async (e) => {
                  e && (await this.resumePausedMutations(), this.#l.onFocus());
                })),
                (this.#m = f.t.subscribe(async (e) => {
                  e && (await this.resumePausedMutations(), this.#l.onOnline());
                }))));
          }
          unmount() {
            (this.#f--,
              0 === this.#f && (this.#p?.(), (this.#p = void 0), this.#m?.(), (this.#m = void 0)));
          }
          isFetching(e) {
            return this.#l.findAll({ ...e, fetchStatus: 'fetching' }).length;
          }
          isMutating(e) {
            return this.#s.findAll({ ...e, status: 'pending' }).length;
          }
          getQueryData(e) {
            let t = this.defaultQueryOptions({ queryKey: e });
            return this.#l.get(t.queryHash)?.state.data;
          }
          ensureQueryData(e) {
            let t = this.defaultQueryOptions(e),
              s = this.#l.build(this, t),
              i = s.state.data;
            return void 0 === i
              ? this.fetchQuery(e)
              : (e.revalidateIfStale &&
                  s.isStaleByTime((0, r.d2)(t.staleTime, s)) &&
                  this.prefetchQuery(t),
                Promise.resolve(i));
          }
          getQueriesData(e) {
            return this.#l.findAll(e).map(({ queryKey: e, state: t }) => [e, t.data]);
          }
          setQueryData(e, t, s) {
            let i = this.defaultQueryOptions({ queryKey: e }),
              n = this.#l.get(i.queryHash),
              a = n?.state.data,
              o = (0, r.Zw)(t, a);
            if (void 0 !== o) return this.#l.build(this, i).setData(o, { ...s, manual: !0 });
          }
          setQueriesData(e, t, s) {
            return a.jG.batch(() =>
              this.#l.findAll(e).map(({ queryKey: e }) => [e, this.setQueryData(e, t, s)]),
            );
          }
          getQueryState(e) {
            let t = this.defaultQueryOptions({ queryKey: e });
            return this.#l.get(t.queryHash)?.state;
          }
          removeQueries(e) {
            let t = this.#l;
            a.jG.batch(() => {
              t.findAll(e).forEach((e) => {
                t.remove(e);
              });
            });
          }
          resetQueries(e, t) {
            let s = this.#l;
            return a.jG.batch(
              () => (
                s.findAll(e).forEach((e) => {
                  e.reset();
                }),
                this.refetchQueries({ type: 'active', ...e }, t)
              ),
            );
          }
          cancelQueries(e, t = {}) {
            let s = { revert: !0, ...t };
            return Promise.all(a.jG.batch(() => this.#l.findAll(e).map((e) => e.cancel(s))))
              .then(r.lQ)
              .catch(r.lQ);
          }
          invalidateQueries(e, t = {}) {
            return a.jG.batch(() =>
              (this.#l.findAll(e).forEach((e) => {
                e.invalidate();
              }),
              e?.refetchType === 'none')
                ? Promise.resolve()
                : this.refetchQueries({ ...e, type: e?.refetchType ?? e?.type ?? 'active' }, t),
            );
          }
          refetchQueries(e, t = {}) {
            let s = { ...t, cancelRefetch: t.cancelRefetch ?? !0 };
            return Promise.all(
              a.jG.batch(() =>
                this.#l
                  .findAll(e)
                  .filter((e) => !e.isDisabled() && !e.isStatic())
                  .map((e) => {
                    let t = e.fetch(void 0, s);
                    return (
                      s.throwOnError || (t = t.catch(r.lQ)),
                      'paused' === e.state.fetchStatus ? Promise.resolve() : t
                    );
                  }),
              ),
            ).then(r.lQ);
          }
          fetchQuery(e) {
            let t = this.defaultQueryOptions(e);
            void 0 === t.retry && (t.retry = !1);
            let s = this.#l.build(this, t);
            return s.isStaleByTime((0, r.d2)(t.staleTime, s))
              ? s.fetch(t)
              : Promise.resolve(s.state.data);
          }
          prefetchQuery(e) {
            return this.fetchQuery(e).then(r.lQ).catch(r.lQ);
          }
          fetchInfiniteQuery(e) {
            return ((e.behavior = p(e.pages)), this.fetchQuery(e));
          }
          prefetchInfiniteQuery(e) {
            return this.fetchInfiniteQuery(e).then(r.lQ).catch(r.lQ);
          }
          ensureInfiniteQueryData(e) {
            return ((e.behavior = p(e.pages)), this.ensureQueryData(e));
          }
          resumePausedMutations() {
            return f.t.isOnline() ? this.#s.resumePausedMutations() : Promise.resolve();
          }
          getQueryCache() {
            return this.#l;
          }
          getMutationCache() {
            return this.#s;
          }
          getDefaultOptions() {
            return this.#h;
          }
          setDefaultOptions(e) {
            this.#h = e;
          }
          setQueryDefaults(e, t) {
            this.#c.set((0, r.EN)(e), { queryKey: e, defaultOptions: t });
          }
          getQueryDefaults(e) {
            let t = [...this.#c.values()],
              s = {};
            return (
              t.forEach((t) => {
                (0, r.Cp)(e, t.queryKey) && Object.assign(s, t.defaultOptions);
              }),
              s
            );
          }
          setMutationDefaults(e, t) {
            this.#d.set((0, r.EN)(e), { mutationKey: e, defaultOptions: t });
          }
          getMutationDefaults(e) {
            let t = [...this.#d.values()],
              s = {};
            return (
              t.forEach((t) => {
                (0, r.Cp)(e, t.mutationKey) && Object.assign(s, t.defaultOptions);
              }),
              s
            );
          }
          defaultQueryOptions(e) {
            if (e._defaulted) return e;
            let t = {
              ...this.#h.queries,
              ...this.getQueryDefaults(e.queryKey),
              ...e,
              _defaulted: !0,
            };
            return (
              t.queryHash || (t.queryHash = (0, r.F$)(t.queryKey, t)),
              void 0 === t.refetchOnReconnect &&
                (t.refetchOnReconnect = 'always' !== t.networkMode),
              void 0 === t.throwOnError && (t.throwOnError = !!t.suspense),
              !t.networkMode && t.persister && (t.networkMode = 'offlineFirst'),
              t.queryFn === r.hT && (t.enabled = !1),
              t
            );
          }
          defaultMutationOptions(e) {
            return e?._defaulted
              ? e
              : {
                  ...this.#h.mutations,
                  ...(e?.mutationKey && this.getMutationDefaults(e.mutationKey)),
                  ...e,
                  _defaulted: !0,
                };
          }
          clear() {
            (this.#l.clear(), this.#s.clear());
          }
        },
        g = s(4869),
        b = s(7620),
        v = s(9100),
        C = s(4595),
        w = s(3719);
      function P() {
        let e = (0, w.n)((e) => e.hasHydrated);
        return (0, i.jsx)(v.N, {
          children:
            !e &&
            (0, i.jsxs)(
              C.P.div,
              {
                role: 'status',
                'aria-live': 'polite',
                'aria-label': 'Loading Pulse',
                initial: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                className:
                  'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface',
                children: [
                  (0, i.jsxs)(C.P.div, {
                    initial: { opacity: 0.88, y: 4 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                    className: 'text-center',
                    children: [
                      (0, i.jsx)('p', {
                        className:
                          'font-display text-[1.65rem] font-semibold tracking-tight text-ink',
                        children: 'Pulse',
                      }),
                      (0, i.jsx)('p', {
                        className:
                          'mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-ink-muted',
                        children: 'Xasma',
                      }),
                    ],
                  }),
                  (0, i.jsx)(C.P.div, {
                    className:
                      'mt-10 h-[2px] w-12 overflow-hidden rounded-full bg-line/55 dark:bg-line/50',
                    initial: { opacity: 0.6 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.08, duration: 0.25 },
                    children: (0, i.jsx)(C.P.div, {
                      className: 'h-full w-1/2 rounded-full bg-accent/90',
                      initial: { x: '-100%' },
                      animate: { x: '200%' },
                      transition: { duration: 0.75, ease: [0.45, 0, 0.55, 1] },
                    }),
                  }),
                ],
              },
              'bootstrap-splash',
            ),
        });
      }
      var x = s(4043);
      function O(e) {
        var t, s;
        let i = w.n.getState(),
          r = w.n.persist;
        console.warn('[pulse-bootstrap] '.concat(e), {
          storeHasHydrated: i.hasHydrated,
          persistHasHydrated:
            null != (s = null == r || null == (t = r.hasHydrated) ? void 0 : t.call(r)) ? s : null,
          hasAccessToken: !!i.accessToken,
          hasRefreshToken: !!i.refreshToken,
        });
      }
      function q(e) {
        let { children: t } = e,
          [s] = (0, b.useState)(() => new y()),
          r = (0, x.n)((e) => e.theme);
        return (
          (0, b.useEffect)(() => {
            console.log('[pulse-bootstrap] Providers mount: bootstrap effect start');
            let e = w.n.persist;
            if (null == e) {
              (O('no persist API — forcing hasHydrated'), w.n.setState({ hasHydrated: !0 }));
              return;
            }
            let t = () => {
              w.n.getState().hasHydrated ||
                (console.log('[pulse-bootstrap] onFinishHydration / sync: set hasHydrated true'),
                w.n.setState({ hasHydrated: !0 }));
            };
            e.hasHydrated() &&
              (console.log('[pulse-bootstrap] persist already hydrated before subscribe'),
              queueMicrotask(t));
            let s = e.onFinishHydration((e) => {
                (console.log('[pulse-bootstrap] persist.onFinishHydration', {
                  hasToken: !!e.accessToken,
                }),
                  queueMicrotask(t));
              }),
              i = window.setTimeout(() => {
                w.n.getState().hasHydrated ||
                  (O('FALLBACK 2500ms — forcing hasHydrated to unblock UI'),
                  w.n.setState({ hasHydrated: !0 }));
              }, 2500);
            return () => {
              (s(), window.clearTimeout(i));
            };
          }, []),
          (0, b.useEffect)(() => {
            let e = document.documentElement,
              t = () => {
                if ('dark' === r) e.classList.add('dark');
                else if ('light' === r) e.classList.remove('dark');
                else {
                  let t = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  e.classList.toggle('dark', t);
                }
              };
            if ((t(), 'system' === r)) {
              let e = window.matchMedia('(prefers-color-scheme: dark)'),
                s = () => t();
              return (e.addEventListener('change', s), () => e.removeEventListener('change', s));
            }
          }, [r]),
          (0, i.jsxs)(g.Ht, { client: s, children: [t, (0, i.jsx)(P, {})] })
        );
      }
    },
    3719: (e, t, s) => {
      'use strict';
      s.d(t, { n: () => n });
      var i = s(1620),
        r = s(848);
      let n = (0, i.v)()(
        (0, r.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: s, refreshToken: i, sessionId: r } = t;
              return e({ accessToken: s, refreshToken: i, sessionId: null != r ? r : null });
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
                    n.setState({ hasHydrated: !0 }));
                }));
            },
          },
        ),
      );
    },
    4043: (e, t, s) => {
      'use strict';
      s.d(t, { n: () => i });
      let i = (0, s(1620).v)((e) => ({
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
        setTypingForChat: (t, s) =>
          e((e) => ({
            typingByChat: s
              ? { ...e.typingByChat, [t]: !0 }
              : Object.fromEntries(
                  Object.entries(e.typingByChat).filter((e) => {
                    let [s] = e;
                    return s !== t;
                  }),
                ),
          })),
      }));
    },
    4560: (e) => {
      e.exports = {
        style: { fontFamily: "'Outfit', 'Outfit Fallback'", fontStyle: 'normal' },
        className: '__className_ed3508',
        variable: '__variable_ed3508',
      };
    },
    6985: (e, t, s) => {
      (Promise.resolve().then(s.bind(s, 2188)),
        Promise.resolve().then(s.t.bind(s, 9641, 23)),
        Promise.resolve().then(s.t.bind(s, 4560, 23)),
        Promise.resolve().then(s.t.bind(s, 8761, 23)));
    },
    8761: () => {},
    9100: (e, t, s) => {
      'use strict';
      s.d(t, { N: () => v });
      var i = s(4568),
        r = s(7620),
        n = s(5971),
        a = s(3847),
        o = s(8683),
        u = s(2015),
        l = s(3449),
        h = s(9070);
      function c(e, t) {
        if ('function' == typeof e) return e(t);
        null != e && (e.current = t);
      }
      class d extends r.Component {
        getSnapshotBeforeUpdate(e) {
          let t = this.props.childRef.current;
          if ((0, l.s)(t) && e.isPresent && !this.props.isPresent && !1 !== this.props.pop) {
            let e = t.offsetParent,
              s = ((0, l.s)(e) && e.offsetWidth) || 0,
              i = ((0, l.s)(e) && e.offsetHeight) || 0,
              r = getComputedStyle(t),
              n = this.props.sizeRef.current;
            ((n.height = parseFloat(r.height)),
              (n.width = parseFloat(r.width)),
              (n.top = t.offsetTop),
              (n.left = t.offsetLeft),
              (n.right = s - n.width - n.left),
              (n.bottom = i - n.height - n.top));
          }
          return null;
        }
        componentDidUpdate() {}
        render() {
          return this.props.children;
        }
      }
      function f(e) {
        var t, s;
        let { children: n, isPresent: a, anchorX: o, anchorY: u, root: l, pop: f } = e,
          p = (0, r.useId)(),
          m = (0, r.useRef)(null),
          y = (0, r.useRef)({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
          { nonce: g } = (0, r.useContext)(h.Q),
          b = (function (...e) {
            return r.useCallback(
              (function (...e) {
                return (t) => {
                  let s = !1,
                    i = e.map((e) => {
                      let i = c(e, t);
                      return (s || 'function' != typeof i || (s = !0), i);
                    });
                  if (s)
                    return () => {
                      for (let t = 0; t < i.length; t++) {
                        let s = i[t];
                        'function' == typeof s ? s() : c(e[t], null);
                      }
                    };
                };
              })(...e),
              e,
            );
          })(
            m,
            null != (s = null == (t = n.props) ? void 0 : t.ref) ? s : null == n ? void 0 : n.ref,
          );
        return (
          (0, r.useInsertionEffect)(() => {
            let { width: e, height: t, top: s, left: i, right: r, bottom: n } = y.current;
            if (a || !1 === f || !m.current || !e || !t) return;
            m.current.dataset.motionPopId = p;
            let h = document.createElement('style');
            g && (h.nonce = g);
            let c = null != l ? l : document.head;
            return (
              c.appendChild(h),
              h.sheet &&
                h.sheet.insertRule(
                  '\n          [data-motion-pop-id="'
                    .concat(
                      p,
                      '"] {\n            position: absolute !important;\n            width: ',
                    )
                    .concat(e, 'px !important;\n            height: ')
                    .concat(t, 'px !important;\n            ')
                    .concat(
                      'left' === o ? 'left: '.concat(i) : 'right: '.concat(r),
                      'px !important;\n            ',
                    )
                    .concat(
                      'bottom' === u ? 'bottom: '.concat(n) : 'top: '.concat(s),
                      'px !important;\n          }\n        ',
                    ),
                ),
              () => {
                var e;
                (null == (e = m.current) || e.removeAttribute('data-motion-pop-id'),
                  c.contains(h) && c.removeChild(h));
              }
            );
          }, [a]),
          (0, i.jsx)(d, {
            isPresent: a,
            childRef: m,
            sizeRef: y,
            pop: f,
            children: !1 === f ? n : r.cloneElement(n, { ref: b }),
          })
        );
      }
      let p = (e) => {
        let {
            children: t,
            initial: s,
            isPresent: n,
            onExitComplete: o,
            custom: l,
            presenceAffectsLayout: h,
            mode: c,
            anchorX: d,
            anchorY: p,
            root: y,
          } = e,
          g = (0, a.M)(m),
          b = (0, r.useId)(),
          v = !0,
          C = (0, r.useMemo)(
            () => (
              (v = !1),
              {
                id: b,
                initial: s,
                isPresent: n,
                custom: l,
                onExitComplete: (e) => {
                  for (let t of (g.set(e, !0), g.values())) if (!t) return;
                  o && o();
                },
                register: (e) => (g.set(e, !1), () => g.delete(e)),
              }
            ),
            [n, g, o],
          );
        return (
          h && v && (C = { ...C }),
          (0, r.useMemo)(() => {
            g.forEach((e, t) => g.set(t, !1));
          }, [n]),
          r.useEffect(() => {
            n || g.size || !o || o();
          }, [n]),
          (t = (0, i.jsx)(f, {
            pop: 'popLayout' === c,
            isPresent: n,
            anchorX: d,
            anchorY: p,
            root: y,
            children: t,
          })),
          (0, i.jsx)(u.t.Provider, { value: C, children: t })
        );
      };
      function m() {
        return new Map();
      }
      var y = s(6472);
      let g = (e) => e.key || '';
      function b(e) {
        let t = [];
        return (
          r.Children.forEach(e, (e) => {
            (0, r.isValidElement)(e) && t.push(e);
          }),
          t
        );
      }
      let v = (e) => {
        let {
            children: t,
            custom: s,
            initial: u = !0,
            onExitComplete: l,
            presenceAffectsLayout: h = !0,
            mode: c = 'sync',
            propagate: d = !1,
            anchorX: f = 'left',
            anchorY: m = 'top',
            root: v,
          } = e,
          [C, w] = (0, y.xQ)(d),
          P = (0, r.useMemo)(() => b(t), [t]),
          x = d && !C ? [] : P.map(g),
          O = (0, r.useRef)(!0),
          q = (0, r.useRef)(P),
          Q = (0, a.M)(() => new Map()),
          k = (0, r.useRef)(new Set()),
          [j, E] = (0, r.useState)(P),
          [M, S] = (0, r.useState)(P);
        (0, o.E)(() => {
          ((O.current = !1), (q.current = P));
          for (let e = 0; e < M.length; e++) {
            let t = g(M[e]);
            x.includes(t) ? (Q.delete(t), k.current.delete(t)) : !0 !== Q.get(t) && Q.set(t, !1);
          }
        }, [M, x.length, x.join('-')]);
        let H = [];
        if (P !== j) {
          let e = [...P];
          for (let t = 0; t < M.length; t++) {
            let s = M[t],
              i = g(s);
            x.includes(i) || (e.splice(t, 0, s), H.push(s));
          }
          return ('wait' === c && H.length && (e = H), S(b(e)), E(P), null);
        }
        let { forceRender: D } = (0, r.useContext)(n.L);
        return (0, i.jsx)(i.Fragment, {
          children: M.map((e) => {
            let t = g(e),
              r = (!d || !!C) && (P === M || x.includes(t));
            return (0, i.jsx)(
              p,
              {
                isPresent: r,
                initial: (!O.current || !!u) && void 0,
                custom: s,
                presenceAffectsLayout: h,
                mode: c,
                root: v,
                onExitComplete: r
                  ? void 0
                  : () => {
                      if (k.current.has(t) || !Q.has(t)) return;
                      (k.current.add(t), Q.set(t, !0));
                      let e = !0;
                      (Q.forEach((t) => {
                        t || (e = !1);
                      }),
                        e && (null == D || D(), S(q.current), d && (null == w || w()), l && l()));
                    },
                anchorX: f,
                anchorY: m,
                children: e,
              },
              t,
            );
          }),
        });
      };
    },
    9641: (e) => {
      e.exports = {
        style: { fontFamily: "'Inter', 'Inter Fallback'", fontStyle: 'normal' },
        className: '__className_f367f3',
        variable: '__variable_f367f3',
      };
    },
  },
  (e) => {
    (e.O(0, [89, 887, 595, 587, 18, 358], () => e((e.s = 6985))), (_N_E = e.O()));
  },
]);
