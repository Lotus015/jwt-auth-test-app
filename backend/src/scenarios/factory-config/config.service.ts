import { Injectable } from '@nestjs/common';

/**
 * Simulates a ConfigService that provides environment configuration.
 * In a real NestJS app, you'd use @nestjs/config ConfigService.
 */
@Injectable()
export class ConfigService {
  private readonly config: Record<string, string> = {
    JWT_ACCESS_SECRET: 'factory-config-access-secret-key-minimum-32-chars',
    JWT_REFRESH_SECRET: 'factory-config-refresh-secret-key-minimum-32-chars',
    JWT_ACCESS_EXPIRES_IN: '20m',
    JWT_REFRESH_EXPIRES_IN: '14d',
    JWT_ALGORITHM: 'HS256',
  };

  get(key: string): string {
    return this.config[key] || '';
  }

  async getAsync(key: string): Promise<string> {
    // Simulate async config retrieval (e.g., from Vault or external service)
    await new Promise((resolve) => setTimeout(resolve, 5));
    return this.config[key] || '';
  }
}
