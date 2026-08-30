"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Star,
  TrendingUp,
  Award,
  Zap,
  ChevronUp,
  Crown,
  Sparkles,
} from "lucide-react";

interface LevelInfo {
  currentLevel: number;
  totalXp: number;
  currentXp: number;
  xpToNextLevel: number;
  xpProgress: number;
  currentLevelInfo: {
    levelNumber: number;
    name: string;
    description: string;
    icon: string;
    color: string;
  } | null;
  nextLevelInfo: {
    levelNumber: number;
    name: string;
    description: string;
    icon: string;
    color: string;
  } | null;
}

interface LevelResponse {
  success: boolean;
  data: LevelInfo;
}

export default function LevelDisplay() {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLevelInfo();
  }, []);

  const fetchLevelInfo = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<LevelResponse>("/levels/info");
      if (res.success) {
        setLevelInfo(res.data);
      } else {
        setError("Không thể tải thông tin cấp độ");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thông tin cấp độ");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-600/20 to-blue-500/10 border-blue-500/30",
      purple: "from-purple-600/20 to-purple-500/10 border-purple-500/30",
      green: "from-green-600/20 to-green-500/10 border-green-500/30",
      amber: "from-amber-600/20 to-amber-500/10 border-amber-500/30",
      red: "from-red-600/20 to-red-500/10 border-red-500/30",
      yellow: "from-yellow-600/20 to-yellow-500/10 border-yellow-500/30",
      cyan: "from-cyan-600/20 to-cyan-500/10 border-cyan-500/30",
      pink: "from-pink-600/20 to-pink-500/10 border-pink-500/30",
      gold: "from-yellow-500/20 to-amber-500/10 border-amber-400/30",
    };
    return colors[color] || "from-zinc-600/20 to-zinc-500/10 border-zinc-500/30";
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
      {/* Main Level Card */}
      <div className={`bg-gradient-to-br ${getLevelColor(levelInfo?.currentLevelInfo?.color || "blue")} border rounded-2xl p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-center text-3xl">
                {levelInfo?.currentLevelInfo?.icon || "⭐"}
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Cấp độ</p>
                <h3 className="text-3xl font-black text-white">
                  Level {levelInfo?.currentLevel || 1}
                </h3>
                <p className="text-sm text-zinc-300">{levelInfo?.currentLevelInfo?.name || "Người mới bắt đầu"}</p>
              </div>
            </div>
            
            {(levelInfo?.currentLevel ?? 0) >= 10 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 border border-amber-500/30">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Elite</span>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-zinc-400">XP: {levelInfo?.totalXp || 0}</span>
              </div>
              <span className="text-xs text-zinc-400">
                Cần {levelInfo?.xpToNextLevel || 0} XP để lên cấp
              </span>
            </div>
            <div className="w-full bg-zinc-900/80 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo?.xpProgress || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-zinc-500">Level {levelInfo?.currentLevel || 1}</span>
              <span className="text-[10px] text-zinc-500">Level {(levelInfo?.currentLevel || 1) + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Level Preview */}
      {levelInfo?.nextLevelInfo && (
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Cấp độ tiếp theo</span>
          </h4>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center text-2xl">
              {levelInfo.nextLevelInfo.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Level {levelInfo.nextLevelInfo.levelNumber}</p>
              <p className="text-xs text-zinc-400">{levelInfo.nextLevelInfo.name}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{levelInfo.nextLevelInfo.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {levelInfo.xpToNextLevel} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Tổng XP</p>
          <p className="text-xl font-bold text-purple-400">{levelInfo?.totalXp || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">XP hiện tại</p>
          <p className="text-xl font-bold text-blue-400">{levelInfo?.currentXp || 0}</p>
        </div>
      </div>
    </div>
  );
}
