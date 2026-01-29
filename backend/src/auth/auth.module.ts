import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.forRoot({
      accessToken: {
        storage: 'header',
        headerOptions: {
          headerName: 'authorization',
          prefix: 'Bearer',
        },
        keyOptions: {
          algorithm: 'HS256',
          secret: 'your-super-secret-key-for-testing-purposes-only',
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'HS256',
          secret: 'your-refresh-token-secret-key-for-testing-purposes-only',
        },
        cookieOptions: {
          cookieName: 'refresh_token',
          httpOnly: true,
          secure: false, // Set to true in production with HTTPS
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
        signOptions: {
          expiresIn: '7d',
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
