import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsModule } from '../reports/reports.module';
import { AdminService } from './admin.service';

@Module({
  imports: [ReportsModule],
  controllers: [AdminController],
  providers: [RolesGuard, AdminService],
})
export class AdminModule {}
