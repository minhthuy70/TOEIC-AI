import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminVocabularyController } from "./admin-vocabulary.controller";
import { AdminQuestionsController } from "./admin-questions.controller";
import { AdminTestsController } from "./admin-tests.controller";
import { AdminContentAnalyticsController } from "./admin-content-analytics.controller";
import { AdminUsersManageController } from "./admin-users-manage.controller";
import { AdminSystemAnalyticsController } from "./admin-system-analytics.controller";
import { AdminSystemSettingsController } from "./admin-system-settings.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController,
    AdminVocabularyController,
    AdminQuestionsController,
    AdminTestsController,
    AdminContentAnalyticsController,
    AdminUsersManageController,
    AdminSystemAnalyticsController,
    AdminSystemSettingsController,
  ],
})
export class AdminModule {}