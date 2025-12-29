import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@pmp-back/database';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true as unknown as false, // workaround type error
    } as any); // workaround type error
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken;
    
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Vérifier que le refresh token correspond
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}