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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAsyncService, TokenService } from '@block32/jwt-auth';
import { AuthService, UserPayload } from '../../auth/auth.service';

interface LoginDto {
  username: string;
  password: string;
}

interface SignPayloadDto {
  payload: Record<string, unknown>;
}

interface VerifyTokenDto {
  token: string;
}

@Controller('async')
export class AsyncController {
  constructor(
    private readonly jwtAsyncService: JwtAsyncService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Async login - uses JwtAsyncService to sign tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; message: string }> {
    const user = this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.authService.createPayload(user);

    // Sign access token asynchronously
    const accessToken = await this.jwtAsyncService.signAccessAsync(payload);

    // Sign refresh token asynchronously and set in cookie
    const refreshToken = await this.jwtAsyncService.signRefreshAsync(payload);
    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return {
      accessToken,
      message: 'Logged in using async JWT service',
    };
  }

  /**
   * Async token refresh - uses JwtAsyncService for verification and signing
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

      // Verify refresh token asynchronously
      const payload =
        await this.jwtAsyncService.verifyRefreshAsync<UserPayload>(
          refreshToken,
        );

      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };

      // Sign new tokens asynchronously
      const accessToken =
        await this.jwtAsyncService.signAccessAsync(newPayload);
      const newRefreshToken =
        await this.jwtAsyncService.signRefreshAsync(newPayload);
      this.tokenService.setRefreshTokenToStorage(res, newRefreshToken);

      return {
        accessToken,
        message: 'Token refreshed using async JWT service',
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Async get current user - uses JwtAsyncService for verification
   */
  @Get('me')
  async me(
    @Req() req: Request,
  ): Promise<{ user: ReturnType<AuthService['getUserFromPayload']>; message: string }> {
    try {
      const accessToken = this.tokenService.getAccessTokenFromStorage(req);

      if (!accessToken) {
        throw new UnauthorizedException('Access token not found');
      }

      // Verify access token asynchronously
      const payload =
        await this.jwtAsyncService.verifyAccessAsync<UserPayload>(accessToken);

      const user = this.authService.getUserFromPayload(payload);

      return {
        user,
        message: 'User retrieved using async JWT service',
      };
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Sign a custom payload asynchronously
   */
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  async signPayload(
    @Body() signDto: SignPayloadDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtAsyncService.signAccessAsync(
      signDto.payload,
    );
    const refreshToken = await this.jwtAsyncService.signRefreshAsync(
      signDto.payload,
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify a token asynchronously
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(
    @Body() verifyDto: VerifyTokenDto,
  ): Promise<{ valid: boolean; payload?: Record<string, unknown>; error?: string }> {
    try {
      const payload = await this.jwtAsyncService.verifyAccessAsync<Record<string, unknown>>(
        verifyDto.token,
      );
      return { valid: true, payload };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Decode a token (sync operation - no verification)
   */
  @Post('decode')
  @HttpCode(HttpStatus.OK)
  decodeToken(
    @Body() verifyDto: VerifyTokenDto,
  ): { header: unknown; payload: unknown; signature: string } | { error: string } {
    const decoded = this.jwtAsyncService.decode(verifyDto.token, {
      complete: true,
    });

    if (!decoded || typeof decoded === 'string') {
      return { error: 'Invalid token format' };
    }

    return {
      header: decoded.header,
      payload: decoded.payload,
      signature: (decoded as { signature: string }).signature,
    };
  }
}
