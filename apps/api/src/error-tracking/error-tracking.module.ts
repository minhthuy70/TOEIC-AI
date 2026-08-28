import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ErrorTrackingController } from "./error-tracking.controller";
import { ErrorTrackingService } from "./error-tracking.service";

@Module({
  imports: [PrismaModule],
  controllers: [ErrorTrackingController],
  providers: [ErrorTrackingService],
  exports: [ErrorTrackingService],
})
export class ErrorTrackingModule {}
