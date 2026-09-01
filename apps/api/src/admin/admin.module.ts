import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminVocabularyController } from "./admin-vocabulary.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, AdminVocabularyController],
})
export class AdminModule {}