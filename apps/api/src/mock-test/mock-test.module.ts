import { Module } from '@nestjs/common';
import { MockTestController } from './mock-test.controller';
import { MockTestService } from './mock-test.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { LevelsModule } from '../levels/levels.module';
import { ErrorTrackingModule } from '../error-tracking/error-tracking.module';

@Module({
  imports: [PrismaModule, PointsModule, LevelsModule, ErrorTrackingModule],
  controllers: [MockTestController],
  providers: [MockTestService],
  exports: [MockTestService],
})
export class MockTestModule {}
