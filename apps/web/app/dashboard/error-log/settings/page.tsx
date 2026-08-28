"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useErrorSettings } from "@/hooks/useErrorSettings";
import { playTestSoundEffect } from "@/lib/test-settings";
import {
  Settings,
  ArrowLeft,
  FileText,
  Bell,
  Zap,
  Target,
  Volume2,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";

export default function ErrorSettingsPage() {
  const { settings, isLoaded, updateSetting, resetSettings } = useErrorSettings();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggle = <K extends "autoLogErrors" | "errorNotification" | "drillSuggestion" | "soundEffects">(
    key: K,
    name: string
  ) => {
    const nextVal = !settings[key];
    updateSetting(key, nextVal as any);
    if (settings.soundEffects) playTestSoundEffect("click");
    showToast(`Đã ${nextVal ? "bật" : "tắt"} "${name}".`);
  };

  const handleThresholdChange = (val: 1 | 2 | 3) => {
    updateSetting("autoResolveThreshold", val);
    if (settings.soundEffects) playTestSoundEffect("click");
    showToast(`Đã đặt ngưỡng tự động giải quyết thành ${val} lần làm đúng.`);
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt Sổ tay lỗi về mặc định?")) {
      resetSettings();
      if (settings.soundEffects) playTestSoundEffect("click");
      showToast("Đã khôi phục cài đặt mặc định thành công!");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8 animate-fade-in">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Cài Đặt Sổ Tay Lỗi (Error Settings)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                  Hệ thống 8.4
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Tùy chỉnh hành vi tự động ghi nhận, thông báo và ngưỡng giải quyết câu sai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/error-log"
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Sổ tay lỗi</span>
            </Link>
          </div>
        </div>

        {/* ================================================== */}
        {/* SETTINGS CARDS (8.4) */}
        {/* ================================================== */}
        <div className="space-y-4">
          {/* 1. AUTO-LOG ERRORS TOGGLE */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-white/10">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Tự động ghi nhận câu sai (Auto-log errors)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tự động lưu lại các câu trả lời sai vào Sổ tay lỗi khi bạn làm bài thi thử (Mock Test), bài kiểm tra mini hoặc luyện tập.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("autoLogErrors", "Tự động ghi nhận câu sai")}
              className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center shrink-0 ${
                settings.autoLogErrors ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* 2. ERROR NOTIFICATION PREFERENCE */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-white/10">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Thông báo lỗi sai & cảnh báo lặp lại (Error notification preference)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hiển thị thông báo và nhắc nhở khi phát hiện câu hỏi bị làm sai lặp lại từ 2 lần trở lên chưa được giải quyết.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("errorNotification", "Thông báo lỗi sai")}
              className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center shrink-0 ${
                settings.errorNotification ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* 3. DRILL SUGGESTION PREFERENCE */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-white/10">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">
                  Gợi ý bài tập Drill thông minh (Drill suggestion preference)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hệ thống AI sẽ tự động đề xuất phiên bài tập luyện lỗi (Error Drill) ngay sau khi bạn hoàn thành bài thi có nhiều câu sai.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("drillSuggestion", "Gợi ý bài tập Drill")}
              className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center shrink-0 ${
                settings.drillSuggestion ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* 4. AUTO-RESOLVE THRESHOLD SETTING */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4 transition hover:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">
                  Ngưỡng tự động giải quyết (Auto-resolve threshold setting)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Số lần làm đúng liên tiếp trong bài tập Drill để hệ thống tự động chuyển câu hỏi sang trạng thái &quot;Đã giải quyết&quot;.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { val: 1, label: "1 lần làm đúng", desc: "Tự động giải quyết ngay khi làm đúng 1 lần trong Drill (Mặc định)" },
                { val: 2, label: "2 lần làm đúng", desc: "Cần làm đúng 2 lần để đảm bảo không phải do đoán mò" },
                { val: 3, label: "3 lần đúng liên tiếp", desc: "Ngưỡng tiêu chuẩn cao nhất đảm bảo thành thạo 100% kiến thức" },
              ].map((opt) => {
                const isSelected = settings.autoResolveThreshold === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleThresholdChange(opt.val as any)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      isSelected
                        ? "bg-red-600/10 border-red-500 text-white shadow-lg"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{opt.label}</span>
                      {isSelected && <span className="text-xs text-red-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Đang chọn</span>}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SOUND EFFECTS TOGGLE */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-white/10">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Hiệu ứng âm thanh (Sound effects)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Phát âm thanh phản hồi chúc mừng khi trả lời đúng và cảnh báo khi trả lời sai trong bài tập Drill.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("soundEffects", "Hiệu ứng âm thanh")}
              className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center shrink-0 ${
                settings.soundEffects ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* FOOTER ACTIONS */}
        {/* ================================================== */}
        <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <Link
            href="/dashboard/error-log"
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
          >
            <span>Lưu & Về Sổ tay lỗi</span>
            <Check className="w-4 h-4" />
          </Link>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
