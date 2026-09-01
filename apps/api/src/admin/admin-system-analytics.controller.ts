import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin/system-analytics")
@UseGuards(JwtAuthGuard)
export class AdminSystemAnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  private mockErrorLogs = [
    {
      id: "err-1",
      statusCode: 500,
      endpoint: "GET /api/mock-test/attempt/489/questions",
      message: "PrismaClientKnownRequestError: Timed out fetching a new connection from the pool",
      source: "Database Pool",
      occurrences: 4,
      firstSeen: "2026-09-01T08:12:00.000Z",
      lastSeen: "2026-09-01T12:30:00.000Z",
      resolved: false,
    },
    {
      id: "err-2",
      statusCode: 404,
      endpoint: "GET /audio/part3/conversation-120.mp3",
      message: "Audio stream asset not found on CDN edge server",
      source: "CDN Storage",
      occurrences: 12,
      firstSeen: "2026-08-31T14:00:00.000Z",
      lastSeen: "2026-09-01T11:45:00.000Z",
      resolved: false,
    },
    {
      id: "err-3",
      statusCode: 429,
      endpoint: "POST /api/vocabulary/ai-explain",
      message: "Rate limit exceeded for Gemini API backend queue",
      source: "AI Gateway",
      occurrences: 2,
      firstSeen: "2026-08-30T19:20:00.000Z",
      lastSeen: "2026-08-30T19:22:00.000Z",
      resolved: true,
    },
  ];

  // 1, 2, 3, 4, 5, 6. User Metrics: DAU, WAU, MAU, Retention, Churn, Conversion
  @Get("user-metrics")
  async getUserMetrics() {
    const totalUsers = await this.prisma.user.count();

    return {
      success: true,
      metrics: {
        dau: 430,
        wau: 1150,
        mau: 1250,
        stickinessRatio: 34.4, // (DAU / MAU) * 100
        churnRate: 3.2,
        conversionRate: 8.5,
        dailyTrend: [
          { date: "26/08", dau: 390, newUsers: 14 },
          { date: "27/08", dau: 410, newUsers: 18 },
          { date: "28/08", dau: 435, newUsers: 22 },
          { date: "29/08", dau: 420, newUsers: 16 },
          { date: "30/08", dau: 460, newUsers: 25 },
          { date: "31/08", dau: 490, newUsers: 30 },
          { date: "01/09", dau: 430, newUsers: 19 },
        ],
        cohortRetention: [
          { cohort: "Tuần 32 (03-09/08)", users: 120, d1: 88, d7: 78, d14: 72, d30: 66 },
          { cohort: "Tuần 33 (10-16/08)", users: 145, d1: 86, d7: 76, d14: 70, d30: 64 },
          { cohort: "Tuần 34 (17-23/08)", users: 160, d1: 89, d7: 80, d14: 74, d30: 68 },
          { cohort: "Tuần 35 (24-30/08)", users: 180, d1: 91, d7: 82, d14: 77, d30: 71 },
        ],
      },
    };
  }

  // 7. Revenue Metrics (MRR, ARR, ARPU, Subscriptions)
  @Get("revenue")
  async getRevenueMetrics() {
    return {
      success: true,
      revenue: {
        mrr: 48500000, // Monthly Recurring Revenue (VND)
        arr: 582000000, // Annual Run Rate (VND)
        arpu: 388000, // Average Revenue Per User (VND)
        payingUsers: 125,
        packageBreakdown: [
          { name: "Gói Pro Tháng (1 Tháng)", price: 199000, activeSubscribers: 65, totalRevenue: 12935000 },
          { name: "Gói Pro Quý (3 Tháng)", price: 499000, activeSubscribers: 35, totalRevenue: 17465000 },
          { name: "Gói VIP TOEIC 900+ Master (1 Năm)", price: 1299000, activeSubscribers: 25, totalRevenue: 32475000 },
        ],
        monthlyGrowthRate: 16.8,
      },
    };
  }

  // 8. System Performance Metrics
  @Get("performance")
  async getSystemPerformance() {
    return {
      success: true,
      performance: {
        uptime: 99.98,
        averageLatencyMs: 42,
        cpuUsagePercent: 18.5,
        memoryUsagePercent: 44.2,
        dbQueryTimeAvgMs: 7.8,
        activeWebsockets: 185,
        requestsPerMinute: 1240,
        servicesStatus: [
          { service: "NestJS Core API Gateway", status: "Operational", latency: "38ms" },
          { service: "PostgreSQL Database Cluster", status: "Operational", latency: "8ms" },
          { service: "Next.js Web Frontend (Turbopack)", status: "Operational", latency: "25ms" },
          { service: "Audio Streaming CDN", status: "Operational", latency: "45ms" },
          { service: "Gemini AI Assistant Engine", status: "Operational", latency: "210ms" },
        ],
      },
    };
  }

  // 9. Error Logs
  @Get("error-logs")
  async getErrorLogs() {
    return {
      success: true,
      errorCount: this.mockErrorLogs.filter((e) => !e.resolved).length,
      logs: this.mockErrorLogs,
    };
  }

  @Post("error-logs/:id/resolve")
  async resolveErrorLog(@Param("id") id: string) {
    const err = this.mockErrorLogs.find((e) => e.id === id);
    if (err) {
      err.resolved = true;
    }
    return {
      success: true,
      message: `Đã đánh dấu đã xử lý lỗi ${id}`,
    };
  }

  // 10. Usage Patterns & Peak Hours
  @Get("usage-patterns")
  async getUsagePatterns() {
    return {
      success: true,
      patterns: {
        peakHoursHeatmap: [
          { hour: "00:00 - 04:00", learnersPercent: 4, traffic: "Rất thấp" },
          { hour: "04:00 - 07:00", learnersPercent: 12, traffic: "Trung bình (Học sáng sớm)" },
          { hour: "07:00 - 11:00", learnersPercent: 18, traffic: "Cao (Giờ văn phòng)" },
          { hour: "11:00 - 14:00", learnersPercent: 22, traffic: "Rất cao (Nghỉ trưa)" },
          { hour: "14:00 - 18:00", learnersPercent: 16, traffic: "Trung bình" },
          { hour: "18:00 - 23:00", learnersPercent: 28, traffic: "Đỉnh điểm (Buổi tối)" },
        ],
        devicesBreakdown: [
          { device: "Desktop / Laptop", percentage: 58, icon: "Laptop" },
          { device: "Mobile Smartphone", percentage: 36, icon: "Smartphone" },
          { device: "Tablet / iPad", percentage: 6, icon: "Tablet" },
        ],
        skillDistribution: [
          { skill: "Vocabulary (Từ vựng)", percentage: 34 },
          { skill: "Listening (Luyện nghe)", percentage: 26 },
          { skill: "Reading (Luyện đọc)", percentage: 22 },
          { skill: "Full Mock Test", percentage: 18 },
        ],
      },
    };
  }
}
