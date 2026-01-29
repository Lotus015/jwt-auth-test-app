import { Module } from '@nestjs/common';
import { EdgeCasesController } from './edge-cases.controller';

@Module({
  controllers: [EdgeCasesController],
})
export class EdgeCasesModule {}
