import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportStatus, UserAppRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from '../reports/reports.service';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { SetReportStatusDto } from './dto/set-report-status.dto';
import { SetReportNoteDto } from './dto/set-report-note.dto';
import { SetUserRestrictionDto } from './dto/set-user-restriction.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserAppRole.ADMIN, UserAppRole.MODERATOR)
export class AdminController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly admin: AdminService,
  ) {}

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

  @Get('reports/:id')
  reportDetail(@Param('id') id: string) {
    return this.admin.getReportDetail(id);
  }

  @Post('reports/:id/status')
  setReportStatus(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetReportStatusDto,
  ) {
    return this.admin.setReportStatus(user.sub, id, dto.status as ReportStatus);
  }

  @Post('reports/:id/note')
  setReportNote(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetReportNoteDto,
  ) {
    const note = dto.note?.trim() ? dto.note.trim() : null;
    return this.admin.setReportNote(user.sub, id, note);
  }

  @Post('messages/:id/delete')
  deleteMessage(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetReportNoteDto,
  ) {
    return this.admin.deleteMessage(user.sub, id, dto.note?.trim());
  }

  @Post('users/:id/ban')
  setBan(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetUserRestrictionDto,
  ) {
    return this.admin.setUserBan(user.sub, id, dto.untilMinutes, dto.reason);
  }

  @Post('users/:id/mute')
  setMute(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetUserRestrictionDto,
  ) {
    return this.admin.setUserMute(user.sub, id, dto.untilMinutes, dto.reason);
  }

  @Get('audit')
  audit(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 100;
    return this.admin.listAudit(Number.isFinite(n) ? n : 100);
  }
}
