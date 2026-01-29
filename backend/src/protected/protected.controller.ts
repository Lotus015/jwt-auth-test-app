import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  JwtSyncGuard,
  JwtAsyncGuard,
  JwtSyncService,
  JwtAsyncService,
  TokenService,
} from '@block32/jwt-auth';
import { UserPayload } from '../auth/auth.service';

@Controller('protected')
export class ProtectedController {
  constructor(
    private readonly jwtSyncService: JwtSyncService,
    private readonly jwtAsyncService: JwtAsyncService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('sync')
  @UseGuards(JwtSyncGuard)
  getProtectedSync(@Req() req: Request): { message: string; user: UserPayload } {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload = this.jwtSyncService.verifyAccessSync<UserPayload>(token!);

    return {
      message: 'Protected data',
      user: payload,
    };
  }

  @Get('async')
  @UseGuards(JwtAsyncGuard)
  async getProtectedAsync(
    @Req() req: Request,
  ): Promise<{ message: string; user: UserPayload }> {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload =
      await this.jwtAsyncService.verifyAccessAsync<UserPayload>(token!);

    return {
      message: 'Protected data',
      user: payload,
    };
  }
}
