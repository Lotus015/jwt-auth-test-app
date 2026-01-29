import { Module } from '@nestjs/common';
import { JwtModule } from '@block32/jwt-auth';
import { AsyncConfigController } from './async-config.controller';
import { JwtConfigService } from './jwt-config.service';

/**
 * Module demonstrating JwtModule.forRootAsync() with useClass pattern.
 *
 * This is the recommended approach when:
 * - Configuration needs to be loaded asynchronously
 * - Configuration comes from external services (ConfigService, database, etc.)
 * - You want to encapsulate configuration logic in a dedicated service
 *
 * The JwtConfigService implements JwtModuleFactoryOptions interface,
 * which requires a createJwtModuleOptions() method that returns JwtBlock32Options.
 */
@Module({
  imports: [
    JwtModule.forRootAsync({
      useClass: JwtConfigService,
    }),
  ],
  controllers: [AsyncConfigController],
  providers: [JwtConfigService],
  exports: [JwtConfigService],
})
export class AsyncConfigModule {}
