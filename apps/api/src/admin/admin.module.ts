import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminVocabularyController } from "./admin-vocabulary.controller";
import { AdminQuestionsController } from "./admin-questions.controller";
import { AdminTestsController } from "./admin-tests.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController,
    AdminVocabularyController,
    AdminQuestionsController,
    AdminTestsController,
  ],
})
export class AdminModule {}