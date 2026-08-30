import { Module } from "@nestjs/common";

import { VocabularyController } from "./vocabulary.controller";
import { VocabularyService } from "./vocabulary.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PointsModule } from "../points/points.module";
import { LevelsModule } from "../levels/levels.module";

@Module({
  imports: [PrismaModule, PointsModule, LevelsModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
})
export class VocabularyModule {}