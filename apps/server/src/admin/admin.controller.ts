import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAppRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserAppRole.ADMIN)
export class AdminController {
  /** Lightweight probe for admin clients; role is re-checked in DB by RolesGuard. */
  @Get('overview')
  overview() {
    return {
      ok: true,
      dashboard: {
        note: 'Extend with metrics, queues, and moderation tools.',
      },
    };
  }
}
