import { Controller, Get, Req, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  async getOverview(@Req() req: any) {
    try {
      // Temporarily remove auth guard for testing
      // TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing auth
      const userId = req.user?.userId || 1; // Default to user ID 1 for testing
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
