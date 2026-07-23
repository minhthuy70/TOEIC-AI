"use client";

import { useState } from "react";

const TABS = [
  { id: "mini", label: "Mini Test", icon: "📋" },
  { id: "full", label: "Full TOEIC Test", icon: "📝" },
  { id: "history", label: "Lịch sử thi", icon: "📊" },
  { id: "review", label: "Kết quả & Đáp án", icon: "✅" },
];

const MINI_TESTS = [
  { id: 1, label: "Mini Test – Listening Part 1-2", questions: 15, time: 10, difficulty: "Dễ", icon: "🎧", color: "from-blue-600 to-blue-500" },
  { id: 2, label: "Mini Test – Listening Part 3-4", questions: 20, time: 15, difficulty: "Trung bình", icon: "🎙️", color: "from-cyan-600 to-cyan-500" },
  { id: 3, label: "Mini Test – Reading Part 5", questions: 15, time: 12, difficulty: "Dễ", icon: "✏️", color: "from-green-600 to-green-500" },
  { id: 4, label: "Mini Test – Reading Part 6-7", questions: 20, time: 20, difficulty: "Trung bình", icon: "📖", color: "from-emerald-600 to-emerald-500" },
  { id: 5, label: "Mini Test – Mixed All Parts", questions: 30, time: 25, difficulty: "Khó", icon: "🎯", color: "from-red-600 to-red-500" },
  { id: 6, label: "Mini Test – Grammar Focus", questions: 20, time: 15, difficulty: "Trung bình", icon: "📝", color: "from-violet-600 to-violet-500" },
];

const FULL_TESTS = [
  { id: 1, label: "TOEIC Full Test #1", date: "2024-01", questions: 200, time: 120, status: "available", icon: "📝" },
  { id: 2, label: "TOEIC Full Test #2", date: "2024-02", questions: 200, time: 120, status: "available", icon: "📝" },
  { id: 3, label: "TOEIC Full Test #3", date: "2024-03", questions: 200, time: 120, status: "coming", icon: "🔒" },
  { id: 4, label: "TOEIC Full Test #4", date: "2024-04", questions: 200, time: 120, status: "coming", icon: "🔒" },
];

const HISTORY = [
  { id: 1, label: "Mini Test – Reading Part 5", date: "23/07/2026", score: 420, maxScore: 495, correct: 12, total: 15, type: "Mini Test" },
  { id: 2, label: "TOEIC Full Test #1", date: "20/07/2026", score: 650, maxScore: 990, correct: 130, total: 200, type: "Full Test" },
  { id: 3, label: "Mini Test – Listening Part 1-2", date: "18/07/2026", score: 385, maxScore: 495, correct: 11, total: 15, type: "Mini Test" },
  { id: 4, label: "Mini Test – Grammar Focus", date: "15/07/2026", score: 0, maxScore: 495, correct: 16, total: 20, type: "Mini Test" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  "Dễ": "bg-green-600/15 text-green-400 border-green-600/20",
  "Trung bình": "bg-yellow-600/15 text-yellow-400 border-yellow-600/20",
  "Khó": "bg-red-600/15 text-red-400 border-red-600/20",
};

export default function MockTestPage() {
  const [activeTab, setActiveTab] = useState("mini");

  const avgScore = HISTORY.length > 0
    ? Math.round(HISTORY.reduce((sum, h) => sum + h.score, 0) / HISTORY.length)
    : 0;

  const bestScore = HISTORY.length > 0
    ? Math.max(...HISTORY.map(h => h.score))
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">📝 Thi thử</h1>
        <p className="text-zinc-400 text-sm mt-1">Mini Test · Full TOEIC · Lịch sử thi · Xem đáp án</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{HISTORY.length}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Lần thi</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{avgScore}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Điểm trung bình</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{bestScore}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Điểm cao nhất</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
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

      {/* ── Mini Test ── */}
      {activeTab === "mini" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Luyện tập nhanh · 10–25 phút mỗi bài</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {MINI_TESTS.map((test) => (
              <div
                key={test.id}
                className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    {test.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white font-semibold leading-snug">{test.label}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-500">{test.questions} câu</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[10px] text-zinc-500">⏱ {test.time} phút</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLORS[test.difficulty]}`}>
                        {test.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <button className={`w-full py-2.5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r ${test.color} hover:opacity-90 transition-all shadow-sm`}>
                  Bắt đầu thi →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full Test ── */}
      {activeTab === "full" && (
        <div className="space-y-3">
          <div className="bg-red-600/8 border border-red-600/15 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-[13px] text-red-300 font-semibold">Bài thi TOEIC đầy đủ</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">200 câu · 120 phút · Sát với đề thi thật · Có kết quả và đáp án chi tiết sau khi thi</p>
            </div>
          </div>
          <div className="space-y-3">
            {FULL_TESTS.map((test) => (
              <div
                key={test.id}
                className={`bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4 transition-all ${
                  test.status === "available" ? "hover:border-zinc-700/60 cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-2xl">{test.icon}</span>
                <div className="flex-1">
                  <p className="text-[14px] text-white font-semibold">{test.label}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-zinc-500">{test.questions} câu</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-500">⏱ {test.time} phút</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-500">{test.date}</span>
                  </div>
                </div>
                {test.status === "available" ? (
                  <button className="text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-red-600/20 shrink-0">
                    Thi ngay →
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-600 border border-zinc-800 px-3 py-1.5 rounded-xl shrink-0">
                    Sắp ra mắt
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── History ── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Lịch sử {HISTORY.length} lần thi gần nhất</p>
          {HISTORY.map((record) => {
            const pct = record.maxScore > 0 ? Math.round((record.score / record.maxScore) * 100) : 0;
            const accuracy = record.total > 0 ? Math.round((record.correct / record.total) * 100) : 0;
            return (
              <div key={record.id} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] text-white font-semibold">{record.label}</p>
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                        {record.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{record.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-white">{record.score > 0 ? record.score : "—"}</p>
                    <p className="text-[10px] text-zinc-600">điểm</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 shrink-0 font-medium">
                    {record.correct}/{record.total} đúng · {accuracy}%
                  </span>
                  <button className="text-[10px] text-red-400 hover:text-red-300 border border-red-600/20 bg-red-600/8 px-2 py-1 rounded-lg shrink-0 transition-all">
                    Xem đáp án
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Review ── */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 font-medium">Chọn bài thi để xem kết quả và đáp án chi tiết</p>
          {HISTORY.map((record) => {
            const accuracy = record.total > 0 ? Math.round((record.correct / record.total) * 100) : 0;
            return (
              <div key={record.id} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] text-white font-semibold">{record.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{record.date} · {record.correct}/{record.total} câu đúng · {accuracy}% chính xác</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-400">{record.score > 0 ? record.score : "—"}</span>
                    <button className="text-[11px] text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0">
                      Xem →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-3">📋</span>
            <p className="text-zinc-400 text-sm">Hoàn thành thêm bài thi để xem phân tích chi tiết điểm mạnh / yếu của bạn</p>
          </div>
        </div>
      )}
    </div>
  );
}
