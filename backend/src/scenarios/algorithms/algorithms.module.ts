import { Module } from '@nestjs/common';
import { AlgorithmsController } from './algorithms.controller';

@Module({
  controllers: [AlgorithmsController],
})
export class AlgorithmsModule {}
