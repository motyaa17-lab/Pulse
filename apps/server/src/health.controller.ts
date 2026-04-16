import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('/')
  root() {
    return { ok: true, service: 'pulse-api' };
  }

  @Get('/health')
  health() {
    return { ok: true };
  }
}
