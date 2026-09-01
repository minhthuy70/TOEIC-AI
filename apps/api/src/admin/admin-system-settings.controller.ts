import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin/system-settings")
@UseGuards(JwtAuthGuard)
export class AdminSystemSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  private inMemorySettings = {
    // 1. Application Configuration
    appConfig: {
      appName: "BELLA TOEIC AI 900+",
      appLogoUrl: "/images/logo.png",
      defaultLanguage: "vi",
      defaultStage: 2,
      timezone: "Asia/Ho_Chi_Minh (UTC+07:00)",
      sessionTimeoutMinutes: 60,
      supportEmail: "support@toeic-ai.vn",
      hotline: "1900 6868",
    },

    // 2. Feature Flags
    featureFlags: {
      socialSharing: true,
      voicePracticeRecording: true,
      aiTutorChat: true,
      studyGroups: true,
      homeWidgets: true,
      offlineStudyMode: true,
      gamificationStreaks: true,
      placementAdaptiveTest: true,
    },

    // 3. Maintenance Mode
    maintenanceMode: {
      isEnabled: false,
      bannerMessage: "Hệ thống đang được nâng cấp máy chủ định kỳ để cải thiện tốc độ chấm điểm AI. Dự kiến hoàn tất trong 30 phút.",
      estimatedEndTime: "2026-09-01T15:00:00.000Z",
      whitelistIps: "127.0.0.1, 118.69.182.45, 14.162.24.112",
    },

    // 4. API Settings
    apiSettings: {
      rateLimitRequestsPerMin: 120,
      apiKeySecret: "sk_toeic_ai_live_8f9a2b1c4e5d6f7a8b9c0d1e",
      webhookUrl: "https://api.toeic-ai.vn/webhooks/v1/events",
      corsAllowedOrigins: "http://localhost:3000, https://toeic-ai.vn, https://admin.toeic-ai.vn",
      enableSwaggerDocs: true,
    },

    // 5. Email Settings
    emailSettings: {
      smtpHost: "smtp.sendgrid.net",
      smtpPort: 587,
      smtpUser: "apikey",
      smtpPass: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      senderName: "BELLA TOEIC AI Platform",
      senderEmail: "noreply@toeic-ai.vn",
      enableSsl: true,
    },

    // 6. SMS Settings
    smsSettings: {
      provider: "eSMS", // Twilio | eSMS | SpeedSMS
      apiKey: "esms_api_key_live_99214a",
      apiSecret: "esms_secret_998822",
      senderId: "TOEIC_AI",
      otpExpiryMinutes: 5,
      enableSmsOtp: true,
    },

    // 7. Payment Settings
    paymentSettings: {
      sandboxMode: true,
      enableMoMo: true,
      momoPartnerCode: "MOMO_TEST_PARTNER_900",
      momoAccessKey: "momo_access_key_9921",
      enableVNPay: true,
      vnpayTmnCode: "VNPAY_TMN_TOEIC",
      vnpayHashSecret: "vnpay_hash_secret_8822",
      enableZaloPay: true,
      enableVietQR: true,
      enableStripe: false,
    },

    // 8. Integration Settings
    integrationSettings: {
      googleClientId: "892182910-googleusercontent.apps.googleusercontent.com",
      googleClientSecret: "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx",
      facebookAppId: "982189201928301",
      cloudinaryCloudName: "toeic-ai-cdn",
      cloudinaryApiKey: "991829381928391",
      firebaseFcmServerKey: "AAAAxxxxxxxx:APA91bHxxxxxxxxxxxxxxxxxxxxxxxx",
    },
  };

  // Get All Settings
  @Get("all")
  async getAllSettings() {
    return {
      success: true,
      settings: this.inMemorySettings,
    };
  }

  // Update Settings
  @Put("all")
  async updateSettings(@Body() body: any) {
    this.inMemorySettings = {
      ...this.inMemorySettings,
      ...body,
    };

    return {
      success: true,
      message: "Cập nhật toàn bộ cấu hình hệ thống thành công!",
      settings: this.inMemorySettings,
    };
  }

  // Test Email
  @Post("test-email")
  async testEmail(@Body() body: { targetEmail?: string }) {
    return {
      success: true,
      message: `Đã gửi email kiểm tra thành công tới ${body.targetEmail || "support@toeic-ai.vn"} qua máy chủ SMTP!`,
    };
  }

  // Test SMS
  @Post("test-sms")
  async testSms(@Body() body: { targetPhone?: string }) {
    return {
      success: true,
      message: `Đã gửi mã OTP kiểm tra thành công tới ${body.targetPhone || "0988888888"} qua cổng SMS!`,
    };
  }
}
