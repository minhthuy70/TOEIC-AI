import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CustomEventItem {
  id: string;
  eventName: string;
  userId?: number | string;
  properties: Record<string, any>;
  timestamp: string;
  ip?: string;
  platform?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private config = {
    // 1. Google Analytics (GA4)
    googleAnalytics: {
      isEnabled: true,
      measurementId: "G-TOEICAI900",
      sendPageView: true,
      anonymizeIp: true,
      debugMode: false,
    },

    // 2. Mixpanel
    mixpanel: {
      isEnabled: true,
      projectToken: "mixpanel_token_live_891238a9",
      trackPageview: true,
      recordSessionsPercent: 100,
    },

    // 3. Amplitude
    amplitude: {
      isEnabled: true,
      apiKey: "amp_live_api_key_99214a11",
      serverZone: "US", // US | EU
      minIdLength: 1,
    },

    // 4. Custom Internal Analytics
    customAnalytics: {
      isEnabled: true,
      sampleRatePercent: 100,
      retentionDays: 90,
      batchSize: 50,
    },
  };

  private inMemoryEvents: CustomEventItem[] = [
    {
      id: "evt-101",
      eventName: "learn_vocab_flashcard",
      userId: 1,
      properties: { word: "abandon", stage: 2, result: "remembered", timeSpentSeconds: 4.2 },
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      platform: "web",
      ip: "118.69.182.45",
    },
    {
      id: "evt-102",
      eventName: "complete_listening_part1",
      userId: 2,
      properties: { correctCount: 6, totalCount: 6, score: 100, timeTaken: "2m 15s" },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      platform: "web",
      ip: "14.162.24.112",
    },
    {
      id: "evt-103",
      eventName: "submit_mock_test",
      userId: 3,
      properties: { testTitle: "ETS TOEIC 2024 Test 03", totalScore: 825, listeningScore: 430, readingScore: 395 },
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      platform: "web",
      ip: "127.0.0.1",
    },
    {
      id: "evt-104",
      eventName: "click_upgrade_pro",
      userId: 1,
      properties: { package: "VIP TOEIC 900+ Master", source: "dashboard_banner" },
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      platform: "web",
      ip: "118.69.182.45",
    },
  ];

  getConfig() {
    return {
      success: true,
      config: this.config,
    };
  }

  updateConfig(newConfig: any) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    return {
      success: true,
      message: "Cập nhật cấu hình tích hợp phân tích thành công!",
      config: this.config,
    };
  }

  trackEvent(eventData: { eventName: string; userId?: any; properties?: Record<string, any>; platform?: string }) {
    const item: CustomEventItem = {
      id: "evt-" + Date.now(),
      eventName: eventData.eventName,
      userId: eventData.userId || "anonymous",
      properties: eventData.properties || {},
      timestamp: new Date().toISOString(),
      platform: eventData.platform || "web",
      ip: "127.0.0.1",
    };

    this.inMemoryEvents.unshift(item);
    if (this.inMemoryEvents.length > 50) {
      this.inMemoryEvents.pop();
    }

    return {
      success: true,
      event: item,
    };
  }

  getCustomEvents() {
    return {
      success: true,
      totalEvents: this.inMemoryEvents.length,
      events: this.inMemoryEvents,
      topEvents: [
        { name: "learn_vocab_flashcard", count: 1420, percent: 42 },
        { name: "listen_audio_part", count: 980, percent: 29 },
        { name: "submit_mock_test", count: 540, percent: 16 },
        { name: "click_upgrade_pro", count: 440, percent: 13 },
      ],
    };
  }

  testEvent(provider: string, eventName: string) {
    return {
      success: true,
      message: `Đã gửi thành công sự kiện thử nghiệm "${eventName}" tới dịch vụ ${provider.toUpperCase()}!`,
    };
  }
}
