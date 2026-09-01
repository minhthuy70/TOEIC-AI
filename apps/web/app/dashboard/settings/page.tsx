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
  Accessibility,
  Keyboard,
  Mic,
  Volume1,
  Languages,
  Focus,
  Maximize2,
  Glasses,
  Play,
  Square,
  Radio,
  Activity,
  Globe2,
  BookA,
  Sparkle,
  Bot,
  Shield,
  Lock,
  UserCheck,
  Share2,
  BarChart3,
  Cookie,
  UserX,
  TrendingUp,
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

interface AccessibilitySettingsData {
  screenReader: boolean;
  keyboardNav: boolean;
  voiceControl: boolean;
  textToSpeech: {
    enabled: boolean;
    rate: number;
    pitch: number;
    volume: number;
    voice: string;
  };
  speechToText: {
    enabled: boolean;
    language: string;
  };
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "monochrome";
  largeTextMode: 100 | 125 | 150;
  focusIndicators: boolean;
}

interface LanguageSettingsData {
  interfaceLanguage: "vi" | "en" | "ja" | "ko" | "zh";
  contentLanguage: "bilingual-vi" | "english-only" | "bilingual-ja" | "bilingual-ko" | "bilingual-zh";
  vocabularyDisplay: {
    showVietnameseMeaning: boolean;
    showEnglishDefinition: boolean;
    showPhoneticIpa: boolean;
    showContextExamples: boolean;
    showCollocations: boolean;
  };
  translation: {
    engine: "neural-ai" | "deepl" | "google";
    clickToTranslate: boolean;
    inlineParagraphTranslation: boolean;
    autoDetectIdioms: boolean;
    instantExplanation: boolean;
  };
}

interface PrivacySettingsData {
  profileVisibility: "public" | "friends" | "private";
  progressVisibility: boolean;
  leaderboardParticipation: boolean;
  anonymousOnLeaderboard: boolean;
  dataSharing: boolean;
  analyticsConsent: boolean;
  friendRequests: boolean;
  cookiePreferences: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
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

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettingsData = {
  screenReader: false,
  keyboardNav: true,
  voiceControl: false,
  textToSpeech: {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: "en-US",
  },
  speechToText: {
    enabled: false,
    language: "en-US",
  },
  colorBlindMode: "none",
  largeTextMode: 100,
  focusIndicators: true,
};

const DEFAULT_LANGUAGE_SETTINGS: LanguageSettingsData = {
  interfaceLanguage: "vi",
  contentLanguage: "bilingual-vi",
  vocabularyDisplay: {
    showVietnameseMeaning: true,
    showEnglishDefinition: true,
    showPhoneticIpa: true,
    showContextExamples: true,
    showCollocations: true,
  },
  translation: {
    engine: "neural-ai",
    clickToTranslate: true,
    inlineParagraphTranslation: true,
    autoDetectIdioms: true,
    instantExplanation: true,
  },
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettingsData = {
  profileVisibility: "public",
  progressVisibility: true,
  leaderboardParticipation: true,
  anonymousOnLeaderboard: false,
  dataSharing: true,
  analyticsConsent: true,
  friendRequests: true,
  cookiePreferences: {
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  },
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

const COLOR_BLIND_MODES = [
  { id: "none", name: "Bình thường (Standard)", desc: "Hiển thị màu sắc chuẩn" },
  { id: "protanopia", name: "Protanopia (Mù màu đỏ)", desc: "Tăng cường độ tương phản sắc tố đỏ" },
  { id: "deuteranopia", name: "Deuteranopia (Mù màu xanh lá)", desc: "Tối ưu hóa bảng màu lục - lam" },
  { id: "tritanopia", name: "Tritanopia (Mù màu xanh dương)", desc: "Tối ưu sắc độ vàng - hồng" },
  { id: "monochrome", name: "Đơn sắc (Monochrome)", desc: "Giao diện thang độ xám Grayscale" },
];

const INTERFACE_LANGUAGES = [
  { id: "vi", name: "Tiếng Việt", native: "Tiếng Việt (Mặc định)", flag: "🇻🇳" },
  { id: "en", name: "English", native: "English (US)", flag: "🇺🇸" },
  { id: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { id: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { id: "zh", name: "Chinese", native: "简体中文", flag: "🇨🇳" },
];

const CONTENT_LANGUAGES = [
  { id: "bilingual-vi", name: "Song ngữ Anh - Việt", desc: "Hiển thị đề tiếng Anh kèm dịch nghĩa và giải thích tiếng Việt (Khuyên dùng)" },
  { id: "english-only", name: "Chỉ tiếng Anh (English Only)", desc: "Môi trường đắm chìm 100% tiếng Anh cho trình độ 800+ TOEIC" },
  { id: "bilingual-ja", name: "Song ngữ Anh - Nhật (日英)", desc: "Hiển thị đề thi kèm phụ đề giải thích tiếng Nhật" },
  { id: "bilingual-ko", name: "Song ngữ Anh - Hàn (영한)", desc: "Hiển thị đề thi kèm phụ đề giải thích tiếng Hàn" },
  { id: "bilingual-zh", name: "Song ngữ Anh - Trung (英中)", desc: "Hiển thị đề thi kèm phụ đề giải thích tiếng Trung" },
];

export default function SettingsHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"study" | "appearance" | "accessibility" | "language" | "privacy">("study");

  // Study Settings State
  const [studySettings, setStudySettings] = useState<StudySettingsData>(DEFAULT_STUDY_SETTINGS);
  const [activeStudySection, setActiveStudySection] = useState("all");

  // Appearance Settings State
  const [appearance, setAppearance] = useState<AppearanceSettingsData>(DEFAULT_APPEARANCE_SETTINGS);

  // Accessibility Settings State
  const [accessibility, setAccessibility] = useState<AccessibilitySettingsData>(DEFAULT_ACCESSIBILITY_SETTINGS);

  // Language Settings State
  const [language, setLanguage] = useState<LanguageSettingsData>(DEFAULT_LANGUAGE_SETTINGS);

  // Privacy Settings State
  const [privacy, setPrivacy] = useState<PrivacySettingsData>(DEFAULT_PRIVACY_SETTINGS);

  // Live TTS audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

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
      const [studyRes, appRes, accRes, langRes, privRes] = await Promise.all([
        apiFetch<{ success: boolean; data: StudySettingsData }>("/profile/study-settings"),
        apiFetch<{ success: boolean; data: AppearanceSettingsData }>("/profile/appearance-settings"),
        apiFetch<{ success: boolean; data: AccessibilitySettingsData }>("/profile/accessibility-settings"),
        apiFetch<{ success: boolean; data: LanguageSettingsData }>("/profile/language-settings"),
        apiFetch<{ success: boolean; data: PrivacySettingsData }>("/profile/privacy"),
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

      if (accRes.success && accRes.data) {
        setAccessibility({
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          ...accRes.data,
          textToSpeech: { ...DEFAULT_ACCESSIBILITY_SETTINGS.textToSpeech, ...accRes.data.textToSpeech },
          speechToText: { ...DEFAULT_ACCESSIBILITY_SETTINGS.speechToText, ...accRes.data.speechToText },
        });
      }

      if (langRes.success && langRes.data) {
        setLanguage({
          ...DEFAULT_LANGUAGE_SETTINGS,
          ...langRes.data,
          vocabularyDisplay: { ...DEFAULT_LANGUAGE_SETTINGS.vocabularyDisplay, ...langRes.data.vocabularyDisplay },
          translation: { ...DEFAULT_LANGUAGE_SETTINGS.translation, ...langRes.data.translation },
        });
      }

      if (privRes.success && privRes.data) {
        setPrivacy({
          ...DEFAULT_PRIVACY_SETTINGS,
          ...privRes.data,
          cookiePreferences: {
            ...DEFAULT_PRIVACY_SETTINGS.cookiePreferences,
            ...(privRes.data.cookiePreferences || {}),
          },
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

  const handleSaveAccessibilitySettings = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/accessibility-settings", {
        method: "PUT",
        body: JSON.stringify(accessibility),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt trợ năng thành công!");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu cài đặt trợ năng", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLanguageSettings = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/language-settings", {
        method: "PUT",
        body: JSON.stringify(language),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt ngôn ngữ thành công!");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu cài đặt ngôn ngữ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/privacy", {
        method: "PUT",
        body: JSON.stringify(privacy),
      });

      if (res.success) {
        showToast(res.message || "Đã lưu cài đặt quyền riêng tư thành công!");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu cài đặt quyền riêng tư", "error");
    } finally {
      setSaving(false);
    }
  };

  // Live TTS Test
  const handleTestTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Trình duyệt không hỗ trợ Web Speech API", "error");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = "Welcome to TOEIC AI Platform. This is a text to speech test audio.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = accessibility.textToSpeech.rate;
    utterance.pitch = accessibility.textToSpeech.pitch;
    utterance.volume = accessibility.textToSpeech.volume;
    utterance.lang = accessibility.textToSpeech.voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Live Mic STT Test
  const handleTestMic = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Trình duyệt không hỗ trợ nhận diện giọng nói (Speech-to-text)", "error");
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = accessibility.speechToText.language;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningMic(true);
        setRecognizedText("Đang lắng nghe... Hãy nói một câu tiếng Anh!");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(`Đã nhận diện: "${transcript}"`);
        setIsListeningMic(false);
      };

      recognition.onerror = (event: any) => {
        setRecognizedText(`Lỗi micro: ${event.error}`);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch (e: any) {
      console.error(e);
      showToast("Không thể khởi động micro", "error");
      setIsListeningMic(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
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
            Quản trị toàn diện: Học tập, Giao diện, Trợ năng, Ngôn ngữ và Quyền riêng tư
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "study") {
                setStudySettings(DEFAULT_STUDY_SETTINGS);
                showToast("Đã khôi phục cài đặt học tập mặc định");
              } else if (activeTab === "appearance") {
                setAppearance(DEFAULT_APPEARANCE_SETTINGS);
                showToast("Đã khôi phục cài đặt giao diện mặc định");
              } else if (activeTab === "accessibility") {
                setAccessibility(DEFAULT_ACCESSIBILITY_SETTINGS);
                showToast("Đã khôi phục cài đặt trợ năng mặc định");
              } else if (activeTab === "language") {
                setLanguage(DEFAULT_LANGUAGE_SETTINGS);
                showToast("Đã khôi phục cài đặt ngôn ngữ mặc định");
              } else {
                setPrivacy(DEFAULT_PRIVACY_SETTINGS);
                showToast("Đã khôi phục cài đặt quyền riêng tư mặc định");
              }
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
          <button
            onClick={() => {
              if (activeTab === "study") handleSaveStudySettings();
              else if (activeTab === "appearance") handleSaveAppearanceSettings();
              else if (activeTab === "accessibility") handleSaveAccessibilitySettings();
              else if (activeTab === "language") handleSaveLanguageSettings();
              else handleSavePrivacySettings();
            }}
            disabled={saving}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu Cài Đặt"}</span>
          </button>
        </div>
      </div>

      {/* Master Tabs Switcher (5 Tabs) */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("study")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "study"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Học Tập</span>
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "appearance"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Giao Diện</span>
        </button>
        <button
          onClick={() => setActiveTab("accessibility")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "accessibility"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Accessibility className="w-4 h-4" />
          <span>Trợ Năng</span>
        </button>
        <button
          onClick={() => setActiveTab("language")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "language"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Ngôn Ngữ</span>
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "privacy"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Quyền Riêng Tư</span>
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

      {/* TAB 3: ACCESSIBILITY SETTINGS (13.4) */}
      {activeTab === "accessibility" && (
        <div className="space-y-6">
          {/* Interactive Testing Area */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400" />
              <span>Khu vực thử nghiệm trợ năng trực tiếp (Live Accessibility Testing)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TTS Live Tester */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume1 className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white">Thử nghiệm Text-to-Speech</h4>
                  </div>
                  <button
                    onClick={handleTestTTS}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {isSpeaking ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isSpeaking ? "Dừng lại" : "Nghe thử câu mẫu"}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400 italic">
                  "Welcome to TOEIC AI Platform. This is a text to speech test audio."
                </p>
              </div>

              {/* STT Live Mic Tester */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Thử nghiệm Micro nhận diện giọng</h4>
                  </div>
                  <button
                    onClick={handleTestMic}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isListeningMic ? "bg-red-600 text-white animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isListeningMic ? "Đang thu âm..." : "Bật Mic thử"}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  {recognizedText || "Nhấn nút 'Bật Mic thử' và nói một từ vựng tiếng Anh bất kỳ để kiểm tra."}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Screen Reader Support */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Glasses className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1. Hỗ trợ trình đọc màn hình (Screen reader support)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tối ưu các thuộc tính thẻ ARIA, tự động gán nhãn giải thích cho các hình ảnh đề thi Part 1 & biểu đồ Part 7.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Bật tối ưu hóa Screen Reader</h4>
                <p className="text-xs text-zinc-400">Hỗ trợ đọc to câu hỏi, các lựa chọn A/B/C/D và giải thích đáp án</p>
              </div>
              <button
                onClick={() =>
                  setAccessibility({
                    ...accessibility,
                    screenReader: !accessibility.screenReader,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  accessibility.screenReader ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    accessibility.screenReader ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Keyboard Navigation */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">2. Điều hướng bàn phím (Keyboard navigation)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cho phép làm bài thi và điều khiển giao diện hoàn toàn bằng phím tắt mà không cần dùng chuột.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Kích hoạt phím tắt làm bài thi</h4>
                <p className="text-xs text-zinc-400">Sử dụng phím A, B, C, D để chọn đáp án tức thì</p>
              </div>
              <button
                onClick={() =>
                  setAccessibility({
                    ...accessibility,
                    keyboardNav: !accessibility.keyboardNav,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  accessibility.keyboardNav ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    accessibility.keyboardNav ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Shortcuts Cheatsheet */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "A / B / C / D", label: "Chọn đáp án tương ứng" },
                { key: "← / →", label: "Chuyển câu Trước / Sau" },
                { key: "Space", label: "Phát / Tạm dừng Audio" },
                { key: "Enter", label: "Xác nhận / Nộp bài" },
              ].map((sc) => (
                <div key={sc.key} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-center">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-red-400 inline-block mb-1">
                    {sc.key}
                  </span>
                  <p className="text-[11px] text-zinc-400">{sc.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Voice Control */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3. Điều khiển giọng nói (Voice control)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Điều khiển chuyển câu, chọn đáp án và nghe audio bằng khẩu lệnh giọng nói.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Bật điều khiển khẩu lệnh</h4>
                <p className="text-xs text-zinc-400">Hỗ trợ các khẩu lệnh: "Next", "Previous", "Play", "Select A/B/C/D"</p>
              </div>
              <button
                onClick={() =>
                  setAccessibility({
                    ...accessibility,
                    voiceControl: !accessibility.voiceControl,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  accessibility.voiceControl ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    accessibility.voiceControl ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4 & 5. Text-to-Speech & Speech-to-Text */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">4 & 5. Văn bản thành giọng nói & Nhận diện giọng nói</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tùy chỉnh tốc độ đọc TTS và ngôn ngữ nhận diện giọng nói STT để luyện phát âm chuẩn TOEIC.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Tốc độ đọc TTS (Rate)
                </label>
                <select
                  value={accessibility.textToSpeech.rate}
                  onChange={(e) =>
                    setAccessibility({
                      ...accessibility,
                      textToSpeech: {
                        ...accessibility.textToSpeech,
                        rate: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value={0.75}>0.75x (Chậm)</option>
                  <option value={1.0}>1.0x (Bình thường)</option>
                  <option value={1.25}>1.25x (Nhanh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Cao độ giọng đọc (Pitch)
                </label>
                <select
                  value={accessibility.textToSpeech.pitch}
                  onChange={(e) =>
                    setAccessibility({
                      ...accessibility,
                      textToSpeech: {
                        ...accessibility.textToSpeech,
                        pitch: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value={0.8}>Trầm (Low)</option>
                  <option value={1.0}>Tự nhiên (Natural)</option>
                  <option value={1.2}>Cao (High)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Ngôn ngữ nhận diện STT
                </label>
                <select
                  value={accessibility.speechToText.language}
                  onChange={(e) =>
                    setAccessibility({
                      ...accessibility,
                      speechToText: {
                        ...accessibility.speechToText,
                        language: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="vi-VN">Tiếng Việt (VN)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Color Blind Mode */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">6. Chế độ mù màu (Color blind mode)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tối ưu hóa các cặp màu đúng/sai và biểu đồ phân tích điểm để phù hợp với từng dạng thị giác màu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COLOR_BLIND_MODES.map((mode) => {
                const isSelected = accessibility.colorBlindMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() =>
                      setAccessibility({
                        ...accessibility,
                        colorBlindMode: mode.id as any,
                      })
                    }
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-red-950/20 border-red-500/50"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{mode.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-500">{mode.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7 & 8. Large Text Mode & Focus Indicators */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Focus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">7 & 8. Chế độ văn bản lớn & Chỉ số tiêu điểm (Focus indicators)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Phóng to văn bản giao diện toàn diện và bật viền sáng tiêu điểm hỗ trợ điều hướng Tab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-xs text-zinc-400">Tỷ lệ phóng to văn bản (Large text mode)</span>
                <div className="flex items-center gap-2">
                  {[100, 125, 150].map((scale) => (
                    <button
                      key={scale}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          largeTextMode: scale as any,
                        })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        accessibility.largeTextMode === scale
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {scale}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Viền sáng tiêu điểm (Focus ring)</h4>
                  <p className="text-xs text-zinc-400">Hiển thị viền đỏ nổi bật quanh phần tử đang chọn bằng phím Tab</p>
                </div>
                <button
                  onClick={() =>
                    setAccessibility({
                      ...accessibility,
                      focusIndicators: !accessibility.focusIndicators,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    accessibility.focusIndicators ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      accessibility.focusIndicators ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LANGUAGE SETTINGS (13.5) */}
      {activeTab === "language" && (
        <div className="space-y-6">
          {/* Live Multilingual Preview Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <BookA className="w-4 h-4 text-red-400" />
                <span>Xem trước từ vựng & Bản dịch đa ngữ (Multilingual Preview)</span>
              </h3>
              <span className="text-[11px] text-zinc-500">Mẫu từ vựng TOEIC</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">Negotiation</span>
                    {language.vocabularyDisplay.showPhoneticIpa && (
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        /nɪˌɡoʊ.ʃiˈeɪ.ʃən/
                      </span>
                    )}
                    <span className="text-xs text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded font-semibold">
                      noun • TOEIC 750+
                    </span>
                  </div>

                  {language.vocabularyDisplay.showVietnameseMeaning && (
                    <p className="text-sm font-semibold text-emerald-400 mt-1.5">
                      👉 Nghĩa: Sự đàm phán, cuộc thương lượng, hiệp thương
                    </p>
                  )}

                  {language.vocabularyDisplay.showEnglishDefinition && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Definition: Formal discussion between people who are trying to reach an agreement.
                    </p>
                  )}
                </div>

                <div className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] text-zinc-400 border border-zinc-700 flex items-center gap-1.5">
                  <Bot className="w-3 h-3 text-yellow-400" />
                  <span>Dịch bởi: {language.translation.engine.toUpperCase()}</span>
                </div>
              </div>

              {language.vocabularyDisplay.showContextExamples && (
                <div className="pt-2 border-t border-zinc-800 text-xs space-y-1">
                  <p className="text-zinc-300 italic">
                    "The contract is currently under <strong className="text-white">negotiation</strong> between the two companies."
                  </p>
                  <p className="text-zinc-500">
                    Bản dịch: Hợp đồng hiện đang trong quá trình đàm phán giữa hai công ty.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 1. Interface Language */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1. Chọn ngôn ngữ giao diện (Interface language)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ngôn ngữ hiển thị cho toàn bộ bảng điều khiển, menu điều hướng, thông báo và trợ giúp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {INTERFACE_LANGUAGES.map((lang) => {
                const isSelected = language.interfaceLanguage === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => setLanguage({ ...language, interfaceLanguage: lang.id as any })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-center ${
                      isSelected
                        ? "bg-red-950/20 border-red-500/50 shadow-md"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-2xl mb-1">{lang.flag}</div>
                    <div className="text-xs font-bold text-white">{lang.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{lang.native}</div>
                    {isSelected && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">
                        Đang chọn
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Content Language */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">2. Chọn ngôn ngữ nội dung (Content language)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chế độ hiển thị câu hỏi đề thi, đáp án giải thích chi tiết và transcript bài nghe.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTENT_LANGUAGES.map((cl) => {
                const isSelected = language.contentLanguage === cl.id;
                return (
                  <div
                    key={cl.id}
                    onClick={() => setLanguage({ ...language, contentLanguage: cl.id as any })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-red-950/20 border-red-500/50"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{cl.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-xs text-zinc-400">{cl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Vocabulary Display Language */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                <BookA className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3. Ngôn ngữ hiển thị từ vựng (Vocabulary display)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tùy chỉnh các trường thông tin hiển thị trên Flashcard từ vựng và tra từ nhanh.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hiển thị nghĩa Tiếng Việt</h4>
                  <p className="text-xs text-zinc-400">Bản dịch nghĩa chuẩn tiếng Việt của từ</p>
                </div>
                <button
                  onClick={() =>
                    setLanguage({
                      ...language,
                      vocabularyDisplay: {
                        ...language.vocabularyDisplay,
                        showVietnameseMeaning: !language.vocabularyDisplay.showVietnameseMeaning,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    language.vocabularyDisplay.showVietnameseMeaning ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      language.vocabularyDisplay.showVietnameseMeaning ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hiển thị định nghĩa Anh - Anh</h4>
                  <p className="text-xs text-zinc-400">Giải nghĩa từ điển Oxford / Cambridge</p>
                </div>
                <button
                  onClick={() =>
                    setLanguage({
                      ...language,
                      vocabularyDisplay: {
                        ...language.vocabularyDisplay,
                        showEnglishDefinition: !language.vocabularyDisplay.showEnglishDefinition,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    language.vocabularyDisplay.showEnglishDefinition ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      language.vocabularyDisplay.showEnglishDefinition ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hiển thị phiên âm quốc tế (IPA)</h4>
                  <p className="text-xs text-zinc-400">Ký hiệu ngữ âm phát âm chuẩn US</p>
                </div>
                <button
                  onClick={() =>
                    setLanguage({
                      ...language,
                      vocabularyDisplay: {
                        ...language.vocabularyDisplay,
                        showPhoneticIpa: !language.vocabularyDisplay.showPhoneticIpa,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    language.vocabularyDisplay.showPhoneticIpa ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      language.vocabularyDisplay.showPhoneticIpa ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hiển thị ví dụ ngữ cảnh minh họa</h4>
                  <p className="text-xs text-zinc-400">Câu ví dụ thực tế trong đề thi TOEIC</p>
                </div>
                <button
                  onClick={() =>
                    setLanguage({
                      ...language,
                      vocabularyDisplay: {
                        ...language.vocabularyDisplay,
                        showContextExamples: !language.vocabularyDisplay.showContextExamples,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    language.vocabularyDisplay.showContextExamples ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      language.vocabularyDisplay.showContextExamples ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Translation Settings */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">4. Cài đặt dịch thuật AI (Translation settings)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cấu hình công nghệ dịch máy và tính năng tra cứu từ ngữ tức thì khi giải đề.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Công cụ dịch AI ưu tiên
                </label>
                <select
                  value={language.translation.engine}
                  onChange={(e) =>
                    setLanguage({
                      ...language,
                      translation: {
                        ...language.translation,
                        engine: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="neural-ai">TOEIC AI Neural Translation (Tối ưu thuật ngữ đề thi)</option>
                  <option value="deepl">DeepL Pro Engine (Văn phong tự nhiên)</option>
                  <option value="google">Google Cloud Translation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Click-to-Translate</h4>
                    <p className="text-xs text-zinc-400">Click chuột vào từ bất kỳ trong bài đọc để xem nghĩa ngay</p>
                  </div>
                  <button
                    onClick={() =>
                      setLanguage({
                        ...language,
                        translation: {
                          ...language.translation,
                          clickToTranslate: !language.translation.clickToTranslate,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      language.translation.clickToTranslate ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        language.translation.clickToTranslate ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Tự động phát hiện thành ngữ (Idioms)</h4>
                    <p className="text-xs text-zinc-400">Nhận diện cụm từ cố định và giải nghĩa chuyên sâu</p>
                  </div>
                  <button
                    onClick={() =>
                      setLanguage({
                        ...language,
                        translation: {
                          ...language.translation,
                          autoDetectIdioms: !language.translation.autoDetectIdioms,
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      language.translation.autoDetectIdioms ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        language.translation.autoDetectIdioms ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY SETTINGS (13.6) */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          {/* Privacy & Security Shield Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bảo Vệ Dữ Liệu & Quyền Riêng Tư</h3>
                  <p className="text-xs text-zinc-400">
                    Dữ liệu học tập của bạn được mã hóa an toàn theo tiêu chuẩn GDPR & ISO/IEC 27001.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bảo Mật Cao</span>
              </span>
            </div>
          </div>

          {/* 1. Profile Visibility */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1. Khả năng hiển thị hồ sơ (Profile visibility)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Quyết định ai có thể tìm kiếm và xem trang hồ sơ học viên của bạn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "public", name: "Công khai (Public)", desc: "Mọi học viên đều có thể xem trang cá nhân" },
                { id: "friends", name: "Bạn bè (Friends Only)", desc: "Chỉ những người đã kết bạn mới có thể xem" },
                { id: "private", name: "Riêng tư (Private)", desc: "Chỉ một mình bạn có quyền xem hồ sơ" },
              ].map((pv) => {
                const isSelected = privacy.profileVisibility === pv.id;
                return (
                  <div
                    key={pv.id}
                    onClick={() => setPrivacy({ ...privacy, profileVisibility: pv.id as any })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-red-950/20 border-red-500/50"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{pv.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-xs text-zinc-400">{pv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2 & 3. Progress Visibility & Leaderboard Participation */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">2 & 3. Tiến độ học tập & Bảng xếp hạng (Progress & Leaderboard)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kiểm soát việc hiển thị điểm số thi thử, chuỗi Streak và xếp thứ hạng thi đua.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hiển thị tiến độ học tập (Progress visibility)</h4>
                  <p className="text-xs text-zinc-400">Cho phép bạn bè xem điểm Mock Test, số từ vựng đã học và chuỗi Streak</p>
                </div>
                <button
                  onClick={() => setPrivacy({ ...privacy, progressVisibility: !privacy.progressVisibility })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.progressVisibility ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.progressVisibility ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Tham gia Bảng xếp hạng (Leaderboard participation)</h4>
                  <p className="text-xs text-zinc-400">Hiển thị tên và điểm thi đua trên BXH tuần, tháng và toàn khóa</p>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      leaderboardParticipation: !privacy.leaderboardParticipation,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.leaderboardParticipation ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.leaderboardParticipation ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Chế độ thi đua ẩn danh (Anonymous Mode)</h4>
                  <p className="text-xs text-zinc-400">Ẩn tên thật và avatar khi xuất hiện trên Bảng xếp hạng (thay bằng "Học viên ẩn danh")</p>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      anonymousOnLeaderboard: !privacy.anonymousOnLeaderboard,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.anonymousOnLeaderboard ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.anonymousOnLeaderboard ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4 & 5. Data Sharing & Analytics Consent */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">4 & 5. Chia sẻ dữ liệu & Đồng ý phân tích (Data & Analytics)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Đóng góp dữ liệu ẩn danh để hệ thống AI nâng cao chất lượng bài giảng và gợi ý lộ trình học.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Chia sẻ dữ liệu học tập ẩn danh (Data sharing)</h4>
                  <p className="text-xs text-zinc-400">
                    Cho phép hệ thống sử dụng kết quả làm bài đã mã hóa ẩn danh để huấn luyện AI dự đoán bẫy đề thi
                  </p>
                </div>
                <button
                  onClick={() => setPrivacy({ ...privacy, dataSharing: !privacy.dataSharing })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.dataSharing ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.dataSharing ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Đồng ý thu thập phân tích trải nghiệm (Analytics consent)</h4>
                  <p className="text-xs text-zinc-400">
                    Ghi nhận thời lượng giải câu hỏi và thao tác để tự động tối ưu hóa giao diện cho bạn
                  </p>
                </div>
                <button
                  onClick={() => setPrivacy({ ...privacy, analyticsConsent: !privacy.analyticsConsent })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.analyticsConsent ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.analyticsConsent ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 6. Cookie Preferences */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">6. Quản lý Cookie & Bộ nhớ đệm (Cookie preferences)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tùy chỉnh các nhóm Cookie lưu trữ cục bộ trên trình duyệt của bạn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Cookie thiết yếu (Essential)</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 font-bold">Bắt buộc</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Duy trì phiên đăng nhập và bảo mật tài khoản</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-red-600/60 relative cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 translate-x-7" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Cookie chức năng (Functional)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Ghi nhớ tùy chọn giao diện và cài đặt học tập</p>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      cookiePreferences: {
                        ...privacy.cookiePreferences,
                        functional: !privacy.cookiePreferences.functional,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.cookiePreferences.functional ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.cookiePreferences.functional ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Cookie phân tích (Analytics)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Đo lường hiệu suất tải trang và lỗi hệ thống</p>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      cookiePreferences: {
                        ...privacy.cookiePreferences,
                        analytics: !privacy.cookiePreferences.analytics,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.cookiePreferences.analytics ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.cookiePreferences.analytics ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Cookie tiếp thị (Marketing)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Gợi ý ưu đãi và chương trình học bổng phù hợp</p>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      cookiePreferences: {
                        ...privacy.cookiePreferences,
                        marketing: !privacy.cookiePreferences.marketing,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacy.cookiePreferences.marketing ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.cookiePreferences.marketing ? "translate-x-7" : "translate-x-1"
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
              } else if (activeTab === "appearance") {
                setAppearance(DEFAULT_APPEARANCE_SETTINGS);
                showToast("Đã khôi phục cài đặt giao diện mặc định");
              } else if (activeTab === "accessibility") {
                setAccessibility(DEFAULT_ACCESSIBILITY_SETTINGS);
                showToast("Đã khôi phục cài đặt trợ năng mặc định");
              } else if (activeTab === "language") {
                setLanguage(DEFAULT_LANGUAGE_SETTINGS);
                showToast("Đã khôi phục cài đặt ngôn ngữ mặc định");
              } else {
                setPrivacy(DEFAULT_PRIVACY_SETTINGS);
                showToast("Đã khôi phục cài đặt quyền riêng tư mặc định");
              }
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Khôi phục
          </button>
          <button
            onClick={() => {
              if (activeTab === "study") handleSaveStudySettings();
              else if (activeTab === "appearance") handleSaveAppearanceSettings();
              else if (activeTab === "accessibility") handleSaveAccessibilitySettings();
              else if (activeTab === "language") handleSaveLanguageSettings();
              else handleSavePrivacySettings();
            }}
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
