"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Gift,
  Star,
  Clock,
  Tag,
  History,
  Share2,
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Trophy,
  ShoppingCart,
  Percent,
  Zap,
  Crown,
  Ticket,
  RefreshCw,
  Filter,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";

interface Reward {
  id: number;
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  value: string;
  imageUrl: string | null;
  isActive: boolean;
  isSpecial: boolean;
  isLimited: boolean;
  limitedQuantity: number | null;
  currentQuantity: number;
  availableFrom: string | null;
  availableUntil: string | null;
  terms: string | null;
  isAvailable: boolean;
  remainingQuantity: number | null;
  timeRemaining: number | null;
}

interface RewardHistory {
  id: number;
  userId: number;
  rewardId: number;
  pointsSpent: number;
  status: string;
  redemptionCode: string | null;
  redeemedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  reward: {
    name: string;
    category: string;
    imageUrl: string | null;
  };
}

interface RewardNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  rewardId: number | null;
  redemptionId: number | null;
  bonusPoints: number | null;
  isRead: boolean;
  createdAt: string;
}

type RewardCategory = "all" | "discount" | "premium_content" | "physical_item" | "digital_item" | "experience";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [notifications, setNotifications] = useState<RewardNotification[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<RewardCategory>("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "history">("catalog");
  
  // UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [redeemResult, setRedeemResult] = useState<any>(null);

  useEffect(() => {
    fetchRewards();
    fetchUserPoints();
  }, [categoryFilter]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const [catalogRes, historyRes, notifRes] = await Promise.all([
        apiFetch(`/rewards/catalog${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`),
        apiFetch("/rewards/history"),
        apiFetch("/rewards/notifications"),
      ]);

      if (catalogRes.success) {
        setRewards(catalogRes.data.rewards);
      }
      if (historyRes.success) {
        setRewardHistory(historyRes.data.history);
      }
      if (notifRes.success) {
        setNotifications(notifRes.data.notifications);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải phần thưởng");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const res = await apiFetch("/points/stats");
      if (res.success) {
        setUserPoints(res.data.currentBalance);
      }
    } catch (err) {
      console.error("Error fetching user points:", err);
    }
  };

  const redeemReward = async (rewardId: number) => {
    try {
      const res = await apiFetch("/rewards/redeem", {
        method: "POST",
        body: JSON.stringify({ rewardId }),
      });

      if (res.success) {
        setRedeemResult(res.data);
        setShowRedeemModal(false);
        fetchRewards();
        fetchUserPoints();
      }
    } catch (err) {
      console.error("Error redeeming reward:", err);
      alert("Không thể đổi phần thưởng. Vui lòng thử lại.");
    }
  };

  const shareReward = async (rewardId: number, bonusPoints: number = 0) => {
    try {
      const res = await apiFetch("/rewards/share", {
        method: "POST",
        body: JSON.stringify({ rewardId, bonusPoints }),
      });

      if (res.success) {
        setShareData(res.data);
        setShowShareModal(true);
      }
    } catch (err) {
      console.error("Error sharing reward:", err);
      alert("Không thể chia sẻ phần thưởng. Vui lòng thử lại.");
    }
  };

  const copyShareLink = (shareUrl: string) => {
    navigator.clipboard.writeText(window.location.origin + shareUrl);
    alert("Đã sao chép link chia sẻ!");
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiFetch("/rewards/notifications/read", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });
      fetchRewards();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "discount":
        return <Percent className="w-4 h-4" />;
      case "premium_content":
        return <Crown className="w-4 h-4" />;
      case "physical_item":
        return <ShoppingCart className="w-4 h-4" />;
      case "digital_item":
        return <Ticket className="w-4 h-4" />;
      case "experience":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      discount: "Giảm giá",
      premium_content: "Nội dung cao cấp",
      physical_item: "Vật phẩm",
      digital_item: "Sản phẩm số",
      experience: "Trải nghiệm",
    };
    return labels[category] || category;
  };

  const getTimeRemaining = (timeRemaining: number | null) => {
    if (!timeRemaining) return null;
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return "Sắp hết hạn";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-red-400" />
            <span>Phần Thưởng</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Đổi điểm tích lũy để nhận phần thưởng hấp dẫn</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
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
                {notifications.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">Không có thông báo mới</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
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
            onClick={fetchRewards}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Points Card */}
      <div className="bg-gradient-to-r from-red-950/30 to-zinc-900 border border-red-900/30 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Điểm của bạn</p>
              <h3 className="text-2xl font-black text-white">{userPoints.toLocaleString()} PTS</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Có thể đổi</p>
            <p className="text-sm font-bold text-emerald-400">{rewards.filter((r) => r.pointsCost <= userPoints && r.isAvailable).length} phần thưởng</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "catalog"
              ? "bg-red-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span>Danh mục</span>
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
            <History className="w-4 h-4" />
            <span>Lịch sử</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RewardCategory)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="discount">Giảm giá</option>
            <option value="premium_content">Nội dung cao cấp</option>
            <option value="physical_item">Vật phẩm</option>
            <option value="digital_item">Sản phẩm số</option>
            <option value="experience">Trải nghiệm</option>
          </select>
          <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Đang tải phần thưởng...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchRewards}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : activeTab === "catalog" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gift className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Không có phần thưởng nào</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className={`relative bg-[#0d0d14] border rounded-2xl p-5 hover:border-zinc-700/60 transition-colors ${
                  reward.isSpecial ? "border-amber-500/30" : "border-zinc-800/60"
                }`}
              >
                {/* Special Badge */}
                {reward.isSpecial && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Đặc biệt
                    </span>
                  </div>
                )}

                {/* Limited Badge */}
                {reward.isLimited && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600/10 border border-red-500/20 text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Giới hạn
                    </span>
                    {reward.remainingQuantity !== null && (
                      <span className="text-xs text-zinc-500">
                        Còn {reward.remainingQuantity}/{reward.limitedQuantity}
                      </span>
                    )}
                  </div>
                )}

                {/* Time Remaining */}
                {reward.timeRemaining && reward.timeRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeRemaining(reward.timeRemaining)}</span>
                  </div>
                )}

                {/* Reward Image */}
                {reward.imageUrl ? (
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                    <Gift className="w-12 h-12 text-zinc-600" />
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    {getCategoryIcon(reward.category)}
                    <span>{getCategoryLabel(reward.category)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{reward.name}</h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{reward.description}</p>

                {/* Points Cost */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Cần</p>
                      <p className="text-sm font-bold text-amber-400">{reward.pointsCost.toLocaleString()} PTS</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!reward.isAvailable ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                    >
                      Hết hàng
                    </button>
                  ) : userPoints < reward.pointsCost ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                    >
                      Không đủ điểm
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedReward(reward);
                        setShowRedeemModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Đổi ngay
                    </button>
                  )}
                  <button
                    onClick={() => shareReward(reward.id)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rewardHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Chưa có lịch sử đổi phần thưởng</p>
            </div>
          ) : (
            rewardHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    {history.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{history.reward.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500">{getCategoryLabel(history.reward.category)}</span>
                      {history.redemptionCode && (
                        <span className="text-[10px] text-zinc-500">•</span>
                      )}
                      {history.redemptionCode && (
                        <span className="text-[10px] text-amber-400 font-mono">{history.redemptionCode}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">-{history.pointsSpent} PTS</p>
                  <p className="text-[10px] text-zinc-500">
                    {new Date(history.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-red-400" />
                <span>Đổi phần thưởng</span>
              </h3>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{selectedReward.name}</h4>
                <p className="text-sm text-zinc-400">{selectedReward.description}</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Điểm cần</span>
                  <span className="text-sm font-bold text-amber-400">{selectedReward.pointsCost.toLocaleString()} PTS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Điểm của bạn</span>
                  <span className="text-sm font-bold text-emerald-400">{userPoints.toLocaleString()} PTS</span>
                </div>
              </div>

              {selectedReward.terms && (
                <div className="text-xs text-zinc-500 bg-zinc-900/40 rounded-lg p-3">
                  <p className="font-medium mb-1">Điều khoản:</p>
                  <p>{selectedReward.terms}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => redeemReward(selectedReward.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Xác nhận đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Success Modal */}
      {redeemResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Đổi thành công!</h3>
              <p className="text-sm text-zinc-400 mb-4">Bạn đã đổi phần thưởng thành công</p>
              
              {redeemResult.redemptionCode && (
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Mã đổi thưởng:</p>
                  <p className="text-lg font-bold text-amber-400 font-mono">{redeemResult.redemptionCode}</p>
                </div>
              )}

              <button
                onClick={() => setRedeemResult(null)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-red-400" />
                <span>Chia sẻ phần thưởng</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-2">Link chia sẻ:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin + shareData.shareUrl}
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() => copyShareLink(shareData.shareUrl)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {shareData.bonusPoints > 0 && (
                <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-400">
                    Bạn sẽ nhận thêm {shareData.bonusPoints} điểm khi có người dùng đổi phần thưởng này
                  </p>
                </div>
              )}

              <div className="text-xs text-zinc-500">
                <p>Link sẽ hết hạn sau: {new Date(shareData.expiresAt).toLocaleDateString("vi-VN")}</p>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}