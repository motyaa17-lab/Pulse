import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserAppRole } from '@prisma/client';

export type JwtUser = {
  sub: string;
  email: string;
  username: string;
  /** From access JWT; moderation APIs re-check role in the database. */
  role?: UserAppRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtUser;
  },
);
