"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Flame,
  Trophy,
  Shield,
  Snowflake,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShoppingBag,
  Info,
} from "lucide-react";

interface StreakDay {
  date: string;
  displayDate: string;
  dayOfWeek: string;
  active: boolean;
  isFrozen: boolean;
  isToday: boolean;
  minutes: number;
}

interface Milestone {
  id: string;
  name: string;
  target: number;
  pointsReward: number;
  isUnlocked: boolean;
}

interface StreakHistoryItem {
  startDate: string;
  endDate: string;
  duration: number;
}

interface StreakResponse {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  streakFreezeCount: number;
  streakProtection: boolean;
  frozenDates: string[];
  pointsBalance: number;
  streakVisualization: StreakDay[];
  milestones: Milestone[];
  motivationMessage: string;
  streakHistory: StreakHistoryItem[];
}

export default function StreakPage() {
  const [data, setData] = useState<StreakResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<StreakResponse>("/dashboard/streak");
      if (res.success) {
        setData(res);
      } else {
        setError("Không thể tải thông tin chuỗi ngày học");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu chuỗi ngày");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFreeze = async () => {
    if (!data || actionLoading) return;
    if (data.pointsBalance < 100) {
      showToast("Bạn không có đủ điểm thưởng (cần 100 PTS) để mua!");
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiFetch<{
        success: boolean;
        pointsBalance: number;
        streakFreezeCount: number;
        message: string;
      }>("/dashboard/streak/freeze/buy", {
        method: "POST",
      });

      if (res.success) {
        setData({
          ...data,
          pointsBalance: res.pointsBalance,
          streakFreezeCount: res.streakFreezeCount,
        });
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Mua đóng băng chuỗi thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUseFreeze = async (dateStr: string) => {
    if (!data || actionLoading) return;
    if (data.streakFreezeCount <= 0) {
      showToast("Bạn không còn lượt đóng băng chuỗi nào. Hãy mua thêm!");
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiFetch<{
        success: boolean;
        streakFreezeCount: number;
        frozenDates: string[];
        newStreak: number;
        message: string;
      }>("/dashboard/streak/freeze/use", {
        method: "POST",
        body: JSON.stringify({ date: dateStr }),
      });

      if (res.success) {
        // Refresh full streak data to rebuild calendar cleanly
        const updatedRes = await apiFetch<StreakResponse>("/dashboard/streak");
        if (updatedRes.success) {
          setData(updatedRes);
        }
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Sử dụng đóng băng chuỗi thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleProtection = async () => {
    if (!data || actionLoading) return;

    try {
      setActionLoading(true);
      const res = await apiFetch<{
        success: boolean;
        streakProtection: boolean;
        message: string;
      }>("/dashboard/streak/toggle-protection", {
        method: "POST",
      });

      if (res.success) {
        setData({
          ...data,
          streakProtection: res.streakProtection,
        });
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Không thể cập nhật trạng thái bảo vệ");
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang tải dữ liệu chuỗi ngày học...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải dữ liệu</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchStreakData}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Find yesterday record to see if user can manually freeze it
  // Index 29 is today, index 28 is yesterday in the 30-day visualization
  const yesterdayRecord = data.streakVisualization[28];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Motivation Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/20 to-zinc-900 border border-amber-900/20 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-amber-950/5">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
          <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Động lực chuỗi học hôm nay</h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            {data.motivationMessage}
          </p>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Streak */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500/25" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">CHUỖI HIỆN TẠI</p>
            <h3 className="text-2xl font-black text-white tracking-wide mt-0.5">
              {data.currentStreak} <span className="text-xs text-zinc-500 font-normal">ngày</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Hãy học hôm nay để tăng chuỗi nhé!</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">CHUỖI KỶ LỤC</p>
            <h3 className="text-2xl font-black text-white tracking-wide mt-0.5">
              {data.longestStreak} <span className="text-xs text-zinc-500 font-normal">ngày</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Kỷ lục chuỗi ngày học tốt nhất của bạn</p>
          </div>
        </div>

        {/* Freezes Shop */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">LƯỢT ĐÓNG BĂNG</p>
            <h3 className="text-2xl font-black text-white tracking-wide mt-0.5">
              {data.streakFreezeCount} <span className="text-xs text-zinc-500 font-normal">lượt sở hữu</span>
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-zinc-500 font-medium">Tự động bảo vệ:</span>
              <button
                onClick={handleToggleProtection}
                disabled={actionLoading}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-all ${
                  data.streakProtection
                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {data.streakProtection ? "ĐANG BẬT" : "ĐANG TẮT"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar & Freeze Shop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View (Left/Center) */}
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-2 border-b border-zinc-800/40 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Trực quan chuỗi học 30 ngày gần đây</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Xem lại phong độ học tập liên tục của bạn
              </p>
            </div>
            {/* Legend indicators */}
            <div className="flex gap-3 text-[9px] text-zinc-400 font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/25 border border-amber-500/30 block"></span>
                <span>Học tập</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/25 border border-blue-500/30 block"></span>
                <span>Đóng băng</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-800 block"></span>
                <span>Chưa học</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {data.streakVisualization.map((day, idx) => (
              <div
                key={idx}
                className={`
                  p-2 rounded-xl border text-center space-y-1 transition duration-200 flex flex-col items-center justify-between min-h-[72px]
                  ${day.isToday ? "border-red-500 bg-red-950/10 shadow-md shadow-red-900/10" : "border-zinc-800/50"}
                  ${
                    day.active
                      ? "bg-amber-600/10 text-amber-400 border-amber-500/20"
                      : day.isFrozen
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/20"
                      : "bg-zinc-900/30 text-zinc-600 border-zinc-900"
                  }
                `}
              >
                <div className="text-[9px] text-zinc-500 font-semibold uppercase">{day.dayOfWeek}</div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                  {day.active ? (
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : day.isFrozen ? (
                    <Snowflake className="w-4 h-4 text-blue-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-850" />
                  )}
                </div>
                <div className="text-[9px] font-bold text-zinc-400">{day.displayDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Freeze Shop & Yesterday Recovery (Right) */}
        <div className="space-y-6">
          {/* Shop Card */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <ShoppingBag className="w-4 h-4 text-red-500" />
              <span>Cửa hàng chuỗi ngày</span>
            </h3>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white">Bông Tuyết Đóng Băng</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                    Giúp giữ vững chuỗi ngày học của bạn vào những ngày bận rộn không thể học.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Snowflake className="w-4 h-4" />
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800/40">
                <span className="text-[10px] text-zinc-400 font-medium">Giá bán:</span>
                <span className="text-xs font-bold text-amber-400">100 PTS / lượt</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold px-1">
                <span>Số dư điểm của bạn:</span>
                <span className="text-amber-400">{data.pointsBalance} PTS</span>
              </div>

              <button
                onClick={handleBuyFreeze}
                disabled={actionLoading || data.pointsBalance < 100}
                className={`
                  w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border text-center
                  ${
                    data.pointsBalance >= 100
                      ? "bg-red-600 hover:bg-red-700 text-white border-red-600/10"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed"
                  }
                `}
              >
                {actionLoading ? "Đang xử lý..." : "Mua 1 lượt đóng băng"}
              </button>
            </div>
          </div>

          {/* Yesterday Rescue Tool */}
          {yesterdayRecord && (
            <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800/40 pb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Giải cứu chuỗi ngày</span>
              </h3>

              {yesterdayRecord.active ? (
                <div className="text-center py-2 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mx-auto">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium font-semibold">
                    Hôm qua bạn đã học tập tích cực! Chuỗi của bạn đang được bảo toàn an toàn.
                  </p>
                </div>
              ) : yesterdayRecord.isFrozen ? (
                <div className="text-center py-2 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
                    <Snowflake className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-blue-400 font-medium font-semibold">
                    Hôm qua đã được đóng băng thành công. Chuỗi của bạn đang được bảo toàn!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    Hôm qua ({yesterdayRecord.displayDate}) bạn đã bỏ lỡ việc học. Hãy sử dụng 1 lượt đóng băng chuỗi để giải cứu chuỗi ngày học ngay nhé!
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1 font-semibold">
                    <span>Đóng băng hiện có:</span>
                    <span className="text-blue-400 font-bold">{data.streakFreezeCount} lượt</span>
                  </div>
                  <button
                    onClick={() => handleUseFreeze(yesterdayRecord.date)}
                    disabled={actionLoading || data.streakFreezeCount <= 0}
                    className={`
                      w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border text-center
                      ${
                        data.streakFreezeCount > 0
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600/10"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed"
                      }
                    `}
                  >
                    {actionLoading ? "Đang xử lý..." : `Giải cứu ngày ${yesterdayRecord.displayDate}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Streak Milestones Progress */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>Mốc thử thách chuỗi học</span>
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Duy trì chuỗi ngày liên tục để nhận thưởng hấp dẫn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {data.milestones.map((milestone) => {
            const progressVal = Math.min(
              Math.round((data.longestStreak / milestone.target) * 100),
              100
            );
            return (
              <div
                key={milestone.id}
                className={`
                  p-5 rounded-2xl border flex flex-col justify-between min-h-[140px] transition-all duration-300
                  ${
                    milestone.isUnlocked
                      ? "bg-purple-950/5 border-purple-500/20 text-purple-400"
                      : "bg-zinc-900/30 border-zinc-800/60 opacity-70"
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">{milestone.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Mục tiêu kỷ lục: {milestone.target} ngày</p>
                  </div>
                  <span
                    className={`
                      px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase
                      ${
                        milestone.isUnlocked
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                          : "bg-zinc-850 text-zinc-500 border border-zinc-800/60"
                      }
                    `}
                  >
                    +{milestone.pointsReward} PTS
                  </span>
                </div>

                <div className="space-y-1.5 pt-4">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                    <span>Tiến độ kỷ lục</span>
                    <span>{progressVal}% ({data.longestStreak}/{milestone.target} ngày)</span>
                  </div>
                  <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        milestone.isUnlocked ? "bg-purple-500" : "bg-zinc-650"
                      }`}
                      style={{ width: `${progressVal}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation Tip Card */}
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-400 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-white">Mẹo giữ chuỗi học tập</h4>
          <ul className="list-disc list-inside text-[11px] text-zinc-500 space-y-1 leading-relaxed">
            <li>Hãy bật chức năng <strong>Tự Động Bảo Vệ Chuỗi</strong> để tự động áp dụng lượt đóng băng khi bạn lỡ quên học.</li>
            <li>Chỉ cần hoàn thành một hành động nhỏ (học 1 từ mới, làm 1 câu hỏi nhanh) là chuỗi của bạn sẽ được kích hoạt cho ngày hôm nay.</li>
            <li>Tích lũy điểm thưởng từ việc hoàn thành bài học và mở khóa thành tích để trao đổi thêm lượt đóng băng trong Cửa hàng.</li>
          </ul>
        </div>
      </div>

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
