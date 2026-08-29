import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { PlannerController } from "./planner.controller";
import { PlannerService } from "./planner.service";
import { ReminderController } from "./reminder.controller";
import { ReminderService } from "./reminder.service";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [
    DashboardController,
    ScheduleController,
    PlannerController,
    ReminderController,
    RecommendationController,
  ],
  providers: [
    DashboardService,
    ScheduleService,
    PlannerService,
    ReminderService,
    RecommendationService,
  ],
})
export class DashboardModule {}
