import { Module } from "@nestjs/common";

import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PointsModule } from "../points/points.module";

@Module({
  imports: [PrismaModule, PointsModule],
  controllers: [
    PracticeController,
  ],

  providers: [
    PracticeService,
  ],
})
export class PracticeModule {}