((exports.id = 33),
  (exports.ids = [33]),
  (exports.modules = {
    15351: (a, b, c) => {
      'use strict';
      c.d(b, { cn: () => f });
      var d = c(79390),
        e = c(4315);
      function f(...a) {
        return (0, e.QP)((0, d.$)(a));
      }
    },
    23803: (a, b, c) => {
      'use strict';
      (c.r(b), c.d(b, { default: () => d }));
      let d = (0, c(25459).registerClientReference)(
        function () {
          throw Error(
            'Attempted to call the default export of "C:\\\\telegram-clone\\\\apps\\\\web\\\\src\\\\app\\\\(app)\\\\chats\\\\layout.tsx" from the server, but it\'s on the client. It\'s not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.',
          );
        },
        'C:\\telegram-clone\\apps\\web\\src\\app\\(app)\\chats\\layout.tsx',
        'default',
      );
    },
    34246: (a, b, c) => {
      'use strict';
      (c.r(b), c.d(b, { default: () => w }));
      var d = c(78157),
        e = c(94496),
        f = c.n(e),
        g = c(71159),
        h = c(31768),
        i = c(32315),
        j = c(14380),
        k = c(86539),
        l = c(91864),
        m = c(15351),
        n = c(25493),
        o = c(76751),
        p = c(78328),
        q = c(46515),
        r = c(77222),
        s = c(53704);
      function t(a) {
        return a.title ?? a.peer?.displayName ?? a.peer?.username ?? 'Chat';
      }
      function u() {
        let a = (0, g.usePathname)(),
          b = (0, g.useRouter)(),
          c = (0, i.jE)(),
          e = (0, s.k)(),
          m = (0, n.n)((a) => a.setSearchOpen),
          [q, r] = (0, h.useState)(''),
          [t, u] = (0, h.useState)(null),
          { data: w, isLoading: x } = (0, j.I)({
            queryKey: ['chats', q],
            queryFn: () => (0, l.nr)(`/chats${q ? `?q=${encodeURIComponent(q)}` : ''}`),
          }),
          y = (0, k.n)({
            mutationFn: (a) => (0, l.nr)(`/chats/${a}/hide-from-list`, { method: 'POST' }),
            onSuccess: (d, e) => {
              (c.setQueriesData({ queryKey: ['chats'] }, (a) =>
                a ? a.filter((a) => a.id !== e) : a,
              ),
                u(null),
                a === `/chats/${e}` && b.replace('/chats'));
            },
          }),
          z = (0, k.n)({
            mutationFn: ({ chatId: a, on: b }) =>
              (0, l.nr)(`/chats/${a}/pin`, { method: 'POST', body: { on: b } }),
            onSuccess: (a, b) => {
              c.setQueriesData({ queryKey: ['chats'] }, (a) => {
                if (!a) return a;
                let c = a.map((a) => (a.id === b.chatId ? { ...a, isPinned: b.on } : a));
                return (
                  c.sort((a, b) =>
                    a.isPinned !== b.isPinned
                      ? a.isPinned
                        ? -1
                        : 1
                      : new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
                  ),
                  c
                );
              });
            },
          }),
          A = (0, k.n)({
            mutationFn: ({ chatId: a, on: b }) =>
              (0, l.nr)(`/chats/${a}/archive`, { method: 'POST', body: { on: b } }),
            onSuccess: (a, b) => {
              (c.setQueriesData({ queryKey: ['chats'] }, (a) => {
                if (!a) return a;
                let c = a.map((a) => (a.id === b.chatId ? { ...a, isArchived: b.on } : a));
                return (
                  c.sort((a, b) =>
                    a.isPinned !== b.isPinned
                      ? a.isPinned
                        ? -1
                        : 1
                      : new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
                  ),
                  c
                );
              }),
                u(null));
            },
          }),
          B = (0, k.n)({
            mutationFn: ({ chatId: a, on: b }) =>
              (0, l.nr)(`/chats/${a}/mute`, {
                method: 'POST',
                body: { until: b ? new Date(Date.now() + 31536e6).toISOString() : null },
              }),
            onSuccess: (a, b) => {
              (c.setQueriesData({ queryKey: ['chats'] }, (a) =>
                a ? a.map((a) => (a.id === b.chatId ? { ...a, isMuted: b.on } : a)) : a,
              ),
                u(null));
            },
          }),
          C = w?.filter((a) => a.isPinned && !a.isArchived) ?? [],
          D = w?.filter((a) => !a.isPinned && !a.isArchived) ?? [],
          E = w?.filter((a) => a.isArchived) ?? [],
          F = (0, k.n)({
            mutationFn: (a) =>
              (0, l.nr)('/chats/pins/reorder', { method: 'POST', body: { chatIds: a } }),
          });
        return (0, d.jsxs)('aside', {
          className:
            'flex h-full min-h-0 w-full flex-col border-r border-line/80 bg-sidebar dark:border-line/60',
          children: [
            (0, d.jsxs)('div', {
              className: 'border-b border-line/70 px-2.5 pb-2 pt-2 dark:border-line/45',
              children: [
                (0, d.jsxs)('div', {
                  className: 'mb-1.5 flex items-center gap-2 px-0.5',
                  children: [
                    (0, d.jsx)('div', {
                      className:
                        'font-display text-[0.98rem] font-semibold tracking-tight text-ink',
                      children: 'Pulse',
                    }),
                    (0, d.jsx)('button', {
                      type: 'button',
                      onClick: () => m(!0),
                      className:
                        'ml-auto flex h-7 items-center rounded-md border border-line/90 bg-surface-muted/50 px-2 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/80 hover:text-ink dark:border-line/55 dark:bg-surface-elevated/35 dark:hover:border-accent/30',
                      'aria-label': e('search'),
                      children: e('search'),
                    }),
                  ],
                }),
                (0, d.jsx)('input', {
                  value: q,
                  onChange: (a) => r(a.target.value),
                  placeholder: e('filterConversations'),
                  className:
                    'h-8 w-full rounded-md border border-line/90 bg-surface-muted/60 px-2.5 text-[12.5px] text-ink placeholder:text-ink-muted/75 outline-none ring-accent/20 focus:border-accent/40 focus:ring-[3px] dark:border-line/50 dark:bg-surface-elevated/45 dark:focus:border-accent/35',
                  'aria-label': e('filterConversations'),
                }),
              ],
            }),
            (0, d.jsxs)('div', {
              className: 'scrollbar-thin flex-1 overflow-y-auto px-1 py-0.5',
              children: [
                x &&
                  (0, d.jsx)('div', {
                    className: 'space-y-0.5 px-0.5',
                    children: [1, 2, 3, 4, 5, 6, 7].map((a) =>
                      (0, d.jsxs)(
                        'div',
                        {
                          className: 'flex items-center gap-2 rounded-md px-1.5 py-1',
                          children: [
                            (0, d.jsx)('div', {
                              className:
                                'h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-muted dark:bg-surface-elevated/80',
                            }),
                            (0, d.jsxs)('div', {
                              className: 'min-w-0 flex-1 space-y-1.5',
                              children: [
                                (0, d.jsx)('div', {
                                  className:
                                    'h-3.5 w-2/3 animate-pulse rounded bg-surface-muted dark:bg-surface-elevated/80',
                                }),
                                (0, d.jsx)('div', {
                                  className:
                                    'h-3 w-full animate-pulse rounded bg-surface-muted/80 dark:bg-surface-elevated/60',
                                }),
                              ],
                            }),
                          ],
                        },
                        a,
                      ),
                    ),
                  }),
                !x &&
                  C.length > 0 &&
                  (0, d.jsxs)('div', {
                    className: 'mb-1',
                    children: [
                      (0, d.jsx)('p', {
                        className:
                          'px-2 pb-0.5 pt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80',
                        children: e('pinned'),
                      }),
                      (0, d.jsx)(o.x, {
                        axis: 'y',
                        values: C,
                        onReorder: (a) => {
                          (c.setQueriesData({ queryKey: ['chats'] }, (b) => {
                            if (!b) return b;
                            let c = new Set(a.map((a) => a.id));
                            return [
                              ...a.map((a, b) => ({ ...a, pinOrder: b })),
                              ...b.filter((a) => !c.has(a.id)),
                            ];
                          }),
                            F.mutateAsync(a.map((a) => a.id)).catch(() => void 0));
                        },
                        className: 'space-y-px',
                        children: C.map((b) =>
                          (0, d.jsx)(
                            p.N,
                            {
                              value: b,
                              className: 'cursor-grab active:cursor-grabbing',
                              children: (0, d.jsx)(v, {
                                chat: b,
                                active: a === `/chats/${b.id}`,
                                menuOpen: t === b.id,
                                onToggleMenu: () => u((a) => (a === b.id ? null : b.id)),
                                onHide: () => y.mutate(b.id),
                                onPinToggle: (a) => z.mutate({ chatId: b.id, on: a }),
                                onArchiveToggle: (a) => A.mutate({ chatId: b.id, on: a }),
                                onMuteToggle: (a) => B.mutate({ chatId: b.id, on: a }),
                                hidePending: y.isPending,
                                pinPending: z.isPending,
                                archivePending: A.isPending,
                                mutePending: B.isPending,
                              }),
                            },
                            b.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                (0, d.jsx)('div', {
                  className: 'space-y-px',
                  children: D.map((b) =>
                    (0, d.jsx)(
                      v,
                      {
                        chat: b,
                        active: a === `/chats/${b.id}`,
                        menuOpen: t === b.id,
                        onToggleMenu: () => u((a) => (a === b.id ? null : b.id)),
                        onHide: () => y.mutate(b.id),
                        onPinToggle: (a) => z.mutate({ chatId: b.id, on: a }),
                        onArchiveToggle: (a) => A.mutate({ chatId: b.id, on: a }),
                        onMuteToggle: (a) => B.mutate({ chatId: b.id, on: a }),
                        hidePending: y.isPending,
                        pinPending: z.isPending,
                        archivePending: A.isPending,
                        mutePending: B.isPending,
                      },
                      b.id,
                    ),
                  ),
                }),
                !x &&
                  E.length > 0 &&
                  (0, d.jsxs)('div', {
                    className: 'mt-2',
                    children: [
                      (0, d.jsx)('p', {
                        className:
                          'px-2 pb-0.5 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted/80',
                        children: e('archived'),
                      }),
                      (0, d.jsx)('div', {
                        className: 'space-y-px opacity-[0.88]',
                        children: E.map((b) =>
                          (0, d.jsx)(
                            v,
                            {
                              chat: b,
                              active: a === `/chats/${b.id}`,
                              menuOpen: t === b.id,
                              onToggleMenu: () => u((a) => (a === b.id ? null : b.id)),
                              onHide: () => y.mutate(b.id),
                              onPinToggle: (a) => z.mutate({ chatId: b.id, on: a }),
                              onArchiveToggle: (a) => A.mutate({ chatId: b.id, on: a }),
                              onMuteToggle: (a) => B.mutate({ chatId: b.id, on: a }),
                              hidePending: y.isPending,
                              pinPending: z.isPending,
                              archivePending: A.isPending,
                              mutePending: B.isPending,
                            },
                            b.id,
                          ),
                        ),
                      }),
                    ],
                  }),
              ],
            }),
            (0, d.jsx)('div', {
              className: 'border-t border-line/70 p-1.5 dark:border-line/45',
              children: (0, d.jsxs)('div', {
                className: 'flex gap-1',
                children: [
                  (0, d.jsx)(f(), {
                    href: '/settings',
                    className:
                      'flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45',
                    children: e('settings'),
                  }),
                  (0, d.jsx)(f(), {
                    href: '/sessions',
                    className:
                      'flex-1 rounded-md border border-line/90 py-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-accent/30 hover:bg-surface-muted/60 hover:text-ink dark:border-line/55 dark:hover:bg-surface-elevated/45',
                    children: e('sessions'),
                  }),
                ],
              }),
            }),
          ],
        });
      }
      function v({
        chat: a,
        active: b,
        menuOpen: c,
        onToggleMenu: e,
        onHide: g,
        onPinToggle: h,
        onArchiveToggle: i,
        onMuteToggle: j,
        hidePending: k,
        pinPending: l,
        archivePending: n,
        mutePending: o,
      }) {
        let p = (0, s.k)(),
          u = (function (a) {
            let b = new Date(a);
            if (Number.isNaN(b.getTime())) return '';
            let c = new Date(),
              d = new Date(c.getFullYear(), c.getMonth(), c.getDate()),
              e = new Date(b.getFullYear(), b.getMonth(), b.getDate()),
              f = Math.round((d.getTime() - e.getTime()) / 864e5),
              g = b.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return 0 === f
              ? g
              : 1 === f
                ? 'Yesterday'
                : f < 7
                  ? b.toLocaleDateString([], { weekday: 'short' })
                  : b.toLocaleDateString([], { month: 'short', day: 'numeric' });
          })(a.lastMessageAt),
          v = a.avatarUrl ?? a.peer?.avatarUrl ?? null,
          w = t(a),
          x = a.lastMessagePreview?.trim() || ' ';
        return (0, d.jsx)(q.P.div, {
          layout: !0,
          transition: { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 },
          className: 'group/row relative',
          children: (0, d.jsxs)('div', {
            className: (0, m.cn)(
              'flex min-h-[2.75rem] items-stretch gap-0 rounded-md transition-colors',
              'hover:bg-surface-muted/85 dark:hover:bg-surface-elevated/50',
              b &&
                'bg-accent/[0.11] dark:bg-accent/[0.09] before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-accent',
            ),
            children: [
              (0, d.jsxs)(f(), {
                href: `/chats/${a.id}`,
                className: 'flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1',
                children: [
                  (0, d.jsxs)('div', {
                    className: 'relative h-10 w-10 shrink-0',
                    children: [
                      v
                        ? (0, d.jsx)('img', {
                            src: v,
                            alt: '',
                            className:
                              'h-10 w-10 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35',
                          })
                        : (0, d.jsx)('div', {
                            className: (0, m.cn)(
                              'flex h-10 w-10 items-center justify-center rounded-full text-[0.8125rem] font-semibold ring-1 ring-line/45 dark:ring-line/35',
                              'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                              'dark:from-accent/25 dark:to-accent/5',
                            ),
                            children: t(a).slice(0, 1).toUpperCase() || '?',
                          }),
                      a.isMuted &&
                        (0, d.jsx)('span', {
                          className:
                            'absolute bottom-0 right-0 h-2 w-2 rounded-full bg-ink-muted ring-2 ring-sidebar dark:bg-ink-muted/80 dark:ring-sidebar',
                          title: 'Muted',
                        }),
                    ],
                  }),
                  (0, d.jsxs)('div', {
                    className: 'min-w-0 flex-1',
                    children: [
                      (0, d.jsxs)('div', {
                        className: 'flex items-baseline gap-2',
                        children: [
                          (0, d.jsx)('span', {
                            className: (0, m.cn)(
                              'min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight text-ink',
                              b && 'text-ink',
                            ),
                            children: w,
                          }),
                          (0, d.jsx)('span', {
                            className: (0, m.cn)(
                              'shrink-0 text-[0.65rem] tabular-nums text-ink-muted/90',
                              a.unreadCount > 0 && 'font-bold text-accent dark:text-accent',
                            ),
                            children: u,
                          }),
                        ],
                      }),
                      (0, d.jsxs)('div', {
                        className: 'mt-px flex items-center gap-1.5',
                        children: [
                          (0, d.jsx)('p', {
                            className:
                              'min-w-0 flex-1 truncate text-[11.5px] leading-snug text-ink-muted/95 group-hover/row:text-ink-muted',
                            children: x,
                          }),
                          a.unreadCount > 0 &&
                            (0, d.jsx)('span', {
                              className:
                                'flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-accent-foreground shadow-sm dark:shadow-bubble-dark',
                              children: a.unreadCount > 99 ? '99+' : a.unreadCount,
                            }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, d.jsxs)('div', {
                className: 'relative flex shrink-0 items-center pr-1',
                children: [
                  (0, d.jsx)(q.P.button, {
                    type: 'button',
                    className: (0, m.cn)(
                      'flex h-8 w-7 items-center justify-center rounded-md text-ink-muted/55 transition hover:bg-surface-elevated/80 hover:text-ink',
                      'opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus:opacity-100',
                      c && 'opacity-100',
                    ),
                    'aria-expanded': c,
                    'aria-haspopup': 'menu',
                    'aria-label': 'Chat actions',
                    onClick: (a) => {
                      (a.preventDefault(), a.stopPropagation(), e());
                    },
                    whileTap: { scale: 0.96 },
                    children: (0, d.jsx)('span', {
                      className: 'text-lg leading-none',
                      children: '⋯',
                    }),
                  }),
                  (0, d.jsx)(r.N, {
                    children:
                      c &&
                      (0, d.jsxs)(q.P.div, {
                        initial: { opacity: 0, y: -4, scale: 0.985 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -4, scale: 0.985 },
                        transition: { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] },
                        className:
                          'absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-lg border border-line/90 bg-surface-elevated py-0.5 shadow-lift dark:border-line/55 dark:bg-surface-elevated/98',
                        role: 'menu',
                        onClick: (a) => a.stopPropagation(),
                        children: [
                          (0, d.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: l,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => h(!a.isPinned),
                            children: a.isPinned ? p('unpin') : p('pin'),
                          }),
                          (0, d.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: n,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => i(!a.isArchived),
                            children: a.isArchived ? p('unarchive') : p('archive'),
                          }),
                          (0, d.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: o,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => j(!a.isMuted),
                            children: a.isMuted ? p('unmute') : p('mute'),
                          }),
                          (0, d.jsx)('button', {
                            type: 'button',
                            role: 'menuitem',
                            disabled: k,
                            className:
                              'w-full px-2.5 py-1.5 text-left text-[12px] font-medium text-ink transition hover:bg-surface-muted/90 disabled:opacity-50 dark:hover:bg-surface-muted/40',
                            onClick: () => void (window.confirm(p('hideChat')) && g()),
                            children: p('hideChat'),
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
      function w({ children: a }) {
        let b = (0, n.n)((a) => a.sidebarOpen),
          c = (0, n.n)((a) => a.setSidebarOpen);
        return (0, d.jsxs)('div', {
          className: 'flex h-dvh min-h-0 w-full overflow-hidden bg-surface',
          children: [
            (0, d.jsx)('div', {
              className: (0, m.cn)(
                'absolute inset-y-0 left-0 z-20 w-[min(100%,360px)] transition-transform md:static md:translate-x-0',
                b ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
              ),
              children: (0, d.jsx)('div', {
                className:
                  'flex h-full flex-col border-r border-line/80 bg-sidebar dark:border-line/50',
                children: (0, d.jsx)(u, {}),
              }),
            }),
            !b &&
              (0, d.jsx)('button', {
                type: 'button',
                className:
                  'fixed left-3 top-3 z-30 rounded-full border border-line bg-surface-elevated px-3 py-1 text-xs shadow-sm md:hidden',
                onClick: () => c(!0),
                children: 'Chats',
              }),
            (0, d.jsx)('main', { className: 'relative min-h-0 min-w-0 flex-1', children: a }),
          ],
        });
      }
    },
    50113: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 23803));
    },
    63265: (a, b, c) => {
      Promise.resolve().then(c.bind(c, 34246));
    },
  }));
