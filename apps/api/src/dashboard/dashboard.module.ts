import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { PlannerController } from "./planner.controller";
import { PlannerService } from "./planner.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, ScheduleController, PlannerController],
  providers: [DashboardService, ScheduleService, PlannerService],
})
export class DashboardModule {}
