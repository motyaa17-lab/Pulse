import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAppRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from '../reports/reports.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserAppRole.ADMIN)
export class AdminController {
  constructor(private readonly reportsService: ReportsService) {}

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

  @Get('reports')
  listReports(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 100;
    return this.reportsService.listForAdmin(Number.isFinite(n) ? n : 100);
  }
}
