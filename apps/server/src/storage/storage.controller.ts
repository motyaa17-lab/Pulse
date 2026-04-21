import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { StorageService } from './storage.service';

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get('usage')
  usage(@CurrentUser() user: JwtUser) {
    return this.storage.usage(user.sub);
  }

  @Post('clear')
  clear(@CurrentUser() user: JwtUser) {
    return this.storage.clearOrphanUploads(user.sub);
  }
}
