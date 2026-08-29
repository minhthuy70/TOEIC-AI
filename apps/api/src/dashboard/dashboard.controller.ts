import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Post, Put, Delete, Body } from "@nestjs/common";
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

  // Goal Management Endpoints
  @Post("goals")
  async createGoal(@Req() req: any, @Body() goalData: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.createGoal(userId, goalData);
    } catch (error) {
      console.error('Create goal error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("goals")
  async getGoals(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getGoals(userId);
    } catch (error) {
      console.error('Get goals error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put("goals/:id")
  async updateGoal(@Req() req: any, @Body() goalData: any) {
    try {
      const userId = req.user.userId;
      const goalId = parseInt(req.params.id);
      return this.dashboardService.updateGoal(goalId, userId, goalData);
    } catch (error) {
      console.error('Update goal error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete("goals/:id")
  async deleteGoal(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const goalId = parseInt(req.params.id);
      return this.dashboardService.deleteGoal(goalId, userId);
    } catch (error) {
      console.error('Delete goal error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("goals/history")
  async getGoalHistory(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getGoalHistory(userId);
    } catch (error) {
      console.error('Get goal history error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("achievements")
  async getAchievements(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getAchievements(userId);
    } catch (error) {
      console.error('Get achievements error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("achievements/:id/share")
  async shareAchievement(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const achievementId = parseInt(req.params.id);
      return this.dashboardService.shareAchievement(userId, achievementId);
    } catch (error) {
      console.error('Share achievement error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("achievements/notifications")
  async getAchievementNotifications(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.getAchievementNotifications(userId);
    } catch (error) {
      console.error('Get achievement notifications error:', error);
      throw new HttpException(
        { message: error.message || 'Internal server error', statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
