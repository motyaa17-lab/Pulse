import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserAppRole } from '@prisma/client';
import { JwtUser } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<UserAppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const jwtUser = req.user;
    if (!jwtUser?.sub) throw new ForbiddenException();

    const row = await this.prisma.user.findUnique({
      where: { id: jwtUser.sub },
      select: { role: true },
    });
    if (!row || !required.includes(row.role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
