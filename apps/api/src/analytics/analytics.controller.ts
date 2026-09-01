import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("config")
  getConfig() {
    return this.analyticsService.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put("config")
  updateConfig(@Body() body: any) {
    return this.analyticsService.updateConfig(body);
  }

  @Post("track")
  trackEvent(@Body() body: { eventName: string; userId?: any; properties?: Record<string, any>; platform?: string }) {
    return this.analyticsService.trackEvent(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("custom-events")
  getCustomEvents() {
    return this.analyticsService.getCustomEvents();
  }

  @UseGuards(JwtAuthGuard)
  @Post("test-event")
  testEvent(@Body() body: { provider: string; eventName: string }) {
    return this.analyticsService.testEvent(body.provider, body.eventName);
  }
}
