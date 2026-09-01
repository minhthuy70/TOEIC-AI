"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookA,
  FileText,
  Brain,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  Settings,
  BarChart3,
  Award,
  ChevronRight,
  Zap,
  Target,
  FileCode2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type LearningTab = "vocabulary" | "grammar";

export default function LearningHubPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("vocabulary");
  const [vocabStats, setVocabStats] = useState<{
    totalWords: number;
    reviewedCount: number;
    masteredCount: number;
    dueCount: number;
  }>({
    totalWords: 600,
    reviewedCount: 142,
    masteredCount: 86,
    dueCount: 18,
  });

  const [grammarStats, setGrammarStats] = useState<{
    totalTopics: number;
    completedTopics: number;
    totalExercises: number;
  }>({
    totalTopics: 24,
    completedTopics: 10,
    totalExercises: 350,
  });

  useEffect(() => {
    // Load dynamic statistics if available
    apiFetch<any>("/vocabulary/dashboard")
      .then((res) => {
        if (res && res.stats) {
          setVocabStats({
            totalWords: res.stats.totalWords || 600,
            reviewedCount: res.stats.learningWords || 142,
            masteredCount: res.stats.masteredWords || 86,
            dueCount: res.stats.dueReviews || 18,
          });
        }
      })
      .catch(() => {});

    apiFetch<any>("/grammar/dashboard")
      .then((res) => {
        if (res) {
          setGrammarStats({
            totalTopics: res.totalCategories || 24,
            completedTopics: res.completedLessons || 10,
            totalExercises: res.totalExercises || 350,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600/15 via-zinc-900/60 to-zinc-900/40 border border-red-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Trung Tâm Học Tập</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30">
                  V1 Core
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Chinh phục Từ vựng TOEIC với thuật toán SRS và Hệ thống Ngữ pháp nền tảng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/review"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition shadow-lg shadow-red-600/20"
            >
              <Brain className="w-4 h-4" />
              <span>Ôn SRS Ngay ({vocabStats.dueCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1.5 max-w-md">
        <button
          onClick={() => setActiveTab("vocabulary")}
          className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "vocabulary"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <BookA className="w-4 h-4" />
          <span>Từ vựng & SRS</span>
        </button>

        <button
          onClick={() => setActiveTab("grammar")}
          className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "grammar"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ngữ pháp Chuyên đề</span>
        </button>
      </div>

      {/* TAB 1: VOCABULARY */}
      {activeTab === "vocabulary" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Kho từ cốt lõi</span>
                <BookA className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{vocabStats.totalWords}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Chuẩn 600 từ TOEIC</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Đang ghi nhớ</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{vocabStats.reviewedCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Đang trong chu kỳ SRS</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Đã thành thạo</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{vocabStats.masteredCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Ghi nhớ vĩnh viễn (Level 5+)</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Cần ôn hôm nay</span>
                <RotateCcw className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">{vocabStats.dueCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Đến hạn Spaced Repetition</p>
            </div>
          </div>

          {/* Action Hub Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Learn New Words */}
            <div className="bg-[#121218] border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/25 text-red-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300">
                    50 Chủ đề TOEIC
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Học Từ Mới & Flashcard</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Luyện từ vựng theo chủ đề: Contracts, Marketing, Finance, Office, Travel... kèm audio phát âm chuẩn, phiên âm IPA, giải nghĩa và ví dụ ngữ cảnh.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/dashboard/vocabulary/statistics"
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Xem thống kê</span>
                </Link>

                <Link
                  href="/dashboard/vocabulary"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                >
                  <span>Mở danh mục từ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* SRS Review */}
            <div className="bg-[#121218] border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-600/25 text-emerald-400 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-600/15 text-emerald-400 border border-emerald-600/25">
                    Hàng đợi: {vocabStats.dueCount} từ
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Ôn Tập Ngắt Quãng SRS</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Thuật toán Spaced Repetition thông minh nhắc bạn ôn lại từ vựng đúng thời điểm trước khi bị lãng quên (sau 30 phút, 3 giờ, 1 ngày, 3 ngày, 7 ngày).
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/dashboard/vocabulary/settings"
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Cài đặt chu kỳ SRS</span>
                </Link>

                <Link
                  href="/dashboard/review"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  <span>Bắt đầu ôn tập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAMMAR */}
      {activeTab === "grammar" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Chuyên đề trọng tâm</span>
                <Layers className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{grammarStats.totalTopics} Chuyên đề</p>
              <p className="text-[11px] text-zinc-500 mt-1">Bao quát 100% Part 5 & 6</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Đã hoàn thành</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{grammarStats.completedTopics} Bài học</p>
              <p className="text-[11px] text-zinc-500 mt-1">Đạt chuẩn lý thuyết & bài tập</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Ngân hàng câu hỏi</span>
                <Award className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{grammarStats.totalExercises}+ Câu</p>
              <p className="text-[11px] text-zinc-500 mt-1">Kèm giải thích chi tiết đáp án</p>
            </div>
          </div>

          {/* Grammar Action Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/25 text-red-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Lý Thuyết Chuyên Đề</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Hệ thống bài giảng: 12 Thì, Mệnh đề quan hệ, Thể bị động, Câu điều kiện, Giới từ & Liên từ...
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/grammar"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                >
                  <span>Học lý thuyết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/25 text-blue-400 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Luyện Tập Trắc Nghiệm</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Luyện giải đề ngữ pháp trắc nghiệm theo dạng bài, tính giờ và chấm điểm tự động tức thì.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/grammar/exercises"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  <span>Luyện trắc nghiệm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-600/25 text-purple-400 flex items-center justify-center mb-3">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Sổ Tay Tra Cứu Quy Tắc</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Tổng hợp bảng công thức, cấu trúc câu đặc biệt và các mẹo bẫy kinh điển trong bài thi TOEIC.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/grammar/reference"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  <span>Tra cứu sổ tay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
