"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Trophy,
  TrendingUp,
  Award,
  History,
  ArrowUp,
  ArrowDown,
  Clock,
  Filter,
  ChevronDown,
  Calendar,
  Sparkles,
} from "lucide-react";
import PointsDisplay from "@/components/points/PointsDisplay";

interface PointsTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  sourceType: string;
  sourceId: number | null;
  multiplier: number;
  baseAmount: number | null;
  createdAt: string;
}

interface PointsHistoryResponse {
  success: boolean;
  transactions: PointsTransaction[];
  total: number;
  hasMore: boolean;
}

export default function PointsPage() {
  const [history, setHistory] = useState<PointsHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchPointsHistory();
  }, [filter, page]);

  const fetchPointsHistory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: PointsHistoryResponse }>(
        `/points/history?limit=${pageSize}&offset=${page * pageSize}`
      );
      if (res.success) {
        setHistory(res.data);
      } else {
        setError("Không thể tải lịch sử điểm");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải lịch sử điểm");
    } finally {
      setLoading(false);
    }
  };

  const getPointsTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      vocabulary_learn: "Học từ vựng",
      vocabulary_review: "Ôn tập từ vựng",
      practice_correct: "Trả lời đúng",
      practice_complete: "Hoàn thành luyện tập",
      test_complete: "Hoàn thành bài kiểm tra",
      test_perfect: "Điểm tuyệt đối",
      grammar_lesson_complete: "Hoàn thành ngữ pháp",
      listening_lesson_complete: "Hoàn thành bài nghe",
      reading_lesson_complete: "Hoàn thành bài đọc",
      achievement_unlock: "Mở khóa thành tích",
      streak_bonus: "Thưởng chuỗi",
      redemption: "Đổi điểm",
    };
    return labels[type] || type;
  };

  const getPointsTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      vocabulary_learn: "📚",
      vocabulary_review: "🔄",
      practice_correct: "✅",
      practice_complete: "📝",
      test_complete: "📋",
      test_perfect: "🏆",
      grammar_lesson_complete: "📖",
      listening_lesson_complete: "🎧",
      reading_lesson_complete: "📖",
      achievement_unlock: "🎖️",
      streak_bonus: "🔥",
      redemption: "🎁",
    };
    return icons[type] || "⭐";
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDateTime(dateString);
  };

  const filteredTransactions = history?.transactions.filter(t => 
    filter === "all" || 
    (filter === "earned" && t.amount > 0) ||
    (filter === "spent" && t.amount < 0)
  ) || [];

  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "earned", label: "Đã nhận" },
    { id: "spent", label: "Đã tiêu" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-red-400" />
            <span>Hệ Thống Điểm</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Theo dõi điểm tích lũy và lịch sử giao dịch</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        {/* Left Column - Points Display */}
        <div>
          <PointsDisplay />
        </div>

        {/* Right Column - Points History */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Lịch sử giao dịch</span>
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => { setFilter(e.target.value); setPage(0); }}
                  className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-red-500/50"
                >
                  {filterOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-sm">Đang tải lịch sử giao dịch...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchPointsHistory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl">
                      {getPointsTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getRelativeTime(transaction.createdAt)}
                        </p>
                        {transaction.multiplier > 1.0 && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            x{transaction.multiplier.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-[10px] text-zinc-500">PTS</p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {history && history.hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
