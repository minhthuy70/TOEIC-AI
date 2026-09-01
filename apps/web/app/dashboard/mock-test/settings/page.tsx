"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTestSettings } from "@/hooks/useTestSettings";
import { playTestSoundEffect } from "@/lib/test-settings";
import {
  Settings,
  ArrowLeft,
  FileText,
  Clock,
  Timer,
  Pause,
  Target,
  Send,
  Volume2,
  Check,
  AlertTriangle,
  PartyPopper,
  RotateCcw,
} from "lucide-react";

export default function TestSettingsPage() {
  const { settings, updateSettings, resetSettings, loaded } = useTestSettings();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      playTestSoundEffect("complete");
      showToast("Đã lưu cấu hình cài đặt thi thử thành công!");
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  const handleReset = () => {
    resetSettings();
    playTestSoundEffect("click");
    showToast("Đã khôi phục cài đặt gốc mặc định.");
  };

  const handleTestSound = (type: "tick" | "warning" | "complete") => {
    playTestSoundEffect(type);
  };

  if (!loaded) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="h-20 bg-zinc-900/60 border border-zinc-800 rounded-3xl animate-pulse" />
        <div className="h-64 bg-zinc-900/60 border border-zinc-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 relative animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-red-500" />
              <span>Cài Đặt Kiểm Tra (Test Settings)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
              Tùy chỉnh cá nhân
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Thiết lập thói quen thi thử, giới hạn thời gian mặc định, tự động nộp bài và hiệu ứng âm thanh
          </p>
        </div>

        <Link
          href="/dashboard/mock-test"
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bảng thi thử TOEIC</span>
        </Link>
      </div>

      {/* Settings Container */}
      <div className="space-y-6">
        {/* ── SETTING 1: DEFAULT TEST TYPE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  1. Loại kiểm tra mặc định (Default Test Type)
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Chọn chế độ bài thi được ưu tiên chọn sẵn khi bạn bắt đầu một đợt luyện đề mới.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                id: "full",
                title: "Full TOEIC Test (200 câu)",
                desc: "Đầy đủ Part 1 đến Part 7 theo chuẩn đề thi thật ETS.",
                badge: "Khuyến nghị 900+",
              },
              {
                id: "mini",
                title: "Mini Test (50 câu)",
                desc: "Rút gọn thời gian, phù hợp ôn tập nhanh và đánh giá nhanh.",
                badge: "Nhanh gọn",
              },
            ].map((item) => {
              const isSelected = settings.defaultTestType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ defaultTestType: item.id as "full" | "mini" })}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? "bg-red-950/20 border-red-500/50 shadow-lg shadow-red-950/30"
                      : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/10">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SETTING 2: DEFAULT TIME LIMIT ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  2. Giới hạn thời gian mặc định (Default Time Limit)
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Cài đặt thời gian đồng hồ đếm ngược tiêu chuẩn cho các bài thi thử.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {[
              { mins: 120, label: "120 phút", sub: "Chuẩn Full Test" },
              { mins: 90, label: "90 phút", sub: "Tăng tốc" },
              { mins: 60, label: "60 phút", sub: "Luyện 1 kỹ năng" },
              { mins: 45, label: "45 phút", sub: "Chuẩn Mini Test" },
              { mins: 30, label: "30 phút", sub: "Luyện cấp tốc" },
            ].map((t) => {
              const isSelected = settings.defaultTimeLimit === t.mins;
              return (
                <button
                  key={t.mins}
                  type="button"
                  onClick={() => updateSettings({ defaultTimeLimit: t.mins })}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/30 text-white"
                      : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-sm font-bold">{t.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{t.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SETTING 3: SHOW TIMER PREFERENCE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/15 border border-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                3. Hiển thị đồng hồ đếm ngược (Show Timer Preference)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                Bật đồng hồ đếm ngược giúp bạn theo dõi thời lượng. Có thể tắt nếu muốn giảm áp lực tâm lý phòng thi.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.showTimer}
              onChange={(e) => updateSettings({ showTimer: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* ── SETTING 4: ALLOW PAUSE PREFERENCE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/15 border border-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              <Pause className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                4. Cho phép tạm dừng bài thi (Allow Pause Preference)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                Cho phép tạm dừng tối đa 3 lần trong khi thi. Tắt tính năng này nếu bạn muốn rèn luyện tính kỷ luật như trong phòng thi thật.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.allowPause}
              onChange={(e) => updateSettings({ allowPause: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* ── SETTING 5: SHOW REAL-TIME SCORE PREFERENCE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 border border-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                5. Hiển thị tiến độ thời gian thực (Real-Time Progress & Score)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                Hiển thị số câu đã làm trên tổng số câu hỏi và thanh trạng thái tiến độ thời gian thực khi đang làm bài.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.showRealtimeScore}
              onChange={(e) => updateSettings({ showRealtimeScore: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* ── SETTING 6: AUTO-SUBMIT PREFERENCE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/15 border border-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                6. Tự động nộp bài khi hết giờ (Auto-Submit Preference)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                Tự động thu bài và chuyển sang trang kết quả ngay lập tức khi đồng hồ đếm ngược về 00:00 (chuẩn thi quốc tế).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.autoSubmit}
              onChange={(e) => updateSettings({ autoSubmit: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* ── SETTING 7: SOUND EFFECTS TOGGLE & TEST ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-yellow-600/15 border border-yellow-600/20 text-yellow-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  7. Hiệu ứng âm thanh (Sound Effects Toggle)
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                  Phát âm thanh cảnh báo khi còn 1 phút cuối giờ, âm thanh nộp bài thành công và chuyển section.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Test Sound Buttons */}
          {settings.soundEffects && (
            <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-zinc-400">Nghe thử hiệu ứng:</span>
              <button
                type="button"
                onClick={() => handleTestSound("tick")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tick nhịp</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestSound("warning")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 font-bold text-xs transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cảnh báo 1 phút</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestSound("complete")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 font-bold text-xs transition"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Hoàn thành & Nộp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 w-full sm:w-auto px-5 py-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục mặc định</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? "Đang lưu..." : "Lưu Cài Đặt"}</span>
        </button>
      </div>
    </div>
  );
}
