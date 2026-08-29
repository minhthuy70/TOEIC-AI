"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Compass,
  ListOrdered,
  Lightbulb,
} from "lucide-react";

interface Weakness {
  part: number;
  title: string;
  category: string;
  tip: string;
  accuracy: number;
  questions: number;
}

interface PriorityTask {
  rank: number;
  taskName: string;
  priority: string;
  reason: string;
  actionUrl: string;
}

interface RecommendationResponse {
  success: boolean;
  summary: {
    currentScore: number;
    targetScore: number;
    goalGap: number;
    avgAccuracy: number;
  };
  whatToStudyNext: {
    title: string;
    description: string;
    actionUrl: string;
  };
  weaknesses: Weakness[];
  timeBased: {
    label: string;
    suggestion: string;
  };
  goalBased: {
    recommendation: string;
  };
  adaptive: {
    difficultyLevel: string;
    description: string;
  };
  learningPath: {
    completionRate: number;
  };
  priorityTasks: PriorityTask[];
}

export default function RecommendationsPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<RecommendationResponse>("/dashboard/recommendation");
      if (res.success) {
        setData(res);
      } else {
        setError("Không thể tải gợi ý thông minh");
      }
    } catch (err: any) {
      console.error(err);
      setError("Đã xảy ra lỗi khi tải phân tích gợi ý AI");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case "Cao nhất":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Cao":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Trung bình":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700/30";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang phân tích lộ trình học tập bằng AI...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải gợi ý AI</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* --- HERO AI SECTION --- */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-red-950/20 to-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Learning Companion</span>
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              Trợ lý học tập thông minh AI
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Lộ trình của bạn đã được tối ưu hóa dựa trên điểm mục tiêu <strong className="text-white">{data.summary.targetScore}</strong>. Trợ lý AI khuyên bạn: <em className="text-zinc-300 font-semibold">&ldquo;{data.goalBased.recommendation}&rdquo;</em>
            </p>
          </div>

          <div className="flex gap-4 shrink-0 bg-[#0d0d14]/80 backdrop-blur border border-zinc-800/60 p-4 rounded-2xl shadow-xl">
            <div className="text-center px-3 border-r border-zinc-850">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Mục tiêu</div>
              <div className="text-lg font-bold text-white mt-1">{data.summary.targetScore}</div>
            </div>
            <div className="text-center px-3 border-r border-zinc-850">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Hiện tại</div>
              <div className="text-lg font-bold text-zinc-400 mt-1">{data.summary.currentScore}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Khoảng cách</div>
              <div className="text-lg font-bold text-red-500 mt-1">+{data.summary.goalGap}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID 1: WHAT TO STUDY NEXT & PRIORITY RANKINGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Priority Rankings Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-zinc-500" />
              <span>Xếp hạng ưu tiên nhiệm vụ hôm nay</span>
            </h4>

            <div className="space-y-4">
              {data.priorityTasks.map((task) => (
                <div
                  key={task.rank}
                  className="bg-zinc-900/10 border border-zinc-800/50 hover:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-300"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Rank Circle */}
                    <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {task.rank}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-bold text-zinc-200">{task.taskName}</h5>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                        {task.reason}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={task.actionUrl}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 self-end md:self-auto"
                  >
                    <span>Bắt đầu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What to study next Widget */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0d0d14] to-[#08080c] border border-red-500/20 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6 shadow-xl relative">
            {/* Sparkle blur top right */}
            <div className="absolute top-2 right-2 w-10 h-10 bg-red-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[8px] font-bold text-red-400 uppercase tracking-widest">
                <Flame className="w-3 h-3 animate-pulse" />
                <span>Học gì tiếp theo</span>
              </span>

              <h4 className="text-sm font-bold text-white leading-snug">
                {data.whatToStudyNext.title}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {data.whatToStudyNext.description}
              </p>
            </div>

            <Link
              href={data.whatToStudyNext.actionUrl}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-red-950/20"
            >
              <span>Vào học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- GRID 2: WEAKNESS ANALYSIS --- */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-6">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-zinc-500" />
            <span>Phân tích điểm yếu và giải pháp bổ trợ</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1 font-medium">
            AI tự động tính toán độ chính xác dựa trên lịch sử luyện tập từng kỹ năng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.weaknesses.map((w) => (
            <div
              key={w.part}
              className="bg-zinc-900/10 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition duration-300"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-850 text-zinc-400">
                    Part {w.part}
                  </span>
                  <span className="text-xs font-bold text-red-400">{w.accuracy}%</span>
                </div>

                <h5 className="text-xs font-bold text-zinc-200 leading-snug">{w.title}</h5>

                {/* Progress bar */}
                <div className="bg-zinc-950/80 rounded-full h-1.5 w-full overflow-hidden border border-zinc-800/30">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${w.accuracy}%` }}
                  ></div>
                </div>
              </div>

              {/* AI Remedy comment */}
              <div className="bg-[#0d0d14]/80 p-3 rounded-xl border border-zinc-900/60 text-[10px] text-zinc-400 leading-relaxed font-medium mt-4 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{w.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- GRID 3: ADAPTIVE DIFFICULTY & TIME-BASED SUGGESTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Time-based suggestions */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Thời gian thực</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>Gợi ý theo khung giờ: {data.timeBased.label}</span>
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium bg-zinc-900/10 p-4 border border-zinc-850 rounded-xl">
            {data.timeBased.suggestion}
          </p>
        </div>

        {/* Adaptive difficulty */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Độ khó thông minh</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <span>Cấp độ bài tập đề xuất: {data.adaptive.difficultyLevel}</span>
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium bg-zinc-900/10 p-4 border border-zinc-850 rounded-xl">
            {data.adaptive.description}
          </p>
        </div>
      </div>

      {/* --- PERSONALIZED ROADMAP & OPTIMIZATION --- */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-zinc-500" />
              <span>Lộ trình học tập cá nhân hóa & Tối ưu lộ trình</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium">
              Sơ đồ chiến thuật 3 bước giúp bứt phá điểm số tối đa trong thời gian ngắn nhất
            </p>
          </div>

          <div className="bg-zinc-900/30 px-3 py-1.5 border border-zinc-800 rounded-xl flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Lộ trình tối ưu:</span>
            <span className="text-xs font-bold text-green-400">{data.learningPath.completionRate}%</span>
          </div>
        </div>

        {/* Roadmap Roadmap Timeline horizontal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative pt-4">
          
          {/* Step 1 */}
          <div className="relative bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-2">
            <div className="absolute -top-3.5 left-4 w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h5 className="text-xs font-bold text-zinc-200 pt-2">Giai đoạn Củng cố Nền tảng</h5>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Nắm chắc 20 chủ đề ngữ pháp TOEIC, luyện nghe Part 1-2 để tăng độ nhạy phản xạ cơ bản.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-2">
            <div className="absolute -top-3.5 left-4 w-7 h-7 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h5 className="text-xs font-bold text-zinc-200 pt-2">Giai đoạn Tăng tốc Kỹ năng</h5>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Focus sửa điểm yếu {data.weaknesses[0]?.title || "phần đang yếu"}, tăng tốc đọc hiểu Part 7 và kỹ năng nghe hiểu hội thoại Part 3-4.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-2">
            <div className="absolute -top-3.5 left-4 w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h5 className="text-xs font-bold text-zinc-200 pt-2">Giai đoạn Vượt ngưỡng mục tiêu</h5>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Luyện đề thi thử Full Test dưới áp lực thời gian, khắc phục lỗi sai từ Sổ tay lỗi để triệt tiêu các lỗi nhỏ.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
