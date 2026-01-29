import { Module } from '@nestjs/common';
import { JwtModule, JwtBlock32Options } from '@block32/jwt-auth';
import { FactoryConfigController } from './factory-config.controller';
import { ConfigService } from './config.service';
import { StringValue } from 'ms';

/**
 * Module demonstrating JwtModule.forRootAsync() with useFactory pattern.
 *
 * This is the recommended approach when:
 * - You need to inject dependencies (like ConfigService) into configuration
 * - Configuration logic is simple and doesn't warrant a separate class
 * - You want inline async configuration with full type safety
 *
 * The useFactory function receives injected dependencies and returns JwtBlock32Options.
 */
@Module({
  imports: [
    JwtModule.forRootAsync({
      imports: [], // Can import other modules if needed
      inject: [ConfigService], // Dependencies to inject into useFactory
      additionalProviders: [ConfigService], // Provide ConfigService to the JwtModule context
      useFactory: async (configService: ConfigService): Promise<JwtBlock32Options> => {
        // Async config retrieval from ConfigService
        const accessSecret = await configService.getAsync('JWT_ACCESS_SECRET');
        const refreshSecret = await configService.getAsync('JWT_REFRESH_SECRET');
        const accessExpiresIn = configService.get('JWT_ACCESS_EXPIRES_IN');
        const refreshExpiresIn = configService.get('JWT_REFRESH_EXPIRES_IN');

        return {
          accessToken: {
            storage: 'header',
            headerOptions: {
              headerName: 'authorization',
              prefix: 'Bearer',
            },
            keyOptions: {
              algorithm: 'HS256',
              secret: accessSecret,
            },
            signOptions: {
              expiresIn: (accessExpiresIn || '15m') as StringValue,
            },
          },
          refreshToken: {
            keyOptions: {
              algorithm: 'HS256',
              secret: refreshSecret,
            },
            cookieOptions: {
              cookieName: 'factory_refresh_token',
              httpOnly: true,
              secure: false,
              sameSite: 'strict',
              path: '/',
              maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            },
            signOptions: {
              expiresIn: (refreshExpiresIn || '7d') as StringValue,
            },
          },
        };
      },
    }),
  ],
  controllers: [FactoryConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class FactoryConfigModule {}
