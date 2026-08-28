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
      console.error('Dashboard fetch error:', error);
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

  if (!data) return <div className="text-zinc-400 p-8 text-center">Không thể tải dữ liệu Bảng điều khiển.</div>;

  const { user, score, progress, statistics, daily, recentActivities } = data;
  const currentStageId = score.stage;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ================================================== */}
      {/* 1. WELCOME BANNER & MOTIVATION QUOTE (9.1) */}
      {/* ================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600/15 via-zinc-900/90 to-zinc-950 border border-red-600/20 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Bảng Điều Khiển Hàng Ngày • 9.1
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                🔥 Chuỗi {daily?.streak?.current || 5} ngày liên tục
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white">
              Xin chào, {user?.fullName || "Học viên TOEIC"} 👋
            </h1>

            {/* 11. DAILY MOTIVATION QUOTE */}
            {daily?.dailyMotivationQuote && (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-xs italic text-zinc-300 font-medium leading-relaxed">
                  &quot;{daily.dailyMotivationQuote.quote}&quot; — <span className="text-red-400 font-bold">{daily.dailyMotivationQuote.author}</span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  💡 {daily.dailyMotivationQuote.translation}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/mock-test"
              className="px-5 py-3 rounded-2xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>📝</span>
              <span>Thi thử TOEIC</span>
            </Link>

            <Link
              href="/dashboard/courses"
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-xl shadow-red-600/25 transition active:scale-95 flex items-center gap-2"
            >
              <span>🚀</span>
              <span>Tiếp tục học ngay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. TODAY'S DAILY METRICS - 5 CARDS ROW (9.1) */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Today's study time */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
            <span>⏱️</span> <span>Thời gian học hôm nay</span>
          </span>
          <p className="text-2xl font-black text-white">
            {daily?.studyTime?.todayMinutes || 0} <span className="text-xs text-zinc-400 font-normal">/ {daily?.studyTime?.goalMinutes || 30}p</span>
          </p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${daily?.studyTime?.progress || 0}%` }} />
          </div>
        </div>

        {/* 2. Today's vocabulary count (new + reviewed) */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
            <span>📖</span> <span>Từ vựng (Mới + Ôn)</span>
          </span>
          <p className="text-2xl font-black text-purple-400">
            {daily?.vocabulary?.totalToday || 0} <span className="text-xs text-zinc-400 font-normal">/ {daily?.vocabulary?.goal || 20} từ</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1.5">
            {daily?.vocabulary?.learnedToday || 0} mới • {daily?.vocabulary?.reviewedToday || 0} ôn tập
          </p>
        </div>

        {/* 3. Today's practice questions count */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
            <span>✍️</span> <span>Câu luyện tập hôm nay</span>
          </span>
          <p className="text-2xl font-black text-blue-400">
            {daily?.practiceQuestions?.count || 0} <span className="text-xs text-zinc-400 font-normal">câu</span>
          </p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${daily?.practiceQuestions?.progress || 0}%` }} />
          </div>
        </div>

        {/* 4. Today's accuracy rate */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
            <span>🎯</span> <span>Tỷ lệ chính xác</span>
          </span>
          <p className="text-2xl font-black text-emerald-400">
            {daily?.accuracyRate || 85}%
          </p>
          <span className="text-[10px] text-emerald-300/70 font-semibold block mt-1.5">Phản xạ rất tốt ⚡</span>
        </div>

        {/* 5. Today's streak count */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4.5 text-center transition hover:border-zinc-700 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5 flex items-center justify-center gap-1">
            <span>🔥</span> <span>Chuỗi ngày học</span>
          </span>
          <p className="text-2xl font-black text-amber-400">
            {daily?.streak?.current || 5} <span className="text-xs text-zinc-400 font-normal">ngày</span>
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1.5">Kỷ lục: {daily?.streak?.longest || 7} ngày</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. QUICK ACTIONS (7. Quick actions) */}
      {/* ================================================== */}
      <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <span>⚡</span> <span>Hành Động Nhanh (Quick Actions)</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            href="/dashboard/vocabulary"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group"
          >
            <span className="text-2xl group-hover:scale-110 transition">📖</span>
            <span className="text-xs font-bold text-white">Học từ mới</span>
            <span className="text-[10px] text-zinc-500">Flashcard SRS</span>
          </Link>

          <Link
            href="/dashboard/vocabulary/review"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group"
          >
            <span className="text-2xl group-hover:scale-110 transition">🔄</span>
            <span className="text-xs font-bold text-white">Ôn tập từ vựng</span>
            <span className="text-[10px] text-zinc-500">Spaced Repetition</span>
          </Link>

          <Link
            href="/dashboard/practice"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group"
          >
            <span className="text-2xl group-hover:scale-110 transition">✍️</span>
            <span className="text-xs font-bold text-white">Luyện tập câu</span>
            <span className="text-[10px] text-zinc-500">Part 1 - 7</span>
          </Link>

          <Link
            href="/dashboard/mock-test"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group"
          >
            <span className="text-2xl group-hover:scale-110 transition">📝</span>
            <span className="text-xs font-bold text-white">Thi thử Mini/Full</span>
            <span className="text-[10px] text-zinc-500">Chuẩn format ETS</span>
          </Link>

          <Link
            href="/dashboard/error-log"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-center transition flex flex-col items-center justify-center gap-1.5 group col-span-2 sm:col-span-1"
          >
            <span className="text-2xl group-hover:scale-110 transition">📓</span>
            <span className="text-xs font-bold text-white">Sổ tay câu sai</span>
            <span className="text-[10px] text-zinc-500">Luyện Drill & Phân tích</span>
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. MAIN 2-COLUMN LAYOUT */}
      {/* ================================================== */}
      <div className="grid lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* LEFT COLUMN: DAILY GOALS, SCHEDULE, UPCOMING REVIEWS */}
        <div className="space-y-6">
          
          {/* 6. DAILY GOALS PROGRESS BARS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎯</span> <span>Tiến Độ Mục Tiêu Hàng Ngày (Daily Goals)</span>
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
                      <span>{g.icon}</span> <span>{g.title}</span>
                    </span>
                    <span className="font-bold text-white">
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        g.isCompleted ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">{g.progress}% hoàn thành</span>
                    {g.isCompleted ? (
                      <span className="text-emerald-400 font-bold">✓ Đạt mục tiêu</span>
                    ) : (
                      <span className="text-zinc-400">Còn {Math.max(0, g.target - g.current)} {g.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. TODAY'S SCHEDULE DISPLAY */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📅</span> <span>Lịch Trình Học Tập Hôm Nay (Today&apos;s Schedule)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {daily?.todaySchedule?.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    s.status === "completed"
                      ? "bg-emerald-950/10 border-emerald-500/20 text-zinc-300"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-zinc-400">
                      {s.time}
                    </span>
                    <div>
                      <p className={`text-xs font-semibold ${s.status === "completed" ? "text-emerald-300" : "text-white"}`}>
                        {s.title}
                      </p>
                      <span className="text-[10px] text-zinc-500">{s.category}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    s.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {s.status === "completed" ? "✓ Đã hoàn thành" : "○ Sắp tới"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 9. UPCOMING REVIEWS NOTIFICATION */}
          {daily?.upcomingReviews && (
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-900 to-zinc-950 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <h3 className="text-sm font-bold text-purple-300">
                    Thông Báo Ôn Tập Sắp Tới (Upcoming Reviews)
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {daily.upcomingReviews.message}
                </p>
              </div>

              <Link
                href="/dashboard/vocabulary/review"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition shrink-0"
              >
                Ôn tập ngay →
              </Link>
            </div>
          )}

          {/* 10. TODAY'S ACHIEVEMENTS */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🏆</span> <span>Thành Tích Đạt Được Hôm Nay (Today&apos;s Achievements)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {daily?.todayAchievements?.map((a: any) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                    a.unlocked
                      ? "bg-amber-950/10 border-amber-500/30"
                      : "bg-zinc-950 border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="text-2xl">{a.icon}</div>
                  <h4 className="text-xs font-bold text-white">{a.title}</h4>
                  <p className="text-[10px] text-zinc-400">{a.desc}</p>
                </div>
              ))}
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
        </div>

        {/* RIGHT COLUMN: ROADMAP & RECENT ACTIVITIES */}
        <div className="space-y-6">
          
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
            <div className="flex justify-between text-xs text-zinc-400 mt-3">
              <span>Hiện tại: <strong className="text-white">{score.current || 0}</strong></span>
              <span>Mục tiêu: <strong className="text-green-400">{score.target}</strong></span>
            </div>
          </div>

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

          {/* 🗺️ Lộ trình học TOEIC */}
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