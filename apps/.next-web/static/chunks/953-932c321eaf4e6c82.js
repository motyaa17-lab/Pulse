'use strict';
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [953],
  {
    421: (t, e, r) => {
      r.d(e, { T: () => n });
      let n = (0, r(7620).createContext)(null);
    },
    730: (t, e, r) => {
      r.d(e, { $: () => u, s: () => o });
      var n = r(5635),
        i = r(8458),
        s = r(8306),
        o = class extends i.k {
          #t;
          #e;
          #r;
          #n;
          constructor(t) {
            (super(),
              (this.#t = t.client),
              (this.mutationId = t.mutationId),
              (this.#r = t.mutationCache),
              (this.#e = []),
              (this.state = t.state || u()),
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
              this.#r.notify({ type: 'observerAdded', mutation: this, observer: t }));
          }
          removeObserver(t) {
            ((this.#e = this.#e.filter((e) => e !== t)),
              this.scheduleGc(),
              this.#r.notify({ type: 'observerRemoved', mutation: this, observer: t }));
          }
          optionalRemove() {
            this.#e.length ||
              ('pending' === this.state.status ? this.scheduleGc() : this.#r.remove(this));
          }
          continue() {
            return this.#n?.continue() ?? this.execute(this.state.variables);
          }
          async execute(t) {
            let e = () => {
                this.#i({ type: 'continue' });
              },
              r = {
                client: this.#t,
                meta: this.options.meta,
                mutationKey: this.options.mutationKey,
              };
            this.#n = (0, s.II)({
              fn: () =>
                this.options.mutationFn
                  ? this.options.mutationFn(t, r)
                  : Promise.reject(Error('No mutationFn found')),
              onFail: (t, e) => {
                this.#i({ type: 'failed', failureCount: t, error: e });
              },
              onPause: () => {
                this.#i({ type: 'pause' });
              },
              onContinue: e,
              retry: this.options.retry ?? 0,
              retryDelay: this.options.retryDelay,
              networkMode: this.options.networkMode,
              canRun: () => this.#r.canRun(this),
            });
            let n = 'pending' === this.state.status,
              i = !this.#n.canStart();
            try {
              if (n) e();
              else {
                (this.#i({ type: 'pending', variables: t, isPaused: i }),
                  this.#r.config.onMutate && (await this.#r.config.onMutate(t, this, r)));
                let e = await this.options.onMutate?.(t, r);
                e !== this.state.context &&
                  this.#i({ type: 'pending', context: e, variables: t, isPaused: i });
              }
              let s = await this.#n.start();
              return (
                await this.#r.config.onSuccess?.(s, t, this.state.context, this, r),
                await this.options.onSuccess?.(s, t, this.state.context, r),
                await this.#r.config.onSettled?.(
                  s,
                  null,
                  this.state.variables,
                  this.state.context,
                  this,
                  r,
                ),
                await this.options.onSettled?.(s, null, t, this.state.context, r),
                this.#i({ type: 'success', data: s }),
                s
              );
            } catch (e) {
              try {
                await this.#r.config.onError?.(e, t, this.state.context, this, r);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onError?.(e, t, this.state.context, r);
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.#r.config.onSettled?.(
                  void 0,
                  e,
                  this.state.variables,
                  this.state.context,
                  this,
                  r,
                );
              } catch (t) {
                Promise.reject(t);
              }
              try {
                await this.options.onSettled?.(void 0, e, t, this.state.context, r);
              } catch (t) {
                Promise.reject(t);
              }
              throw (this.#i({ type: 'error', error: e }), e);
            } finally {
              this.#r.runNext(this);
            }
          }
          #i(t) {
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
              n.jG.batch(() => {
                (this.#e.forEach((e) => {
                  e.onMutationUpdate(t);
                }),
                  this.#r.notify({ mutation: this, type: 'updated', action: t }));
              }));
          }
        };
      function u() {
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
    1562: (t, e, r) => {
      r.d(e, { n: () => c });
      var n = r(7620),
        i = r(730),
        s = r(5635),
        o = r(2844),
        u = r(9950),
        a = class extends o.Q {
          #t;
          #s = void 0;
          #o;
          #u;
          constructor(t, e) {
            (super(), (this.#t = t), this.setOptions(e), this.bindMethods(), this.#a());
          }
          bindMethods() {
            ((this.mutate = this.mutate.bind(this)), (this.reset = this.reset.bind(this)));
          }
          setOptions(t) {
            let e = this.options;
            ((this.options = this.#t.defaultMutationOptions(t)),
              (0, u.f8)(this.options, e) ||
                this.#t
                  .getMutationCache()
                  .notify({ type: 'observerOptionsUpdated', mutation: this.#o, observer: this }),
              e?.mutationKey &&
              this.options.mutationKey &&
              (0, u.EN)(e.mutationKey) !== (0, u.EN)(this.options.mutationKey)
                ? this.reset()
                : this.#o?.state.status === 'pending' && this.#o.setOptions(this.options));
          }
          onUnsubscribe() {
            this.hasListeners() || this.#o?.removeObserver(this);
          }
          onMutationUpdate(t) {
            (this.#a(), this.#l(t));
          }
          getCurrentResult() {
            return this.#s;
          }
          reset() {
            (this.#o?.removeObserver(this), (this.#o = void 0), this.#a(), this.#l());
          }
          mutate(t, e) {
            return (
              (this.#u = e),
              this.#o?.removeObserver(this),
              (this.#o = this.#t.getMutationCache().build(this.#t, this.options)),
              this.#o.addObserver(this),
              this.#o.execute(t)
            );
          }
          #a() {
            let t = this.#o?.state ?? (0, i.$)();
            this.#s = {
              ...t,
              isPending: 'pending' === t.status,
              isSuccess: 'success' === t.status,
              isError: 'error' === t.status,
              isIdle: 'idle' === t.status,
              mutate: this.mutate,
              reset: this.reset,
            };
          }
          #l(t) {
            s.jG.batch(() => {
              if (this.#u && this.hasListeners()) {
                let e = this.#s.variables,
                  r = this.#s.context,
                  n = {
                    client: this.#t,
                    meta: this.options.meta,
                    mutationKey: this.options.mutationKey,
                  };
                if (t?.type === 'success') {
                  try {
                    this.#u.onSuccess?.(t.data, e, r, n);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#u.onSettled?.(t.data, null, e, r, n);
                  } catch (t) {
                    Promise.reject(t);
                  }
                } else if (t?.type === 'error') {
                  try {
                    this.#u.onError?.(t.error, e, r, n);
                  } catch (t) {
                    Promise.reject(t);
                  }
                  try {
                    this.#u.onSettled?.(void 0, t.error, e, r, n);
                  } catch (t) {
                    Promise.reject(t);
                  }
                }
              }
              this.listeners.forEach((t) => {
                t(this.#s);
              });
            });
          }
        },
        l = r(4869);
      function c(t, e) {
        let r = (0, l.jE)(e),
          [i] = n.useState(() => new a(r, t));
        n.useEffect(() => {
          i.setOptions(t);
        }, [i, t]);
        let o = n.useSyncExternalStore(
            n.useCallback((t) => i.subscribe(s.jG.batchCalls(t)), [i]),
            () => i.getCurrentResult(),
            () => i.getCurrentResult(),
          ),
          c = n.useCallback(
            (t, e) => {
              i.mutate(t, e).catch(u.lQ);
            },
            [i],
          );
        if (o.error && (0, u.GU)(i.options.throwOnError, [o.error])) throw o.error;
        return { ...o, mutate: c, mutateAsync: o.mutate };
      }
    },
    7541: (t, e, r) => {
      var n = r(3041);
      (r.o(n, 'useParams') &&
        r.d(e, {
          useParams: function () {
            return n.useParams;
          },
        }),
        r.o(n, 'usePathname') &&
          r.d(e, {
            usePathname: function () {
              return n.usePathname;
            },
          }),
        r.o(n, 'useRouter') &&
          r.d(e, {
            useRouter: function () {
              return n.useRouter;
            },
          }),
        r.o(n, 'useSearchParams') &&
          r.d(e, {
            useSearchParams: function () {
              return n.useSearchParams;
            },
          }));
    },
    7946: (t, e, r) => {
      r.d(e, { N: () => R });
      var n = r(4568),
        i = r(7441),
        s = r(8928),
        o = r(7620),
        u = r(421),
        a = r(4595),
        l = r(3847),
        c = r(4536),
        h = r(9070);
      function d(t) {
        let e = (0, l.M)(() => (0, c.OQ)(t)),
          { isStatic: r } = (0, o.useContext)(h.Q);
        if (r) {
          let [, r] = (0, o.useState)(t);
          (0, o.useEffect)(() => e.on('change', r), []);
        }
        return e;
      }
      var f = r(6733),
        p = r(2081),
        m = r(8683);
      function y(t, e) {
        let r = d(e()),
          n = () => r.set(e());
        return (
          n(),
          (0, m.E)(() => {
            let e = () => p.Gt.preRender(n, !1, !0),
              r = t.map((t) => t.on('change', e));
            return () => {
              (r.forEach((t) => t()), (0, p.WG)(n));
            };
          }),
          r
        );
      }
      function v(t, e) {
        let r = (0, l.M)(() => []);
        return y(t, () => {
          r.length = 0;
          let n = t.length;
          for (let e = 0; e < n; e++) r[e] = t[e].get();
          return e(r);
        });
      }
      let g = new Set(['auto', 'scroll']),
        x = new WeakMap(),
        b = new WeakMap(),
        w = null;
      function C(t, e) {
        let r = t?.parentElement;
        for (; r; ) {
          if (
            (function (t, e) {
              let r = getComputedStyle(t),
                n = 'x' === e ? r.overflowX : r.overflowY,
                i = t === document.body || t === document.documentElement;
              return g.has(n) || i;
            })(r, e)
          )
            return r;
          r = r.parentElement;
        }
        return null;
      }
      function M(t) {
        let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        return (0, i.S)(t) ? t : d(e);
      }
      let R = (0, o.forwardRef)(function (t, e) {
        let {
            children: r,
            style: i = {},
            value: h,
            as: d = 'li',
            onDrag: p,
            onDragEnd: m,
            layout: g = !0,
            ...R
          } = t,
          P = (0, l.M)(() => a.P[d]),
          E = (0, o.useContext)(u.T),
          S = { x: M(i.x), y: M(i.y) },
          O = (function t(e, r, n, i) {
            if ('function' == typeof e) {
              ((c.bt.current = []), e());
              let t = y(c.bt.current, e);
              return ((c.bt.current = void 0), t);
            }
            if (void 0 !== n && !Array.isArray(n) && 'function' != typeof r) {
              var s = e,
                o = r,
                u = n,
                a = i;
              let c = (0, l.M)(() => Object.keys(u)),
                h = (0, l.M)(() => ({}));
              for (let e of c) h[e] = t(s, o, u[e], a);
              return h;
            }
            let h =
                'function' == typeof r
                  ? r
                  : (function (...t) {
                      let e = !Array.isArray(t[0]),
                        r = e ? 0 : -1,
                        n = t[0 + r],
                        i = t[1 + r],
                        s = t[2 + r],
                        o = t[3 + r],
                        u = (0, f.G)(i, s, o);
                      return e ? u(n) : u;
                    })(r, n, i),
              d = Array.isArray(e)
                ? v(e, h)
                : v([e], (t) => {
                    let [e] = t;
                    return h(e);
                  }),
              p = Array.isArray(e) ? void 0 : e.accelerate;
            return (
              p &&
                !p.isTransformed &&
                'function' != typeof r &&
                Array.isArray(n) &&
                (null == i ? void 0 : i.clamp) !== !1 &&
                (d.accelerate = {
                  ...p,
                  times: r,
                  keyframes: n,
                  isTransformed: !0,
                  ...((null == i ? void 0 : i.ease) ? { ease: i.ease } : {}),
                }),
              d
            );
          })([S.x, S.y], (t) => {
            let [e, r] = t;
            return e || r ? 1 : 'unset';
          });
        (0, s.V)(!!E, 'Reorder.Item must be a child of Reorder.Group', 'reorder-item-child');
        let { axis: j, registerItem: k, updateOrder: A, groupRef: G } = E;
        return (0, n.jsx)(P, {
          drag: j,
          ...R,
          dragSnapToOrigin: !0,
          style: { ...i, x: S.x, y: S.y, zIndex: O },
          layout: g,
          onDrag: (t, e) => {
            let { velocity: r, point: n } = e;
            (A(h, S[j].get(), r[j]),
              (function (t, e, r, n) {
                if (!t) return;
                w = t;
                let i = C(t, r);
                if (!i) return;
                let { amount: s, edge: o } = (function (t, e, r) {
                  let n = e.getBoundingClientRect(),
                    i = 'x' === r ? Math.max(0, n.left) : Math.max(0, n.top),
                    s =
                      'x' === r
                        ? Math.min(window.innerWidth, n.right)
                        : Math.min(window.innerHeight, n.bottom),
                    o = t - i,
                    u = s - t;
                  if (o < 50) {
                    let t = 1 - o / 50;
                    return { amount: -25 * t * t, edge: 'start' };
                  }
                  if (u < 50) {
                    let t = 1 - u / 50;
                    return { amount: 25 * t * t, edge: 'end' };
                  }
                  return { amount: 0, edge: null };
                })(e - ('x' === r ? window.scrollX : window.scrollY), i, r);
                if (null === o) {
                  (b.delete(i), x.delete(i));
                  return;
                }
                let u = b.get(i),
                  a = i === document.body || i === document.documentElement;
                if (u !== o) {
                  if (!(('start' === o && n < 0) || ('end' === o && n > 0))) return;
                  b.set(i, o);
                  let t =
                    'x' === r
                      ? i.scrollWidth - (a ? window.innerWidth : i.clientWidth)
                      : i.scrollHeight - (a ? window.innerHeight : i.clientHeight);
                  x.set(i, t);
                }
                if (s > 0) {
                  let t = x.get(i);
                  if (
                    ('x' === r
                      ? a
                        ? window.scrollX
                        : i.scrollLeft
                      : a
                        ? window.scrollY
                        : i.scrollTop) >= t
                  )
                    return;
                }
                'x' === r
                  ? a
                    ? window.scrollBy({ left: s })
                    : (i.scrollLeft += s)
                  : a
                    ? window.scrollBy({ top: s })
                    : (i.scrollTop += s);
              })(G.current, n[j], j, r[j]),
              p && p(t, e));
          },
          onDragEnd: (t, e) => {
            if (w) {
              let t = C(w, 'y');
              t && (b.delete(t), x.delete(t));
              let e = C(w, 'x');
              (e && e !== t && (b.delete(e), x.delete(e)), (w = null));
            }
            m && m(t, e);
          },
          onLayoutMeasure: (t) => {
            k(h, t);
          },
          ref: e,
          ignoreStrict: !0,
          children: r,
        });
      });
    },
    9100: (t, e, r) => {
      r.d(e, { N: () => x });
      var n = r(4568),
        i = r(7620),
        s = r(5971),
        o = r(3847),
        u = r(8683),
        a = r(2015),
        l = r(3449),
        c = r(9070);
      function h(t, e) {
        if ('function' == typeof t) return t(e);
        null != t && (t.current = e);
      }
      class d extends i.Component {
        getSnapshotBeforeUpdate(t) {
          let e = this.props.childRef.current;
          if ((0, l.s)(e) && t.isPresent && !this.props.isPresent && !1 !== this.props.pop) {
            let t = e.offsetParent,
              r = ((0, l.s)(t) && t.offsetWidth) || 0,
              n = ((0, l.s)(t) && t.offsetHeight) || 0,
              i = getComputedStyle(e),
              s = this.props.sizeRef.current;
            ((s.height = parseFloat(i.height)),
              (s.width = parseFloat(i.width)),
              (s.top = e.offsetTop),
              (s.left = e.offsetLeft),
              (s.right = r - s.width - s.left),
              (s.bottom = n - s.height - s.top));
          }
          return null;
        }
        componentDidUpdate() {}
        render() {
          return this.props.children;
        }
      }
      function f(t) {
        var e, r;
        let { children: s, isPresent: o, anchorX: u, anchorY: a, root: l, pop: f } = t,
          p = (0, i.useId)(),
          m = (0, i.useRef)(null),
          y = (0, i.useRef)({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
          { nonce: v } = (0, i.useContext)(c.Q),
          g = (function (...t) {
            return i.useCallback(
              (function (...t) {
                return (e) => {
                  let r = !1,
                    n = t.map((t) => {
                      let n = h(t, e);
                      return (r || 'function' != typeof n || (r = !0), n);
                    });
                  if (r)
                    return () => {
                      for (let e = 0; e < n.length; e++) {
                        let r = n[e];
                        'function' == typeof r ? r() : h(t[e], null);
                      }
                    };
                };
              })(...t),
              t,
            );
          })(
            m,
            null != (r = null == (e = s.props) ? void 0 : e.ref) ? r : null == s ? void 0 : s.ref,
          );
        return (
          (0, i.useInsertionEffect)(() => {
            let { width: t, height: e, top: r, left: n, right: i, bottom: s } = y.current;
            if (o || !1 === f || !m.current || !t || !e) return;
            m.current.dataset.motionPopId = p;
            let c = document.createElement('style');
            v && (c.nonce = v);
            let h = null != l ? l : document.head;
            return (
              h.appendChild(c),
              c.sheet &&
                c.sheet.insertRule(
                  '\n          [data-motion-pop-id="'
                    .concat(
                      p,
                      '"] {\n            position: absolute !important;\n            width: ',
                    )
                    .concat(t, 'px !important;\n            height: ')
                    .concat(e, 'px !important;\n            ')
                    .concat(
                      'left' === u ? 'left: '.concat(n) : 'right: '.concat(i),
                      'px !important;\n            ',
                    )
                    .concat(
                      'bottom' === a ? 'bottom: '.concat(s) : 'top: '.concat(r),
                      'px !important;\n          }\n        ',
                    ),
                ),
              () => {
                var t;
                (null == (t = m.current) || t.removeAttribute('data-motion-pop-id'),
                  h.contains(c) && h.removeChild(c));
              }
            );
          }, [o]),
          (0, n.jsx)(d, {
            isPresent: o,
            childRef: m,
            sizeRef: y,
            pop: f,
            children: !1 === f ? s : i.cloneElement(s, { ref: g }),
          })
        );
      }
      let p = (t) => {
        let {
            children: e,
            initial: r,
            isPresent: s,
            onExitComplete: u,
            custom: l,
            presenceAffectsLayout: c,
            mode: h,
            anchorX: d,
            anchorY: p,
            root: y,
          } = t,
          v = (0, o.M)(m),
          g = (0, i.useId)(),
          x = !0,
          b = (0, i.useMemo)(
            () => (
              (x = !1),
              {
                id: g,
                initial: r,
                isPresent: s,
                custom: l,
                onExitComplete: (t) => {
                  for (let e of (v.set(t, !0), v.values())) if (!e) return;
                  u && u();
                },
                register: (t) => (v.set(t, !1), () => v.delete(t)),
              }
            ),
            [s, v, u],
          );
        return (
          c && x && (b = { ...b }),
          (0, i.useMemo)(() => {
            v.forEach((t, e) => v.set(e, !1));
          }, [s]),
          i.useEffect(() => {
            s || v.size || !u || u();
          }, [s]),
          (e = (0, n.jsx)(f, {
            pop: 'popLayout' === h,
            isPresent: s,
            anchorX: d,
            anchorY: p,
            root: y,
            children: e,
          })),
          (0, n.jsx)(a.t.Provider, { value: b, children: e })
        );
      };
      function m() {
        return new Map();
      }
      var y = r(6472);
      let v = (t) => t.key || '';
      function g(t) {
        let e = [];
        return (
          i.Children.forEach(t, (t) => {
            (0, i.isValidElement)(t) && e.push(t);
          }),
          e
        );
      }
      let x = (t) => {
        let {
            children: e,
            custom: r,
            initial: a = !0,
            onExitComplete: l,
            presenceAffectsLayout: c = !0,
            mode: h = 'sync',
            propagate: d = !1,
            anchorX: f = 'left',
            anchorY: m = 'top',
            root: x,
          } = t,
          [b, w] = (0, y.xQ)(d),
          C = (0, i.useMemo)(() => g(e), [e]),
          M = d && !b ? [] : C.map(v),
          R = (0, i.useRef)(!0),
          P = (0, i.useRef)(C),
          E = (0, o.M)(() => new Map()),
          S = (0, i.useRef)(new Set()),
          [O, j] = (0, i.useState)(C),
          [k, A] = (0, i.useState)(C);
        (0, u.E)(() => {
          ((R.current = !1), (P.current = C));
          for (let t = 0; t < k.length; t++) {
            let e = v(k[t]);
            M.includes(e) ? (E.delete(e), S.current.delete(e)) : !0 !== E.get(e) && E.set(e, !1);
          }
        }, [k, M.length, M.join('-')]);
        let G = [];
        if (C !== O) {
          let t = [...C];
          for (let e = 0; e < k.length; e++) {
            let r = k[e],
              n = v(r);
            M.includes(n) || (t.splice(e, 0, r), G.push(r));
          }
          return ('wait' === h && G.length && (t = G), A(g(t)), j(C), null);
        }
        let { forceRender: I } = (0, i.useContext)(s.L);
        return (0, n.jsx)(n.Fragment, {
          children: k.map((t) => {
            let e = v(t),
              i = (!d || !!b) && (C === k || M.includes(e));
            return (0, n.jsx)(
              p,
              {
                isPresent: i,
                initial: (!R.current || !!a) && void 0,
                custom: r,
                presenceAffectsLayout: c,
                mode: h,
                root: x,
                onExitComplete: i
                  ? void 0
                  : () => {
                      if (S.current.has(e) || !E.has(e)) return;
                      (S.current.add(e), E.set(e, !0));
                      let t = !0;
                      (E.forEach((e) => {
                        e || (t = !1);
                      }),
                        t && (null == I || I(), A(P.current), d && (null == w || w()), l && l()));
                    },
                anchorX: f,
                anchorY: m,
                children: t,
              },
              e,
            );
          }),
        });
      };
    },
    9610: (t, e, r) => {
      r.d(e, { x: () => h });
      var n = r(4568),
        i = r(8928),
        s = r(7620),
        o = r(421),
        u = r(4595),
        a = r(3847),
        l = r(2288),
        c = r(6430);
      let h = (0, s.forwardRef)(function (t, e) {
        let { children: r, as: h = 'ul', axis: f = 'y', onReorder: p, values: m, ...y } = t,
          v = (0, a.M)(() => u.P[h]),
          g = [],
          x = (0, s.useRef)(!1),
          b = (0, s.useRef)(null);
        ((0, i.V)(!!m, 'Reorder.Group must be provided a values prop', 'reorder-values'),
          (0, s.useEffect)(() => {
            x.current = !1;
          }));
        let w = { overflowAnchor: 'none', ...y.style };
        return (0, n.jsx)(v, {
          ...y,
          style: w,
          ref: (t) => {
            ((b.current = t), 'function' == typeof e ? e(t) : e && (e.current = t));
          },
          ignoreStrict: !0,
          children: (0, n.jsx)(o.T.Provider, {
            value: {
              axis: f,
              groupRef: b,
              registerItem: (t, e) => {
                let r = g.findIndex((e) => t === e.value);
                (-1 !== r ? (g[r].layout = e[f]) : g.push({ value: t, layout: e[f] }), g.sort(d));
              },
              updateOrder: (t, e, r) => {
                if (x.current) return;
                let n = (function (t, e, r, n) {
                  if (!n) return t;
                  let i = t.findIndex((t) => t.value === e);
                  if (-1 === i) return t;
                  let s = n > 0 ? 1 : -1,
                    o = t[i + s];
                  if (!o) return t;
                  let u = t[i],
                    a = o.layout,
                    h = (0, l.k)(a.min, a.max, 0.5);
                  return (1 === s && u.layout.max + r > h) || (-1 === s && u.layout.min + r < h)
                    ? (0, c.Pe)(t, i, i + s)
                    : t;
                })(g, t, e, r);
                if (g !== n) {
                  x.current = !0;
                  let t = [...m];
                  for (let e = 0; e < n.length; e++)
                    if (g[e].value !== n[e].value) {
                      let r = m.indexOf(g[e].value),
                        i = m.indexOf(n[e].value);
                      -1 !== r && -1 !== i && ([t[r], t[i]] = [t[i], t[r]]);
                      break;
                    }
                  p(t);
                }
              },
            },
            children: r,
          }),
        });
      });
      function d(t, e) {
        return t.layout.min - e.layout.min;
      }
    },
  },
]);
