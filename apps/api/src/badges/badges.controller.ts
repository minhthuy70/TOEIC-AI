import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Post, Put, Body, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BadgesService } from "./badges.service";

@UseGuards(JwtAuthGuard)
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get("user")
  async getUserBadges(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.badgesService.getUserBadges(userId);
    } catch (error) {
      console.error("Get user badges error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("all")
  async getAllBadges() {
    try {
      return this.badgesService.getAllBadges();
    } catch (error) {
      console.error("Get all badges error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("unlock/:badgeId")
  async unlockBadge(@Req() req: any, @Param("badgeId") badgeId: string) {
    try {
      const userId = req.user.userId;
      return this.badgesService.unlockBadge(userId, parseInt(badgeId));
    } catch (error) {
      console.error("Unlock badge error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put("display/:badgeId")
  async updateBadgeDisplay(
    @Req() req: any,
    @Param("badgeId") badgeId: string,
    @Body() body: { isDisplayed: boolean }
  ) {
    try {
      const userId = req.user.userId;
      return this.badgesService.updateBadgeDisplay(userId, parseInt(badgeId), body.isDisplayed);
    } catch (error) {
      console.error("Update badge display error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("share/:badgeId")
  async shareBadge(@Req() req: any, @Param("badgeId") badgeId: string) {
    try {
      const userId = req.user.userId;
      return this.badgesService.shareBadge(userId, parseInt(badgeId));
    } catch (error) {
      console.error("Share badge error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
