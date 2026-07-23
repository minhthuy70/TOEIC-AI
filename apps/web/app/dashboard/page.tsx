"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    fullName?: string;
    currentScore?: number;
    targetScore?: number;
    dailyStudyTime?: number;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const score = user?.currentScore ?? 0;
  const target = user?.targetScore ?? 600;
  const progress = target > 0 ? Math.min((score / target) * 100, 100) : 0;

  const currentStage = (() => {
    if (score >= 800) return { id: 5, label: "Chặng 5 – Hoàn thiện", range: "800–990" };
    if (score >= 650) return { id: 4, label: "Chặng 4 – Nâng cao", range: "650–800" };
    if (score >= 500) return { id: 3, label: "Chặng 3 – Trung bình khá", range: "500–650" };
    if (score >= 300) return { id: 2, label: "Chặng 2 – Củng cố", range: "300–500" };
    return { id: 1, label: "Chặng 1 – Nền tảng", range: "0–300" };
  })();

  const quickActions = [
    { label: "Học từ vựng", icon: "📖", href: "/dashboard/courses", color: "from-violet-600 to-violet-500" },
    { label: "Luyện Listening", icon: "🎧", href: "/dashboard/practice", color: "from-blue-600 to-blue-500" },
    { label: "Thi thử TOEIC", icon: "📝", href: "/dashboard/mock-test", color: "from-red-600 to-red-500" },
    { label: "Xem lộ trình", icon: "🗺️", href: "/dashboard/roadmap", color: "from-emerald-600 to-emerald-500" },
  ];

  const recentLessons = [
    { title: "Từ vựng: Office & Workplace", type: "Vocabulary", progress: 75, icon: "📖" },
    { title: "Part 5: Incomplete Sentences", type: "Reading", progress: 60, icon: "📄" },
    { title: "Ngữ pháp: Thì hiện tại hoàn thành", type: "Grammar", progress: 40, icon: "📝" },
    { title: "Part 1: Photographs", type: "Listening", progress: 90, icon: "🎧" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600/10 via-zinc-900/80 to-zinc-900 border border-red-600/15 rounded-2xl p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative">
          <p className="text-zinc-400 text-sm">Xin chào,</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">
            {user?.fullName || "Learner"} 👋
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Hãy tiếp tục hành trình chinh phục TOEIC của bạn!
          </p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-[0.98]"
          >
            🚀 Tiếp tục học
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Current Score */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-red-600/15 flex items-center justify-center text-sm">🎯</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Điểm hiện tại</span>
          </div>
          <p className="text-3xl font-bold text-white">{score || "—"}</p>
          <p className="text-[11px] text-zinc-600 mt-1">/ 990 điểm</p>
        </div>

        {/* Target */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-green-600/15 flex items-center justify-center text-sm">🏆</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Mục tiêu</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{target}</p>
          <p className="text-[11px] text-zinc-600 mt-1">điểm TOEIC</p>
        </div>

        {/* Current Stage */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center text-sm">📍</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Chặng</span>
          </div>
          <p className="text-xl font-bold text-white">{currentStage.label.split("–")[0]}</p>
          <p className="text-[11px] text-zinc-600 mt-1">{currentStage.range} điểm</p>
        </div>

        {/* Study Time */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-orange-600/15 flex items-center justify-center text-sm">⏱️</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Học mỗi ngày</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">{user?.dailyStudyTime ?? 30}</p>
          <p className="text-[11px] text-zinc-600 mt-1">phút / ngày</p>
        </div>
      </div>

      {/* ── Progress to Target ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center text-xs">📊</span>
            Tiến độ đến mục tiêu
          </h3>
          <span className="text-sm font-bold text-red-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-zinc-800/80 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-700 relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-red-600/30 border-2 border-red-500" />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-zinc-600">{score} điểm</span>
          <span className="text-[11px] text-zinc-600">{target} điểm</span>
        </div>
      </div>

      {/* ── Quick Actions + Recent ── */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-violet-600/15 flex items-center justify-center text-xs">⚡</span>
            Truy cập nhanh
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-4 transition-all hover:bg-zinc-800/40"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-lg mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {action.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Lessons */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-600/15 flex items-center justify-center text-xs">📋</span>
            Bài học gần đây
          </h3>
          <div className="space-y-2">
            {recentLessons.map((lesson, i) => (
              <div
                key={i}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-3.5 flex items-center gap-3 hover:bg-zinc-800/40 transition-all cursor-pointer"
              >
                <span className="text-lg w-8 text-center">{lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{lesson.type}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-1">
                      <div
                        className="bg-red-500/80 h-1 rounded-full"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">{lesson.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}