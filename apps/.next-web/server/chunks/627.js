((exports.id = 627),
  (exports.ids = [627]),
  (exports.modules = {
    151: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 34664));
    },
    1241: () => {},
    14276: () => {},
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
    32303: (a, b, c) => {
      'use strict';
      c.d(b, { G1: () => j, Ol: () => h, cH: () => i });
      var d = c(44826),
        e = c(41921);
      let f = null,
        g = null;
      function h() {
        return f;
      }
      function i() {
        if (f?.connected) return f;
        let a = e.n.getState().accessToken;
        return (
          (f = (0, d.io)('http://localhost:4000', {
            transports: ['websocket', 'polling'],
            auth: { token: a },
            autoConnect: !!a,
          })),
          g && (clearInterval(g), (g = null)),
          (g = setInterval(() => {
            try {
              f?.connected && f.emit('presence:ping');
            } catch {}
          }, 45e3)),
          f
        );
      }
      function j() {
        (f?.disconnect(), (f = null), g && (clearInterval(g), (g = null)));
      }
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
    39694: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 74711));
    },
    41030: (a, b, c) => {
      'use strict';
      c.d(b, { X: () => f });
      var d = c(91864);
      let e = new Map();
      function f(a) {
        let b = e.get(a);
        return (
          b ||
            ((b = (0, d.nr)('/chats/direct', { method: 'POST', body: { peerUserId: a } }).finally(
              () => {
                e.delete(a);
              },
            )),
            e.set(a, b)),
          b
        );
      }
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
    50793: (a, b, c) => {
      'use strict';
      c.d(b, { n: () => f });
      var d = c(19154),
        e = c(7904);
      let f = (0, d.v)()(
        (0, e.Zr)((a) => ({ language: 'en', setLanguage: (b) => a({ language: b }) }), {
          name: 'pulse-language',
        }),
      );
    },
    53295: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 50753));
    },
    53704: (a, b, c) => {
      'use strict';
      c.d(b, { k: () => g });
      var d = c(31768),
        e = c(50793);
      let f = {
        en: {
          settings: 'Settings',
          appearance: 'Appearance',
          sessions: 'Sessions',
          signOut: 'Sign out',
          search: 'Search',
          online: 'Online',
          lastSeenRecently: 'Last seen recently',
          offline: 'Offline',
          sendMessage: 'Send message',
          message: 'Message',
          editMessage: 'Edit message',
          backToChats: 'Back to chats',
          account: 'Account',
          myProfile: 'My Profile',
          openDeviceList: 'Open device list',
          filterConversations: 'Filter conversations',
          pinned: 'Pinned',
          archived: 'Archived',
          pin: 'Pin',
          unpin: 'Unpin',
          archive: 'Archive',
          unarchive: 'Unarchive',
          mute: 'Mute',
          unmute: 'Unmute',
          hideChat: 'Hide chat',
          searchPlaceholder: 'Search people, chats, messages…',
          searching: 'Searching…',
          people: 'People',
          chats: 'Chats',
          messages: 'Messages',
          noMatches: 'No matches',
          typing: 'Typing…',
          directMessage: 'Direct message',
          group: 'Group',
          channel: 'Channel',
          saved: 'Saved',
          openingInbox: 'Opening your inbox',
          syncingChats: 'Syncing your chats…',
          noConversationsYet: 'No conversations yet',
          openingChat: 'Opening a chat…',
        },
        ru: {
          settings: 'Настройки',
          appearance: 'Внешний вид',
          sessions: 'Сессии',
          signOut: 'Выйти',
          search: 'Поиск',
          online: 'В сети',
          lastSeenRecently: 'Был недавно',
          offline: 'Не в сети',
          sendMessage: 'Отправить сообщение',
          message: 'Сообщение',
          editMessage: 'Редактировать сообщение',
          backToChats: 'Назад к чатам',
          account: 'Аккаунт',
          myProfile: 'Мой профиль',
          openDeviceList: 'Открыть список устройств',
          filterConversations: 'Фильтр диалогов',
          pinned: 'Закреплённые',
          archived: 'Архив',
          pin: 'Закрепить',
          unpin: 'Открепить',
          archive: 'В архив',
          unarchive: 'Из архива',
          mute: 'Выключить звук',
          unmute: 'Включить звук',
          hideChat: 'Скрыть чат',
          searchPlaceholder: 'Поиск людей, чатов, сообщений…',
          searching: 'Поиск…',
          people: 'Люди',
          chats: 'Чаты',
          messages: 'Сообщения',
          noMatches: 'Ничего не найдено',
          typing: 'Печатает…',
          directMessage: 'Личные сообщения',
          group: 'Группа',
          channel: 'Канал',
          saved: 'Избранное',
          openingInbox: 'Открываем ваш список чатов',
          syncingChats: 'Синхронизация чатов…',
          noConversationsYet: 'Пока нет диалогов',
          openingChat: 'Открываем чат…',
        },
      };
      function g() {
        let a = (0, e.n)((a) => a.language);
        return (0, d.useMemo)(
          () => (b) => (f[a ?? e.n.getState().language] ?? f.en)[b] ?? f.en[b] ?? b,
          [a],
        );
      }
    },
    72088: () => {},
    74711: (a, b, c) => {
      'use strict';
      (c.r(b), c.d(b, { default: () => d }));
      let d = (0, c(25459).registerClientReference)(
        function () {
          throw Error(
            'Attempted to call the default export of "C:\\\\telegram-clone\\\\apps\\\\web\\\\src\\\\app\\\\(app)\\\\layout.tsx" from the server, but it\'s on the client. It\'s not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.',
          );
        },
        'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\layout.tsx',
        'default',
      );
    },
    76105: (a, b, c) => {
      'use strict';
      (c.r(b), c.d(b, { default: () => t }));
      var d = c(78157),
        e = c(71159),
        f = c(31768),
        g = c(91864),
        h = c(41921);
      function i({ children: a }) {
        return (
          (0, e.useRouter)(),
          (0, e.usePathname)(),
          (0, h.n)((a) => a.accessToken),
          (0, h.n)((a) => a.hasHydrated),
          (0, f.useRef)(!1),
          (0, d.jsx)(d.Fragment, { children: a })
        );
      }
      c(32303);
      var j = c(32315),
        k = c(14380),
        l = c(77222),
        m = c(46515),
        n = c(25493),
        o = c(41030),
        p = c(53704);
      function q() {
        let a = (0, n.n)((a) => a.searchOpen),
          b = (0, n.n)((a) => a.setSearchOpen),
          [c, h] = (0, f.useState)(''),
          i = (0, e.useRouter)(),
          q = (0, j.jE)(),
          t = (0, p.k)(),
          u = (function (a, b) {
            let [c, d] = (0, f.useState)(a);
            return c;
          })(c, 0),
          { data: v, isFetching: w } = (0, k.I)({
            queryKey: ['search', u],
            enabled: a && u.length >= 2,
            queryFn: () => (0, g.nr)(`/search?q=${encodeURIComponent(u)}`),
          });
        return (0, d.jsx)(l.N, {
          children:
            a &&
            (0, d.jsx)(m.P.div, {
              className:
                'fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm',
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              onClick: () => b(!1),
              children: (0, d.jsxs)(m.P.div, {
                initial: { opacity: 0, y: 8, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: 8, scale: 0.98 },
                className:
                  'w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-lift dark:bg-surface-elevated/95',
                onClick: (a) => a.stopPropagation(),
                children: [
                  (0, d.jsxs)('div', {
                    className: 'border-b border-line px-4 py-3',
                    children: [
                      (0, d.jsx)('input', {
                        autoFocus: !0,
                        value: c,
                        onChange: (a) => h(a.target.value),
                        placeholder: t('searchPlaceholder'),
                        className:
                          'w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted',
                        'aria-label': t('search'),
                      }),
                      (0, d.jsx)('p', {
                        className: 'mt-1 text-[10px] text-ink-muted',
                        children: '⌘K \xb7 min 2 characters \xb7 results grouped',
                      }),
                    ],
                  }),
                  (0, d.jsxs)('div', {
                    className: 'max-h-[50vh] overflow-y-auto p-3 text-sm',
                    children: [
                      w &&
                        (0, d.jsx)('p', { className: 'text-ink-muted', children: t('searching') }),
                      !w &&
                        v &&
                        (0, d.jsxs)('div', {
                          className: 'space-y-4',
                          children: [
                            (0, d.jsx)(r, {
                              title: t('people'),
                              children: v.users.map((a) =>
                                (0, d.jsxs)(
                                  'button',
                                  {
                                    type: 'button',
                                    className:
                                      'flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                    onClick: async () => {
                                      try {
                                        let c = await (0, o.X)(a.id);
                                        (b(!1),
                                          q.invalidateQueries({ queryKey: ['chats'] }),
                                          i.push(`/chats/${c.id}`));
                                      } catch {
                                        (b(!1), i.push('/chats'));
                                      }
                                    },
                                    children: [
                                      (0, d.jsx)('span', {
                                        className:
                                          'flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-xs font-semibold text-accent',
                                        children: (a.displayName ?? a.username)
                                          .slice(0, 1)
                                          .toUpperCase(),
                                      }),
                                      (0, d.jsxs)('span', {
                                        children: [
                                          (0, d.jsx)('span', {
                                            className: 'font-medium text-ink',
                                            children: a.displayName ?? a.username,
                                          }),
                                          (0, d.jsxs)('span', {
                                            className: 'ml-2 text-xs text-ink-muted',
                                            children: ['@', a.username],
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  a.id,
                                ),
                              ),
                            }),
                            (0, d.jsx)(r, {
                              title: t('chats'),
                              children: v.chats.map((a) =>
                                (0, d.jsxs)(
                                  'button',
                                  {
                                    type: 'button',
                                    className:
                                      'block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                    onClick: () => {
                                      (b(!1), i.push(`/chats/${a.id}`));
                                    },
                                    children: [
                                      (0, d.jsx)('span', {
                                        className: 'font-medium text-ink',
                                        children: a.title ?? 'Untitled',
                                      }),
                                      (0, d.jsx)('span', {
                                        className: 'ml-2 text-xs uppercase text-ink-muted',
                                        children: a.type,
                                      }),
                                    ],
                                  },
                                  a.id,
                                ),
                              ),
                            }),
                            (0, d.jsx)(r, {
                              title: t('messages'),
                              children: v.messages.map((a) =>
                                (0, d.jsxs)(
                                  'button',
                                  {
                                    type: 'button',
                                    className:
                                      'block w-full rounded-xl px-2 py-2 text-left hover:bg-surface-muted/60',
                                    onClick: () => {
                                      (b(!1), i.push(`/chats/${a.chatId}?highlight=${a.id}`));
                                    },
                                    children: [
                                      (0, d.jsx)(s, {
                                        text: (a.snippet ?? a.text ?? '').trim(),
                                        needle: u,
                                      }),
                                      (0, d.jsx)('div', {
                                        className: 'text-[10px] text-ink-muted',
                                        children: new Date(a.createdAt).toLocaleString(),
                                      }),
                                    ],
                                  },
                                  a.id,
                                ),
                              ),
                            }),
                            0 === v.users.length &&
                              0 === v.chats.length &&
                              0 === v.messages.length &&
                              u.length >= 2 &&
                              (0, d.jsx)('p', {
                                className: 'text-ink-muted',
                                children: t('noMatches'),
                              }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
            }),
        });
      }
      function r({ title: a, children: b }) {
        return (0, d.jsxs)('div', {
          children: [
            (0, d.jsx)('p', {
              className: 'mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted',
              children: a,
            }),
            (0, d.jsx)('div', { className: 'space-y-1', children: b }),
          ],
        });
      }
      function s({ text: a, needle: b }) {
        let c = a.toLowerCase().indexOf(b.toLowerCase());
        if (c < 0) return (0, d.jsx)('span', { className: 'text-ink', children: a });
        let e = a.slice(0, c),
          f = a.slice(c, c + b.length),
          g = a.slice(c + b.length);
        return (0, d.jsxs)('span', {
          className: 'text-ink',
          children: [
            e,
            (0, d.jsx)('mark', { className: 'rounded bg-accent/25 px-0.5 text-ink', children: f }),
            g,
          ],
        });
      }
      function t({ children: a }) {
        return (0, d.jsxs)(i, { children: [a, (0, d.jsx)(q, {})] });
      }
    },
    79446: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 76105));
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
            'object' == typeof n && null !== n && 'message' in n ? String(n.message) : l.statusText;
          throw new f(l.status, a, n);
        }
        return n;
      }
    },
  }));
