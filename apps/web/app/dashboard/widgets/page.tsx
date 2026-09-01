"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  LayoutGrid,
  Target,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  BookA,
  BookOpen,
  ClipboardCheck,
  Headphones,
  FileText,
  Shield,
  Zap,
  ArrowUpRight,
  Sliders,
  Check,
  Maximize2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface WidgetsData {
  dailyProgress: {
    completedVocab: number;
    targetVocab: number;
    studyMinutes: number;
    targetMinutes: number;
    percentage: number;
    lastUpdated: string;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    freezeCount: number;
    todayCompleted: boolean;
    weekHistory: Array<{ day: string; completed: boolean }>;
  };
  reviewDue: {
    vocabDue: number;
    grammarDue: number;
    listeningDue: number;
    totalDue: number;
    nextReviewInHours: number;
  };
  quickActions: Array<{
    id: string;
    title: string;
    category: string;
    href: string;
    badge: string;
    icon: string;
  }>;
}

interface WidgetSettingsData {
  dailyProgressSize: "small" | "medium" | "large";
  streakSize: "small" | "medium" | "large";
  reviewDueSize: "small" | "medium" | "large";
  quickActionsSize: "small" | "medium" | "large";
  theme: string;
  colorAccent: string;
  showOnLockScreen: boolean;
}

const DEFAULT_WIDGET_DATA: WidgetsData = {
  dailyProgress: {
    completedVocab: 16,
    targetVocab: 20,
    studyMinutes: 28,
    targetMinutes: 30,
    percentage: 88,
    lastUpdated: new Date().toISOString(),
  },
  streak: {
    currentStreak: 14,
    longestStreak: 28,
    freezeCount: 2,
    todayCompleted: true,
    weekHistory: [
      { day: "T2", completed: true },
      { day: "T3", completed: true },
      { day: "T4", completed: true },
      { day: "T5", completed: true },
      { day: "T6", completed: true },
      { day: "T7", completed: true },
      { day: "CN", completed: true },
    ],
  },
  reviewDue: {
    vocabDue: 22,
    grammarDue: 5,
    listeningDue: 3,
    totalDue: 30,
    nextReviewInHours: 2,
  },
  quickActions: [
    {
      id: "action-mini-test",
      title: "Mini Test 50 Câu",
      category: "Mock Test",
      href: "/dashboard/mock-test/mini-test",
      badge: "25 phút",
      icon: "ClipboardCheck",
    },
    {
      id: "action-vocab-review",
      title: "Ôn 20 Thẻ Từ Vựng",
      category: "SRS Flashcard",
      href: "/dashboard/vocabulary",
      badge: "Đến hạn",
      icon: "BookA",
    },
    {
      id: "action-listening-part2",
      title: "Luyện Nghe Part 2",
      category: "Listening Drill",
      href: "/dashboard/listening/part-2",
      badge: "Phản xạ nhanh",
      icon: "Headphones",
    },
    {
      id: "action-reading-part5",
      title: "Luyện Đọc Part 5",
      category: "Grammar Trap",
      href: "/dashboard/reading/part-5",
      badge: "Bẫy đề thi",
      icon: "FileText",
    },
  ],
};

const DEFAULT_SETTINGS: WidgetSettingsData = {
  dailyProgressSize: "medium",
  streakSize: "small",
  reviewDueSize: "medium",
  quickActionsSize: "large",
  theme: "dark",
  colorAccent: "ruby",
  showOnLockScreen: true,
};

export default function WidgetsPage() {
  const [data, setData] = useState<WidgetsData>(DEFAULT_WIDGET_DATA);
  const [settings, setSettings] = useState<WidgetSettingsData>(DEFAULT_SETTINGS);
  const [selectedPreviewWidget, setSelectedPreviewWidget] = useState<"daily" | "streak" | "review" | "actions">("daily");
  const [previewSize, setPreviewSize] = useState<"small" | "medium" | "large">("medium");

  const [activeTab, setActiveTab] = useState<"gallery" | "simulator" | "install">("gallery");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dataRes, settingsRes] = await Promise.all([
        apiFetch<{ success: boolean; data: WidgetsData }>("/profile/widgets/data"),
        apiFetch<{ success: boolean; data: WidgetSettingsData }>("/profile/widgets/settings"),
      ]);

      if (dataRes.success && dataRes.data) {
        setData(dataRes.data);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
      }
    } catch (e) {
      console.error("Error loading widgets data:", e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/widgets/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt Widget thành công!");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu cài đặt", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
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
            <LayoutGrid className="w-6 h-6 text-red-400" />
            <span>Tiện Ích Màn Hình Chính (Widgets 14.3)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Theo dõi tiến độ, duy trì chuỗi Streak, nhắc nhở ôn tập và truy cập nhanh các bài thi ngay từ màn hình chính.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Lưu Cấu Hình Widget</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "gallery"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Bộ Sưu Tập 4 Widget</span>
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "simulator"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mô Phỏng Màn Hình Điện Thoại</span>
        </button>
        <button
          onClick={() => setActiveTab("install")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "install"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hướng Dẫn Cài Đặt iOS & Android</span>
        </button>
      </div>

      {/* TAB 1: 4 WIDGETS GALLERY */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Daily Progress Widget */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Tiện ích tiến độ hàng ngày (Daily progress)</h3>
                  <p className="text-[11px] text-zinc-500">Mục tiêu từ vựng & thời lượng học</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">Medium 4x2</span>
            </div>

            {/* Widget Card Render */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tiến Độ Hôm Nay</span>
                  <div className="text-2xl font-black text-white mt-0.5">{data.dailyProgress.percentage}% Hoàn thành</div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-red-500 flex items-center justify-center font-bold text-xs text-white">
                  {data.dailyProgress.percentage}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Từ vựng:</span>
                    <span className="font-bold text-white">
                      {data.dailyProgress.completedVocab}/{data.dailyProgress.targetVocab} từ
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${(data.dailyProgress.completedVocab / data.dailyProgress.targetVocab) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Thời gian:</span>
                    <span className="font-bold text-white">
                      {data.dailyProgress.studyMinutes}/{data.dailyProgress.targetMinutes}p
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${(data.dailyProgress.studyMinutes / data.dailyProgress.targetMinutes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Streak Widget */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">2. Tiện ích chuỗi học tập (Streak widget)</h3>
                  <p className="text-[11px] text-zinc-500">Ngọn lửa chuỗi ngày & bảo vệ chuỗi</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">Small / Medium</span>
            </div>

            {/* Widget Card Render */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg">
                    <Flame className="w-7 h-7 fill-red-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{data.streak.currentStreak} Ngày Liên Tục</div>
                    <p className="text-xs text-zinc-400">Kỷ lục dài nhất: {data.streak.longestStreak} ngày</p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>{data.streak.freezeCount} Khiên</span>
                </div>
              </div>

              {/* 7-Day History dots */}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/60">
                {data.streak.weekHistory.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.completed ? "bg-red-600 text-white shadow-sm" : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {item.completed ? "✓" : "•"}
                    </div>
                    <span className="text-[10px] text-zinc-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Review Due Widget */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">3. Tiện ích ôn tập đến hạn (Review due)</h3>
                  <p className="text-[11px] text-zinc-500">Thẻ SRS & bài tập đến hạn ôn</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">Medium 4x2</span>
            </div>

            {/* Widget Card Render */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
                    <span>{data.reviewDue.totalDue} Thẻ SRS</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {data.reviewDue.vocabDue} từ vựng • {data.reviewDue.grammarDue} ngữ pháp • {data.reviewDue.listeningDue} nghe
                  </p>
                </div>

                <Link
                  href="/dashboard/vocabulary"
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ôn Tập Ngay</span>
                </Link>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Chu kỳ lặp tiếp theo:</span>
                <span className="font-bold text-white">Sau {data.reviewDue.nextReviewInHours} giờ</span>
              </div>
            </div>
          </div>

          {/* 4. Quick Actions Widget */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">4. Tiện ích hành động nhanh (Quick actions)</h3>
                  <p className="text-[11px] text-zinc-500">Phím tắt luyện tập 1-click</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">Large 4x4</span>
            </div>

            {/* Widget Card Render */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
              <div className="grid grid-cols-2 gap-2.5">
                {data.quickActions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-red-500/50 transition-all flex flex-col justify-between h-20 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:text-red-400">
                        {action.badge}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                      {action.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE HOMESCREEN SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Side */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-400" />
                <span>Tùy Chọn Kích Thước Widget</span>
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400">Widget hiển thị trên màn hình mẫu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "daily", label: "Tiến độ ngày" },
                    { id: "streak", label: "Chuỗi Streak" },
                    { id: "review", label: "Ôn tập SRS" },
                    { id: "actions", label: "Hành động nhanh" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedPreviewWidget(w.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedPreviewWidget === w.id
                          ? "bg-red-950/30 border-red-500/50 text-red-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-zinc-400">Kích thước Widget</label>
                <div className="flex gap-2">
                  {[
                    { id: "small", label: "Nhỏ (2x2)" },
                    { id: "medium", label: "Vừa (4x2)" },
                    { id: "large", label: "Lớn (4x4)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPreviewSize(s.id as any)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        previewSize === s.id
                          ? "bg-red-600 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Phone Screen (Right 2 Cols) */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-[320px] rounded-[40px] border-4 border-zinc-700 bg-zinc-950 p-4 shadow-2xl space-y-4">
              {/* Phone Notch / Dynamic Island */}
              <div className="w-28 h-4 bg-zinc-800 rounded-full mx-auto" />

              {/* Status Header */}
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 px-2">
                <span>9:41</span>
                <span>5G 100%</span>
              </div>

              {/* Live Embedded Widget */}
              <div className="p-1">
                {selectedPreviewWidget === "daily" && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Tiến Độ TOEIC</span>
                    <div className="text-xl font-bold text-white">{data.dailyProgress.percentage}% Mục Tiêu</div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${data.dailyProgress.percentage}%` }} />
                    </div>
                  </div>
                )}

                {selectedPreviewWidget === "streak" && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <Flame className="w-8 h-8 text-red-500 fill-red-500 shrink-0" />
                    <div>
                      <div className="text-lg font-bold text-white">{data.streak.currentStreak} Ngày Chuỗi</div>
                      <p className="text-[10px] text-zinc-400">Đã hoàn thành hôm nay</p>
                    </div>
                  </div>
                )}

                {selectedPreviewWidget === "review" && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Ôn Tập Đến Hạn</span>
                    <div className="text-lg font-bold text-white">{data.reviewDue.totalDue} Thẻ SRS Cần Ôn</div>
                    <Link
                      href="/dashboard/vocabulary"
                      className="block text-center py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs"
                    >
                      Ôn Tập Ngay
                    </Link>
                  </div>
                )}

                {selectedPreviewWidget === "actions" && (
                  <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-zinc-900 border border-zinc-800">
                    {data.quickActions.slice(0, 4).map((a) => (
                      <div key={a.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-white">
                        {a.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample App Icons Grid */}
              <div className="grid grid-cols-4 gap-3 px-2 pt-4 border-t border-zinc-900">
                {["TOEIC AI", "Từ Vựng", "Luyện Nghe", "Thi Thử", "Ngữ Pháp", "Lịch Học", "Điểm", "Cài Đặt"].map((app, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-red-400">
                      {app.slice(0, 2)}
                    </div>
                    <span className="text-[9px] text-zinc-400 line-clamp-1">{app}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INSTALLATION GUIDE (iOS & Android) */}
      {activeTab === "install" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* iOS Guide */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                iOS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cài Đặt Widget Trên iPhone / iPad</h3>
                <p className="text-xs text-zinc-400">Hỗ trợ iOS 16, 17 và iOS 18+</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-zinc-300 list-decimal pl-4">
              <li>Mở trình duyệt Safari trên iPhone và đăng nhập vào hệ thống TOEIC AI.</li>
              <li>Nhấn vào biểu tượng Chia sẻ (Share) ở thanh dưới cùng và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.</li>
              <li>Quay lại Màn hình chính, chạm và giữ vào một vùng trống cho đến khi các ứng dụng rung lắc.</li>
              <li>Nhấn nút <strong>(+)</strong> ở góc trên bên trái, tìm kiếm <strong>"TOEIC AI"</strong>.</li>
              <li>Chọn kích thước Widget bạn muốn (Nhỏ, Vừa, Lớn) và nhấn <strong>"Thêm Tiện ích" (Add Widget)</strong>.</li>
            </ol>
          </div>

          {/* Android Guide */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                Android
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cài Đặt Widget Trên Android (Samsung, Xiaomi, Pixel)</h3>
                <p className="text-xs text-zinc-400">Hỗ trợ Android 12, 13 và Android 14+</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-zinc-300 list-decimal pl-4">
              <li>Mở trình duyệt Chrome và truy cập website TOEIC AI.</li>
              <li>Nhấn biểu tượng 3 chấm ở góc trên bên phải, chọn <strong>"Cài đặt ứng dụng" (Install app)</strong>.</li>
              <li>Trên màn hình chính, nhấn giữ vào khoảng trống và chọn mục <strong>"Tiện ích" (Widgets)</strong>.</li>
              <li>Cuộn tìm ứng dụng <strong>"TOEIC AI"</strong> và chọn Widget mong muốn.</li>
              <li>Kéo thả Widget vào vị trí yêu thích trên màn hình điện thoại.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
