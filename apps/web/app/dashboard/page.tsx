"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import LevelDisplay from "@/components/levels/LevelDisplay";
import {
  Flame,
  Lightbulb,
  FileText,
  Rocket,
  Calendar,
  BarChart3,
  Clock,
  BookOpen,
  FileEdit,
  Target,
  Zap,
  RotateCcw,
  BookMarked,
  Bell,
  Trophy,
  Check,
  Lock,
  ChevronDown,
  Map,
  TrendingUp,
  Sparkles,
  Award,
  ArrowRight,
  ClipboardList,
  BookA,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  PartyPopper,
  Star,
} from "lucide-react";

const STAGES = [
  {
    id: 1, range: "0–300", label: "Chặng 1", title: "Xây dựng nền tảng",
    color: "from-red-600 to-red-500", glow: "shadow-red-600/20",
    border: "border-red-600/25", bg: "bg-red-600/8",
    goals: [
      "Nắm vững 1.000–1.200 từ vựng nền tảng TOEIC",
      "Thành thạo tất cả các thì tiếng Anh (12 thì)",
      "Hiểu các từ loại, cụm từ và collocations cơ bản",
      "Nghe tốc độ chuẩn hội thoại ngắn",
      "Đọc hiểu email, thông báo và đoạn văn ngắn",
      "Làm đúng ≥85% câu hỏi mức dễ → đạt khoảng 400 điểm",
    ]
  },
  {
    id: 2, range: "300–500", label: "Chặng 2", title: "Củng cố nền tảng",
    color: "from-orange-600 to-orange-500", glow: "shadow-orange-600/20",
    border: "border-orange-600/25", bg: "bg-orange-600/8",
    goals: [
      "Tích lũy 2.500–3.000 từ vựng TOEIC theo chủ đề",
      "Thành thạo hầu hết cấu trúc ngữ pháp xuất hiện trong TOEIC",
      "Vận dụng tốt phrasal verbs & word forms",
      "Thành thạo 7 Part TOEIC và chiến thuật làm bài",
      "Đọc nhanh email, memo, advertisement và article ngắn",
      "Đạt khoảng 600 điểm TOEIC",
    ]
  },
  {
    id: 3, range: "500–650", label: "Chặng 3", title: "Thành thạo",
    color: "from-yellow-600 to-yellow-500", glow: "shadow-yellow-600/20",
    border: "border-yellow-600/25", bg: "bg-yellow-600/8",
    goals: [
      "Sở hữu 4.000–4.500 từ vựng TOEIC",
      "Hiểu các cấu trúc ngữ pháp nâng cao & bẫy thường gặp",
      "Sử dụng tốt collocations chuyên sâu theo chủ đề kinh doanh",
      "Nghe tốt hội thoại dài & bài nói nhiều người",
      "Đọc nhanh Single & Multiple Passage",
      "Đạt khoảng 750 điểm TOEIC",
    ]
  },
  {
    id: 4, range: "650–800", label: "Chặng 4", title: "Nâng cao",
    color: "from-blue-600 to-blue-500", glow: "shadow-blue-600/20",
    border: "border-blue-600/25", bg: "bg-blue-600/8",
    goals: [
      "Tích lũy 5.500–6.000 từ vựng TOEIC & từ học thuật",
      "Thành thạo gần như toàn bộ ngữ pháp TOEIC",
      "Nghe tốt nhiều giọng Anh (Mỹ, Anh, Úc, Canada)",
      "Đọc & phân tích nhanh Multiple Passages, nhận diện bẫy",
      "Làm bài trong thời gian quy định với độ chính xác cao",
      "Đạt khoảng 900 điểm TOEIC",
    ]
  },
  {
    id: 5, range: "800–990", label: "Chặng 5", title: "Hoàn thiện",
    color: "from-green-600 to-green-500", glow: "shadow-green-600/20",
    border: "border-green-600/25", bg: "bg-green-600/8",
    goals: [
      "Sở hữu 7.000–8.000 từ vựng cùng hệ thống collocations & idioms",
      "Làm chủ toàn bộ ngữ pháp, từ vựng & chiến thuật làm bài",
      "Nghe hoàn toàn nhiều dạng bài & nhiều giọng tiếng Anh",
      "Đọc nhanh, phân tích chính xác các văn bản dài & phức tạp",
      "Duy trì độ chính xác ≥95% trên tất cả các Part",
      "Đạt 950–990 điểm TOEIC",
    ]
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "statistics" | "analytics" | "goals">("daily");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [goalHistory, setGoalHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  // Fetch goals when period is goals
  useEffect(() => {
    if (period === "goals") {
      fetchGoals();
    }
  }, [period]);

  const fetchGoals = async () => {
    try {
      const res = await apiFetch<any>("/dashboard/goals");
      if (res.success) {
        setGoals(res.goals);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const fetchGoalHistory = async () => {
    try {
      const res = await apiFetch<any>("/dashboard/goals/history");
      if (res.success) {
        setGoalHistory(res.history);
      }
    } catch (error) {
      console.error("Error fetching goal history:", error);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      const res = await apiFetch<any>("/dashboard/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });
      if (res.success) {
        setShowGoalForm(false);
        fetchGoals();
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId: number, goalData: any) => {
    try {
      const res = await apiFetch<any>(`/dashboard/goals/${goalId}`, {
        method: "PUT",
        body: JSON.stringify(goalData),
      });
      if (res.success) {
        setEditingGoal(null);
        fetchGoals();
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      const res = await apiFetch<any>(`/dashboard/goals/${goalId}`, {
        method: "DELETE",
      });
      if (res.success) {
        fetchGoals();
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      let res;
      if (period === "goals") {
        res = await apiFetch<any>("/dashboard/goals");
      } else if (period === "analytics") {
        res = await apiFetch<any>("/dashboard/analytics");
      } else if (period === "statistics") {
        res = await apiFetch<any>("/dashboard/statistics");
      } else if (period === "monthly") {
        res = await apiFetch<any>("/dashboard/monthly");
      } else if (period === "weekly") {
        res = await apiFetch<any>("/dashboard/weekly");
      } else {
        res = await apiFetch<any>("/dashboard/overview");
      }
      setData(res);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-zinc-900 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-32 bg-zinc-900 rounded-2xl"></div>
      </div>
    );
  }

  if (!data) return <div className="text-zinc-400 p-8 text-center">Không thể tải dữ liệu Bảng điều khiển.</div>;

  const { user, score, daily, weekly, recentActivities } = data;
  const currentStageId = score?.stage || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ================================================== */}
      {/* 1. WELCOME BANNER & MOTIVATION QUOTE (9.1) */}
      {/* ================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600/15 via-zinc-900/90 to-zinc-950 border border-red-600/20 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Hệ Thống Theo Dõi Tiến Độ • 9.1 & 9.2
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Chuỗi {daily?.streak?.current || 5} ngày liên tục</span>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white">
              Xin chào, {user?.fullName || "Học viên TOEIC"}
            </h1>

            {/* 11. DAILY MOTIVATION QUOTE */}
            {daily?.dailyMotivationQuote && (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-xs italic text-zinc-300 font-medium leading-relaxed">
                  &quot;{daily.dailyMotivationQuote.quote}&quot; — <span className="text-red-400 font-bold">{daily.dailyMotivationQuote.author}</span>
                </p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{daily.dailyMotivationQuote.translation}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/mock-test"
              className="px-5 py-3 rounded-2xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Thi thử TOEIC</span>
            </Link>

            <Link
              href="/dashboard/courses"
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-xl shadow-red-600/25 transition active:scale-95 flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Tiếp tục học ngay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* PERIOD SWITCHER: DAILY (9.1) VS WEEKLY (9.2) VS MONTHLY (9.3) VS STATISTICS (9.4) VS ANALYTICS (9.5) VS GOALS (9.6) */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-2xl border border-white/5 bg-[#121214] p-1 max-w-4xl">
        <button
          type="button"
          onClick={() => setPeriod("daily")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "daily"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Hôm nay (9.1)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod("weekly")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "weekly"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tuần này (9.2)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod("monthly")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "monthly"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tháng này (9.3)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod("statistics")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "statistics"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Tổng quan (9.4)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod("analytics")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "analytics"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Phân tích (9.5)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod("goals")}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
            period === "goals"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Mục tiêu (9.6)</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* VIEW 1: DAILY DASHBOARD (9.1) */}
      {/* ================================================== */}
      {period === "daily" && (
        <div className="space-y-8 animate-fade-in">
          {/* 5 CARDS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Thời gian học hôm nay</span>
              </span>
              <p className="text-2xl font-black text-white">
                {daily?.studyTime?.todayMinutes || 0} <span className="text-xs text-zinc-400 font-normal">/ {daily?.studyTime?.goalMinutes || 30}p</span>
              </p>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${daily?.studyTime?.progress || 0}%` }} />
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Từ vựng (Mới + Ôn)</span>
              </span>
              <p className="text-2xl font-black text-purple-400">
                {daily?.vocabulary?.totalToday || 0} <span className="text-xs text-zinc-400 font-normal">/ {daily?.vocabulary?.goal || 20} từ</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                {daily?.vocabulary?.learnedToday || 0} mới • {daily?.vocabulary?.reviewedToday || 0} ôn tập
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                <span>Câu luyện tập hôm nay</span>
              </span>
              <p className="text-2xl font-black text-blue-400">
                {daily?.practiceQuestions?.count || 0} <span className="text-xs text-zinc-400 font-normal">câu</span>
              </p>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${daily?.practiceQuestions?.progress || 0}%` }} />
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tỷ lệ chính xác</span>
              </span>
              <p className="text-2xl font-black text-emerald-400">
                {daily?.accuracyRate || 85}%
              </p>
              <span className="text-[10px] text-emerald-300/70 font-semibold block mt-1.5 flex items-center justify-center gap-1">
                <span>Phản xạ rất tốt</span>
                <Zap className="w-3 h-3 text-amber-400" />
              </span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Chuỗi ngày học</span>
              </span>
              <p className="text-2xl font-black text-amber-400">
                {daily?.streak?.current || 5} <span className="text-xs text-zinc-400 font-normal">ngày</span>
              </p>
              <span className="text-[10px] text-zinc-500 block mt-1.5">Kỷ lục: {daily?.streak?.longest || 7} ngày</span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-red-400" />
                <span>Điểm tích lũy</span>
              </span>
              <p className="text-2xl font-black text-red-400">
                <Link href="/dashboard/points" className="hover:text-red-300 transition-colors">
                  {user?.profile?.pointsBalance || 0} <span className="text-xs text-zinc-400 font-normal">PTS</span>
                </Link>
              </p>
              <span className="text-[10px] text-zinc-500 block mt-1.5">Tổng: {user?.profile?.totalPointsEarned || 0} PTS</span>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Hành Động Nhanh (Quick Actions)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Link href="/dashboard/vocabulary" className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group">
                <BookOpen className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Học từ mới</span>
                <span className="text-[10px] text-zinc-500">Flashcard SRS</span>
              </Link>
              <Link href="/dashboard/vocabulary/review" className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group">
                <RotateCcw className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Ôn tập từ vựng</span>
                <span className="text-[10px] text-zinc-500">Spaced Repetition</span>
              </Link>
              <Link href="/dashboard/practice" className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group">
                <FileEdit className="w-6 h-6 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Luyện tập câu</span>
                <span className="text-[10px] text-zinc-500">Part 1 - 7</span>
              </Link>
              <Link href="/dashboard/mock-test" className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group">
                <FileText className="w-6 h-6 text-red-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Thi thử Mini/Full</span>
                <span className="text-[10px] text-zinc-500">Chuẩn format ETS</span>
              </Link>
              <Link href="/dashboard/error-log" className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group col-span-2 sm:col-span-1">
                <BookMarked className="w-6 h-6 text-amber-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Sổ tay câu sai</span>
                <span className="text-[10px] text-zinc-500">Luyện Drill & Phân tích</span>
              </Link>
            </div>
          </div>

          {/* MAIN 2-COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-6">
            <div className="space-y-6">
              {/* Daily Goals Progress Bars */}
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span>Tiến Độ Mục Tiêu Hàng Ngày (Daily Goals)</span>
                  </h3>
                  <span className="text-xs font-black text-red-400">
                    {daily?.tasksCompleted || 0} / {daily?.taskGoal || 4} mục tiêu
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {daily?.dailyGoals?.map((g: any) => (
                    <div key={g.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                          <span>{g.title}</span>
                        </span>
                        <span className="font-bold text-white">{g.current} / {g.target} {g.unit}</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${g.isCompleted ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${g.progress}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">{g.progress}% hoàn thành</span>
                        {g.isCompleted ? <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Đạt mục tiêu</span> : <span className="text-zinc-400">Còn {Math.max(0, g.target - g.current)} {g.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Lịch Trình Học Tập Hôm Nay (Today&apos;s Schedule)</span>
                </h3>
                <div className="space-y-3">
                  {daily?.todaySchedule?.map((s: any, idx: number) => (
                    <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${s.status === "completed" ? "bg-emerald-950/10 border-emerald-500/20" : "bg-zinc-950 border-zinc-800"}`}>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-zinc-400">{s.time}</span>
                        <div>
                          <p className={`text-xs font-semibold ${s.status === "completed" ? "text-emerald-300" : "text-white"}`}>{s.title}</p>
                          <span className="text-[10px] text-zinc-500">{s.category}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${s.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                        {s.status === "completed" ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Đã hoàn thành</span>
                          </>
                        ) : (
                          <span>Sắp tới</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Reviews */}
              {daily?.upcomingReviews && (
                <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-900 to-zinc-950 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      <h3 className="text-sm font-bold text-purple-300">Thông Báo Ôn Tập Sắp Tới (Upcoming Reviews)</h3>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{daily.upcomingReviews.message}</p>
                  </div>
                  <Link href="/dashboard/vocabulary/review" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition shrink-0">
                    <span>Ôn tập ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Today's Achievements */}
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Thành Tích Đạt Được Hôm Nay (Today&apos;s Achievements)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {daily?.todayAchievements?.map((a: any) => (
                    <div key={a.id} className="p-4 rounded-2xl border text-center space-y-1.5 bg-amber-950/10 border-amber-500/30 flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{a.title}</h4>
                      <p className="text-[10px] text-zinc-400">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Score & Roadmap */}
            <div className="space-y-6">
              {/* Level Display */}
              <LevelDisplay />

              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center text-xs text-red-400">
                      <BarChart3 className="w-4 h-4" />
                    </span>
                    <span>Tiến độ đến mục tiêu điểm</span>
                  </h3>
                  <span className="text-sm font-bold text-red-400">{score?.progress || 0}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-3">
                  <div className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-700 relative" style={{ width: `${score?.progress || 0}%` }}>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-red-600/30 border-2 border-red-500" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 mt-3">
                  <span>Hiện tại: <strong className="text-white">{score?.current || 0}</strong></span>
                  <span>Mục tiêu: <strong className="text-green-400">{score?.target || 900}</strong></span>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-600/15 flex items-center justify-center text-xs text-cyan-500">
                    <ClipboardList className="w-4 h-4" />
                  </span>
                  <span>Hoạt động gần đây</span>
                </h3>
                {recentActivities?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Chưa có hoạt động nào.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivities?.map((act: any) => (
                      <div key={act.id} className="flex items-start gap-3 bg-zinc-800/30 p-3 rounded-xl border border-zinc-700/30">
                        <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-zinc-200 line-clamp-2 leading-snug">{act.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{new Date(act.date).toLocaleDateString('vi-VN')} {new Date(act.date).toLocaleTimeString('vi-VN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roadmap stages */}
              <h3 className="text-base font-semibold text-white flex items-center gap-2 px-1 pt-2">
                <Map className="w-4 h-4 text-red-500" />
                <span>Lộ trình học TOEIC</span>
              </h3>
              <div className="space-y-3">
                {STAGES.map((stage) => {
                  const isActive = stage.id === currentStageId;
                  const isDone = stage.id < currentStageId;
                  const isLocked = stage.id > currentStageId;
                  const isOpen = expandedStage === stage.id;

                  return (
                    <div key={stage.id} className={`rounded-2xl border transition-all duration-300 ${isActive ? `${stage.bg} ${stage.border} shadow-lg ${stage.glow}` : isDone ? "bg-zinc-900/40 border-zinc-800/30" : "bg-zinc-900/20 border-zinc-800/20 opacity-60"}`}>
                      <button onClick={() => setExpandedStage(isOpen ? null : stage.id)} className="w-full flex items-center gap-3 p-4 text-left" disabled={isLocked}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${isDone ? "bg-green-600/20 text-green-400 border border-green-600/25" : isActive ? `bg-gradient-to-br ${stage.color} text-white shadow-lg` : "bg-zinc-800 text-zinc-600 border border-zinc-700"}`}>
                          {isDone ? <Check className="w-4 h-4 text-green-400" /> : isLocked ? <Lock className="w-3.5 h-3.5 text-zinc-500" /> : stage.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-bold text-white leading-tight">{stage.label}</p>
                            {isActive && <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Đang học</span>}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{stage.title}</p>
                        </div>
                        {!isLocked && (
                          <ChevronDown
                            className="w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200"
                            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        )}
                      </button>
                      {isOpen && !isLocked && (
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-800/30 mt-1">
                          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-3 flex items-center gap-1">
                            <Target className="w-3 h-3 text-red-400" />
                            <span>Mục tiêu cần đạt</span>
                          </p>
                          <ul className="space-y-1.5">
                            {stage.goals.map((goal, i) => (
                              <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-300">
                                <Check className="w-3.5 h-3.5 text-green-500/70 shrink-0 mt-0.5" />
                                <span className="leading-snug">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 2: WEEKLY DASHBOARD (9.2) */}
      {/* ================================================== */}
      {period === "weekly" && (
        <div className="space-y-8 animate-fade-in">
          {/* 1, 2, 3, 4. WEEKLY SUMMARY 4 CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Weekly study time */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Thời gian học tuần</span>
              </span>
              <div className="text-3xl font-black text-white">
                {weekly?.studyTimeSummary?.totalHours || 5.2}h
                <span className="text-xs text-zinc-400 font-normal"> / {weekly?.studyTimeSummary?.goalHours || 6.0}h</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{weekly?.studyTimeSummary?.vsLastWeek} vs tuần trước</span>
                <span className="text-zinc-500">{weekly?.studyTimeSummary?.progress}%</span>
              </div>
            </div>

            {/* 2. Weekly vocabulary total */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Tổng từ vựng tuần</span>
              </span>
              <div className="text-3xl font-black text-purple-400">
                {weekly?.vocabularyTotal?.totalCount || 140}
                <span className="text-xs text-zinc-400 font-normal"> từ</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{weekly?.vocabularyTotal?.vsLastWeek} vs tuần trước</span>
                <span className="text-zinc-500">{weekly?.vocabularyTotal?.progress}%</span>
              </div>
            </div>

            {/* 3. Weekly practice total */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                <span>Tổng câu luyện tập</span>
              </span>
              <div className="text-3xl font-black text-blue-400">
                {weekly?.practiceTotal?.totalQuestions || 210}
                <span className="text-xs text-zinc-400 font-normal"> câu</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{weekly?.practiceTotal?.vsLastWeek} vs tuần trước</span>
                <span className="text-zinc-500">{weekly?.practiceTotal?.progress}%</span>
              </div>
            </div>

            {/* 4. Weekly accuracy rate */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tỷ lệ chính xác tuần</span>
              </span>
              <div className="text-3xl font-black text-emerald-400">
                {weekly?.accuracyRate?.current || 86}%
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{weekly?.accuracyRate?.diff} so với tuần trước</span>
                <span className="text-zinc-500">82% → 86%</span>
              </div>
            </div>
          </div>

          {/* 7. WEEKLY STREAK VISUALIZATION (Trực quan hóa chuỗi hàng tuần T2-CN) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Trực Quan Hóa Chuỗi Học Tuần (Weekly Streak Visualization)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Theo dõi phong độ học tập 7 ngày trong tuần từ Thứ 2 đến Chủ nhật</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>5 / 7 ngày tích cực</span>
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
              {weekly?.streakVisualization?.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition flex flex-col items-center ${
                    s.isToday
                      ? "bg-red-600/20 border-red-500 shadow-lg shadow-red-600/20"
                      : s.active
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-zinc-950 border-zinc-800 opacity-60"
                  }`}
                >
                  <span className="text-[10px] text-zinc-400 font-bold block">{s.day}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                    {s.active ? <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> : <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />}
                  </div>
                  <span className="text-[11px] font-bold text-white block">{s.minutes > 0 ? `${s.minutes}p` : "—"}</span>
                  <span className="text-[9px] text-zinc-500 block">{s.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 & 6. WEEKLY TEST SCORES & GOALS PROGRESS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5. Weekly Test Scores */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Điểm Kiểm Tra Hàng Tuần (Weekly Test Scores)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Kết quả các bài thi thử đã hoàn thành trong 7 ngày qua</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                  {weekly?.weeklyTestScores?.scoreChange}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Mới nhất</span>
                  <div className="text-2xl font-black text-white">{weekly?.weeklyTestScores?.latestScore || 750}</div>
                  <span className="text-[10px] text-zinc-400">ETS Test Format</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Cao nhất</span>
                  <div className="text-2xl font-black text-emerald-400">{weekly?.weeklyTestScores?.highestScore || 780}</div>
                  <span className="text-[10px] text-emerald-300/70 font-semibold flex items-center justify-center gap-1">
                    <span>Kỷ lục tuần</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Đã làm</span>
                  <div className="text-2xl font-black text-purple-400">{weekly?.weeklyTestScores?.testsTaken || 2} bài</div>
                  <span className="text-[10px] text-zinc-400">Trung bình: {weekly?.weeklyTestScores?.averageScore || 760}</span>
                </div>
              </div>
            </div>

            {/* 6. Weekly Goals Progress */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span>Tiến Độ Mục Tiêu Tuần (Weekly Goals Progress)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Các cột mốc mục tiêu đã đề ra trong tuần</p>
              </div>

              <div className="space-y-3 pt-1">
                {weekly?.weeklyGoalsProgress?.map((g: any) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">{g.name}</span>
                      <span className="font-bold text-white">{g.current} / {g.target} ({g.progress}%)</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          g.isCompleted ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 8. DAY-BY-DAY BREAKDOWN (Phân tích từng ngày) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Phân Tích Từng Ngày Trong Tuần (Day-by-Day Breakdown)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Chi tiết số phút học, từ vựng tích lũy và số câu hỏi làm theo từng ngày</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Từ vựng</th>
                    <th className="py-3 px-4">Câu làm</th>
                    <th className="py-3 px-4">Độ chính xác</th>
                    <th className="py-3 px-4">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {weekly?.dayByDayBreakdown?.map((d: any, idx: number) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] transition ${d.isToday ? "bg-red-600/10 font-bold" : ""}`}>
                      <td className="py-3 px-4 text-white">
                        {d.day} <span className="text-[10px] text-zinc-500">({d.date})</span>
                        {d.isToday && <span className="ml-2 text-[9px] bg-red-600/30 text-red-300 px-1.5 py-0.5 rounded">Hôm nay</span>}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{d.minutes > 0 ? `${d.minutes} phút` : "—"}</td>
                      <td className="py-3 px-4 text-purple-400 font-semibold">{d.vocab > 0 ? `+${d.vocab} từ` : "—"}</td>
                      <td className="py-3 px-4 text-blue-400 font-semibold">{d.questions > 0 ? `${d.questions} câu` : "—"}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{d.accuracy > 0 ? `${d.accuracy}%` : "—"}</td>
                      <td className="py-3 px-4 text-zinc-400">
                        {d.minutes >= 50 ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Xuất sắc</span>
                          </span>
                        ) : d.minutes > 0 ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Tốt</span>
                          </span>
                        ) : (
                          <span>Nghỉ ngơi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. WEEKLY COMPARISON (VS LAST WEEK) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>So Sánh Hiệu Suất Tuần Này vs Tuần Trước (Weekly Comparison)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Mức độ tăng trưởng và tiến bộ của bạn sau 7 ngày rèn luyện</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Thời gian học</span>
                <div className="text-2xl font-black text-emerald-400">{weekly?.weeklyComparison?.studyTime?.value}</div>
                <p className="text-[11px] text-zinc-400">{weekly?.weeklyComparison?.studyTime?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Tích lũy từ vựng</span>
                <div className="text-2xl font-black text-emerald-400">{weekly?.weeklyComparison?.vocabulary?.value}</div>
                <p className="text-[11px] text-zinc-400">{weekly?.weeklyComparison?.vocabulary?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Độ chính xác</span>
                <div className="text-2xl font-black text-emerald-400">{weekly?.weeklyComparison?.accuracy?.value}</div>
                <p className="text-[11px] text-zinc-400">{weekly?.weeklyComparison?.accuracy?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Điểm thi thử</span>
                <div className="text-2xl font-black text-emerald-400">{weekly?.weeklyComparison?.testScore?.value}</div>
                <p className="text-[11px] text-zinc-400">{weekly?.weeklyComparison?.testScore?.label}</p>
              </div>
            </div>
          </div>

          {/* 10 & 11. WEEKLY ACHIEVEMENTS & HIGHLIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 10. Weekly Achievements */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Thành Tích Hàng Tuần (Weekly Achievements)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {weekly?.weeklyAchievements?.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-2xl border text-center space-y-1.5 bg-amber-950/10 border-amber-500/30 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white">{a.title}</h4>
                    <p className="text-[10px] text-zinc-400">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 11. Weekly Highlights */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Điểm Nổi Bật Hàng Tuần (Weekly Highlights)</span>
              </h3>
              <div className="space-y-2.5">
                {weekly?.weeklyHighlights?.map((h: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 3: MONTHLY DASHBOARD (9.3) */}
      {/* ================================================== */}
      {period === "monthly" && (
        <div className="space-y-8 animate-fade-in">
          {/* 1, 2, 3, 4. MONTHLY SUMMARY 4 CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Monthly study time */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Thời gian học tháng</span>
              </span>
              <div className="text-3xl font-black text-white">
                {data?.monthly?.studyTimeSummary?.totalHours || 20.8}h
                <span className="text-xs text-zinc-400 font-normal"> / {data?.monthly?.studyTimeSummary?.goalHours || 15.0}h</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{data?.monthly?.studyTimeSummary?.vsLastMonth} vs tháng trước</span>
                <span className="text-zinc-500">{data?.monthly?.studyTimeSummary?.progress}%</span>
              </div>
            </div>

            {/* 2. Monthly vocabulary total */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Tổng từ vựng tháng</span>
              </span>
              <div className="text-3xl font-black text-purple-400">
                {data?.monthly?.vocabularyTotal?.totalCount || 460}
                <span className="text-xs text-zinc-400 font-normal"> từ</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{data?.monthly?.vocabularyTotal?.vsLastMonth} vs tháng trước</span>
                <span className="text-zinc-500">{data?.monthly?.vocabularyTotal?.progress}%</span>
              </div>
            </div>

            {/* 3. Monthly practice total */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                <span>Tổng câu luyện tập</span>
              </span>
              <div className="text-3xl font-black text-blue-400">
                {data?.monthly?.practiceTotal?.totalQuestions || 695}
                <span className="text-xs text-zinc-400 font-normal"> câu</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{data?.monthly?.practiceTotal?.vsLastMonth} vs tháng trước</span>
                <span className="text-zinc-500">{data?.monthly?.practiceTotal?.progress}%</span>
              </div>
            </div>

            {/* 4. Monthly accuracy rate */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tỷ lệ chính xác tháng</span>
              </span>
              <div className="text-3xl font-black text-emerald-400">
                {data?.monthly?.accuracyRate?.current || 86}%
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">{data?.monthly?.accuracyRate?.diff} so với tháng trước</span>
                <span className="text-zinc-500">83% → 86%</span>
              </div>
            </div>
          </div>

          {/* 7. MONTHLY STREAK VISUALIZATION (Calendar view) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Trực Quan Hóa Chuỗi Học Tháng (Monthly Streak Visualization)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Theo dõi phong độ học tập 30 ngày trong tháng</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>21 / 30 ngày tích cực</span>
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 pt-2">
              {data?.monthly?.streakVisualization?.map((day: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-center space-y-1 transition flex flex-col items-center ${
                    day.isToday
                      ? "bg-red-600/20 border-red-500 shadow-lg shadow-red-600/20"
                      : day.active
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-zinc-950 border-zinc-800 opacity-60"
                  }`}
                >
                  <span className="text-[9px] text-zinc-400 font-bold block">{day.day}</span>
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                    {day.active ? <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                  </div>
                  <span className="text-[9px] font-bold text-white block">{day.minutes > 0 ? `${day.minutes}p` : "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 & 6. MONTHLY TEST SCORES & GOALS PROGRESS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5. Monthly Test Scores */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Điểm Kiểm Tra Hàng Tháng (Monthly Test Scores)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Kết quả các bài thi thử đã hoàn thành trong tháng</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                  {data?.monthly?.monthlyTestScores?.scoreChange}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Mới nhất</span>
                  <div className="text-2xl font-black text-white">{data?.monthly?.monthlyTestScores?.latestScore || 750}</div>
                  <span className="text-[10px] text-zinc-400">ETS Test Format</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Cao nhất</span>
                  <div className="text-2xl font-black text-emerald-400">{data?.monthly?.monthlyTestScores?.highestScore || 780}</div>
                  <span className="text-[10px] text-emerald-300/70 font-semibold flex items-center justify-center gap-1">
                    <span>Kỷ lục tháng</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Đã làm</span>
                  <div className="text-2xl font-black text-purple-400">{data?.monthly?.monthlyTestScores?.testsTaken || 6} bài</div>
                  <span className="text-[10px] text-zinc-400">Trung bình: {data?.monthly?.monthlyTestScores?.averageScore || 760}</span>
                </div>
              </div>
            </div>

            {/* 6. Monthly Goals Progress */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span>Tiến Độ Mục Tiêu Tháng (Monthly Goals Progress)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Các cột mốc mục tiêu đã đề ra trong tháng</p>
              </div>

              <div className="space-y-3 pt-1">
                {data?.monthly?.monthlyGoalsProgress?.map((g: any) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">{g.name}</span>
                      <span className="font-bold text-white">{g.current} / {g.target} ({g.progress}%)</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          g.isCompleted ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 8. WEEK-BY-WEEK BREAKDOWN */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Phân Tích Từng Tuần Trong Tháng (Week-by-Week Breakdown)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Chi tiết hiệu suất học tập theo từng tuần</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Tuần</th>
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Từ vựng</th>
                    <th className="py-3 px-4">Câu làm</th>
                    <th className="py-3 px-4">Độ chính xác</th>
                    <th className="py-3 px-4">Bài thi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data?.monthly?.weekByWeekBreakdown?.map((week: any, idx: number) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] transition ${week.isCurrent ? "bg-red-600/10 font-bold" : ""}`}>
                      <td className="py-3 px-4 text-white">
                        {week.week}
                        {week.isCurrent && <span className="ml-2 text-[9px] bg-red-600/30 text-red-300 px-1.5 py-0.5 rounded">Hiện tại</span>}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{week.date}</td>
                      <td className="py-3 px-4 text-amber-400 font-semibold">{week.studyTime > 0 ? `${week.studyTime} phút` : "—"}</td>
                      <td className="py-3 px-4 text-purple-400 font-semibold">{week.vocab > 0 ? `+${week.vocab} từ` : "—"}</td>
                      <td className="py-3 px-4 text-blue-400 font-semibold">{week.practice > 0 ? `${week.practice} câu` : "—"}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{week.accuracy > 0 ? `${week.accuracy}%` : "—"}</td>
                      <td className="py-3 px-4 text-zinc-400">{week.tests > 0 ? `${week.tests} bài` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. MONTHLY COMPARISON (VS LAST MONTH) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>So Sánh Hiệu Suất Tháng Này vs Tháng Trước (Monthly Comparison)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Mức độ tăng trưởng và tiến bộ của bạn sau 30 ngày rèn luyện</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Thời gian học</span>
                <div className="text-2xl font-black text-emerald-400">{data?.monthly?.monthlyComparison?.studyTime?.value}</div>
                <p className="text-[11px] text-zinc-400">{data?.monthly?.monthlyComparison?.studyTime?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Tích lũy từ vựng</span>
                <div className="text-2xl font-black text-emerald-400">{data?.monthly?.monthlyComparison?.vocabulary?.value}</div>
                <p className="text-[11px] text-zinc-400">{data?.monthly?.monthlyComparison?.vocabulary?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Độ chính xác</span>
                <div className="text-2xl font-black text-emerald-400">{data?.monthly?.monthlyComparison?.accuracy?.value}</div>
                <p className="text-[11px] text-zinc-400">{data?.monthly?.monthlyComparison?.accuracy?.label}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Luyện tập</span>
                <div className="text-2xl font-black text-emerald-400">{data?.monthly?.monthlyComparison?.practice?.value}</div>
                <p className="text-[11px] text-zinc-400">{data?.monthly?.monthlyComparison?.practice?.label}</p>
              </div>
            </div>
          </div>

          {/* 10. MONTHLY ACHIEVEMENTS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Thành Tích Hàng Tháng (Monthly Achievements)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data?.monthly?.monthlyAchievements?.map((a: any) => (
                <div key={a.id} className="p-4 rounded-2xl border text-center space-y-1.5 bg-amber-950/10 border-amber-500/30 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{a.title}</h4>
                  <p className="text-[10px] text-zinc-400">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 11. ADDITIONAL METRICS: Placement Test, Stage Progress, Time to Goal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Placement Test Score */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Điểm Kiểm Tra Xếp Loại (Placement Test)</span>
              </h3>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Điểm xếp loại hiện tại</span>
                <div className="text-3xl font-black text-white">{data?.monthly?.placementTestScore || 750}</div>
                <span className="text-[10px] text-zinc-400">Cấp độ TOEIC</span>
              </div>
            </div>

            {/* Stage Progress Percentage */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-red-500" />
                <span>Tiến Độ Chặng Hiện Tại (Stage Progress)</span>
              </h3>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Chặng {score?.stage || 3}</span>
                <div className="text-3xl font-black text-white">{data?.monthly?.stageProgressPercentage || 65}%</div>
                <span className="text-[10px] text-zinc-400">Hoàn thành chặng hiện tại</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full" style={{ width: `${data?.monthly?.stageProgressPercentage || 65}%` }} />
              </div>
            </div>

            {/* Time to Goal Estimation */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Ước Tính Thời Gian Đến Mục Tiêu (Time to Goal)</span>
              </h3>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Để đạt {score?.target || 900} điểm</span>
                <div className="text-3xl font-black text-white">{data?.monthly?.timeToGoalEstimation?.monthsToGoal || 3} tháng</div>
                <span className="text-[10px] text-zinc-400">{data?.monthly?.timeToGoalEstimation?.daysToGoal || 90} ngày</span>
              </div>
              <p className="text-xs text-zinc-400 text-center">Dự kiến hoàn thành: <span className="text-emerald-400 font-bold">{data?.monthly?.timeToGoalEstimation?.targetDate || "30/11/2026"}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 4: STATISTICS OVERVIEW (9.4) */}
      {/* ================================================== */}
      {period === "statistics" && (
        <div className="space-y-8 animate-fade-in">
          {/* 1-5. OVERALL STATISTICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Total Study Time */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Tổng thời gian học</span>
              </span>
              <div className="text-3xl font-black text-white">
                {data?.statistics?.totalStudyTime?.totalHours || 120.5}h
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">{data?.statistics?.totalStudyTime?.totalDays || 5} ngày</span>
                <span className="text-amber-400 font-semibold">Tất cả thời gian</span>
              </div>
            </div>

            {/* 2. Total Vocabulary Learned */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Tổng từ vựng đã học</span>
              </span>
              <div className="text-3xl font-black text-purple-400">
                {data?.statistics?.totalVocabularyLearned || 1250}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Từ vựng</span>
                <span className="text-purple-400 font-semibold">Tích lũy</span>
              </div>
            </div>

            {/* 3. Total Practice Questions */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                <span>Tổng câu luyện tập</span>
              </span>
              <div className="text-3xl font-black text-blue-400">
                {data?.statistics?.totalPracticeQuestions || 4500}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Câu hỏi</span>
                <span className="text-blue-400 font-semibold">Tất cả</span>
              </div>
            </div>

            {/* 4. Total Tests Taken */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>Tổng kiểm tra đã làm</span>
              </span>
              <div className="text-3xl font-black text-red-400">
                {data?.statistics?.totalTestsTaken || 24}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Bài thi</span>
                <span className="text-red-400 font-semibold">Thử</span>
              </div>
            </div>

            {/* 5. Average Accuracy Rate */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tỷ lệ chính xác TB</span>
              </span>
              <div className="text-3xl font-black text-emerald-400">
                {data?.statistics?.averageAccuracyRate || 85}%
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Trung bình</span>
                <span className="text-emerald-400 font-semibold">Tất cả</span>
              </div>
            </div>
          </div>

          {/* 6-7. STREAK & STAGE INFORMATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6. Streak Information */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Thông Tin Chuỗi Học (Streak Information)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Chuỗi hiện tại</span>
                  <div className="text-3xl font-black text-amber-400">{data?.statistics?.streak?.current || 5}</div>
                  <span className="text-[10px] text-zinc-400">ngày liên tục</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Chuỗi dài nhất</span>
                  <div className="text-3xl font-black text-red-400">{data?.statistics?.streak?.longest || 7}</div>
                  <span className="text-[10px] text-zinc-400">ngày kỷ lục</span>
                </div>
              </div>
            </div>

            {/* 7. Stage Information */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-red-500" />
                <span>Thông Tin Chặng (Stage Information)</span>
              </h3>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Chặng hiện tại</span>
                  <span className="font-bold text-white">{data?.statistics?.stage?.label || "Chặng 3: Thành thạo"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Ngày bắt đầu</span>
                  <span className="font-bold text-white">{data?.statistics?.stage?.startDate || "15/06/2024"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Tiến độ</span>
                  <span className="font-bold text-white">{data?.statistics?.stage?.progressPercentage || 65}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full" style={{ width: `${data?.statistics?.stage?.progressPercentage || 65}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Ngày hoàn thành ước tính</span>
                  <span className="font-bold text-emerald-400">{data?.statistics?.stage?.estimatedCompletionDate || "30/11/2026"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 8. OVERALL SCORE PROGRESSION */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Tiến Độ Điểm Tổng Thể (Overall Score Progression)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Lịch sử điểm số TOEIC theo thời gian</p>
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {data?.statistics?.scoreProgression?.map((point: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-zinc-900 rounded-t-lg relative overflow-hidden transition-all hover:bg-zinc-800"
                      style={{ height: `${(point.score / 990) * 100}%`, minHeight: '40px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-red-400/30" />
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white">{point.score}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-semibold">{point.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 9. SKILL BALANCE (LISTENING VS READING) */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Cân Bằng Kỹ Năng (Skill Balance: Listening vs Reading)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Phân tích độ cân bằng giữa kỹ năng Nghe và Đọc</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Listening */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Listening</span>
                  </span>
                  <span className="text-xs font-bold text-blue-400">{data?.statistics?.skillBalance?.listening?.progress || 72}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data?.statistics?.skillBalance?.listening?.progress || 72}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{data?.statistics?.skillBalance?.listening?.completedLessons || 45} bài hoàn thành</span>
                  <span>Điểm TB: {data?.statistics?.skillBalance?.listening?.averageScore || 78}</span>
                </div>
              </div>

              {/* Reading */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Reading</span>
                  </span>
                  <span className="text-xs font-bold text-purple-400">{data?.statistics?.skillBalance?.reading?.progress || 68}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data?.statistics?.skillBalance?.reading?.progress || 68}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{data?.statistics?.skillBalance?.reading?.completedLessons || 42} bài hoàn thành</span>
                  <span>Điểm TB: {data?.statistics?.skillBalance?.reading?.averageScore || 82}</span>
                </div>
              </div>
            </div>

            {/* Balance Status */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Trạng thái cân bằng</span>
              <span className={`text-sm font-black ${
                data?.statistics?.skillBalance?.balance === "balanced" 
                  ? "text-emerald-400" 
                  : data?.statistics?.skillBalance?.balance === "listening_dominant"
                  ? "text-blue-400"
                  : "text-purple-400"
              }`}>
                {data?.statistics?.skillBalance?.balance === "balanced" 
                  ? "Cân bằng tốt" 
                  : data?.statistics?.skillBalance?.balance === "listening_dominant"
                  ? "Nghe mạnh hơn"
                  : "Đọc mạnh hơn"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 5: DETAILED ANALYTICS (9.5) */}
      {/* ================================================== */}
      {period === "analytics" && (
        <div className="space-y-8 animate-fade-in">
          {/* 1-4. CHARTS ROW (Study Time, Vocabulary, Accuracy, Score) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Study Time Charts */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Biểu Đồ Thời Gian Học (Study Time Charts)</span>
              </h3>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-2">Hàng ngày (14 ngày gần nhất)</span>
                  <div className="flex items-end gap-1 h-24">
                    {data?.analytics?.studyTimeCharts?.daily?.slice(-14).map((day: any, idx: number) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-amber-500/30 rounded-t transition-all hover:bg-amber-500/50"
                          style={{ height: `${(day.minutes / 60) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-[8px] text-zinc-500">{day.date.split('/')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-2">Hàng tuần</span>
                  <div className="flex items-end gap-1 h-16">
                    {data?.analytics?.studyTimeCharts?.weekly?.map((week: any, idx: number) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-amber-500/50 rounded-t transition-all hover:bg-amber-500/70"
                          style={{ height: `${(week.hours / 7) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-[8px] text-zinc-500">{week.week.split(' ')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vocabulary Growth Charts */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Biểu Đồ Tăng Trưởng Từ Vựng (Vocabulary Growth)</span>
              </h3>
              <div className="pt-2">
                <div className="flex items-end gap-2 h-32">
                  {data?.analytics?.vocabularyGrowthCharts?.map((point: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-purple-500/30 rounded-t transition-all hover:bg-purple-500/50"
                        style={{ height: `${(point.total / 1500) * 100}%`, minHeight: '8px' }}
                      />
                      <span className="text-[9px] font-bold text-purple-400">{point.total}</span>
                      <span className="text-[8px] text-zinc-500">{point.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Accuracy Trend Charts */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Biểu Đồ Xu Hướng Độ Chính Xác (Accuracy Trend)</span>
              </h3>
              <div className="pt-2">
                <div className="flex items-end gap-2 h-32">
                  {data?.analytics?.accuracyTrendCharts?.map((point: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-emerald-500/30 rounded-t transition-all hover:bg-emerald-500/50"
                        style={{ height: `${point.accuracy}%`, minHeight: '8px' }}
                      />
                      <span className="text-[9px] font-bold text-emerald-400">{point.accuracy}%</span>
                      <span className="text-[8px] text-zinc-500">{point.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Score Progression Charts */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Biểu Đồ Tiến Độ Điểm (Score Progression)</span>
              </h3>
              <div className="pt-2">
                <div className="flex items-end gap-2 h-32">
                  {data?.analytics?.scoreProgressionCharts?.map((point: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-indigo-500/30 rounded-t transition-all hover:bg-indigo-500/50"
                        style={{ height: `${(point.score / 990) * 100}%`, minHeight: '8px' }}
                      />
                      <span className="text-[9px] font-bold text-indigo-400">{point.score}</span>
                      <span className="text-[8px] text-zinc-500">{point.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5-6. STREAK & SRS LEVEL DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5. Streak Visualization */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Trực Quan Hóa Chuỗi (Streak Visualization)</span>
              </h3>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 pt-2">
                {data?.analytics?.streakVisualization?.map((day: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center space-y-1 transition flex flex-col items-center ${
                      day.isToday
                        ? "bg-red-600/20 border-red-500 shadow-lg shadow-red-600/20"
                        : day.active
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-zinc-950 border-zinc-800 opacity-60"
                    }`}
                  >
                    <span className="text-[9px] text-zinc-400 font-bold block">{day.day}</span>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                      {day.active ? <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                    </div>
                    <span className="text-[9px] font-bold text-white block">{day.minutes > 0 ? `${day.minutes}p` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. SRS Level Distribution */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Phân Phối Mức SRS (SRS Level Distribution)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {data?.analytics?.srsLevelDistribution?.map((level: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">{level.level}</span>
                      <span className="font-bold text-white">{level.count} từ ({level.percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${level.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-8. PART-WISE & TOPIC-WISE PERFORMANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7. Part-wise Performance */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-blue-400" />
                <span>Hiệu Suất Theo Phần (Part-wise Performance)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {data?.analytics?.partWisePerformance?.map((part: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">{part.part}</span>
                      <span className="font-bold text-white">{part.accuracy}% ({part.completed} bài)</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          part.accuracy >= 90 ? "bg-emerald-500" : part.accuracy >= 80 ? "bg-blue-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${part.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Topic-wise Performance */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookA className="w-4 h-4 text-purple-400" />
                <span>Hiệu Suất Theo Chủ Đề (Topic-wise Performance)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {data?.analytics?.topicWisePerformance?.map((topic: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300 truncate">{topic.topic}</span>
                      <span className="font-bold text-white">{topic.accuracy}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          topic.accuracy >= 90 ? "bg-emerald-500" : topic.accuracy >= 85 ? "bg-purple-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 9. TIME MANAGEMENT ANALYSIS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Phân Tích Quản Lý Thời Gian (Time Management Analysis)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Thời gian tối ưu</span>
                <div className="text-lg font-black text-amber-400">{data?.analytics?.timeManagementAnalysis?.optimalStudyTime || "19:00 - 21:00"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Buổi cao điểm</span>
                <div className="text-lg font-black text-emerald-400">{data?.analytics?.timeManagementAnalysis?.peakPerformanceHours?.join(", ") || "8, 9, 19, 20, 21"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Trung bình/buổi</span>
                <div className="text-lg font-black text-blue-400">{data?.analytics?.timeManagementAnalysis?.averageSessionDuration || 45} phút</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Dài nhất</span>
                <div className="text-lg font-black text-purple-400">{data?.analytics?.timeManagementAnalysis?.longestSession || 90} phút</div>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-2">Phân bổ thời gian</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-center">
                  <span className="text-[9px] text-zinc-400 block">Từ vựng</span>
                  <span className="text-sm font-bold text-purple-400">{data?.analytics?.timeManagementAnalysis?.timeDistribution?.vocabulary || 35}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                  <span className="text-[9px] text-zinc-400 block">Ngữ pháp</span>
                  <span className="text-sm font-bold text-emerald-400">{data?.analytics?.timeManagementAnalysis?.timeDistribution?.grammar || 20}%</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-center">
                  <span className="text-[9px] text-zinc-400 block">Nghe</span>
                  <span className="text-sm font-bold text-blue-400">{data?.analytics?.timeManagementAnalysis?.timeDistribution?.listening || 25}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                  <span className="text-[9px] text-zinc-400 block">Đọc</span>
                  <span className="text-sm font-bold text-amber-400">{data?.analytics?.timeManagementAnalysis?.timeDistribution?.reading || 20}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 10-11. WEAKNESS HEAT MAP & STRENGTH IDENTIFICATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 10. Weakness Heat Map */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Bản Đồ Nhiệt Điểm Yếu (Weakness Heat Map)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {data?.analytics?.weaknessHeatMap?.map((weakness: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-rose-950/10 border border-rose-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{weakness.skill}</span>
                      <span className="text-xs font-bold text-rose-400">{weakness.weakness}% yếu</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mb-1">
                      <div 
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${weakness.weakness}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">{weakness.recommendations}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 11. Strength Identification */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Xác Định Điểm Mạnh (Strength Identification)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {data?.analytics?.strengthIdentification?.map((strength: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-emerald-950/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{strength.skill}</span>
                      <span className="text-xs font-bold text-emerald-400">{strength.strength}% mạnh</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mb-1">
                      <div 
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${strength.strength}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-300 font-semibold">{strength.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 12-13. PROGRESS VELOCITY & GOAL ACHIEVEMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 12. Progress Velocity */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Tốc Độ Tiến Độ (Progress Velocity)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Hiện tại</span>
                  <div className="text-2xl font-black text-indigo-400">{data?.analytics?.progressVelocity?.currentVelocity || 2.5}</div>
                  <span className="text-[10px] text-zinc-400">điểm/ngày</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Trung bình</span>
                  <div className="text-2xl font-black text-zinc-400">{data?.analytics?.progressVelocity?.averageVelocity || 2.0}</div>
                  <span className="text-[10px] text-zinc-400">điểm/ngày</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Cao nhất</span>
                  <div className="text-2xl font-black text-emerald-400">{data?.analytics?.progressVelocity?.peakVelocity || 3.5}</div>
                  <span className="text-[10px] text-zinc-400">điểm/ngày</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Xu hướng</span>
                  <div className="text-2xl font-black text-amber-400">
                    {data?.analytics?.progressVelocity?.velocityTrend === "increasing" ? "↑ Tăng" : "→ Ổn"}
                  </div>
                  <span className="text-[10px] text-zinc-400">tốc độ</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center">
                <span className="text-[10px] text-zinc-400">Ước tính đến mục tiêu: </span>
                <span className="text-sm font-bold text-indigo-400">{data?.analytics?.progressVelocity?.estimatedTimeToGoal || 90} ngày</span>
              </div>
            </div>

            {/* 13. Goal Achievement Rate */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Tỷ Lệ Đạt Mục Tiêu (Goal Achievement Rate)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Mục tiêu ngày</span>
                  <div className="text-2xl font-black text-emerald-400">{data?.analytics?.goalAchievementRate?.dailyGoals || 85}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Mục tiêu tuần</span>
                  <div className="text-2xl font-black text-blue-400">{data?.analytics?.goalAchievementRate?.weeklyGoals || 78}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Mục tiêu tháng</span>
                  <div className="text-2xl font-black text-purple-400">{data?.analytics?.goalAchievementRate?.monthlyGoals || 72}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Tổng thể</span>
                  <div className="text-2xl font-black text-amber-400">{data?.analytics?.goalAchievementRate?.overallRate || 78}%</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[10px] text-zinc-400">Bỏ lỡ: </span>
                <span className="text-sm font-bold text-rose-400">{data?.analytics?.goalAchievementRate?.missedGoals || 22}% mục tiêu</span>
              </div>
            </div>
          </div>

          {/* 14. PREDICTION MODELS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Mô Hình Dự Đoán (Prediction Models)</span>
              <span className="text-[10px] font-bold text-emerald-400 ml-auto">Độ tin cậy: {data?.analytics?.predictionModels?.confidence || 85}%</span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Score Prediction */}
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-3">Dự đoán điểm số</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Hiện tại</span>
                    <span className="text-sm font-bold text-white">{data?.analytics?.predictionModels?.scorePrediction?.current || 750}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">1 tháng</span>
                    <span className="text-sm font-bold text-emerald-400">{data?.analytics?.predictionModels?.scorePrediction?.oneMonth || 825}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">3 tháng</span>
                    <span className="text-sm font-bold text-blue-400">{data?.analytics?.predictionModels?.scorePrediction?.threeMonths || 950}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">6 tháng</span>
                    <span className="text-sm font-bold text-purple-400">{data?.analytics?.predictionModels?.scorePrediction?.sixMonths || 990}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">1 năm</span>
                    <span className="text-sm font-bold text-amber-400">{data?.analytics?.predictionModels?.scorePrediction?.oneYear || 990}</span>
                  </div>
                </div>
              </div>

              {/* Completion Prediction */}
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-3">Dự đoán hoàn thành</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Chặng 3</span>
                    <span className="text-sm font-bold text-emerald-400">{data?.analytics?.predictionModels?.completionPrediction?.stage3 || "45 ngày"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Chặng 4</span>
                    <span className="text-sm font-bold text-blue-400">{data?.analytics?.predictionModels?.completionPrediction?.stage4 || "120 ngày"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Chặng 5</span>
                    <span className="text-sm font-bold text-purple-400">{data?.analytics?.predictionModels?.completionPrediction?.stage5 || "240 ngày"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Mục tiêu điểm</span>
                    <span className="text-sm font-bold text-amber-400">{data?.analytics?.predictionModels?.completionPrediction?.targetScore || "90 ngày"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 6: GOAL TRACKING (9.6) */}
      {/* ================================================== */}
      {period === "goals" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Target className="w-6 h-6 text-red-400" />
                <span>Theo Dõi Mục Tiêu (Goal Tracking)</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Quản lý và theo dõi tiến độ các mục tiêu học tập của bạn</p>
            </div>
            <button
              type="button"
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xl shadow-red-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Đặt mục tiêu mới</span>
            </button>
          </div>

          {/* Goal Form Modal */}
          {showGoalForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">
                    {editingGoal ? "Chỉnh sửa mục tiêu" : "Đặt mục tiêu mới"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoalForm(false);
                      setEditingGoal(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Lock className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const goalData = {
                      type: formData.get("type") as string,
                      targetValue: parseInt(formData.get("targetValue") as string),
                      deadline: formData.get("deadline") as string,
                      title: formData.get("title") as string,
                      description: formData.get("description") as string,
                    };
                    if (editingGoal) {
                      handleUpdateGoal(editingGoal.id, goalData);
                    } else {
                      handleCreateGoal(goalData);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Loại mục tiêu</label>
                    <select
                      name="type"
                      defaultValue={editingGoal?.type || "score"}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="score">Điểm số TOEIC</option>
                      <option value="vocabulary">Số từ vựng</option>
                      <option value="study_time">Thời gian học (phút)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Giá trị mục tiêu</label>
                    <input
                      type="number"
                      name="targetValue"
                      defaultValue={editingGoal?.targetValue || ""}
                      placeholder="Nhập giá trị mục tiêu"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Hạn mục (tùy chọn)</label>
                    <input
                      type="date"
                      name="deadline"
                      defaultValue={editingGoal?.deadline ? editingGoal.deadline.split('T')[0] : ""}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Tiêu đề</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingGoal?.title || ""}
                      placeholder="Tên mục tiêu"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Mô tả (tùy chọn)</label>
                    <textarea
                      name="description"
                      defaultValue={editingGoal?.description || ""}
                      placeholder="Mô tả chi tiết mục tiêu"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition"
                  >
                    {editingGoal ? "Cập nhật mục tiêu" : "Tạo mục tiêu"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Active Goals */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              <span>Mục Tiêu Đang Hoạt Động</span>
            </h3>
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">Chưa có mục tiêu nào. Hãy đặt mục tiêu đầu tiên của bạn!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">{goal.title || `${goal.type} goal`}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">{goal.type === 'score' ? 'Điểm số' : goal.type === 'vocabulary' ? 'Từ vựng' : 'Thời gian học'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGoal(goal);
                            setShowGoalForm(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/30 text-zinc-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Tiến độ</span>
                        <span className="font-bold text-white">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            goal.status === 'completed' ? "bg-emerald-500" : 
                            goal.status === 'behind' ? "bg-rose-500" : 
                            goal.status === 'ahead' ? "bg-amber-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        goal.status === 'completed' ? "bg-emerald-500/20 text-emerald-300" :
                        goal.status === 'behind' ? "bg-rose-500/20 text-rose-300" :
                        goal.status === 'ahead' ? "bg-amber-500/20 text-amber-300" :
                        "bg-blue-500/20 text-blue-300"
                      }`}>
                        {goal.status === 'completed' ? "Đã hoàn thành" :
                         goal.status === 'behind' ? "Lịch trình" :
                         goal.status === 'ahead' ? "Trước lịch" : "Đúng lịch"}
                      </span>
                      {goal.deadline && (
                        <span className="text-[10px] text-zinc-500">
                          {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    {goal.status === 'completed' && (
                      <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                        <PartyPopper className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-emerald-300">Chúc mừng! 🎉</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal History */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Lịch Sử Mục Tiêu</span>
              </h3>
              <button
                type="button"
                onClick={fetchGoalHistory}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Tải lại
              </button>
            </div>
            {goalHistory.length === 0 ? (
              <div className="text-center py-6">
                <Award className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Chưa có mục tiêu nào hoàn thành</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goalHistory.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{goal.title || `${goal.type} goal`}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Hoàn thành: {new Date(goal.completedAt || goal.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PartyPopper className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Notifications */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-900 to-zinc-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Thông Báo Mục Tiêu</span>
            </h3>
            <div className="space-y-3">
              {goals.filter(g => g.status === 'behind').length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-300">Cảnh báo: Một số mục tiêu đang bị chậm tiến độ</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Hãy tăng cường học tập để đạt mục tiêu đúng hạn!</p>
                  </div>
                </div>
              )}
              {goals.filter(g => g.status === 'ahead').length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Tuyệt vời! Bạn đang tiến bộ nhanh hơn dự kiến</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Tiếp tục duy trì phong độ học tập xuất sắc!</p>
                  </div>
                </div>
              )}
              {goals.filter(g => g.status === 'completed').length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                  <PartyPopper className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-300">Chúc mừng! Bạn đã hoàn thành mục tiêu</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Hãy đặt mục tiêu mới để tiếp tục tiến bộ!</p>
                  </div>
                </div>
              )}
              {goals.filter(g => g.status === 'on_track').length > 0 && goals.filter(g => g.status !== 'completed').length === goals.filter(g => g.status === 'on_track').length && (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-300">Đúng lịch trình</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Bạn đang đi đúng hướng để đạt mục tiêu!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}