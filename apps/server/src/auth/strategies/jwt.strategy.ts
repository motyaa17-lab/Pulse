import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtUser } from '../../common/decorators/current-user.decorator';

type JwtPayload = { sub: string; email: string; username: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret_change_me',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    if (!payload?.sub) throw new UnauthorizedException();
    return { sub: payload.sub, email: payload.email, username: payload.username };
  }
}
