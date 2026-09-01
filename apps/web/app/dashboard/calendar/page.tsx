"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Globe,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  BookA,
  Headphones,
  FileText,
  ClipboardList,
  Layers,
  ChevronRight,
  ShieldCheck,
  ListTodo,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface StudyEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  recurrenceRule: string;
  category: string;
  color: string;
}

export default function CalendarIntegrationPage() {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [syncUrls, setSyncUrls] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Settings
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [syncCategories, setSyncCategories] = useState({
    vocab: true,
    listening: true,
    reading: true,
    mockTest: true,
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsRes, urlsRes] = await Promise.all([
        apiFetch<{ success: boolean; events: StudyEvent[] }>("/calendar/events"),
        apiFetch<{ success: boolean; urls: any }>("/calendar/sync-urls"),
      ]);

      if (eventsRes.success) setEvents(eventsRes.events || []);
      if (urlsRes.success) setSyncUrls(urlsRes.urls);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải dữ liệu lịch", "error");
    } finally {
      setLoading(false);
    }
  };

  // 1. Google Calendar Sync
  const handleOpenGoogleCalendar = (customEvent?: StudyEvent) => {
    if (customEvent) {
      const title = encodeURIComponent(customEvent.title);
      const details = encodeURIComponent(customEvent.description);
      const location = encodeURIComponent(customEvent.location);
      const start = customEvent.startDate.replace(/[-:]/g, "").split(".")[0] + "Z";
      const end = customEvent.endDate.replace(/[-:]/g, "").split(".")[0] + "Z";
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
      window.open(url, "_blank");
    } else if (syncUrls?.googleCalendarUrl) {
      window.open(syncUrls.googleCalendarUrl, "_blank");
    }
    showToast("Đã mở Google Calendar để thêm lịch học!", "success");
  };

  // 2. Outlook Calendar Sync
  const handleOpenOutlookCalendar = (customEvent?: StudyEvent) => {
    if (customEvent) {
      const title = encodeURIComponent(customEvent.title);
      const details = encodeURIComponent(customEvent.description);
      const location = encodeURIComponent(customEvent.location);
      const start = customEvent.startDate.slice(0, 19);
      const end = customEvent.endDate.slice(0, 19);
      const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${start}&enddt=${end}`;
      window.open(url, "_blank");
    } else if (syncUrls?.outlookCalendarUrl) {
      window.open(syncUrls.outlookCalendarUrl, "_blank");
    }
    showToast("Đã mở Microsoft Outlook để thêm lịch học!", "success");
  };

  // 3. Apple Calendar Sync
  const handleCopyAppleWebcal = () => {
    if (syncUrls?.appleWebcalUrl) {
      navigator.clipboard.writeText(syncUrls.appleWebcalUrl);
      setCopiedUrl(true);
      showToast("Đã sao chép liên kết Apple Calendar Feed (webcal://)!", "success");
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  // 4. Export to iCal (.ics)
  const handleDownloadIcs = () => {
    window.open("http://localhost:3001/calendar/export-ics", "_blank");
    showToast("Đang tải xuống file toeic_study_schedule.ics...", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Sub-tab Navigation */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1 max-w-md">
        <Link
          href="/dashboard/schedule"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Lịch biểu tuần</span>
        </Link>
        <Link
          href="/dashboard/planner"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Kế hoạch ngày</span>
        </Link>
        <Link
          href="/dashboard/calendar"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-red-600 text-white shadow-md transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Đồng bộ Lịch</span>
        </Link>
      </div>

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
            <CalendarIcon className="w-6 h-6 text-red-400" />
            <span>Tích Hợp Đồng Bộ Lịch Học</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Đồng bộ hóa lịch ôn thi và nhắc học tự động với Google Calendar, Microsoft Outlook, Apple Calendar hoặc tải file iCal (.ics).
          </p>
        </div>

        <button
          onClick={loadCalendarData}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm Mới Lịch</span>
        </button>
      </div>

      {/* 4 SYNC PROVIDERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Google Calendar */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg">
              G
            </div>
            <h3 className="text-sm font-bold text-white">1. Google Calendar</h3>
            <p className="text-xs text-zinc-400">
              Thêm lịch học TOEIC hàng ngày trực tiếp vào tài khoản Google và nhận thông báo trên điện thoại Android/iOS.
            </p>
          </div>

          <button
            onClick={() => handleOpenGoogleCalendar()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Thêm Vào Google Calendar</span>
          </button>
        </div>

        {/* 2. Microsoft Outlook */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-lg">
              O
            </div>
            <h3 className="text-sm font-bold text-white">2. Microsoft Outlook</h3>
            <p className="text-xs text-zinc-400">
              Đồng bộ lịch ôn thi TOEIC vào tài khoản Microsoft Outlook, Office 365 và ứng dụng Outlook trên Windows/Mac.
            </p>
          </div>

          <button
            onClick={() => handleOpenOutlookCalendar()}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Thêm Vào Outlook</span>
          </button>
        </div>

        {/* 3. Apple Calendar */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-lg">
              
            </div>
            <h3 className="text-sm font-bold text-white">3. Apple Calendar</h3>
            <p className="text-xs text-zinc-400">
              Đăng ký luồng sự kiện (Webcal Feed Subscription) tự động cập nhật lịch ôn tập trên iPhone, iPad và macOS.
            </p>
          </div>

          <button
            onClick={handleCopyAppleWebcal}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? "Đã Sao Chép Link!" : "Sao Chép Webcal Feed"}</span>
          </button>
        </div>

        {/* 4. Export to iCal */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
              .ICS
            </div>
            <h3 className="text-sm font-bold text-white">4. Xuất File iCal (.ics)</h3>
            <p className="text-xs text-zinc-400">
              Tải file iCalendar chuẩn RFC 5545 chứa toàn bộ sự kiện học tập để import vào bất kỳ ứng dụng lịch nào.
            </p>
          </div>

          <button
            onClick={handleDownloadIcs}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Xuống File .ICS</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED LEARNING SESSIONS LIST */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span>Danh Sách Phiên Học & Lịch Thi Đã Lên Kế Hoạch ({events.length})</span>
          </h3>

          <span className="text-xs text-zinc-500">Tự động đồng bộ theo lộ trình Chặng học hiện tại</span>
        </div>

        <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Đang tải lịch học...</div>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        evt.category === "Vocabulary"
                          ? "bg-red-950/50 text-red-400 border border-red-500/20"
                          : evt.category === "Listening"
                          ? "bg-blue-950/50 text-blue-400 border border-blue-500/20"
                          : evt.category === "Mock Test"
                          ? "bg-amber-950/50 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-950/50 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {evt.category}
                    </span>
                    <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                  </div>
                  <p className="text-zinc-400">{evt.description}</p>
                  <span className="text-[11px] text-zinc-500 block">
                    Quy tắc lặp lại: {evt.recurrenceRule} • Nhắc trước {reminderMinutes} phút
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenGoogleCalendar(evt)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    + Google
                  </button>
                  <button
                    onClick={() => handleOpenOutlookCalendar(evt)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    + Outlook
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SYNC PREFERENCES & SETUP GUIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Preferences */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Tùy Chọn Nhắc Nhở & Lọc Sự Kiện</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">Thời gian nhận thông báo nhắc nhở trước</label>
              <select
                value={reminderMinutes}
                onChange={(e) => {
                  setReminderMinutes(Number(e.target.value));
                  showToast(`Đã đổi thời gian nhắc nhở thành ${e.target.value} phút trước!`);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white"
              >
                <option value={5}>5 phút trước</option>
                <option value={15}>15 phút trước (Khuyên dùng)</option>
                <option value={30}>30 phút trước</option>
                <option value={60}>1 tiếng trước</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <span className="font-semibold text-zinc-300 block">Chọn loại hoạt động cần đồng bộ:</span>
              <div className="space-y-2 divide-y divide-zinc-900">
                {[
                  { key: "vocab", label: "Phiên ôn từ vựng hàng ngày (Daily Vocab Drill)" },
                  { key: "listening", label: "Phiên luyện nghe phản xạ Listening" },
                  { key: "reading", label: "Phiên luyện đọc hiểu Reading" },
                  { key: "mockTest", label: "Kỳ thi thử trực tuyến Weekly Mock Contest" },
                ].map((item) => (
                  <label key={item.key} className="pt-2 flex items-center justify-between text-zinc-300 cursor-pointer">
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(syncCategories as any)[item.key]}
                      onChange={(e) =>
                        setSyncCategories({ ...syncCategories, [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 accent-red-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hướng Dẫn Cài Đặt Lên Thiết Bị</span>
          </h3>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">iPhone / iPad (Apple Calendar):</span>
              <p className="text-[11px] text-zinc-400">
                Mở <strong>Cài đặt &rarr; Lịch &rarr; Tài khoản &rarr; Thêm tài khoản &rarr; Khác &rarr; Thêm Lịch Đã Đăng Ký</strong>, sau đó dán liên kết <strong>Webcal Feed</strong> đã sao chép ở trên.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">Android (Google Calendar):</span>
              <p className="text-[11px] text-zinc-400">
                Nhấn nút <strong>"Thêm Vào Google Calendar"</strong> để tự động mở ứng dụng Google Calendar và bấm lưu sự kiện lặp lại hàng ngày.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="font-bold text-white block">Notion / Thunderbird / Ứng dụng khác:</span>
              <p className="text-[11px] text-zinc-400">
                Tải file <strong>.ICS</strong> và kéo thả trực tiếp vào bảng lịch của bạn để nhập toàn bộ thời khóa biểu ôn thi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
