import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    chat: { findFirst: jest.fn(), create: jest.fn() },
    session: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('access.jwt') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              ({
                JWT_ACCESS_SECRET: 'test_access',
                JWT_ACCESS_EXPIRES: '15m',
              })[k],
          },
        },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('rejects duplicate email on register', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register(
        {
          email: 'a@b.com',
          password: 'password123',
          username: 'newuser',
        },
        {},
      ),
    ).rejects.toThrow();
  });

  it('creates user and session on register', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      username: 'newuser',
    });
    prisma.chat.findFirst.mockResolvedValue(null);
    prisma.chat.create.mockResolvedValue({ id: 'c1' });
    prisma.session.create.mockResolvedValue({ id: 's1' });

    const out = await service.register(
      {
        email: 'a@b.com',
        password: 'password123',
        username: 'newuser',
      },
      {},
    );

    expect(out.accessToken).toBe('access.jwt');
    expect(out.refreshToken).toBeDefined();
    expect(out.sessionId).toBe('s1');
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
