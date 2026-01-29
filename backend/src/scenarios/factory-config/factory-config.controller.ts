import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  JwtAsyncService,
  JwtSyncService,
  TokenService,
  JwtAsyncGuard,
  JwtSyncGuard,
} from '@block32/jwt-auth';

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

const USERS = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com', role: 'user' },
];

/**
 * Controller that uses JWT services configured via forRootAsync with useFactory.
 * Demonstrates dependency injection into the factory function.
 */
@Controller('factory-config')
export class FactoryConfigController {
  constructor(
    private readonly jwtAsyncService: JwtAsyncService,
    private readonly jwtSyncService: JwtSyncService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Login using async JWT service (useFactory configured)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string; configType: string }> {
    const user = USERS.find(
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

    const accessToken = await this.jwtAsyncService.signAccessAsync(payload);
    const refreshToken = await this.jwtAsyncService.signRefreshAsync(payload);

    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return {
      accessToken,
      refreshToken,
      configType: 'forRootAsync with useFactory + ConfigService injection',
    };
  }

  /**
   * Verify token
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body() body: { token: string },
  ): Promise<{ valid: boolean; payload?: UserPayload; error?: string }> {
    try {
      const payload = await this.jwtAsyncService.verifyAccessAsync<UserPayload>(body.token);
      return { valid: true, payload };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      };
    }
  }

  /**
   * Protected endpoint using JwtAsyncGuard (useFactory configured)
   */
  @Get('protected')
  @UseGuards(JwtAsyncGuard)
  async getProtected(
    @Req() req: Request,
  ): Promise<{ message: string; user: UserPayload; configType: string }> {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload = await this.jwtAsyncService.verifyAccessAsync<UserPayload>(token!);

    return {
      message: 'Access granted via useFactory configured guard',
      user: payload,
      configType: 'forRootAsync with useFactory',
    };
  }

  /**
   * Protected endpoint using JwtSyncGuard (useFactory configured)
   */
  @Get('protected-sync')
  @UseGuards(JwtSyncGuard)
  getProtectedSync(
    @Req() req: Request,
  ): { message: string; user: UserPayload; configType: string } {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload = this.jwtSyncService.verifyAccessSync<UserPayload>(token!);

    return {
      message: 'Access granted via useFactory configured guard (sync)',
      user: payload,
      configType: 'forRootAsync with useFactory (sync)',
    };
  }

  /**
   * Get config info
   */
  @Get('info')
  @HttpCode(HttpStatus.OK)
  getInfo(): { configMethod: string; description: string } {
    return {
      configMethod: 'JwtModule.forRootAsync({ useFactory: async (configService) => {...}, inject: [ConfigService] })',
      description: 'This module is configured using forRootAsync with a factory function that injects ConfigService for async config retrieval',
    };
  }
}
