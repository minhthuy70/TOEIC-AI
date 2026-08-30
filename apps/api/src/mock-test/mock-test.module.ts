import { Module } from '@nestjs/common';
import { MockTestController } from './mock-test.controller';
import { MockTestService } from './mock-test.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [PrismaModule, PointsModule],
  controllers: [MockTestController],
  providers: [MockTestService],
  exports: [MockTestService],
})
export class MockTestModule {}