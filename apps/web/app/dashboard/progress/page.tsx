"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Flame,
  Trophy,
  Award,
  Shield,
  Snowflake,
  Star,
  Target,
  Gift,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type ProgressTab = "streak" | "achievements" | "points" | "leaderboard";

export default function ProgressHubPage() {
  const [activeTab, setActiveTab] = useState<ProgressTab>("streak");
  const [userProgress, setUserProgress] = useState<{
    streak: number;
    freezeCount: number;
    points: number;
    level: number;
    badgesCount: number;
    rank: number;
  }>({
    streak: 5,
    freezeCount: 2,
    points: 340,
    level: 2,
    badgesCount: 8,
    rank: 14,
  });

  useEffect(() => {
    Promise.all([
      apiFetch<any>("/profile/me").catch(() => null),
      apiFetch<any>("/levels/info").catch(() => null),
      apiFetch<any>("/points/balance").catch(() => null),
    ]).then(([profileData, levelData, pointsData]) => {
      setUserProgress((prev) => ({
        ...prev,
        streak: profileData?.streak || prev.streak,
        points: pointsData?.balance ?? profileData?.pointsBalance ?? prev.points,
        level: levelData?.data?.currentLevel || prev.level,
      }));
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600/15 via-zinc-900/60 to-zinc-900/40 border border-red-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/25">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Tiến Độ & Thành Tích</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30">
                  Gamification Hub
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Theo dõi chuỗi học tập, tích lũy điểm thưởng, chinh phục danh hiệu và bảng vàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-semibold">
              <Flame className="w-4 h-4" />
              <span>{userProgress.streak} Ngày Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-semibold">
              <Star className="w-4 h-4" />
              <span>{userProgress.points} Điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1.5 max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("streak")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "streak"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Chuỗi ngày học</span>
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "achievements"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Thành tích & Huy hiệu</span>
        </button>

        <button
          onClick={() => setActiveTab("points")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "points"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Điểm & Đổi quà</span>
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Bảng xếp hạng</span>
        </button>
      </div>

      {/* TAB 1: STREAK */}
      {activeTab === "streak" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Chuỗi hiện tại</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-3xl font-extrabold text-orange-400 flex items-baseline gap-1">
                {userProgress.streak} <span className="text-sm font-normal text-zinc-400">ngày liên tiếp</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">Học ít nhất 1 bài học mỗi ngày để duy trì ngọn lửa!</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Khiên đóng băng</span>
                <Snowflake className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-blue-400 flex items-baseline gap-1">
                {userProgress.freezeCount} <span className="text-sm font-normal text-zinc-400">khiên có sẵn</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">Tự động bảo vệ chuỗi khi bạn lỡ bận việc 1 ngày.</p>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Mốc thưởng tiếp theo</span>
                <Target className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-extrabold text-white flex items-baseline gap-1">
                7 <span className="text-sm font-normal text-zinc-400">ngày (+100 XP)</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">Còn {Math.max(0, 7 - userProgress.streak)} ngày nữa để mở khóa huy hiệu Tuần Chăm Chỉ.</p>
            </div>
          </div>

          <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-400" />
                <span>Chi tiết Lịch & Mốc Thưởng Streak</span>
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Xem lịch sử hoạt động học tập các ngày trong tháng, mua khiên đóng băng và nhận quà mốc chuỗi.
              </p>
            </div>
            <Link
              href="/dashboard/streak"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shrink-0 shadow-md shadow-red-600/20"
            >
              <span>Xem trang chuỗi đầy đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS & BADGES */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    Hệ Thống Mốc
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Thành Tích Cá Nhân</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Các mốc thử thách ghi nhận nỗ lực: Hoàn thành 100 từ vựng đầu tiên, Đạt chuỗi 7 ngày, Giải 50 câu trắc nghiệm đúng liên tiếp, Hoàn thành Full Test đầu tiên.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/achievements"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow-md shadow-amber-600/20"
                >
                  <span>Mở bảng thành tích</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    Bộ Sưu Tập Huy Hiệu
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Huy Hiệu Danh Dự (Badges)</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Huy hiệu độc quyền phân hạng Đồng, Bạc, Vàng, Kim Cương theo các kỹ năng TOEIC: Chiến thần Nghe, Bậc thầy Đọc hiểu, Vua Ngữ pháp và Chuyên gia Từ vựng.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/badges"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/20"
                >
                  <span>Xem bộ sưu tập huy hiệu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POINTS & REWARDS */}
      {activeTab === "points" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-3">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Lịch Sử & Tích Lũy Điểm Thưởng</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Nhận điểm thưởng qua mỗi lượt học từ, giải bài tập đúng và duy trì chuỗi học. Theo dõi biểu đồ thu chi điểm minh bạch.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/points"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow-md shadow-amber-600/20"
                >
                  <span>Chi tiết ví điểm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/25 text-red-400 flex items-center justify-center mb-3">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Cửa Hàng Đổi Quà (Rewards Store)</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Dùng điểm thưởng để đổi khiên bảo vệ streak, bộ đề thi đặc biệt, mở khóa giao diện độc quyền và vật phẩm học tập giá trị.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/rewards"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-md shadow-red-600/20"
                >
                  <span>Đến cửa hàng quà</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD & CHALLENGES */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Bảng Xếp Hạng Tuần & Tháng</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Đua top cùng hàng nghìn học viên TOEIC trên toàn quốc. Top 3 mỗi tuần nhận huy hiệu độc quyền và hàng trăm điểm thưởng!
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/leaderboard"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold transition shadow-md shadow-yellow-600/20"
                >
                  <span>Xem bảng xếp hạng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/25 text-blue-400 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Thử Thách Hàng Ngày (Daily Quests)</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  3 nhiệm vụ mỗi ngày: Ôn 20 từ SRS, Giải đúng 10 câu trắc nghiệm và Luyện 1 bài nghe ngắn để nhận thêm điểm kinh nghiệm.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/challenges"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
                >
                  <span>Nhận thử thách hôm nay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
