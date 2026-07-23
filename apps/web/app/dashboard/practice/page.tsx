"use client";

import { useState } from "react";

const TABS = [
  { id: "part", label: "Luyện theo Part", icon: "🎯" },
  { id: "topic", label: "Luyện theo chủ đề", icon: "📌" },
  { id: "vocabulary", label: "Luyện từ vựng", icon: "📖" },
  { id: "grammar", label: "Luyện ngữ pháp", icon: "📝" },
];

const PARTS = [
  { part: 1, label: "Photographs", icon: "🖼️", section: "Listening", color: "from-blue-600 to-blue-500", desc: "Chọn ảnh phù hợp với âm thanh nghe được" },
  { part: 2, label: "Question-Response", icon: "💬", section: "Listening", color: "from-cyan-600 to-cyan-500", desc: "Chọn câu trả lời phù hợp nhất cho câu hỏi" },
  { part: 3, label: "Conversations", icon: "🗣️", section: "Listening", color: "from-indigo-600 to-indigo-500", desc: "Nghe hội thoại và trả lời câu hỏi" },
  { part: 4, label: "Talks", icon: "🎙️", section: "Listening", color: "from-violet-600 to-violet-500", desc: "Nghe bài nói đơn và trả lời câu hỏi" },
  { part: 5, label: "Incomplete Sentences", icon: "✏️", section: "Reading", color: "from-green-600 to-green-500", desc: "Điền từ thích hợp vào chỗ trống" },
  { part: 6, label: "Text Completion", icon: "📝", section: "Reading", color: "from-emerald-600 to-emerald-500", desc: "Điền từ/câu vào đoạn văn có chỗ trống" },
  { part: 7, label: "Reading Comprehension", icon: "📖", section: "Reading", color: "from-teal-600 to-teal-500", desc: "Đọc hiểu đơn, kép và ba đoạn văn" },
];

const TOPICS = [
  { label: "Office & Workplace", icon: "🏢", parts: "Part 5, 6, 7" },
  { label: "Travel & Transportation", icon: "✈️", parts: "Part 1, 3, 7" },
  { label: "Banking & Finance", icon: "🏦", parts: "Part 6, 7" },
  { label: "Marketing & Sales", icon: "📊", parts: "Part 4, 5, 7" },
  { label: "Human Resources", icon: "👥", parts: "Part 3, 6, 7" },
  { label: "Shipping & Logistics", icon: "🚢", parts: "Part 2, 4, 7" },
  { label: "Meetings & Conferences", icon: "🤝", parts: "Part 3, 4, 6" },
  { label: "Technology & IT", icon: "💻", parts: "Part 5, 6, 7" },
];

const VOCAB_MODES = [
  { id: "flashcard", label: "Flashcard", icon: "🃏", desc: "Lật thẻ học từ mới", color: "from-violet-600 to-violet-500" },
  { id: "matching", label: "Ghép cặp", icon: "🔗", desc: "Ghép từ với nghĩa tương ứng", color: "from-blue-600 to-blue-500" },
  { id: "fill", label: "Điền từ", icon: "✏️", desc: "Điền từ vào câu văn", color: "from-green-600 to-green-500" },
  { id: "srs", label: "SRS Review", icon: "🧠", desc: "Ôn tập theo lịch trình thông minh", color: "from-red-600 to-red-500" },
];

const GRAMMAR_MODES = [
  { label: "Thì động từ", icon: "⏰", questions: 50, level: "Cơ bản" },
  { label: "Từ loại (Word Forms)", icon: "🔤", questions: 40, level: "Cơ bản" },
  { label: "Câu bị động", icon: "🔄", questions: 35, level: "Trung bình" },
  { label: "Mệnh đề quan hệ", icon: "🔗", questions: 30, level: "Trung bình" },
  { label: "Liên từ & Giới từ", icon: "↔️", questions: 45, level: "Trung bình" },
  { label: "Câu điều kiện", icon: "❓", questions: 25, level: "Nâng cao" },
  { label: "Đảo ngữ", icon: "🔀", questions: 20, level: "Nâng cao" },
];

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản": "bg-green-600/15 text-green-400 border-green-600/20",
  "Trung bình": "bg-blue-600/15 text-blue-400 border-blue-600/20",
  "Nâng cao": "bg-purple-600/15 text-purple-400 border-purple-600/20",
};

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState("part");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">✍️ Luyện tập</h1>
        <p className="text-zinc-400 text-sm mt-1">Luyện từng Part · Theo chủ đề · Từ vựng · Ngữ pháp</p>
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

      {/* ── Part Practice ── */}
      {activeTab === "part" && (
        <div className="space-y-4">
          {/* Listening */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Section A — Listening
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {PARTS.filter(p => p.section === "Listening").map((part) => (
                <div key={part.part} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${part.color} flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      {part.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-white font-semibold">Part {part.part}: {part.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{part.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 text-center text-[11px] text-zinc-400 hover:text-white py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                      Luyện ngẫu nhiên
                    </button>
                    <button className={`flex-1 text-center text-[11px] text-white py-2 rounded-lg bg-gradient-to-r ${part.color} hover:opacity-90 transition-all shadow-sm`}>
                      Bắt đầu →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reading */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Section B — Reading
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PARTS.filter(p => p.section === "Reading").map((part) => (
                <div key={part.part} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 cursor-pointer transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${part.color} flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      {part.icon}
                    </div>
                    <div>
                      <p className="text-[13px] text-white font-semibold">Part {part.part}: {part.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{part.desc}</p>
                    </div>
                  </div>
                  <button className={`mt-4 w-full text-center text-[11px] text-white py-2 rounded-lg bg-gradient-to-r ${part.color} hover:opacity-90 transition-all shadow-sm`}>
                    Luyện tập →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Topic Practice ── */}
      {activeTab === "topic" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Luyện tập câu hỏi TOEIC theo chủ đề kinh doanh</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {TOPICS.map((topic) => (
              <div
                key={topic.label}
                className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all group"
              >
                <span className="text-2xl w-10 text-center group-hover:scale-110 transition-transform">{topic.icon}</span>
                <div className="flex-1">
                  <p className="text-[13px] text-white font-semibold">{topic.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{topic.parts}</p>
                </div>
                <span className="text-xs text-red-400 border border-red-600/20 bg-red-600/8 px-3 py-1.5 rounded-full group-hover:bg-red-600/15 transition-all shrink-0">
                  Luyện tập
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Vocabulary Practice ── */}
      {activeTab === "vocabulary" && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 font-medium">Chọn hình thức luyện từ vựng</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VOCAB_MODES.map((mode) => (
              <div
                key={mode.id}
                className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-5 cursor-pointer transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                  {mode.icon}
                </div>
                <h3 className="text-white font-bold text-[15px]">{mode.label}</h3>
                <p className="text-zinc-500 text-[12px] mt-1.5">{mode.desc}</p>
                <button className={`mt-4 w-full py-2.5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r ${mode.color} hover:opacity-90 transition-all shadow-sm`}>
                  Bắt đầu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grammar Practice ── */}
      {activeTab === "grammar" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Luyện ngữ pháp theo từng chuyên đề</p>
          {GRAMMAR_MODES.map((mode) => (
            <div
              key={mode.label}
              className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-xl px-4 py-3.5 flex items-center gap-4 cursor-pointer transition-all group"
            >
              <span className="text-xl w-8 text-center">{mode.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] text-white font-medium">{mode.label}</p>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[mode.level]}`}>
                    {mode.level}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5">{mode.questions} câu hỏi</p>
              </div>
              <button className="text-[11px] text-red-400 border border-red-600/20 bg-red-600/8 px-3 py-1.5 rounded-lg group-hover:bg-red-600/15 transition-all shrink-0">
                Luyện ngay
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
