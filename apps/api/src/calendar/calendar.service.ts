import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(userId: number) {
    return {
      success: true,
      events: [
        {
          id: "evt-1",
          title: "Ôn tập 20 Từ Vựng TOEIC Hàng Ngày (Daily Vocab)",
          description: "Ôn tập theo thuật toán ngắt quãng Spaced Repetition trên hệ thống BELLA TOEIC AI.",
          location: "https://toeic-ai.vn/dashboard/vocabulary",
          startDate: "2026-09-02T08:00:00.000Z",
          endDate: "2026-09-02T08:30:00.000Z",
          isRecurring: true,
          recurrenceRule: "FREQ=DAILY;INTERVAL=1",
          category: "Vocabulary",
          color: "red",
        },
        {
          id: "evt-2",
          title: "Luyện Nghe Listening Part 3 & 4 (Short Talks)",
          description: "Luyện nghe phản xạ bắt keyword và bẫy hội thoại TOEIC Listening.",
          location: "https://toeic-ai.vn/dashboard/listening",
          startDate: "2026-09-02T19:30:00.000Z",
          endDate: "2026-09-02T20:15:00.000Z",
          isRecurring: true,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
          category: "Listening",
          color: "blue",
        },
        {
          id: "evt-3",
          title: "Kỳ Thi Thử Trực Tuyến Weekly Mock Contest #13",
          description: "Thi thử đề thi chuẩn ETS 200 câu có tính điểm xếp hạng tuần và nhận quà tặng.",
          location: "https://toeic-ai.vn/dashboard/mock-test",
          startDate: "2026-09-06T08:00:00.000Z",
          endDate: "2026-09-06T10:00:00.000Z",
          isRecurring: true,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=SU",
          category: "Mock Test",
          color: "amber",
        },
        {
          id: "evt-4",
          title: "Luyện Đọc Nhanh Part 7 (Double & Triple Passages)",
          description: "Rèn kỹ năng Skimming & Scanning định vị thông tin đoạn văn dài.",
          location: "https://toeic-ai.vn/dashboard/reading",
          startDate: "2026-09-03T20:00:00.000Z",
          endDate: "2026-09-03T20:45:00.000Z",
          isRecurring: true,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=TU,TH,SA",
          category: "Reading",
          color: "emerald",
        },
      ],
      settings: {
        reminderMinutesBefore: 15,
        syncVocabDrills: true,
        syncListeningSessions: true,
        syncReadingPassages: true,
        syncMockContests: true,
      },
    };
  }

  async getSyncUrls(userId: number) {
    const baseUrl = "https://toeic-ai.vn";
    const title = encodeURIComponent("Ôn tập TOEIC AI Hàng Ngày");
    const details = encodeURIComponent("Phiên học từ vựng và luyện đề tại https://toeic-ai.vn/dashboard");
    const location = encodeURIComponent("https://toeic-ai.vn/dashboard");

    // Google Calendar Link format
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=20260902T010000Z/20260902T013000Z&recur=RRULE:FREQ=DAILY`;

    // Outlook Calendar Link format
    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=2026-09-02T08:00:00&enddt=2026-09-02T08:30:00`;

    // Apple Webcal Feed URL
    const appleWebcalUrl = `webcal://api.toeic-ai.vn/calendar/feed/${userId}.ics`;

    return {
      success: true,
      urls: {
        googleCalendarUrl,
        outlookCalendarUrl,
        appleWebcalUrl,
        icalDownloadUrl: `/calendar/export-ics`,
      },
    };
  }

  async generateIcsFile(userId: number): Promise<string> {
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BELLA TOEIC AI//Study Calendar 1.0//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Lịch Học TOEIC AI 900+",
      "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
      "",
      "BEGIN:VEVENT",
      "UID:toeic-vocab-daily-" + userId + "@toeic-ai.vn",
      `DTSTAMP:${now}`,
      "DTSTART:20260902T010000Z",
      "DTEND:20260902T013000Z",
      "RRULE:FREQ=DAILY",
      "SUMMARY:Ôn tập 20 Từ Vựng TOEIC Hàng Ngày",
      "DESCRIPTION:Ôn tập theo thuật toán Spaced Repetition tại https://toeic-ai.vn/dashboard/vocabulary",
      "LOCATION:https://toeic-ai.vn/dashboard/vocabulary",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Nhắc nhở học từ vựng TOEIC AI",
      "END:VALARM",
      "END:VEVENT",
      "",
      "BEGIN:VEVENT",
      "UID:toeic-mock-weekly-" + userId + "@toeic-ai.vn",
      `DTSTAMP:${now}`,
      "DTSTART:20260906T010000Z",
      "DTEND:20260906T030000Z",
      "RRULE:FREQ=WEEKLY;BYDAY=SU",
      "SUMMARY:Thi Thử TOEIC Trực Tuyến Weekly Mock Contest",
      "DESCRIPTION:Kỳ thi thử trực tuyến 200 câu tại https://toeic-ai.vn/dashboard/mock-test",
      "LOCATION:https://toeic-ai.vn/dashboard/mock-test",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Chuẩn bị thi thử TOEIC hàng tuần",
      "END:VALARM",
      "END:VEVENT",
      "",
      "END:VCALENDAR",
    ];

    return icsLines.join("\r\n");
  }
}
