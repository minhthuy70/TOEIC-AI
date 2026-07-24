"use client";

import { useState } from "react";
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

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("vocabulary");

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-300 font-medium">Học theo chủ đề · Ôn tập Spaced Repetition (SRS)</p>
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
          {/* SRS reminder */}
          <div className="bg-violet-600/8 border border-violet-600/15 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-[13px] text-violet-300 font-semibold">Spaced Repetition (SRS)</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Hệ thống ôn tập thông minh – từ được ôn đúng lúc trước khi bị quên</p>
            </div>
            <Link
  href="/dashboard/vocabulary"
  className="ml-auto text-[11px] bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 px-3 py-1.5 rounded-lg border border-violet-600/20 transition-all shrink-0"
>
  Ôn tập SRS
</Link>
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
