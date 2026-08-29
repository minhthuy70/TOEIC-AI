"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Trophy,
  Award,
  TrendingUp,
  CheckCircle2,
  Lock,
  Share2,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  criteria: {
    type: string;
    target: number;
  };
  points: number;
  icon: string;
  badgeColor: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  shareCount: number;
}

interface AchievementResponse {
  success: boolean;
  achievements: Achievement[];
  totalPoints: number;
  leaderboardPosition: number;
  totalUsers: number;
}

interface UnlockedNotification {
  id: number;
  achievement: {
    name: string;
    description: string;
    points: number;
    icon: string;
  };
  unlockedAt: string;
  message: string;
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState<UnlockedNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    fetchAchievements();
    fetchNotifications();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<AchievementResponse>("/dashboard/achievements");
      if (res.success) {
        setData(res);
      } else {
        setError("Không thể tải danh sách thành tích");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thành tích");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch<{ success: boolean; notifications: UnlockedNotification[] }>(
        "/dashboard/achievements/notifications"
      );
      if (res.success && res.notifications.length > 0) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Error fetching achievement notifications:", err);
    }
  };

  const handleShare = async (achievement: Achievement) => {
    const shareText = `🎉 Tôi vừa đạt được thành tích "${achievement.name}" (+${achievement.points} PTS) trên TOEIC-AI! ${achievement.icon} - Luyện thi TOEIC thông minh cùng AI.`;
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(shareText);
      showToast("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!");

      // Update share count in backend
      await apiFetch(`/dashboard/achievements/${achievement.id}/share`, {
        method: "POST",
      });

      // Update local state
      if (data) {
        setData({
          ...data,
          achievements: data.achievements.map((a) =>
            a.id === achievement.id ? { ...a, shareCount: a.shareCount + 1 } : a
          ),
        });
      }
    } catch (err) {
      console.error("Error sharing achievement:", err);
      showToast("Không thể thực hiện chia sẻ");
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "learning", label: "Học tập" },
    { id: "practice", label: "Luyện tập" },
    { id: "streak", label: "Chuỗi ngày" },
    { id: "accuracy", label: "Độ chính xác" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang tải hệ thống thành tích...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải dữ liệu</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchAchievements}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const achievements = data?.achievements || [];
  const totalCount = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = achievements.filter(
    (a) => activeCategory === "all" || a.category === activeCategory
  );

  const getBadgeColorClasses = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) return "bg-zinc-800/40 text-zinc-600 border-zinc-900/60";
    
    switch (color) {
      case "blue":
        return "bg-blue-600/10 text-blue-400 border-blue-500/20";
      case "purple":
        return "bg-purple-600/10 text-purple-400 border-purple-500/20";
      case "green":
      case "emerald":
        return "bg-emerald-600/10 text-emerald-400 border-emerald-500/20";
      case "orange":
        return "bg-orange-600/10 text-orange-400 border-orange-500/20";
      case "red":
        return "bg-red-600/10 text-red-400 border-red-500/20";
      case "yellow":
      case "gold":
      case "amber":
        return "bg-amber-600/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-800/60 text-zinc-200 border-zinc-700/60";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Notifications banner for recently unlocked */}
      {showNotifications && notifications.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/40 to-zinc-900 border border-red-900/30 rounded-2xl p-4 flex items-start gap-3 relative shadow-lg shadow-red-950/10">
          <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center text-lg text-red-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-semibold text-white mb-0.5">Mở khóa thành tích mới!</h4>
            <div className="space-y-1">
              {notifications.map((notif) => (
                <p key={notif.id} className="text-xs text-zinc-400">
                  {notif.achievement.icon} <span className="text-red-400 font-medium">{notif.achievement.name}</span>: {notif.message}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">TỔNG ĐIỂM THÀNH TÍCH</p>
            <h3 className="text-2xl font-bold text-white tracking-wide mt-0.5">
              {data?.totalPoints || 0} <span className="text-xs text-zinc-500 font-normal">PTS</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Mở khóa để nhận điểm thưởng</p>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">BẢNG XẾP HẠNG</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">
              Hạng #{data?.leaderboardPosition || "—"}
              <span className="text-xs text-zinc-500 font-normal"> / {data?.totalUsers || 0}</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Xếp hạng theo điểm tích lũy</p>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-500 font-medium">TIẾN ĐỘ THÀNH TỰU</p>
            <div className="flex justify-between items-baseline mt-0.5">
              <h3 className="text-2xl font-bold text-white">
                {unlockedCount} / {totalCount}
              </h3>
              <span className="text-xs text-blue-400 font-semibold">{unlockedPercent}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${unlockedPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs categories filter */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800/40 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border
              ${activeCategory === cat.id
                ? "bg-red-600/12 text-red-400 border-red-600/25"
                : "bg-[#0d0d14]/40 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800/40 hover:text-zinc-200"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements grid view */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0d14]/20 border border-zinc-800/40 rounded-2xl">
          <p className="text-zinc-500 text-sm">Không tìm thấy thành tích nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((item) => {
            const unlocked = item.isUnlocked;
            return (
              <div
                key={item.id}
                className={`
                  relative bg-[#0d0d14] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300
                  ${unlocked
                    ? "border-zinc-800/80 hover:border-red-500/25 shadow-md hover:shadow-red-950/5"
                    : "border-zinc-800/40 opacity-60 grayscale-[30%]"
                  }
                `}
              >
                {/* Badge Color difficulty indicator */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`
                      w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0
                      ${getBadgeColorClasses(item.badgeColor, unlocked)}
                    `}
                  >
                    {unlocked ? item.icon : <Lock className="w-5 h-5 text-zinc-600" />}
                  </div>

                  <span
                    className={`
                      px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase
                      ${unlocked
                        ? "bg-red-600/10 text-red-400 border border-red-500/10"
                        : "bg-zinc-800/40 text-zinc-500 border border-zinc-800/60"
                      }
                    `}
                  >
                    +{item.points} PTS
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white leading-snug">{item.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* Progress Indicator */}
                <div className="mt-5 pt-4 border-t border-zinc-800/40">
                  {!unlocked ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                        <span>Tiến độ</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-zinc-600 h-full rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Đạt được ngày{" "}
                          {item.unlockedAt
                            ? new Date(item.unlockedAt).toLocaleDateString("vi-VN")
                            : "—"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                        title="Chia sẻ thành tích"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clipboard Toast Alerts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d0d14] border border-zinc-800/80 rounded-xl px-4 py-3 shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}
