"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Bell,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
  BellRing,
  RotateCcw,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Send,
  Calendar,
  Flame,
  Clipboard,
  Shield,
  MessageSquare,
  X,
} from "lucide-react";

interface ReminderSetting {
  enabled: boolean;
  reminderTime: string;
  reminderType: string;
  customMessage: string;
  frequency: string;
  tasksEnabled: boolean;
  reviewsEnabled: boolean;
  testsEnabled: boolean;
  streakEnabled: boolean;
  snoozeMinutes: number;
}

export default function RemindersPage() {
  const [settings, setSettings] = useState<ReminderSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Simulated notification popup state
  const [testNotification, setTestNotification] = useState<{
    title: string;
    body: string;
    type: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; setting: ReminderSetting }>(
        "/dashboard/reminder"
      );
      if (res.success) {
        setSettings(res.setting);
      } else {
        setError("Không thể tải cấu hình nhắc nhở");
      }
    } catch (err: any) {
      console.error(err);
      setError("Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const handleUpdateField = (field: keyof ReminderSetting, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>(
        "/dashboard/reminder",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        }
      );
      if (res.success) {
        showToast(res.message);
        fetchSettings();
      }
    } catch (err: any) {
      console.error(err);
      showToast("Không thể lưu cấu hình nhắc nhở");
    } finally {
      setSaving(false);
    }
  };

  const handleSnooze = async (minutes: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string; snoozedUntil: string }>(
        "/dashboard/reminder/snooze",
        {
          method: "POST",
          body: JSON.stringify({ minutes }),
        }
      );
      if (res.success) {
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Không thể hoãn nhắc nhở");
    }
  };

  const handleSendTest = async () => {
    if (!settings?.enabled) {
      showToast("Hãy bật Nhắc nhở học tập trước khi gửi thử!");
      return;
    }

    try {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        notification: { title: string; body: string; type: string; time: string };
      }>("/dashboard/reminder/test", { method: "POST" });

      if (res.success) {
        setTestNotification(res.notification);
        showToast(res.message);
        // Auto-close notification preview after 6 seconds
        setTimeout(() => {
          setTestNotification(null);
        }, 6000);
      } else {
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Gửi thử nghiệm thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang tải cấu hình nhắc nhở...</p>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải cấu hình</p>
        <p className="text-zinc-400 text-sm mb-6">{error || "Cấu hình trống"}</p>
        <button
          onClick={fetchSettings}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Sub-tab Navigation */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1 max-w-sm">
        <Link
          href="/dashboard/notifications"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Hộp thư thông báo</span>
        </Link>
        <Link
          href="/dashboard/reminders"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold bg-red-600 text-white shadow-md transition"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Giờ nhắc học</span>
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-zinc-800/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <span>Cấu hình nhắc nhở học tập</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cá nhân hóa các thông báo ôn luyện để đảm bảo không bỏ lỡ chuỗi ngày học
          </p>
        </div>

        {/* Test Notification trigger */}
        <button
          onClick={handleSendTest}
          disabled={!settings.enabled}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi thử thông báo</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* --- MASTER SWITCH CARD --- */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex justify-between items-center transition-all">
          <div className="space-y-1 pr-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hệ thống nhắc nhở học tập</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              Khi được bật, hệ thống sẽ tự động gửi thông báo nhắc học dựa theo cấu hình chi tiết bên dưới.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleUpdateField("enabled", !settings.enabled)}
            className="focus:outline-none shrink-0"
          >
            {settings.enabled ? (
              <ToggleRight className="w-12 h-12 text-red-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-zinc-600" />
            )}
          </button>
        </div>

        {/* Main Settings Container (grayed out if disabled) */}
        <div className={`space-y-6 transition-all duration-300 ${!settings.enabled ? "opacity-40 pointer-events-none" : ""}`}>
          
          {/* Section 1: Time, Type, Frequency */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <span>Thiết lập chung</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reminder Time */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Giờ nhắc nhở</span>
                </label>
                <input
                  type="time"
                  required
                  value={settings.reminderTime}
                  onChange={(e) => handleUpdateField("reminderTime", e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Reminder Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kênh nhận tin</span>
                </label>
                <select
                  value={settings.reminderType}
                  onChange={(e) => handleUpdateField("reminderType", e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                >
                  <option value="push" className="bg-[#0d0d14]">Thông báo duyệt (Push)</option>
                  <option value="email" className="bg-[#0d0d14]">Hòm thư điện tử (Email)</option>
                  <option value="both" className="bg-[#0d0d14]">Cả hai kênh (Push + Email)</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tần suất nhắc nhở</span>
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) => handleUpdateField("frequency", e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                >
                  <option value="daily" className="bg-[#0d0d14]">Hàng ngày (Daily)</option>
                  <option value="weekly" className="bg-[#0d0d14]">Hàng tuần (Weekly)</option>
                </select>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Thông điệp nhắc nhở tự soạn</span>
              </label>
              <input
                type="text"
                required
                value={settings.customMessage}
                onChange={(e) => handleUpdateField("customMessage", e.target.value)}
                placeholder="Câu nói động lực thúc đẩy học tập..."
                className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Section 2: Specific Notification Triggers (Toggles) */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <span>Sự kiện áp dụng thông báo</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily tasks */}
              <div className="flex justify-between items-center bg-zinc-900/10 p-4 border border-zinc-800/50 rounded-xl hover:border-zinc-800 transition">
                <div className="space-y-0.5 max-w-[80%]">
                  <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Nhiệm vụ tự chọn ngày</span>
                  </h5>
                  <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                    Nhắc nhở học tập khi có các đầu việc tự học To-do chưa hoàn thành.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateField("tasksEnabled", !settings.tasksEnabled)}
                  className="focus:outline-none shrink-0"
                >
                  {settings.tasksEnabled ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-700" />
                  )}
                </button>
              </div>

              {/* Reviews due */}
              <div className="flex justify-between items-center bg-zinc-900/10 p-4 border border-zinc-800/50 rounded-xl hover:border-zinc-800 transition">
                <div className="space-y-0.5 max-w-[80%]">
                  <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ôn tập từ vựng & ngữ pháp</span>
                  </h5>
                  <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                    Nhắc nhở khi có từ vựng đến hạn ôn tập định kỳ (Spaced Repetition).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateField("reviewsEnabled", !settings.reviewsEnabled)}
                  className="focus:outline-none shrink-0"
                >
                  {settings.reviewsEnabled ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-700" />
                  )}
                </button>
              </div>

              {/* Tests enabled */}
              <div className="flex justify-between items-center bg-zinc-900/10 p-4 border border-zinc-800/50 rounded-xl hover:border-zinc-800 transition">
                <div className="space-y-0.5 max-w-[80%]">
                  <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Đề thi thử TOEIC</span>
                  </h5>
                  <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                    Nhắc nhở làm bài thi thử theo lịch trình thi thử hàng tuần.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateField("testsEnabled", !settings.testsEnabled)}
                  className="focus:outline-none shrink-0"
                >
                  {settings.testsEnabled ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-700" />
                  )}
                </button>
              </div>

              {/* Streak maintenance */}
              <div className="flex justify-between items-center bg-zinc-900/10 p-4 border border-zinc-800/50 rounded-xl hover:border-zinc-800 transition">
                <div className="space-y-0.5 max-w-[80%]">
                  <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Duy trì chuỗi học (Streak)</span>
                  </h5>
                  <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                    Nhắc học đột xuất vào buổi tối nếu hôm nay bạn chưa làm bài để bảo vệ streak.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateField("streakEnabled", !settings.streakEnabled)}
                  className="focus:outline-none shrink-0"
                >
                  {settings.streakEnabled ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-700" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Snooze Settings / Action */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>Hoãn nhắc nhở nhanh (Snooze option)</span>
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                Nếu thông báo đang đổ chuông hoặc bạn đang bận học việc khác, bạn có thể lựa chọn hoãn nhanh buổi học hiện tại thêm vài phút.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <div className="space-y-1.5 shrink-0">
                <label className="text-[9px] text-zinc-500 font-bold uppercase">Số phút hoãn mặc định</label>
                <select
                  value={settings.snoozeMinutes}
                  onChange={(e) => handleUpdateField("snoozeMinutes", parseInt(e.target.value))}
                  className="w-[120px] bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 block"
                >
                  <option value="5" className="bg-[#0d0d14]">5 phút</option>
                  <option value="10" className="bg-[#0d0d14]">10 phút</option>
                  <option value="15" className="bg-[#0d0d14]">15 phút</option>
                  <option value="30" className="bg-[#0d0d14]">30 phút</option>
                </select>
              </div>

              <div className="h-10 w-[1px] bg-zinc-850 mx-2 hidden md:block"></div>

              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">Hoãn nhanh buổi học hiện tại</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSnooze(10)}
                    className="px-3.5 py-2 bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
                  >
                    +10p
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(15)}
                    className="px-3.5 py-2 bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
                  >
                    +15p
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(30)}
                    className="px-3.5 py-2 bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
                  >
                    +30p
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Action button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800/40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/10"
          >
            <span>{saving ? "Đang lưu cấu hình..." : "Lưu cài đặt nhắc nhở"}</span>
          </button>
        </div>
      </form>

      {/* --- SIMULATED BROWSER PUSH NOTIFICATION POPUP --- */}
      {testNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-[#0d0d14]/95 border-2 border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-10 duration-300">
          <button
            onClick={() => setTestNotification(null)}
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <h4 className="text-xs font-bold text-white truncate">{testNotification.title}</h4>
                <span className="text-[8px] text-zinc-500 font-bold uppercase shrink-0">Bây giờ</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal font-semibold">
                {testNotification.body}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[8px] font-bold text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded uppercase">
                  Kênh: {testNotification.type === "push" ? "Browser Push" : testNotification.type === "email" ? "Email Alert" : "Both"}
                </span>
                <span className="text-[8px] font-bold text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded uppercase">
                  Lịch: {testNotification.time}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d0d14] border border-zinc-800/80 rounded-xl px-4 py-3 shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}
