import { Controller, Get, Req, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  async getOverview(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getOverview(userId);
    } catch (error) {
      console.error('Dashboard overview error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
