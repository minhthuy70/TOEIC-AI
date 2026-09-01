"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Sliders,
  ShieldAlert,
  Key,
  Mail,
  MessageSquare,
  CreditCard,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  Globe,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"app" | "maintenance" | "communication" | "payment" | "integrations">("app");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // System Settings State
  const [appConfig, setAppConfig] = useState<any>({
    appName: "BELLA TOEIC AI 900+",
    appLogoUrl: "/images/logo.png",
    defaultLanguage: "vi",
    defaultStage: 2,
    timezone: "Asia/Ho_Chi_Minh (UTC+07:00)",
    sessionTimeoutMinutes: 60,
    supportEmail: "support@toeic-ai.vn",
    hotline: "1900 6868",
  });

  const [featureFlags, setFeatureFlags] = useState<any>({
    socialSharing: true,
    voicePracticeRecording: true,
    aiTutorChat: true,
    studyGroups: true,
    homeWidgets: true,
    offlineStudyMode: true,
    gamificationStreaks: true,
    placementAdaptiveTest: true,
  });

  const [maintenanceMode, setMaintenanceMode] = useState<any>({
    isEnabled: false,
    bannerMessage: "Hệ thống đang được nâng cấp máy chủ định kỳ để cải thiện tốc độ chấm điểm AI. Dự kiến hoàn tất trong 30 phút.",
    estimatedEndTime: "2026-09-01T15:00",
    whitelistIps: "127.0.0.1, 118.69.182.45, 14.162.24.112",
  });

  const [apiSettings, setApiSettings] = useState<any>({
    rateLimitRequestsPerMin: 120,
    apiKeySecret: "sk_toeic_ai_live_8f9a2b1c4e5d6f7a8b9c0d1e",
    webhookUrl: "https://api.toeic-ai.vn/webhooks/v1/events",
    corsAllowedOrigins: "http://localhost:3000, https://toeic-ai.vn, https://admin.toeic-ai.vn",
    enableSwaggerDocs: true,
  });

  const [emailSettings, setEmailSettings] = useState<any>({
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    smtpUser: "apikey",
    smtpPass: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    senderName: "BELLA TOEIC AI Platform",
    senderEmail: "noreply@toeic-ai.vn",
    enableSsl: true,
  });

  const [smsSettings, setSmsSettings] = useState<any>({
    provider: "eSMS",
    apiKey: "esms_api_key_live_99214a",
    apiSecret: "esms_secret_998822",
    senderId: "TOEIC_AI",
    otpExpiryMinutes: 5,
    enableSmsOtp: true,
  });

  const [paymentSettings, setPaymentSettings] = useState<any>({
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
  });

  const [integrationSettings, setIntegrationSettings] = useState<any>({
    googleClientId: "892182910-googleusercontent.apps.googleusercontent.com",
    googleClientSecret: "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx",
    facebookAppId: "982189201928301",
    cloudinaryCloudName: "toeic-ai-cdn",
    cloudinaryApiKey: "991829381928391",
    firebaseFcmServerKey: "AAAAxxxxxxxx:APA91bHxxxxxxxxxxxxxxxxxxxxxxxx",
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; settings: any }>("/admin/system-settings/all");
      if (res.success && res.settings) {
        if (res.settings.appConfig) setAppConfig(res.settings.appConfig);
        if (res.settings.featureFlags) setFeatureFlags(res.settings.featureFlags);
        if (res.settings.maintenanceMode) setMaintenanceMode(res.settings.maintenanceMode);
        if (res.settings.apiSettings) setApiSettings(res.settings.apiSettings);
        if (res.settings.emailSettings) setEmailSettings(res.settings.emailSettings);
        if (res.settings.smsSettings) setSmsSettings(res.settings.smsSettings);
        if (res.settings.paymentSettings) setPaymentSettings(res.settings.paymentSettings);
        if (res.settings.integrationSettings) setIntegrationSettings(res.settings.integrationSettings);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        appConfig,
        featureFlags,
        maintenanceMode,
        apiSettings,
        emailSettings,
        smsSettings,
        paymentSettings,
        integrationSettings,
      };

      const res = await apiFetch<{ success: boolean; message: string }>("/admin/system-settings/all", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt hệ thống thành công!", "success");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu cài đặt", "error");
    } finally {
      setSaving(false);
    }
  };

  // Test Email
  const handleTestEmail = async () => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/admin/system-settings/test-email", {
        method: "POST",
        body: JSON.stringify({ targetEmail: appConfig.supportEmail }),
      });
      if (res.success) showToast(res.message, "success");
    } catch (e: any) {
      showToast(e.message || "Lỗi kiểm tra SMTP", "error");
    }
  };

  // Test SMS
  const handleTestSms = async () => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/admin/system-settings/test-sms", {
        method: "POST",
        body: JSON.stringify({ targetPhone: "0988888888" }),
      });
      if (res.success) showToast(res.message, "success");
    } catch (e: any) {
      showToast(e.message || "Lỗi kiểm tra SMS", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${
              toastType === "success"
                ? "bg-zinc-900 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-400" />
            <span>Cài Đặt Hệ Thống Quản Trị Viên (System Settings 17.3)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị toàn diện thông tin ứng dụng, cờ tính năng, chế độ bảo trì, máy chủ email SMTP, SMS OTP, cổng thanh toán và tích hợp.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Đang lưu cấu hình..." : "Lưu Toàn Bộ Cài Đặt"}</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "app", label: "Ứng Dụng & Cờ Tính Năng", icon: Sliders },
          { id: "maintenance", label: "Chế Độ Bảo Trì", icon: ShieldAlert },
          { id: "communication", label: "Email & SMS Gateway", icon: Mail },
          { id: "payment", label: "Cổng Thanh Toán", icon: CreditCard },
          { id: "integrations", label: "API & Tích Hợp", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                isSelected
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-zinc-500">Đang tải cài đặt hệ thống...</div>
      ) : (
        <>
          {/* TAB 1: APP CONFIG & FEATURE FLAGS (1. App Config, 2. Feature Flags) */}
          {activeTab === "app" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. App Config */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-400" />
                  <span>1. Cấu Hình Ứng Dụng (Application Configuration)</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Tên ứng dụng / Nền tảng</label>
                    <input
                      type="text"
                      value={appConfig.appName}
                      onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Chặng khởi tạo mặc định</label>
                      <select
                        value={appConfig.defaultStage}
                        onChange={(e) => setAppConfig({ ...appConfig, defaultStage: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value={1}>Chặng 1 (0–300)</option>
                        <option value={2}>Chặng 2 (300–500)</option>
                        <option value={3}>Chặng 3 (500–650)</option>
                        <option value={4}>Chặng 4 (650–800)</option>
                        <option value={5}>Chặng 5 (800–990)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Hết hạn phiên (Phút)</label>
                      <input
                        type="number"
                        value={appConfig.sessionTimeoutMinutes}
                        onChange={(e) => setAppConfig({ ...appConfig, sessionTimeoutMinutes: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Email hỗ trợ kỹ thuật</label>
                      <input
                        type="email"
                        value={appConfig.supportEmail}
                        onChange={(e) => setAppConfig({ ...appConfig, supportEmail: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Hotline tư vấn</label>
                      <input
                        type="text"
                        value={appConfig.hotline}
                        onChange={(e) => setAppConfig({ ...appConfig, hotline: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Múi giờ hệ thống</label>
                    <input
                      type="text"
                      disabled
                      value={appConfig.timezone}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-400 opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Feature Flags */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>2. Quản Lý Cờ Tính Năng (Feature Flags)</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {[
                    { key: "socialSharing", label: "Chia sẻ thành tích xã hội (Social Sharing)", desc: "Tạo ảnh chứng chỉ và chia sẻ Facebook, Zalo, X" },
                    { key: "voicePracticeRecording", label: "Luyện phát âm giọng nói (Voice Recording)", desc: "Thu âm giọng đọc và phân tích phát âm qua AI" },
                    { key: "aiTutorChat", label: "Trợ lý AI Gia Sư Trực Tuyến (AI Tutor)", desc: "Chat hỏi đáp ngữ pháp và giải thích đáp án bài thi" },
                    { key: "studyGroups", label: "Hệ thống nhóm học tập (Study Groups)", desc: "Tạo nhóm, thi đấu xếp hạng và thử thách tuần" },
                    { key: "homeWidgets", label: "Tiện ích màn hình (Widgets Hub)", desc: "Hỗ trợ tiện ích Daily Progress & Streak Widget" },
                    { key: "offlineStudyMode", label: "Chế độ học ngoại tuyến (Offline Mode)", desc: "Tải từ vựng và bài học để luyện tập khi mất mạng" },
                  ].map((flag) => {
                    const isEnabled = featureFlags[flag.key] ?? false;
                    return (
                      <div key={flag.key} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{flag.label}</span>
                          <span className="text-[11px] text-zinc-500">{flag.desc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFeatureFlags({ ...featureFlags, [flag.key]: !isEnabled })}
                          className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                            isEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAINTENANCE MODE (3. Maintenance mode) */}
          {activeTab === "maintenance" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>3. Chế Độ Bảo Trì Hệ Thống (Maintenance Mode)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode({ ...maintenanceMode, isEnabled: !maintenanceMode.isEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                      maintenanceMode.isEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400">
                  Khi bật chế độ bảo trì, tất cả học viên truy cập vào website sẽ nhìn thấy màn hình thông báo bảo trì, ngoại trừ các IP trong danh sách Whitelist dưới đây.
                </p>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Thông điệp bảo trì hiển thị cho người học</label>
                    <textarea
                      rows={3}
                      value={maintenanceMode.bannerMessage}
                      onChange={(e) => setMaintenanceMode({ ...maintenanceMode, bannerMessage: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Thời gian dự kiến hoàn thành</label>
                    <input
                      type="datetime-local"
                      value={maintenanceMode.estimatedEndTime ? maintenanceMode.estimatedEndTime.slice(0, 16) : ""}
                      onChange={(e) => setMaintenanceMode({ ...maintenanceMode, estimatedEndTime: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Danh sách IP được miễn trừ (Whitelist IP - Cách nhau bởi dấu phẩy)</label>
                    <input
                      type="text"
                      value={maintenanceMode.whitelistIps}
                      onChange={(e) => setMaintenanceMode({ ...maintenanceMode, whitelistIps: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL & SMS GATEWAY (5. Email settings, 6. SMS settings) */}
          {activeTab === "communication" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 5. Email SMTP */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>5. Cấu Hình Máy Chủ Email (SMTP Gateway)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-lg text-[11px] font-bold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Gửi Thử
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="font-semibold text-zinc-300">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Port</label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Tài khoản SMTP</label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Mật khẩu SMTP</label>
                      <input
                        type="password"
                        value={emailSettings.smtpPass}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPass: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Tên người gửi (Sender Name)</label>
                      <input
                        type="text"
                        value={emailSettings.senderName}
                        onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Email gửi đi (Sender Email)</label>
                      <input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. SMS OTP Gateway */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>6. Cổng Gửi Tin Nhắn SMS OTP (SMS Settings)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestSms}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Gửi Thử OTP
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Nhà mạng / Đối tác SMS</label>
                      <select
                        value={smsSettings.provider}
                        onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="eSMS">eSMS.vn</option>
                        <option value="Twilio">Twilio Global</option>
                        <option value="SpeedSMS">SpeedSMS.vn</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-300">Brandname Sender ID</label>
                      <input
                        type="text"
                        value={smsSettings.senderId}
                        onChange={(e) => setSmsSettings({ ...smsSettings, senderId: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">API Key</label>
                    <input
                      type="text"
                      value={smsSettings.apiKey}
                      onChange={(e) => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">API Secret</label>
                    <input
                      type="password"
                      value={smsSettings.apiSecret}
                      onChange={(e) => setSmsSettings({ ...smsSettings, apiSecret: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT SETTINGS (7. Payment settings) */}
          {activeTab === "payment" && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>7. Cài Đặt Cổng Thanh Toán (Payment Gateways)</span>
                </h3>

                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-zinc-400">Chế độ Sandbox:</span>
                  <button
                    type="button"
                    onClick={() => setPaymentSettings({ ...paymentSettings, sandboxMode: !paymentSettings.sandboxMode })}
                    className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                      paymentSettings.sandboxMode ? "bg-amber-600 justify-end" : "bg-zinc-800 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                  <span className={`font-bold ${paymentSettings.sandboxMode ? "text-amber-400" : "text-zinc-500"}`}>
                    {paymentSettings.sandboxMode ? "TESTING" : "LIVE"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* MoMo */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-pink-500 text-sm">Ví Điện Tử MoMo</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableMoMo}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableMoMo: e.target.checked })}
                      className="w-4 h-4 accent-pink-600"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="MoMo Partner Code"
                    value={paymentSettings.momoPartnerCode}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, momoPartnerCode: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                  <input
                    type="password"
                    placeholder="MoMo Access Key"
                    value={paymentSettings.momoAccessKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, momoAccessKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>

                {/* VNPay */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-500 text-sm">Cổng Thanh Toán VNPay</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableVNPay}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableVNPay: e.target.checked })}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="VNPay TMN Code"
                    value={paymentSettings.vnpayTmnCode}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayTmnCode: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                  <input
                    type="password"
                    placeholder="VNPay Hash Secret"
                    value={paymentSettings.vnpayHashSecret}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayHashSecret: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: API & THIRD-PARTY INTEGRATIONS (4. API, 8. Integrations) */}
          {activeTab === "integrations" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 4. API Settings */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>4. Cài Đặt API & Giới Hạn Tần Suất (API Settings)</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Rate Limit (Yêu cầu / Phút)</label>
                    <input
                      type="number"
                      value={apiSettings.rateLimitRequestsPerMin}
                      onChange={(e) => setApiSettings({ ...apiSettings, rateLimitRequestsPerMin: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Khóa Bí Mật API (Master API Key)</label>
                    <input
                      type="password"
                      value={apiSettings.apiKeySecret}
                      onChange={(e) => setApiSettings({ ...apiSettings, apiKeySecret: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Webhook URL</label>
                    <input
                      type="text"
                      value={apiSettings.webhookUrl}
                      onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 8. Third-party Integrations */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>8. Tích Hợp Dịch Vụ Thứ Ba (OAuth & Cloud CDN)</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Google OAuth Client ID</label>
                    <input
                      type="text"
                      value={integrationSettings.googleClientId}
                      onChange={(e) => setIntegrationSettings({ ...integrationSettings, googleClientId: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Cloudinary Cloud Name (Lưu trữ Audio/Ảnh)</label>
                    <input
                      type="text"
                      value={integrationSettings.cloudinaryCloudName}
                      onChange={(e) => setIntegrationSettings({ ...integrationSettings, cloudinaryCloudName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Firebase Cloud Messaging Key (Thông báo đẩy)</label>
                    <input
                      type="password"
                      value={integrationSettings.firebaseFcmServerKey}
                      onChange={(e) => setIntegrationSettings({ ...integrationSettings, firebaseFcmServerKey: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
