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

const DEFAULT_SETTINGS: StudySettingsData = {
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

const SECTIONS = [
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

export default function StudySettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<StudySettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: StudySettingsData }>("/profile/study-settings");
      if (res.success && res.data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
          dailyGoals: { ...DEFAULT_SETTINGS.dailyGoals, ...res.data.dailyGoals },
          studyTime: { ...DEFAULT_SETTINGS.studyTime, ...res.data.studyTime },
          difficulty: { ...DEFAULT_SETTINGS.difficulty, ...res.data.difficulty },
          content: { ...DEFAULT_SETTINGS.content, ...res.data.content },
          srs: { ...DEFAULT_SETTINGS.srs, ...res.data.srs },
          audio: { ...DEFAULT_SETTINGS.audio, ...res.data.audio },
          display: { ...DEFAULT_SETTINGS.display, ...res.data.display },
          timer: { ...DEFAULT_SETTINGS.timer, ...res.data.timer },
          autoAdvance: { ...DEFAULT_SETTINGS.autoAdvance, ...res.data.autoAdvance },
        });
      }
    } catch (err) {
      console.error("Error loading study settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/study-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
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

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast("Đã khôi phục cài đặt học tập mặc định");
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
            <span>Cài Đặt Học Tập (13.2)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tối ưu hóa mục tiêu, độ khó, SRS, âm thanh, hiển thị, đồng hồ và tự động chuyển câu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu Cài Đặt"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Chips */}
      <div className="flex overflow-x-auto gap-1 pb-1 border-b border-zinc-800">
        <button
          onClick={() => setActiveSection("all")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeSection === "all"
              ? "bg-red-600/10 text-red-400 border border-red-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
          }`}
        >
          Tất cả cài đặt (9 mục)
        </button>
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
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

      {/* 1. DAILY GOALS CONFIGURATION */}
      {(activeSection === "all" || activeSection === "dailyGoals") && (
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
              <div className="text-xl font-bold text-white">{settings.dailyGoals.dailyVocab} từ</div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.dailyGoals.dailyVocab}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoals: { ...settings.dailyGoals, dailyVocab: Number(e.target.value) },
                  })
                }
                className="w-full accent-red-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400">Luyện nghe Listening</span>
              <div className="text-xl font-bold text-white">{settings.dailyGoals.dailyListeningMinutes} phút</div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={settings.dailyGoals.dailyListeningMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoals: { ...settings.dailyGoals, dailyListeningMinutes: Number(e.target.value) },
                  })
                }
                className="w-full accent-red-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400">Luyện đọc Reading</span>
              <div className="text-xl font-bold text-white">{settings.dailyGoals.dailyReadingMinutes} phút</div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={settings.dailyGoals.dailyReadingMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoals: { ...settings.dailyGoals, dailyReadingMinutes: Number(e.target.value) },
                  })
                }
                className="w-full accent-red-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400">Thi thử Mock Test</span>
              <div className="text-xl font-bold text-white">{settings.dailyGoals.weeklyMockTests} đề / tuần</div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={settings.dailyGoals.weeklyMockTests}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoals: { ...settings.dailyGoals, weeklyMockTests: Number(e.target.value) },
                  })
                }
                className="w-full accent-red-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDY TIME PREFERENCES */}
      {(activeSection === "all" || activeSection === "studyTime") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">2. Ưa thích thời gian học (Study time preferences)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Lựa chọn thời lượng học mục tiêu và khung giờ vàng tiếp thu kiến thức tốt nhất trong ngày.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Thời lượng học mỗi ngày (Phút)
              </label>
              <select
                value={settings.studyTime.targetDailyMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    studyTime: { ...settings.studyTime, targetDailyMinutes: Number(e.target.value) },
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
                value={settings.studyTime.preferredTimeSlot}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    studyTime: { ...settings.studyTime, preferredTimeSlot: e.target.value },
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
                value={settings.studyTime.reminderTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    studyTime: { ...settings.studyTime, reminderTime: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. DIFFICULTY PREFERENCES */}
      {(activeSection === "all" || activeSection === "difficulty") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">3. Ưa thích độ khó (Difficulty preferences)</h2>
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
                  Hệ thống tự động tăng/giảm độ khó bài tập dựa trên tỷ lệ làm đúng và thời gian trả lời của bạn.
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    difficulty: {
                      ...settings.difficulty,
                      adaptiveAiEnabled: !settings.difficulty.adaptiveAiEnabled,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  settings.difficulty.adaptiveAiEnabled ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.difficulty.adaptiveAiEnabled ? "translate-x-7" : "translate-x-1"
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
                  value={settings.difficulty.targetScore}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      difficulty: { ...settings.difficulty, targetScore: Number(e.target.value) },
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
                  value={settings.difficulty.level}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      difficulty: { ...settings.difficulty, level: e.target.value },
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

      {/* 4. CONTENT PREFERENCES */}
      {(activeSection === "all" || activeSection === "content") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">4. Ưa thích nội dung (Content preferences)</h2>
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
                  setSettings({
                    ...settings,
                    content: { ...settings.content, weakPartFocus: !settings.content.weakPartFocus },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.content.weakPartFocus ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.content.weakPartFocus ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Ưu tiên từ vựng kinh doanh & thương mại (Business TOEIC)</h3>
                <p className="text-xs text-zinc-400">Tăng tỷ trọng từ vựng văn phòng, hợp đồng, tài chính và marketing</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    content: {
                      ...settings.content,
                      includeBusinessVocab: !settings.content.includeBusinessVocab,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.content.includeBusinessVocab ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.content.includeBusinessVocab ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Luyện tập bẫy đề thi Part 5 & 6</h3>
                <p className="text-xs text-zinc-400">Tăng cường các bài tập ngữ pháp chuyên sâu chống bẫy cấu trúc lạ</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    content: { ...settings.content, grammarTrapFocus: !settings.content.grammarTrapFocus },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.content.grammarTrapFocus ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.content.grammarTrapFocus ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SRS SETTINGS */}
      {(activeSection === "all" || activeSection === "srs") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">5. Cài đặt SRS (Spaced Repetition System)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cấu hình thuật toán lặp lại ngắt quãng để ghi nhớ từ vựng vào trí nhớ dài hạn hiệu quả gấp 3 lần.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400">Số thẻ tối đa mỗi phiên ôn tập</span>
              <select
                value={settings.srs.maxCardsPerSession}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    srs: { ...settings.srs, maxCardsPerSession: Number(e.target.value) },
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
                value={settings.srs.reviewIntervals}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    srs: { ...settings.srs, reviewIntervals: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                placeholder="1,3,7,14,30"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. AUDIO SETTINGS */}
      {(activeSection === "all" || activeSection === "audio") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">6. Cài đặt âm thanh (Audio settings)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tùy chỉnh tốc độ giọng đọc đề thi, accent bản xứ (Mỹ, Anh, Úc, Canada) và hiệu ứng âm thanh.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Tốc độ giọng đọc (Playback Rate)
              </label>
              <select
                value={settings.audio.speechRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    audio: { ...settings.audio, speechRate: Number(e.target.value) },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
              >
                <option value={0.75}>0.75x (Chậm - Dành cho người mới)</option>
                <option value={0.9}>0.9x (Hơi chậm)</option>
                <option value={1.0}>1.0x (Chuẩn tốc độ thi thật)</option>
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
                value={settings.audio.voiceAccent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    audio: { ...settings.audio, voiceAccent: e.target.value },
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

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Tự động phát âm khi lật từ vựng</h3>
                <p className="text-xs text-zinc-400">Phát âm audio giọng bản xứ ngay khi bạn lật thẻ flashcard</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    audio: { ...settings.audio, autoPlayAudio: !settings.audio.autoPlayAudio },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.audio.autoPlayAudio ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.audio.autoPlayAudio ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Âm thanh phản hồi Đúng / Sai</h3>
                <p className="text-xs text-zinc-400">Phát tiếng chuông chúc mừng khi làm đúng hoặc nhắc nhở khi làm sai</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    audio: { ...settings.audio, soundEffects: !settings.audio.soundEffects },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.audio.soundEffects ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.audio.soundEffects ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DISPLAY SETTINGS */}
      {(activeSection === "all" || activeSection === "display") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">7. Cài đặt hiển thị (Display settings)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tùy chỉnh cỡ chữ đọc bài Part 6-7, bản dịch nghĩa song ngữ và highlight từ khóa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Cỡ chữ đoạn văn bài đọc
              </label>
              <select
                value={settings.display.fontSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, fontSize: e.target.value },
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
              >
                <option value="sm">Nhỏ (13px - Tiết kiệm không gian)</option>
                <option value="md">Vừa (15px - Tiêu chuẩn)</option>
                <option value="lg">Lớn (17px - Rõ ràng dễ đọc)</option>
                <option value="xl">Rất lớn (19px)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">Highlight từ khóa</h3>
                <p className="text-xs text-zinc-400">Tự động bôi vàng từ khóa quan trọng trong câu hỏi</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    display: {
                      ...settings.display,
                      highlightKeywords: !settings.display.highlightKeywords,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  settings.display.highlightKeywords ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.display.highlightKeywords ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. TIMER SETTINGS */}
      {(activeSection === "all" || activeSection === "timer") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">8. Cài đặt đồng hồ (Timer settings)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kiểm soát đồng hồ đếm ngược, cảnh báo áp lực thời gian và tự động thu bài khi hết giờ.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Đồng hồ đếm ngược trong bài thi</h3>
                <p className="text-xs text-zinc-400">Hiển thị thời gian còn lại chuẩn 120 phút trong bài Full Mock Test</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    timer: { ...settings.timer, showCountdown: !settings.timer.showCountdown },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.timer.showCountdown ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.timer.showCountdown ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Tự động nộp bài khi hết giờ</h3>
                <p className="text-xs text-zinc-400">Tự động tính điểm và lưu kết quả ngay khi thời gian đếm ngược về 00:00</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    timer: {
                      ...settings.timer,
                      autoSubmitOnTimeOut: !settings.timer.autoSubmitOnTimeOut,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.timer.autoSubmitOnTimeOut ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.timer.autoSubmitOnTimeOut ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. AUTO-ADVANCE SETTINGS */}
      {(activeSection === "all" || activeSection === "autoAdvance") && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-400">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">9. Cài đặt tự động chuyển (Auto-advance settings)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tăng tốc độ làm bài bằng cách tự động nhảy sang câu hỏi tiếp theo ngay sau khi bạn chọn đáp án.
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
                  setSettings({
                    ...settings,
                    autoAdvance: { ...settings.autoAdvance, enabled: !settings.autoAdvance.enabled },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.autoAdvance.enabled ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.autoAdvance.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-400">Độ trễ trước khi chuyển câu (Giây)</span>
              <select
                value={settings.autoAdvance.delaySeconds}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoAdvance: { ...settings.autoAdvance, delaySeconds: Number(e.target.value) },
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

      {/* Floating Save Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md sticky bottom-4 flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Tất cả cài đặt sẽ được đồng bộ tức thì trên toàn bộ các bài học TOEIC</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Khôi phục
          </button>
          <button
            onClick={handleSave}
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
