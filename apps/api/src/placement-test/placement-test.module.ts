import { Module } from '@nestjs/common';
import { PlacementTestController } from './placement-test.controller';

@Module({
  controllers: [PlacementTestController],
})
export class PlacementTestModule {}
