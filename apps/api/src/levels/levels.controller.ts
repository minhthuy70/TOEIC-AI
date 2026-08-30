import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Post, Body, Put, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LevelsService } from "./levels.service";

@UseGuards(JwtAuthGuard)
@Controller("levels")
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get("info")
  async getUserLevelInfo(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.levelsService.getUserLevelInfo(userId);
    } catch (error) {
      console.error("Get user level info error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("all")
  async getAllLevels() {
    try {
      return this.levelsService.getAllLevels();
    } catch (error) {
      console.error("Get all levels error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("award-xp")
  async awardXp(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { type, sourceType, sourceId, customXp, description } = body;
      return this.levelsService.awardXp(userId, type, sourceType, sourceId, customXp, description);
    } catch (error) {
      console.error("Award XP error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("notifications")
  async getLevelUpNotifications(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.levelsService.getLevelUpNotifications(userId);
    } catch (error) {
      console.error("Get level-up notifications error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put("notifications/:notificationId/read")
  async markNotificationAsRead(@Req() req: any, @Param("notificationId") notificationId: string) {
    try {
      const userId = req.user.userId;
      return this.levelsService.markNotificationAsRead(parseInt(notificationId), userId);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
