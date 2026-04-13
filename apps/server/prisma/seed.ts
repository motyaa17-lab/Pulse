import { PrismaClient, ChatType, MemberRole, MessageType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@pulse.app' },
    update: {},
    create: {
      email: 'alice@pulse.app',
      username: 'alice',
      displayName: 'Alice Hart',
      bio: 'Product designer · Berlin',
      passwordHash: pass,
      notificationPrefs: { create: {} },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@pulse.app' },
    update: {},
    create: {
      email: 'bob@pulse.app',
      username: 'bob',
      displayName: 'Bob Singh',
      bio: 'Backend engineer',
      passwordHash: pass,
      notificationPrefs: { create: {} },
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@pulse.app' },
    update: {},
    create: {
      email: 'carol@pulse.app',
      username: 'carol',
      displayName: 'Carol Diaz',
      passwordHash: pass,
      notificationPrefs: { create: {} },
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: 'dave@pulse.app' },
    update: {},
    create: {
      email: 'dave@pulse.app',
      username: 'dave',
      displayName: 'Dave Okonjo',
      passwordHash: pass,
      notificationPrefs: { create: {} },
    },
  });

  for (const u of [alice, bob, carol, dave]) {
    const hasSaved = await prisma.chat.findFirst({
      where: { type: ChatType.SAVED, members: { some: { userId: u.id, leftAt: null } } },
    });
    if (!hasSaved) {
      await prisma.chat.create({
        data: {
          type: ChatType.SAVED,
          title: 'Saved',
          createdById: u.id,
          members: { create: { userId: u.id, role: MemberRole.OWNER } },
        },
      });
    }
  }

  let dm = await prisma.chat.findFirst({
    where: {
      type: ChatType.DIRECT,
      AND: [
        { members: { some: { userId: alice.id, leftAt: null } } },
        { members: { some: { userId: bob.id, leftAt: null } } },
      ],
    },
  });
  if (!dm) {
    dm = await prisma.chat.create({
      data: {
        type: ChatType.DIRECT,
        createdById: alice.id,
        members: {
          create: [
            { userId: alice.id, role: MemberRole.MEMBER },
            { userId: bob.id, role: MemberRole.MEMBER },
          ],
        },
      },
    });
  }

  const group = await prisma.chat.upsert({
    where: { id: 'seed-group-pulse-labs' },
    update: {},
    create: {
      id: 'seed-group-pulse-labs',
      type: ChatType.GROUP,
      title: 'Pulse Labs',
      createdById: carol.id,
      groupMeta: { create: { description: 'Internal product squad' } },
      members: {
        create: [
          { userId: alice.id, role: MemberRole.ADMIN },
          { userId: bob.id, role: MemberRole.MEMBER },
          { userId: carol.id, role: MemberRole.OWNER },
          { userId: dave.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  const channel = await prisma.chat.upsert({
    where: { id: 'seed-channel-updates' },
    update: {},
    create: {
      id: 'seed-channel-updates',
      type: ChatType.CHANNEL,
      title: 'Pulse Updates',
      isPrivate: false,
      createdById: alice.id,
      channelMeta: {
        create: { description: 'Release notes and announcements', handle: 'updates' },
      },
      members: {
        create: [
          { userId: alice.id, role: MemberRole.OWNER },
          { userId: bob.id, role: MemberRole.SUBSCRIBER },
          { userId: carol.id, role: MemberRole.SUBSCRIBER },
          { userId: dave.id, role: MemberRole.SUBSCRIBER },
        ],
      },
    },
  });

  const count = await prisma.message.count({ where: { chatId: dm.id } });
  if (count === 0) {
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
    const msgs = [
      { senderId: alice.id, text: 'Hey Bob — quick question about the API limits.', at: daysAgo(3) },
      { senderId: bob.id, text: 'Sure, shoot. We can raise soft caps for premium tenants.', at: daysAgo(3) },
      { senderId: alice.id, text: 'Perfect. I will sync with finance tomorrow.', at: daysAgo(2) },
      { senderId: bob.id, text: 'Sounds good. I pushed a draft to the shared doc.', at: daysAgo(2) },
      { senderId: alice.id, text: 'Noticed — the latency charts look clean.', at: daysAgo(1) },
      { senderId: bob.id, text: 'Redis pub/sub swap helped a lot.', at: daysAgo(1) },
    ];
    for (const m of msgs) {
      await prisma.message.create({
        data: {
          chatId: dm.id,
          senderId: m.senderId,
          type: MessageType.TEXT,
          text: m.text,
          createdAt: m.at,
        },
      });
    }
    await prisma.message.create({
      data: {
        chatId: dm.id,
        senderId: alice.id,
        type: MessageType.TEXT,
        text: 'Latest: voice notes now show a simple waveform placeholder in the UI.',
      },
    });
  }

  const gCount = await prisma.message.count({ where: { chatId: group.id } });
  if (gCount < 3) {
    const sys = await prisma.message.findFirst({
      where: { chatId: group.id, type: MessageType.SYSTEM },
    });
    if (!sys) {
      await prisma.message.create({
        data: {
          chatId: group.id,
          type: MessageType.SYSTEM,
          text: 'Group "Pulse Labs" was created',
        },
      });
    }
    await prisma.message.create({
      data: {
        chatId: group.id,
        senderId: carol.id,
        type: MessageType.TEXT,
        text: 'Welcome everyone — weekly sync notes will live here.',
      },
    });
    await prisma.message.create({
      data: {
        chatId: group.id,
        senderId: alice.id,
        type: MessageType.TEXT,
        text: 'Dropped the Figma link in the resources channel.',
      },
    });
    const m2 = await prisma.message.create({
      data: {
        chatId: group.id,
        senderId: dave.id,
        type: MessageType.TEXT,
        text: 'Nice. I will review accessibility contrast tonight.',
      },
    });
    await prisma.messageReaction.create({
      data: { messageId: m2.id, userId: carol.id, emoji: '✅' },
    });
  }

  const cCount = await prisma.message.count({ where: { chatId: channel.id } });
  if (cCount < 2) {
    await prisma.message.create({
      data: {
        chatId: channel.id,
        type: MessageType.SYSTEM,
        text: 'Channel "Pulse Updates" is live',
      },
    });
    await prisma.message.create({
      data: {
        chatId: channel.id,
        senderId: alice.id,
        type: MessageType.TEXT,
        text: 'Pulse 0.9: faster inbox sync, calmer dark palette, and read receipts polish.',
      },
    });
  }

  await prisma.pinnedChat.upsert({
    where: { userId_chatId: { userId: alice.id, chatId: dm.id } },
    create: { userId: alice.id, chatId: dm.id },
    update: {},
  });

  await prisma.archivedChat.upsert({
    where: { userId_chatId: { userId: bob.id, chatId: channel.id } },
    create: { userId: bob.id, chatId: channel.id },
    update: {},
  });

  await prisma.readState.upsert({
    where: { chatId_userId: { chatId: dm.id, userId: alice.id } },
    create: { chatId: dm.id, userId: alice.id },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete. Demo login: alice@pulse.app / password123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
