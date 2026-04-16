(() => {
  var a = {};
  ((a.id = 72),
    (a.ids = [72]),
    (a.modules = {
      151: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 34664));
      },
      261: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/router/utils/app-paths');
      },
      3295: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/after-task-async-storage.external.js');
      },
      7839: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => d }));
        let d = (0, c(25459).registerClientReference)(
          function () {
            throw Error(
              'Attempted to call the default export of "C:\\\\telegram-clone\\\\apps\\\\web\\\\src\\\\app\\\\(auth)\\\\login\\\\page.tsx" from the server, but it\'s on the client. It\'s not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.',
            );
          },
          'C:\\telegram-clone\\apps\\web\\src\\app\\(auth)\\login\\page.tsx',
          'default',
        );
      },
      10846: (a) => {
        'use strict';
        a.exports = require('next/dist/compiled/next-server/app-page.runtime.prod.js');
      },
      14276: () => {},
      19121: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/action-async-storage.external.js');
      },
      25493: (a, b, c) => {
        'use strict';
        c.d(b, { n: () => d });
        let d = (0, c(19154).v)((a) => ({
          theme: 'system',
          sidebarOpen: !0,
          detailsOpen: !1,
          searchOpen: !1,
          typingByChat: {},
          setTheme: (b) => a({ theme: b }),
          toggleSidebar: () => a((a) => ({ sidebarOpen: !a.sidebarOpen })),
          setSidebarOpen: (b) => a({ sidebarOpen: b }),
          setDetailsOpen: (b) => a({ detailsOpen: b }),
          setSearchOpen: (b) => a({ searchOpen: b }),
          setTypingForChat: (b, c) =>
            a((a) => ({
              typingByChat: c
                ? { ...a.typingByChat, [b]: !0 }
                : Object.fromEntries(Object.entries(a.typingByChat).filter(([a]) => a !== b)),
            })),
        }));
      },
      26713: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/router/utils/is-bot');
      },
      28354: (a) => {
        'use strict';
        a.exports = require('util');
      },
      29294: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/work-async-storage.external.js');
      },
      33328: (a, b, c) => {
        (Promise.resolve().then(c.t.bind(c, 58671, 23)),
          Promise.resolve().then(c.t.bind(c, 56542, 23)),
          Promise.resolve().then(c.t.bind(c, 88248, 23)),
          Promise.resolve().then(c.t.bind(c, 49743, 23)),
          Promise.resolve().then(c.t.bind(c, 96231, 23)),
          Promise.resolve().then(c.t.bind(c, 10959, 23)),
          Promise.resolve().then(c.t.bind(c, 72041, 23)),
          Promise.resolve().then(c.t.bind(c, 95094, 23)),
          Promise.resolve().then(c.t.bind(c, 67487, 23)));
      },
      33873: (a) => {
        'use strict';
        a.exports = require('path');
      },
      34081: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => o }));
        var d = c(78157),
          e = c(94496),
          f = c.n(e),
          g = c(71159);
        c(31768);
        var h = c(6023),
          i = c(85717),
          j = c(34224),
          k = c(91864),
          l = c(41921),
          m = c(46515);
        let n = i.Ik({ email: i.Yj().email(), password: i.Yj().min(8) });
        function o() {
          let a = (0, g.useRouter)(),
            b = (0, l.n)((a) => a.setTokens);
          ((0, l.n)((a) => a.accessToken), (0, l.n)((a) => a.hasHydrated));
          let {
              register: c,
              handleSubmit: e,
              formState: { errors: i, isSubmitting: o },
              setError: p,
            } = (0, h.mN)({ resolver: (0, j.u)(n) }),
            q = async (c) => {
              try {
                let d = await (0, k.nr)('/auth/login', { method: 'POST', body: c, skipAuth: !0 });
                (b(d), a.replace('/onboarding'));
              } catch {
                p('root', { message: 'Could not sign in. Check your credentials.' });
              }
            };
          return (0, d.jsxs)(m.P.div, {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            className:
              'rounded-3xl border border-line/80 bg-surface-elevated/90 p-8 shadow-soft backdrop-blur dark:bg-surface-elevated/70',
            children: [
              (0, d.jsxs)('div', {
                className: 'mb-8 space-y-2',
                children: [
                  (0, d.jsx)('p', {
                    className: 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted',
                    children: 'Pulse',
                  }),
                  (0, d.jsx)('h1', {
                    className: 'font-display text-3xl font-semibold text-ink',
                    children: 'Welcome back',
                  }),
                  (0, d.jsx)('p', {
                    className: 'text-sm text-ink-muted',
                    children: 'Sign in to continue your conversations.',
                  }),
                ],
              }),
              (0, d.jsxs)('form', {
                className: 'space-y-4',
                onSubmit: e(q),
                noValidate: !0,
                children: [
                  (0, d.jsxs)('div', {
                    children: [
                      (0, d.jsx)('label', {
                        className: 'mb-1 block text-xs font-medium text-ink-muted',
                        htmlFor: 'email',
                        children: 'Email',
                      }),
                      (0, d.jsx)('input', {
                        id: 'email',
                        type: 'email',
                        autoComplete: 'email',
                        className:
                          'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30',
                        ...c('email'),
                      }),
                      i.email &&
                        (0, d.jsx)('p', {
                          className: 'mt-1 text-xs text-red-500',
                          role: 'alert',
                          children: i.email.message,
                        }),
                    ],
                  }),
                  (0, d.jsxs)('div', {
                    children: [
                      (0, d.jsx)('label', {
                        className: 'mb-1 block text-xs font-medium text-ink-muted',
                        htmlFor: 'password',
                        children: 'Password',
                      }),
                      (0, d.jsx)('input', {
                        id: 'password',
                        type: 'password',
                        autoComplete: 'current-password',
                        className:
                          'w-full rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 dark:bg-surface-muted/30',
                        ...c('password'),
                      }),
                      i.password &&
                        (0, d.jsx)('p', {
                          className: 'mt-1 text-xs text-red-500',
                          role: 'alert',
                          children: i.password.message,
                        }),
                    ],
                  }),
                  i.root &&
                    (0, d.jsx)('p', {
                      className: 'text-sm text-red-500',
                      role: 'alert',
                      children: i.root.message,
                    }),
                  (0, d.jsx)('button', {
                    type: 'submit',
                    disabled: o,
                    className:
                      'flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60',
                    children: o ? 'Signing in…' : 'Sign in',
                  }),
                ],
              }),
              (0, d.jsxs)('p', {
                className: 'mt-6 text-center text-sm text-ink-muted',
                children: [
                  'New to Pulse?',
                  ' ',
                  (0, d.jsx)(f(), {
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
      34664: (a, b, c) => {
        'use strict';
        c.d(b, { Providers: () => d });
        let d = (0, c(25459).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          'C:\\telegram-clone\\apps\\web\\src\\app\\providers.tsx',
          'Providers',
        );
      },
      35971: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 34081));
      },
      41025: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/dynamic-access-async-storage.external.js');
      },
      41921: (a, b, c) => {
        'use strict';
        c.d(b, { n: () => f });
        var d = c(19154),
          e = c(7904);
        let f = (0, d.v)()(
          (0, e.Zr)(
            (a) => ({
              accessToken: null,
              refreshToken: null,
              sessionId: null,
              hasHydrated: !1,
              setTokens: ({ accessToken: b, refreshToken: c, sessionId: d }) =>
                a({ accessToken: b, refreshToken: c, sessionId: d ?? null }),
              clear: () => a({ accessToken: null, refreshToken: null, sessionId: null }),
            }),
            {
              name: 'pulse-auth',
              partialize: (a) => ({
                accessToken: a.accessToken,
                refreshToken: a.refreshToken,
                sessionId: a.sessionId,
              }),
              onRehydrateStorage: () => (a, b) => {
                (console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
                  error: b instanceof Error ? b.message : (b ?? null),
                }),
                  queueMicrotask(() => {
                    (console.log('[pulse-bootstrap] persist microtask: set hasHydrated true'),
                      f.setState({ hasHydrated: !0 }));
                  }));
              },
            },
          ),
        );
      },
      43056: (a, b, c) => {
        (Promise.resolve().then(c.t.bind(c, 48365, 23)),
          Promise.resolve().then(c.t.bind(c, 64596, 23)),
          Promise.resolve().then(c.t.bind(c, 56186, 23)),
          Promise.resolve().then(c.t.bind(c, 67805, 23)),
          Promise.resolve().then(c.t.bind(c, 27561, 23)),
          Promise.resolve().then(c.t.bind(c, 47569, 23)),
          Promise.resolve().then(c.t.bind(c, 42747, 23)),
          Promise.resolve().then(c.t.bind(c, 56676, 23)),
          Promise.resolve().then(c.bind(c, 97225)));
      },
      47570: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => k, metadata: () => j }));
        var d = c(5939),
          e = c(39480),
          f = c.n(e),
          g = c(95809),
          h = c.n(g);
        c(14276);
        var i = c(34664);
        let j = {
          title: 'Pulse — calm, fast messaging',
          description: 'Pulse is a modern messenger for people who value clarity and speed.',
        };
        function k({ children: a }) {
          return (0, d.jsx)('html', {
            lang: 'en',
            suppressHydrationWarning: !0,
            children: (0, d.jsx)('body', {
              className: `${f().variable} ${h().variable} font-sans`,
              children: (0, d.jsx)(i.Providers, { children: a }),
            }),
          });
        }
      },
      50753: (a, b, c) => {
        'use strict';
        c.d(b, { Providers: () => m });
        var d = c(78157),
          e = c(1319),
          f = c(32315),
          g = c(31768),
          h = c(77222),
          i = c(46515),
          j = c(41921);
        function k() {
          let a = (0, j.n)((a) => a.hasHydrated);
          return (0, d.jsx)(h.N, {
            children:
              !a &&
              (0, d.jsxs)(
                i.P.div,
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
                    (0, d.jsxs)(i.P.div, {
                      initial: { opacity: 0.88, y: 4 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                      className: 'text-center',
                      children: [
                        (0, d.jsx)('p', {
                          className:
                            'font-display text-[1.65rem] font-semibold tracking-tight text-ink',
                          children: 'Pulse',
                        }),
                        (0, d.jsx)('p', {
                          className:
                            'mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-ink-muted',
                          children: 'Xasma',
                        }),
                      ],
                    }),
                    (0, d.jsx)(i.P.div, {
                      className:
                        'mt-10 h-[2px] w-12 overflow-hidden rounded-full bg-line/55 dark:bg-line/50',
                      initial: { opacity: 0.6 },
                      animate: { opacity: 1 },
                      transition: { delay: 0.08, duration: 0.25 },
                      children: (0, d.jsx)(i.P.div, {
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
        var l = c(25493);
        function m({ children: a }) {
          let [b] = (0, g.useState)(() => new e.E());
          return (
            (0, l.n)((a) => a.theme),
            (0, d.jsxs)(f.Ht, { client: b, children: [a, (0, d.jsx)(k, {})] })
          );
        }
      },
      53295: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 50753));
      },
      59947: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 7839));
      },
      63033: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/work-unit-async-storage.external.js');
      },
      70626: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => e }));
        var d = c(5939);
        function e({ children: a }) {
          return (0, d.jsx)('div', {
            className:
              'min-h-dvh bg-gradient-to-br from-surface via-surface-muted to-surface-elevated dark:from-surface dark:via-surface-muted dark:to-surface',
            children: (0, d.jsx)('div', {
              className: 'mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16',
              children: a,
            }),
          });
        }
      },
      80408: () => {},
      86439: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/no-fallback-error.external');
      },
      87032: () => {},
      89987: (a, b, c) => {
        'use strict';
        (c.r(b),
          c.d(b, {
            GlobalError: () => D.a,
            __next_app__: () => J,
            handler: () => L,
            pages: () => I,
            routeModule: () => K,
            tree: () => H,
          }));
        var d = c(73653),
          e = c(97714),
          f = c(85250),
          g = c(37587),
          h = c(22369),
          i = c(1889),
          j = c(96232),
          k = c(22841),
          l = c(46537),
          m = c(46027),
          n = c(78559),
          o = c(75928),
          p = c(19374),
          q = c(65971),
          r = c(261),
          s = c(79898),
          t = c(32967),
          u = c(26713),
          v = c(40139),
          w = c(14248),
          x = c(59580),
          y = c(57749),
          z = c(53123),
          A = c(89745),
          B = c(86439),
          C = c(58671),
          D = c.n(C),
          E = c(18283),
          F = c(39818),
          G = {};
        for (let a in E)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              '__next_app__',
              'routeModule',
              'handler',
            ].indexOf(a) && (G[a] = () => E[a]);
        c.d(b, G);
        let H = {
            children: [
              '',
              {
                children: [
                  '(auth)',
                  {
                    children: [
                      'login',
                      {
                        children: [
                          '__PAGE__',
                          {},
                          {
                            page: [
                              () => Promise.resolve().then(c.bind(c, 7839)),
                              'C:\\telegram-clone\\apps\\web\\src\\app\\(auth)\\login\\page.tsx',
                            ],
                          },
                        ],
                      },
                      {},
                    ],
                  },
                  {
                    layout: [
                      () => Promise.resolve().then(c.bind(c, 70626)),
                      'C:\\telegram-clone\\apps\\web\\src\\app\\(auth)\\layout.tsx',
                    ],
                    'not-found': [
                      () => Promise.resolve().then(c.t.bind(c, 17983, 23)),
                      'next/dist/client/components/builtin/not-found.js',
                    ],
                    forbidden: [
                      () => Promise.resolve().then(c.t.bind(c, 15034, 23)),
                      'next/dist/client/components/builtin/forbidden.js',
                    ],
                    unauthorized: [
                      () => Promise.resolve().then(c.t.bind(c, 54693, 23)),
                      'next/dist/client/components/builtin/unauthorized.js',
                    ],
                  },
                ],
              },
              {
                layout: [
                  () => Promise.resolve().then(c.bind(c, 47570)),
                  'C:\\telegram-clone\\apps\\web\\src\\app\\layout.tsx',
                ],
                'global-error': [
                  () => Promise.resolve().then(c.t.bind(c, 58671, 23)),
                  'next/dist/client/components/builtin/global-error.js',
                ],
                'not-found': [
                  () => Promise.resolve().then(c.t.bind(c, 17983, 23)),
                  'next/dist/client/components/builtin/not-found.js',
                ],
                forbidden: [
                  () => Promise.resolve().then(c.t.bind(c, 15034, 23)),
                  'next/dist/client/components/builtin/forbidden.js',
                ],
                unauthorized: [
                  () => Promise.resolve().then(c.t.bind(c, 54693, 23)),
                  'next/dist/client/components/builtin/unauthorized.js',
                ],
              },
            ],
          }.children,
          I = ['C:\\telegram-clone\\apps\\web\\src\\app\\(auth)\\login\\page.tsx'],
          J = { require: c, loadChunk: () => Promise.resolve() },
          K = new d.AppPageRouteModule({
            definition: {
              kind: e.RouteKind.APP_PAGE,
              page: '/(auth)/login/page',
              pathname: '/login',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: H },
            distDir: '../.next-web',
            relativeProjectDir: '',
          });
        async function L(a, b, d) {
          var C;
          let G = '/(auth)/login/page';
          '/index' === G && (G = '/');
          let M = (0, h.getRequestMeta)(a, 'postponed'),
            N = (0, h.getRequestMeta)(a, 'minimalMode'),
            O = await K.prepare(a, b, { srcPage: G, multiZoneDraftMode: !1 });
          if (!O)
            return (
              (b.statusCode = 400),
              b.end('Bad Request'),
              null == d.waitUntil || d.waitUntil.call(d, Promise.resolve()),
              null
            );
          let {
              buildId: P,
              query: Q,
              params: R,
              parsedUrl: S,
              pageIsDynamic: T,
              buildManifest: U,
              nextFontManifest: V,
              reactLoadableManifest: W,
              serverActionsManifest: X,
              clientReferenceManifest: Y,
              subresourceIntegrityManifest: Z,
              prerenderManifest: $,
              isDraftMode: _,
              resolvedPathname: aa,
              revalidateOnlyGenerated: ab,
              routerServerContext: ac,
              nextConfig: ad,
              interceptionRoutePatterns: ae,
            } = O,
            af = S.pathname || '/',
            ag = (0, r.normalizeAppPath)(G),
            { isOnDemandRevalidate: ah } = O,
            ai = K.match(af, $),
            aj = !!$.routes[aa],
            ak = !!(ai || aj || $.routes[ag]),
            al = a.headers['user-agent'] || '',
            am = (0, u.getBotType)(al),
            an = (0, p.isHtmlBotRequest)(a),
            ao =
              (0, h.getRequestMeta)(a, 'isPrefetchRSCRequest') ??
              '1' === a.headers[t.NEXT_ROUTER_PREFETCH_HEADER],
            ap = (0, h.getRequestMeta)(a, 'isRSCRequest') ?? !!a.headers[t.RSC_HEADER],
            aq = (0, s.getIsPossibleServerAction)(a),
            ar =
              (0, m.checkIsAppPPREnabled)(ad.experimental.ppr) &&
              (null == (C = $.routes[ag] ?? $.dynamicRoutes[ag]) ? void 0 : C.renderingMode) ===
                'PARTIALLY_STATIC',
            as = !1,
            at = !1,
            au = ar ? M : void 0,
            av = ar && ap && !ao,
            aw = (0, h.getRequestMeta)(a, 'segmentPrefetchRSCRequest'),
            ax = !al || (0, p.shouldServeStreamingMetadata)(al, ad.htmlLimitedBots);
          an && ar && ((ak = !1), (ax = !1));
          let ay = !0 === K.isDev || !ak || 'string' == typeof M || av,
            az = an && ar,
            aA = null;
          _ || !ak || ay || aq || au || av || (aA = aa);
          let aB = aA;
          (!aB && K.isDev && (aB = aa), K.isDev || _ || !ak || !ap || av || (0, k.d)(a.headers));
          let aC = {
            ...E,
            tree: H,
            pages: I,
            GlobalError: D(),
            handler: L,
            routeModule: K,
            __next_app__: J,
          };
          X &&
            Y &&
            (0, o.setReferenceManifestsSingleton)({
              page: G,
              clientReferenceManifest: Y,
              serverActionsManifest: X,
              serverModuleMap: (0, q.createServerModuleMap)({ serverActionsManifest: X }),
            });
          let aD = a.method || 'GET',
            aE = (0, g.getTracer)(),
            aF = aE.getActiveScopeSpan();
          try {
            let f = K.getVaryHeader(aa, ae);
            b.setHeader('Vary', f);
            let k = async (c, d) => {
                let e = new l.NodeNextRequest(a),
                  f = new l.NodeNextResponse(b);
                return K.render(e, f, d).finally(() => {
                  if (!c) return;
                  c.setAttributes({ 'http.status_code': b.statusCode, 'next.rsc': !1 });
                  let d = aE.getRootSpanAttributes();
                  if (!d) return;
                  if (d.get('next.span_type') !== i.BaseServerSpan.handleRequest)
                    return void console.warn(
                      `Unexpected root span type '${d.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`,
                    );
                  let e = d.get('next.route');
                  if (e) {
                    let a = `${aD} ${e}`;
                    (c.setAttributes({ 'next.route': e, 'http.route': e, 'next.span_name': a }),
                      c.updateName(a));
                  } else c.updateName(`${aD} ${a.url}`);
                });
              },
              m = async ({ span: e, postponed: f, fallbackRouteParams: g }) => {
                let i = {
                    query: Q,
                    params: R,
                    page: ag,
                    sharedContext: { buildId: P },
                    serverComponentsHmrCache: (0, h.getRequestMeta)(a, 'serverComponentsHmrCache'),
                    fallbackRouteParams: g,
                    renderOpts: {
                      App: () => null,
                      Document: () => null,
                      pageConfig: {},
                      ComponentMod: aC,
                      Component: (0, j.T)(aC),
                      params: R,
                      routeModule: K,
                      page: G,
                      postponed: f,
                      shouldWaitOnAllReady: az,
                      serveStreamingMetadata: ax,
                      supportsDynamicResponse: 'string' == typeof f || ay,
                      buildManifest: U,
                      nextFontManifest: V,
                      reactLoadableManifest: W,
                      subresourceIntegrityManifest: Z,
                      serverActionsManifest: X,
                      clientReferenceManifest: Y,
                      setIsrStatus: null == ac ? void 0 : ac.setIsrStatus,
                      dir: c(33873).join(process.cwd(), K.relativeProjectDir),
                      isDraftMode: _,
                      isRevalidate: ak && !f && !av,
                      botType: am,
                      isOnDemandRevalidate: ah,
                      isPossibleServerAction: aq,
                      assetPrefix: ad.assetPrefix,
                      nextConfigOutput: ad.output,
                      crossOrigin: ad.crossOrigin,
                      trailingSlash: ad.trailingSlash,
                      previewProps: $.preview,
                      deploymentId: ad.deploymentId,
                      enableTainting: ad.experimental.taint,
                      htmlLimitedBots: ad.htmlLimitedBots,
                      devtoolSegmentExplorer: ad.experimental.devtoolSegmentExplorer,
                      reactMaxHeadersLength: ad.reactMaxHeadersLength,
                      multiZoneDraftMode: !1,
                      incrementalCache: (0, h.getRequestMeta)(a, 'incrementalCache'),
                      cacheLifeProfiles: ad.experimental.cacheLife,
                      basePath: ad.basePath,
                      serverActions: ad.experimental.serverActions,
                      ...(as
                        ? {
                            nextExport: !0,
                            supportsDynamicResponse: !1,
                            isStaticGeneration: !0,
                            isRevalidate: !0,
                            isDebugDynamicAccesses: as,
                          }
                        : {}),
                      experimental: {
                        isRoutePPREnabled: ar,
                        expireTime: ad.expireTime,
                        staleTimes: ad.experimental.staleTimes,
                        cacheComponents: !!ad.experimental.cacheComponents,
                        clientSegmentCache: !!ad.experimental.clientSegmentCache,
                        clientParamParsing: !!ad.experimental.clientParamParsing,
                        dynamicOnHover: !!ad.experimental.dynamicOnHover,
                        inlineCss: !!ad.experimental.inlineCss,
                        authInterrupts: !!ad.experimental.authInterrupts,
                        clientTraceMetadata: ad.experimental.clientTraceMetadata || [],
                      },
                      waitUntil: d.waitUntil,
                      onClose: (a) => {
                        b.on('close', a);
                      },
                      onAfterTaskError: () => {},
                      onInstrumentationRequestError: (b, c, d) => K.onRequestError(a, b, d, ac),
                      err: (0, h.getRequestMeta)(a, 'invokeError'),
                      dev: K.isDev,
                    },
                  },
                  l = await k(e, i),
                  { metadata: m } = l,
                  { cacheControl: n, headers: o = {}, fetchTags: p } = m;
                if (
                  (p && (o[y.NEXT_CACHE_TAGS_HEADER] = p),
                  (a.fetchMetrics = m.fetchMetrics),
                  ak && (null == n ? void 0 : n.revalidate) === 0 && !K.isDev && !ar)
                ) {
                  let a = m.staticBailoutInfo,
                    b = Object.defineProperty(
                      Error(`Page changed from static to dynamic at runtime ${aa}${(null == a ? void 0 : a.description) ? `, reason: ${a.description}` : ''}
see more here https://nextjs.org/docs/messages/app-static-to-dynamic-error`),
                      '__NEXT_ERROR_CODE',
                      { value: 'E132', enumerable: !1, configurable: !0 },
                    );
                  if (null == a ? void 0 : a.stack) {
                    let c = a.stack;
                    b.stack = b.message + c.substring(c.indexOf('\n'));
                  }
                  throw b;
                }
                return {
                  value: {
                    kind: v.CachedRouteKind.APP_PAGE,
                    html: l,
                    headers: o,
                    rscData: m.flightData,
                    postponed: m.postponed,
                    status: m.statusCode,
                    segmentData: m.segmentData,
                  },
                  cacheControl: n,
                };
              },
              o = async ({ hasResolved: c, previousCacheEntry: f, isRevalidating: g, span: i }) => {
                let j,
                  k = !1 === K.isDev,
                  l = c || b.writableEnded;
                if (ah && ab && !f && !N)
                  return (
                    (null == ac ? void 0 : ac.render404)
                      ? await ac.render404(a, b)
                      : ((b.statusCode = 404), b.end('This page could not be found')),
                    null
                  );
                if (
                  (ai && (j = (0, w.parseFallbackField)(ai.fallback)),
                  j === w.FallbackMode.PRERENDER &&
                    (0, u.isBot)(al) &&
                    (!ar || an) &&
                    (j = w.FallbackMode.BLOCKING_STATIC_RENDER),
                  (null == f ? void 0 : f.isStale) === -1 && (ah = !0),
                  ah &&
                    (j !== w.FallbackMode.NOT_FOUND || f) &&
                    (j = w.FallbackMode.BLOCKING_STATIC_RENDER),
                  !N &&
                    j !== w.FallbackMode.BLOCKING_STATIC_RENDER &&
                    aB &&
                    !l &&
                    !_ &&
                    T &&
                    (k || !aj))
                ) {
                  let b;
                  if ((k || ai) && j === w.FallbackMode.NOT_FOUND) throw new B.NoFallbackError();
                  if (ar && !ap) {
                    let c =
                      'string' == typeof (null == ai ? void 0 : ai.fallback)
                        ? ai.fallback
                        : k
                          ? ag
                          : null;
                    if (
                      ((b = await K.handleResponse({
                        cacheKey: c,
                        req: a,
                        nextConfig: ad,
                        routeKind: e.RouteKind.APP_PAGE,
                        isFallback: !0,
                        prerenderManifest: $,
                        isRoutePPREnabled: ar,
                        responseGenerator: async () =>
                          m({
                            span: i,
                            postponed: void 0,
                            fallbackRouteParams: k || at ? (0, n.u)(ag) : null,
                          }),
                        waitUntil: d.waitUntil,
                      })),
                      null === b)
                    )
                      return null;
                    if (b) return (delete b.cacheControl, b);
                  }
                }
                let o = ah || g || !au ? void 0 : au;
                if (as && void 0 !== o)
                  return {
                    cacheControl: { revalidate: 1, expire: void 0 },
                    value: {
                      kind: v.CachedRouteKind.PAGES,
                      html: x.default.EMPTY,
                      pageData: {},
                      headers: void 0,
                      status: void 0,
                    },
                  };
                let p =
                  T && ar && ((0, h.getRequestMeta)(a, 'renderFallbackShell') || at)
                    ? (0, n.u)(af)
                    : null;
                return m({ span: i, postponed: o, fallbackRouteParams: p });
              },
              p = async (c) => {
                var f, g, i, j, k;
                let l,
                  n = await K.handleResponse({
                    cacheKey: aA,
                    responseGenerator: (a) => o({ span: c, ...a }),
                    routeKind: e.RouteKind.APP_PAGE,
                    isOnDemandRevalidate: ah,
                    isRoutePPREnabled: ar,
                    req: a,
                    nextConfig: ad,
                    prerenderManifest: $,
                    waitUntil: d.waitUntil,
                  });
                if (
                  (_ &&
                    b.setHeader(
                      'Cache-Control',
                      'private, no-cache, no-store, max-age=0, must-revalidate',
                    ),
                  K.isDev && b.setHeader('Cache-Control', 'no-store, must-revalidate'),
                  !n)
                ) {
                  if (aA)
                    throw Object.defineProperty(
                      Error('invariant: cache entry required but not generated'),
                      '__NEXT_ERROR_CODE',
                      { value: 'E62', enumerable: !1, configurable: !0 },
                    );
                  return null;
                }
                if ((null == (f = n.value) ? void 0 : f.kind) !== v.CachedRouteKind.APP_PAGE)
                  throw Object.defineProperty(
                    Error(
                      `Invariant app-page handler received invalid cache entry ${null == (i = n.value) ? void 0 : i.kind}`,
                    ),
                    '__NEXT_ERROR_CODE',
                    { value: 'E707', enumerable: !1, configurable: !0 },
                  );
                let p = 'string' == typeof n.value.postponed;
                ak &&
                  !av &&
                  (!p || ao) &&
                  (N ||
                    b.setHeader(
                      'x-nextjs-cache',
                      ah ? 'REVALIDATED' : n.isMiss ? 'MISS' : n.isStale ? 'STALE' : 'HIT',
                    ),
                  b.setHeader(t.NEXT_IS_PRERENDER_HEADER, '1'));
                let { value: q } = n;
                if (au) l = { revalidate: 0, expire: void 0 };
                else if (N && ap && !ao && ar) l = { revalidate: 0, expire: void 0 };
                else if (!K.isDev)
                  if (_) l = { revalidate: 0, expire: void 0 };
                  else if (ak) {
                    if (n.cacheControl)
                      if ('number' == typeof n.cacheControl.revalidate) {
                        if (n.cacheControl.revalidate < 1)
                          throw Object.defineProperty(
                            Error(
                              `Invalid revalidate configuration provided: ${n.cacheControl.revalidate} < 1`,
                            ),
                            '__NEXT_ERROR_CODE',
                            { value: 'E22', enumerable: !1, configurable: !0 },
                          );
                        l = {
                          revalidate: n.cacheControl.revalidate,
                          expire:
                            (null == (j = n.cacheControl) ? void 0 : j.expire) ?? ad.expireTime,
                        };
                      } else l = { revalidate: y.CACHE_ONE_YEAR, expire: void 0 };
                  } else b.getHeader('Cache-Control') || (l = { revalidate: 0, expire: void 0 });
                if (
                  ((n.cacheControl = l),
                  'string' == typeof aw &&
                    (null == q ? void 0 : q.kind) === v.CachedRouteKind.APP_PAGE &&
                    q.segmentData)
                ) {
                  b.setHeader(t.NEXT_DID_POSTPONE_HEADER, '2');
                  let c = null == (k = q.headers) ? void 0 : k[y.NEXT_CACHE_TAGS_HEADER];
                  N && ak && c && 'string' == typeof c && b.setHeader(y.NEXT_CACHE_TAGS_HEADER, c);
                  let d = q.segmentData.get(aw);
                  return void 0 !== d
                    ? (0, A.sendRenderResult)({
                        req: a,
                        res: b,
                        generateEtags: ad.generateEtags,
                        poweredByHeader: ad.poweredByHeader,
                        result: x.default.fromStatic(d, t.RSC_CONTENT_TYPE_HEADER),
                        cacheControl: n.cacheControl,
                      })
                    : ((b.statusCode = 204),
                      (0, A.sendRenderResult)({
                        req: a,
                        res: b,
                        generateEtags: ad.generateEtags,
                        poweredByHeader: ad.poweredByHeader,
                        result: x.default.EMPTY,
                        cacheControl: n.cacheControl,
                      }));
                }
                let r = (0, h.getRequestMeta)(a, 'onCacheEntry');
                if (
                  r &&
                  (await r(
                    { ...n, value: { ...n.value, kind: 'PAGE' } },
                    { url: (0, h.getRequestMeta)(a, 'initURL') },
                  ))
                )
                  return null;
                if (p && au)
                  throw Object.defineProperty(
                    Error('Invariant: postponed state should not be present on a resume request'),
                    '__NEXT_ERROR_CODE',
                    { value: 'E396', enumerable: !1, configurable: !0 },
                  );
                if (q.headers) {
                  let a = { ...q.headers };
                  for (let [c, d] of ((N && ak) || delete a[y.NEXT_CACHE_TAGS_HEADER],
                  Object.entries(a)))
                    if (void 0 !== d)
                      if (Array.isArray(d)) for (let a of d) b.appendHeader(c, a);
                      else ('number' == typeof d && (d = d.toString()), b.appendHeader(c, d));
                }
                let s = null == (g = q.headers) ? void 0 : g[y.NEXT_CACHE_TAGS_HEADER];
                if (
                  (N && ak && s && 'string' == typeof s && b.setHeader(y.NEXT_CACHE_TAGS_HEADER, s),
                  !q.status || (ap && ar) || (b.statusCode = q.status),
                  !N && q.status && F.RedirectStatusCode[q.status] && ap && (b.statusCode = 200),
                  p && b.setHeader(t.NEXT_DID_POSTPONE_HEADER, '1'),
                  ap && !_)
                ) {
                  if (void 0 === q.rscData) {
                    if (q.postponed)
                      throw Object.defineProperty(
                        Error('Invariant: Expected postponed to be undefined'),
                        '__NEXT_ERROR_CODE',
                        { value: 'E372', enumerable: !1, configurable: !0 },
                      );
                    return (0, A.sendRenderResult)({
                      req: a,
                      res: b,
                      generateEtags: ad.generateEtags,
                      poweredByHeader: ad.poweredByHeader,
                      result: q.html,
                      cacheControl: av ? { revalidate: 0, expire: void 0 } : n.cacheControl,
                    });
                  }
                  return (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: x.default.fromStatic(q.rscData, t.RSC_CONTENT_TYPE_HEADER),
                    cacheControl: n.cacheControl,
                  });
                }
                let u = q.html;
                if (!p || N || ap)
                  return (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: u,
                    cacheControl: n.cacheControl,
                  });
                if (as)
                  return (
                    u.push(
                      new ReadableStream({
                        start(a) {
                          (a.enqueue(z.ENCODED_TAGS.CLOSED.BODY_AND_HTML), a.close());
                        },
                      }),
                    ),
                    (0, A.sendRenderResult)({
                      req: a,
                      res: b,
                      generateEtags: ad.generateEtags,
                      poweredByHeader: ad.poweredByHeader,
                      result: u,
                      cacheControl: { revalidate: 0, expire: void 0 },
                    })
                  );
                let w = new TransformStream();
                return (
                  u.push(w.readable),
                  m({ span: c, postponed: q.postponed, fallbackRouteParams: null })
                    .then(async (a) => {
                      var b, c;
                      if (!a)
                        throw Object.defineProperty(
                          Error('Invariant: expected a result to be returned'),
                          '__NEXT_ERROR_CODE',
                          { value: 'E463', enumerable: !1, configurable: !0 },
                        );
                      if ((null == (b = a.value) ? void 0 : b.kind) !== v.CachedRouteKind.APP_PAGE)
                        throw Object.defineProperty(
                          Error(
                            `Invariant: expected a page response, got ${null == (c = a.value) ? void 0 : c.kind}`,
                          ),
                          '__NEXT_ERROR_CODE',
                          { value: 'E305', enumerable: !1, configurable: !0 },
                        );
                      await a.value.html.pipeTo(w.writable);
                    })
                    .catch((a) => {
                      w.writable.abort(a).catch((a) => {
                        console.error("couldn't abort transformer", a);
                      });
                    }),
                  (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: u,
                    cacheControl: { revalidate: 0, expire: void 0 },
                  })
                );
              };
            if (!aF)
              return await aE.withPropagatedContext(a.headers, () =>
                aE.trace(
                  i.BaseServerSpan.handleRequest,
                  {
                    spanName: `${aD} ${a.url}`,
                    kind: g.SpanKind.SERVER,
                    attributes: { 'http.method': aD, 'http.target': a.url },
                  },
                  p,
                ),
              );
            await p(aF);
          } catch (b) {
            throw (
              b instanceof B.NoFallbackError ||
                (await K.onRequestError(
                  a,
                  b,
                  {
                    routerKind: 'App Router',
                    routePath: G,
                    routeType: 'render',
                    revalidateReason: (0, f.c)({ isRevalidate: ak, isOnDemandRevalidate: ah }),
                  },
                  ac,
                )),
              b
            );
          }
        }
      },
      91864: (a, b, c) => {
        'use strict';
        c.d(b, { H$: () => e, hD: () => f, nr: () => h });
        var d = c(41921);
        let e = 'http://localhost:4000';
        class f extends Error {
          constructor(a, b, c) {
            (super(b), (this.status = a), (this.body = c));
          }
        }
        async function g() {
          let a = d.n.getState().refreshToken;
          if (!a) return null;
          let b = await fetch(`${e}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: a }),
          });
          if (!b.ok) return (d.n.getState().clear(), null);
          let c = await b.json();
          return (d.n.getState().setTokens(c), c.accessToken);
        }
        async function h(a, b = {}) {
          let { skipAuth: c, ...i } = b,
            j = new Headers(i.headers);
          if (!c) {
            let a = d.n.getState().accessToken;
            a && j.set('Authorization', `Bearer ${a}`);
            let b = d.n.getState().sessionId;
            b && j.set('x-session-fingerprint', b);
          }
          let k = i.body;
          null == k ||
            k instanceof FormData ||
            ('object' != typeof k ||
              k instanceof Blob ||
              k instanceof ArrayBuffer ||
              (k = JSON.stringify(k)),
            j.has('Content-Type') || j.set('Content-Type', 'application/json'));
          let l = await fetch(`${e}${a}`, { ...i, body: k, headers: j });
          if (401 === l.status && !c) {
            let b = await g();
            b &&
              (j.set('Authorization', `Bearer ${b}`),
              (l = await fetch(`${e}${a}`, { ...i, body: k, headers: j })));
          }
          let m = await l.text(),
            n = null;
          if (m)
            try {
              n = JSON.parse(m);
            } catch {
              n = { raw: m };
            }
          if (!l.ok) {
            let a =
              'object' == typeof n && null !== n && 'message' in n
                ? String(n.message)
                : l.statusText;
            throw new f(l.status, a, n);
          }
          return n;
        }
      },
    }));
  var b = require('../../../webpack-runtime.js');
  b.C(a);
  var c = b.X(0, [263, 914, 840], () => b((b.s = 89987)));
  module.exports = c;
})();
