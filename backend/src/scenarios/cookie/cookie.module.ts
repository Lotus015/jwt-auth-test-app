import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { CookieController } from './cookie.controller';

@Module({
  imports: [
    JwtModule.forRoot({
      accessToken: {
        storage: 'cookie',
        cookieOptions: {
          cookieName: 'access_token',
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60 * 1000, // 15 minutes
        },
        keyOptions: {
          algorithm: 'HS256',
          secret: 'cookie-scenario-secret-key-for-testing',
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'HS256',
          secret: 'cookie-scenario-refresh-secret-key',
        },
        cookieOptions: {
          cookieName: 'cookie_refresh_token',
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        signOptions: {
          expiresIn: '7d',
        },
      },
    }),
  ],
  controllers: [CookieController],
})
export class CookieModule {}
