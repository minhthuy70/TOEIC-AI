"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  BookOpen,
  Clock,
  Gauge,
  Layers,
  Repeat,
  Volume2,
  Monitor,
  Timer,
  FastForward,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Sparkles,
  Sliders,
  Flame,
  Target,
  FileText,
  Headphones,
  Check,
  Zap,
  Palette,
  Sun,
  Moon,
  Type,
  Eye,
  Contrast,
  Activity,
  Award,
} from "lucide-react";

interface StudySettingsData {
  dailyGoals: {
    dailyVocab: number;
    dailyListeningMinutes: number;
    dailyReadingMinutes: number;
    weeklyMockTests: number;
  };
  studyTime: {
    targetDailyMinutes: number;
    preferredTimeSlot: string;
    reminderTime: string;
  };
  difficulty: {
    level: string;
    targetScore: number;
    currentScore: number;
    adaptiveAiEnabled: boolean;
  };
  content: {
    focusArea: string;
    weakPartFocus: boolean;
    includeBusinessVocab: boolean;
    grammarTrapFocus: boolean;
  };
  srs: {
    intervalModifier: number;
    maxCardsPerSession: number;
    reviewIntervals: string;
    autoScheduleReviews: boolean;
  };
  audio: {
    speechRate: number;
    voiceAccent: string;
    autoPlayAudio: boolean;
    soundEffects: boolean;
  };
  display: {
    fontSize: string;
    compactMode: boolean;
    showInstantTranslation: boolean;
    highlightKeywords: boolean;
    darkMode: boolean;
  };
  timer: {
    enabled: boolean;
    warnRemainingMinutes: number;
    autoSubmitOnTimeOut: boolean;
    showCountdown: boolean;
  };
  autoAdvance: {
    enabled: boolean;
    delaySeconds: number;
    autoPlayNextAudio: boolean;
  };
}

interface AppearanceSettingsData {
  theme: "dark" | "light" | "custom";
  fontSize: "sm" | "md" | "lg" | "xl";
  fontFamily: "inter" | "jakarta" | "vietnam" | "roboto" | "system";
  colorScheme: "ruby" | "blue" | "purple" | "emerald" | "amber";
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  highContrast: boolean;
  reduceMotion: boolean;
}

const DEFAULT_STUDY_SETTINGS: StudySettingsData = {
  dailyGoals: {
    dailyVocab: 20,
    dailyListeningMinutes: 20,
    dailyReadingMinutes: 20,
    weeklyMockTests: 1,
  },
  studyTime: {
    targetDailyMinutes: 30,
    preferredTimeSlot: "evening",
    reminderTime: "20:00",
  },
  difficulty: {
    level: "adaptive",
    targetScore: 750,
    currentScore: 450,
    adaptiveAiEnabled: true,
  },
  content: {
    focusArea: "all",
    weakPartFocus: true,
    includeBusinessVocab: true,
    grammarTrapFocus: true,
  },
  srs: {
    intervalModifier: 1.0,
    maxCardsPerSession: 25,
    reviewIntervals: "1,3,7,14,30",
    autoScheduleReviews: true,
  },
  audio: {
    speechRate: 1.0,
    voiceAccent: "us",
    autoPlayAudio: true,
    soundEffects: true,
  },
  display: {
    fontSize: "md",
    compactMode: false,
    showInstantTranslation: true,
    highlightKeywords: true,
    darkMode: true,
  },
  timer: {
    enabled: true,
    warnRemainingMinutes: 5,
    autoSubmitOnTimeOut: true,
    showCountdown: true,
  },
  autoAdvance: {
    enabled: true,
    delaySeconds: 1.5,
    autoPlayNextAudio: true,
  },
};

const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettingsData = {
  theme: "dark",
  fontSize: "md",
  fontFamily: "inter",
  colorScheme: "ruby",
  backgroundColor: "#09090b",
  textColor: "#ffffff",
  accentColor: "#dc2626",
  highContrast: false,
  reduceMotion: false,
};

const STUDY_SECTIONS = [
  { id: "dailyGoals", label: "Mục tiêu ngày", icon: Target },
  { id: "studyTime", label: "Thời gian học", icon: Clock },
  { id: "difficulty", label: "Độ khó & AI", icon: Gauge },
  { id: "content", label: "Trọng tâm nội dung", icon: Layers },
  { id: "srs", label: "Hệ thống SRS", icon: Repeat },
  { id: "audio", label: "Âm thanh & Giọng đọc", icon: Volume2 },
  { id: "display", label: "Hiển thị & Giao diện", icon: Monitor },
  { id: "timer", label: "Đồng hồ & Thi thử", icon: Timer },
  { id: "autoAdvance", label: "Tự động chuyển câu", icon: FastForward },
];

const COLOR_SCHEMES = [
  { id: "ruby", name: "Đỏ Ruby (Mặc định)", hex: "#dc2626", border: "border-red-500", bg: "bg-red-600" },
  { id: "blue", name: "Xanh Royal", hex: "#2563eb", border: "border-blue-500", bg: "bg-blue-600" },
  { id: "purple", name: "Tím Nebula", hex: "#9333ea", border: "border-purple-500", bg: "bg-purple-600" },
  { id: "emerald", name: "Xanh Ngọc", hex: "#059669", border: "border-emerald-500", bg: "bg-emerald-600" },
  { id: "amber", name: "Vàng Hổ Phách", hex: "#d97706", border: "border-amber-500", bg: "bg-amber-600" },
];

const BACKGROUND_PRESETS = [
  { id: "deep", name: "Deep Black (OLED)", hex: "#09090b" },
  { id: "midnight", name: "Midnight Zinc", hex: "#111827" },
  { id: "slate", name: "Dark Slate", hex: "#0f172a" },
  { id: "charcoal", name: "Charcoal Dark", hex: "#18181b" },
];

export default function SettingsHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"study" | "appearance">("study");

  // Study Settings State
  const [studySettings, setStudySettings] = useState<StudySettingsData>(DEFAULT_STUDY_SETTINGS);
  const [activeStudySection, setActiveStudySection] = useState("all");

  // Appearance Settings State
  const [appearance, setAppearance] = useState<AppearanceSettingsData>(DEFAULT_APPEARANCE_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const [studyRes, appRes] = await Promise.all([
        apiFetch<{ success: boolean; data: StudySettingsData }>("/profile/study-settings"),
        apiFetch<{ success: boolean; data: AppearanceSettingsData }>("/profile/appearance-settings"),
      ]);

      if (studyRes.success && studyRes.data) {
        setStudySettings({
          ...DEFAULT_STUDY_SETTINGS,
          ...studyRes.data,
          dailyGoals: { ...DEFAULT_STUDY_SETTINGS.dailyGoals, ...studyRes.data.dailyGoals },
          studyTime: { ...DEFAULT_STUDY_SETTINGS.studyTime, ...studyRes.data.studyTime },
          difficulty: { ...DEFAULT_STUDY_SETTINGS.difficulty, ...studyRes.data.difficulty },
          content: { ...DEFAULT_STUDY_SETTINGS.content, ...studyRes.data.content },
          srs: { ...DEFAULT_STUDY_SETTINGS.srs, ...studyRes.data.srs },
          audio: { ...DEFAULT_STUDY_SETTINGS.audio, ...studyRes.data.audio },
          display: { ...DEFAULT_STUDY_SETTINGS.display, ...studyRes.data.display },
          timer: { ...DEFAULT_STUDY_SETTINGS.timer, ...studyRes.data.timer },
          autoAdvance: { ...DEFAULT_STUDY_SETTINGS.autoAdvance, ...studyRes.data.autoAdvance },
        });
      }

      if (appRes.success && appRes.data) {
        setAppearance({
          ...DEFAULT_APPEARANCE_SETTINGS,
          ...appRes.data,
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudySettings = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/study-settings", {
        method: "PUT",
        body: JSON.stringify(studySettings),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt học tập thành công!");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu cài đặt học tập", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearanceSettings = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/appearance-settings", {
        method: "PUT",
        body: JSON.stringify(appearance),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt giao diện thành công!");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu cài đặt giao diện", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Feedback */}
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
            <Sliders className="w-6 h-6 text-red-400" />
            <span>Trung Tâm Cài Đặt Hệ Thống</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tùy biến mục tiêu học tập (13.2) và phong cách giao diện hiển thị (13.3)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "study") {
                setStudySettings(DEFAULT_STUDY_SETTINGS);
                showToast("Đã khôi phục cài đặt học tập mặc định");
              } else {
                setAppearance(DEFAULT_APPEARANCE_SETTINGS);
                showToast("Đã khôi phục cài đặt giao diện mặc định");
              }
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
          <button
            onClick={() => (activeTab === "study" ? handleSaveStudySettings() : handleSaveAppearanceSettings())}
            disabled={saving}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu Cài Đặt"}</span>
          </button>
        </div>
      </div>

      {/* Master Tabs: Study (13.2) vs Appearance (13.3) */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("study")}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "study"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Cài Đặt Học Tập (13.2)</span>
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "appearance"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Cài Đặt Giao Diện (13.3)</span>
        </button>
      </div>

      {/* TAB 1: STUDY SETTINGS (13.2) */}
      {activeTab === "study" && (
        <div className="space-y-6">
          {/* Navigation Filter Chips */}
          <div className="flex overflow-x-auto gap-1 pb-1">
            <button
              onClick={() => setActiveStudySection("all")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeStudySection === "all"
                  ? "bg-red-600/10 text-red-400 border border-red-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              Tất cả cài đặt (9 mục)
            </button>
            {STUDY_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeStudySection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveStudySection(sec.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-red-600/10 text-red-400 border border-red-500/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. Daily Goals */}
          {(activeStudySection === "all" || activeStudySection === "dailyGoals") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">1. Cấu hình mục tiêu hàng ngày (Daily goals)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Thiết lập chỉ tiêu từ vựng, thời lượng luyện tập và bài kiểm tra để duy trì chuỗi Streak.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Từ vựng mới / ngày</span>
                  <div className="text-xl font-bold text-white">{studySettings.dailyGoals.dailyVocab} từ</div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={studySettings.dailyGoals.dailyVocab}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        dailyGoals: { ...studySettings.dailyGoals, dailyVocab: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Luyện nghe Listening</span>
                  <div className="text-xl font-bold text-white">{studySettings.dailyGoals.dailyListeningMinutes} phút</div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={studySettings.dailyGoals.dailyListeningMinutes}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        dailyGoals: {
                          ...studySettings.dailyGoals,
                          dailyListeningMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Luyện đọc Reading</span>
                  <div className="text-xl font-bold text-white">{studySettings.dailyGoals.dailyReadingMinutes} phút</div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={studySettings.dailyGoals.dailyReadingMinutes}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        dailyGoals: { ...studySettings.dailyGoals, dailyReadingMinutes: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Thi thử Mock Test</span>
                  <div className="text-xl font-bold text-white">{studySettings.dailyGoals.weeklyMockTests} đề / tuần</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={studySettings.dailyGoals.weeklyMockTests}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        dailyGoals: { ...studySettings.dailyGoals, weeklyMockTests: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Study Time */}
          {(activeStudySection === "all" || activeStudySection === "studyTime") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">2. Ưa thích thời gian học (Study time)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Lựa chọn thời lượng học mục tiêu và khung giờ vàng trong ngày.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Thời lượng học mỗi ngày (Phút)
                  </label>
                  <select
                    value={studySettings.studyTime.targetDailyMinutes}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        studyTime: {
                          ...studySettings.studyTime,
                          targetDailyMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    {[15, 20, 30, 45, 60, 90, 120].map((t) => (
                      <option key={t} value={t}>
                        {t} phút / ngày
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Khung giờ học ưa thích
                  </label>
                  <select
                    value={studySettings.studyTime.preferredTimeSlot}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        studyTime: { ...studySettings.studyTime, preferredTimeSlot: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value="morning">Sáng sớm (06:00 - 09:00)</option>
                    <option value="afternoon">Chiều (14:00 - 17:00)</option>
                    <option value="evening">Tối (19:00 - 22:00)</option>
                    <option value="night">Đêm muộn (22:00 - 01:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Giờ nhắc học tập cố định
                  </label>
                  <input
                    type="time"
                    value={studySettings.studyTime.reminderTime}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        studyTime: { ...studySettings.studyTime, reminderTime: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Difficulty */}
          {(activeStudySection === "all" || activeStudySection === "difficulty") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">3. Ưa thích độ khó & Adaptive AI</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tự động cá nhân hóa độ khó theo thuật toán Adaptive AI hoặc chọn mức mục tiêu cố định.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>Độ khó thích ứng AI (Adaptive Difficulty)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Hệ thống tự động điều chỉnh độ khó bài tập dựa trên tỷ lệ làm đúng của bạn.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        difficulty: {
                          ...studySettings.difficulty,
                          adaptiveAiEnabled: !studySettings.difficulty.adaptiveAiEnabled,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      studySettings.difficulty.adaptiveAiEnabled ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.difficulty.adaptiveAiEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Band điểm TOEIC mục tiêu
                    </label>
                    <select
                      value={studySettings.difficulty.targetScore}
                      onChange={(e) =>
                        setStudySettings({
                          ...studySettings,
                          difficulty: {
                            ...studySettings.difficulty,
                            targetScore: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                    >
                      {[450, 550, 650, 750, 850, 900, 950, 990].map((s) => (
                        <option key={s} value={s}>
                          Mục tiêu: {s}+ Điểm
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Phân loại mức độ đề bài
                    </label>
                    <select
                      value={studySettings.difficulty.level}
                      onChange={(e) =>
                        setStudySettings({
                          ...studySettings,
                          difficulty: { ...studySettings.difficulty, level: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                    >
                      <option value="adaptive">Tự động thích ứng (Khuyên dùng)</option>
                      <option value="beginner">Cơ bản (350 - 500 điểm)</option>
                      <option value="intermediate">Trung cấp (550 - 700 điểm)</option>
                      <option value="advanced">Nâng cao (750 - 900 điểm)</option>
                      <option value="master">Chinh phục 900+ (Cực khó)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Content */}
          {(activeStudySection === "all" || activeStudySection === "content") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">4. Ưa thích nội dung (Content)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tập trung luyện sâu các phần kỹ năng còn yếu hoặc ưu tiên chủ đề từ vựng chuyên ngành.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Tập trung cải thiện phần còn yếu</h3>
                    <p className="text-xs text-zinc-400">AI tự động ưu tiên xuất hiện các câu hỏi thuộc Part bạn hay sai nhất</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        content: {
                          ...studySettings.content,
                          weakPartFocus: !studySettings.content.weakPartFocus,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      studySettings.content.weakPartFocus ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.content.weakPartFocus ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Ưu tiên từ vựng kinh doanh & thương mại (Business TOEIC)</h3>
                    <p className="text-xs text-zinc-400">Tăng tỷ trọng từ vựng văn phòng, hợp đồng, tài chính</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        content: {
                          ...studySettings.content,
                          includeBusinessVocab: !studySettings.content.includeBusinessVocab,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      studySettings.content.includeBusinessVocab ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.content.includeBusinessVocab ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. SRS */}
          {(activeStudySection === "all" || activeStudySection === "srs") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">5. Cài đặt SRS (Spaced Repetition)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cấu hình thuật toán lặp lại ngắt quãng để ghi nhớ từ vựng lâu dài.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Số thẻ tối đa mỗi phiên ôn tập</span>
                  <select
                    value={studySettings.srs.maxCardsPerSession}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        srs: { ...studySettings.srs, maxCardsPerSession: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value={15}>15 thẻ / phiên</option>
                    <option value={25}>25 thẻ / phiên (Khuyên dùng)</option>
                    <option value={35}>35 thẻ / phiên</option>
                    <option value={50}>50 thẻ / phiên</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Chu kỳ lặp lại (Ngày)</span>
                  <input
                    type="text"
                    value={studySettings.srs.reviewIntervals}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        srs: { ...studySettings.srs, reviewIntervals: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                    placeholder="1,3,7,14,30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. Audio */}
          {(activeStudySection === "all" || activeStudySection === "audio") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">6. Cài đặt âm thanh (Audio)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tùy chỉnh tốc độ giọng đọc đề thi, accent bản xứ và hiệu ứng âm thanh.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Tốc độ giọng đọc (Playback Rate)
                  </label>
                  <select
                    value={studySettings.audio.speechRate}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        audio: { ...studySettings.audio, speechRate: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value={0.75}>0.75x (Chậm - Cho người mới)</option>
                    <option value={0.9}>0.9x (Hơi chậm)</option>
                    <option value={1.0}>1.0x (Chuẩn thi thật)</option>
                    <option value={1.1}>1.1x (Nhanh vừa)</option>
                    <option value={1.25}>1.25x (Thử thách tốc độ cao)</option>
                    <option value={1.5}>1.5x (Cực nhanh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Giọng đọc ưu tiên (Accent)
                  </label>
                  <select
                    value={studySettings.audio.voiceAccent}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        audio: { ...studySettings.audio, voiceAccent: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value="us">Giọng Mỹ (US Accent - Chiếm 60% đề thi)</option>
                    <option value="uk">Giọng Anh (UK Accent)</option>
                    <option value="au">Giọng Úc (Australian Accent)</option>
                    <option value="ca">Giọng Canada (Canadian Accent)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 7. Display */}
          {(activeStudySection === "all" || activeStudySection === "display") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">7. Cài đặt hiển thị bài học (Display)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tùy chỉnh cỡ chữ bài đọc Part 6-7 và highlight từ khóa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Cỡ chữ đoạn văn bài đọc
                  </label>
                  <select
                    value={studySettings.display.fontSize}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        display: { ...studySettings.display, fontSize: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value="sm">Nhỏ (13px)</option>
                    <option value="md">Vừa (15px - Tiêu chuẩn)</option>
                    <option value="lg">Lớn (17px)</option>
                    <option value="xl">Rất lớn (19px)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Highlight từ khóa quan trọng</h3>
                    <p className="text-xs text-zinc-400">Tự động bôi vàng từ khóa then chốt trong câu hỏi</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        display: {
                          ...studySettings.display,
                          highlightKeywords: !studySettings.display.highlightKeywords,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      studySettings.display.highlightKeywords ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.display.highlightKeywords ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. Timer */}
          {(activeStudySection === "all" || activeStudySection === "timer") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">8. Cài đặt đồng hồ (Timer)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Kiểm soát đồng hồ đếm ngược và tự động thu bài khi hết giờ.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Đồng hồ đếm ngược bài thi</h3>
                    <p className="text-xs text-zinc-400">Hiển thị thời gian còn lại chuẩn 120 phút trong bài thi thử</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        timer: {
                          ...studySettings.timer,
                          showCountdown: !studySettings.timer.showCountdown,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      studySettings.timer.showCountdown ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.timer.showCountdown ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Tự động nộp bài khi hết giờ</h3>
                    <p className="text-xs text-zinc-400">Tự động tính điểm ngay khi thời gian đếm ngược về 00:00</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        timer: {
                          ...studySettings.timer,
                          autoSubmitOnTimeOut: !studySettings.timer.autoSubmitOnTimeOut,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      studySettings.timer.autoSubmitOnTimeOut ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.timer.autoSubmitOnTimeOut ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. Auto-advance */}
          {(activeStudySection === "all" || activeStudySection === "autoAdvance") && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-400">
                  <FastForward className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">9. Cài đặt tự động chuyển câu (Auto-advance)</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tăng tốc độ làm bài bằng cách tự động nhảy sang câu hỏi tiếp theo ngay sau khi chọn đáp án.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Bật tự động chuyển câu</h3>
                    <p className="text-xs text-zinc-400">Chuyển ngay câu kế tiếp sau khi click chọn A/B/C/D</p>
                  </div>
                  <button
                    onClick={() =>
                      setStudySettings({
                        ...studySettings,
                        autoAdvance: {
                          ...studySettings.autoAdvance,
                          enabled: !studySettings.autoAdvance.enabled,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      studySettings.autoAdvance.enabled ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        studySettings.autoAdvance.enabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400">Độ trễ trước khi chuyển câu (Giây)</span>
                  <select
                    value={studySettings.autoAdvance.delaySeconds}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        autoAdvance: {
                          ...studySettings.autoAdvance,
                          delaySeconds: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value={0.5}>0.5 giây (Cực nhanh)</option>
                    <option value={1.0}>1.0 giây (Nhanh)</option>
                    <option value={1.5}>1.5 giây (Tiêu chuẩn)</option>
                    <option value={2.0}>2.0 giây (Để xem giải thích)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPEARANCE SETTINGS (13.3) */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span>Xem trước giao diện trực tiếp (Live Preview)</span>
              </h3>
              <span className="text-[11px] text-zinc-500">Cập nhật tức thì</span>
            </div>

            <div
              className={`p-5 rounded-xl border transition-all ${
                appearance.highContrast ? "border-2 border-white/60" : "border-zinc-800"
              }`}
              style={{
                backgroundColor: appearance.backgroundColor,
                color: appearance.textColor,
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: appearance.accentColor }}
                  />
                  <span className="text-xs font-bold">TOEIC Practice Card Preview</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                  style={{ backgroundColor: appearance.accentColor }}
                >
                  Score: 850+
                </span>
              </div>

              <div className="py-4 space-y-2">
                <h4
                  className={`font-bold leading-snug ${
                    appearance.fontSize === "sm"
                      ? "text-sm"
                      : appearance.fontSize === "md"
                      ? "text-base"
                      : appearance.fontSize === "lg"
                      ? "text-lg"
                      : "text-xl"
                  }`}
                >
                  The marketing department will{" "}
                  <span
                    className="px-1.5 py-0.5 rounded font-semibold text-white"
                    style={{ backgroundColor: appearance.accentColor }}
                  >
                    launch
                  </span>{" "}
                  the new campaign tomorrow.
                </h4>
                <p className="text-xs text-zinc-400">
                  Bản dịch: Phòng tiếp thị sẽ ra mắt chiến dịch mới vào ngày mai.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
                <span>Font: {appearance.fontFamily.toUpperCase()}</span>
                <span>Theme: {appearance.theme.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* 1. Theme Selection */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>1. Chọn chủ đề giao diện (Theme selection)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "dark", name: "Giao diện Tối (Dark)", icon: Moon, desc: "Bảo vệ mắt, tiết kiệm pin OLED" },
                { id: "light", name: "Giao diện Sáng (Light)", icon: Sun, desc: "Rõ ràng, thanh lịch ban ngày" },
                { id: "custom", name: "Tùy chỉnh (Custom)", icon: Palette, desc: "Tự do phối màu sắc theo sở thích" },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = appearance.theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() =>
                      setAppearance({
                        ...appearance,
                        theme: t.id as any,
                        backgroundColor: t.id === "light" ? "#f8fafc" : "#09090b",
                        textColor: t.id === "light" ? "#0f172a" : "#ffffff",
                      })
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-red-950/20 border-red-500/50"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-red-400" : "text-zinc-400"}`} />
                      {isSelected && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2 & 3. Font Size & Family */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-400" />
              <span>2 & 3. Cỡ chữ & Font chữ (Font size & Family)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Kích thước phông chữ (Font size)
                </label>
                <select
                  value={appearance.fontSize}
                  onChange={(e) => setAppearance({ ...appearance, fontSize: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="sm">Nhỏ (13px - Tiết kiệm không gian)</option>
                  <option value="md">Tiêu chuẩn (15px - Khuyên dùng)</option>
                  <option value="lg">Lớn (17px - Dễ đọc hơn)</option>
                  <option value="xl">Cực lớn (19px - Trực quan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Phông chữ hiển thị (Font family)
                </label>
                <select
                  value={appearance.fontFamily}
                  onChange={(e) => setAppearance({ ...appearance, fontFamily: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="inter">Inter (Hiện đại, tối ưu màn hình)</option>
                  <option value="jakarta">Plus Jakarta Sans (Sắc nét)</option>
                  <option value="vietnam">Be Vietnam Pro (Chuẩn tiếng Việt)</option>
                  <option value="roboto">Roboto (Google Typography)</option>
                  <option value="system">System Default (Mặc định thiết bị)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4 & 7. Color Scheme & Accent Color */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>4 & 7. Lược màu & Màu nhấn chủ đạo (Color scheme & Accent)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {COLOR_SCHEMES.map((scheme) => {
                const isSelected = appearance.colorScheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() =>
                      setAppearance({
                        ...appearance,
                        colorScheme: scheme.id as any,
                        accentColor: scheme.hex,
                      })
                    }
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-zinc-800 border-white/60 shadow-md"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${scheme.bg} flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 text-center">{scheme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 & 6. Background Color & Text Color */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>5 & 6. Màu nền & Màu văn bản (Background & Text color)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Tông màu nền Dark Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setAppearance({ ...appearance, backgroundColor: bg.hex })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        appearance.backgroundColor === bg.hex
                          ? "border-red-500 bg-zinc-800 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" style={{ backgroundColor: bg.hex }} />
                      <span>{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Tông màu văn bản chính
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Pure White", hex: "#ffffff" },
                    { name: "Crisp Silver", hex: "#f4f4f5" },
                    { name: "Soft Gray", hex: "#d4d4d8" },
                  ].map((tc) => (
                    <button
                      key={tc.name}
                      onClick={() => setAppearance({ ...appearance, textColor: tc.hex })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        appearance.textColor === tc.hex
                          ? "border-red-500 bg-zinc-800 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tc.hex }} />
                      <span>{tc.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 8 & 9. High Contrast & Reduce Motion */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Contrast className="w-4 h-4 text-cyan-400" />
              <span>8 & 9. Trợ năng & Khả năng tiếp cận (Accessibility)</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Chế độ tương phản cao (High contrast mode)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tăng cường độ dày của viền và độ tương phản giữa văn bản với nền để dễ quan sát hơn.
                  </p>
                </div>
                <button
                  onClick={() => setAppearance({ ...appearance, highContrast: !appearance.highContrast })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    appearance.highContrast ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      appearance.highContrast ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Giảm chuyển động (Reduce motion)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tắt các hoạt ảnh chuyển trang và hiệu ứng phóng to/thu nhỏ giúp trải nghiệm mượt mà, ổn định.
                  </p>
                </div>
                <button
                  onClick={() => setAppearance({ ...appearance, reduceMotion: !appearance.reduceMotion })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    appearance.reduceMotion ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      appearance.reduceMotion ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md sticky bottom-4 flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Tất cả cài đặt sẽ được đồng bộ tức thì trên toàn bộ hệ thống</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "study") {
                setStudySettings(DEFAULT_STUDY_SETTINGS);
                showToast("Đã khôi phục cài đặt học tập mặc định");
              } else {
                setAppearance(DEFAULT_APPEARANCE_SETTINGS);
                showToast("Đã khôi phục cài đặt giao diện mặc định");
              }
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Khôi phục
          </button>
          <button
            onClick={() => (activeTab === "study" ? handleSaveStudySettings() : handleSaveAppearanceSettings())}
            disabled={saving}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
