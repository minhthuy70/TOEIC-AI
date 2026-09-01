"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSrs, getTopics } from "@/services/vocabulary";
import type { SrsResponse, Topic } from "@/types/vocabulary";
import { getGrammarCategories } from "@/services/grammar";
import type { GrammarCategory } from "@/types/grammar";
import {
  getListeningDailyStatus,
  getListeningDailyGroups,
  getListeningReviewGroups,
  type ListeningDailyStatus,
  type ListeningGroup,
} from "@/services/listening";
import {
  getReadingDailyStatus,
  getReadingDailyLessons,
  getReadingReviewLessons,
  type ReadingDailyStatus,
  type ReadingLesson,
} from "@/services/reading";
import {
  BookOpen,
  FileText,
  Headphones,
  FileEdit,
  ImageIcon,
  MessageSquare,
  Users,
  Mic,
  Volume2,
  Edit3,
  Zap,
  Eye,
  Search,
  Newspaper,
  Flame,
  RotateCcw,
  Check,
  Brain,
  Bell,
  Clock,
  Moon,
  Calendar,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const TABS = [
  { id: "vocabulary", label: "Từ vựng", icon: BookOpen },
  { id: "grammar", label: "Ngữ pháp", icon: FileText },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: FileEdit },
];

const LISTENING_PARTS = [
  { part: 1, label: "Photographs", icon: ImageIcon, questions: 6, desc: "Nghe và chọn ảnh phù hợp", done: 4 },
  { part: 2, label: "Question-Response", icon: MessageSquare, questions: 25, desc: "Nghe câu hỏi và chọn câu trả lời đúng", done: 10 },
  { part: 3, label: "Conversations", icon: Users, questions: 39, desc: "Hội thoại 2-3 người", done: 5 },
  { part: 4, label: "Talks", icon: Mic, questions: 30, desc: "Bài nói đơn", done: 0 },
];

const LISTENING_SKILLS = [
  { label: "Shadowing", icon: Volume2, desc: "Luyện phát âm theo người bản ngữ" },
  { label: "Dictation", icon: Edit3, desc: "Nghe và chép lại từng câu" },
  { label: "Speed Training", icon: Zap, desc: "Nghe theo tốc độ tăng dần 0.75x→1.25x" },
];

const READING_PARTS = [
  { part: 5, label: "Incomplete Sentences", icon: Edit3, questions: 30, desc: "Điền từ vào câu", done: 20 },
  { part: 6, label: "Text Completion", icon: FileText, questions: 16, desc: "Điền vào đoạn văn", done: 8 },
  { part: 7, label: "Reading Comprehension", icon: BookOpen, questions: 54, desc: "Đọc hiểu đơn, kép, ba đoạn", done: 5 },
];

const READING_SKILLS = [
  { label: "Skimming", icon: Eye, desc: "Đọc lướt nắm ý chính" },
  { label: "Scanning", icon: Search, desc: "Đọc quét tìm thông tin cụ thể" },
  { label: "Single Passage", icon: FileText, desc: "Luyện đọc 1 đoạn văn" },
  { label: "Double Passage", icon: FileText, desc: "Luyện đọc 2 đoạn văn liên kết" },
  { label: "Triple Passage", icon: Newspaper, desc: "Luyện đọc 3 đoạn văn liên kết" },
];

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản": "bg-green-600/15 text-green-400 border-green-600/20",
  "Trung bình": "bg-blue-600/15 text-blue-400 border-blue-600/20",
  "Nâng cao": "bg-purple-600/15 text-purple-400 border-purple-600/20",
};

/* ─── SRS Timeline steps ─── */
const SRS_STEPS = [
  { label: "Học mới", sub: "20 từ/ngày", icon: BookOpen, color: "from-emerald-500 to-emerald-400" },
  { label: "Lần 1", sub: "30 phút", icon: Bell, color: "from-yellow-500 to-amber-400" },
  { label: "Lần 2", sub: "3 giờ", icon: Clock, color: "from-orange-500 to-orange-400" },
  { label: "Lần 3", sub: "10 giờ", icon: Moon, color: "from-red-500 to-rose-400" },
  { label: "Lần 4", sub: "24 giờ", icon: Calendar, color: "from-pink-500 to-pink-400" },
  { label: "Lần 5", sub: "3 ngày", icon: Calendar, color: "from-purple-500 to-violet-400" },
  { label: "Ôn kỳ", sub: "5 ngày/lần", icon: RotateCcw, color: "from-blue-500 to-blue-400" },
  { label: "Thuộc", sub: "20 ngày/lần", icon: Check, color: "from-emerald-600 to-green-500" },
];

interface SrsStatus {
  success: boolean;
  stage: number;
  learnedToday: number;
  dailyGoal: number;
  remainToday: number;
  totalLearned: number;
  reviewNow: number;
  nextReview: string | null;
  masteredCount: number;
  reviewingCount: number;
  streak: number;
  totalWordsInStage: number;
  learnedInStage: number;
  srsLevels: Record<string, number>;
}

function formatCountdown(target: string | null): string {
  if (!target) return "—";
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "Ngay bây giờ!";
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} ngày ${hrs % 24}h nữa`;
  if (hrs > 0) return `${hrs}h ${mins % 60}p nữa`;
  return `${mins}p nữa`;
}

/* ─── Circular Progress ─── */
function CircularProgress({ value, max, size = 100, strokeWidth = 8, children }: {
  value: number; max: number; size?: number; strokeWidth?: number; children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#srsGrad)" strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="srsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("vocabulary");
  const [srsStatus, setSrsStatus] = useState<SrsResponse | null>(null);
  const [srsLoading, setSrsLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [vocabTopics, setVocabTopics] = useState<Topic[]>([]);
  const [vocabTopicsLoading, setVocabTopicsLoading] = useState(true);
  const [grammarTopics, setGrammarTopics] = useState<GrammarCategory[]>([]);
  const [grammarLoading, setGrammarLoading] = useState(false);

  // ─── Listening state ───
  const [listeningStatus, setListeningStatus] = useState<ListeningDailyStatus | null>(null);
  const [listeningGroups, setListeningGroups] = useState<ListeningGroup[]>([]);
  const [listeningReviewGroups, setListeningReviewGroups] = useState<ListeningGroup[]>([]);
  const [listeningLoading, setListeningLoading] = useState(false);

  // ─── Reading state ───
  const [readingStatus, setReadingStatus] = useState<ReadingDailyStatus | null>(null);
  const [readingLessons, setReadingLessons] = useState<ReadingLesson[]>([]);
  const [readingReviewLessons, setReadingReviewLessons] = useState<ReadingLesson[]>([]);
  const [readingLoading, setReadingLoading] = useState(false);

  const [grammarError, setGrammarError] = useState<string | null>(null);

  const loadSrsAndTopics = useCallback(async () => {
    try {
      const [srsData, topicsData] = await Promise.all([
        getSrs(),
        getTopics(),
      ]);
      if (srsData.success) setSrsStatus(srsData);
      setVocabTopics(topicsData);
    } catch (err) {
      console.error(err);
    } finally {
      setSrsLoading(false);
      setVocabTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSrsAndTopics();
  }, [loadSrsAndTopics]);

  useEffect(() => {
    if (activeTab !== "grammar") return;

    const loadGrammar = async () => {
      try {
        setGrammarLoading(true);
        setGrammarError(null);

        const data = await getGrammarCategories();

        setGrammarTopics(data);
      } catch (error) {
        console.error("Load grammar categories error:", error);
        setGrammarError("Không thể tải dữ liệu ngữ pháp.");
      } finally {
        setGrammarLoading(false);
      }
    };

    loadGrammar();
  }, [activeTab]);

  // Live countdown ticker
  useEffect(() => {
    if (!srsStatus?.nextReview) return;
    const tick = () => setCountdown(formatCountdown(srsStatus.nextReview));
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [srsStatus?.nextReview]);

  // ─── Load Listening daily data ───
  useEffect(() => {
    if (activeTab !== "listening") return;

    const loadListening = async () => {
      try {
        setListeningLoading(true);
        const [statusData, groupsData, reviewData] = await Promise.all([
          getListeningDailyStatus(),
          getListeningDailyGroups(),
          getListeningReviewGroups(),
        ]);
        setListeningStatus(statusData);
        setListeningGroups(groupsData.groups || []);
        setListeningReviewGroups(reviewData.groups || []);
      } catch (error) {
        console.error("Load listening error:", error);
      } finally {
        setListeningLoading(false);
      }
    };

    loadListening();
  }, [activeTab]);

  // ─── Load Reading daily data ───
  useEffect(() => {
    if (activeTab !== "reading") return;

    const loadReading = async () => {
      try {
        setReadingLoading(true);
        const [statusData, lessonsData, reviewData] = await Promise.all([
          getReadingDailyStatus(),
          getReadingDailyLessons(),
          getReadingReviewLessons(),
        ]);
        setReadingStatus(statusData);
        setReadingLessons(lessonsData.lessons || []);
        setReadingReviewLessons(reviewData.lessons || []);
      } catch (error) {
        console.error("Load reading error:", error);
      } finally {
        setReadingLoading(false);
      }
    };

    loadReading();
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-red-500" />
          <span>Học tập</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Từ vựng · Ngữ pháp · Listening · Reading</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Vocabulary ── */}
      {activeTab === "vocabulary" && (
        <div className="space-y-5">
          {/* ─────── 1. HERO: Tiến trình hôm nay + Ôn tập ─────── */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Card: Học từ mới hôm nay */}
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-600/8 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-5">
                <CircularProgress
                  value={srsStatus?.learnedToday ?? 0}
                  max={srsStatus?.dailyGoal ?? 20}
                  size={90}
                  strokeWidth={7}
                >
                  <div className="text-center">
                    <p className="text-xl font-bold text-white leading-none">
                      {srsLoading ? "—" : srsStatus?.learnedToday ?? 0}
                    </p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">/{srsStatus?.dailyGoal ?? 20}</p>
                  </div>
                </CircularProgress>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-zinc-400 font-medium">Từ mới hôm nay</p>
                  <p className="text-2xl font-bold text-white mt-0.5">
                    {srsLoading ? "..." : `${srsStatus?.learnedToday ?? 0}/${srsStatus?.dailyGoal ?? 20}`}
                    <span className="text-sm text-zinc-500 font-normal ml-1.5">từ</span>
                  </p>
                  {srsStatus && srsStatus.streak > 0 && (
                    <p className="text-[11px] text-orange-400 mt-1.5 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Streak {srsStatus.streak} ngày liên tục</span>
                    </p>
                  )}
                  <Link
                    href="/dashboard/vocabulary"
                    className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 transition-all duration-200 hover:shadow-red-600/30 hover:scale-[1.02]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{(srsStatus?.remainToday ?? 20) > 0 ? "Học từ mới" : "Đã hoàn thành!"}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card: Ôn tập SRS */}
            <div className={`relative overflow-hidden border rounded-2xl p-5 transition-all ${
              (srsStatus?.reviewNow ?? 0) > 0
                ? "bg-gradient-to-br from-amber-950/30 to-zinc-900/80 border-amber-600/30 animate-pulse-slow"
                : "bg-gradient-to-br from-zinc-900 to-zinc-900/80 border-zinc-800/60"
            }`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              {(srsStatus?.reviewNow ?? 0) > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <p className="text-[13px] text-amber-400 font-semibold">Cần ôn tập ngay!</p>
                  </div>
                  <p className="text-3xl font-bold text-white mt-1">
                    {srsStatus?.reviewNow}
                    <span className="text-sm text-zinc-400 font-normal ml-1.5">từ cần ôn</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Ôn ngay để không quên – Hệ thống SRS sẽ nhắc bạn đúng lúc
                  </p>
                  <Link
                    href="/dashboard/review"
                    className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-200 hover:shadow-amber-600/30 hover:scale-[1.02]"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Ôn tập ngay</span>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-[13px] text-zinc-400 font-medium">Ôn tập SRS</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Đã ôn xong!</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Lần ôn tiếp theo: <span className="text-zinc-300 font-medium">{countdown || "—"}</span>
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/30">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hệ thống SRS sẽ nhắc bạn đúng lúc</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────── 2. SRS TIMELINE ─────── */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-white font-semibold flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>Lộ trình ôn tập Spaced Repetition</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Mỗi từ trải qua 8 giai đoạn – ôn đúng lúc trước khi quên</p>
              </div>
            </div>

            {/* Desktop timeline */}
            <div className="hidden sm:block">
              <div className="relative">
                {/* Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800 rounded-full" />
                <div className="flex justify-between relative">
                  {SRS_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={i} className="flex flex-col items-center group relative" style={{ width: `${100 / SRS_STEPS.length}%` }}>
                        {/* Dot */}
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform z-10`}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        {/* Connector arrow */}
                        {i < SRS_STEPS.length - 1 && (
                          <div className="absolute top-5 -right-0.5 text-zinc-700 text-[10px] z-0">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                        {/* Label */}
                        <p className="text-[10px] text-zinc-300 font-semibold mt-2 text-center">{step.label}</p>
                        <p className="text-[9px] text-zinc-600 text-center">{step.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile timeline (vertical) */}
            <div className="sm:hidden space-y-2">
              {SRS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white shrink-0`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-zinc-300 font-semibold">{step.label}</p>
                      <p className="text-[10px] text-zinc-600">{step.sub}</p>
                    </div>
                    {i < SRS_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─────── 3. STATS CARDS ─────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: BookOpen,
                label: "Tổng đã học",
                value: srsStatus?.totalLearned ?? 0,
                sub: `/${srsStatus?.totalStageWords ?? "?"} chặng này`,
                accent: "from-blue-600/15 to-blue-600/5 border-blue-600/15",
                textColor: "text-blue-400",
              },
              {
                icon: RotateCcw,
                label: "Đang ôn tập",
                value: srsStatus?.learningCount ?? 0,
                sub: "trong hệ thống SRS",
                accent: "from-amber-600/15 to-amber-600/5 border-amber-600/15",
                textColor: "text-amber-400",
              },
              {
                icon: Check,
                label: "Đã thuộc",
                value: srsStatus?.masteredCount ?? 0,
                sub: "mastered",
                accent: "from-emerald-600/15 to-emerald-600/5 border-emerald-600/15",
                textColor: "text-emerald-400",
              },
              {
                icon: Flame,
                label: "Streak",
                value: srsStatus?.streak ?? 0,
                sub: "ngày liên tục",
                accent: "from-orange-600/15 to-orange-600/5 border-orange-600/15",
                textColor: "text-orange-400",
              },
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`bg-gradient-to-br ${card.accent} border rounded-2xl p-4 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CardIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 font-medium">{card.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{srsLoading ? "—" : card.value}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* ─────── 4. TOPICS ─────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-300 font-medium">Chủ đề từ vựng</p>
              <span className="text-xs text-zinc-500 bg-zinc-900/60 border border-zinc-800/50 px-3 py-1 rounded-full">
                {vocabTopicsLoading ? "..." : `${vocabTopics.filter(t => t.done > 0).length}/${vocabTopics.length} chủ đề đang học`}
              </span>
            </div>
            
            {vocabTopicsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {vocabTopics.map((topic) => {
                  const progress = topic.words > 0 ? Math.round((topic.done / topic.words) * 100) : 0;
                  return (
                    <div
                      key={topic.id}
                      className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white font-semibold truncate">{topic.label}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{topic.words} từ</p>
                        </div>
                        {progress === 100 && <Check className="w-4 h-4 text-green-400 shrink-0" />}
                      </div>
                      <div className="mt-3.5">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-600">{topic.done}/{topic.words} từ</span>
                          <span className="text-[10px] text-zinc-500 font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5">
                          <div
                            className={`bg-gradient-to-r ${topic.color} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {topic.done === 0 ? (
                        <Link
                          href="/dashboard/vocabulary"
                          className="mt-3 block w-full text-center text-[11px] text-zinc-500 hover:text-white py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
                        >
                          Bắt đầu học
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/vocabulary"
                          className="mt-3 flex items-center justify-center gap-1 w-full text-center text-[11px] text-red-400 hover:text-red-300 py-1.5 rounded-lg border border-red-600/20 hover:border-red-600/40 transition-all"
                        >
                          <span>Tiếp tục</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{topic.done}/{topic.words}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Grammar ── */}
      {activeTab === "grammar" && (
        <div className="space-y-4">
          {/* Dashboard Quick Banner */}
          <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-800/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bảng Điều Khiển Ngữ Pháp Chuyên Sâu</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Phân tích tỷ lệ chính xác, phát hiện chủ đề yếu, theo dõi các chủ đề đã thành thạo theo 5 chặng.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/grammar"
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shrink-0 transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <span>Mở Grammar Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-300 font-medium">
              Danh sách chủ đề ngữ pháp TOEIC từ cơ bản đến nâng cao
            </p>

            {!grammarLoading && !grammarError && (
              <span className="text-xs text-zinc-500 bg-zinc-900/60 border border-zinc-800/50 px-3 py-1 rounded-full">
                {grammarTopics.length} chủ đề
              </span>
            )}
          </div>

          {/* Loading */}
          {grammarLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 bg-zinc-900/60 border border-zinc-800/50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!grammarLoading && grammarError && (
            <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5">
              <p className="text-sm text-red-400">
                {grammarError}
              </p>
            </div>
          )}

          {/* Empty */}
          {!grammarLoading &&
            !grammarError &&
            grammarTopics.length === 0 && (
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-6 text-center">
                <p className="text-zinc-400 text-sm">
                  Chưa có dữ liệu ngữ pháp.
                </p>
              </div>
            )}

          {/* Categories */}
          {!grammarLoading &&
            !grammarError &&
            grammarTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/dashboard/courses/grammar/${topic.id}`}
                className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-xl p-4 flex items-center gap-4 transition-all group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-white font-medium">
                      {topic.name}
                    </p>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border bg-blue-600/15 text-blue-400 border-blue-600/20">
                      Chặng {topic.stage}
                    </span>
                  </div>

                  {topic.description && (
                    <p className="text-[11px] text-zinc-500 mt-1 truncate">
                      {topic.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${topic.progress}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {topic.completedLessons}/{topic.totalLessons} bài
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <p className="text-xs text-zinc-400 font-medium">
                    {topic.progress}%
                  </p>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </Link>
            ))}
        </div>
      )}

      {/* ── Listening ── */}
      {activeTab === "listening" && (
        <div className="space-y-5">
          {/* ─────── HERO: Học tập hàng ngày ─────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-600/8 to-transparent rounded-full -translate-y-12 translate-x-12" />

            {listeningLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
                <div className="h-4 w-72 bg-zinc-800/60 rounded-lg" />
                <div className="h-16 bg-zinc-800/40 rounded-xl mt-4" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[15px] text-white font-bold">Listening hôm nay</p>
                    <p className="text-[11px] text-zinc-500">
                      {listeningStatus?.isOddDay
                        ? "Ngày lẻ — Part 1 (Photographs) + Part 2 (Question-Response)"
                        : "Ngày chẵn — Part 3 (Conversations) + Part 4 (Talks)"}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-zinc-400">
                      Tiến trình: {listeningStatus?.completedToday ?? 0}/{listeningStatus?.dailyGoal ?? 2} Group
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {Math.round(((listeningStatus?.completedToday ?? 0) / (listeningStatus?.dailyGoal ?? 2)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(((listeningStatus?.completedToday ?? 0) / (listeningStatus?.dailyGoal ?? 2)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Today's groups */}
                {(listeningStatus?.completedToday ?? 0) >= (listeningStatus?.dailyGoal ?? 2) ? (
                  <div className="bg-emerald-950/30 border border-emerald-600/20 rounded-xl p-4 text-center">
                    <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Đã hoàn thành Listening hôm nay!</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">Quay lại ngày mai để học 2 Group tiếp theo.</p>
                  </div>
                ) : listeningGroups.length === 0 ? (
                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4 text-center">
                    <p className="text-zinc-400 text-sm">Chưa có dữ liệu Group cho chặng hiện tại.</p>
                    <p className="text-[11px] text-zinc-600 mt-1">Vui lòng liên hệ admin hoặc kiểm tra data.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {listeningGroups.map((group, idx) => {
                        const partInfo = LISTENING_PARTS.find(p => p.part === group.part);
                        const PartIcon = partInfo?.icon || Headphones;
                        const questionCount = group.listening_lesson_questions?.length ?? 0;
                        return (
                          <Link
                            key={group.id}
                            href={`/dashboard/courses/listening/learn?groupId=${group.id}&part=${group.part}`}
                            className="relative bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/40 hover:border-red-600/30 rounded-xl p-4 transition-all group/card hover:shadow-lg hover:shadow-red-600/5"
                          >
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className="text-[10px] font-bold bg-red-600/15 text-red-400 border border-red-600/20 px-2 py-0.5 rounded-md">
                                Group {idx + 1}
                              </span>
                              <span className="text-[10px] text-zinc-600">
                                Part {group.part}
                              </span>
                            </div>

                            {/* Icon + Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                                <PartIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-white font-semibold truncate">
                                  {partInfo?.label || `Part ${group.part}`}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  {[1, 2].includes(group.part)
                                    ? `1 câu hỏi`
                                    : `${questionCount} câu hỏi`}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover/card:text-red-400 transition-colors" />
                            </div>

                            {/* CTA */}
                            <div className="mt-3 text-center text-[11px] font-semibold text-red-400 bg-red-600/8 border border-red-600/15 py-1.5 rounded-lg group-hover/card:bg-red-600/15 transition-all">
                              Bắt đầu học
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Review section */}
                    <div className="mt-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
                        <div>
                          <p className="text-[13px] text-white font-semibold flex items-center gap-1.5">
                            <RotateCcw className="w-4 h-4 text-red-400" />
                            <span>Ôn lại Listening</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Tách riêng khỏi phần học hôm nay, gồm 4 Part review và ôn tập bài đã học.
                          </p>
                        </div>
                        <Link
                          href="/dashboard/courses/listening/review"
                          className="inline-flex items-center justify-center rounded-full border border-red-600/20 bg-red-600/10 px-4 py-2 text-[11px] font-semibold text-red-300 hover:bg-red-600/15 transition"
                        >
                          Đi tới ôn tập bài đã học
                        </Link>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((part) => {
                          const partInfo = LISTENING_PARTS.find((item) => item.part === part);
                          const PartIcon = partInfo?.icon || Headphones;
                          const reviewGroup = listeningReviewGroups.find((group) => group.part === part);
                          const questionCount = reviewGroup?.listening_lesson_questions?.length ?? 0;

                          const cardBody = (
                            <div className={`relative overflow-hidden bg-zinc-800/50 rounded-2xl p-4 transition-all ${reviewGroup ? 'border border-red-600/20 hover:border-red-500/30 shadow-lg shadow-red-600/10' : 'border border-zinc-700/40'}`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${part <= 2 ? 'bg-red-600/10 border border-red-600/20 text-red-400' : 'bg-sky-600/10 border border-sky-500/20 text-sky-300'}`}>
                                  <PartIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-white font-semibold truncate">
                                    {partInfo?.label || `Part ${part}`}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 mt-1">
                                    {partInfo?.desc}
                                  </p>
                                </div>
                                <span className="text-[10px] bg-zinc-900/70 border border-zinc-700/50 text-zinc-400 rounded-full px-2 py-1">
                                  Part {part}
                                </span>
                              </div>

                              <div className="text-[11px] text-zinc-400 mb-4">
                                {reviewGroup
                                  ? `Sẵn sàng ôn lại — ${questionCount} câu hỏi`
                                  : 'Chưa có dữ liệu ôn tập cho phần này'}
                              </div>

                              <div className="text-center">
                                <span className={`inline-flex items-center justify-center w-full rounded-xl py-3 text-[12px] font-semibold ${reviewGroup ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                  {reviewGroup ? 'Ôn lại' : 'Chưa có dữ liệu'}
                                </span>
                              </div>
                            </div>
                          );

                          return reviewGroup ? (
                            <Link
                              key={part}
                              href={`/dashboard/courses/listening/review?part=${part}`}
                              className="block"
                            >
                              {cardBody}
                            </Link>
                          ) : (
                            <div key={part}>{cardBody}</div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Reading ── */}
      {activeTab === "reading" && (
        <div className="space-y-5">
          {/* ─────── HERO: Học tập hàng ngày ─────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-600/8 to-transparent rounded-full -translate-y-12 translate-x-12" />

            {readingLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
                <div className="h-4 w-72 bg-zinc-800/60 rounded-lg" />
                <div className="h-16 bg-zinc-800/40 rounded-xl mt-4" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[15px] text-white font-bold">Reading hôm nay</p>
                    <p className="text-[11px] text-zinc-500">
                      {readingStatus?.isOddDay
                        ? "Ngày lẻ — Part 5 (Incomplete Sentences) + Part 6 (Text Completion)"
                        : "Ngày chẵn — Part 7 (Reading Comprehension)"}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-zinc-400">
                      Tiến trình: {readingStatus?.completedToday ?? 0}/{readingStatus?.dailyGoal ?? 2} Bài
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {Math.round(((readingStatus?.completedToday ?? 0) / (readingStatus?.dailyGoal ?? 2)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(((readingStatus?.completedToday ?? 0) / (readingStatus?.dailyGoal ?? 2)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Today's lessons */}
                {(readingStatus?.completedToday ?? 0) >= (readingStatus?.dailyGoal ?? 2) ? (
                  <div className="bg-emerald-950/30 border border-emerald-600/20 rounded-xl p-4 text-center">
                    <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Đã hoàn thành Reading hôm nay!</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Quay lại ngày mai để học bài tiếp theo.
                    </p>
                  </div>
                ) : readingLessons.length === 0 ? (
                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4 text-center">
                    <p className="text-zinc-400 text-sm">
                      Chưa có dữ liệu bài học cho chặng hiện tại.
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Vui lòng liên hệ admin hoặc kiểm tra data.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {readingLessons.map((lesson, idx) => {
                      const partInfo = READING_PARTS.find(
                        (p) => p.part === lesson.part
                      );
                      const PartIcon = partInfo?.icon || FileText;

                      const questionCount =
                        lesson.reading_lesson_groups?.reduce(
                          (sum, group) =>
                            sum +
                            (group.reading_questions?.length ?? 0),
                          0
                        ) ?? 0;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/courses/reading/learn?lesson=${lesson.id}&group=${lesson.groupId}`}
                          className="relative bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/40 hover:border-red-600/30 rounded-xl p-4 transition-all group/card hover:shadow-lg hover:shadow-red-600/5"
                        >
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-[10px] font-bold bg-red-600/15 text-red-400 border border-red-600/20 px-2 py-0.5 rounded-md">
                              Bài {idx + 1}
                            </span>
                            <span className="text-[10px] text-zinc-600">
                              Part {lesson.part}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <PartIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white font-semibold truncate">
                                {partInfo?.label || `Part ${lesson.part}`}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {questionCount} câu hỏi
                              </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover/card:text-red-400 transition-colors" />
                          </div>

                          <div className="mt-3 text-center text-[11px] font-semibold text-red-400 bg-red-600/8 border border-red-600/15 py-1.5 rounded-lg group-hover/card:bg-red-600/15 transition-all">
                            Bắt đầu học
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* REVIEW READING - LUÔN HIỂN THỊ */}
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
                    <div>
                      <p className="text-[13px] text-white font-semibold flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-red-400" />
                        <span>Ôn lại Reading</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Tách riêng khỏi phần học hôm nay, gồm 3 Part review và ôn tập bài đã học.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/courses/reading/review"
                      className="inline-flex items-center justify-center rounded-full border border-red-600/20 bg-red-600/10 px-4 py-2 text-[11px] font-semibold text-red-300 hover:bg-red-600/15 transition"
                    >
                      Đi tới ôn tập bài đã học
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {[5, 6, 7].map((part) => {
                      const partInfo = READING_PARTS.find(
                        (item) => item.part === part
                      );
                      const PartIcon = partInfo?.icon || FileText;

                      const reviewLesson =
                        readingReviewLessons.find(
                          (lesson) => lesson.part === part
                        );

                      const questionCount =
                        reviewLesson?.reading_lesson_groups?.reduce(
                          (sum, group) =>
                            sum +
                            (group.reading_questions?.length ?? 0),
                          0
                        ) ?? 0;

                      const cardBody = (
                        <div
                          className={`relative overflow-hidden bg-zinc-800/50 rounded-2xl p-4 transition-all h-full flex flex-col ${
                            reviewLesson
                              ? "border border-red-600/20 hover:border-red-500/30 shadow-lg shadow-red-600/10"
                              : "border border-zinc-700/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                part === 5
                                  ? "bg-green-600/10 border border-green-600/20 text-green-400"
                                  : "bg-emerald-600/10 border border-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              <PartIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white font-semibold truncate">
                                {partInfo?.label || `Part ${part}`}
                              </p>
                            </div>

                            <span className="text-[10px] bg-zinc-900/70 border border-zinc-700/50 text-zinc-400 rounded-full px-2 py-1 shrink-0">
                              Part {part}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-500 mb-3 flex-1">
                            {partInfo?.desc}
                          </p>

                          <div className="text-[11px] text-zinc-400 mb-4">
                            {reviewLesson
                              ? `Sẵn sàng ôn lại — ${questionCount} câu`
                              : "Chưa có dữ liệu ôn tập"}
                          </div>

                          <div className="text-center mt-auto">
                            <span
                              className={`inline-flex items-center justify-center w-full rounded-xl py-3 text-[12px] font-semibold ${
                                reviewLesson
                                  ? "bg-red-600 text-white"
                                  : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {reviewLesson
                                ? "Ôn lại"
                                : "Chưa có dữ liệu"}
                            </span>
                          </div>
                        </div>
                      );

                      return reviewLesson ? (
                        <Link
                          key={part}
                          href="/dashboard/courses/reading/review"
                          className="block h-full"
                        >
                          {cardBody}
                        </Link>
                      ) : (
                        <div key={part} className="h-full">
                          {cardBody}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
