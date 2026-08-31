import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Body, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PointsService } from "./points.service";

@UseGuards(JwtAuthGuard)
@Controller("points")
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get("stats")
  async getPointsStats(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.pointsService.getPointsStats(userId);
    } catch (error) {
      console.error("Get points stats error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("history")
  async getPointsHistory(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;
      return this.pointsService.getPointsHistory(userId, limitNum, offsetNum);
    } catch (error) {
      console.error("Get points history error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard")
  async getLeaderboard(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
    @Query("period") period?: string
  ) {
    try {
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;
      const categoryValue = category || "global";
      const periodValue = period || "all_time";
      return this.pointsService.getLeaderboard(limitNum, offsetNum, categoryValue, periodValue);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard/position")
  async getUserLeaderboardPosition(
    @Req() req: any,
    @Query("category") category?: string,
    @Query("period") period?: string
  ) {
    try {
      const userId = req.user.userId;
      const categoryValue = category || "global";
      const periodValue = period || "all_time";
      return this.pointsService.getUserLeaderboardPosition(userId, categoryValue, periodValue);
    } catch (error) {
      console.error("Get user leaderboard position error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard/friends")
  async getFriendsLeaderboard(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
    @Query("period") period?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;
      const categoryValue = category || "global";
      const periodValue = period || "all_time";
      return this.pointsService.getFriendsLeaderboard(userId, limitNum, offsetNum, categoryValue, periodValue);
    } catch (error) {
      console.error("Get friends leaderboard error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard/search")
  async searchLeaderboard(
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("category") category?: string,
    @Query("period") period?: string
  ) {
    try {
      if (!search) {
        throw new HttpException(
          { message: "Search term is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      const limitNum = limit ? parseInt(limit) : 20;
      const categoryValue = category || "global";
      const periodValue = period || "all_time";
      return this.pointsService.searchLeaderboard(search, limitNum, categoryValue, periodValue);
    } catch (error) {
      console.error("Search leaderboard error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard/compare")
  async compareWithFriends(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.pointsService.compareWithFriends(userId);
    } catch (error) {
      console.error("Compare with friends error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("leaderboard/record-history")
  async recordLeaderboardHistory() {
    try {
      return this.pointsService.recordLeaderboardHistory();
    } catch (error) {
      console.error("Record leaderboard history error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("leaderboard/notifications")
  async getLeaderboardNotifications(
    @Req() req: any,
    @Query("limit") limit?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      return this.pointsService.getLeaderboardNotifications(userId, limitNum);
    } catch (error) {
      console.error("Get leaderboard notifications error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("leaderboard/notifications/read")
  async markNotificationAsRead(
    @Req() req: any,
    @Body() body: any
  ) {
    try {
      const userId = req.user.userId;
      const { notificationId } = body;
      if (!notificationId) {
        throw new HttpException(
          { message: "Notification ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.pointsService.markNotificationAsRead(notificationId, userId);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("award")
  async awardPoints(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { type, sourceType, sourceId, customAmount, description } = body;
      return this.pointsService.awardPoints(userId, type, sourceType, sourceId, customAmount, description);
    } catch (error) {
      console.error("Award points error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("deduct")
  async deductPoints(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { amount, reason } = body;
      if (!amount || amount <= 0) {
        throw new HttpException(
          { message: "Invalid amount", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      if (!reason) {
        throw new HttpException(
          { message: "Reason is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.pointsService.deductPoints(userId, amount, reason);
    } catch (error) {
      console.error("Deduct points error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
