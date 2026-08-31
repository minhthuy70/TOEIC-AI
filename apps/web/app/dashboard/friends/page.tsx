"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Flame,
  Target,
  Trophy,
  Activity,
  ArrowRight,
  Sparkles,
  BarChart3,
  BookOpen,
  Headphones,
  FileText,
  Clock,
  RotateCcw,
  Check,
  X,
  Eye,
  Trash2,
  Ban,
  Shield,
  Zap,
} from "lucide-react";

interface FriendItem {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  targetScore: number;
  currentScore: number;
  streak: number;
  isOnline: boolean;
  lastActive: string;
  stage: number;
  stageLabel: string;
  friendSince: string;
}

interface FriendRequest {
  id: number;
  fromUserId?: number;
  toUserId?: number;
  name: string;
  email: string;
  avatar?: string | null;
  targetScore?: number;
  currentScore?: number;
  sentAt: string;
  message?: string;
  status?: string;
}

interface FriendProfileData {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  targetScore: number;
  currentScore: number;
  streak: number;
  stage: number;
  stageName: string;
  totalVocabLearned: number;
  completedLessons: number;
  mockTestsTaken: number;
  highestScore: number;
  recentTests: Array<{
    testName: string;
    score: number;
    listening: number;
    reading: number;
    date: string;
  }>;
  badges: string[];
}

interface ComparisonData {
  user: {
    name: string;
    totalScore: number;
    listeningScore: number;
    readingScore: number;
    streakDays: number;
    vocabLearned: number;
    accuracyRate: number;
    avgSpeedSec: number;
    testsCompleted: number;
  };
  friend: {
    name: string;
    totalScore: number;
    listeningScore: number;
    readingScore: number;
    streakDays: number;
    vocabLearned: number;
    accuracyRate: number;
    avgSpeedSec: number;
    testsCompleted: number;
  };
  metrics: Array<{
    metric: string;
    userVal: number;
    friendVal: number;
    unit: string;
    userWins: boolean;
  }>;
}

export default function FriendsHubPage() {
  const [activeTab, setActiveTab] = useState<"list" | "requests" | "find" | "blocked">("list");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<{ received: FriendRequest[]; sent: FriendRequest[] }>({
    received: [],
    sent: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: number; name: string; email: string; blockedAt: string }>>([]);

  // Modals / Details State
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<FriendProfileData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [comparingFriendName, setComparingFriendName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsRes, reqRes, blockedRes] = await Promise.all([
        apiFetch<{ success: boolean; friends: FriendItem[] }>("/friends/list"),
        apiFetch<{ success: boolean; received: FriendRequest[]; sent: FriendRequest[] }>("/friends/requests"),
        apiFetch<{ success: boolean; blockedUsers: any[] }>("/friends/blocked"),
      ]);

      if (friendsRes.success && friendsRes.friends) {
        setFriends(friendsRes.friends);
      }
      if (reqRes.success) {
        setRequests({ received: reqRes.received || [], sent: reqRes.sent || [] });
      }
      if (blockedRes.success) {
        setBlockedUsers(blockedRes.blockedUsers || []);
      }
    } catch (e) {
      console.error("Error loading friends data:", e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Send Friend Request
  const handleSendRequest = async (targetUserId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/friends/request", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      if (res.success) {
        showToast(res.message || "Đã gửi lời mời kết bạn!");
        setSearchResults((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, isPending: true } : u))
        );
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi gửi lời mời", "error");
    }
  };

  // 2. Accept Friend Request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/friends/accept", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
      if (res.success) {
        showToast("Đã chấp nhận lời mời kết bạn!", "success");
        setRequests((prev) => ({
          ...prev,
          received: prev.received.filter((r) => r.id !== requestId),
        }));
        loadFriendsData();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi chấp nhận", "error");
    }
  };

  // 3. Decline Friend Request
  const handleDeclineRequest = async (requestId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/friends/decline", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
      if (res.success) {
        showToast("Đã từ chối lời mời kết bạn");
        setRequests((prev) => ({
          ...prev,
          received: prev.received.filter((r) => r.id !== requestId),
        }));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi từ chối", "error");
    }
  };

  // 8. Remove Friend
  const handleRemoveFriend = async (friendId: number, friendName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friendName}?`)) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/friends/remove/${friendId}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(`Đã xóa ${friendName} khỏi danh sách bạn bè`);
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        if (selectedFriendProfile?.id === friendId) setSelectedFriendProfile(null);
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xóa bạn bè", "error");
    }
  };

  // 9. Block User
  const handleBlockUser = async (targetUserId: number, targetName: string) => {
    if (!confirm(`Chặn người dùng ${targetName}? Họ sẽ không thể xem hồ sơ hay gửi lời mời cho bạn.`)) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/friends/block", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      if (res.success) {
        showToast(`Đã chặn ${targetName}`, "success");
        setFriends((prev) => prev.filter((f) => f.id !== targetUserId));
        loadFriendsData();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi chặn người dùng", "error");
    }
  };

  // Unblock User
  const handleUnblockUser = async (targetUserId: number, targetName: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/friends/unblock", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      if (res.success) {
        showToast(`Đã bỏ chặn ${targetName}`, "success");
        setBlockedUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi bỏ chặn", "error");
    }
  };

  // 5 & 6. View Friend Profile & Progress
  const handleViewFriendProfile = async (friendId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; profile: FriendProfileData }>(`/friends/profile/${friendId}`);
      if (res.success && res.profile) {
        setSelectedFriendProfile(res.profile);
      }
    } catch (e: any) {
      showToast(e.message || "Không thể tải hồ sơ bạn bè", "error");
    }
  };

  // 7. Compare with Friend
  const handleCompareWithFriend = async (friend: FriendItem) => {
    try {
      setComparingFriendName(friend.name);
      const res = await apiFetch<{ success: boolean; comparison: ComparisonData }>(`/friends/compare/${friend.id}`);
      if (res.success && res.comparison) {
        setComparisonData(res.comparison);
      }
    } catch (e: any) {
      showToast(e.message || "Không thể so sánh năng lực", "error");
    }
  };

  // Search action
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await apiFetch<{ success: boolean; users: any[] }>(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setSearchResults(res.users || []);
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi tìm kiếm", "error");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${
              toastType === "success"
                ? "bg-zinc-900 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-red-400" />
            <span>Hệ Thống Bạn Bè & Cộng Đồng Học Tập (15.1)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Kết nối bạn bè, theo dõi tiến độ học tập, so tài điểm số TOEIC và cùng nhau chinh phục mục tiêu 900+.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("find")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tìm Bạn Học Mới</span>
          </button>
        </div>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "list"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Bạn Bè ({friends.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors relative ${
            activeTab === "requests"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Lời Mời Kết Bạn</span>
          {requests.received.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {requests.received.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("find")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "find"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Tìm Bạn & Kết Nối</span>
        </button>
        <button
          onClick={() => setActiveTab("blocked")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "blocked"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Đã Chặn ({blockedUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: FRIEND LIST (4. Friend List, 8. Remove, 9. Block) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
              <Users className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chưa Có Bạn Học Nào</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Tìm kiếm và kết nối với các bạn học khác cùng luyện thi TOEIC để tạo động lực thi đua mỗi ngày!
              </p>
              <button
                onClick={() => setActiveTab("find")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
              >
                Tìm Bạn Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-base text-white shadow-md">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 border-zinc-900 absolute -bottom-0.5 -right-0.5 ${
                            friend.isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{friend.name}</h3>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-semibold">
                            {friend.stageLabel}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{friend.lastActive}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-red-400 bg-red-950/30 border border-red-500/20 px-2.5 py-1 rounded-full">
                        {friend.currentScore} TOEIC
                      </span>
                    </div>
                  </div>

                  {/* Friend Mini Stats (6. Friend progress view) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500">Mục tiêu</span>
                      <p className="text-xs font-bold text-white">{friend.targetScore}+</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">Chuỗi ngày</span>
                      <p className="text-xs font-bold text-orange-400 flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        <span>{friend.streak}d</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">Trạng thái</span>
                      <p className="text-xs font-bold text-emerald-400">
                        {friend.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {/* 5. Friend profile view */}
                      <button
                        onClick={() => handleViewFriendProfile(friend.id)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hồ sơ & Tiến độ</span>
                      </button>

                      {/* 7. Compare with friend */}
                      <button
                        onClick={() => handleCompareWithFriend(friend)}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>So sánh</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500">
                      {/* 8. Remove */}
                      <button
                        onClick={() => handleRemoveFriend(friend.id, friend.name)}
                        title="Hủy kết bạn"
                        className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>

                      {/* 9. Block */}
                      <button
                        onClick={() => handleBlockUser(friend.id, friend.name)}
                        title="Chặn người dùng"
                        className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS (2. Accept, 3. Decline) */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-400" />
              <span>Lời Mời Kết Bạn Đã Nhận ({requests.received.length})</span>
            </h3>

            {requests.received.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Không có lời mời kết bạn nào đang chờ phản hồi.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.received.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {req.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{req.name}</h4>
                          <span className="text-xs text-zinc-400">({req.email})</span>
                        </div>
                        {req.message && (
                          <p className="text-xs text-zinc-300 mt-1 italic bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
                            "{req.message}"
                          </p>
                        )}
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Gửi lúc: {new Date(req.sentAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Chấp nhận</span>
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Lời Mời Đã Gửi ({requests.sent.length})</span>
            </h3>

            {requests.sent.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Bạn chưa gửi lời mời kết bạn nào.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {requests.sent.map((s) => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white">{s.name}</h4>
                      <p className="text-[11px] text-zinc-500">{s.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 font-bold text-[10px]">
                      Đang chờ phản hồi
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FIND FRIENDS (1. Send friend request) */}
      {activeTab === "find" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm học viên theo tên hoặc email (ví dụ: 'nguyen', 'minh', 'toeic')..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searching ? "Đang tìm..." : "Tìm Kiếm"}</span>
            </button>
          </form>

          {/* Search Results */}
          <div className="space-y-3">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-sm text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-zinc-500">{user.email} • Chặng {user.stage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400">Mục tiêu: {user.targetScore}+</span>
                  {user.isFriend ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Đã là bạn</span>
                    </span>
                  ) : user.isPending ? (
                    <span className="px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                      Đã gửi lời mời
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Kết bạn</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BLOCKED USERS (9. Block User) */}
      {activeTab === "blocked" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" />
              <span>Danh Sách Người Dùng Đã Chặn ({blockedUsers.length})</span>
            </h3>

            {blockedUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Không có người dùng nào bị chặn.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {blockedUsers.map((bu) => (
                  <div key={bu.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{bu.name}</h4>
                      <p className="text-[11px] text-zinc-500">
                        {bu.email} • Chặn lúc: {new Date(bu.blockedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(bu.id, bu.name)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Bỏ chặn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5 & 6. FRIEND PROFILE & PROGRESS MODAL */}
      {selectedFriendProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-lg text-white">
                  {selectedFriendProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedFriendProfile.name}</h3>
                  <p className="text-xs text-zinc-400">{selectedFriendProfile.stageName} • {selectedFriendProfile.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFriendProfile(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Streak Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Điểm cao nhất</span>
                <div className="text-base font-bold text-red-400">{selectedFriendProfile.highestScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Chuỗi ngày</span>
                <div className="text-base font-bold text-orange-400">{selectedFriendProfile.streak}d 🔥</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Từ vựng</span>
                <div className="text-base font-bold text-white">{selectedFriendProfile.totalVocabLearned}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500">Bài thi đã làm</span>
                <div className="text-base font-bold text-blue-400">{selectedFriendProfile.mockTestsTaken}</div>
              </div>
            </div>

            {/* Recent Tests */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lịch sử thi thử gần nhất</span>
              <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                {selectedFriendProfile.recentTests.map((t, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{t.testName}</p>
                      <p className="text-[11px] text-zinc-500">LC: {t.listening} | RC: {t.reading} • {t.date}</p>
                    </div>
                    <span className="font-extrabold text-red-400 text-sm">{t.score} Điểm</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            {selectedFriendProfile.badges.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Huy hiệu thành tích</span>
                <div className="flex flex-wrap gap-2">
                  {selectedFriendProfile.badges.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-xs font-semibold">
                      🏆 {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFriendProfile(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. COMPARE WITH FRIEND MODAL */}
      {comparisonData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">So Sánh Năng Lực TOEIC</h3>
              </div>
              <button
                onClick={() => setComparisonData(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VS Header */}
            <div className="grid grid-cols-3 items-center text-center p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 font-bold">BẠN (TÔI)</span>
                <div className="text-xl font-black text-red-400">{comparisonData.user.totalScore} Điểm</div>
              </div>
              <div className="text-xs font-extrabold text-zinc-600 bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                VS
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-bold">{comparingFriendName.toUpperCase()}</span>
                <div className="text-xl font-black text-blue-400">{comparisonData.friend.totalScore} Điểm</div>
              </div>
            </div>

            {/* Metrics Comparison Table */}
            <div className="space-y-2">
              <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                {comparisonData.metrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <span className="w-20 font-bold text-left text-red-400">
                      {m.userVal} {m.unit}
                    </span>

                    <span className="font-semibold text-zinc-300 text-center flex-1">
                      {m.metric}
                    </span>

                    <span className="w-20 font-bold text-right text-blue-400">
                      {m.friendVal} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setComparisonData(null)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Hoàn Tất So Sánh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
