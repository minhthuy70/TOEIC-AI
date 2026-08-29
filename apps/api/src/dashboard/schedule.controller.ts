import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ScheduleService } from "./schedule.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard/schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedules(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return await this.scheduleService.getSchedules(userId);
    } catch (error) {
      console.error("Get schedules error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createSchedule(
    @Req() req: any,
    @Body() dto: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      title: string;
      sessionType: string;
      isRecurring?: boolean;
      reminder?: boolean;
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.scheduleService.createSchedule(userId, dto);
    } catch (error) {
      console.error("Create schedule error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(":id")
  async updateSchedule(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      title?: string;
      sessionType?: string;
      isRecurring?: boolean;
      reminder?: boolean;
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.scheduleService.updateSchedule(userId, id, dto);
    } catch (error) {
      console.error("Update schedule error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteSchedule(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number
  ) {
    try {
      const userId = req.user.userId;
      return await this.scheduleService.deleteSchedule(userId, id);
    } catch (error) {
      console.error("Delete schedule error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("copy")
  async copySchedule(
    @Req() req: any,
    @Body() dto: {
      fromDay: number;
      toDays: number[];
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.scheduleService.copySchedule(userId, dto.fromDay, dto.toDays);
    } catch (error) {
      console.error("Copy schedule error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
