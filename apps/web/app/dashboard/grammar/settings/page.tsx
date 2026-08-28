"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGrammarSettings } from "@/hooks/useGrammarSettings";
import { playSoundFeedback } from "@/lib/grammar-settings";
import { updateGrammarSettings } from "@/services/grammar";

export default function GrammarSettingsPage() {
  const { settings, updateSettings, resetSettings, loaded } = useGrammarSettings();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGrammarSettings(settings);
      playSoundFeedback("complete");
      showToast("Đã lưu cấu hình cài đặt ngữ pháp thành công!");
    } catch {
      // LocalStorage is already synced by hook
      playSoundFeedback("click");
      showToast("Đã lưu cài đặt vào trình duyệt!");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    playSoundFeedback("click");
    showToast("Đã khôi phục cài đặt gốc mặc định.");
  };

  const handleTestSound = (type: "correct" | "incorrect" | "complete") => {
    playSoundFeedback(type);
  };

  if (!loaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="h-20 bg-zinc-900/60 border border-zinc-800 rounded-3xl animate-pulse" />
        <div className="h-64 bg-zinc-900/60 border border-zinc-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              ⚙️ Cài Đặt Ngữ Pháp (Grammar Settings)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
              Tùy chỉnh cá nhân
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Thiết lập thói quen học tập, độ khó mặc định, hiệu ứng âm thanh và chế độ làm bài
          </p>
        </div>

        <Link
          href="/dashboard/grammar"
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          ← Bảng điều khiển ngữ pháp
        </Link>
      </div>

      {/* Settings Container */}
      <div className="space-y-6">
        {/* ── SETTING 1: EXERCISE DIFFICULTY PREFERENCE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/15 border border-purple-600/20 text-purple-400 flex items-center justify-center text-lg shrink-0">
                🎯
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  1. Độ khó bài tập ưa thích (Exercise Difficulty Preference)
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Tự động áp dụng mức độ khó này khi bạn mở phần Luyện tập ngữ pháp (Part 5 & 6).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              {
                id: "all",
                title: "Tất cả độ khó",
                desc: "Hỗn hợp mọi cấp độ từ 0–990",
              },
              {
                id: "basic",
                title: "Cơ bản (Chặng 1-2)",
                desc: "Mục tiêu 0–500 điểm TOEIC",
              },
              {
                id: "intermediate",
                title: "Trung cấp (Chặng 3-4)",
                desc: "Mục tiêu 500–800 điểm TOEIC",
              },
              {
                id: "advanced",
                title: "Nâng cao (Chặng 5)",
                desc: "Mục tiêu 800–990 điểm TOEIC",
              },
            ].map((item) => {
              const isSelected = settings.exerciseDifficultyPreference === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ exerciseDifficultyPreference: item.id as any });
                    playSoundFeedback("click");
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-600/15"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.title}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-purple-400 bg-purple-500" : "border-zinc-600"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SETTING 2: SHOW EXPLANATIONS BY DEFAULT ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-600/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
              📖
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                2. Hiển thị giải thích mặc định (Show Explanations by Default)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tự động hiển thị toàn bộ lời giải chi tiết, quy tắc ngữ pháp và ví dụ khi xem lại kết quả bài làm.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              updateSettings({ showExplanationsByDefault: !settings.showExplanationsByDefault });
              playSoundFeedback("click");
            }}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 ${
              settings.showExplanationsByDefault ? "bg-blue-600" : "bg-zinc-800"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                settings.showExplanationsByDefault ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* ── SETTING 3: AUTO-ADVANCE AFTER CORRECT ANSWER ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 border border-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                3. Tự động chuyển sau câu đúng (Auto-Advance After Correct Answer)
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tự động nhảy sang câu hỏi tiếp theo ngay sau khi bạn chọn đáp án (tăng tốc độ luyện đề Part 5).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              updateSettings({ autoAdvanceAfterCorrect: !settings.autoAdvanceAfterCorrect });
              playSoundFeedback("click");
            }}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 ${
              settings.autoAdvanceAfterCorrect ? "bg-emerald-600" : "bg-zinc-800"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                settings.autoAdvanceAfterCorrect ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* ── SETTING 4: SOUND EFFECTS TOGGLE ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/15 border border-amber-600/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
                🔊
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  4. Hiệu ứng âm thanh (Sound Effects)
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Phát âm thanh nhẹ nhàng khi chọn đáp án, trả lời đúng, sai và khi nộp bài hoàn thành.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEffects;
                updateSettings({ soundEffects: next });
                if (next) playSoundFeedback("correct");
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 ${
                settings.soundEffects ? "bg-amber-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEffects ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sound Testing Buttons */}
          {settings.soundEffects && (
            <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-500 font-semibold mr-1">Nghe thử âm thanh:</span>
              <button
                type="button"
                onClick={() => handleTestSound("correct")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 transition"
              >
                🔔 Câu đúng
              </button>
              <button
                type="button"
                onClick={() => handleTestSound("incorrect")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/50 border border-rose-800/60 text-rose-300 hover:bg-rose-900/50 transition"
              >
                ⚠️ Câu sai
              </button>
              <button
                type="button"
                onClick={() => handleTestSound("complete")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/50 border border-purple-800/60 text-purple-300 hover:bg-purple-900/50 transition"
              >
                🏆 Hoàn thành bài
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800 flex-wrap gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-850 hover:bg-zinc-800 transition"
        >
          🔄 Khôi phục cài đặt gốc
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-600/20 transition disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "✓ Lưu cấu hình cài đặt"}
        </button>
      </div>
    </div>
  );
}
