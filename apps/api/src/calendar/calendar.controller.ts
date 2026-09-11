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
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("events")
  async getEvents(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.calendarService.getEvents(userId);
  }

  @Get("sync-urls")
  async getSyncUrls(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.calendarService.getSyncUrls(userId);
  }

  @Get("export-ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="toeic_study_schedule.ics"')
  async exportIcs(@Req() req: any): Promise<string> {
    const userId = req.user?.id || req.user?.userId;
    return this.calendarService.generateIcsFile(userId);
  }
}
