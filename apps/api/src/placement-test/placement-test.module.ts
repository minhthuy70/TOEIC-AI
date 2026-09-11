import { Module } from '@nestjs/common';
import { PlacementTestController } from './placement-test.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlacementTestController],
})
export class PlacementTestModule {}

