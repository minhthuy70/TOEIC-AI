import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Body, Query, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RewardsService } from "./rewards.service";

@UseGuards(JwtAuthGuard)
@Controller("rewards")
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get("catalog")
  async getRewardsCatalog(
    @Query("category") category?: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    try {
      const includeInactiveBool = includeInactive === "true";
      return this.rewardsService.getRewardsCatalog(category, includeInactiveBool);
    } catch (error) {
      console.error("Get rewards catalog error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("history")
  async getUserRewardHistory(
    @Req() req: any,
    @Query("limit") limit?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      return this.rewardsService.getUserRewardHistory(userId, limitNum);
    } catch (error) {
      console.error("Get reward history error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("redeem")
  async redeemReward(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { rewardId } = body;
      if (!rewardId) {
        throw new HttpException(
          { message: "Reward ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.rewardsService.redeemReward(userId, rewardId);
    } catch (error) {
      console.error("Redeem reward error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("share")
  async shareReward(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { rewardId, bonusPoints } = body;
      if (!rewardId) {
        throw new HttpException(
          { message: "Reward ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.rewardsService.shareReward(userId, rewardId, bonusPoints || 0);
    } catch (error) {
      console.error("Share reward error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("claim/:shareCode")
  async claimSharedReward(@Req() req: any, @Param("shareCode") shareCode: string) {
    try {
      const userId = req.user.userId;
      return this.rewardsService.claimSharedReward(userId, shareCode);
    } catch (error) {
      console.error("Claim shared reward error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("notifications")
  async getRewardNotifications(
    @Req() req: any,
    @Query("limit") limit?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      return this.rewardsService.getRewardNotifications(userId, limitNum);
    } catch (error) {
      console.error("Get reward notifications error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("notifications/read")
  async markNotificationAsRead(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { notificationId } = body;
      if (!notificationId) {
        throw new HttpException(
          { message: "Notification ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.rewardsService.markNotificationAsRead(notificationId, userId);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getRewardDetails(@Param("id") id: string) {
    try {
      const rewardId = parseInt(id);
      return this.rewardsService.getRewardDetails(rewardId);
    } catch (error) {
      console.error("Get reward details error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}