"use client";

import { useState, useEffect } from "react";
import { mockTestService, MockTest, MockTestHistoryItem } from "../../../services/mock-test/mockTestService";

const TABS = [
  { id: "full", label: "Full TOEIC Test", icon: "📝" },
  { id: "history", label: "Lịch sử thi", icon: "📊" },
];

export default function MockTestPage() {
  const [activeTab, setActiveTab] = useState("full");
  const [availableTests, setAvailableTests] = useState<MockTest[]>([]);
  const [history, setHistory] = useState<MockTestHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableTests = async () => {
    try {
      setLoading(true);
      const tests = await mockTestService.getAvailableTests();
      setAvailableTests(tests);
    } catch (error) {
      console.error("Failed to load available tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await mockTestService.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFullTest = async (testId: number) => {
    try {
      setLoading(true);
      const attempt = await mockTestService.startFullTest(testId);
      console.log("Started full test:", attempt);
      alert(`Bắt đầu full test: ${attempt.title}`);
      // Navigate to test taking page (to be implemented)
    } catch (error) {
      console.error("Failed to start full test:", error);
      alert("Không thể bắt đầu bài thi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "full") {
      loadAvailableTests();
    } else if (tabId === "history") {
      loadHistory();
    }
  };

  useEffect(() => {
    loadAvailableTests();
  }, []);

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.totalScore || 0), 0) / history.length)
    : 0;

  const bestScore = history.length > 0
    ? Math.max(...history.map(h => h.totalScore || 0))
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">📝 Thi thử</h1>
        <p className="text-zinc-400 text-sm mt-1">Full TOEIC Test · Lịch sử thi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{history.length}</p>
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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">Đang tải danh sách đề thi...</p>
            </div>
          ) : availableTests.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-zinc-400 text-sm">Chưa có đề thi nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-5 flex items-center gap-4 transition-all cursor-pointer"
                >
                  <span className="text-2xl">📝</span>
                  <div className="flex-1">
                    <p className="text-[14px] text-white font-semibold">{test.title}</p>
                    {test.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{test.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-zinc-500">{test.totalQuestions} câu</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-500">⏱ {test.duration} phút</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-500">{new Date(test.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartFullTest(test.id)}
                    disabled={loading}
                    className="text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-red-600/20 shrink-0 disabled:opacity-50"
                  >
                    {loading ? "Đang tải..." : "Thi ngay →"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── History ── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">Lịch sử {history.length} lần thi gần nhất</p>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">Đang tải lịch sử...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-zinc-400 text-sm">Chưa có lịch sử thi</p>
            </div>
          ) : (
            history.map((record) => {
              const accuracy = record.totalCorrect && record.totalQuestions 
                ? Math.round((record.totalCorrect / 200) * 100) 
                : 0;
              return (
                <div key={record.id} className="bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 rounded-2xl p-4 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] text-white font-semibold">{record.testTitle}</p>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                          Full Test
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(record.startedAt).toLocaleDateString('vi-VN')} · {record.isCompleted ? 'Hoàn thành' : 'Đang làm'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{record.totalScore || "—"}</p>
                      <p className="text-[10px] text-zinc-600">điểm</p>
                    </div>
                  </div>
                  {record.isCompleted && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 shrink-0 font-medium">
                        {record.totalCorrect || 0}/200 đúng · {accuracy}%
                      </span>
                      <button className="text-[10px] text-red-400 hover:text-red-300 border border-red-600/20 bg-red-600/8 px-2 py-1 rounded-lg shrink-0 transition-all">
                        Xem chi tiết
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
