"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<any>("/dashboard/overview");
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-zinc-900 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-2xl"></div>)}
        </div>
        <div className="h-32 bg-zinc-900 rounded-2xl"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard</div>;

  const { user, score, progress, statistics, daily, recentActivities } = data;
  const currentStageId = score.stage;

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600/10 via-zinc-900/80 to-zinc-900 border border-red-600/15 rounded-2xl p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-zinc-400 text-sm">Xin chào,</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">
              {user?.fullName || "Learner"} 👋
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Hãy tiếp tục hành trình chinh phục TOEIC của bạn!
            </p>
          </div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-[0.98] shrink-0"
          >
            🚀 Bắt đầu học
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* L ── Cột trái: Tiến độ & Nhiệm vụ hôm nay ── */}
        <div className="space-y-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Điểm hiện tại</span>
              <p className="text-2xl font-bold text-white">{score.current || "—"}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Mục tiêu</span>
              <p className="text-2xl font-bold text-green-400">{score.target}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Còn lại</span>
              <p className="text-2xl font-bold text-blue-400">{score.remaining}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Chặng học</span>
              <p className="text-2xl font-bold text-orange-400">{score.stage}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Ước tính</span>
              <p className="text-2xl font-bold text-green-400">{score.estimatedDays || "—"} ngày</p>
            </div>
          </div>

          {/* Vocabulary Stats Row */}
          {statistics.vocabulary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Tổng từ vựng</span>
                <p className="text-2xl font-bold text-white">{statistics.vocabulary.total}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Thành thạo</span>
                <p className="text-2xl font-bold text-green-400">{statistics.vocabulary.mastered}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Đang học</span>
                <p className="text-2xl font-bold text-blue-400">{statistics.vocabulary.learning}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Cần ôn</span>
                <p className="text-2xl font-bold text-orange-400">{statistics.vocabulary.review}</p>
              </div>
            </div>
          )}

          {/* New Vocabulary Stats Row */}
          {statistics.vocabulary && (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Mới</span>
                <p className="text-2xl font-bold text-purple-400">{statistics.vocabulary.new}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Đã học tổng</span>
                <p className="text-2xl font-bold text-pink-400">{statistics.learnedVocabulary}</p>
              </div>
            </div>
          )}

          {/* Progress Bar Score */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center text-xs">📊</span>
                Tiến độ đến mục tiêu điểm
              </h3>
              <span className="text-sm font-bold text-red-400">{score.progress}%</span>
            </div>
            <div className="w-full bg-zinc-800/80 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-700 relative"
                style={{ width: `${score.progress}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-red-600/30 border-2 border-red-500" />
              </div>
            </div>
          </div>

          {/* Progress Bar 4 Skills */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/15 flex items-center justify-center text-xs">📈</span>
                Tổng tiến độ lộ trình ({progress.overall}%)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Từ vựng</span>
                  <span className="text-violet-400 font-medium">{progress.vocabulary}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5">
                  <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${progress.vocabulary}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Ngữ pháp</span>
                  <span className="text-blue-400 font-medium">{progress.grammar}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress.grammar}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Listening</span>
                  <span className="text-cyan-400 font-medium">{progress.listening}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progress.listening}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Reading</span>
                  <span className="text-green-400 font-medium">{progress.reading}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress.reading}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê chung */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-600/15 flex items-center justify-center text-xs">📈</span>
              Thống kê hoạt động
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
                <p className="text-xl font-bold text-violet-400">{statistics.learnedVocabulary}</p>
                <p className="text-xs text-zinc-400 mt-1">Từ đã học</p>
              </div>
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
                <p className="text-xl font-bold text-blue-400">{statistics.completedLessons}</p>
                <p className="text-xs text-zinc-400 mt-1">Bài đã học</p>
              </div>
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
                <p className="text-xl font-bold text-cyan-400">{statistics.practiceCount}</p>
                <p className="text-xs text-zinc-400 mt-1">Lần luyện tập</p>
              </div>
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
                <p className="text-xl font-bold text-green-400">{statistics.mockTestCount}</p>
                <p className="text-xs text-zinc-400 mt-1">Đề thi thử</p>
              </div>
            </div>
          </div>

          {/* Nhiệm vụ hôm nay */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-600/15 flex items-center justify-center text-xs text-orange-500">📅</span>
              Nhiệm vụ hôm nay
            </h3>
            <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
              <span>Đã hoàn thành {daily.tasksCompleted} / {daily.taskGoal} nhiệm vụ</span>
              <span className="text-orange-400 font-bold">{daily.progress}%</span>
            </div>
            <div className="w-full bg-zinc-800/80 rounded-full h-2 mb-4">
              <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${daily.progress}%` }}></div>
            </div>
            
            {daily.tasks && daily.tasks.length > 0 ? (
              <div className="space-y-3 mt-4">
                {daily.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${task.isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-zinc-700 text-zinc-500'}`}>
                      {task.isCompleted ? '✓' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>{task.title}</p>
                    </div>
                    <div className="text-xs font-semibold text-zinc-400">
                      {task.completed} / {task.goal}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              daily.tasksCompleted === 0 ? (
                <p className="text-sm text-zinc-400 mt-4 text-center italic py-2">Bạn chưa bắt đầu học hôm nay. Hãy bắt đầu bài học để xây dựng tiến độ!</p>
              ) : (
                <p className="text-sm text-zinc-400 mt-4 text-center italic py-2">Bạn đang làm rất tốt, hãy tiếp tục duy trì nhé!</p>
              )
            )}
          </div>

          {/* Vocabulary Daily Stats */}
          {daily.vocabulary && (
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-600/15 flex items-center justify-center text-xs text-purple-500">📚</span>
                Từ vựng hôm nay
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{daily.vocabulary.learnedToday}</p>
                  <p className="text-xs text-zinc-400 mt-1">Đã học</p>
                </div>
                <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{daily.vocabulary.reviewedToday}</p>
                  <p className="text-xs text-zinc-400 mt-1">Đã ôn</p>
                </div>
                <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 text-center">
                  <p className="text-xl font-bold text-orange-400">{daily.vocabulary.remaining}</p>
                  <p className="text-xs text-zinc-400 mt-1">Còn lại</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                <span>Mục tiêu: {daily.vocabulary.goal} từ/ngày</span>
                <span className="text-purple-400 font-bold">{Math.round(((daily.vocabulary.learnedToday + daily.vocabulary.reviewedToday) / daily.vocabulary.goal) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${((daily.vocabulary.learnedToday + daily.vocabulary.reviewedToday) / daily.vocabulary.goal) * 100}%` }}></div>
              </div>
            </div>
          )}
          
        </div>

        {/* R ── Cột phải: Hoạt động & Lộ trình học ── */}
        <div className="space-y-6">
          
          {/* Hoạt động gần đây */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cyan-600/15 flex items-center justify-center text-xs text-cyan-500">📋</span>
              Hoạt động gần đây
            </h3>
            {recentActivities.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Chưa có hoạt động nào.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 bg-zinc-800/30 p-3 rounded-xl border border-zinc-700/30">
                    <span className="text-xl shrink-0">{act.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-zinc-200 line-clamp-2 leading-snug">{act.title}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{new Date(act.date).toLocaleDateString('vi-VN')} {new Date(act.date).toLocaleTimeString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 className="text-base font-semibold text-white flex items-center gap-2 px-1 pt-2">
            🗺️ Lộ trình học TOEIC
          </h3>
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const isActive = stage.id === currentStageId;
              const isDone = stage.id < currentStageId;
              const isLocked = stage.id > currentStageId;
              const isOpen = expandedStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? `${stage.bg} ${stage.border} shadow-lg ${stage.glow}`
                      : isDone
                      ? "bg-zinc-900/40 border-zinc-800/30"
                      : "bg-zinc-900/20 border-zinc-800/20 opacity-60"
                  }`}
                >
                  <button
                    onClick={() => setExpandedStage(isOpen ? null : stage.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                    disabled={isLocked}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
                        isDone
                          ? "bg-green-600/20 text-green-400 border border-green-600/25"
                          : isActive
                          ? `bg-gradient-to-br ${stage.color} text-white shadow-lg`
                          : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                      }`}
                    >
                      {isDone ? "✓" : isLocked ? "🔒" : stage.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-white leading-tight">{stage.label}</p>
                        {isActive && (
                          <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Đang học
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{stage.title}</p>
                    </div>

                    {!isLocked && (
                      <span className="text-zinc-600 text-xs shrink-0 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▼
                      </span>
                    )}
                  </button>

                  {isOpen && !isLocked && (
                    <div className="px-4 pb-4 pt-1 border-t border-zinc-800/30 mt-1">
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-3">
                        🎯 Mục tiêu cần đạt
                      </p>
                      <ul className="space-y-1.5">
                        {stage.goals.map((goal, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-300">
                            <span className="text-green-500/70 shrink-0">✓</span>
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
  );
}