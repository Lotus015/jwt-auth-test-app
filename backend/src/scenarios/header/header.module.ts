import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { HeaderController } from './header.controller';

@Module({
  imports: [
    JwtModule.forRoot({
      accessToken: {
        storage: 'header',
        headerOptions: {
          headerName: 'X-Auth-Token',
          prefix: 'Token',
        },
        keyOptions: {
          algorithm: 'HS256',
          secret: 'header-scenario-secret-key-for-testing',
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'HS256',
          secret: 'header-scenario-refresh-secret-key',
        },
        cookieOptions: {
          cookieName: 'header_refresh_token',
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
  controllers: [HeaderController],
})
export class HeaderModule {}
