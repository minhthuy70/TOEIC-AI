"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const TABS = [
  { id: "vocabulary", label: "Từ vựng", icon: "📖" },
  { id: "grammar", label: "Ngữ pháp", icon: "📝" },
  { id: "listening", label: "Listening", icon: "🎧" },
  { id: "reading", label: "Reading", icon: "📄" },
];

const VOCAB_TOPICS = [
  { id: 1, label: "Office & Workplace", icon: "🏢", words: 120, done: 85, color: "from-blue-600 to-blue-500" },
  { id: 2, label: "Travel & Transportation", icon: "✈️", words: 95, done: 40, color: "from-cyan-600 to-cyan-500" },
  { id: 3, label: "Banking & Finance", icon: "🏦", words: 110, done: 20, color: "from-green-600 to-green-500" },
  { id: 4, label: "Marketing & Sales", icon: "📊", words: 100, done: 0, color: "from-purple-600 to-purple-500" },
  { id: 5, label: "Human Resources (HR)", icon: "👥", words: 90, done: 0, color: "from-pink-600 to-pink-500" },
  { id: 6, label: "Shipping & Logistics", icon: "🚢", words: 85, done: 0, color: "from-orange-600 to-orange-500" },
  { id: 7, label: "Meetings & Conferences", icon: "🤝", words: 75, done: 0, color: "from-yellow-600 to-yellow-500" },
  { id: 8, label: "Technology & IT", icon: "💻", words: 105, done: 0, color: "from-indigo-600 to-indigo-500" },
];

const GRAMMAR_TOPICS = [
  { id: 1, label: "Các thì tiếng Anh", icon: "⏰", lessons: 12, done: 8, level: "Cơ bản" },
  { id: 2, label: "Từ loại (Word Forms)", icon: "🔤", lessons: 8, done: 5, level: "Cơ bản" },
  { id: 3, label: "Câu bị động", icon: "🔄", lessons: 6, done: 3, level: "Trung bình" },
  { id: 4, label: "Mệnh đề quan hệ", icon: "🔗", lessons: 7, done: 1, level: "Trung bình" },
  { id: 5, label: "Liên từ & Giới từ", icon: "↔️", lessons: 9, done: 0, level: "Trung bình" },
  { id: 6, label: "So sánh", icon: "⚖️", lessons: 5, done: 0, level: "Trung bình" },
  { id: 7, label: "Câu điều kiện", icon: "❓", lessons: 6, done: 0, level: "Nâng cao" },
  { id: 8, label: "Đảo ngữ", icon: "🔀", lessons: 4, done: 0, level: "Nâng cao" },
];

const LISTENING_PARTS = [
  { part: 1, label: "Photographs", icon: "🖼️", questions: 6, desc: "Nghe và chọn ảnh phù hợp", done: 4 },
  { part: 2, label: "Question-Response", icon: "💬", questions: 25, desc: "Nghe câu hỏi và chọn câu trả lời đúng", done: 10 },
  { part: 3, label: "Conversations", icon: "🗣️", questions: 39, desc: "Hội thoại 2-3 người", done: 5 },
  { part: 4, label: "Talks", icon: "🎙️", questions: 30, desc: "Bài nói đơn", done: 0 },
];

const LISTENING_SKILLS = [
  { label: "Shadowing", icon: "🔊", desc: "Luyện phát âm theo người bản ngữ" },
  { label: "Dictation", icon: "✍️", desc: "Nghe và chép lại từng câu" },
  { label: "Speed Training", icon: "⚡", desc: "Nghe theo tốc độ tăng dần 0.75x→1.25x" },
];

const READING_PARTS = [
  { part: 5, label: "Incomplete Sentences", icon: "✏️", questions: 30, desc: "Điền từ vào câu", done: 20 },
  { part: 6, label: "Text Completion", icon: "📝", questions: 16, desc: "Điền vào đoạn văn", done: 8 },
  { part: 7, label: "Reading Comprehension", icon: "📖", questions: 54, desc: "Đọc hiểu đơn, kép, ba đoạn", done: 5 },
];

const READING_SKILLS = [
  { label: "Skimming", icon: "👁️", desc: "Đọc lướt nắm ý chính" },
  { label: "Scanning", icon: "🔍", desc: "Đọc quét tìm thông tin cụ thể" },
  { label: "Single Passage", icon: "📃", desc: "Luyện đọc 1 đoạn văn" },
  { label: "Double Passage", icon: "📄📄", desc: "Luyện đọc 2 đoạn văn liên kết" },
  { label: "Triple Passage", icon: "📰", desc: "Luyện đọc 3 đoạn văn liên kết" },
];

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản": "bg-green-600/15 text-green-400 border-green-600/20",
  "Trung bình": "bg-blue-600/15 text-blue-400 border-blue-600/20",
  "Nâng cao": "bg-purple-600/15 text-purple-400 border-purple-600/20",
};

/* ─── SRS Timeline steps ─── */
const SRS_STEPS = [
  { label: "Học mới", sub: "20 từ/ngày", icon: "📖", color: "from-emerald-500 to-emerald-400" },
  { label: "Lần 1", sub: "30 phút", icon: "🔔", color: "from-yellow-500 to-amber-400" },
  { label: "Lần 2", sub: "3 giờ", icon: "⏰", color: "from-orange-500 to-orange-400" },
  { label: "Lần 3", sub: "10 giờ", icon: "🌙", color: "from-red-500 to-rose-400" },
  { label: "Lần 4", sub: "24 giờ", icon: "📅", color: "from-pink-500 to-pink-400" },
  { label: "Lần 5", sub: "3 ngày", icon: "🗓️", color: "from-purple-500 to-violet-400" },
  { label: "Ôn kỳ", sub: "5 ngày/lần", icon: "🔄", color: "from-blue-500 to-blue-400" },
  { label: "Thuộc", sub: "20 ngày/lần", icon: "✅", color: "from-emerald-600 to-green-500" },
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
  const [srsStatus, setSrsStatus] = useState<SrsStatus | null>(null);
  const [srsLoading, setSrsLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  const loadSrs = useCallback(async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return;
      const { id } = JSON.parse(user);
      const res = await fetch(`http://localhost:3001/vocabulary/srs-status/${id}`);
      const data = await res.json();
      if (data.success) setSrsStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSrsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSrs();
  }, [loadSrs]);

  // Live countdown ticker
  useEffect(() => {
    if (!srsStatus?.nextReview) return;
    const tick = () => setCountdown(formatCountdown(srsStatus.nextReview));
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [srsStatus?.nextReview]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">📚 Học tập</h1>
        <p className="text-zinc-400 text-sm mt-1">Từ vựng · Ngữ pháp · Listening · Reading</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
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
                      <span className="text-base">🔥</span> Streak {srsStatus.streak} ngày liên tục
                    </p>
                  )}
                  <Link
                    href="/dashboard/vocabulary"
                    className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 transition-all duration-200 hover:shadow-red-600/30 hover:scale-[1.02]"
                  >
                    📖 {(srsStatus?.remainToday ?? 20) > 0 ? "Học từ mới" : "Đã hoàn thành!"}
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
                    href="/dashboard/vocabulary"
                    className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-200 hover:shadow-amber-600/30 hover:scale-[1.02]"
                  >
                    🧠 Ôn tập ngay
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-[13px] text-zinc-400 font-medium">Ôn tập SRS</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
                    <span>✅</span> Đã ôn xong!
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Lần ôn tiếp theo: <span className="text-zinc-300 font-medium">{countdown || "—"}</span>
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/30">
                    🧠 Hệ thống SRS sẽ nhắc bạn đúng lúc
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────── 2. SRS TIMELINE ─────── */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-white font-semibold">🧠 Lộ trình ôn tập Spaced Repetition</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Mỗi từ trải qua 8 giai đoạn – ôn đúng lúc trước khi quên</p>
              </div>
            </div>

            {/* Desktop timeline */}
            <div className="hidden sm:block">
              <div className="relative">
                {/* Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800 rounded-full" />
                <div className="flex justify-between relative">
                  {SRS_STEPS.map((step, i) => (
                    <div key={i} className="flex flex-col items-center group relative" style={{ width: `${100 / SRS_STEPS.length}%` }}>
                      {/* Dot */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-base shadow-sm group-hover:scale-110 transition-transform z-10`}>
                        {step.icon}
                      </div>
                      {/* Connector arrow */}
                      {i < SRS_STEPS.length - 1 && (
                        <div className="absolute top-5 -right-0.5 text-zinc-700 text-[10px] z-0">→</div>
                      )}
                      {/* Label */}
                      <p className="text-[10px] text-zinc-300 font-semibold mt-2 text-center">{step.label}</p>
                      <p className="text-[9px] text-zinc-600 text-center">{step.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile timeline (vertical) */}
            <div className="sm:hidden space-y-2">
              {SRS_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-sm shrink-0`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-300 font-semibold">{step.label}</p>
                    <p className="text-[10px] text-zinc-600">{step.sub}</p>
                  </div>
                  {i < SRS_STEPS.length - 1 && <span className="text-zinc-700 text-[10px]">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ─────── 3. STATS CARDS ─────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: "📚",
                label: "Tổng đã học",
                value: srsStatus?.totalLearned ?? 0,
                sub: `/${srsStatus?.totalWordsInStage ?? "?"} chặng này`,
                accent: "from-blue-600/15 to-blue-600/5 border-blue-600/15",
                textColor: "text-blue-400",
              },
              {
                icon: "🔄",
                label: "Đang ôn tập",
                value: srsStatus?.reviewingCount ?? 0,
                sub: "trong hệ thống SRS",
                accent: "from-amber-600/15 to-amber-600/5 border-amber-600/15",
                textColor: "text-amber-400",
              },
              {
                icon: "✅",
                label: "Đã thuộc",
                value: srsStatus?.masteredCount ?? 0,
                sub: "mastered",
                accent: "from-emerald-600/15 to-emerald-600/5 border-emerald-600/15",
                textColor: "text-emerald-400",
              },
              {
                icon: "🔥",
                label: "Streak",
                value: srsStatus?.streak ?? 0,
                sub: "ngày liên tục",
                accent: "from-orange-600/15 to-orange-600/5 border-orange-600/15",
                textColor: "text-orange-400",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.accent} border rounded-2xl p-4 transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{card.icon}</span>
                  <span className="text-[11px] text-zinc-400 font-medium">{card.label}</span>
                </div>
                <p className={`text-2xl font-bold ${card.textColor}`}>{srsLoading ? "—" : card.value}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ─────── 4. TOPICS ─────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-300 font-medium">Chủ đề từ vựng</p>
              <span className="text-xs text-zinc-500 bg-zinc-900/60 border border-zinc-800/50 px-3 py-1 rounded-full">
                {VOCAB_TOPICS.filter(t => t.done > 0).length}/{VOCAB_TOPICS.length} chủ đề đang học
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
              {VOCAB_TOPICS.map((topic) => {
                const progress = Math.round((topic.done / topic.words) * 100);
                return (
                  <div
                    key={topic.id}
                    className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                        {topic.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white font-semibold truncate">{topic.label}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{topic.words} từ</p>
                      </div>
                      {progress === 100 && <span className="text-green-400 text-sm">✓</span>}
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
                        className="mt-3 block w-full text-center text-[11px] text-red-400 hover:text-red-300 py-1.5 rounded-lg border border-red-600/20 hover:border-red-600/40 transition-all"
                      >
                        Tiếp tục → {topic.done}/{topic.words}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Grammar ── */}
      {activeTab === "grammar" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Ngữ pháp TOEIC từ cơ bản đến nâng cao</p>
          {GRAMMAR_TOPICS.map((topic) => {
            const progress = Math.round((topic.done / topic.lessons) * 100);
            return (
              <div
                key={topic.id}
                className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all group"
              >
                <span className="text-xl w-8 text-center">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-white font-medium">{topic.label}</p>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[topic.level]}`}>
                      {topic.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{topic.done}/{topic.lessons} bài</span>
                  </div>
                </div>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">›</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Listening ── */}
      {activeTab === "listening" && (
        <div className="space-y-5">
          {/* Parts */}
          <div>
            <p className="text-sm text-zinc-300 font-medium mb-3">Luyện theo Part</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {LISTENING_PARTS.map((part) => {
                const progress = Math.round((part.done / part.questions) * 100);
                return (
                  <div
                    key={part.part}
                    className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center text-lg">
                        {part.icon}
                      </div>
                      <div>
                        <p className="text-[13px] text-white font-semibold">Part {part.part}: {part.label}</p>
                        <p className="text-[11px] text-zinc-500">{part.questions} câu</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-600 mb-3">{part.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm text-zinc-300 font-medium mb-3">Kỹ năng nâng cao</p>
            <div className="space-y-2">
              {LISTENING_SKILLS.map((skill) => (
                <div
                  key={skill.label}
                  className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-all group"
                >
                  <span className="text-xl w-8 text-center">{skill.icon}</span>
                  <div className="flex-1">
                    <p className="text-[13px] text-white font-medium">{skill.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{skill.desc}</p>
                  </div>
                  <span className="text-xs text-red-400 border border-red-600/20 bg-red-600/8 px-3 py-1 rounded-full group-hover:bg-red-600/15 transition-all">
                    Bắt đầu
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reading ── */}
      {activeTab === "reading" && (
        <div className="space-y-5">
          {/* Parts */}
          <div>
            <p className="text-sm text-zinc-300 font-medium mb-3">Luyện theo Part</p>
            <div className="space-y-3">
              {READING_PARTS.map((part) => {
                const progress = Math.round((part.done / part.questions) * 100);
                return (
                  <div
                    key={part.part}
                    className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600/15 border border-green-600/20 flex items-center justify-center text-lg">
                        {part.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-white font-semibold">Part {part.part}: {part.label}</p>
                        <p className="text-[11px] text-zinc-500">{part.desc} · {part.questions} câu</p>
                      </div>
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">›</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-600 to-green-400 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">{part.done}/{part.questions} câu</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm text-zinc-300 font-medium mb-3">Kỹ năng đọc hiểu</p>
            <div className="space-y-2">
              {READING_SKILLS.map((skill) => (
                <div
                  key={skill.label}
                  className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-all group"
                >
                  <span className="text-xl w-8 text-center">{skill.icon}</span>
                  <div className="flex-1">
                    <p className="text-[13px] text-white font-medium">{skill.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{skill.desc}</p>
                  </div>
                  <span className="text-xs text-green-400 border border-green-600/20 bg-green-600/8 px-3 py-1 rounded-full group-hover:bg-green-600/15 transition-all">
                    Luyện tập
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
