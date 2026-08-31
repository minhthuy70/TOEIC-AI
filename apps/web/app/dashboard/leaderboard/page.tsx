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
  Search,
  Users,
  Calendar,
  BookOpen,
  Headphones,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  X,
  Star,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  fullName: string;
  avatarUrl: string | null;
  pointsBalance: number;
  totalPointsEarned: number;
  streak: number;
  rankChange?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  total: number;
  hasMore: boolean;
  category?: string;
  period?: string;
}

interface UserPositionResponse {
  success: boolean;
  position: number;
  totalUsers: number;
  pointsBalance: number;
  category?: string;
  period?: string;
}

interface LeaderboardNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  previousRank?: number;
  currentRank?: number;
  category: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: LeaderboardNotification[];
  unreadCount: number;
}

type LeaderboardType = "global" | "friends";
type PeriodType = "all_time" | "weekly" | "monthly";
type CategoryType = "global" | "vocabulary" | "listening" | "reading";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [userPosition, setUserPosition] = useState<UserPositionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  // New state for leaderboard features
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("global");
  const [period, setPeriod] = useState<PeriodType>("all_time");
  const [category, setCategory] = useState<CategoryType>("global");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationsResponse | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserPosition();
    fetchNotifications();
  }, [page, leaderboardType, period, category]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = `/points/leaderboard?limit=${pageSize}&offset=${page * pageSize}`;
      
      if (leaderboardType === "friends") {
        url = `/points/leaderboard/friends?limit=${pageSize}&offset=${page * pageSize}`;
      }
      
      url += `&category=${category}&period=${period}`;
      
      const res = await apiFetch<{ success: boolean; data: LeaderboardResponse }>(url);
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
      const res = await apiFetch<{ success: boolean; data: UserPositionResponse }>(
        `/points/leaderboard/position?category=${category}&period=${period}`
      );
      if (res.success) {
        setUserPosition(res.data);
      }
    } catch (err) {
      console.error("Error fetching user position:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: NotificationsResponse }>(
        "/points/leaderboard/notifications?limit=10"
      );
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLeaderboard();
      return;
    }
    
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: LeaderboardResponse }>(
        `/points/leaderboard/search?search=${encodeURIComponent(searchTerm)}&category=${category}&period=${period}`
      );
      if (res.success) {
        setLeaderboard(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>("/points/leaderboard/compare");
      if (res.success) {
        setCompareData(res.data);
        setShowCompare(true);
      }
    } catch (err) {
      console.error("Error comparing with friends:", err);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiFetch("/points/leaderboard/notifications/read", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
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

  const getRankChangeIcon = (change: number | undefined) => {
    if (!change) return <Minus className="w-4 h-4 text-zinc-500" />;
    if (change > 0) return <ArrowUp className="w-4 h-4 text-emerald-400" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-zinc-500" />;
  };

  const getCategoryIcon = (cat: CategoryType) => {
    switch (cat) {
      case "vocabulary":
        return <BookOpen className="w-4 h-4" />;
      case "listening":
        return <Headphones className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (cat: CategoryType) => {
    switch (cat) {
      case "vocabulary":
        return "Từ vựng";
      case "listening":
        return "Nghe";
      case "reading":
        return "Đọc";
      default:
        return "Tổng quan";
    }
  };

  const getPeriodLabel = (per: PeriodType) => {
    switch (per) {
      case "weekly":
        return "Hàng tuần";
      case "monthly":
        return "Hàng tháng";
      default:
        return "Tất cả thời gian";
    }
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
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {notifications && notifications.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {notifications.unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && notifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-4 shadow-xl z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Thông báo</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {notifications.notifications.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">Không có thông báo mới</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          notification.isRead
                            ? "bg-zinc-900/40 border-zinc-800/40"
                            : "bg-red-950/20 border-red-900/30"
                        }`}
                        onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Star className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-zinc-400 mt-1">{notification.message}</p>
                            <p className="text-[10px] text-zinc-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => { fetchLeaderboard(); fetchUserPosition(); }}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Type Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setLeaderboardType("global"); setPage(0); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            leaderboardType === "global"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Toàn cầu</span>
          </div>
        </button>
        <button
          onClick={() => { setLeaderboardType("friends"); setPage(0); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            leaderboardType === "friends"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Bạn bè</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value as CategoryType); setPage(0); }}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="global">Tổng quan</option>
            <option value="vocabulary">Từ vựng</option>
            <option value="listening">Nghe</option>
            <option value="reading">Đọc</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {getCategoryIcon(category)}
          </div>
        </div>

        {/* Period Filter */}
        <div className="relative">
          <select
            value={period}
            onChange={(e) => { setPeriod(e.target.value as PeriodType); setPage(0); }}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="all_time">Tất cả thời gian</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-red-500/50"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Tìm kiếm
        </button>

        {/* Compare with Friends */}
        {leaderboardType === "friends" && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            So sánh với bạn bè
          </button>
        )}
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-500">
                    {getCategoryLabel(category)} • {getPeriodLabel(period)}
                  </span>
                </div>
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
                  entry.isCurrentUser
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
                        {entry.isCurrentUser && (
                          <span className="text-[10px] text-red-400 font-medium">Bạn</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Change & Points */}
                <div className="flex items-center gap-4">
                  {/* Rank Change */}
                  {entry.rankChange !== undefined && (
                    <div className="flex items-center gap-1">
                      {getRankChangeIcon(entry.rankChange)}
                      {entry.rankChange !== 0 && (
                        <span className={`text-xs font-medium ${
                          entry.rankChange > 0 ? 'text-emerald-400' : 
                          entry.rankChange < 0 ? 'text-red-400' : 'text-zinc-500'
                        }`}>
                          {Math.abs(entry.rankChange)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{entry.pointsBalance}</p>
                    <p className="text-[10px] text-zinc-500">PTS</p>
                  </div>
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

      {/* Compare with Friends Modal */}
      {showCompare && compareData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                <span>So sánh với bạn bè</span>
              </h3>
              <button
                onClick={() => setShowCompare(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRankBadgeClass(compareData.currentUser.rank)}`}>
                  {getRankIcon(compareData.currentUser.rank)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{compareData.currentUser.fullName}</p>
                  <p className="text-xs text-zinc-400">Hạng #{compareData.currentUser.rank} • {compareData.currentUser.pointsBalance} PTS</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Chuỗi ngày</p>
                  <p className="text-sm font-bold text-amber-400">{compareData.currentUser.streak} ngày</p>
                </div>
              </div>
            </div>

            {/* Friends Above */}
            {compareData.friendsAbove.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Bên trên bạn</p>
                <div className="space-y-2">
                  {compareData.friendsAbove.map((friend: any) => (
                    <div key={friend.userId} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRankBadgeClass(friend.rank)}`}>
                        {getRankIcon(friend.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{friend.fullName}</p>
                        <p className="text-xs text-zinc-400">{friend.pointsBalance} PTS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">Chuỗi ngày</p>
                        <p className="text-sm font-bold text-amber-400">{friend.streak} ngày</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Below */}
            {compareData.friendsBelow.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Bên dưới bạn</p>
                <div className="space-y-2">
                  {compareData.friendsBelow.slice(0, 5).map((friend: any) => (
                    <div key={friend.userId} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRankBadgeClass(friend.rank)}`}>
                        {getRankIcon(friend.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{friend.fullName}</p>
                        <p className="text-xs text-zinc-400">{friend.pointsBalance} PTS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">Chuỗi ngày</p>
                        <p className="text-sm font-bold text-amber-400">{friend.streak} ngày</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {compareData.friendsAbove.length === 0 && compareData.friendsBelow.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Chưa có bạn bè để so sánh</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
