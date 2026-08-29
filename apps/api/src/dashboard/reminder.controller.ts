import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ReminderService } from "./reminder.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard/reminder")
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  async getSettings(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return await this.reminderService.getSettings(userId);
    } catch (error) {
      console.error("Get reminder settings error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put()
  async updateSettings(
    @Req() req: any,
    @Body() dto: {
      enabled?: boolean;
      reminderTime?: string;
      reminderType?: string;
      customMessage?: string;
      frequency?: string;
      tasksEnabled?: boolean;
      reviewsEnabled?: boolean;
      testsEnabled?: boolean;
      streakEnabled?: boolean;
      snoozeMinutes?: number;
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.reminderService.updateSettings(userId, dto);
    } catch (error) {
      console.error("Update reminder settings error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("snooze")
  async snoozeReminder(
    @Req() req: any,
    @Body() dto?: { minutes?: number }
  ) {
    try {
      const userId = req.user.userId;
      return await this.reminderService.snoozeReminder(userId, dto?.minutes);
    } catch (error) {
      console.error("Snooze reminder error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("test")
  async testReminder(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return await this.reminderService.testReminder(userId);
    } catch (error) {
      console.error("Test reminder error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
