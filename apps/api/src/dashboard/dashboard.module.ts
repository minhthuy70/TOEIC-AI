import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, ScheduleController],
  providers: [DashboardService, ScheduleService],
})
export class DashboardModule {}
