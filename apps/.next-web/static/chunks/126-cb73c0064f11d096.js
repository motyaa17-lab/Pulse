'use strict';
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [126],
  {
    730: (t, e, s) => {
      s.d(e, { $: () => l, s: () => o });
      var i = s(5635),
        n = s(8458),
        r = s(8306),
        o = class extends n.k {
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
              (this.state = t.state || l()),
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
      function l() {
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
      s.d(e, { n: () => u });
      var i = s(7620),
        n = s(730),
        r = s(5635),
        o = s(2844),
        l = s(9950),
        a = class extends o.Q {
          #t;
          #r = void 0;
          #o;
          #l;
          constructor(t, e) {
            (super(), (this.#t = t), this.setOptions(e), this.bindMethods(), this.#a());
          }
          bindMethods() {
            ((this.mutate = this.mutate.bind(this)), (this.reset = this.reset.bind(this)));
          }
          setOptions(t) {
            let e = this.options;
            ((this.options = this.#t.defaultMutationOptions(t)),
              (0, l.f8)(this.options, e) ||
                this.#t
                  .getMutationCache()
                  .notify({ type: 'observerOptionsUpdated', mutation: this.#o, observer: this }),
              e?.mutationKey &&
              this.options.mutationKey &&
              (0, l.EN)(e.mutationKey) !== (0, l.EN)(this.options.mutationKey)
                ? this.reset()
                : this.#o?.state.status === 'pending' && this.#o.setOptions(this.options));
          }
          onUnsubscribe() {
            this.hasListeners() || this.#o?.removeObserver(this);
          }
          onMutationUpdate(t) {
            (this.#a(), this.#h(t));
          }
          getCurrentResult() {
            return this.#r;
          }
          reset() {
            (this.#o?.removeObserver(this), (this.#o = void 0), this.#a(), this.#h());
          }
          mutate(t, e) {
            return (
              (this.#l = e),
              this.#o?.removeObserver(this),
              (this.#o = this.#t.getMutationCache().build(this.#t, this.options)),
              this.#o.addObserver(this),
              this.#o.execute(t)
            );
          }
          #a() {
            let t = this.#o?.state ?? (0, n.$)();
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
          #h(t) {
            r.jG.batch(() => {
              if (this.#l && this.hasListeners()) {
                let e = this.#r.variables,
                  s = this.#r.context,
                  i = {
                    client: this.#t,
                    meta: this.options.meta,
                    mutationKey: this.options.mutationKey,
                  };
                if (t?.type === 'success') {
                  try {
                    this.#l.onSuccess?.(t.data, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#l.onSettled?.(t.data, null, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                } else if (t?.type === 'error') {
                  try {
                    this.#l.onError?.(t.error, e, s, i);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#l.onSettled?.(void 0, t.error, e, s, i);
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
        h = s(4869);
      function u(t, e) {
        let s = (0, h.jE)(e),
          [n] = i.useState(() => new a(s, t));
        i.useEffect(() => {
          n.setOptions(t);
        }, [n, t]);
        let o = i.useSyncExternalStore(
            i.useCallback((t) => n.subscribe(r.jG.batchCalls(t)), [n]),
            () => n.getCurrentResult(),
            () => n.getCurrentResult(),
          ),
          u = i.useCallback(
            (t, e) => {
              n.mutate(t, e).catch(l.lQ);
            },
            [n],
          );
        if (o.error && (0, l.GU)(n.options.throwOnError, [o.error])) throw o.error;
        return { ...o, mutate: u, mutateAsync: o.mutate };
      }
    },
    5913: (t, e, s) => {
      s.d(e, { Te: () => S });
      var i = s(7620),
        n = s(7509);
      function r(t, e, s) {
        let i,
          n = s.initialDeps ?? [],
          r = !0;
        function o() {
          var o, l, a;
          let h, u;
          s.key && (null == (o = s.debug) ? void 0 : o.call(s)) && (h = Date.now());
          let c = t();
          if (!(c.length !== n.length || c.some((t, e) => n[e] !== t))) return i;
          if (
            ((n = c),
            s.key && (null == (l = s.debug) ? void 0 : l.call(s)) && (u = Date.now()),
            (i = e(...c)),
            s.key && (null == (a = s.debug) ? void 0 : a.call(s)))
          ) {
            let t = Math.round((Date.now() - h) * 100) / 100,
              e = Math.round((Date.now() - u) * 100) / 100,
              i = e / 16,
              n = (t, e) => {
                for (t = String(t); t.length < e; ) t = ' ' + t;
                return t;
              };
            console.info(
              `%c⏱ ${n(e, 5)} /${n(t, 5)} ms`,
              `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * i, 120))}deg 100% 31%);`,
              null == s ? void 0 : s.key,
            );
          }
          return (
            (null == s ? void 0 : s.onChange) && !(r && s.skipInitialOnChange) && s.onChange(i),
            (r = !1),
            i
          );
        }
        return (
          (o.updateDeps = (t) => {
            n = t;
          }),
          o
        );
      }
      function o(t, e) {
        if (void 0 !== t) return t;
        throw Error(`Unexpected undefined${e ? `: ${e}` : ''}`);
      }
      let l = (t) => {
          let { offsetWidth: e, offsetHeight: s } = t;
          return { width: e, height: s };
        },
        a = (t) => t,
        h = (t) => {
          let e = Math.max(t.startIndex - t.overscan, 0),
            s = Math.min(t.endIndex + t.overscan, t.count - 1),
            i = [];
          for (let t = e; t <= s; t++) i.push(t);
          return i;
        },
        u = (t, e) => {
          let s = t.scrollElement;
          if (!s) return;
          let i = t.targetWindow;
          if (!i) return;
          let n = (t) => {
            let { width: s, height: i } = t;
            e({ width: Math.round(s), height: Math.round(i) });
          };
          if ((n(l(s)), !i.ResizeObserver)) return () => {};
          let r = new i.ResizeObserver((e) => {
            let i = () => {
              let t = e[0];
              if (null == t ? void 0 : t.borderBoxSize) {
                let e = t.borderBoxSize[0];
                if (e) return void n({ width: e.inlineSize, height: e.blockSize });
              }
              n(l(s));
            };
            t.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(i) : i();
          });
          return (
            r.observe(s, { box: 'border-box' }),
            () => {
              r.unobserve(s);
            }
          );
        },
        c = { passive: !0 },
        d = 'undefined' == typeof window || 'onscrollend' in window,
        m = (t, e) => {
          let s = t.scrollElement;
          if (!s) return;
          let i = t.targetWindow;
          if (!i) return;
          let n = 0,
            r =
              t.options.useScrollendEvent && d
                ? () => void 0
                : ((t, e, s) => {
                    let i;
                    return function (...n) {
                      (t.clearTimeout(i), (i = t.setTimeout(() => e.apply(this, n), s)));
                    };
                  })(
                    i,
                    () => {
                      e(n, !1);
                    },
                    t.options.isScrollingResetDelay,
                  ),
            o = (i) => () => {
              let { horizontal: o, isRtl: l } = t.options;
              ((n = o ? s.scrollLeft * ((l && -1) || 1) : s.scrollTop), r(), e(n, i));
            },
            l = o(!0),
            a = o(!1);
          s.addEventListener('scroll', l, c);
          let h = t.options.useScrollendEvent && d;
          return (
            h && s.addEventListener('scrollend', a, c),
            () => {
              (s.removeEventListener('scroll', l), h && s.removeEventListener('scrollend', a));
            }
          );
        },
        f = (t, e, s) => {
          if (null == e ? void 0 : e.borderBoxSize) {
            let t = e.borderBoxSize[0];
            if (t) return Math.round(t[s.options.horizontal ? 'inlineSize' : 'blockSize']);
          }
          return t[s.options.horizontal ? 'offsetWidth' : 'offsetHeight'];
        },
        g = (t, { adjustments: e = 0, behavior: s }, i) => {
          var n, r;
          null == (r = null == (n = i.scrollElement) ? void 0 : n.scrollTo) ||
            r.call(n, { [i.options.horizontal ? 'left' : 'top']: t + e, behavior: s });
        };
      class p {
        constructor(t) {
          ((this.unsubs = []),
            (this.scrollElement = null),
            (this.targetWindow = null),
            (this.isScrolling = !1),
            (this.scrollState = null),
            (this.measurementsCache = []),
            (this.itemSizeCache = new Map()),
            (this.laneAssignments = new Map()),
            (this.pendingMeasuredCacheIndexes = []),
            (this.prevLanes = void 0),
            (this.lanesChangedFlag = !1),
            (this.lanesSettling = !1),
            (this.scrollRect = null),
            (this.scrollOffset = null),
            (this.scrollDirection = null),
            (this.scrollAdjustments = 0),
            (this.elementsCache = new Map()),
            (this.now = () => {
              var t, e, s;
              return (
                (null ==
                (s =
                  null == (e = null == (t = this.targetWindow) ? void 0 : t.performance)
                    ? void 0
                    : e.now)
                  ? void 0
                  : s.call(e)) ?? Date.now()
              );
            }),
            (this.observer = (() => {
              let t = null,
                e = () =>
                  t ||
                  (this.targetWindow && this.targetWindow.ResizeObserver
                    ? (t = new this.targetWindow.ResizeObserver((t) => {
                        t.forEach((t) => {
                          let e = () => {
                            let e = t.target,
                              s = this.indexFromElement(e);
                            if (!e.isConnected) return void this.observer.unobserve(e);
                            this.shouldMeasureDuringScroll(s) &&
                              this.resizeItem(s, this.options.measureElement(e, t, this));
                          };
                          this.options.useAnimationFrameWithResizeObserver
                            ? requestAnimationFrame(e)
                            : e();
                        });
                      }))
                    : null);
              return {
                disconnect: () => {
                  var s;
                  (null == (s = e()) || s.disconnect(), (t = null));
                },
                observe: (t) => {
                  var s;
                  return null == (s = e()) ? void 0 : s.observe(t, { box: 'border-box' });
                },
                unobserve: (t) => {
                  var s;
                  return null == (s = e()) ? void 0 : s.unobserve(t);
                },
              };
            })()),
            (this.range = null),
            (this.setOptions = (t) => {
              (Object.entries(t).forEach(([e, s]) => {
                void 0 === s && delete t[e];
              }),
                (this.options = {
                  debug: !1,
                  initialOffset: 0,
                  overscan: 1,
                  paddingStart: 0,
                  paddingEnd: 0,
                  scrollPaddingStart: 0,
                  scrollPaddingEnd: 0,
                  horizontal: !1,
                  getItemKey: a,
                  rangeExtractor: h,
                  onChange: () => {},
                  measureElement: f,
                  initialRect: { width: 0, height: 0 },
                  scrollMargin: 0,
                  gap: 0,
                  indexAttribute: 'data-index',
                  initialMeasurementsCache: [],
                  lanes: 1,
                  isScrollingResetDelay: 150,
                  enabled: !0,
                  isRtl: !1,
                  useScrollendEvent: !1,
                  useAnimationFrameWithResizeObserver: !1,
                  ...t,
                }));
            }),
            (this.notify = (t) => {
              var e, s;
              null == (s = (e = this.options).onChange) || s.call(e, this, t);
            }),
            (this.maybeNotify = r(
              () => (
                this.calculateRange(),
                [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ]
              ),
              (t) => {
                this.notify(t);
              },
              {
                key: !1,
                debug: () => this.options.debug,
                initialDeps: [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ],
              },
            )),
            (this.cleanup = () => {
              (this.unsubs.filter(Boolean).forEach((t) => t()),
                (this.unsubs = []),
                this.observer.disconnect(),
                null != this.rafId &&
                  this.targetWindow &&
                  (this.targetWindow.cancelAnimationFrame(this.rafId), (this.rafId = null)),
                (this.scrollState = null),
                (this.scrollElement = null),
                (this.targetWindow = null));
            }),
            (this._didMount = () => () => {
              this.cleanup();
            }),
            (this._willUpdate = () => {
              var t;
              let e = this.options.enabled ? this.options.getScrollElement() : null;
              if (this.scrollElement !== e) {
                if ((this.cleanup(), !e)) return void this.maybeNotify();
                ((this.scrollElement = e),
                  this.scrollElement && 'ownerDocument' in this.scrollElement
                    ? (this.targetWindow = this.scrollElement.ownerDocument.defaultView)
                    : (this.targetWindow =
                        (null == (t = this.scrollElement) ? void 0 : t.window) ?? null),
                  this.elementsCache.forEach((t) => {
                    this.observer.observe(t);
                  }),
                  this.unsubs.push(
                    this.options.observeElementRect(this, (t) => {
                      ((this.scrollRect = t), this.maybeNotify());
                    }),
                  ),
                  this.unsubs.push(
                    this.options.observeElementOffset(this, (t, e) => {
                      ((this.scrollAdjustments = 0),
                        (this.scrollDirection = e
                          ? this.getScrollOffset() < t
                            ? 'forward'
                            : 'backward'
                          : null),
                        (this.scrollOffset = t),
                        (this.isScrolling = e),
                        this.scrollState && this.scheduleScrollReconcile(),
                        this.maybeNotify());
                    }),
                  ),
                  this._scrollToOffset(this.getScrollOffset(), {
                    adjustments: void 0,
                    behavior: void 0,
                  }));
              }
            }),
            (this.rafId = null),
            (this.getSize = () =>
              this.options.enabled
                ? ((this.scrollRect = this.scrollRect ?? this.options.initialRect),
                  this.scrollRect[this.options.horizontal ? 'width' : 'height'])
                : ((this.scrollRect = null), 0)),
            (this.getScrollOffset = () =>
              this.options.enabled
                ? ((this.scrollOffset =
                    this.scrollOffset ??
                    ('function' == typeof this.options.initialOffset
                      ? this.options.initialOffset()
                      : this.options.initialOffset)),
                  this.scrollOffset)
                : ((this.scrollOffset = null), 0)),
            (this.getFurthestMeasurement = (t, e) => {
              let s = new Map(),
                i = new Map();
              for (let n = e - 1; n >= 0; n--) {
                let e = t[n];
                if (s.has(e.lane)) continue;
                let r = i.get(e.lane);
                if (
                  (null == r || e.end > r.end
                    ? i.set(e.lane, e)
                    : e.end < r.end && s.set(e.lane, !0),
                  s.size === this.options.lanes)
                )
                  break;
              }
              return i.size === this.options.lanes
                ? Array.from(i.values()).sort((t, e) =>
                    t.end === e.end ? t.index - e.index : t.end - e.end,
                  )[0]
                : void 0;
            }),
            (this.getMeasurementOptions = r(
              () => [
                this.options.count,
                this.options.paddingStart,
                this.options.scrollMargin,
                this.options.getItemKey,
                this.options.enabled,
                this.options.lanes,
              ],
              (t, e, s, i, n, r) => (
                void 0 !== this.prevLanes && this.prevLanes !== r && (this.lanesChangedFlag = !0),
                (this.prevLanes = r),
                (this.pendingMeasuredCacheIndexes = []),
                { count: t, paddingStart: e, scrollMargin: s, getItemKey: i, enabled: n, lanes: r }
              ),
              { key: !1 },
            )),
            (this.getMeasurements = r(
              () => [this.getMeasurementOptions(), this.itemSizeCache],
              (
                { count: t, paddingStart: e, scrollMargin: s, getItemKey: i, enabled: n, lanes: r },
                o,
              ) => {
                if (!n)
                  return (
                    (this.measurementsCache = []),
                    this.itemSizeCache.clear(),
                    this.laneAssignments.clear(),
                    []
                  );
                if (this.laneAssignments.size > t)
                  for (let e of this.laneAssignments.keys())
                    e >= t && this.laneAssignments.delete(e);
                (this.lanesChangedFlag &&
                  ((this.lanesChangedFlag = !1),
                  (this.lanesSettling = !0),
                  (this.measurementsCache = []),
                  this.itemSizeCache.clear(),
                  this.laneAssignments.clear(),
                  (this.pendingMeasuredCacheIndexes = [])),
                  0 !== this.measurementsCache.length ||
                    this.lanesSettling ||
                    ((this.measurementsCache = this.options.initialMeasurementsCache),
                    this.measurementsCache.forEach((t) => {
                      this.itemSizeCache.set(t.key, t.size);
                    })));
                let l = this.lanesSettling
                  ? 0
                  : this.pendingMeasuredCacheIndexes.length > 0
                    ? Math.min(...this.pendingMeasuredCacheIndexes)
                    : 0;
                ((this.pendingMeasuredCacheIndexes = []),
                  this.lanesSettling &&
                    this.measurementsCache.length === t &&
                    (this.lanesSettling = !1));
                let a = this.measurementsCache.slice(0, l),
                  h = Array(r).fill(void 0);
                for (let t = 0; t < l; t++) {
                  let e = a[t];
                  e && (h[e.lane] = t);
                }
                for (let n = l; n < t; n++) {
                  let t,
                    r,
                    l = i(n),
                    u = this.laneAssignments.get(n);
                  if (void 0 !== u && this.options.lanes > 1) {
                    let i = h[(t = u)],
                      n = void 0 !== i ? a[i] : void 0;
                    r = n ? n.end + this.options.gap : e + s;
                  } else {
                    let i = 1 === this.options.lanes ? a[n - 1] : this.getFurthestMeasurement(a, n);
                    ((r = i ? i.end + this.options.gap : e + s),
                      (t = i ? i.lane : n % this.options.lanes),
                      this.options.lanes > 1 && this.laneAssignments.set(n, t));
                  }
                  let c = o.get(l),
                    d = 'number' == typeof c ? c : this.options.estimateSize(n),
                    m = r + d;
                  ((a[n] = { index: n, start: r, size: d, end: m, key: l, lane: t }), (h[t] = n));
                }
                return ((this.measurementsCache = a), a);
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.calculateRange = r(
              () => [
                this.getMeasurements(),
                this.getSize(),
                this.getScrollOffset(),
                this.options.lanes,
              ],
              (t, e, s, i) =>
                (this.range =
                  t.length > 0 && e > 0
                    ? (function ({ measurements: t, outerSize: e, scrollOffset: s, lanes: i }) {
                        let n = t.length - 1;
                        if (t.length <= i) return { startIndex: 0, endIndex: n };
                        let r = v(0, n, (e) => t[e].start, s),
                          o = r;
                        if (1 === i) for (; o < n && t[o].end < s + e; ) o++;
                        else if (i > 1) {
                          let l = Array(i).fill(0);
                          for (; o < n && l.some((t) => t < s + e); ) {
                            let e = t[o];
                            ((l[e.lane] = e.end), o++);
                          }
                          let a = Array(i).fill(s + e);
                          for (; r >= 0 && a.some((t) => t >= s); ) {
                            let e = t[r];
                            ((a[e.lane] = e.start), r--);
                          }
                          ((r = Math.max(0, r - (r % i))),
                            (o = Math.min(n, o + (i - 1 - (o % i)))));
                        }
                        return { startIndex: r, endIndex: o };
                      })({ measurements: t, outerSize: e, scrollOffset: s, lanes: i })
                    : null),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualIndexes = r(
              () => {
                let t = null,
                  e = null,
                  s = this.calculateRange();
                return (
                  s && ((t = s.startIndex), (e = s.endIndex)),
                  this.maybeNotify.updateDeps([this.isScrolling, t, e]),
                  [this.options.rangeExtractor, this.options.overscan, this.options.count, t, e]
                );
              },
              (t, e, s, i, n) =>
                null === i || null === n
                  ? []
                  : t({ startIndex: i, endIndex: n, overscan: e, count: s }),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.indexFromElement = (t) => {
              let e = this.options.indexAttribute,
                s = t.getAttribute(e);
              return s
                ? parseInt(s, 10)
                : (console.warn(`Missing attribute name '${e}={index}' on measured element.`), -1);
            }),
            (this.shouldMeasureDuringScroll = (t) => {
              var e;
              if (!this.scrollState || 'smooth' !== this.scrollState.behavior) return !0;
              let s =
                this.scrollState.index ??
                (null == (e = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))
                  ? void 0
                  : e.index);
              if (void 0 !== s && this.range) {
                let e = Math.max(
                    this.options.overscan,
                    Math.ceil((this.range.endIndex - this.range.startIndex) / 2),
                  ),
                  i = Math.max(0, s - e),
                  n = Math.min(this.options.count - 1, s + e);
                return t >= i && t <= n;
              }
              return !0;
            }),
            (this.measureElement = (t) => {
              if (!t)
                return void this.elementsCache.forEach((t, e) => {
                  t.isConnected || (this.observer.unobserve(t), this.elementsCache.delete(e));
                });
              let e = this.indexFromElement(t),
                s = this.options.getItemKey(e),
                i = this.elementsCache.get(s);
              (i !== t &&
                (i && this.observer.unobserve(i),
                this.observer.observe(t),
                this.elementsCache.set(s, t)),
                (!this.isScrolling || this.scrollState) &&
                  this.shouldMeasureDuringScroll(e) &&
                  this.resizeItem(e, this.options.measureElement(t, void 0, this)));
            }),
            (this.resizeItem = (t, e) => {
              var s;
              let i = this.measurementsCache[t];
              if (!i) return;
              let n = e - (this.itemSizeCache.get(i.key) ?? i.size);
              0 !== n &&
                ((null == (s = this.scrollState) ? void 0 : s.behavior) !== 'smooth' &&
                  (void 0 !== this.shouldAdjustScrollPositionOnItemSizeChange
                    ? this.shouldAdjustScrollPositionOnItemSizeChange(i, n, this)
                    : i.start < this.getScrollOffset() + this.scrollAdjustments) &&
                  this._scrollToOffset(this.getScrollOffset(), {
                    adjustments: (this.scrollAdjustments += n),
                    behavior: void 0,
                  }),
                this.pendingMeasuredCacheIndexes.push(i.index),
                (this.itemSizeCache = new Map(this.itemSizeCache.set(i.key, e))),
                this.notify(!1));
            }),
            (this.getVirtualItems = r(
              () => [this.getVirtualIndexes(), this.getMeasurements()],
              (t, e) => {
                let s = [];
                for (let i = 0, n = t.length; i < n; i++) {
                  let n = e[t[i]];
                  s.push(n);
                }
                return s;
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualItemForOffset = (t) => {
              let e = this.getMeasurements();
              if (0 !== e.length) return o(e[v(0, e.length - 1, (t) => o(e[t]).start, t)]);
            }),
            (this.getMaxScrollOffset = () => {
              if (!this.scrollElement) return 0;
              if ('scrollHeight' in this.scrollElement)
                return this.options.horizontal
                  ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
                  : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
              {
                let t = this.scrollElement.document.documentElement;
                return this.options.horizontal
                  ? t.scrollWidth - this.scrollElement.innerWidth
                  : t.scrollHeight - this.scrollElement.innerHeight;
              }
            }),
            (this.getOffsetForAlignment = (t, e, s = 0) => {
              if (!this.scrollElement) return 0;
              let i = this.getSize(),
                n = this.getScrollOffset();
              return (
                'auto' === e && (e = t >= n + i ? 'end' : 'start'),
                'center' === e ? (t += (s - i) / 2) : 'end' === e && (t -= i),
                Math.max(Math.min(this.getMaxScrollOffset(), t), 0)
              );
            }),
            (this.getOffsetForIndex = (t, e = 'auto') => {
              t = Math.max(0, Math.min(t, this.options.count - 1));
              let s = this.getSize(),
                i = this.getScrollOffset(),
                n = this.measurementsCache[t];
              if (!n) return;
              if ('auto' === e)
                if (n.end >= i + s - this.options.scrollPaddingEnd) e = 'end';
                else {
                  if (!(n.start <= i + this.options.scrollPaddingStart)) return [i, e];
                  e = 'start';
                }
              if ('end' === e && t === this.options.count - 1)
                return [this.getMaxScrollOffset(), e];
              let r =
                'end' === e
                  ? n.end + this.options.scrollPaddingEnd
                  : n.start - this.options.scrollPaddingStart;
              return [this.getOffsetForAlignment(r, e, n.size), e];
            }),
            (this.scrollToOffset = (t, { align: e = 'start', behavior: s = 'auto' } = {}) => {
              let i = this.getOffsetForAlignment(t, e),
                n = this.now();
              ((this.scrollState = {
                index: null,
                align: e,
                behavior: s,
                startedAt: n,
                lastTargetOffset: i,
                stableFrames: 0,
              }),
                this._scrollToOffset(i, { adjustments: void 0, behavior: s }),
                this.scheduleScrollReconcile());
            }),
            (this.scrollToIndex = (t, { align: e = 'auto', behavior: s = 'auto' } = {}) => {
              t = Math.max(0, Math.min(t, this.options.count - 1));
              let i = this.getOffsetForIndex(t, e);
              if (!i) return;
              let [n, r] = i,
                o = this.now();
              ((this.scrollState = {
                index: t,
                align: r,
                behavior: s,
                startedAt: o,
                lastTargetOffset: n,
                stableFrames: 0,
              }),
                this._scrollToOffset(n, { adjustments: void 0, behavior: s }),
                this.scheduleScrollReconcile());
            }),
            (this.scrollBy = (t, { behavior: e = 'auto' } = {}) => {
              let s = this.getScrollOffset() + t,
                i = this.now();
              ((this.scrollState = {
                index: null,
                align: 'start',
                behavior: e,
                startedAt: i,
                lastTargetOffset: s,
                stableFrames: 0,
              }),
                this._scrollToOffset(s, { adjustments: void 0, behavior: e }),
                this.scheduleScrollReconcile());
            }),
            (this.getTotalSize = () => {
              var t;
              let e,
                s = this.getMeasurements();
              if (0 === s.length) e = this.options.paddingStart;
              else if (1 === this.options.lanes)
                e = (null == (t = s[s.length - 1]) ? void 0 : t.end) ?? 0;
              else {
                let t = Array(this.options.lanes).fill(null),
                  i = s.length - 1;
                for (; i >= 0 && t.some((t) => null === t); ) {
                  let e = s[i];
                  (null === t[e.lane] && (t[e.lane] = e.end), i--);
                }
                e = Math.max(...t.filter((t) => null !== t));
              }
              return Math.max(e - this.options.scrollMargin + this.options.paddingEnd, 0);
            }),
            (this._scrollToOffset = (t, { adjustments: e, behavior: s }) => {
              this.options.scrollToFn(t, { behavior: s, adjustments: e }, this);
            }),
            (this.measure = () => {
              ((this.itemSizeCache = new Map()),
                (this.laneAssignments = new Map()),
                this.notify(!1));
            }),
            this.setOptions(t));
        }
        scheduleScrollReconcile() {
          if (!this.targetWindow) {
            this.scrollState = null;
            return;
          }
          null == this.rafId &&
            (this.rafId = this.targetWindow.requestAnimationFrame(() => {
              ((this.rafId = null), this.reconcileScroll());
            }));
        }
        reconcileScroll() {
          if (!this.scrollState || !this.scrollElement) return;
          if (this.now() - this.scrollState.startedAt > 5e3) {
            this.scrollState = null;
            return;
          }
          let t =
              null != this.scrollState.index
                ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align)
                : void 0,
            e = t ? t[0] : this.scrollState.lastTargetOffset,
            s = e !== this.scrollState.lastTargetOffset;
          if (!s && 1.01 > Math.abs(e - this.getScrollOffset())) {
            if ((this.scrollState.stableFrames++, this.scrollState.stableFrames >= 1)) {
              this.scrollState = null;
              return;
            }
          } else
            ((this.scrollState.stableFrames = 0),
              s &&
                ((this.scrollState.lastTargetOffset = e),
                (this.scrollState.behavior = 'auto'),
                this._scrollToOffset(e, { adjustments: void 0, behavior: 'auto' })));
          this.scheduleScrollReconcile();
        }
      }
      let v = (t, e, s, i) => {
          for (; t <= e; ) {
            let n = ((t + e) / 2) | 0,
              r = s(n);
            if (r < i) t = n + 1;
            else {
              if (!(r > i)) return n;
              e = n - 1;
            }
          }
          return t > 0 ? t - 1 : 0;
        },
        b = 'undefined' != typeof document ? i.useLayoutEffect : i.useEffect;
      function S(t) {
        return (function ({ useFlushSync: t = !0, ...e }) {
          let s = i.useReducer(() => ({}), {})[1],
            r = {
              ...e,
              onChange: (i, r) => {
                var o;
                (t && r ? (0, n.flushSync)(s) : s(), null == (o = e.onChange) || o.call(e, i, r));
              },
            },
            [o] = i.useState(() => new p(r));
          return (o.setOptions(r), b(() => o._didMount(), []), b(() => o._willUpdate()), o);
        })({ observeElementRect: u, observeElementOffset: m, scrollToFn: g, ...t });
      }
    },
  },
]);
