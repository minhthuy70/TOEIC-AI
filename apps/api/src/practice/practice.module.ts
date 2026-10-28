import { Module } from "@nestjs/common";

import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PointsModule } from "../points/points.module";
import { LevelsModule } from "../levels/levels.module";
import { ErrorTrackingModule } from "../error-tracking/error-tracking.module";

@Module({
  imports: [PrismaModule, PointsModule, LevelsModule, ErrorTrackingModule],
  controllers: [
    PracticeController,
  ],
  providers: [
    PracticeService,
  ],
  exports: [PracticeService],
})
export class PracticeModule {}
