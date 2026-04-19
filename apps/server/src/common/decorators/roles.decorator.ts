import { SetMetadata } from '@nestjs/common';
import { UserAppRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Require one of these app roles (checked against DB in RolesGuard). */
export const Roles = (...roles: UserAppRole[]) => SetMetadata(ROLES_KEY, roles);
