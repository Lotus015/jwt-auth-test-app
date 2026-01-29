import { Injectable } from '@nestjs/common';
import {
  JwtModuleFactoryOptions,
  JwtBlock32Options,
} from '@block32/jwt-auth';

/**
 * Service that provides JWT configuration asynchronously.
 * In real-world scenarios, this could load config from:
 * - Environment variables via ConfigService
 * - Database
 * - External configuration server
 * - Vault/secrets manager
 */
@Injectable()
export class JwtConfigService implements JwtModuleFactoryOptions {
  // Simulated async config loading (e.g., from database or external service)
  async createJwtModuleOptions(): Promise<JwtBlock32Options> {
    // Simulate async operation (e.g., fetching from config server)
    await this.simulateAsyncConfigLoad();

    return {
      accessToken: {
        storage: 'header',
        headerOptions: {
          headerName: 'authorization',
          prefix: 'Bearer',
        },
        keyOptions: {
          algorithm: 'HS256',
          secret: this.getAccessTokenSecret(),
        },
        signOptions: {
          expiresIn: '15m',
        },
      },
      refreshToken: {
        keyOptions: {
          algorithm: 'HS256',
          secret: this.getRefreshTokenSecret(),
        },
        cookieOptions: {
          cookieName: 'async_refresh_token',
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
    };
  }

  private async simulateAsyncConfigLoad(): Promise<void> {
    // Simulate network delay for loading config
    return new Promise((resolve) => setTimeout(resolve, 10));
  }

  private getAccessTokenSecret(): string {
    // In production, this would come from env vars or secrets manager
    return 'async-config-access-secret-key-for-testing';
  }

  private getRefreshTokenSecret(): string {
    return 'async-config-refresh-secret-key-for-testing';
  }
}
