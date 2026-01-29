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

// Simple user validation for testing
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com', role: 'user' },
];

/**
 * Controller that uses JWT services configured via forRootAsync.
 * Tests both async and sync services with async configuration.
 */
@Controller('async-config')
export class AsyncConfigController {
  constructor(
    private readonly jwtAsyncService: JwtAsyncService,
    private readonly jwtSyncService: JwtSyncService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Login using async JWT service (forRootAsync configured)
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

    // Sign tokens using async service (configured via forRootAsync)
    const accessToken = await this.jwtAsyncService.signAccessAsync(payload);
    const refreshToken = await this.jwtAsyncService.signRefreshAsync(payload);

    // Set refresh token in cookie
    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return {
      accessToken,
      refreshToken,
      configType: 'forRootAsync with useClass',
    };
  }

  /**
   * Login using sync JWT service (forRootAsync configured)
   */
  @Post('login-sync')
  @HttpCode(HttpStatus.OK)
  loginSync(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string; refreshToken: string; configType: string } {
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

    // Sign tokens using sync service (also configured via forRootAsync)
    const accessToken = this.jwtSyncService.signAccessSync(payload);
    const refreshToken = this.jwtSyncService.signRefreshSync(payload);

    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return {
      accessToken,
      refreshToken,
      configType: 'forRootAsync with useClass (sync service)',
    };
  }

  /**
   * Verify token using async service
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
   * Verify token using sync service
   */
  @Post('verify-sync')
  @HttpCode(HttpStatus.OK)
  verifySync(
    @Body() body: { token: string },
  ): { valid: boolean; payload?: UserPayload; error?: string } {
    try {
      const payload = this.jwtSyncService.verifyAccessSync<UserPayload>(body.token);
      return { valid: true, payload };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      };
    }
  }

  /**
   * Protected endpoint using JwtAsyncGuard (forRootAsync configured)
   */
  @Get('protected')
  @UseGuards(JwtAsyncGuard)
  async getProtected(
    @Req() req: Request,
  ): Promise<{ message: string; user: UserPayload; configType: string }> {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload = await this.jwtAsyncService.verifyAccessAsync<UserPayload>(token!);

    return {
      message: 'Access granted via forRootAsync configured guard',
      user: payload,
      configType: 'forRootAsync with useClass',
    };
  }

  /**
   * Protected endpoint using JwtSyncGuard (forRootAsync configured)
   */
  @Get('protected-sync')
  @UseGuards(JwtSyncGuard)
  getProtectedSync(
    @Req() req: Request,
  ): { message: string; user: UserPayload; configType: string } {
    const token = this.tokenService.getAccessTokenFromStorage(req);
    const payload = this.jwtSyncService.verifyAccessSync<UserPayload>(token!);

    return {
      message: 'Access granted via forRootAsync configured guard (sync)',
      user: payload,
      configType: 'forRootAsync with useClass (sync)',
    };
  }

  /**
   * Refresh token using async service
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; message: string }> {
    try {
      const refreshToken = this.tokenService.getRefreshTokenFromStorage(req);

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const payload = await this.jwtAsyncService.verifyRefreshAsync<UserPayload>(refreshToken);

      const newPayload: UserPayload = {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };

      const accessToken = await this.jwtAsyncService.signAccessAsync(newPayload);
      const newRefreshToken = await this.jwtAsyncService.signRefreshAsync(newPayload);
      this.tokenService.setRefreshTokenToStorage(res, newRefreshToken);

      return {
        accessToken,
        message: 'Token refreshed via forRootAsync configured service',
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get config info (for debugging/testing)
   */
  @Get('info')
  @HttpCode(HttpStatus.OK)
  getInfo(): { configMethod: string; description: string } {
    return {
      configMethod: 'JwtModule.forRootAsync({ useClass: JwtConfigService })',
      description: 'This module is configured using forRootAsync with a class-based factory that implements JwtModuleFactoryOptions',
    };
  }
}
