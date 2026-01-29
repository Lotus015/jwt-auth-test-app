import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { ErrorsController } from './errors.controller';

@Module({
  imports: [
    JwtModule.forRoot({
      accessToken: {
        storage: 'header',
        headerOptions: {
          headerName: 'Authorization',
          prefix: 'Bearer',
        },
        keyOptions: {
          algorithm: 'HS256',
          secret: 'errors-scenario-secret-key-for-testing',
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'HS256',
          secret: 'errors-scenario-refresh-secret-key',
        },
        cookieOptions: {
          cookieName: 'errors_refresh_token',
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
  controllers: [ErrorsController],
})
export class ErrorsModule {}
