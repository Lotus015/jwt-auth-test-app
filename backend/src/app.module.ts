import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';
import { HeaderModule } from './scenarios/header/header.module';
import { CookieModule } from './scenarios/cookie/cookie.module';
import { RsaModule } from './scenarios/rsa/rsa.module';
import { AlgorithmsModule } from './scenarios/algorithms/algorithms.module';
import { ErrorsModule } from './scenarios/errors/errors.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [AuthModule, ProtectedModule, HeaderModule, CookieModule, RsaModule, AlgorithmsModule, ErrorsModule, UtilModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
