import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RecommendationService } from "./recommendation.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard/recommendation")
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  async getSmartRecommendations(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return await this.recommendationService.getSmartRecommendations(userId);
    } catch (error) {
      console.error("Get smart recommendations error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
