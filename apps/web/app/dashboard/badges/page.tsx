"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Award,
  Star,
  Filter,
  ChevronDown,
  Lock,
  Share2,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  Target,
  Flame,
  Zap,
} from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  criteria: {
    type: string;
    target: number;
  };
  icon: string;
  badgeColor: string;
  rarity: string;
  isLimited: boolean;
  limitCount: number | null;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  shareCount: number;
  isDisplayed: boolean;
}

interface BadgesResponse {
  success: boolean;
  badges: Badge[];
  totalBadges: number;
  unlockedBadges: number;
}

export default function BadgesPage() {
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRarity, setActiveRarity] = useState("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<BadgesResponse>("/badges/user");
      if (res.success) {
        setData(res);
      } else {
        setError("Không thể tải danh sách huy hiệu");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải huy hiệu");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (badge: Badge) => {
    const shareText = `🎉 Tôi vừa đạt được huy hiệu "${badge.name}" trên TOEIC-AI! ${badge.icon} - Luyện thi TOEIC thông minh cùng AI.`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!");

      await apiFetch(`/badges/share/${badge.id}`, {
        method: "POST",
      });

      if (data) {
        setData({
          ...data,
          badges: data.badges.map((b) =>
            b.id === badge.id ? { ...b, shareCount: b.shareCount + 1 } : b
          ),
        });
      }
    } catch (err) {
      console.error("Error sharing badge:", err);
      showToast("Không thể thực hiện chia sẻ");
    }
  };

  const handleToggleDisplay = async (badge: Badge) => {
    try {
      await apiFetch(`/badges/display/${badge.id}`, {
        method: "PUT",
        body: JSON.stringify({ isDisplayed: !badge.isDisplayed }),
      });

      if (data) {
        setData({
          ...data,
          badges: data.badges.map((b) =>
            b.id === badge.id ? { ...b, isDisplayed: !b.isDisplayed } : b
          ),
        });
      }
    } catch (err) {
      console.error("Error toggling badge display:", err);
      showToast("Không thể cập nhật hiển thị huy hiệu");
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
    { id: "achievement", label: "Thành tích" },
    { id: "milestone", label: "Cột mốc" },
    { id: "special", label: "Đặc biệt" },
  ];

  const rarities = [
    { id: "all", label: "Tất cả" },
    { id: "common", label: "Phổ thông" },
    { id: "rare", label: "Hiếm" },
    { id: "epic", label: "Sử thi" },
    { id: "legendary", label: "Huyền thoại" },
    { id: "limited", label: "Phiên bản giới hạn" },
  ];

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "text-zinc-400 border-zinc-600/30",
      rare: "text-blue-400 border-blue-500/30",
      epic: "text-purple-400 border-purple-500/30",
      legendary: "text-amber-400 border-amber-500/30",
      limited: "text-pink-400 border-pink-500/30",
    };
    return colors[rarity] || "text-zinc-400 border-zinc-600/30";
  };

  const getRarityLabel = (rarity: string) => {
    const labels: Record<string, string> = {
      common: "Phổ thông",
      rare: "Hiếm",
      epic: "Sử thi",
      legendary: "Huyền thoại",
      limited: "Phiên bản giới hạn",
    };
    return labels[rarity] || rarity;
  };

  const getBadgeIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      achievement: <Trophy className="w-4 h-4" />,
      milestone: <Target className="w-4 h-4" />,
      special: <Sparkles className="w-4 h-4" />,
    };
    return icons[category] || <Award className="w-4 h-4" />;
  };

  const filteredBadges = data?.badges.filter(
    (badge) =>
      (activeCategory === "all" || badge.category === activeCategory) &&
      (activeRarity === "all" || badge.rarity === activeRarity)
  ) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang tải hệ thống huy hiệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải dữ liệu</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchBadges}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">TỔNG HUY HIỆU</p>
            <h3 className="text-2xl font-bold text-white">
              {data?.totalBadges || 0}
            </h3>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">ĐÃ MỞ KHÓA</p>
            <h3 className="text-2xl font-bold text-white">
              {data?.unlockedBadges || 0}
            </h3>
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">TIẾN ĐỘ</p>
            <h3 className="text-2xl font-bold text-white">
              {data?.totalBadges ? Math.round((data.unlockedBadges / data.totalBadges) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 border-b border-zinc-800/40 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Danh mục:</span>
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Độ hiếm:</span>
          {rarities.map((rarity) => (
            <button
              key={rarity.id}
              onClick={() => setActiveRarity(rarity.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border
                ${activeRarity === rarity.id
                  ? "bg-red-600/12 text-red-400 border-red-600/25"
                  : "bg-[#0d0d14]/40 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800/40 hover:text-zinc-200"
                }
              `}
            >
              {rarity.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0d14]/20 border border-zinc-800/40 rounded-2xl">
          <p className="text-zinc-500 text-sm">Không tìm thấy huy hiệu nào với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const unlocked = badge.isUnlocked;
            return (
              <div
                key={badge.id}
                className={`
                  relative bg-[#0d0d14] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300
                  ${unlocked
                    ? "border-zinc-800/80 hover:border-purple-500/25 shadow-md hover:shadow-purple-950/5"
                    : "border-zinc-800/40 opacity-60 grayscale-[30%]"
                  }
                `}
              >
                {/* Badge Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`
                      w-14 h-14 rounded-xl border flex items-center justify-center text-3xl shrink-0
                      ${unlocked
                        ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}`
                        : "bg-zinc-800/40 text-zinc-600 border-zinc-900/60"
                      }
                    `}
                  >
                    {unlocked ? badge.icon : <Lock className="w-6 h-6 text-zinc-600" />}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`
                        px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border
                        ${getRarityColor(badge.rarity)}
                      `}
                    >
                      {getRarityLabel(badge.rarity)}
                    </span>
                    {badge.isLimited && (
                      <span className="text-[9px] text-pink-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Limited
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getBadgeIcon(badge.category)}
                    <h4 className="text-sm font-bold text-white leading-snug">{badge.name}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{badge.description}</p>
                </div>

                {/* Progress or Actions */}
                <div className="mt-5 pt-4 border-t border-zinc-800/40">
                  {!unlocked ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                        <span>Tiến độ</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-zinc-600 h-full rounded-full transition-all"
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleDisplay(badge)}
                        className={`p-1.5 rounded-lg transition-all ${
                          badge.isDisplayed
                            ? "bg-purple-600/20 text-purple-400"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                        title={badge.isDisplayed ? "Ẩn trên hồ sơ" : "Hiển thị trên hồ sơ"}
                      >
                        {badge.isDisplayed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleShare(badge)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                        title="Chia sẻ huy hiệu"
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d0d14] border border-zinc-800/80 rounded-xl px-4 py-3 shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
            <Star className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}
