"use client";

import { ReviewLevel } from "@/types/vocabulary";
import { Brain, Zap, CheckCircle2, Clock, Layers } from "lucide-react";

interface Props {
  levels: ReviewLevel[];
  onSelectLevel: (level: number) => void;
}

export default function ReviewLevelGrid({ levels, onSelectLevel }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <span>Lộ trình ôn tập Spaced Repetition (SRS)</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Ôn tập các từ vựng đã học đúng lúc trước khi quên. Chọn một hộp có từ cần ôn để tiến hành ôn tập.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {levels.map((lvl) => {
          const hasWords = lvl.count > 0;

          return (
            <div
              key={lvl.level}
              className={`
                relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[150px]
                ${hasWords
                  ? "bg-gradient-to-br from-amber-950/20 to-zinc-900/60 border-amber-600/30 shadow-md shadow-amber-900/5 hover:border-amber-500/60 hover:scale-[1.02]"
                  : "bg-zinc-900/30 border-zinc-800/40 opacity-70"
                }
              `}
            >
              {/* Top Row: Icon and Timing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-bold text-white">Sau {lvl.label}</span>
                </div>
                {hasWords && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>

              {/* Middle Row: Due Words Count */}
              <div className="mt-4">
                <p className="text-xs text-zinc-400">Số từ cần ôn</p>
                <p className={`text-2xl font-black mt-1 ${hasWords ? "text-amber-400" : "text-zinc-500"}`}>
                  {lvl.count} <span className="text-xs font-normal text-zinc-500">từ</span>
                </p>
              </div>

              {/* Bottom Row: Actions */}
              <div className="mt-4">
                {hasWords ? (
                  <button
                    onClick={() => onSelectLevel(lvl.level)}
                    className="w-full text-center py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Ôn tập ngay</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2 border border-zinc-800 bg-zinc-950 text-zinc-500 text-xs font-semibold rounded-xl select-none flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span>Đã hoàn thành</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
