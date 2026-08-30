import { Module } from "@nestjs/common";

import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PointsModule } from "../points/points.module";
import { LevelsModule } from "../levels/levels.module";

@Module({
  imports: [PrismaModule, PointsModule, LevelsModule],
  controllers: [
    PracticeController,
  ],

  providers: [
    PracticeService,
  ],
})
export class PracticeModule {}