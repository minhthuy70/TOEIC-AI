"use client";

import { useState, useEffect } from "react";

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
    ],
    dailyTasks: [
      { icon: "📖", label: "20 từ vựng mới", type: "Vocabulary" },
      { icon: "📝", label: "1 bài ngữ pháp cơ bản", type: "Grammar" },
      { icon: "🎧", label: "5 câu Listening Part 1-2", type: "Listening" },
      { icon: "📄", label: "10 câu Part 5", type: "Reading" },
      { icon: "🧪", label: "Mini Quiz cuối ngày", type: "Quiz" },
    ],
  },
  {
    id: 2, range: "300–500", label: "Chặng 2", title: "Củng cố nền tảng TOEIC",
    color: "from-orange-600 to-orange-500", glow: "shadow-orange-600/20",
    border: "border-orange-600/25", bg: "bg-orange-600/8",
    goals: [
      "Tích lũy 2.500–3.000 từ vựng TOEIC theo chủ đề",
      "Thành thạo hầu hết cấu trúc ngữ pháp xuất hiện trong TOEIC",
      "Vận dụng tốt phrasal verbs & word forms",
      "Thành thạo 7 Part TOEIC và chiến thuật làm bài",
      "Đọc nhanh email, memo, advertisement và article ngắn",
      "Đạt khoảng 600 điểm TOEIC",
    ],
    dailyTasks: [
      { icon: "📖", label: "30 từ vựng theo chủ đề", type: "Vocabulary" },
      { icon: "📝", label: "Phrasal verbs & Word forms", type: "Grammar" },
      { icon: "🎧", label: "Listening Part 3-4 (10 câu)", type: "Listening" },
      { icon: "📄", label: "Part 6 & Part 7 ngắn", type: "Reading" },
      { icon: "🧪", label: "Chapter Test hàng tuần", type: "Quiz" },
    ],
  },
  {
    id: 3, range: "500–650", label: "Chặng 3", title: "Thành thạo mức trung bình",
    color: "from-yellow-600 to-yellow-500", glow: "shadow-yellow-600/20",
    border: "border-yellow-600/25", bg: "bg-yellow-600/8",
    goals: [
      "Sở hữu 4.000–4.500 từ vựng TOEIC",
      "Hiểu các cấu trúc ngữ pháp nâng cao & bẫy thường gặp",
      "Sử dụng tốt collocations chuyên sâu theo chủ đề kinh doanh",
      "Nghe tốt hội thoại dài & bài nói nhiều người",
      "Đọc nhanh Single & Multiple Passage",
      "Đạt khoảng 750 điểm TOEIC",
    ],
    dailyTasks: [
      { icon: "📖", label: "40 từ vựng kinh doanh", type: "Vocabulary" },
      { icon: "📝", label: "Ngữ pháp nâng cao & bẫy TOEIC", type: "Grammar" },
      { icon: "🎧", label: "Shadowing + Dictation", type: "Listening" },
      { icon: "📄", label: "Multiple Passage Reading", type: "Reading" },
      { icon: "🧪", label: "Checkpoint Test", type: "Quiz" },
    ],
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
    ],
    dailyTasks: [
      { icon: "📖", label: "50 từ vựng học thuật & idioms", type: "Vocabulary" },
      { icon: "📝", label: "Câu phức & Đảo ngữ nâng cao", type: "Grammar" },
      { icon: "🎧", label: "Nghe nhiều giọng + speed up", type: "Listening" },
      { icon: "📄", label: "Phân tích Multiple Passage nhanh", type: "Reading" },
      { icon: "🧪", label: "Mock Test TOEIC đầy đủ", type: "Quiz" },
    ],
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
    ],
    dailyTasks: [
      { icon: "📖", label: "Review từ vựng SRS nâng cao", type: "Vocabulary" },
      { icon: "📝", label: "Ôn tập toàn bộ ngữ pháp", type: "Grammar" },
      { icon: "🎧", label: "Full Listening Section thi thật", type: "Listening" },
      { icon: "📄", label: "Full Reading Section thi thật", type: "Reading" },
      { icon: "🧪", label: "Full Mock Test + phân tích lỗi", type: "Quiz" },
    ],
  },
];

const TASK_COLORS: Record<string, string> = {
  Vocabulary: "bg-violet-600/15 text-violet-400 border-violet-600/20",
  Grammar: "bg-blue-600/15 text-blue-400 border-blue-600/20",
  Listening: "bg-cyan-600/15 text-cyan-400 border-cyan-600/20",
  Reading: "bg-green-600/15 text-green-400 border-green-600/20",
  Quiz: "bg-orange-600/15 text-orange-400 border-orange-600/20",
};

export default function RoadmapPage() {
  const [user, setUser] = useState<{ currentScore?: number; targetScore?: number } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  const currentScore = user?.currentScore ?? 0;
  const currentStageId = (() => {
    if (currentScore >= 800) return 5;
    if (currentScore >= 650) return 4;
    if (currentScore >= 500) return 3;
    if (currentScore >= 300) return 2;
    return 1;
  })();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">🗺️ Lộ trình học TOEIC</h1>
        <p className="text-zinc-400 text-sm mt-1">5 chặng từ 0 → 990 điểm · Khám phá từng giai đoạn</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-300 font-medium">Tiến độ tổng thể</p>
          <span className="text-xs text-zinc-500">Chặng {currentStageId} / 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex-1 relative">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  stage.id < currentStageId
                    ? "bg-green-500"
                    : stage.id === currentStageId
                    ? `bg-gradient-to-r ${stage.color}`
                    : "bg-zinc-800"
                }`}
              />
              <p className="text-[9px] text-zinc-600 text-center mt-1.5 font-medium">
                C{stage.id}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{currentScore || "—"}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Điểm hiện tại</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{user?.targetScore ?? "—"}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Mục tiêu</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{currentStageId}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Chặng đang học</p>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const isActive = stage.id === currentStageId;
          const isDone = stage.id < currentStageId;
          const isLocked = stage.id > currentStageId;
          const isOpen = expanded === stage.id;

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
              {/* Stage Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : stage.id)}
                className="w-full flex items-center gap-4 p-5 text-left"
                disabled={isLocked}
              >
                {/* Stage Badge */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{stage.label} – {stage.title}</p>
                    {isActive && (
                      <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Đang học
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[9px] bg-green-600/20 text-green-400 border border-green-600/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Hoàn thành
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-0.5">Mục tiêu: {stage.range} điểm TOEIC</p>
                </div>

                {!isLocked && (
                  <span className="text-zinc-500 text-sm shrink-0 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▼
                  </span>
                )}
              </button>

              {/* Expanded Content */}
              {isOpen && !isLocked && (
                <div className="px-5 pb-5 space-y-5 border-t border-zinc-800/30 pt-4">
                  <div className="grid lg:grid-cols-2 gap-5">
                    {/* Goals */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span>🎯</span> Mục tiêu sau khi hoàn thành
                      </p>
                      <ul className="space-y-2">
                        {stage.goals.map((goal, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-300">
                            <span className="text-green-500 mt-0.5 shrink-0 text-xs">✓</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Daily Tasks */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span>📅</span> Nhiệm vụ mỗi ngày
                      </p>
                      <div className="space-y-2">
                        {stage.dailyTasks.map((task, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${TASK_COLORS[task.type]}`}
                          >
                            <span className="text-base">{task.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{task.label}</p>
                              <p className="text-[10px] opacity-70">{task.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tests at this stage */}
                  <div className="bg-black/20 rounded-xl p-4 border border-zinc-800/30">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      🧪 Kiểm tra trong chặng
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-zinc-900/60 rounded-lg p-2.5">
                        <p className="text-base">📋</p>
                        <p className="text-[11px] text-zinc-300 font-medium mt-1">Mini Quiz</p>
                        <p className="text-[10px] text-zinc-600">Sau mỗi bài</p>
                      </div>
                      <div className="bg-zinc-900/60 rounded-lg p-2.5">
                        <p className="text-base">📑</p>
                        <p className="text-[11px] text-zinc-300 font-medium mt-1">Chapter Test</p>
                        <p className="text-[10px] text-zinc-600">Sau mỗi chương</p>
                      </div>
                      <div className="bg-zinc-900/60 rounded-lg p-2.5">
                        <p className="text-base">🏁</p>
                        <p className="text-[11px] text-zinc-300 font-medium mt-1">Mock Test</p>
                        <p className="text-[10px] text-zinc-600">Cuối chặng</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
