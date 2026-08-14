"use client";

import { useState } from "react";
import { practiceService, PracticeHistoryItem } from "../../../services/practice/practiceService";

const TABS = [
  { id: "part", label: "Luyện theo Part", icon: "🎯" },
  { id: "history", label: "Lịch sử", icon: "�" },
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

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState("part");
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [history, setHistory] = useState<PracticeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStartPractice = async (part: number, random: boolean = false) => {
    try {
      setLoading(true);
      const session = await practiceService.startPractice(part, 10, random);
      // Navigate to practice session page (to be implemented)
      console.log("Started practice:", session);
      alert(`Bắt đầu luyện Part ${part} với ${session.questionCount} câu hỏi`);
    } catch (error) {
      console.error("Failed to start practice:", error);
      alert("Không thể bắt đầu luyện tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await practiceService.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load history when switching to history tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "history") {
      loadHistory();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">✍️ Luyện tập</h1>
        <p className="text-zinc-400 text-sm mt-1">Luyện từng Part · Theo dõi tiến độ</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
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
                <div key={part.part} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all group">
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
                    <button 
                      onClick={() => handleStartPractice(part.part, true)}
                      disabled={loading}
                      className="flex-1 text-center text-[11px] text-zinc-400 hover:text-white py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
                    >
                      {loading ? "Đang tải..." : "Luyện ngẫu nhiên"}
                    </button>
                    <button 
                      onClick={() => handleStartPractice(part.part, false)}
                      disabled={loading}
                      className={`flex-1 text-center text-[11px] text-white py-2 rounded-lg bg-gradient-to-r ${part.color} hover:opacity-90 transition-all shadow-sm disabled:opacity-50`}
                    >
                      {loading ? "Đang tải..." : "Bắt đầu →"}
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
                <div key={part.part} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${part.color} flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      {part.icon}
                    </div>
                    <div>
                      <p className="text-[13px] text-white font-semibold">Part {part.part}: {part.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{part.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartPractice(part.part, false)}
                    disabled={loading}
                    className={`mt-4 w-full text-center text-[11px] text-white py-2 rounded-lg bg-gradient-to-r ${part.color} hover:opacity-90 transition-all shadow-sm disabled:opacity-50`}
                  >
                    {loading ? "Đang tải..." : "Luyện tập →"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── History ── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Lịch sử luyện tập</p>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">Đang tải lịch sử...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-zinc-400 text-sm">Chưa có lịch sử luyện tập</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] text-white font-semibold">Part {item.part}</p>
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                        {item.questionCount} câu
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(item.startedAt).toLocaleDateString('vi-VN')} · {item.completedAt ? 'Hoàn thành' : 'Đang làm'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-white">{item.score}%</p>
                    <p className="text-[10px] text-zinc-600">{item.correctCount}/{item.questionCount} đúng</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <button className="text-[10px] text-red-400 hover:text-red-300 border border-red-600/20 bg-red-600/8 px-2 py-1 rounded-lg shrink-0 transition-all">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
