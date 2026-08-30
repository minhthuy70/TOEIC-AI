"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Trophy,
  TrendingUp,
  Award,
  Sparkles,
  Flame,
  History,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react";

interface PointsStats {
  currentBalance: number;
  totalEarned: number;
  currentMultiplier: number;
  weeklyPoints: number;
  monthlyPoints: number;
  pointsByType: Array<{
    type: string;
    totalPoints: number;
    count: number;
  }>;
  recentTransactions: Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
    multiplier: number;
  }>;
}

export default function PointsDisplay() {
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPointsStats();
  }, []);

  const fetchPointsStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: PointsStats }>("/points/stats");
      if (res.success) {
        setStats(res.data);
      } else {
        setError("Không thể tải thống kê điểm");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thống kê điểm");
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
    };
    return icons[type] || "⭐";
  };

  const formatDateTime = (dateString: string): string => {
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
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-zinc-800 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Points Balance Card */}
      <div className="bg-gradient-to-br from-red-950/30 to-zinc-900 border border-red-900/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Số dư điểm</p>
                <h3 className="text-3xl font-black text-white">
                  {stats?.currentBalance || 0} <span className="text-lg text-zinc-500 font-normal">PTS</span>
                </h3>
              </div>
            </div>
            
            {stats?.currentMultiplier && stats.currentMultiplier > 1.0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 border border-amber-500/30">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">x{stats.currentMultiplier.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Tuần này</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats?.weeklyPoints || 0}
              </p>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Tháng này</p>
              <p className="text-lg font-bold text-blue-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stats?.monthlyPoints || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Points by Type */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Điểm theo hoạt động</span>
        </h4>
        
        <div className="space-y-3">
          {stats?.pointsByType.slice(0, 5).map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getPointsTypeIcon(item.type)}</span>
                <span className="text-xs text-zinc-300">{getPointsTypeLabel(item.type)}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{item.totalPoints} PTS</p>
                <p className="text-[10px] text-zinc-500">{item.count} lần</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <span>Giao dịch gần đây</span>
        </h4>
        
        <div className="space-y-3">
          {stats?.recentTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">
                  {getPointsTypeIcon(transaction.type)}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{transaction.description}</p>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} PTS
                </p>
                {transaction.multiplier > 1.0 && (
                  <p className="text-[10px] text-amber-400">x{transaction.multiplier.toFixed(1)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
