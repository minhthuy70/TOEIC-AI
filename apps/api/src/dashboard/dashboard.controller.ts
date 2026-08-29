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

  @Get("weekly")
  async getWeeklyDashboard(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getWeeklyDashboard(userId);
    } catch (error) {
      console.error('Dashboard weekly error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("monthly")
  async getMonthlyDashboard(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getMonthlyDashboard(userId);
    } catch (error) {
      console.error('Dashboard monthly error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("statistics")
  async getStatisticsOverview(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getStatisticsOverview(userId);
    } catch (error) {
      console.error('Dashboard statistics error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("analytics")
  async getDetailedAnalytics(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getDetailedAnalytics(userId);
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
