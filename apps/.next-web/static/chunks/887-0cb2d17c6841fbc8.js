'use strict';
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [887],
  {
    848: (t, e, i) => {
      i.d(e, { Zr: () => r });
      let s = (t) => (e) => {
          try {
            let i = t(e);
            if (i instanceof Promise) return i;
            return {
              then: (t) => s(t)(i),
              catch(t) {
                return this;
              },
            };
          } catch (t) {
            return {
              then(t) {
                return this;
              },
              catch: (e) => s(e)(t),
            };
          }
        },
        r = (t, e) => (i, r, n) => {
          let a,
            o = {
              storage: (function (t, e) {
                let i;
                try {
                  i = t();
                } catch (t) {
                  return;
                }
                return {
                  getItem: (t) => {
                    var e;
                    let s = (t) => (null === t ? null : JSON.parse(t, void 0)),
                      r = null != (e = i.getItem(t)) ? e : null;
                    return r instanceof Promise ? r.then(s) : s(r);
                  },
                  setItem: (t, e) => i.setItem(t, JSON.stringify(e, void 0)),
                  removeItem: (t) => i.removeItem(t),
                };
              })(() => window.localStorage),
              partialize: (t) => t,
              version: 0,
              merge: (t, e) => ({ ...e, ...t }),
              ...e,
            },
            u = !1,
            c = 0,
            l = new Set(),
            h = new Set(),
            d = o.storage;
          if (!d)
            return t(
              (...t) => {
                (console.warn(
                  `[zustand persist middleware] Unable to update item '${o.name}', the given storage is currently unavailable.`,
                ),
                  i(...t));
              },
              r,
              n,
            );
          let f = () => {
              let t = o.partialize({ ...r() });
              return d.setItem(o.name, { state: t, version: o.version });
            },
            p = n.setState;
          n.setState = (t, e) => (p(t, e), f());
          let y = t((...t) => (i(...t), f()), r, n);
          n.getInitialState = () => y;
          let v = () => {
            var t, e;
            if (!d) return;
            let n = ++c;
            ((u = !1),
              l.forEach((t) => {
                var e;
                return t(null != (e = r()) ? e : y);
              }));
            let p =
              (null == (e = o.onRehydrateStorage)
                ? void 0
                : e.call(o, null != (t = r()) ? t : y)) || void 0;
            return s(d.getItem.bind(d))(o.name)
              .then((t) => {
                if (t)
                  if ('number' != typeof t.version || t.version === o.version) return [!1, t.state];
                  else {
                    if (o.migrate) {
                      let e = o.migrate(t.state, t.version);
                      return e instanceof Promise ? e.then((t) => [!0, t]) : [!0, e];
                    }
                    console.error(
                      "State loaded from storage couldn't be migrated since no migrate function was provided",
                    );
                  }
                return [!1, void 0];
              })
              .then((t) => {
                var e;
                if (n !== c) return;
                let [s, u] = t;
                if ((i((a = o.merge(u, null != (e = r()) ? e : y)), !0), s)) return f();
              })
              .then(() => {
                n === c &&
                  (null == p || p(r(), void 0), (a = r()), (u = !0), h.forEach((t) => t(a)));
              })
              .catch((t) => {
                n === c && (null == p || p(void 0, t));
              });
          };
          return (
            (n.persist = {
              setOptions: (t) => {
                ((o = { ...o, ...t }), t.storage && (d = t.storage));
              },
              clearStorage: () => {
                null == d || d.removeItem(o.name);
              },
              getOptions: () => o,
              rehydrate: () => v(),
              hasHydrated: () => u,
              onHydrate: (t) => (
                l.add(t),
                () => {
                  l.delete(t);
                }
              ),
              onFinishHydration: (t) => (
                h.add(t),
                () => {
                  h.delete(t);
                }
              ),
            }),
            o.skipHydration || v(),
            a || y
          );
        };
    },
    1620: (t, e, i) => {
      i.d(e, { v: () => a });
      var s = i(7620);
      let r = (t) => {
          let e,
            i = new Set(),
            s = (t, s) => {
              let r = 'function' == typeof t ? t(e) : t;
              if (!Object.is(r, e)) {
                let t = e;
                ((e = (null != s ? s : 'object' != typeof r || null === r)
                  ? r
                  : Object.assign({}, e, r)),
                  i.forEach((i) => i(e, t)));
              }
            },
            r = () => e,
            n = {
              setState: s,
              getState: r,
              getInitialState: () => a,
              subscribe: (t) => (i.add(t), () => i.delete(t)),
            },
            a = (e = t(s, r, n));
          return n;
        },
        n = (t) => {
          let e = ((t) => (t ? r(t) : r))(t),
            i = (t) =>
              (function (t, e = (t) => t) {
                let i = s.useSyncExternalStore(
                  t.subscribe,
                  s.useCallback(() => e(t.getState()), [t, e]),
                  s.useCallback(() => e(t.getInitialState()), [t, e]),
                );
                return (s.useDebugValue(i), i);
              })(e, t);
          return (Object.assign(i, e), i);
        },
        a = (t) => (t ? n(t) : n);
    },
    2844: (t, e, i) => {
      i.d(e, { Q: () => s });
      var s = class {
        constructor() {
          ((this.listeners = new Set()), (this.subscribe = this.subscribe.bind(this)));
        }
        subscribe(t) {
          return (
            this.listeners.add(t),
            this.onSubscribe(),
            () => {
              (this.listeners.delete(t), this.onUnsubscribe());
            }
          );
        }
        hasListeners() {
          return this.listeners.size > 0;
        }
        onSubscribe() {}
        onUnsubscribe() {}
      };
    },
    3298: (t, e, i) => {
      i.d(e, { T: () => s });
      function s() {
        let t,
          e,
          i = new Promise((i, s) => {
            ((t = i), (e = s));
          });
        function s(t) {
          (Object.assign(i, t), delete i.resolve, delete i.reject);
        }
        return (
          (i.status = 'pending'),
          i.catch(() => {}),
          (i.resolve = (e) => {
            (s({ status: 'fulfilled', value: e }), t(e));
          }),
          (i.reject = (t) => {
            (s({ status: 'rejected', reason: t }), e(t));
          }),
          i
        );
      }
    },
    4189: (t, e, i) => {
      i.d(e, { t: () => r });
      var s = i(2844),
        r = new (class extends s.Q {
          #t = !0;
          #e;
          #i;
          constructor() {
            (super(),
              (this.#i = (t) => {
                if ('undefined' != typeof window && window.addEventListener) {
                  let e = () => t(!0),
                    i = () => t(!1);
                  return (
                    window.addEventListener('online', e, !1),
                    window.addEventListener('offline', i, !1),
                    () => {
                      (window.removeEventListener('online', e),
                        window.removeEventListener('offline', i));
                    }
                  );
                }
              }));
          }
          onSubscribe() {
            this.#e || this.setEventListener(this.#i);
          }
          onUnsubscribe() {
            this.hasListeners() || (this.#e?.(), (this.#e = void 0));
          }
          setEventListener(t) {
            ((this.#i = t), this.#e?.(), (this.#e = t(this.setOnline.bind(this))));
          }
          setOnline(t) {
            this.#t !== t &&
              ((this.#t = t),
              this.listeners.forEach((e) => {
                e(t);
              }));
          }
          isOnline() {
            return this.#t;
          }
        })();
    },
    4869: (t, e, i) => {
      i.d(e, { Ht: () => o, jE: () => a });
      var s = i(7620),
        r = i(4568),
        n = s.createContext(void 0),
        a = (t) => {
          let e = s.useContext(n);
          if (t) return t;
          if (!e) throw Error('No QueryClient set, use QueryClientProvider to set one');
          return e;
        },
        o = (t) => {
          let { client: e, children: i } = t;
          return (
            s.useEffect(
              () => (
                e.mount(),
                () => {
                  e.unmount();
                }
              ),
              [e],
            ),
            (0, r.jsx)(n.Provider, { value: e, children: i })
          );
        };
    },
    5635: (t, e, i) => {
      i.d(e, { jG: () => r });
      var s = i(8811).Zq,
        r = (function () {
          let t = [],
            e = 0,
            i = (t) => {
              t();
            },
            r = (t) => {
              t();
            },
            n = s,
            a = (s) => {
              e
                ? t.push(s)
                : n(() => {
                    i(s);
                  });
            };
          return {
            batch: (s) => {
              let a;
              e++;
              try {
                a = s();
              } finally {
                --e ||
                  (() => {
                    let e = t;
                    ((t = []),
                      e.length &&
                        n(() => {
                          r(() => {
                            e.forEach((t) => {
                              i(t);
                            });
                          });
                        }));
                  })();
              }
              return a;
            },
            batchCalls:
              (t) =>
              (...e) => {
                a(() => {
                  t(...e);
                });
              },
            schedule: a,
            setNotifyFunction: (t) => {
              i = t;
            },
            setBatchNotifyFunction: (t) => {
              r = t;
            },
            setScheduler: (t) => {
              n = t;
            },
          };
        })();
    },
    7133: (t, e, i) => {
      i.d(e, { H: () => r });
      var s = i(9950),
        r = (() => {
          let t = () => s.S$;
          return {
            isServer: () => t(),
            setIsServer(e) {
              t = e;
            },
          };
        })();
    },
    8239: (t, e, i) => {
      i.d(e, { X: () => o, k: () => u });
      var s = i(9950),
        r = i(5635),
        n = i(8306),
        a = i(8458),
        o = class extends a.k {
          #s;
          #r;
          #n;
          #a;
          #o;
          #u;
          #c;
          constructor(t) {
            (super(),
              (this.#c = !1),
              (this.#u = t.defaultOptions),
              this.setOptions(t.options),
              (this.observers = []),
              (this.#a = t.client),
              (this.#n = this.#a.getQueryCache()),
              (this.queryKey = t.queryKey),
              (this.queryHash = t.queryHash),
              (this.#s = l(this.options)),
              (this.state = t.state ?? this.#s),
              this.scheduleGc());
          }
          get meta() {
            return this.options.meta;
          }
          get promise() {
            return this.#o?.promise;
          }
          setOptions(t) {
            if (
              ((this.options = { ...this.#u, ...t }),
              this.updateGcTime(this.options.gcTime),
              this.state && void 0 === this.state.data)
            ) {
              let t = l(this.options);
              void 0 !== t.data && (this.setState(c(t.data, t.dataUpdatedAt)), (this.#s = t));
            }
          }
          optionalRemove() {
            this.observers.length || 'idle' !== this.state.fetchStatus || this.#n.remove(this);
          }
          setData(t, e) {
            let i = (0, s.pl)(this.state.data, t, this.options);
            return (
              this.#l({ data: i, type: 'success', dataUpdatedAt: e?.updatedAt, manual: e?.manual }),
              i
            );
          }
          setState(t, e) {
            this.#l({ type: 'setState', state: t, setStateOptions: e });
          }
          cancel(t) {
            let e = this.#o?.promise;
            return (this.#o?.cancel(t), e ? e.then(s.lQ).catch(s.lQ) : Promise.resolve());
          }
          destroy() {
            (super.destroy(), this.cancel({ silent: !0 }));
          }
          get resetState() {
            return this.#s;
          }
          reset() {
            (this.destroy(), this.setState(this.resetState));
          }
          isActive() {
            return this.observers.some((t) => !1 !== (0, s.Eh)(t.options.enabled, this));
          }
          isDisabled() {
            return this.getObserversCount() > 0
              ? !this.isActive()
              : this.options.queryFn === s.hT || !this.isFetched();
          }
          isFetched() {
            return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
          }
          isStatic() {
            return (
              this.getObserversCount() > 0 &&
              this.observers.some((t) => 'static' === (0, s.d2)(t.options.staleTime, this))
            );
          }
          isStale() {
            return this.getObserversCount() > 0
              ? this.observers.some((t) => t.getCurrentResult().isStale)
              : void 0 === this.state.data || this.state.isInvalidated;
          }
          isStaleByTime(t = 0) {
            return (
              void 0 === this.state.data ||
              ('static' !== t &&
                (!!this.state.isInvalidated || !(0, s.j3)(this.state.dataUpdatedAt, t)))
            );
          }
          onFocus() {
            let t = this.observers.find((t) => t.shouldFetchOnWindowFocus());
            (t?.refetch({ cancelRefetch: !1 }), this.#o?.continue());
          }
          onOnline() {
            let t = this.observers.find((t) => t.shouldFetchOnReconnect());
            (t?.refetch({ cancelRefetch: !1 }), this.#o?.continue());
          }
          addObserver(t) {
            this.observers.includes(t) ||
              (this.observers.push(t),
              this.clearGcTimeout(),
              this.#n.notify({ type: 'observerAdded', query: this, observer: t }));
          }
          removeObserver(t) {
            this.observers.includes(t) &&
              ((this.observers = this.observers.filter((e) => e !== t)),
              this.observers.length ||
                (this.#o &&
                  (this.#c || this.#h() ? this.#o.cancel({ revert: !0 }) : this.#o.cancelRetry()),
                this.scheduleGc()),
              this.#n.notify({ type: 'observerRemoved', query: this, observer: t }));
          }
          getObserversCount() {
            return this.observers.length;
          }
          #h() {
            return 'paused' === this.state.fetchStatus && 'pending' === this.state.status;
          }
          invalidate() {
            this.state.isInvalidated || this.#l({ type: 'invalidate' });
          }
          async fetch(t, e) {
            if ('idle' !== this.state.fetchStatus && this.#o?.status() !== 'rejected') {
              if (void 0 !== this.state.data && e?.cancelRefetch) this.cancel({ silent: !0 });
              else if (this.#o) return (this.#o.continueRetry(), this.#o.promise);
            }
            if ((t && this.setOptions(t), !this.options.queryFn)) {
              let t = this.observers.find((t) => t.options.queryFn);
              t && this.setOptions(t.options);
            }
            let i = new AbortController(),
              r = (t) => {
                Object.defineProperty(t, 'signal', {
                  enumerable: !0,
                  get: () => ((this.#c = !0), i.signal),
                });
              },
              a = () => {
                let t = (0, s.ZM)(this.options, e),
                  i = (() => {
                    let t = { client: this.#a, queryKey: this.queryKey, meta: this.meta };
                    return (r(t), t);
                  })();
                return ((this.#c = !1), this.options.persister)
                  ? this.options.persister(t, i, this)
                  : t(i);
              },
              o = (() => {
                let t = {
                  fetchOptions: e,
                  options: this.options,
                  queryKey: this.queryKey,
                  client: this.#a,
                  state: this.state,
                  fetchFn: a,
                };
                return (r(t), t);
              })();
            (this.options.behavior?.onFetch(o, this),
              (this.#r = this.state),
              ('idle' === this.state.fetchStatus ||
                this.state.fetchMeta !== o.fetchOptions?.meta) &&
                this.#l({ type: 'fetch', meta: o.fetchOptions?.meta }),
              (this.#o = (0, n.II)({
                initialPromise: e?.initialPromise,
                fn: o.fetchFn,
                onCancel: (t) => {
                  (t instanceof n.cc &&
                    t.revert &&
                    this.setState({ ...this.#r, fetchStatus: 'idle' }),
                    i.abort());
                },
                onFail: (t, e) => {
                  this.#l({ type: 'failed', failureCount: t, error: e });
                },
                onPause: () => {
                  this.#l({ type: 'pause' });
                },
                onContinue: () => {
                  this.#l({ type: 'continue' });
                },
                retry: o.options.retry,
                retryDelay: o.options.retryDelay,
                networkMode: o.options.networkMode,
                canRun: () => !0,
              })));
            try {
              let t = await this.#o.start();
              if (void 0 === t) throw Error(`${this.queryHash} data is undefined`);
              return (
                this.setData(t),
                this.#n.config.onSuccess?.(t, this),
                this.#n.config.onSettled?.(t, this.state.error, this),
                t
              );
            } catch (t) {
              if (t instanceof n.cc) {
                if (t.silent) return this.#o.promise;
                else if (t.revert) {
                  if (void 0 === this.state.data) throw t;
                  return this.state.data;
                }
              }
              throw (
                this.#l({ type: 'error', error: t }),
                this.#n.config.onError?.(t, this),
                this.#n.config.onSettled?.(this.state.data, t, this),
                t
              );
            } finally {
              this.scheduleGc();
            }
          }
          #l(t) {
            let e = (e) => {
              switch (t.type) {
                case 'failed':
                  return { ...e, fetchFailureCount: t.failureCount, fetchFailureReason: t.error };
                case 'pause':
                  return { ...e, fetchStatus: 'paused' };
                case 'continue':
                  return { ...e, fetchStatus: 'fetching' };
                case 'fetch':
                  return { ...e, ...u(e.data, this.options), fetchMeta: t.meta ?? null };
                case 'success':
                  let i = {
                    ...e,
                    ...c(t.data, t.dataUpdatedAt),
                    dataUpdateCount: e.dataUpdateCount + 1,
                    ...(!t.manual && {
                      fetchStatus: 'idle',
                      fetchFailureCount: 0,
                      fetchFailureReason: null,
                    }),
                  };
                  return ((this.#r = t.manual ? i : void 0), i);
                case 'error':
                  let s = t.error;
                  return {
                    ...e,
                    error: s,
                    errorUpdateCount: e.errorUpdateCount + 1,
                    errorUpdatedAt: Date.now(),
                    fetchFailureCount: e.fetchFailureCount + 1,
                    fetchFailureReason: s,
                    fetchStatus: 'idle',
                    status: 'error',
                    isInvalidated: !0,
                  };
                case 'invalidate':
                  return { ...e, isInvalidated: !0 };
                case 'setState':
                  return { ...e, ...t.state };
              }
            };
            ((this.state = e(this.state)),
              r.jG.batch(() => {
                (this.observers.forEach((t) => {
                  t.onQueryUpdate();
                }),
                  this.#n.notify({ query: this, type: 'updated', action: t }));
              }));
          }
        };
      function u(t, e) {
        return {
          fetchFailureCount: 0,
          fetchFailureReason: null,
          fetchStatus: (0, n.v_)(e.networkMode) ? 'fetching' : 'paused',
          ...(void 0 === t && { error: null, status: 'pending' }),
        };
      }
      function c(t, e) {
        return {
          data: t,
          dataUpdatedAt: e ?? Date.now(),
          error: null,
          isInvalidated: !1,
          status: 'success',
        };
      }
      function l(t) {
        let e = 'function' == typeof t.initialData ? t.initialData() : t.initialData,
          i = void 0 !== e,
          s = i
            ? 'function' == typeof t.initialDataUpdatedAt
              ? t.initialDataUpdatedAt()
              : t.initialDataUpdatedAt
            : 0;
        return {
          data: e,
          dataUpdateCount: 0,
          dataUpdatedAt: i ? (s ?? Date.now()) : 0,
          error: null,
          errorUpdateCount: 0,
          errorUpdatedAt: 0,
          fetchFailureCount: 0,
          fetchFailureReason: null,
          fetchMeta: null,
          isInvalidated: !1,
          status: i ? 'success' : 'pending',
          fetchStatus: 'idle',
        };
      }
    },
    8306: (t, e, i) => {
      i.d(e, { II: () => h, cc: () => l, v_: () => c });
      var s = i(9382),
        r = i(4189),
        n = i(3298),
        a = i(7133),
        o = i(9950);
      function u(t) {
        return Math.min(1e3 * 2 ** t, 3e4);
      }
      function c(t) {
        return (t ?? 'online') !== 'online' || r.t.isOnline();
      }
      var l = class extends Error {
        constructor(t) {
          (super('CancelledError'), (this.revert = t?.revert), (this.silent = t?.silent));
        }
      };
      function h(t) {
        let e,
          i = !1,
          h = 0,
          d = (0, n.T)(),
          f = () => s.m.isFocused() && ('always' === t.networkMode || r.t.isOnline()) && t.canRun(),
          p = () => c(t.networkMode) && t.canRun(),
          y = (t) => {
            'pending' === d.status && (e?.(), d.resolve(t));
          },
          v = (t) => {
            'pending' === d.status && (e?.(), d.reject(t));
          },
          m = () =>
            new Promise((i) => {
              ((e = (t) => {
                ('pending' !== d.status || f()) && i(t);
              }),
                t.onPause?.());
            }).then(() => {
              ((e = void 0), 'pending' === d.status && t.onContinue?.());
            }),
          b = () => {
            let e;
            if ('pending' !== d.status) return;
            let s = 0 === h ? t.initialPromise : void 0;
            try {
              e = s ?? t.fn();
            } catch (t) {
              e = Promise.reject(t);
            }
            Promise.resolve(e)
              .then(y)
              .catch((e) => {
                if ('pending' !== d.status) return;
                let s = t.retry ?? 3 * !a.H.isServer(),
                  r = t.retryDelay ?? u,
                  n = 'function' == typeof r ? r(h, e) : r,
                  c =
                    !0 === s ||
                    ('number' == typeof s && h < s) ||
                    ('function' == typeof s && s(h, e));
                if (i || !c) return void v(e);
                (h++,
                  t.onFail?.(h, e),
                  (0, o.yy)(n)
                    .then(() => (f() ? void 0 : m()))
                    .then(() => {
                      i ? v(e) : b();
                    }));
              });
          };
        return {
          promise: d,
          status: () => d.status,
          cancel: (e) => {
            if ('pending' === d.status) {
              let i = new l(e);
              (v(i), t.onCancel?.(i));
            }
          },
          continue: () => (e?.(), d),
          cancelRetry: () => {
            i = !0;
          },
          continueRetry: () => {
            i = !1;
          },
          canStart: p,
          start: () => (p() ? b() : m().then(b), d),
        };
      }
    },
    8458: (t, e, i) => {
      i.d(e, { k: () => a });
      var s = i(8811),
        r = i(7133),
        n = i(9950),
        a = class {
          #d;
          destroy() {
            this.clearGcTimeout();
          }
          scheduleGc() {
            (this.clearGcTimeout(),
              (0, n.gn)(this.gcTime) &&
                (this.#d = s.zs.setTimeout(() => {
                  this.optionalRemove();
                }, this.gcTime)));
          }
          updateGcTime(t) {
            this.gcTime = Math.max(this.gcTime || 0, t ?? (r.H.isServer() ? 1 / 0 : 3e5));
          }
          clearGcTimeout() {
            void 0 !== this.#d && (s.zs.clearTimeout(this.#d), (this.#d = void 0));
          }
        };
    },
    8811: (t, e, i) => {
      i.d(e, { Zq: () => n, zs: () => r });
      var s = {
          setTimeout: (t, e) => setTimeout(t, e),
          clearTimeout: (t) => clearTimeout(t),
          setInterval: (t, e) => setInterval(t, e),
          clearInterval: (t) => clearInterval(t),
        },
        r = new (class {
          #f = s;
          #p = !1;
          setTimeoutProvider(t) {
            this.#f = t;
          }
          setTimeout(t, e) {
            return this.#f.setTimeout(t, e);
          }
          clearTimeout(t) {
            this.#f.clearTimeout(t);
          }
          setInterval(t, e) {
            return this.#f.setInterval(t, e);
          }
          clearInterval(t) {
            this.#f.clearInterval(t);
          }
        })();
      function n(t) {
        setTimeout(t, 0);
      }
    },
    9382: (t, e, i) => {
      i.d(e, { m: () => r });
      var s = i(2844),
        r = new (class extends s.Q {
          #y;
          #e;
          #i;
          constructor() {
            (super(),
              (this.#i = (t) => {
                if ('undefined' != typeof window && window.addEventListener) {
                  let e = () => t();
                  return (
                    window.addEventListener('visibilitychange', e, !1),
                    () => {
                      window.removeEventListener('visibilitychange', e);
                    }
                  );
                }
              }));
          }
          onSubscribe() {
            this.#e || this.setEventListener(this.#i);
          }
          onUnsubscribe() {
            this.hasListeners() || (this.#e?.(), (this.#e = void 0));
          }
          setEventListener(t) {
            ((this.#i = t),
              this.#e?.(),
              (this.#e = t((t) => {
                'boolean' == typeof t ? this.setFocused(t) : this.onFocus();
              })));
          }
          setFocused(t) {
            this.#y !== t && ((this.#y = t), this.onFocus());
          }
          onFocus() {
            let t = this.isFocused();
            this.listeners.forEach((e) => {
              e(t);
            });
          }
          isFocused() {
            return 'boolean' == typeof this.#y
              ? this.#y
              : globalThis.document?.visibilityState !== 'hidden';
          }
        })();
    },
    9950: (t, e, i) => {
      i.d(e, {
        Cp: () => y,
        EN: () => p,
        Eh: () => l,
        F$: () => f,
        GU: () => E,
        MK: () => h,
        S$: () => r,
        ZM: () => T,
        ZZ: () => C,
        Zw: () => a,
        d2: () => c,
        f8: () => m,
        gn: () => o,
        hT: () => j,
        j3: () => u,
        lQ: () => n,
        nJ: () => d,
        ox: () => I,
        pl: () => O,
        y9: () => F,
        yy: () => w,
      });
      var s = i(8811),
        r = 'undefined' == typeof window || 'Deno' in globalThis;
      function n() {}
      function a(t, e) {
        return 'function' == typeof t ? t(e) : t;
      }
      function o(t) {
        return 'number' == typeof t && t >= 0 && t !== 1 / 0;
      }
      function u(t, e) {
        return Math.max(t + (e || 0) - Date.now(), 0);
      }
      function c(t, e) {
        return 'function' == typeof t ? t(e) : t;
      }
      function l(t, e) {
        return 'function' == typeof t ? t(e) : t;
      }
      function h(t, e) {
        let { type: i = 'all', exact: s, fetchStatus: r, predicate: n, queryKey: a, stale: o } = t;
        if (a) {
          if (s) {
            if (e.queryHash !== f(a, e.options)) return !1;
          } else if (!y(e.queryKey, a)) return !1;
        }
        if ('all' !== i) {
          let t = e.isActive();
          if (('active' === i && !t) || ('inactive' === i && t)) return !1;
        }
        return (
          ('boolean' != typeof o || e.isStale() === o) &&
          (!r || r === e.state.fetchStatus) &&
          (!n || !!n(e))
        );
      }
      function d(t, e) {
        let { exact: i, status: s, predicate: r, mutationKey: n } = t;
        if (n) {
          if (!e.options.mutationKey) return !1;
          if (i) {
            if (p(e.options.mutationKey) !== p(n)) return !1;
          } else if (!y(e.options.mutationKey, n)) return !1;
        }
        return (!s || e.state.status === s) && (!r || !!r(e));
      }
      function f(t, e) {
        return (e?.queryKeyHashFn || p)(t);
      }
      function p(t) {
        return JSON.stringify(t, (t, e) =>
          g(e)
            ? Object.keys(e)
                .sort()
                .reduce((t, i) => ((t[i] = e[i]), t), {})
            : e,
        );
      }
      function y(t, e) {
        return (
          t === e ||
          (typeof t == typeof e &&
            !!t &&
            !!e &&
            'object' == typeof t &&
            'object' == typeof e &&
            Object.keys(e).every((i) => y(t[i], e[i])))
        );
      }
      var v = Object.prototype.hasOwnProperty;
      function m(t, e) {
        if (!e || Object.keys(t).length !== Object.keys(e).length) return !1;
        for (let i in t) if (t[i] !== e[i]) return !1;
        return !0;
      }
      function b(t) {
        return Array.isArray(t) && t.length === Object.keys(t).length;
      }
      function g(t) {
        if (!S(t)) return !1;
        let e = t.constructor;
        if (void 0 === e) return !0;
        let i = e.prototype;
        return (
          !!S(i) &&
          !!i.hasOwnProperty('isPrototypeOf') &&
          Object.getPrototypeOf(t) === Object.prototype
        );
      }
      function S(t) {
        return '[object Object]' === Object.prototype.toString.call(t);
      }
      function w(t) {
        return new Promise((e) => {
          s.zs.setTimeout(e, t);
        });
      }
      function O(t, e, i) {
        return 'function' == typeof i.structuralSharing
          ? i.structuralSharing(t, e)
          : !1 !== i.structuralSharing
            ? (function t(e, i, s = 0) {
                if (e === i) return e;
                if (s > 500) return i;
                let r = b(e) && b(i);
                if (!r && !(g(e) && g(i))) return i;
                let n = (r ? e : Object.keys(e)).length,
                  a = r ? i : Object.keys(i),
                  o = a.length,
                  u = r ? Array(o) : {},
                  c = 0;
                for (let l = 0; l < o; l++) {
                  let o = r ? l : a[l],
                    h = e[o],
                    d = i[o];
                  if (h === d) {
                    ((u[o] = h), (r ? l < n : v.call(e, o)) && c++);
                    continue;
                  }
                  if (null === h || null === d || 'object' != typeof h || 'object' != typeof d) {
                    u[o] = d;
                    continue;
                  }
                  let f = t(h, d, s + 1);
                  ((u[o] = f), f === h && c++);
                }
                return n === o && c === n ? e : u;
              })(t, e)
            : e;
      }
      function F(t, e, i = 0) {
        let s = [...t, e];
        return i && s.length > i ? s.slice(1) : s;
      }
      function C(t, e, i = 0) {
        let s = [e, ...t];
        return i && s.length > i ? s.slice(0, -1) : s;
      }
      var j = Symbol();
      function T(t, e) {
        return !t.queryFn && e?.initialPromise
          ? () => e.initialPromise
          : t.queryFn && t.queryFn !== j
            ? t.queryFn
            : () => Promise.reject(Error(`Missing queryFn: '${t.queryHash}'`));
      }
      function E(t, e) {
        return 'function' == typeof t ? t(...e) : !!t;
      }
      function I(t, e, i) {
        let s,
          r = !1;
        return (
          Object.defineProperty(t, 'signal', {
            enumerable: !0,
            get: () => (
              (s ??= e()),
              r || ((r = !0), s.aborted ? i() : s.addEventListener('abort', i, { once: !0 })),
              s
            ),
          }),
          t
        );
      }
    },
  },
]);
