import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtSyncService, TokenService } from '@block32/jwt-auth';

interface LoginDto {
  username: string;
  password: string;
}

interface UserPayload {
  sub: number;
  username: string;
  email: string;
  role: string;
}

// Mock users for this scenario
const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com', role: 'user' },
];

@Controller('header')
export class HeaderController {
  constructor(
    private readonly jwtSyncService: JwtSyncService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string; headerName: string; prefix: string } {
    const user = MOCK_USERS.find(
      (u) => u.username === loginDto.username && u.password === loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: UserPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtSyncService.signAccessSync(payload);

    // Also set refresh token for completeness
    const refreshToken = this.jwtSyncService.signRefreshSync(payload);
    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return {
      accessToken,
      headerName: 'X-Auth-Token',
      prefix: 'Token',
    };
  }

  @Get('protected')
  protected(@Req() req: Request): { message: string; user: UserPayload } {
    try {
      const accessToken = this.tokenService.getAccessTokenFromStorage(req);

      if (!accessToken) {
        throw new UnauthorizedException('Access token not found');
      }

      const payload = this.jwtSyncService.verifyAccessSync<UserPayload>(accessToken);

      return {
        message: 'Protected data from header scenario',
        user: payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
