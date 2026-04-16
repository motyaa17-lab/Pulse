(() => {
  var a = {};
  ((a.id = 185),
    (a.ids = [185]),
    (a.modules = {
      261: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/router/utils/app-paths');
      },
      3295: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/after-task-async-storage.external.js');
      },
      10846: (a) => {
        'use strict';
        a.exports = require('next/dist/compiled/next-server/app-page.runtime.prod.js');
      },
      19121: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/action-async-storage.external.js');
      },
      19421: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 90762));
      },
      21820: (a) => {
        'use strict';
        a.exports = require('os');
      },
      26713: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/router/utils/is-bot');
      },
      27910: (a) => {
        'use strict';
        a.exports = require('stream');
      },
      28354: (a) => {
        'use strict';
        a.exports = require('util');
      },
      29021: (a) => {
        'use strict';
        a.exports = require('fs');
      },
      29294: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/work-async-storage.external.js');
      },
      33873: (a) => {
        'use strict';
        a.exports = require('path');
      },
      34631: (a) => {
        'use strict';
        a.exports = require('tls');
      },
      37981: (a, b, c) => {
        Promise.resolve().then(c.bind(c, 46592));
      },
      38549: (a, b, c) => {
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
                  '(app)',
                  {
                    children: [
                      'chats',
                      {
                        children: [
                          '[chatId]',
                          {
                            children: [
                              '__PAGE__',
                              {},
                              {
                                page: [
                                  () => Promise.resolve().then(c.bind(c, 90762)),
                                  'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\chats\\[chatId]\\page.tsx',
                                ],
                              },
                            ],
                          },
                          {},
                        ],
                      },
                      {
                        layout: [
                          () => Promise.resolve().then(c.bind(c, 23803)),
                          'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\chats\\layout.tsx',
                        ],
                      },
                    ],
                  },
                  {
                    layout: [
                      () => Promise.resolve().then(c.bind(c, 74711)),
                      'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\layout.tsx',
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
          I = ['C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\chats\\[chatId]\\page.tsx'],
          J = { require: c, loadChunk: () => Promise.resolve() },
          K = new d.AppPageRouteModule({
            definition: {
              kind: e.RouteKind.APP_PAGE,
              page: '/(app)/chats/[chatId]/page',
              pathname: '/chats/[chatId]',
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
          let G = '/(app)/chats/[chatId]/page';
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
      41025: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/dynamic-access-async-storage.external.js');
      },
      46592: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => aa }));
        var d = c(78157),
          e = c(94496),
          f = c.n(e),
          g = c(31768),
          h = c(71159),
          i = c(32315),
          j = c(14380),
          k = c(91864),
          l = c(65081);
        function m(a, b, c) {
          let d,
            e = c.initialDeps ?? [],
            f = !0;
          function g() {
            var g, h, i;
            let j, k;
            c.key && (null == (g = c.debug) ? void 0 : g.call(c)) && (j = Date.now());
            let l = a();
            if (!(l.length !== e.length || l.some((a, b) => e[b] !== a))) return d;
            if (
              ((e = l),
              c.key && (null == (h = c.debug) ? void 0 : h.call(c)) && (k = Date.now()),
              (d = b(...l)),
              c.key && (null == (i = c.debug) ? void 0 : i.call(c)))
            ) {
              let a = Math.round((Date.now() - j) * 100) / 100,
                b = Math.round((Date.now() - k) * 100) / 100,
                d = b / 16,
                e = (a, b) => {
                  for (a = String(a); a.length < b; ) a = ' ' + a;
                  return a;
                };
              console.info(
                `%c⏱ ${e(b, 5)} /${e(a, 5)} ms`,
                `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * d, 120))}deg 100% 31%);`,
                null == c ? void 0 : c.key,
              );
            }
            return (
              (null == c ? void 0 : c.onChange) && !(f && c.skipInitialOnChange) && c.onChange(d),
              (f = !1),
              d
            );
          }
          return (
            (g.updateDeps = (a) => {
              e = a;
            }),
            g
          );
        }
        function n(a, b) {
          if (void 0 !== a) return a;
          throw Error(`Unexpected undefined${b ? `: ${b}` : ''}`);
        }
        let o = (a) => {
            let { offsetWidth: b, offsetHeight: c } = a;
            return { width: b, height: c };
          },
          p = (a) => a,
          q = (a) => {
            let b = Math.max(a.startIndex - a.overscan, 0),
              c = Math.min(a.endIndex + a.overscan, a.count - 1),
              d = [];
            for (let a = b; a <= c; a++) d.push(a);
            return d;
          },
          r = (a, b) => {
            let c = a.scrollElement;
            if (!c) return;
            let d = a.targetWindow;
            if (!d) return;
            let e = (a) => {
              let { width: c, height: d } = a;
              b({ width: Math.round(c), height: Math.round(d) });
            };
            if ((e(o(c)), !d.ResizeObserver)) return () => {};
            let f = new d.ResizeObserver((b) => {
              let d = () => {
                let a = b[0];
                if (null == a ? void 0 : a.borderBoxSize) {
                  let b = a.borderBoxSize[0];
                  if (b) return void e({ width: b.inlineSize, height: b.blockSize });
                }
                e(o(c));
              };
              a.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(d) : d();
            });
            return (
              f.observe(c, { box: 'border-box' }),
              () => {
                f.unobserve(c);
              }
            );
          },
          s = { passive: !0 },
          t = 'undefined' == typeof window || 'onscrollend' in window,
          u = (a, b) => {
            let c = a.scrollElement;
            if (!c) return;
            let d = a.targetWindow;
            if (!d) return;
            let e = 0,
              f =
                a.options.useScrollendEvent && t
                  ? () => void 0
                  : ((a, b, c) => {
                      let d;
                      return function (...e) {
                        (a.clearTimeout(d), (d = a.setTimeout(() => b.apply(this, e), c)));
                      };
                    })(
                      d,
                      () => {
                        b(e, !1);
                      },
                      a.options.isScrollingResetDelay,
                    ),
              g = (d) => () => {
                let { horizontal: g, isRtl: h } = a.options;
                ((e = g ? c.scrollLeft * ((h && -1) || 1) : c.scrollTop), f(), b(e, d));
              },
              h = g(!0),
              i = g(!1);
            c.addEventListener('scroll', h, s);
            let j = a.options.useScrollendEvent && t;
            return (
              j && c.addEventListener('scrollend', i, s),
              () => {
                (c.removeEventListener('scroll', h), j && c.removeEventListener('scrollend', i));
              }
            );
          },
          v = (a, b, c) => {
            if (null == b ? void 0 : b.borderBoxSize) {
              let a = b.borderBoxSize[0];
              if (a) return Math.round(a[c.options.horizontal ? 'inlineSize' : 'blockSize']);
            }
            return a[c.options.horizontal ? 'offsetWidth' : 'offsetHeight'];
          },
          w = (a, { adjustments: b = 0, behavior: c }, d) => {
            var e, f;
            null == (f = null == (e = d.scrollElement) ? void 0 : e.scrollTo) ||
              f.call(e, { [d.options.horizontal ? 'left' : 'top']: a + b, behavior: c });
          };
        class x {
          constructor(a) {
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
                var a, b, c;
                return (
                  (null ==
                  (c =
                    null == (b = null == (a = this.targetWindow) ? void 0 : a.performance)
                      ? void 0
                      : b.now)
                    ? void 0
                    : c.call(b)) ?? Date.now()
                );
              }),
              (this.observer = (() => {
                let a = null,
                  b = () =>
                    a ||
                    (this.targetWindow && this.targetWindow.ResizeObserver
                      ? (a = new this.targetWindow.ResizeObserver((a) => {
                          a.forEach((a) => {
                            let b = () => {
                              let b = a.target,
                                c = this.indexFromElement(b);
                              if (!b.isConnected) return void this.observer.unobserve(b);
                              this.shouldMeasureDuringScroll(c) &&
                                this.resizeItem(c, this.options.measureElement(b, a, this));
                            };
                            this.options.useAnimationFrameWithResizeObserver
                              ? requestAnimationFrame(b)
                              : b();
                          });
                        }))
                      : null);
                return {
                  disconnect: () => {
                    var c;
                    (null == (c = b()) || c.disconnect(), (a = null));
                  },
                  observe: (a) => {
                    var c;
                    return null == (c = b()) ? void 0 : c.observe(a, { box: 'border-box' });
                  },
                  unobserve: (a) => {
                    var c;
                    return null == (c = b()) ? void 0 : c.unobserve(a);
                  },
                };
              })()),
              (this.range = null),
              (this.setOptions = (a) => {
                (Object.entries(a).forEach(([b, c]) => {
                  void 0 === c && delete a[b];
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
                    getItemKey: p,
                    rangeExtractor: q,
                    onChange: () => {},
                    measureElement: v,
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
                    ...a,
                  }));
              }),
              (this.notify = (a) => {
                var b, c;
                null == (c = (b = this.options).onChange) || c.call(b, this, a);
              }),
              (this.maybeNotify = m(
                () => (
                  this.calculateRange(),
                  [
                    this.isScrolling,
                    this.range ? this.range.startIndex : null,
                    this.range ? this.range.endIndex : null,
                  ]
                ),
                (a) => {
                  this.notify(a);
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
                (this.unsubs.filter(Boolean).forEach((a) => a()),
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
                var a;
                let b = this.options.enabled ? this.options.getScrollElement() : null;
                if (this.scrollElement !== b) {
                  if ((this.cleanup(), !b)) return void this.maybeNotify();
                  ((this.scrollElement = b),
                    this.scrollElement && 'ownerDocument' in this.scrollElement
                      ? (this.targetWindow = this.scrollElement.ownerDocument.defaultView)
                      : (this.targetWindow =
                          (null == (a = this.scrollElement) ? void 0 : a.window) ?? null),
                    this.elementsCache.forEach((a) => {
                      this.observer.observe(a);
                    }),
                    this.unsubs.push(
                      this.options.observeElementRect(this, (a) => {
                        ((this.scrollRect = a), this.maybeNotify());
                      }),
                    ),
                    this.unsubs.push(
                      this.options.observeElementOffset(this, (a, b) => {
                        ((this.scrollAdjustments = 0),
                          (this.scrollDirection = b
                            ? this.getScrollOffset() < a
                              ? 'forward'
                              : 'backward'
                            : null),
                          (this.scrollOffset = a),
                          (this.isScrolling = b),
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
              (this.getFurthestMeasurement = (a, b) => {
                let c = new Map(),
                  d = new Map();
                for (let e = b - 1; e >= 0; e--) {
                  let b = a[e];
                  if (c.has(b.lane)) continue;
                  let f = d.get(b.lane);
                  if (
                    (null == f || b.end > f.end
                      ? d.set(b.lane, b)
                      : b.end < f.end && c.set(b.lane, !0),
                    c.size === this.options.lanes)
                  )
                    break;
                }
                return d.size === this.options.lanes
                  ? Array.from(d.values()).sort((a, b) =>
                      a.end === b.end ? a.index - b.index : a.end - b.end,
                    )[0]
                  : void 0;
              }),
              (this.getMeasurementOptions = m(
                () => [
                  this.options.count,
                  this.options.paddingStart,
                  this.options.scrollMargin,
                  this.options.getItemKey,
                  this.options.enabled,
                  this.options.lanes,
                ],
                (a, b, c, d, e, f) => (
                  void 0 !== this.prevLanes && this.prevLanes !== f && (this.lanesChangedFlag = !0),
                  (this.prevLanes = f),
                  (this.pendingMeasuredCacheIndexes = []),
                  {
                    count: a,
                    paddingStart: b,
                    scrollMargin: c,
                    getItemKey: d,
                    enabled: e,
                    lanes: f,
                  }
                ),
                { key: !1 },
              )),
              (this.getMeasurements = m(
                () => [this.getMeasurementOptions(), this.itemSizeCache],
                (
                  {
                    count: a,
                    paddingStart: b,
                    scrollMargin: c,
                    getItemKey: d,
                    enabled: e,
                    lanes: f,
                  },
                  g,
                ) => {
                  if (!e)
                    return (
                      (this.measurementsCache = []),
                      this.itemSizeCache.clear(),
                      this.laneAssignments.clear(),
                      []
                    );
                  if (this.laneAssignments.size > a)
                    for (let b of this.laneAssignments.keys())
                      b >= a && this.laneAssignments.delete(b);
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
                      this.measurementsCache.forEach((a) => {
                        this.itemSizeCache.set(a.key, a.size);
                      })));
                  let h = this.lanesSettling
                    ? 0
                    : this.pendingMeasuredCacheIndexes.length > 0
                      ? Math.min(...this.pendingMeasuredCacheIndexes)
                      : 0;
                  ((this.pendingMeasuredCacheIndexes = []),
                    this.lanesSettling &&
                      this.measurementsCache.length === a &&
                      (this.lanesSettling = !1));
                  let i = this.measurementsCache.slice(0, h),
                    j = Array(f).fill(void 0);
                  for (let a = 0; a < h; a++) {
                    let b = i[a];
                    b && (j[b.lane] = a);
                  }
                  for (let e = h; e < a; e++) {
                    let a,
                      f,
                      h = d(e),
                      k = this.laneAssignments.get(e);
                    if (void 0 !== k && this.options.lanes > 1) {
                      let d = j[(a = k)],
                        e = void 0 !== d ? i[d] : void 0;
                      f = e ? e.end + this.options.gap : b + c;
                    } else {
                      let d =
                        1 === this.options.lanes ? i[e - 1] : this.getFurthestMeasurement(i, e);
                      ((f = d ? d.end + this.options.gap : b + c),
                        (a = d ? d.lane : e % this.options.lanes),
                        this.options.lanes > 1 && this.laneAssignments.set(e, a));
                    }
                    let l = g.get(h),
                      m = 'number' == typeof l ? l : this.options.estimateSize(e),
                      n = f + m;
                    ((i[e] = { index: e, start: f, size: m, end: n, key: h, lane: a }), (j[a] = e));
                  }
                  return ((this.measurementsCache = i), i);
                },
                { key: !1, debug: () => this.options.debug },
              )),
              (this.calculateRange = m(
                () => [
                  this.getMeasurements(),
                  this.getSize(),
                  this.getScrollOffset(),
                  this.options.lanes,
                ],
                (a, b, c, d) =>
                  (this.range =
                    a.length > 0 && b > 0
                      ? (function ({ measurements: a, outerSize: b, scrollOffset: c, lanes: d }) {
                          let e = a.length - 1;
                          if (a.length <= d) return { startIndex: 0, endIndex: e };
                          let f = y(0, e, (b) => a[b].start, c),
                            g = f;
                          if (1 === d) for (; g < e && a[g].end < c + b; ) g++;
                          else if (d > 1) {
                            let h = Array(d).fill(0);
                            for (; g < e && h.some((a) => a < c + b); ) {
                              let b = a[g];
                              ((h[b.lane] = b.end), g++);
                            }
                            let i = Array(d).fill(c + b);
                            for (; f >= 0 && i.some((a) => a >= c); ) {
                              let b = a[f];
                              ((i[b.lane] = b.start), f--);
                            }
                            ((f = Math.max(0, f - (f % d))),
                              (g = Math.min(e, g + (d - 1 - (g % d)))));
                          }
                          return { startIndex: f, endIndex: g };
                        })({ measurements: a, outerSize: b, scrollOffset: c, lanes: d })
                      : null),
                { key: !1, debug: () => this.options.debug },
              )),
              (this.getVirtualIndexes = m(
                () => {
                  let a = null,
                    b = null,
                    c = this.calculateRange();
                  return (
                    c && ((a = c.startIndex), (b = c.endIndex)),
                    this.maybeNotify.updateDeps([this.isScrolling, a, b]),
                    [this.options.rangeExtractor, this.options.overscan, this.options.count, a, b]
                  );
                },
                (a, b, c, d, e) =>
                  null === d || null === e
                    ? []
                    : a({ startIndex: d, endIndex: e, overscan: b, count: c }),
                { key: !1, debug: () => this.options.debug },
              )),
              (this.indexFromElement = (a) => {
                let b = this.options.indexAttribute,
                  c = a.getAttribute(b);
                return c
                  ? parseInt(c, 10)
                  : (console.warn(`Missing attribute name '${b}={index}' on measured element.`),
                    -1);
              }),
              (this.shouldMeasureDuringScroll = (a) => {
                var b;
                if (!this.scrollState || 'smooth' !== this.scrollState.behavior) return !0;
                let c =
                  this.scrollState.index ??
                  (null == (b = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))
                    ? void 0
                    : b.index);
                if (void 0 !== c && this.range) {
                  let b = Math.max(
                      this.options.overscan,
                      Math.ceil((this.range.endIndex - this.range.startIndex) / 2),
                    ),
                    d = Math.max(0, c - b),
                    e = Math.min(this.options.count - 1, c + b);
                  return a >= d && a <= e;
                }
                return !0;
              }),
              (this.measureElement = (a) => {
                if (!a)
                  return void this.elementsCache.forEach((a, b) => {
                    a.isConnected || (this.observer.unobserve(a), this.elementsCache.delete(b));
                  });
                let b = this.indexFromElement(a),
                  c = this.options.getItemKey(b),
                  d = this.elementsCache.get(c);
                (d !== a &&
                  (d && this.observer.unobserve(d),
                  this.observer.observe(a),
                  this.elementsCache.set(c, a)),
                  (!this.isScrolling || this.scrollState) &&
                    this.shouldMeasureDuringScroll(b) &&
                    this.resizeItem(b, this.options.measureElement(a, void 0, this)));
              }),
              (this.resizeItem = (a, b) => {
                var c;
                let d = this.measurementsCache[a];
                if (!d) return;
                let e = b - (this.itemSizeCache.get(d.key) ?? d.size);
                0 !== e &&
                  ((null == (c = this.scrollState) ? void 0 : c.behavior) !== 'smooth' &&
                    (void 0 !== this.shouldAdjustScrollPositionOnItemSizeChange
                      ? this.shouldAdjustScrollPositionOnItemSizeChange(d, e, this)
                      : d.start < this.getScrollOffset() + this.scrollAdjustments) &&
                    this._scrollToOffset(this.getScrollOffset(), {
                      adjustments: (this.scrollAdjustments += e),
                      behavior: void 0,
                    }),
                  this.pendingMeasuredCacheIndexes.push(d.index),
                  (this.itemSizeCache = new Map(this.itemSizeCache.set(d.key, b))),
                  this.notify(!1));
              }),
              (this.getVirtualItems = m(
                () => [this.getVirtualIndexes(), this.getMeasurements()],
                (a, b) => {
                  let c = [];
                  for (let d = 0, e = a.length; d < e; d++) {
                    let e = b[a[d]];
                    c.push(e);
                  }
                  return c;
                },
                { key: !1, debug: () => this.options.debug },
              )),
              (this.getVirtualItemForOffset = (a) => {
                let b = this.getMeasurements();
                if (0 !== b.length) return n(b[y(0, b.length - 1, (a) => n(b[a]).start, a)]);
              }),
              (this.getMaxScrollOffset = () => {
                if (!this.scrollElement) return 0;
                if ('scrollHeight' in this.scrollElement)
                  return this.options.horizontal
                    ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
                    : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
                {
                  let a = this.scrollElement.document.documentElement;
                  return this.options.horizontal
                    ? a.scrollWidth - this.scrollElement.innerWidth
                    : a.scrollHeight - this.scrollElement.innerHeight;
                }
              }),
              (this.getOffsetForAlignment = (a, b, c = 0) => {
                if (!this.scrollElement) return 0;
                let d = this.getSize(),
                  e = this.getScrollOffset();
                return (
                  'auto' === b && (b = a >= e + d ? 'end' : 'start'),
                  'center' === b ? (a += (c - d) / 2) : 'end' === b && (a -= d),
                  Math.max(Math.min(this.getMaxScrollOffset(), a), 0)
                );
              }),
              (this.getOffsetForIndex = (a, b = 'auto') => {
                a = Math.max(0, Math.min(a, this.options.count - 1));
                let c = this.getSize(),
                  d = this.getScrollOffset(),
                  e = this.measurementsCache[a];
                if (!e) return;
                if ('auto' === b)
                  if (e.end >= d + c - this.options.scrollPaddingEnd) b = 'end';
                  else {
                    if (!(e.start <= d + this.options.scrollPaddingStart)) return [d, b];
                    b = 'start';
                  }
                if ('end' === b && a === this.options.count - 1)
                  return [this.getMaxScrollOffset(), b];
                let f =
                  'end' === b
                    ? e.end + this.options.scrollPaddingEnd
                    : e.start - this.options.scrollPaddingStart;
                return [this.getOffsetForAlignment(f, b, e.size), b];
              }),
              (this.scrollToOffset = (a, { align: b = 'start', behavior: c = 'auto' } = {}) => {
                let d = this.getOffsetForAlignment(a, b),
                  e = this.now();
                ((this.scrollState = {
                  index: null,
                  align: b,
                  behavior: c,
                  startedAt: e,
                  lastTargetOffset: d,
                  stableFrames: 0,
                }),
                  this._scrollToOffset(d, { adjustments: void 0, behavior: c }),
                  this.scheduleScrollReconcile());
              }),
              (this.scrollToIndex = (a, { align: b = 'auto', behavior: c = 'auto' } = {}) => {
                a = Math.max(0, Math.min(a, this.options.count - 1));
                let d = this.getOffsetForIndex(a, b);
                if (!d) return;
                let [e, f] = d,
                  g = this.now();
                ((this.scrollState = {
                  index: a,
                  align: f,
                  behavior: c,
                  startedAt: g,
                  lastTargetOffset: e,
                  stableFrames: 0,
                }),
                  this._scrollToOffset(e, { adjustments: void 0, behavior: c }),
                  this.scheduleScrollReconcile());
              }),
              (this.scrollBy = (a, { behavior: b = 'auto' } = {}) => {
                let c = this.getScrollOffset() + a,
                  d = this.now();
                ((this.scrollState = {
                  index: null,
                  align: 'start',
                  behavior: b,
                  startedAt: d,
                  lastTargetOffset: c,
                  stableFrames: 0,
                }),
                  this._scrollToOffset(c, { adjustments: void 0, behavior: b }),
                  this.scheduleScrollReconcile());
              }),
              (this.getTotalSize = () => {
                var a;
                let b,
                  c = this.getMeasurements();
                if (0 === c.length) b = this.options.paddingStart;
                else if (1 === this.options.lanes)
                  b = (null == (a = c[c.length - 1]) ? void 0 : a.end) ?? 0;
                else {
                  let a = Array(this.options.lanes).fill(null),
                    d = c.length - 1;
                  for (; d >= 0 && a.some((a) => null === a); ) {
                    let b = c[d];
                    (null === a[b.lane] && (a[b.lane] = b.end), d--);
                  }
                  b = Math.max(...a.filter((a) => null !== a));
                }
                return Math.max(b - this.options.scrollMargin + this.options.paddingEnd, 0);
              }),
              (this._scrollToOffset = (a, { adjustments: b, behavior: c }) => {
                this.options.scrollToFn(a, { behavior: c, adjustments: b }, this);
              }),
              (this.measure = () => {
                ((this.itemSizeCache = new Map()),
                  (this.laneAssignments = new Map()),
                  this.notify(!1));
              }),
              this.setOptions(a));
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
            let a =
                null != this.scrollState.index
                  ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align)
                  : void 0,
              b = a ? a[0] : this.scrollState.lastTargetOffset,
              c = b !== this.scrollState.lastTargetOffset;
            if (!c && 1.01 > Math.abs(b - this.getScrollOffset())) {
              if ((this.scrollState.stableFrames++, this.scrollState.stableFrames >= 1)) {
                this.scrollState = null;
                return;
              }
            } else
              ((this.scrollState.stableFrames = 0),
                c &&
                  ((this.scrollState.lastTargetOffset = b),
                  (this.scrollState.behavior = 'auto'),
                  this._scrollToOffset(b, { adjustments: void 0, behavior: 'auto' })));
            this.scheduleScrollReconcile();
          }
        }
        let y = (a, b, c, d) => {
            for (; a <= b; ) {
              let e = ((a + b) / 2) | 0,
                f = c(e);
              if (f < d) a = e + 1;
              else {
                if (!(f > d)) return e;
                b = e - 1;
              }
            }
            return a > 0 ? a - 1 : 0;
          },
          z = 'undefined' != typeof document ? g.useLayoutEffect : g.useEffect;
        function A(a, b, c, d) {
          a.setQueriesData({ queryKey: ['chats'] }, (a) => {
            if (!a) return a;
            let e = a.findIndex((a) => a.id === b);
            if (e < 0) return a;
            let f = [...a];
            return (
              (f[e] = { ...f[e], lastMessagePreview: c.slice(0, 160), lastMessageAt: d }),
              f.sort((a, b) =>
                a.isPinned !== b.isPinned
                  ? a.isPinned
                    ? -1
                    : 1
                  : new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
              ),
              f
            );
          });
        }
        var B = c(32303),
          C = c(41921),
          D = c(15351);
        function E(a) {
          if (!a) return null;
          let b = a.split('.');
          if (b.length < 2) return null;
          try {
            let a = b[1].replace(/-/g, '+').replace(/_/g, '/'),
              c = a.length % 4 == 0 ? '' : '='.repeat(4 - (a.length % 4)),
              d = atob(a + c),
              e = JSON.parse(d);
            return 'string' == typeof e.sub ? e.sub : null;
          } catch {
            return null;
          }
        }
        async function F(a, b, c, d) {
          let e = new FormData();
          (e.append('file', a), e.append('kind', b));
          let f = { Authorization: `Bearer ${c}` };
          d && (f['x-session-fingerprint'] = d);
          let g = await fetch(`${k.H$}/media/upload`, { method: 'POST', headers: f, body: e });
          if (!g.ok) throw Error('upload failed');
          return await g.json();
        }
        var G = c(19154);
        let H = (0, G.v)((a) => ({
          byChat: {},
          add: (b, c) =>
            a((a) => ({
              byChat: { ...a.byChat, [b]: [...(a.byChat[b] ?? []), { ...c, chatId: b }] },
            })),
          remove: (b, c) =>
            a((a) => ({
              byChat: { ...a.byChat, [b]: (a.byChat[b] ?? []).filter((a) => a.localId !== c) },
            })),
          clear: (b) =>
            a((a) => {
              let { [b]: c, ...d } = a.byChat;
              return { byChat: d };
            }),
        }));
        var I = c(86539),
          J = c(7904);
        let K = (0, G.v)()(
          (0, J.Zr)(
            (a) => ({
              drafts: {},
              setDraft: (b, c) =>
                a((a) => {
                  if (!c) {
                    let { [b]: c, ...d } = a.drafts;
                    return { drafts: d };
                  }
                  return { drafts: { ...a.drafts, [b]: c } };
                }),
              clearDraft: (b) =>
                a((a) => {
                  let { [b]: c, ...d } = a.drafts;
                  return { drafts: d };
                }),
            }),
            { name: 'pulse-drafts' },
          ),
        );
        var L = c(53704);
        let M = [];
        function N({ className: a }) {
          return (0, d.jsx)('svg', {
            className: a,
            width: '22',
            height: '22',
            viewBox: '0 0 24 24',
            fill: 'none',
            'aria-hidden': !0,
            children: (0, d.jsx)('path', {
              d: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
          });
        }
        function O({ className: a }) {
          return (0, d.jsx)('svg', {
            className: a,
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'none',
            'aria-hidden': !0,
            children: (0, d.jsx)('path', {
              d: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
          });
        }
        function P({ chatId: a, replyTo: b, onCancelReply: c, editing: e, onCancelEdit: f }) {
          let h = (0, L.k)(),
            [l, m] = (0, g.useState)(''),
            [n, o] = (0, g.useState)(!1),
            p = (0, g.useRef)(null),
            q = (0, g.useRef)(null),
            r = (0, g.useRef)(null),
            s = (0, i.jE)(),
            t = (0, C.n)((a) => a.accessToken),
            u = (0, C.n)((a) => a.sessionId);
          (K((b) => b.drafts[a] ?? ''), K((a) => a.setDraft));
          let v = K((a) => a.clearDraft),
            w = H((b) => b.byChat[a]) ?? M,
            x = H((a) => a.add),
            y = H((a) => a.remove),
            z = H((a) => a.clear),
            { data: G } = (0, j.I)({ queryKey: ['me'], queryFn: () => (0, k.nr)('/users/me') }),
            J = (0, I.n)({
              mutationFn: async (b) => {
                let c = {
                  text: b.text,
                  replyToMessageId: b.replyTo?.id,
                  attachments: b.attachments.length ? b.attachments : void 0,
                };
                return c.text?.trim() || c.attachments?.length
                  ? (0, k.nr)(`/chats/${a}/messages`, { method: 'POST', body: c })
                  : null;
              },
              onMutate: (b) => {
                let c = E(t) ?? G?.id ?? null;
                if ((!b.text?.trim() && !b.attachments.length) || !c) return;
                let d = s.getQueryData(['messages', a]),
                  e = `optimistic:${Date.now()}`,
                  f = {
                    id: e,
                    chatId: a,
                    senderId: c,
                    type: b.attachments.length && !b.text?.trim() ? 'FILE' : 'TEXT',
                    text: b.text?.trim() ? b.text : null,
                    clientTempId: null,
                    replyToMessageId: b.replyTo?.id ?? null,
                    forwardedFromMessageId: null,
                    editedAt: null,
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                    attachments: b.attachments.map((a, b) => ({
                      id: `optimistic-att:${b}`,
                      kind: a.kind,
                      fileName: a.fileName,
                      mimeType: a.mimeType,
                      sizeBytes: a.sizeBytes,
                      url: a.url,
                      durationSec: a.durationSec ?? null,
                    })),
                    reactions: [],
                    replyTo: b.replyTo
                      ? {
                          id: b.replyTo.id,
                          text: b.replyTo.text,
                          senderId: b.replyTo.senderId,
                          deletedAt: b.replyTo.deletedAt ?? null,
                        }
                      : void 0,
                    deliveryStatus: 'SENDING',
                  };
                return (
                  s.setQueryData(['messages', a], (a) =>
                    a ? { ...a, items: [...a.items, f] } : { items: [f], nextCursor: null },
                  ),
                  { prev: d, tempId: e }
                );
              },
              onError: (b, c, d) => {
                d?.prev !== void 0 && s.setQueryData(['messages', a], d.prev);
              },
              onSuccess: (b, c, d) => {
                b &&
                  (s.setQueryData(['messages', a], (a) => {
                    if (!a) return { items: [b], nextCursor: null };
                    let c = a.items.filter((a) => a.id !== d?.tempId),
                      e = c.some((a) => a.id === b.id) ? c : [...c, b];
                    return { ...a, items: e };
                  }),
                  A(s, a, b.text?.trim() ? b.text.slice(0, 160) : '[Media]', b.createdAt));
              },
              onSettled: () => {
                o(!1);
              },
            }),
            P = (0, I.n)({
              mutationFn: async (b) =>
                (0, k.nr)(`/chats/${a}/messages/${b.messageId}`, {
                  method: 'PATCH',
                  body: { text: b.text },
                }),
              onMutate: async (b) => {
                let c = s.getQueryData(['messages', a]);
                return (
                  s.setQueryData(['messages', a], (a) =>
                    a
                      ? {
                          ...a,
                          items: a.items.map((a) =>
                            a.id === b.messageId
                              ? { ...a, text: b.text, editedAt: new Date().toISOString() }
                              : a,
                          ),
                        }
                      : a,
                  ),
                  { prev: c }
                );
              },
              onError: (b, c, d) => {
                d?.prev && s.setQueryData(['messages', a], d.prev);
              },
              onSuccess: (b) => {
                (s.setQueryData(['messages', a], (a) =>
                  a ? { ...a, items: a.items.map((a) => (a.id === b.id ? b : a)) } : a,
                ),
                  A(s, a, b.text?.trim() ? b.text.slice(0, 160) : '[Media]', b.createdAt));
              },
              onSettled: () => o(!1),
            }),
            Q = (0, g.useCallback)(() => {
              let d = l.trim(),
                g = w.map((a) => ({
                  storageKey: a.storageKey,
                  kind: a.kind,
                  fileName: a.fileName,
                  mimeType: a.mimeType,
                  sizeBytes: a.sizeBytes,
                  url: a.url,
                }));
              if (d || 0 !== g.length) {
                if (e) {
                  (m(''),
                    f(),
                    o(!0),
                    window.setTimeout(() => o(!1), 250),
                    P.mutate({ text: d, messageId: e.id }));
                  return;
                }
                (m(''), v(a), z(a), c());
                try {
                  (0, B.Ol)()?.emit('message:typing', { chatId: a, typing: !1 });
                } catch {}
                (o(!0),
                  window.setTimeout(() => o(!1), 250),
                  J.mutate({ text: d, replyTo: b, attachments: g }));
              }
            }, [a, v, z, P, e, f, c, w, b, J, l]),
            R = (0, g.useCallback)(
              (a) => {
                'Enter' !== a.key || a.shiftKey || (a.preventDefault(), Q());
              },
              [Q],
            ),
            S = !!(l.trim() || w.length);
          return (
            (0, g.useCallback)(() => {
              let a = p.current;
              if (!a) return;
              a.style.height = '0px';
              let b = Math.min(a.scrollHeight, 132);
              a.style.height = `${Math.max(b, 40)}px`;
            }, []),
            (0, d.jsxs)('div', {
              className:
                'shrink-0 border-t border-line/75 bg-surface-elevated/98 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md dark:border-line/45 dark:bg-surface-elevated/98',
              children: [
                e &&
                  (0, d.jsxs)('div', {
                    className:
                      'mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                    children: [
                      (0, d.jsxs)('div', {
                        className: 'min-w-0 flex-1 border-l-2 border-amber-500/60 pl-2',
                        children: [
                          (0, d.jsx)('p', {
                            className:
                              'text-[0.6rem] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400',
                            children: 'Editing',
                          }),
                          (0, d.jsx)('p', {
                            className: 'truncate text-[12.5px] leading-snug text-ink',
                            children: e.text || 'Message',
                          }),
                        ],
                      }),
                      (0, d.jsx)('button', {
                        type: 'button',
                        className:
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                        onClick: () => {
                          (m(''), f());
                        },
                        'aria-label': 'Cancel edit',
                        children: (0, d.jsx)('svg', {
                          width: '16',
                          height: '16',
                          viewBox: '0 0 24 24',
                          fill: 'none',
                          'aria-hidden': !0,
                          children: (0, d.jsx)('path', {
                            d: 'M18 6L6 18M6 6l12 12',
                            stroke: 'currentColor',
                            strokeWidth: '2',
                            strokeLinecap: 'round',
                          }),
                        }),
                      }),
                    ],
                  }),
                b &&
                  (0, d.jsxs)('div', {
                    className:
                      'mb-1.5 flex items-start gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                    children: [
                      (0, d.jsxs)('div', {
                        className: 'min-w-0 flex-1 border-l-2 border-accent/55 pl-2',
                        children: [
                          (0, d.jsx)('p', {
                            className:
                              'text-[0.6rem] font-bold uppercase tracking-[0.1em] text-accent',
                            children: 'Reply',
                          }),
                          (0, d.jsx)('p', {
                            className: 'truncate text-[12.5px] leading-snug text-ink',
                            children: b.text || 'Attachment',
                          }),
                        ],
                      }),
                      (0, d.jsx)('button', {
                        type: 'button',
                        className:
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                        onClick: c,
                        'aria-label': 'Cancel reply',
                        children: (0, d.jsx)('svg', {
                          width: '16',
                          height: '16',
                          viewBox: '0 0 24 24',
                          fill: 'none',
                          'aria-hidden': !0,
                          children: (0, d.jsx)('path', {
                            d: 'M18 6L6 18M6 6l12 12',
                            stroke: 'currentColor',
                            strokeWidth: '2',
                            strokeLinecap: 'round',
                          }),
                        }),
                      }),
                    ],
                  }),
                w.length > 0 &&
                  (0, d.jsx)('div', {
                    className: 'mb-1.5 flex flex-wrap gap-1.5',
                    children: w.map((b) =>
                      (0, d.jsxs)(
                        'div',
                        {
                          className:
                            'group flex max-w-full items-center gap-2 rounded-xl border border-line/75 bg-surface-muted/55 px-2.5 py-1.5 dark:border-line/45 dark:bg-surface-muted/35',
                          children: [
                            'image' === b.kind
                              ? (0, d.jsx)('img', {
                                  src: b.url,
                                  alt: '',
                                  className:
                                    'h-9 w-9 rounded-lg object-cover ring-1 ring-line/45 dark:ring-line/35',
                                })
                              : (0, d.jsx)('div', {
                                  className:
                                    'flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated/70 text-xs font-semibold text-ink-muted ring-1 ring-line/45 dark:bg-surface-elevated/40 dark:ring-line/35',
                                  children: 'video' === b.kind ? 'VID' : 'FILE',
                                }),
                            (0, d.jsxs)('div', {
                              className: 'min-w-0 flex-1',
                              children: [
                                (0, d.jsx)('p', {
                                  className: 'truncate text-[12.5px] font-medium text-ink',
                                  children: b.fileName,
                                }),
                                (0, d.jsxs)('p', {
                                  className: 'text-[11px] text-ink-muted',
                                  children: [Math.max(1, Math.round(b.sizeBytes / 1024)), ' KB'],
                                }),
                              ],
                            }),
                            (0, d.jsx)('button', {
                              type: 'button',
                              className:
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-elevated hover:text-ink',
                              onClick: () => y(a, b.localId),
                              'aria-label': 'Remove attachment',
                              children: (0, d.jsx)('svg', {
                                width: '16',
                                height: '16',
                                viewBox: '0 0 24 24',
                                fill: 'none',
                                'aria-hidden': !0,
                                children: (0, d.jsx)('path', {
                                  d: 'M18 6L6 18M6 6l12 12',
                                  stroke: 'currentColor',
                                  strokeWidth: '2',
                                  strokeLinecap: 'round',
                                }),
                              }),
                            }),
                          ],
                        },
                        b.localId,
                      ),
                    ),
                  }),
                (0, d.jsxs)('div', {
                  className:
                    'flex items-end gap-1 rounded-[1.35rem] border border-line/80 bg-surface-muted/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-line/50 dark:bg-surface-muted/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
                  children: [
                    (0, d.jsxs)('label', {
                      className: (0, D.cn)(
                        'mb-px flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[1rem] text-ink-muted transition',
                        'hover:bg-surface-elevated/90 hover:text-accent active:scale-[0.97] dark:hover:bg-surface-elevated/55',
                      ),
                      title: 'Attach file',
                      children: [
                        (0, d.jsx)(N, { className: 'h-[1.15rem] w-[1.15rem] opacity-90' }),
                        (0, d.jsx)('input', {
                          type: 'file',
                          className: 'sr-only',
                          onChange: async (b) => {
                            let c = b.target.files?.[0];
                            if (!c) return;
                            let d = c.type.startsWith('image/')
                              ? 'image'
                              : c.type.startsWith('video/')
                                ? 'video'
                                : 'file';
                            if (!t) return;
                            let e = await F(c, d, t, u);
                            (x(a, {
                              localId: `pending:${Date.now()}`,
                              storageKey: e.storageKey,
                              url: e.url,
                              fileName: e.fileName,
                              mimeType: e.mimeType,
                              sizeBytes: e.sizeBytes,
                              kind: d,
                              createdAt: Date.now(),
                            }),
                              (b.target.value = ''));
                          },
                        }),
                      ],
                    }),
                    (0, d.jsx)('textarea', {
                      ref: p,
                      rows: 1,
                      value: l,
                      onChange: (b) => {
                        let c = b.target.value;
                        (m(c),
                          e ||
                            (r.current && clearTimeout(r.current),
                            (r.current = setTimeout(() => {
                              let b = (0, B.Ol)();
                              if (!b?.connected) return;
                              let d = !!c.trim();
                              try {
                                b.emit('message:typing', { chatId: a, typing: d });
                              } catch {}
                            }, 120)),
                            q.current && clearTimeout(q.current),
                            (q.current = setTimeout(() => {
                              try {
                                (0, B.Ol)()?.emit('message:typing', { chatId: a, typing: !1 });
                              } catch {}
                            }, 2200))));
                      },
                      onKeyDown: R,
                      onBlur: () => {
                        (q.current && clearTimeout(q.current),
                          r.current && clearTimeout(r.current));
                        try {
                          (0, B.Ol)()?.emit('message:typing', { chatId: a, typing: !1 });
                        } catch {}
                      },
                      placeholder: h(e ? 'editMessage' : 'message'),
                      className: (0, D.cn)(
                        'mb-px max-h-[8.25rem] min-h-[2.5rem] flex-1 resize-none bg-transparent py-2.5 pr-1 text-[15px] leading-[1.45] text-ink placeholder:text-ink-muted/65 outline-none',
                      ),
                      'aria-label': 'Message text',
                    }),
                    (0, d.jsx)('button', {
                      type: 'button',
                      disabled: !S,
                      onClick: Q,
                      title: h('sendMessage'),
                      className: (0, D.cn)(
                        'mb-px flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                        S
                          ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/10 ring-1 ring-black/[0.05] hover:brightness-[1.04] active:scale-[0.96] dark:shadow-black/35 dark:ring-white/10'
                          : 'cursor-not-allowed bg-surface-muted/80 text-ink-muted/45 dark:bg-surface-elevated/45',
                      ),
                      'aria-label': h('sendMessage'),
                      children: n
                        ? (0, d.jsx)('span', {
                            className:
                              'h-4 w-4 animate-spin rounded-full border-2 border-bubble-out-ink/30 border-t-bubble-out-ink',
                          })
                        : (0, d.jsx)(O, { className: 'ml-px h-[1.05rem] w-[1.05rem]' }),
                    }),
                  ],
                }),
                (0, d.jsxs)('p', {
                  className: 'mt-1 px-1 text-center text-[0.625rem] text-ink-muted/75',
                  children: [
                    (0, d.jsx)('kbd', {
                      className:
                        'rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50',
                      children: 'Enter',
                    }),
                    ' ',
                    'to send \xb7',
                    ' ',
                    (0, d.jsx)('kbd', {
                      className:
                        'rounded border border-line/70 px-1 py-px font-sans text-[10px] dark:border-line/50',
                      children: 'Shift+Enter',
                    }),
                    ' ',
                    'new line',
                  ],
                }),
              ],
            })
          );
        }
        let Q = ['\uD83D\uDC4D', '❤️', '\uD83D\uDE02', '\uD83C\uDF89', '\uD83D\uDC40'];
        function R({
          open: a,
          anchorRef: b,
          onClose: c,
          actions: e,
          showReactions: f,
          onReact: h,
          closeOnScrollEl: i,
        }) {
          let j = (0, g.useRef)(null),
            [k, m] = (0, g.useState)({ top: 0, left: 0, origin: 'top' }),
            n = (0, g.useMemo)(() => e.filter((a) => !a.disabled), [e]);
          return a && 'undefined' != typeof document
            ? (0, l.createPortal)(
                (0, d.jsxs)('div', {
                  ref: j,
                  className: (0, D.cn)(
                    'fixed z-[120] w-[248px] overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift backdrop-blur',
                    'dark:border-line/55 dark:bg-surface-elevated/98',
                  ),
                  style: { top: k.top, left: k.left },
                  role: 'menu',
                  'aria-label': 'Message actions',
                  children: [
                    f &&
                      (0, d.jsxs)('div', {
                        className:
                          'flex items-center justify-between gap-1 border-b border-line/70 px-2.5 py-2 dark:border-line/45',
                        children: [
                          Q.map((a) =>
                            (0, d.jsx)(
                              'button',
                              {
                                type: 'button',
                                className:
                                  'flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-surface-muted/80 active:scale-[0.98] dark:hover:bg-surface-muted/35',
                                onClick: () => {
                                  (h(a), c());
                                },
                                'aria-label': `React ${a}`,
                                children: a,
                              },
                              a,
                            ),
                          ),
                          (0, d.jsx)('div', {
                            className:
                              'ml-auto pl-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted',
                            children: 'React',
                          }),
                        ],
                      }),
                    (0, d.jsx)('div', {
                      className: 'py-1',
                      children: n.map((a) =>
                        (0, d.jsx)(
                          'button',
                          {
                            type: 'button',
                            className: (0, D.cn)(
                              'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] font-medium',
                              a.danger
                                ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
                                : 'text-ink hover:bg-surface-muted/75 dark:hover:bg-surface-muted/35',
                            ),
                            onClick: () => {
                              (a.onSelect(), c());
                            },
                            role: 'menuitem',
                            children: (0, d.jsx)('span', {
                              className: 'truncate',
                              children: a.label,
                            }),
                          },
                          a.id,
                        ),
                      ),
                    }),
                  ],
                }),
                document.body,
              )
            : null;
        }
        var S = c(46515);
        function T({ className: a }) {
          return (0, d.jsx)('svg', {
            viewBox: '0 0 24 24',
            fill: 'none',
            className: a,
            'aria-hidden': !0,
            children: (0, d.jsx)('path', {
              d: 'M20 6L9 17l-5-5',
              stroke: 'currentColor',
              strokeWidth: '2.2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
          });
        }
        function U({ className: a }) {
          return (0, d.jsxs)('svg', {
            viewBox: '0 0 24 24',
            fill: 'none',
            className: a,
            'aria-hidden': !0,
            children: [
              (0, d.jsx)('path', {
                d: 'M7 13l3 3L21 5',
                stroke: 'currentColor',
                strokeWidth: '2.2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
              }),
              (0, d.jsx)('path', {
                d: 'M3 13l3 3',
                stroke: 'currentColor',
                strokeWidth: '2.2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                opacity: '0.95',
              }),
            ],
          });
        }
        function V(a, b) {
          if ('SYSTEM' === a.type || 'SYSTEM' === b.type || a.senderId !== b.senderId) return !1;
          let c = new Date(a.createdAt).getTime();
          return 3e5 > Math.abs(new Date(b.createdAt).getTime() - c);
        }
        function W({ chatId: a }) {
          let b = (0, i.jE)(),
            c = (0, C.n)((a) => a.accessToken),
            e = (0, C.n)((a) => a.hasHydrated),
            f = E(c),
            m = (0, C.n)((a) => a.sessionId),
            n = H((a) => a.add),
            o = (0, g.useRef)(null),
            p = (0, g.useRef)(0),
            [q, s] = (0, g.useState)(!1),
            t = (0, g.useRef)(null),
            [v, y] = (0, g.useState)(null),
            [B, G] = (0, g.useState)(null),
            [I, J] = (0, g.useState)(null),
            [K, L] = (0, g.useState)(null);
          (0, h.useSearchParams)().get('highlight');
          let [M, N] = (0, g.useState)(null),
            { data: O } = (0, j.I)({ queryKey: ['me'], queryFn: () => (0, k.nr)('/users/me') }),
            Q = f ?? O?.id ?? null,
            { data: R } = (0, j.I)({
              queryKey: ['chats', ''],
              queryFn: () => (0, k.nr)('/chats'),
              enabled: !!I,
            }),
            { data: S, isLoading: T } = (0, j.I)({
              queryKey: ['messages', a],
              queryFn: () => (0, k.nr)(`/chats/${a}/messages?take=80`),
            }),
            U = S?.items ?? [];
          U[U.length - 1]?.id;
          let V = () => {
              t.current && (clearTimeout(t.current), (t.current = null));
            },
            W = (a) => {
              V();
            },
            Y = () => {
              (V(),
                (t.current = setTimeout(() => {
                  t.current = null;
                }, 220)));
            },
            Z = (function ({ useFlushSync: a = !0, ...b }) {
              let c = g.useReducer(() => ({}), {})[1],
                d = {
                  ...b,
                  onChange: (d, e) => {
                    var f;
                    (a && e ? (0, l.flushSync)(c) : c(),
                      null == (f = b.onChange) || f.call(b, d, e));
                  },
                },
                [e] = g.useState(() => new x(d));
              return (e.setOptions(d), z(() => e._didMount(), []), z(() => e._willUpdate()), e);
            })({
              observeElementRect: r,
              observeElementOffset: u,
              scrollToFn: w,
              ...{
                count: U.length,
                getScrollElement: () => o.current,
                estimateSize: () => 82,
                overscan: 14,
              },
            }),
            $ = Z.getVirtualItems(),
            _ = async (a) => {
              if (I && !I.deletedAt) {
                if (!I.text?.trim())
                  return void window.alert(
                    'This message type cannot be forwarded yet (MVP: text only).',
                  );
                try {
                  let c = await (0, k.nr)(`/chats/${a}/messages`, {
                    method: 'POST',
                    body: { text: I.text, forwardedFromMessageId: I.id },
                  });
                  (A(b, a, c.text?.trim() ? c.text.slice(0, 160) : '[Forwarded]', c.createdAt),
                    J(null));
                } catch {
                  window.alert('Failed to forward message.');
                }
              }
            };
          return e && !Q
            ? (0, d.jsx)('div', {
                className: 'flex min-h-0 flex-1 flex-col',
                children: (0, d.jsx)('div', {
                  className:
                    'flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-ink-muted',
                  children: 'Loading…',
                }),
              })
            : (0, d.jsxs)('div', {
                className: 'flex min-h-0 flex-1 flex-col',
                children: [
                  (0, d.jsxs)('div', {
                    ref: o,
                    className:
                      'scrollbar-thin chat-thread-bg relative isolate min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-1.5 md:px-5 md:py-2.5',
                    onDragEnter: (a) => {
                      (a.preventDefault(), a.stopPropagation(), (p.current += 1), s(!0));
                    },
                    onDragOver: (a) => {
                      (a.preventDefault(), a.stopPropagation(), q || s(!0));
                    },
                    onDragLeave: (a) => {
                      (a.preventDefault(),
                        a.stopPropagation(),
                        (p.current = Math.max(0, p.current - 1)),
                        0 === p.current && s(!1));
                    },
                    onDrop: async (b) => {
                      (b.preventDefault(), b.stopPropagation(), (p.current = 0), s(!1));
                      let d = Array.from(b.dataTransfer.files ?? []);
                      if (d.length && c)
                        for (let b of d) {
                          let d = b.type.startsWith('image/')
                            ? 'image'
                            : b.type.startsWith('video/')
                              ? 'video'
                              : 'file';
                          try {
                            let e = await F(b, d, c, m);
                            n(a, {
                              localId: `pending:${Date.now()}-${Math.random().toString(16).slice(2)}`,
                              storageKey: e.storageKey,
                              url: e.url,
                              fileName: e.fileName,
                              mimeType: e.mimeType,
                              sizeBytes: e.sizeBytes,
                              kind: d,
                              createdAt: Date.now(),
                            });
                          } catch {}
                        }
                    },
                    children: [
                      q &&
                        (0, d.jsx)('div', {
                          className:
                            'pointer-events-none absolute inset-0 z-[50] flex items-center justify-center',
                          children: (0, d.jsx)('div', {
                            className:
                              'rounded-2xl border border-line/70 bg-surface-elevated/85 px-4 py-3 text-sm font-semibold text-ink shadow-lg backdrop-blur dark:border-line/45 dark:bg-surface-elevated/65',
                            children: 'Drop files to upload',
                          }),
                        }),
                      T &&
                        (0, d.jsx)('div', {
                          className: 'space-y-2',
                          children: [1, 2, 3, 4, 5, 6].map((a) =>
                            (0, d.jsx)(
                              'div',
                              {
                                className: (0, D.cn)(
                                  'h-12 animate-pulse rounded-[1.125rem]',
                                  a % 2 == 0
                                    ? 'ml-auto w-[70%] bg-bubble-out/18'
                                    : 'mr-auto w-[66%] bg-bubble-in/45',
                                ),
                              },
                              a,
                            ),
                          ),
                        }),
                      !T &&
                        0 === U.length &&
                        (0, d.jsxs)('div', {
                          className:
                            'flex h-full flex-col items-center justify-center px-6 text-center',
                          children: [
                            (0, d.jsx)('div', {
                              className:
                                'flex h-12 w-12 items-center justify-center rounded-2xl border border-line/60 bg-surface-elevated/90 shadow-sm backdrop-blur',
                              children: (0, d.jsx)('svg', {
                                width: '22',
                                height: '22',
                                viewBox: '0 0 24 24',
                                fill: 'none',
                                'aria-hidden': !0,
                                children: (0, d.jsx)('path', {
                                  d: 'M8 10h8M8 14h5M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z',
                                  stroke: 'currentColor',
                                  className: 'text-ink-muted',
                                  strokeWidth: '2',
                                  strokeLinejoin: 'round',
                                }),
                              }),
                            }),
                            (0, d.jsx)('p', {
                              className: 'mt-4 font-display text-xl font-semibold text-ink',
                              children: 'Quiet here',
                            }),
                            (0, d.jsx)('p', {
                              className: 'mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted',
                              children: 'Send the first message to start the conversation.',
                            }),
                          ],
                        }),
                      (0, d.jsx)('div', {
                        style: { height: Z.getTotalSize(), position: 'relative', width: '100%' },
                        children: $.map((b) => {
                          let c = U[b.index];
                          if (!c) return null;
                          let e = b.index > 0 ? U[b.index - 1] : void 0,
                            f = b.index < U.length - 1 ? U[b.index + 1] : void 0,
                            g = K === c.id;
                          return (0, d.jsx)(
                            'div',
                            {
                              ref: Z.measureElement,
                              'data-index': b.index,
                              className: (0, D.cn)(
                                'absolute left-0 top-0 w-full',
                                g ? 'z-[30]' : 'z-[1]',
                              ),
                              style: { transform: `translateY(${b.start}px)` },
                              children: (0, d.jsx)(X, {
                                m: c,
                                prev: e,
                                next: f,
                                myId: Q ?? void 0,
                                highlighted: M === c.id,
                                onReply: () => y(c),
                                onForward: () => J(c),
                                onEdit: () => {
                                  (y(null), G(c));
                                },
                                onDelete: () => {
                                  (y(null), G(null));
                                },
                                menuOpen: K === c.id,
                                setMenuOpen: (a) => L(a ? c.id : null),
                                chatId: a,
                                onMessageRowEnter: W,
                                onMessageRowLeave: Y,
                                closeOnScrollEl: o,
                              }),
                            },
                            c.id,
                          );
                        }),
                      }),
                    ],
                  }),
                  (0, d.jsx)(P, {
                    chatId: a,
                    replyTo: v,
                    onCancelReply: () => y(null),
                    editing: B,
                    onCancelEdit: () => G(null),
                  }),
                  I &&
                    (0, d.jsx)('div', {
                      className:
                        'fixed inset-0 z-[130] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center',
                      role: 'dialog',
                      'aria-label': 'Forward message',
                      onMouseDown: () => J(null),
                      children: (0, d.jsxs)('div', {
                        className:
                          'w-full max-w-md overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift dark:border-line/55 dark:bg-surface-elevated/98',
                        onMouseDown: (a) => a.stopPropagation(),
                        children: [
                          (0, d.jsxs)('div', {
                            className:
                              'flex items-center gap-2 border-b border-line/70 px-3 py-2.5 dark:border-line/45',
                            children: [
                              (0, d.jsx)('div', {
                                className: 'font-display text-[0.95rem] font-semibold text-ink',
                                children: 'Forward to…',
                              }),
                              (0, d.jsx)('button', {
                                type: 'button',
                                className:
                                  'ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-surface-muted/35',
                                onClick: () => J(null),
                                'aria-label': 'Close',
                                children: (0, d.jsx)('svg', {
                                  width: '16',
                                  height: '16',
                                  viewBox: '0 0 24 24',
                                  fill: 'none',
                                  'aria-hidden': !0,
                                  children: (0, d.jsx)('path', {
                                    d: 'M18 6L6 18M6 6l12 12',
                                    stroke: 'currentColor',
                                    strokeWidth: '2',
                                    strokeLinecap: 'round',
                                  }),
                                }),
                              }),
                            ],
                          }),
                          (0, d.jsxs)('div', {
                            className: 'max-h-[55vh] overflow-y-auto p-1.5',
                            children: [
                              (R ?? []).map((a) => {
                                let b =
                                    a.title ?? a.peer?.displayName ?? a.peer?.username ?? 'Chat',
                                  c = a.lastMessagePreview?.trim() ?? '';
                                return (0, d.jsxs)(
                                  'button',
                                  {
                                    type: 'button',
                                    className:
                                      'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-muted/80 dark:hover:bg-surface-muted/35',
                                    onClick: () => void _(a.id),
                                    children: [
                                      (0, d.jsx)('div', {
                                        className:
                                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-xs font-semibold text-accent ring-1 ring-line/45 dark:from-accent/25 dark:to-accent/5 dark:ring-line/35',
                                        children: b.slice(0, 1).toUpperCase() || '?',
                                      }),
                                      (0, d.jsxs)('div', {
                                        className: 'min-w-0 flex-1',
                                        children: [
                                          (0, d.jsx)('div', {
                                            className:
                                              'truncate text-[12.5px] font-semibold text-ink',
                                            children: b,
                                          }),
                                          (0, d.jsx)('div', {
                                            className: 'truncate text-[11.5px] text-ink-muted',
                                            children: c || ' ',
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  a.id,
                                );
                              }),
                              0 === (R ?? []).length &&
                                (0, d.jsx)('div', {
                                  className: 'px-3 py-6 text-center text-sm text-ink-muted',
                                  children: 'No chats found.',
                                }),
                            ],
                          }),
                        ],
                      }),
                    }),
                ],
              });
        }
        function X({
          m: a,
          prev: b,
          next: c,
          myId: e,
          highlighted: f,
          onReply: h,
          onForward: j,
          onEdit: l,
          onDelete: m,
          menuOpen: n,
          setMenuOpen: o,
          chatId: p,
          onMessageRowEnter: q,
          onMessageRowLeave: r,
          closeOnScrollEl: s,
        }) {
          let t = (0, i.jE)(),
            u = !!a.deletedAt,
            v = 'SYSTEM' === a.type,
            w = (0, g.useRef)(null),
            x = (0, g.useMemo)(
              () => Date.now() - new Date(a.createdAt).getTime() < 2500,
              [a.createdAt],
            ),
            y = (a, b) => {
              t.setQueryData(['messages', p], (c) =>
                c
                  ? { ...c, items: c.items.map((c) => (c.id === a ? { ...c, reactions: b } : c)) }
                  : c,
              );
            },
            z = async (a, b) => {
              let c = e ?? t.getQueryData(['me'])?.id;
              if (!c) return;
              let d = t.getQueryData(['messages', p]),
                f = d?.items?.find((b) => b.id === a);
              if (!f) return;
              let g = f.reactions.find((a) => a.emoji === b),
                h = !!g?.userIds.includes(c),
                i = f.reactions.map((a) => ({
                  emoji: a.emoji,
                  count: a.count,
                  userIds: [...a.userIds],
                }));
              y(
                a,
                (function (a, b, c, d) {
                  let e = a.map((a) => ({
                      emoji: a.emoji,
                      count: a.count,
                      userIds: [...a.userIds],
                    })),
                    f = e.findIndex((a) => a.emoji === b);
                  if (d)
                    return f >= 0
                      ? e[f].userIds.includes(c)
                        ? a
                        : ((e[f] = {
                            emoji: b,
                            userIds: [...e[f].userIds, c],
                            count: e[f].count + 1,
                          }),
                          e)
                      : [...e, { emoji: b, userIds: [c], count: 1 }];
                  if (f < 0) return a;
                  let g = e[f].userIds.filter((a) => a !== c);
                  return (
                    0 === g.length
                      ? e.splice(f, 1)
                      : (e[f] = { emoji: b, userIds: g, count: g.length }),
                    e
                  );
                })(f.reactions, b, c, !h),
              );
              try {
                let c;
                ((c = h
                  ? await (0, k.nr)(
                      `/chats/${p}/messages/${a}/reactions?emoji=${encodeURIComponent(b)}`,
                      { method: 'DELETE' },
                    )
                  : await (0, k.nr)(`/chats/${p}/messages/${a}/reactions`, {
                      method: 'POST',
                      body: { emoji: b },
                    })),
                  y(a, c));
              } catch {
                y(a, i);
              }
            },
            B = async () => {
              if (!(e && a.senderId === e && !u) || !window.confirm('Delete this message?')) return;
              (m(), o(!1));
              let b = t.getQueryData(['messages', p]);
              t.setQueryData(['messages', p], (b) =>
                b
                  ? {
                      ...b,
                      items: b.items.map((b) =>
                        b.id === a.id
                          ? { ...b, deletedAt: new Date().toISOString(), text: null }
                          : b,
                      ),
                    }
                  : b,
              );
              try {
                let b = await (0, k.nr)(`/chats/${p}/messages/${a.id}`, { method: 'DELETE' });
                (t.setQueryData(['messages', p], (a) =>
                  a ? { ...a, items: a.items.map((a) => (a.id === b.id ? b : a)) } : a,
                ),
                  A(t, p, 'Message deleted', b.createdAt));
              } catch {
                t.setQueryData(['messages', p], b);
              }
            },
            C = async (b) => {
              try {
                let c = t.getQueryData(['chat', p])?.pinnedMessage?.id ?? null,
                  d = await (0, k.nr)(`/chats/${p}/pin-message`, {
                    method: 'POST',
                    body: { messageId: b && c === b ? null : b },
                  });
                t.setQueryData(['chat', p], (b) =>
                  b
                    ? {
                        ...b,
                        pinnedMessage: d.pinnedMessageId
                          ? {
                              id: a.id,
                              text: a.text,
                              senderId: a.senderId ?? null,
                              createdAt: a.createdAt,
                              deletedAt: a.deletedAt ?? null,
                              sender: null,
                            }
                          : null,
                      }
                    : b,
                );
              } catch (a) {
                (console.error('[pin-message] failed', a),
                  window.alert('Failed to pin message. Check server logs / migration.'));
              }
            };
          if (v)
            return (0, d.jsx)('div', {
              className: 'mb-1.5 mt-2 flex justify-center first:mt-0',
              children: (0, d.jsx)('span', {
                className:
                  'rounded-full bg-surface-muted/95 px-2.5 py-0.5 text-[0.65rem] font-semibold text-ink-muted shadow-sm ring-1 ring-line/35 dark:bg-surface-elevated/90 dark:ring-line/40 dark:text-ink-muted/90',
                children: a.text,
              }),
            });
          let E = !!(e && a.senderId === e),
            F = E && !u && 'TEXT' === a.type,
            G = E && !u,
            H = !!(a.text && !u),
            I =
              !b ||
              !(function (a, b) {
                let c = new Date(a),
                  d = new Date(b);
                return (
                  c.getFullYear() === d.getFullYear() &&
                  c.getMonth() === d.getMonth() &&
                  c.getDate() === d.getDate()
                );
              })(b.createdAt, a.createdAt),
            J = !b || 'SYSTEM' === b.type || !V(b, a),
            K = !c || 'SYSTEM' === c.type || !V(a, c),
            L = (0, g.useMemo)(
              () => [
                { id: 'reply', label: 'Reply', onSelect: h },
                {
                  id: 'forward',
                  label: 'Forward',
                  disabled: u || !a.text?.trim(),
                  onSelect: () => {
                    (o(!1), j());
                  },
                },
                {
                  id: 'pin',
                  label:
                    (t.getQueryData(['chat', p])?.pinnedMessage?.id ?? null) === a.id
                      ? 'Unpin message'
                      : 'Pin message',
                  disabled: u,
                  onSelect: () => C(a.id),
                },
                {
                  id: 'copy',
                  label: 'Copy text',
                  disabled: !H,
                  onSelect: async () => {
                    let b = a.text ?? '';
                    try {
                      await navigator.clipboard.writeText(b);
                    } catch {
                      let a = document.createElement('textarea');
                      ((a.value = b),
                        (a.style.position = 'fixed'),
                        (a.style.left = '-9999px'),
                        document.body.appendChild(a),
                        a.select(),
                        document.execCommand('copy'),
                        a.remove());
                    }
                  },
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  disabled: !F,
                  onSelect: () => {
                    (o(!1), l());
                  },
                },
                { id: 'delete', label: 'Delete message', danger: !0, disabled: !G, onSelect: B },
              ],
              [H, G, F, u, a.id, a.text, l, j, h, o],
            ),
            M = (0, D.cn)(
              'rounded-[1.25rem]',
              !J && E && 'rounded-tr-[0.55rem]',
              !J && !E && 'rounded-tl-[0.55rem]',
              !K && E && 'rounded-br-[0.55rem]',
              !K && !E && 'rounded-bl-[0.55rem]',
            );
          return (0, d.jsxs)(S.P.div, {
            layout: 'position',
            initial: !!x && { opacity: 0, y: 6, scale: 0.992 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.16, ease: [0.2, 0.8, 0.2, 1] },
            className: I ? (J ? 'mt-5' : 'mt-3') : J ? 'mt-3' : 'mt-[3px]',
            children: [
              I &&
                (0, d.jsx)('div', {
                  className: 'mb-2 flex justify-center',
                  children: (0, d.jsx)('span', {
                    className:
                      'rounded-full bg-surface-elevated/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-muted/90 shadow-sm ring-1 ring-line/35 backdrop-blur dark:bg-surface-elevated/85 dark:ring-line/40',
                    children: (function (a) {
                      let b = new Date(a),
                        c = new Date(),
                        d = new Date(c.getFullYear(), c.getMonth(), c.getDate()),
                        e = new Date(b.getFullYear(), b.getMonth(), b.getDate()),
                        f = Math.round((d.getTime() - e.getTime()) / 864e5);
                      return 0 === f
                        ? 'Today'
                        : 1 === f
                          ? 'Yesterday'
                          : b.toLocaleDateString(void 0, {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              year: b.getFullYear() !== c.getFullYear() ? 'numeric' : void 0,
                            });
                    })(a.createdAt),
                  }),
                }),
              (0, d.jsx)('div', {
                className: (0, D.cn)('flex w-full', E ? 'justify-end' : 'justify-start'),
                children: (0, d.jsxs)('div', {
                  className: (0, D.cn)(
                    'group relative max-w-[min(100%,34rem)] pt-8 -mt-8',
                    E ? 'ml-auto' : 'mr-auto',
                  ),
                  onMouseEnter: () => q(a.id),
                  onMouseLeave: r,
                  children: [
                    (0, d.jsx)('button', {
                      ref: w,
                      type: 'button',
                      className: (0, D.cn)(
                        'absolute top-1 z-[45] flex h-7 w-7 items-center justify-center rounded-full border border-line/80 bg-surface-elevated text-ink-muted shadow-sm transition',
                        'hover:bg-surface-muted hover:text-ink dark:border-line/55 dark:bg-surface-muted/35',
                        E ? 'right-0' : 'left-0',
                        n ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      ),
                      onClick: () => o(!n),
                      'aria-label': 'Message actions',
                      children: (0, d.jsx)('svg', {
                        width: '16',
                        height: '16',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        'aria-hidden': !0,
                        children: (0, d.jsx)('path', {
                          d: 'M5 12h.01M12 12h.01M19 12h.01',
                          stroke: 'currentColor',
                          strokeWidth: '3',
                          strokeLinecap: 'round',
                        }),
                      }),
                    }),
                    (0, d.jsx)(R, {
                      open: n,
                      anchorRef: w,
                      onClose: () => o(!1),
                      actions: L,
                      showReactions: !u,
                      onReact: (b) => z(a.id, b),
                      closeOnScrollEl: s,
                    }),
                    (0, d.jsxs)('div', {
                      className: (0, D.cn)(
                        'relative z-[1] px-[0.7rem] py-[0.45rem] text-[13.5px] leading-[1.42]',
                        M,
                        E
                          ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/[0.07] ring-1 ring-black/[0.06] dark:shadow-lg dark:shadow-black/40 dark:ring-white/10'
                          : 'bg-bubble-in/98 text-ink shadow-sm ring-1 ring-line/45 dark:bg-bubble-in dark:text-ink/95 dark:ring-line/40 dark:shadow-black/20',
                        f && 'ring-2 ring-accent/55',
                        u && 'opacity-75',
                      ),
                      onDoubleClick: () => {
                        v || u || z(a.id, '❤️');
                      },
                      children: [
                        a.replyTo &&
                          (0, d.jsx)('div', {
                            className: (0, D.cn)(
                              'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                              E
                                ? 'border-bubble-out-ink/45'
                                : 'border-accent/55 dark:border-accent/45',
                            ),
                            children: a.replyTo.deletedAt
                              ? 'Original message removed'
                              : a.replyTo.text,
                          }),
                        a.forwardedFromMessageId &&
                          (0, d.jsxs)('div', {
                            className: (0, D.cn)(
                              'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                              E
                                ? 'border-bubble-out-ink/45'
                                : 'border-accent/55 dark:border-accent/45',
                            ),
                            children: [
                              (0, d.jsx)('span', {
                                className: 'font-bold uppercase tracking-[0.1em]',
                                children: 'Forwarded',
                              }),
                              ' ',
                              a.forwardedFromUser
                                ? (0, d.jsxs)('span', {
                                    className: 'opacity-90',
                                    children: [
                                      'from ',
                                      a.forwardedFromUser.displayName ??
                                        a.forwardedFromUser.username,
                                    ],
                                  })
                                : null,
                            ],
                          }),
                        (0, d.jsx)('p', {
                          className: (0, D.cn)(
                            'whitespace-pre-wrap break-words',
                            u && 'italic opacity-75',
                          ),
                          children: u
                            ? 'Message deleted'
                            : a.text
                              ? a.text
                                  .split(/(https?:\/\/[^\s]+)/g)
                                  .map((a, b) =>
                                    /^https?:\/\//.test(a)
                                      ? (0, d.jsx)(
                                          'a',
                                          {
                                            href: a,
                                            className:
                                              'break-all underline decoration-current/40 underline-offset-2 hover:decoration-current',
                                            target: '_blank',
                                            rel: 'noreferrer',
                                            children: a,
                                          },
                                          b,
                                        )
                                      : (0, d.jsx)('span', { children: a }, b),
                                  )
                              : null,
                        }),
                        a.attachments?.length > 0 &&
                          (0, d.jsx)('div', {
                            className: 'mt-2 space-y-2',
                            children: a.attachments.map((a) =>
                              'image' === a.kind
                                ? (0, d.jsx)(
                                    'img',
                                    {
                                      src: a.url,
                                      alt: a.fileName,
                                      className: 'max-h-56 w-full rounded-xl object-cover',
                                    },
                                    a.id,
                                  )
                                : (0, d.jsx)(
                                    'a',
                                    {
                                      href: a.url,
                                      className: (0, D.cn)(
                                        'block rounded-xl px-3 py-2 text-2xs font-medium underline-offset-2 hover:underline',
                                        E
                                          ? 'bg-black/10 text-bubble-out-ink'
                                          : 'bg-black/5 text-accent dark:bg-black/20',
                                      ),
                                      target: '_blank',
                                      rel: 'noreferrer',
                                      children: a.fileName,
                                    },
                                    a.id,
                                  ),
                            ),
                          }),
                        (0, d.jsxs)('div', {
                          className: (0, D.cn)(
                            'mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0 text-[0.625rem] tabular-nums',
                            E ? 'justify-end text-bubble-out-ink/70' : 'text-ink-muted',
                          ),
                          children: [
                            (0, d.jsx)('span', {
                              children: new Date(a.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              }),
                            }),
                            a.editedAt &&
                              (0, d.jsx)('span', { className: 'opacity-75', children: 'edited' }),
                            E &&
                              K &&
                              a.deliveryStatus &&
                              (0, d.jsx)('span', {
                                className: 'ml-0.5 inline-flex items-center gap-0.5 opacity-80',
                                'aria-label': a.deliveryStatus,
                                children:
                                  'SENDING' === a.deliveryStatus
                                    ? (0, d.jsx)('span', {
                                        className:
                                          'text-[9px] font-bold uppercase tracking-[0.06em]',
                                        children: '…',
                                      })
                                    : 'SENT' === a.deliveryStatus
                                      ? (0, d.jsx)(T, { className: 'h-3 w-3' })
                                      : (0, d.jsx)(U, { className: 'h-3 w-3' }),
                              }),
                          ],
                        }),
                        a.reactions.length > 0 &&
                          (0, d.jsx)('div', {
                            className: 'mt-1 flex flex-wrap gap-0.5',
                            children: a.reactions.map((b, c) =>
                              (0, d.jsxs)(
                                'button',
                                {
                                  type: 'button',
                                  className: (0, D.cn)(
                                    'rounded-full border px-1.5 py-px text-[0.65rem] transition',
                                    E
                                      ? 'border-white/30 bg-black/12 hover:bg-black/18'
                                      : 'border-line/55 bg-surface-elevated/50 hover:bg-surface-elevated/80 dark:border-line/45',
                                  ),
                                  onClick: () => z(a.id, b.emoji),
                                  children: [b.emoji, ' ', b.count],
                                },
                                `${a.id}-${b.emoji}-${c}`,
                              ),
                            ),
                          }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          });
        }
        function Y(a) {
          switch (a) {
            case 'DIRECT':
              return 'Direct message';
            case 'GROUP':
              return 'Group';
            case 'CHANNEL':
              return 'Channel';
            case 'SAVED':
              return 'Saved messages';
            default:
              return a ?? 'Chat';
          }
        }
        function Z({ title: a, hint: b }) {
          return (0, d.jsxs)('section', {
            className:
              'rounded-xl border border-line/55 bg-surface-muted/25 px-3 py-3 dark:border-line/40 dark:bg-surface-muted/15',
            children: [
              (0, d.jsx)('h3', {
                className: 'text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted',
                children: a,
              }),
              (0, d.jsx)('p', {
                className: 'mt-1.5 text-[13px] leading-snug text-ink-muted/90',
                children: b,
              }),
            ],
          });
        }
        function $({ open: a, onClose: b, chat: c }) {
          if ((((0, g.useRef)(b).current = b), !a || 'undefined' == typeof document)) return null;
          let e = c?.type === 'DIRECT',
            h = c?.peer?.displayName ?? c?.title ?? c?.peer?.username ?? 'Conversation',
            i = c?.peer?.username,
            j = e ? (c?.peer?.avatarUrl ?? c?.avatarUrl) : c?.avatarUrl,
            k = c?.peer?.id,
            m =
              e && c?.peer
                ? c.peer.isOnline
                  ? 'Online'
                  : c.peer.lastSeenAt
                    ? 'Last seen recently'
                    : 'Offline'
                : null,
            n = h.slice(0, 1).toUpperCase() || '?';
          return (0, l.createPortal)(
            (0, d.jsxs)(d.Fragment, {
              children: [
                (0, d.jsx)('button', {
                  type: 'button',
                  className: 'fixed inset-0 z-[100] bg-ink/25 backdrop-blur-[2px] dark:bg-black/45',
                  'aria-label': 'Close chat info',
                  onClick: b,
                }),
                (0, d.jsxs)('aside', {
                  className: (0, D.cn)(
                    'fixed inset-y-0 right-0 z-[101] flex h-dvh max-h-dvh w-[min(100%,22rem)] flex-col border-l border-line/80 bg-surface-elevated shadow-[0_0_40px_rgba(0,0,0,0.12)]',
                    'dark:border-line/50 dark:bg-surface-elevated/98 dark:shadow-[0_0_48px_rgba(0,0,0,0.45)]',
                  ),
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-labelledby': 'chat-details-title',
                  onClick: (a) => a.stopPropagation(),
                  children: [
                    (0, d.jsxs)('div', {
                      className:
                        'flex shrink-0 items-center justify-between border-b border-line/70 px-4 py-3 dark:border-line/45',
                      children: [
                        (0, d.jsx)('h2', {
                          id: 'chat-details-title',
                          className: 'font-display text-lg font-semibold text-ink',
                          children: 'Chat info',
                        }),
                        (0, d.jsx)('button', {
                          type: 'button',
                          className:
                            'rounded-full p-2 text-ink-muted transition hover:bg-surface-muted hover:text-ink',
                          onClick: b,
                          'aria-label': 'Close',
                          children: (0, d.jsx)('svg', {
                            width: '18',
                            height: '18',
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            'aria-hidden': !0,
                            children: (0, d.jsx)('path', {
                              d: 'M18 6L6 18M6 6l12 12',
                              stroke: 'currentColor',
                              strokeWidth: '2',
                              strokeLinecap: 'round',
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, d.jsxs)('div', {
                      className: 'scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5',
                      children: [
                        e
                          ? (0, d.jsxs)('div', {
                              className: 'flex flex-col items-center text-center',
                              children: [
                                (0, d.jsxs)(f(), {
                                  href: k ? `/users/${k}` : '#',
                                  onClick: () => {
                                    k && b();
                                  },
                                  className: (0, D.cn)(
                                    'group flex flex-col items-center text-center',
                                    !k && 'pointer-events-none',
                                  ),
                                  'aria-label': 'Open profile',
                                  children: [
                                    (0, d.jsx)('div', {
                                      className: 'relative h-[4.5rem] w-[4.5rem] shrink-0',
                                      children: j
                                        ? (0, d.jsx)('img', {
                                            src: j,
                                            alt: '',
                                            className:
                                              'h-full w-full rounded-full object-cover ring-2 ring-line/40 transition group-hover:ring-accent/35 dark:ring-line/35',
                                          })
                                        : (0, d.jsx)('div', {
                                            className: (0, D.cn)(
                                              'flex h-full w-full items-center justify-center rounded-full text-2xl font-semibold ring-2 ring-line/35 transition group-hover:ring-accent/35',
                                              'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                                            ),
                                            children: n,
                                          }),
                                    }),
                                    (0, d.jsx)('p', {
                                      className:
                                        'mt-4 font-display text-lg font-semibold leading-tight text-ink',
                                      children: h,
                                    }),
                                    i
                                      ? (0, d.jsxs)('p', {
                                          className: 'mt-1 text-sm text-ink-muted',
                                          children: ['@', i],
                                        })
                                      : null,
                                    m
                                      ? (0, d.jsx)('p', {
                                          className: 'mt-1 text-sm text-ink-muted',
                                          children: m,
                                        })
                                      : null,
                                    (0, d.jsx)('p', {
                                      className:
                                        'mt-2 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100',
                                      children: 'View profile',
                                    }),
                                  ],
                                }),
                                (0, d.jsx)('p', {
                                  className:
                                    'mt-3 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25',
                                  children: Y(c?.type),
                                }),
                              ],
                            })
                          : (0, d.jsxs)('div', {
                              children: [
                                (0, d.jsx)('div', {
                                  className: 'flex justify-center',
                                  children: (0, d.jsx)('div', {
                                    className: 'relative h-16 w-16 shrink-0',
                                    children: j
                                      ? (0, d.jsx)('img', {
                                          src: j,
                                          alt: '',
                                          className:
                                            'h-full w-full rounded-2xl object-cover ring-2 ring-line/40 dark:ring-line/35',
                                        })
                                      : (0, d.jsx)('div', {
                                          className: (0, D.cn)(
                                            'flex h-full w-full items-center justify-center rounded-2xl text-xl font-semibold ring-2 ring-line/35',
                                            'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                                          ),
                                          children: (c?.title ?? '?').slice(0, 1).toUpperCase(),
                                        }),
                                  }),
                                }),
                                (0, d.jsx)('p', {
                                  className:
                                    'mt-4 text-center font-display text-lg font-semibold text-ink',
                                  children: c?.title ?? Y(c?.type),
                                }),
                                (0, d.jsx)('p', {
                                  className:
                                    'mt-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted',
                                  children: Y(c?.type),
                                }),
                                c?.role &&
                                  (0, d.jsxs)('p', {
                                    className: 'mt-4 text-center text-sm text-ink-muted',
                                    children: [
                                      'Your role: ',
                                      (0, d.jsx)('span', {
                                        className: 'font-medium text-ink',
                                        children: c.role,
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                        !e &&
                          c?.members &&
                          c.members.length > 0 &&
                          (0, d.jsxs)('div', {
                            className: 'mt-8',
                            children: [
                              (0, d.jsxs)('p', {
                                className:
                                  'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                                children: ['Members (', c.members.length, ')'],
                              }),
                              (0, d.jsx)('ul', {
                                className: 'mt-2 space-y-2',
                                children: c.members.map((a) =>
                                  (0, d.jsxs)(
                                    'li',
                                    {
                                      className:
                                        'flex items-center gap-2 rounded-lg border border-line/60 px-2 py-2 text-sm dark:border-line/45',
                                      children: [
                                        (0, d.jsx)('span', {
                                          className: 'min-w-0 flex-1 truncate font-medium text-ink',
                                          children: a.user.displayName ?? a.user.username,
                                        }),
                                        (0, d.jsx)('span', {
                                          className: 'shrink-0 text-2xs uppercase text-ink-muted',
                                          children: a.role,
                                        }),
                                      ],
                                    },
                                    a.userId,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        e &&
                          c?.role &&
                          (0, d.jsxs)('p', {
                            className: 'mt-8 text-center text-sm text-ink-muted',
                            children: [
                              'Your role: ',
                              (0, d.jsx)('span', {
                                className: 'font-medium text-ink',
                                children: c.role,
                              }),
                            ],
                          }),
                        (0, d.jsxs)('div', {
                          className: 'mt-8 space-y-3',
                          children: [
                            (0, d.jsx)('p', {
                              className:
                                'text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted',
                              children: 'Shared',
                            }),
                            (0, d.jsx)(Z, {
                              title: 'Media',
                              hint: 'Photos and videos shared in this chat will appear here.',
                            }),
                            (0, d.jsx)(Z, {
                              title: 'Files',
                              hint: 'Documents and other files will appear here.',
                            }),
                            (0, d.jsx)(Z, {
                              title: 'Links',
                              hint: 'Links from messages will be listed here.',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            document.body,
          );
        }
        var _ = c(25493);
        function aa() {
          let a = (0, h.useParams)().chatId,
            b = (0, h.useRouter)();
          (0, i.jE)();
          let c = (0, _.n)((a) => a.setSidebarOpen),
            e = (0, _.n)((a) => a.detailsOpen),
            g = (0, _.n)((a) => a.setDetailsOpen),
            l = (0, _.n)((b) => b.typingByChat?.[a] ?? !1);
          (0, _.n)((a) => a.setTypingForChat);
          let m = (0, L.k)(),
            { data: n } = (0, j.I)({
              queryKey: ['chat', a],
              queryFn: () => (0, k.nr)(`/chats/${a}`),
            }),
            o = n?.title ?? n?.peer?.displayName ?? n?.peer?.username ?? 'Conversation',
            p = n?.avatarUrl ?? n?.peer?.avatarUrl ?? null,
            q = n?.type === 'DIRECT' ? n?.peer?.id : null,
            r =
              n?.type === 'DIRECT' && n?.peer
                ? m(n.peer.isOnline ? 'online' : n.peer.lastSeenAt ? 'lastSeenRecently' : 'offline')
                : (function (a, b) {
                    switch (b) {
                      case 'DIRECT':
                        return a('directMessage');
                      case 'GROUP':
                        return a('group');
                      case 'CHANNEL':
                        return a('channel');
                      case 'SAVED':
                        return a('saved');
                      default:
                        return b ?? '';
                    }
                  })(m, n?.type),
            s = l && n?.type === 'DIRECT' ? m('typing') : r,
            t = o.slice(0, 1).toUpperCase() || '?',
            u = n?.pinnedMessage ?? null;
          return (0, d.jsxs)('div', {
            className: 'flex h-full min-h-0 flex-col',
            children: [
              (0, d.jsxs)('header', {
                className:
                  'flex shrink-0 items-center gap-2.5 border-b border-line/75 bg-surface-elevated/98 px-3 py-1.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-line/45 dark:bg-surface-elevated/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]',
                children: [
                  (0, d.jsx)('button', {
                    type: 'button',
                    className:
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/75 text-ink-muted transition hover:bg-surface-muted/90 hover:text-ink md:hidden dark:border-line/50 dark:hover:bg-surface-muted/45',
                    onClick: () => c(!0),
                    'aria-label': 'Back to chat list',
                    children: (0, d.jsx)('svg', {
                      width: '18',
                      height: '18',
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      'aria-hidden': !0,
                      children: (0, d.jsx)('path', {
                        d: 'M15 18l-6-6 6-6',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }),
                    }),
                  }),
                  q
                    ? (0, d.jsx)(f(), {
                        href: `/users/${q}`,
                        className: 'relative h-9 w-9 shrink-0 md:h-10 md:w-10',
                        'aria-label': 'Open profile',
                        children: p
                          ? (0, d.jsx)('img', {
                              src: p,
                              alt: '',
                              className:
                                'h-9 w-9 rounded-full object-cover ring-1 ring-line/55 transition hover:ring-accent/35 dark:ring-line/35 md:h-10 md:w-10',
                            })
                          : (0, d.jsx)('div', {
                              className: (0, D.cn)(
                                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 transition hover:ring-accent/35 md:h-10 md:w-10 md:text-sm',
                                'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
                              ),
                              children: t,
                            }),
                      })
                    : (0, d.jsx)('div', {
                        className: 'relative h-9 w-9 shrink-0 md:h-10 md:w-10',
                        children: p
                          ? (0, d.jsx)('img', {
                              src: p,
                              alt: '',
                              className:
                                'h-9 w-9 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35 md:h-10 md:w-10',
                            })
                          : (0, d.jsx)('div', {
                              className: (0, D.cn)(
                                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 md:h-10 md:w-10 md:text-sm',
                                'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
                              ),
                              children: t,
                            }),
                      }),
                  (0, d.jsxs)('div', {
                    className: 'min-w-0 flex-1 py-0.5',
                    children: [
                      (0, d.jsx)('h1', {
                        className:
                          'truncate font-display text-[0.98rem] font-semibold leading-tight tracking-tight text-ink md:text-[1.0625rem]',
                        children: o,
                      }),
                      (0, d.jsx)('p', {
                        className:
                          'mt-0.5 truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-muted/85',
                        children: s,
                      }),
                    ],
                  }),
                  (0, d.jsx)('button', {
                    type: 'button',
                    className:
                      'inline-flex h-8 shrink-0 items-center rounded-full border border-line/75 px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/55 hover:text-ink dark:border-line/50 dark:hover:bg-surface-elevated/55',
                    onClick: () => g(!0),
                    children: 'Info',
                  }),
                ],
              }),
              u &&
                (0, d.jsxs)('button', {
                  type: 'button',
                  onClick: () => b.push(`/chats/${a}?highlight=${u.id}`),
                  className:
                    'flex shrink-0 items-center gap-2 border-b border-line/60 bg-surface-elevated/90 px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-muted/60 dark:border-line/45 dark:bg-surface-elevated/95',
                  'aria-label': 'Pinned message',
                  children: [
                    (0, d.jsx)('span', {
                      className:
                        'inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted',
                      children: 'Pinned',
                    }),
                    (0, d.jsx)('span', {
                      className: 'min-w-0 flex-1 truncate text-[13px] text-ink',
                      children: u.deletedAt
                        ? 'Message deleted'
                        : u.text?.trim()
                          ? u.text
                          : 'Attachment',
                    }),
                    (0, d.jsx)('span', {
                      className: 'shrink-0 text-[11px] font-semibold text-accent',
                      children: 'View',
                    }),
                  ],
                }),
              (0, d.jsx)($, { open: e, onClose: () => g(!1), chat: n }),
              a && (0, d.jsx)(W, { chatId: a }),
            ],
          });
        }
      },
      55511: (a) => {
        'use strict';
        a.exports = require('crypto');
      },
      55591: (a) => {
        'use strict';
        a.exports = require('https');
      },
      63033: (a) => {
        'use strict';
        a.exports = require('next/dist/server/app-render/work-unit-async-storage.external.js');
      },
      74075: (a) => {
        'use strict';
        a.exports = require('zlib');
      },
      79428: (a) => {
        'use strict';
        a.exports = require('buffer');
      },
      79551: (a) => {
        'use strict';
        a.exports = require('url');
      },
      79646: (a) => {
        'use strict';
        a.exports = require('child_process');
      },
      81630: (a) => {
        'use strict';
        a.exports = require('http');
      },
      83997: (a) => {
        'use strict';
        a.exports = require('tty');
      },
      86439: (a) => {
        'use strict';
        a.exports = require('next/dist/shared/lib/no-fallback-error.external');
      },
      90762: (a, b, c) => {
        'use strict';
        (c.r(b), c.d(b, { default: () => d }));
        let d = (0, c(25459).registerClientReference)(
          function () {
            throw Error(
              'Attempted to call the default export of "C:\\\\telegram-clone\\\\apps\\\\web\\\\src\\\\app\\\\(app)\\\\chats\\\\[chatId]\\\\page.tsx" from the server, but it\'s on the client. It\'s not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.',
            );
          },
          'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\chats\\[chatId]\\page.tsx',
          'default',
        );
      },
      91645: (a) => {
        'use strict';
        a.exports = require('net');
      },
      94735: (a) => {
        'use strict';
        a.exports = require('events');
      },
    }));
  var b = require('../../../../webpack-runtime.js');
  b.C(a);
  var c = b.X(0, [263, 914, 135, 296, 476, 627, 33], () => b((b.s = 38549)));
  module.exports = c;
})();
