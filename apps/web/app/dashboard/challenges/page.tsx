"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Trophy,
  Target,
  Clock,
  Star,
  Users,
  Flame,
  CheckCircle,
  XCircle,
  Plus,
  Calendar,
  BookOpen,
  Headphones,
  FileText,
  Award,
  TrendingUp,
  Zap,
  RefreshCw,
  Filter,
  ChevronDown,
  X,
  Crown,
  Medal,
} from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  criteria: string;
  targetValue: number;
  rewards: string;
  pointsReward: number;
  badgeReward: any;
  startDate: string;
  endDate: string;
  difficulty: string;
  maxParticipants: number | null;
  currentParticipants: number;
  userStatus?: string;
}

interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  status: string;
  acceptedAt: string | null;
  completedAt: string | null;
  progress: number;
  score: number | null;
  rewardsReceived: string | null;
  challenge: Challenge;
  currentProgress: number;
  targetValue: number;
  progressPercentage: number;
}

interface ChallengeHistory {
  id: number;
  userId: number;
  challengeId: number;
  status: string;
  acceptedAt: string | null;
  completedAt: string | null;
  progress: number;
  score: number | null;
  rewardsReceived: string | null;
  challenge: {
    title: string;
    type: string;
    category: string;
    pointsReward: number;
    badgeReward: any;
  };
}

type ChallengeType = "all" | "daily" | "weekly" | "monthly" | "special" | "custom";
type ChallengeCategory = "all" | "vocabulary" | "listening" | "reading" | "grammar" | "practice" | "test";

export default function ChallengesPage() {
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<ChallengeType>("all");
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory>("all");
  const [activeTab, setActiveTab] = useState<"available" | "my" | "history">("available");
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    category: "vocabulary",
    difficulty: "medium",
    startDate: "",
    endDate: "",
    targetValue: "",
    pointsReward: "",
    maxParticipants: "",
  });

  // Update current time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const challengeData = {
        ...createFormData,
        targetValue: parseInt(createFormData.targetValue),
        pointsReward: parseInt(createFormData.pointsReward),
        maxParticipants: createFormData.maxParticipants ? parseInt(createFormData.maxParticipants) : null,
        criteria: JSON.stringify({
          type: createFormData.category,
          target: createFormData.targetValue,
        }),
      };

      const res = await apiFetch("/challenges/create", {
        method: "POST",
        body: JSON.stringify(challengeData),
      });

      if (res.success) {
        setShowCreateModal(false);
        setCreateFormData({
          title: "",
          description: "",
          category: "vocabulary",
          difficulty: "medium",
          startDate: "",
          endDate: "",
          targetValue: "",
          pointsReward: "",
          maxParticipants: "",
        });
        fetchChallenges();
      }
    } catch (err) {
      console.error("Error creating challenge:", err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [typeFilter, categoryFilter]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const [availableRes, myRes, historyRes] = await Promise.all([
        apiFetch("/challenges/available" + (typeFilter !== "all" ? `?type=${typeFilter}` : "")),
        apiFetch("/challenges/my"),
        apiFetch("/challenges/history"),
      ]);

      if (availableRes.success) {
        setAvailableChallenges(availableRes.data.challenges);
      }
      if (myRes.success) {
        setUserChallenges(myRes.data.challenges);
      }
      if (historyRes.success) {
        setChallengeHistory(historyRes.data.history);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thử thách");
    } finally {
      setLoading(false);
    }
  };

  const acceptChallenge = async (challengeId: number) => {
    try {
      const res = await apiFetch("/challenges/accept", {
        method: "POST",
        body: JSON.stringify({ challengeId }),
      });
      if (res.success) {
        fetchChallenges();
      }
    } catch (err) {
      console.error("Error accepting challenge:", err);
    }
  };

  const declineChallenge = async (challengeId: number) => {
    try {
      const res = await apiFetch("/challenges/decline", {
        method: "POST",
        body: JSON.stringify({ challengeId }),
      });
      if (res.success) {
        fetchChallenges();
      }
    } catch (err) {
      console.error("Error declining challenge:", err);
    }
  };

  const viewLeaderboard = async (challengeId: number) => {
    try {
      const res = await apiFetch(`/challenges/${challengeId}/leaderboard`);
      if (res.success) {
        setLeaderboardData(res.data);
        setShowLeaderboard(true);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Đã kết thúc";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-emerald-400 bg-emerald-600/10 border-emerald-500/20";
      case "medium":
        return "text-amber-400 bg-amber-600/10 border-amber-500/20";
      case "hard":
        return "text-orange-400 bg-orange-600/10 border-orange-500/20";
      case "expert":
        return "text-red-400 bg-red-600/10 border-red-500/20";
      default:
        return "text-zinc-400 bg-zinc-600/10 border-zinc-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vocabulary":
        return <BookOpen className="w-4 h-4" />;
      case "listening":
        return <Headphones className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      case "grammar":
        return <Award className="w-4 h-4" />;
      case "practice":
        return <Target className="w-4 h-4" />;
      case "test":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vocabulary: "Từ vựng",
      listening: "Nghe",
      reading: "Đọc",
      grammar: "Ngữ pháp",
      practice: "Luyện tập",
      test: "Kiểm tra",
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Hàng ngày",
      weekly: "Hàng tuần",
      monthly: "Hàng tháng",
      special: "Đặc biệt",
      custom: "Tùy chỉnh",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Hoàn thành
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Đang làm
          </span>
        );
      case "declined":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600/10 border border-red-500/20 text-red-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-600/10 border border-zinc-500/20 text-zinc-400">
            Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-red-400" />
            <span>Thử Thách</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Hoàn thành thử thách để nhận phần thưởng</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchChallenges}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo thử thách</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "available"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>Có sẵn</span>
            {availableChallenges.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {availableChallenges.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "my"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span>Của tôi</span>
            {userChallenges.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {userChallenges.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "history"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Lịch sử</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ChallengeType)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Tất cả loại</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
            <option value="special">Đặc biệt</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ChallengeCategory)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="vocabulary">Từ vựng</option>
            <option value="listening">Nghe</option>
            <option value="reading">Đọc</option>
            <option value="grammar">Ngữ pháp</option>
            <option value="practice">Luyện tập</option>
            <option value="test">Kiểm tra</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {getCategoryIcon(categoryFilter)}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Đang tải thử thách...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchChallenges}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : activeTab === "available" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableChallenges.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Không có thử thách nào có sẵn</p>
            </div>
          ) : (
            availableChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-600/10 border border-zinc-500/20 text-zinc-400">
                      {getTypeLabel(challenge.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <Users className="w-3 h-3" />
                    <span>{challenge.currentParticipants}</span>
                    {challenge.maxParticipants && `/${challenge.maxParticipants}`}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{challenge.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    {getCategoryIcon(challenge.category)}
                    <span>{getCategoryLabel(challenge.category)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeRemaining(challenge.endDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Phần thưởng</p>
                      <p className="text-sm font-bold text-amber-400">{challenge.pointsReward} PTS</p>
                    </div>
                  </div>
                  {challenge.badgeReward && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Huy hiệu</p>
                        <p className="text-sm font-bold text-red-400">{challenge.badgeReward.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {challenge.userStatus === "accepted" ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                    >
                      Đã chấp nhận
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => acceptChallenge(challenge.id)}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => declineChallenge(challenge.id)}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => viewLeaderboard(challenge.id)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                    title="Bảng xếp hạng"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "my" ? (
        <div className="space-y-4">
          {userChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Bạn chưa tham gia thử thách nào</p>
            </div>
          ) : (
            userChallenges.map((userChallenge) => (
              <div
                key={userChallenge.id}
                className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{userChallenge.challenge.title}</h3>
                      {getStatusBadge(userChallenge.status)}
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{userChallenge.challenge.description}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(userChallenge.challenge.category)}
                        <span>{getCategoryLabel(userChallenge.challenge.category)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining(userChallenge.challenge.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Phần thưởng</p>
                      <p className="text-sm font-bold text-amber-400">{userChallenge.challenge.pointsReward} PTS</p>
                    </div>
                    <button
                      onClick={() => viewLeaderboard(userChallenge.challengeId)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Bảng xếp hạng"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {userChallenge.status === "accepted" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Tiến độ</span>
                      <span className="text-xs font-bold text-white">
                        {userChallenge.currentProgress} / {userChallenge.targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                        style={{ width: `${userChallenge.progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{userChallenge.progressPercentage}% hoàn thành</p>
                  </div>
                )}

                {userChallenge.status === "completed" && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Đã hoàn thành vào {new Date(userChallenge.completedAt!).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {challengeHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Chưa có lịch sử thử thách</p>
            </div>
          ) : (
            challengeHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    {history.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{history.challenge.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500">{getTypeLabel(history.challenge.type)}</span>
                      <span className="text-[10px] text-zinc-500">•</span>
                      <span className="text-[10px] text-zinc-500">{getCategoryLabel(history.challenge.category)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${history.status === "completed" ? "text-emerald-400" : "text-red-400"}`}>
                    {history.status === "completed" ? "+" : ""}{history.challenge.pointsReward} PTS
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {history.completedAt ? new Date(history.completedAt).toLocaleDateString("vi-VN") : "-"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && leaderboardData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <span>Bảng xếp hạng thử thách</span>
              </h3>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {leaderboardData.leaderboard.map((entry: any, index: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30" :
                      index === 1 ? "bg-gradient-to-br from-zinc-400/20 to-zinc-500/10 border-zinc-400/30" :
                      index === 2 ? "bg-gradient-to-br from-amber-700/20 to-amber-800/10 border-amber-700/30" :
                      "bg-zinc-800"
                    }`}>
                      {index === 0 ? <Crown className="w-5 h-5 text-amber-400" /> :
                       index === 1 ? <Medal className="w-5 h-5 text-zinc-300" /> :
                       index === 2 ? <Medal className="w-5 h-5 text-amber-600" /> :
                       <span className="text-sm font-bold text-zinc-400">#{entry.rank}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{entry.fullName}</p>
                      <p className="text-xs text-zinc-500">{entry.pointsBalance} PTS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{entry.score} điểm</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(entry.completedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-400" />
                <span>Tạo thử thách tùy chỉnh</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                  placeholder="Nhập tiêu đề thử thách"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Mô tả</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                  rows={3}
                  placeholder="Mô tả thử thách"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Danh mục</label>
                  <select 
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="vocabulary">Từ vựng</option>
                    <option value="listening">Nghe</option>
                    <option value="reading">Đọc</option>
                    <option value="grammar">Ngữ pháp</option>
                    <option value="practice">Luyện tập</option>
                    <option value="test">Kiểm tra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Độ khó</label>
                  <select 
                    value={createFormData.difficulty}
                    onChange={(e) => setCreateFormData({ ...createFormData, difficulty: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                    <option value="expert">Chuyên gia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={createFormData.startDate}
                    onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={createFormData.endDate}
                    onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Mục tiêu</label>
                  <input
                    type="number"
                    value={createFormData.targetValue}
                    onChange={(e) => setCreateFormData({ ...createFormData, targetValue: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                    placeholder="Số lượng mục tiêu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Điểm thưởng</label>
                  <input
                    type="number"
                    value={createFormData.pointsReward}
                    onChange={(e) => setCreateFormData({ ...createFormData, pointsReward: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                    placeholder="Số điểm thưởng"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Số người tham gia tối đa</label>
                <input
                  type="number"
                  value={createFormData.maxParticipants}
                  onChange={(e) => setCreateFormData({ ...createFormData, maxParticipants: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500/50"
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Tạo thử thách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}