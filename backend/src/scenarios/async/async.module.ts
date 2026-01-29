import { Module } from '@nestjs/common';
import { AsyncController } from './async.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AsyncController],
})
export class AsyncModule {}
