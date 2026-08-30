import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { GrammarController } from "./grammar.controller";
import { GrammarService } from "./grammar.service";
import { PointsModule } from "../points/points.module";
import { LevelsModule } from "../levels/levels.module";

@Module({
  imports: [PrismaModule, PointsModule, LevelsModule],
  controllers: [GrammarController],
  providers: [GrammarService],
})
export class GrammarModule {}