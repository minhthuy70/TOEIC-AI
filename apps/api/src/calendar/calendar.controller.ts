import {
  Controller,
  Get,
  UseGuards,
  Req,
  Header,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CalendarService } from "./calendar.service";

@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @UseGuards(JwtAuthGuard)
  @Get("events")
  async getEvents(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.calendarService.getEvents(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("sync-urls")
  async getSyncUrls(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.calendarService.getSyncUrls(userId);
  }

  @Get("export-ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="toeic_study_schedule.ics"')
  async exportIcs(): Promise<string> {
    return this.calendarService.generateIcsFile(1);
  }
}
