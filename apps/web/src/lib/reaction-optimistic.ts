import type { MessageDto } from '@/lib/types';

type R = MessageDto['reactions'][number];

/** Immutable optimistic add/remove of current user's reaction row. */
export function applyOptimisticReaction(
  reactions: MessageDto['reactions'],
  emoji: string,
  userId: string,
  add: boolean,
): MessageDto['reactions'] {
  const rows: R[] = reactions.map((r) => ({
    emoji: r.emoji,
    count: r.count,
    userIds: [...r.userIds],
  }));
  const i = rows.findIndex((r) => r.emoji === emoji);
  if (add) {
    if (i >= 0) {
      if (rows[i].userIds.includes(userId)) return reactions;
      rows[i] = {
        emoji,
        userIds: [...rows[i].userIds, userId],
        count: rows[i].count + 1,
      };
      return rows;
    }
    return [...rows, { emoji, userIds: [userId], count: 1 }];
  }
  if (i < 0) return reactions;
  const u = rows[i].userIds.filter((id) => id !== userId);
  if (u.length === 0) {
    rows.splice(i, 1);
    return rows;
  }
  rows[i] = { emoji, userIds: u, count: u.length };
  return rows;
}
