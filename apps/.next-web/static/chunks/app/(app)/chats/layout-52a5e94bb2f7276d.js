(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [796],
  {
    2982: (e, t, n) => {
      'use strict';
      n.d(t, { H$: () => s, hD: () => i, nr: () => l });
      var a = n(3719);
      let s = 'http://localhost:4000';
      class i extends Error {
        constructor(e, t, n) {
          (super(t), (this.status = e), (this.body = n));
        }
      }
      async function r() {
        let e = a.n.getState().refreshToken;
        if (!e) return null;
        let t = await fetch(''.concat(s, '/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: e }),
        });
        if (!t.ok) return (a.n.getState().clear(), null);
        let n = await t.json();
        return (a.n.getState().setTokens(n), n.accessToken);
      }
      async function l(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { skipAuth: n, ...l } = t,
          d = new Headers(l.headers);
        if (!n) {
          let e = a.n.getState().accessToken;
          e && d.set('Authorization', 'Bearer '.concat(e));
          let t = a.n.getState().sessionId;
          t && d.set('x-session-fingerprint', t);
        }
        let o = l.body;
        null == o ||
          o instanceof FormData ||
          ('object' != typeof o ||
            o instanceof Blob ||
            o instanceof ArrayBuffer ||
            (o = JSON.stringify(o)),
          d.has('Content-Type') || d.set('Content-Type', 'application/json'));
        let c = await fetch(''.concat(s).concat(e), { ...l, body: o, headers: d });
        if (401 === c.status && !n) {
          let t = await r();
          t &&
            (d.set('Authorization', 'Bearer '.concat(t)),
            (c = await fetch(''.concat(s).concat(e), { ...l, body: o, headers: d })));
        }
        let u = await c.text(),
          h = null;
        if (u)
          try {
            h = JSON.parse(u);
          } catch (e) {
            h = { raw: u };
          }
        if (!c.ok) {
          let e =
            'object' == typeof h && null !== h && 'message' in h ? String(h.message) : c.statusText;
          throw new i(c.status, e, h);
        }
        return h;
      }
    },
    3719: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => i });
      var a = n(1620),
        s = n(848);
      let i = (0, a.v)()(
        (0, s.Zr)(
          (e) => ({
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            hasHydrated: !1,
            setTokens: (t) => {
              let { accessToken: n, refreshToken: a, sessionId: s } = t;
              return e({ accessToken: n, refreshToken: a, sessionId: null != s ? s : null });
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
                    i.setState({ hasHydrated: !0 }));
                }));
            },
          },
        ),
      );
    },
    4043: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => a });
      let a = (0, n(1620).v)((e) => ({
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
        setTypingForChat: (t, n) =>
          e((e) => ({
            typingByChat: n
              ? { ...e.typingByChat, [t]: !0 }
              : Object.fromEntries(
                  Object.entries(e.typingByChat).filter((e) => {
                    let [n] = e;
                    return n !== t;
                  }),
                ),
          })),
      }));
    },
    5095: (e, t, n) => {
      'use strict';
      n.d(t, { cn: () => i });
      var a = n(2902),
        s = n(5643);
      function i() {
        for (var e = arguments.length, t = Array(e), n = 0; n < e; n++) t[n] = arguments[n];
        return (0, s.QP)((0, a.$)(t));
      }
    },
    6563: (e, t, n) => {
      'use strict';
      n.d(t, { n: () => i });
      var a = n(1620),
        s = n(848);
      let i = (0, a.v)()(
        (0, s.Zr)((e) => ({ language: 'en', setLanguage: (t) => e({ language: t }) }), {
          name: 'pulse-language',
        }),
      );
    },
    8646: (e, t, n) => {
      'use strict';
      n.d(t, { k: () => r });
      var a = n(7620),
        s = n(6563);
      let i = {
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
      function r() {
        let e = (0, s.n)((e) => e.language);
        return (0, a.useMemo)(
          () => (t) => {
            var n, a, r;
            return null !=
              (r =
                null !=
                (a = (null != (n = i[null != e ? e : s.n.getState().language]) ? n : i.en)[t])
                  ? a
                  : i.en[t])
              ? r
              : t;
          },
          [e],
        );
      }
    },
    9291: (e, t, n) => {
      'use strict';
      (n.r(t), n.d(t, { default: () => w }));
      var a = n(4568),
        s = n(9664),
        i = n.n(s),
        r = n(7541),
        l = n(7620),
        d = n(4869),
        o = n(2995),
        c = n(1562),
        u = n(2982),
        h = n(5095),
        m = n(4043),
        g = n(9610),
        p = n(7946),
        f = n(4595),
        x = n(9100),
        b = n(8646);
      function v(e) {
        var t, n, a, s, i;
        return null !=
          (i =
            null != (s = null != (a = e.title) ? a : null == (t = e.peer) ? void 0 : t.displayName)
              ? s
              : null == (n = e.peer)
                ? void 0
                : n.username)
          ? i
          : 'Chat';
      }
      function y() {
        var e, t, n;
        let s = (0, r.usePathname)(),
          h = (0, r.useRouter)(),
          f = (0, d.jE)(),
          x = (0, b.k)(),
          v = (0, m.n)((e) => e.setSearchOpen),
          [y, w] = (0, l.useState)(''),
          [j, N] = (0, l.useState)(null),
          { data: P, isLoading: T } = (0, o.I)({
            queryKey: ['chats', y],
            queryFn: () => (0, u.nr)('/chats'.concat(y ? '?q='.concat(encodeURIComponent(y)) : '')),
          }),
          S = (0, c.n)({
            mutationFn: (e) =>
              (0, u.nr)('/chats/'.concat(e, '/hide-from-list'), { method: 'POST' }),
            onSuccess: (e, t) => {
              (f.setQueriesData({ queryKey: ['chats'] }, (e) =>
                e ? e.filter((e) => e.id !== t) : e,
              ),
                N(null),
                s === '/chats/'.concat(t) && h.replace('/chats'));
            },
          }),
          C = (0, c.n)({
            mutationFn: (e) => {
              let { chatId: t, on: n } = e;
              return (0, u.nr)('/chats/'.concat(t, '/pin'), { method: 'POST', body: { on: n } });
            },
            onSuccess: (e, t) => {
              f.setQueriesData({ queryKey: ['chats'] }, (e) => {
                if (!e) return e;
                let n = e.map((e) => (e.id === t.chatId ? { ...e, isPinned: t.on } : e));
                return (
                  n.sort((e, t) =>
                    e.isPinned !== t.isPinned
                      ? e.isPinned
                        ? -1
                        : 1
                      : new Date(t.lastMessageAt).getTime() - new Date(e.lastMessageAt).getTime(),
                  ),
                  n
                );
              });
            },
          }),
          O = (0, c.n)({
            mutationFn: (e) => {
              let { chatId: t, on: n } = e;
              return (0, u.nr)('/chats/'.concat(t, '/archive'), {
                method: 'POST',
                body: { on: n },
              });
            },
            onSuccess: (e, t) => {
              (f.setQueriesData({ queryKey: ['chats'] }, (e) => {
                if (!e) return e;
                let n = e.map((e) => (e.id === t.chatId ? { ...e, isArchived: t.on } : e));
                return (
                  n.sort((e, t) =>
                    e.isPinned !== t.isPinned
                      ? e.isPinned
                        ? -1
                        : 1
                      : new Date(t.lastMessageAt).getTime() - new Date(e.lastMessageAt).getTime(),
                  ),
                  n
                );
              }),
                N(null));
            },
          }),
          M = (0, c.n)({
            mutationFn: (e) => {
              let { chatId: t, on: n } = e;
              return (0, u.nr)('/chats/'.concat(t, '/mute'), {
                method: 'POST',
                body: { until: n ? new Date(Date.now() + 31536e6).toISOString() : null },
              });
            },
            onSuccess: (e, t) => {
              (f.setQueriesData({ queryKey: ['chats'] }, (e) =>
                e ? e.map((e) => (e.id === t.chatId ? { ...e, isMuted: t.on } : e)) : e,
              ),
                N(null));
            },
          });
        (0, l.useEffect)(() => {
          if (!j) return;
          let e = () => N(null),
            t = window.setTimeout(() => window.addEventListener('click', e), 0);
          return () => {
            (clearTimeout(t), window.removeEventListener('click', e));
          };
        }, [j]);
        let D =
            null != (e = null == P ? void 0 : P.filter((e) => e.isPinned && !e.isArchived))
              ? e
              : [],
          A =
            null != (t = null == P ? void 0 : P.filter((e) => !e.isPinned && !e.isArchived))
              ? t
              : [],
          I = null != (n = null == P ? void 0 : P.filter((e) => e.isArchived)) ? n : [],
          E = (0, c.n)({
            mutationFn: (e) =>
              (0, u.nr)('/chats/pins/reorder', { method: 'POST', body: { chatIds: e } }),
          });
        return (0, a.jsxs)('aside', {
          className:
            'flex h-full min-h-0 w-full flex-col border-r border-line/80 bg-sidebar dark:border-line/60',
          children: [
            (0, a.jsxs)('div', {
              className: 'border-b border-line/70 px-2.5 pb-2 pt-2 dark:border-line/45',
              children: [
                (0, a.jsxs)('div', {
                  className: 'mb-1.5 flex items-center gap-2 px-0.5',
                  children: [
                    (0, a.jsx)('div', {
                      className:
                        'font-display text-[0.98rem] font-semibold tracking-tight text-ink',
                      children: 'Pulse',
                    }),
                    (0, a.jsx)('button', {
                      type: 'button',
                      onClick: () => v(!0),
                      className:
                        'ml-auto flex h-7 items-center rounded-md border border-line/90 bg-surface-muted/50 px-2 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/80 hover:text-ink dark:border-line/55 dark:bg-surface-elevated/35 dark:hover:border-accent/30',
                      'aria-label': x('search'),
                      children: x('search'),
                    }),
                  ],
                }),
                (0, a.jsx)('input', {
                  value: y,
                  onChange: (e) => w(e.target.value),
                  placeholder: x('filterConversations'),
                  className:
                    'h-8 w-full rounded-md border border-line/90 bg-surface-muted/60 px-2.5 text-[12.5px] text-ink placeholder:text-ink-muted/75 outline-none ring-accent/20 focus:border-accent/40 focus:ring-[3px] dark:border-line/50 dark:bg-surface-elevated/45 dark:focus:border-accent/35',
                  'aria-label': x('filterConversations'),
                }),
              ],
            }),
            (0, a.jsxs)('div', {
              className: 'scrollbar-thin flex-1 overflow-y-auto px-1 py-0.5',
              children: [
                T &&
                  (0, a.jsx)('div', {
                    className: 'space-y-0.5 px-0.5',
                    children: [1, 2, 3, 4, 5, 6, 7].map((e) =>
                      (0, a.jsxs)(
                        'div',
                        {
                          className: 'flex items-center gap-2 rounded-md px-1.5 py-1',
                          children: [
                            (0, a.jsx)('div', {
                              className:
                                'h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-muted dark:bg-surface-elevated/80',
                            }),
                            (0, a.jsxs)('div', {
                              className: 'min-w-0 flex-1 space-y-1.5',
                              children: [
                                (0, a.jsx)('div', {
                                  className:
                                    'h-3.5 w-2/3 animate-pulse rounded bg-surface-muted dark:bg-surface-elevated/80',
                                }),
                                (0, a.jsx)('div', {
                                  className:
                                    'h-3 w-full animate-pulse rounded bg-surface-muted/80 dark:bg-surface-elevated/60',
                                }),
                              ],
                            }),
                          ],
                        },
                        e,
                      ),
                    ),
                  }),
                !T &&
                  D.length > 0 &&
                  (0, a.jsxs)('div', {
                    className: 'mb-1',
                    children: [
                      (0, a.jsx)('p', {
                        className:
                          'px-2 pb-0.5 pt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80',
                        children: x('pinned'),
                      }),
                      (0, a.jsx)(g.x, {
                        axis: 'y',
                        values: D,
                        onReorder: (e) => {
                          (f.setQueriesData({ queryKey: ['chats'] }, (t) => {
                            if (!t) return t;
                            let n = new Set(e.map((e) => e.id));
                            return [
                              ...e.map((e, t) => ({ ...e, pinOrder: t })),
                              ...t.filter((e) => !n.has(e.id)),
                            ];
                          }),
                            E.mutateAsync(e.map((e) => e.id)).catch(() => void 0));
                        },
                        className: 'space-y-px',
                        children: D.map((e) =>
                          (0, a.jsx)(
                            p.N,
                            {
                              value: e,
                              className: 'cursor-grab active:cursor-grabbing',
                              children: (0, a.jsx)(k, {
                                chat: e,
                                active: s === '/chats/'.concat(e.id),
                                menuOpen: j === e.id,
                                onToggleMenu: () => N((t) => (t === e.id ? null : e.id)),
                                onHide: () => S.mutate(e.id),
                                onPinToggle: (t) => C.mutate({ chatId: e.id, on: t }),
                                onArchiveToggle: (t) => O.mutate({ chatId: e.id, on: t }),
                                onMuteToggle: (t) => M.mutate({ chatId: e.id, on: t }),
                                hidePending: S.isPending,
                                pinPending: C.isPending,
                                archivePending: O.isPending,
                                mutePending: M.isPending,
                              }),
                            },
                            e.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                (0, a.jsx)('div', {
                  className: 'space-y-px',
                  children: A.map((e) =>
                    (0, a.jsx)(
                      k,
                      {
                        chat: e,
                        active: s === '/chats/'.concat(e.id),
                        menuOpen: j === e.id,
                        onToggleMenu: () => N((t) => (t === e.id ? null : e.id)),
                        onHide: () => S.mutate(e.id),
                        onPinToggle: (t) => C.mutate({ chatId: e.id, on: t }),
                        onArchiveToggle: (t) => O.mutate({ chatId: e.id, on: t }),
                        onMuteToggle: (t) => M.mutate({ chatId: e.id, on: t }),
                        hidePending: S.isPending,
                        pinPending: C.isPending,
                        archivePending: O.isPending,
                        mutePending: M.isPending,
                      },
                      e.id,
                    ),
                  ),
                }),
                !T &&
                  I.length > 0 &&
                  (0, a.jsxs)('div', {
                    className: 'mt-2',
                    children: [
                      (0, a.jsx)('p', {
                        className:
                          'px-2 pb-0.5 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80',
                        children: x('archived'),
                      }),
                      (0, a.jsx)('div', {
                        className: 'space-y-px opacity-[0.88]',
                        children: I.map((e) =>
                          (0, a.jsx)(
                            k,
                            {
                              chat: e,
                              active: s === '/chats/'.concat(e.id),
                              menuOpen: j === e.id,
                              onToggleMenu: () => N((t) => (t === e.id ? null : e.id)),
                              onHide: () => S.mutate(e.id),
                              onPinToggle: (t) => C.mutate({ chatId: e.id, on: t }),
                              onArchiveToggle: (t) => O.mutate({ chatId: e.id, on: t }),
                              onMuteToggle: (t) => M.mutate({ chatId: e.id, on: t }),
                              hidePending: S.isPending,
                              pinPending: C.isPending,
                              archivePending: O.isPending,
                              mutePending: M.isPending,
                            },
                            e.id,
                          ),
                        ),
                      }),
                    ],
                  }),
              ],
            }),
            (0, a.jsx)('div', {
              className: 'border-t border-line/70 p-1.5 dark:border-line/45',
              children: (0, a.jsxs)('div', {
                className: 'flex gap-1',
                children: [
                  (0, a.jsx)(i(), {
                    href: '/settings',
                    className:
                      'flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45',
                    children: x('settings'),
                  }),
                  (0, a.jsx)(i(), {
                    href: '/sessions',
                    className:
                      'flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45',
                    children: x('sessions'),
                  }),
                ],
              }),
            }),
          ],
        });
      }
      function k(e) {
        var t, n, s, r;
        let {
            chat: l,
            active: d,
            menuOpen: o,
            onToggleMenu: c,
            onHide: u,
            onPinToggle: m,
            onArchiveToggle: g,
            onMuteToggle: p,
            hidePending: y,
            pinPending: k,
            archivePending: w,
            mutePending: j,
          } = e,
          N = (0, b.k)(),
          P = (function (e) {
            let t = new Date(e);
            if (Number.isNaN(t.getTime())) return '';
            let n = new Date(),
              a = new Date(n.getFullYear(), n.getMonth(), n.getDate()),
              s = new Date(t.getFullYear(), t.getMonth(), t.getDate()),
              i = Math.round((a.getTime() - s.getTime()) / 864e5),
              r = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return 0 === i
              ? r
              : 1 === i
                ? 'Yesterday'
                : i < 7
                  ? t.toLocaleDateString([], { weekday: 'short' })
                  : t.toLocaleDateString([], { month: 'short', day: 'numeric' });
          })(l.lastMessageAt),
          T =
            null !=
            (r = null != (s = l.avatarUrl) ? s : null == (n = l.peer) ? void 0 : n.avatarUrl)
              ? r
              : null,
          S = v(l),
          C = (null == (t = l.lastMessagePreview) ? void 0 : t.trim()) || ' ';
        return (0, a.jsx)(f.P.div, {
          layout: !0,
          transition: { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 },
          className: 'group/row relative',
          children: (0, a.jsxs)('div', {
            className: (0, h.cn)(
              'flex min-h-[2.75rem] items-stretch gap-0 rounded-md transition-colors',
              'hover:bg-surface-muted/85 dark:hover:bg-surface-elevated/50',
              d &&
                'bg-accent/[0.11] dark:bg-accent/[0.09] before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-accent',
            ),
            children: [
              (0, a.jsxs)(i(), {
                href: '/chats/'.concat(l.id),
                className: 'flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'relative h-10 w-10 shrink-0',
                    children: [
                      T
                        ? (0, a.jsx)('img', {
                            src: T,
                            alt: '',
                            className:
                              'h-10 w-10 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35',
                          })
                        : (0, a.jsx)('div', {
                            className: (0, h.cn)(
                              'flex h-10 w-10 items-center justify-center rounded-full text-[0.8125rem] font-semibold ring-1 ring-line/45 dark:ring-line/35',
                              'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                              'dark:from-accent/25 dark:to-accent/5',
                            ),
                            children: v(l).slice(0, 1).toUpperCase() || '?',
                          }),
                      l.isMuted &&
                        (0, a.jsx)('span', {
                          className:
                            'absolute bottom-0 right-0 h-2 w-2 rounded-full bg-ink-muted ring-2 ring-sidebar dark:bg-ink-muted/80 dark:ring-sidebar',
                          title: 'Muted',
                        }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'min-w-0 flex-1',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'flex items-baseline gap-2',
                        children: [
                          (0, a.jsx)('span', {
                            className: (0, h.cn)(
                              'min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight text-ink',
                              d && 'text-ink',
                            ),
                            children: S,
                          }),
                          (0, a.jsx)('span', {
                            className: (0, h.cn)(
                              'shrink-0 text-[0.65rem] tabular-nums text-ink-muted/90',
                              l.unreadCount > 0 && 'font-bold text-accent dark:text-accent',
                            ),
                            children: P,
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'mt-px flex items-center gap-1.5',
                        children: [
                          (0, a.jsx)('p', {
                            className:
                              'min-w-0 flex-1 truncate text-[11.5px] leading-snug text-ink-muted/95 group-hover/row:text-ink-muted',
                            children: C,
                          }),
                          l.unreadCount > 0 &&
                            (0, a.jsx)('span', {
                              className:
                                'flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-accent-foreground shadow-sm dark:shadow-bubble-dark',
                              children: l.unreadCount > 99 ? '99+' : l.unreadCount,
                            }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)('div', {
                className: 'relative flex shrink-0 items-center pr-1',
                children: [
                  (0, a.jsx)(f.P.button, {
                    type: 'button',
                    className: (0, h.cn)(
                      'flex h-8 w-7 items-center justify-center rounded-md text-ink-muted/55 transition hover:bg-surface-elevated/80 hover:text-ink',
                      'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus:opacity-100',
                      o && 'opacity-100',
                    ),
                    'aria-expanded': o,
                    'aria-haspopup': 'menu',
                    'aria-label': 'Chat actions',
                    onClick: (e) => {
                      (e.preventDefault(), e.stopPropagation(), c());
                    },
                    whileTap: { scale: 0.96 },
                    children: (0, a.jsx)('span', {
                      className: 'text-lg leading-none',
                      children: '⋯',
                    }),
                  }),
                  (0, a.jsx)(x.N, {
                    children:
                      o &&
                      (0, a.jsxs)(f.P.div, {
                        initial: { opacity: 0, y: -4, scale: 0.985 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -4, scale: 0.985 },
                        transition: { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] },
                        className:
                          'absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-lg border border-line/90 bg-surface-elevated py-0.5 shadow-lift dark:border-line/55 dark:bg-surface-elevated/98',
                        role: 'menu',
                        onClick: (e) => e.stopPropagation(),
                        children: [
                          (0, a.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: k,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => m(!l.isPinned),
                            children: l.isPinned ? N('unpin') : N('pin'),
                          }),
                          (0, a.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: w,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => g(!l.isArchived),
                            children: l.isArchived ? N('unarchive') : N('archive'),
                          }),
                          (0, a.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: j,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => p(!l.isMuted),
                            children: l.isMuted ? N('unmute') : N('mute'),
                          }),
                          (0, a.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: y,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => void (window.confirm(N('hideChat')) && u()),
                            children: N('hideChat'),
                          }),
                        ],
                      }),
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function w(e) {
        let { children: t } = e,
          n = (0, m.n)((e) => e.sidebarOpen),
          s = (0, m.n)((e) => e.setSidebarOpen);
        return (0, a.jsxs)('div', {
          className: 'flex h-dvh min-h-0 w-full overflow-hidden bg-surface',
          children: [
            (0, a.jsx)('div', {
              className: (0, h.cn)(
                'absolute inset-y-0 left-0 z-20 w-[min(100%,360px)] transition-transform md:static md:translate-x-0',
                n ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
              ),
              children: (0, a.jsx)('div', {
                className:
                  'flex h-full flex-col border-r border-line/80 bg-sidebar dark:border-line/50',
                children: (0, a.jsx)(y, {}),
              }),
            }),
            !n &&
              (0, a.jsx)('button', {
                type: 'button',
                className:
                  'fixed left-3 top-3 z-30 rounded-full border border-line bg-surface-elevated px-3 py-1 text-xs shadow-sm md:hidden',
                onClick: () => s(!0),
                children: 'Chats',
              }),
            (0, a.jsx)('main', { className: 'relative min-h-0 min-w-0 flex-1', children: t }),
          ],
        });
      }
    },
    9567: (e, t, n) => {
      Promise.resolve().then(n.bind(n, 9291));
    },
  },
  (e) => {
    (e.O(0, [887, 664, 595, 995, 836, 953, 587, 18, 358], () => e((e.s = 9567))), (_N_E = e.O()));
  },
]);
