import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Body, Query, Param, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("preferences")
  async getNotificationPreferences(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.notificationsService.getNotificationPreferences(userId);
    } catch (error) {
      console.error("Get notification preferences error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("preferences")
  async updateNotificationPreferences(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      return this.notificationsService.updateNotificationPreferences(userId, body);
    } catch (error) {
      console.error("Update notification preferences error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getUserNotifications(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("unreadOnly") unreadOnly?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      const offsetNum = offset ? parseInt(offset) : 0;
      const unreadOnlyBool = unreadOnly === "true";
      return this.notificationsService.getUserNotifications(userId, limitNum, offsetNum, unreadOnlyBool);
    } catch (error) {
      console.error("Get user notifications error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("read/:id")
  async markAsRead(@Req() req: any, @Param("id") id: string) {
    try {
      const userId = req.user.userId;
      const notificationId = parseInt(id);
      return this.notificationsService.markAsRead(notificationId, userId);
    } catch (error) {
      console.error("Mark as read error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("read-all")
  async markAllAsRead(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.notificationsService.markAllAsRead(userId);
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteNotification(@Req() req: any, @Param("id") id: string) {
    try {
      const userId = req.user.userId;
      const notificationId = parseInt(id);
      return this.notificationsService.deleteNotification(notificationId, userId);
    } catch (error) {
      console.error("Delete notification error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("send-review-reminders")
  async sendReviewDueReminders() {
    try {
      return this.notificationsService.sendReviewDueReminders();
    } catch (error) {
      console.error("Send review due reminders error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("send-study-reminders")
  async sendStudyTimeReminders() {
    try {
      return this.notificationsService.sendStudyTimeReminders();
    } catch (error) {
      console.error("Send study time reminders error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("send-streak-warnings")
  async sendStreakWarnings() {
    try {
      return this.notificationsService.sendStreakWarnings();
    } catch (error) {
      console.error("Send streak warnings error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("send-goal-updates")
  async sendGoalProgressUpdates() {
    try {
      return this.notificationsService.sendGoalProgressUpdates();
    } catch (error) {
      console.error("Send goal progress updates error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("weekly-summary")
  async sendWeeklySummary(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.notificationsService.sendWeeklySummary(userId);
    } catch (error) {
      console.error("Send weekly summary error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("monthly-summary")
  async sendMonthlySummary(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.notificationsService.sendMonthlySummary(userId);
    } catch (error) {
      console.error("Send monthly summary error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}