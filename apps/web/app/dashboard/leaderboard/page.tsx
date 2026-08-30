"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Trophy,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Flame,
  User,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  fullName: string;
  avatarUrl: string | null;
  pointsBalance: number;
  totalPointsEarned: number;
  streak: number;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  total: number;
  hasMore: boolean;
}

interface UserPositionResponse {
  success: boolean;
  position: number;
  totalUsers: number;
  pointsBalance: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [userPosition, setUserPosition] = useState<UserPositionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchLeaderboard();
    fetchUserPosition();
  }, [page]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: LeaderboardResponse }>(
        `/points/leaderboard?limit=${pageSize}&offset=${page * pageSize}`
      );
      if (res.success) {
        setLeaderboard(res.data);
      } else {
        setError("Không thể tải bảng xếp hạng");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosition = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: UserPositionResponse }>("/points/leaderboard/position");
      if (res.success) {
        setUserPosition(res.data);
      }
    } catch (err) {
      console.error("Error fetching user position:", err);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-zinc-400">#{rank}</span>;
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30";
    if (rank === 2) return "bg-gradient-to-br from-zinc-400/20 to-zinc-500/10 border-zinc-400/30";
    if (rank === 3) return "bg-gradient-to-br from-amber-700/20 to-amber-800/10 border-amber-700/30";
    return "bg-zinc-900/40 border-zinc-800/60";
  };

  const getAvatar = (avatarUrl: string | null, fullName: string) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm">
        {fullName.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Bảng Xếp Hạng</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Xếp hạng người dùng theo điểm tích lũy</p>
        </div>
        <button
          onClick={() => { fetchLeaderboard(); fetchUserPosition(); }}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* User Position Card */}
      {userPosition && (
        <div className="bg-gradient-to-r from-red-950/30 to-zinc-900 border border-red-900/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                <User className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Vị trí của bạn</p>
                <h3 className="text-2xl font-black text-white">
                  Hạng #{userPosition.position}
                  <span className="text-sm text-zinc-500 font-normal"> / {userPosition.totalUsers}</span>
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Điểm hiện tại</p>
              <p className="text-xl font-bold text-emerald-400">{userPosition.pointsBalance} PTS</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm">Đang tải bảng xếp hạng...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : !leaderboard || leaderboard.leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Chưa có dữ liệu bảng xếp hạng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  userPosition && entry.userId === userPosition.position
                    ? "bg-red-950/20 border-red-900/30"
                    : "bg-zinc-900/40 border-zinc-800/40 hover:border-zinc-700/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRankBadgeClass(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    {getAvatar(entry.avatarUrl, entry.fullName)}
                    <div>
                      <p className="text-sm font-medium text-white">{entry.fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.streak > 0 && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {entry.streak} ngày
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{entry.pointsBalance}</p>
                  <p className="text-[10px] text-zinc-500">PTS</p>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {leaderboard && leaderboard.hasMore && (
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

      {/* Stats */}
      {leaderboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Tổng người dùng</p>
              <h3 className="text-2xl font-bold text-white">{leaderboard.total}</h3>
            </div>
          </div>

          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Điểm cao nhất</p>
              <h3 className="text-2xl font-bold text-white">
                {leaderboard.leaderboard[0]?.pointsBalance || 0} <span className="text-xs text-zinc-500 font-normal">PTS</span>
              </h3>
            </div>
          </div>

          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Tổng điểm đã phát</p>
              <h3 className="text-2xl font-bold text-white">
                {leaderboard.leaderboard.reduce((sum, entry) => sum + entry.totalPointsEarned, 0).toLocaleString()} <span className="text-xs text-zinc-500 font-normal">PTS</span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
