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
import { AuthService, UserPayload } from './auth.service';

interface LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtSyncService: JwtSyncService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string } {
    const user = this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.authService.createPayload(user);

    // Sign access token
    const accessToken = this.jwtSyncService.signAccessSync(payload);

    // Sign refresh token and set in cookie
    const refreshToken = this.jwtSyncService.signRefreshSync(payload);
    this.tokenService.setRefreshTokenToStorage(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    // Clear refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string } {
    try {
      // Get refresh token from cookie
      const refreshToken = this.tokenService.getRefreshTokenFromStorage(req);

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Verify refresh token
      const payload =
        this.jwtSyncService.verifyRefreshSync<UserPayload>(refreshToken);

      // Create new access token
      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };

      const accessToken = this.jwtSyncService.signAccessSync(newPayload);

      // Optionally rotate refresh token
      const newRefreshToken = this.jwtSyncService.signRefreshSync(newPayload);
      this.tokenService.setRefreshTokenToStorage(res, newRefreshToken);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('me')
  me(@Req() req: Request): { user: ReturnType<AuthService['getUserFromPayload']> } {
    try {
      // Get access token from header
      const accessToken = this.tokenService.getAccessTokenFromStorage(req);

      if (!accessToken) {
        throw new UnauthorizedException('Access token not found');
      }

      // Verify access token
      const payload =
        this.jwtSyncService.verifyAccessSync<UserPayload>(accessToken);

      // Get user from payload
      const user = this.authService.getUserFromPayload(payload);

      return { user };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
