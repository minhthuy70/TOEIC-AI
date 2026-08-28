"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  startMiniTest,
  submitMiniTest,
  type MiniTestQuestion,
  type MiniTestStartResponse,
  type MiniTestSubmitResponse,
  type MiniTestResultItem,
} from "@/services/mock-test";

type ScreenMode = "config" | "test" | "result";

export default function MiniTestPage() {
  const [screen, setScreen] = useState<ScreenMode>("config");

  // ========================================================
  // CONFIG STATE
  // ========================================================
  const [selectedParts, setSelectedParts] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(45);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [enableRealTimeScoring, setEnableRealTimeScoring] = useState<boolean>(false);
  const [loadingStart, setLoadingStart] = useState<boolean>(false);

  // ========================================================
  // TEST STATE
  // ========================================================
  const [session, setSession] = useState<MiniTestStartResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [filterMarkedOnly, setFilterMarkedOnly] = useState<boolean>(false);

  // Track time per part
  const partTimesRef = useRef<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 });

  // ========================================================
  // RESULT STATE
  // ========================================================
  const [result, setResult] = useState<MiniTestSubmitResponse | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "marked">("all");
  const [selectedReviewPart, setSelectedReviewPart] = useState<number | "all">("all");
  const [errorLogBookmarked, setErrorLogBookmarked] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load error log from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mini_test_error_log");
      if (stored) {
        setErrorLogBookmarked(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle Part in Config
  const togglePart = (partNum: number) => {
    setSelectedParts((prev) => {
      if (prev.includes(partNum)) {
        if (prev.length === 1) return prev; // Keep at least 1 part
        return prev.filter((p) => p !== partNum);
      } else {
        return [...prev, partNum].sort((a, b) => a - b);
      }
    });
  };

  const selectAllParts = () => {
    setSelectedParts([1, 2, 3, 4, 5, 6, 7]);
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "test" && !isPaused) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Update current part time
        if (session && session.questions[currentQIndex]) {
          const currentPart = session.questions[currentQIndex].part;
          partTimesRef.current[currentPart] = (partTimesRef.current[currentPart] || 0) + 1;
        }

        if (timeRemaining !== null) {
          setTimeRemaining((prev) => {
            if (prev === null || prev <= 1) {
              handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, isPaused, timeRemaining, currentQIndex, session]);

  // Start Test Action
  const handleStartTest = async () => {
    setLoadingStart(true);
    try {
      const res = await startMiniTest({
        parts: selectedParts,
        timeLimitMinutes,
        totalQuestions: 50,
      });

      setSession(res);
      setAnswers({});
      setMarkedForReview({});
      setCurrentQIndex(0);
      setElapsedSeconds(0);
      partTimesRef.current = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      setTimeRemaining(res.timeLimitSeconds);
      setIsPaused(false);
      setShowInstructionsModal(false);
      setScreen("test");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải đề thi Mini Test. Vui lòng thử lại!");
    } finally {
      setLoadingStart(false);
    }
  };

  // Select Option
  const handleSelectOption = (qId: number, optId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  // Toggle Mark for Review
  const toggleMarkForReview = (qId: number) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      const answersArr = Object.entries(answers).map(([qId, oId]) => ({
        questionId: Number(qId),
        optionId: Number(oId),
      }));

      const res = await submitMiniTest({
        answers: answersArr,
        durationSeconds: elapsedSeconds,
        partTimes: partTimesRef.current,
        markedQuestionIds: Object.keys(markedForReview)
          .filter((k) => markedForReview[Number(k)])
          .map(Number),
      });

      setResult(res);
      setScreen("result");
      setCurrentQIndex(0);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi nộp bài thi. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    showToast("⏰ Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài...");
    handleSubmitTest();
  };

  // Toggle Error log
  const toggleErrorLog = (qId: number) => {
    setErrorLogBookmarked((prev) => {
      const next = { ...prev, [qId]: !prev[qId] };
      try {
        localStorage.setItem("mini_test_error_log", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showToast(next[qId] ? "Đã lưu vào Nhật ký lỗi!" : "Đã gỡ khỏi Nhật ký lỗi.");
      return next;
    });
  };

  // Share Results
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Đã sao chép liên kết kết quả vào clipboard!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // =========================================================
  // SCREEN 1: CONFIGURATION & INSTRUCTIONS MODAL
  // =========================================================
  if (screen === "config") {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                ⚡ TOEIC Mini Test (50 Câu)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                Fast Exam
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Kiểm tra nhanh năng lực phản xạ TOEIC với bộ đề rút gọn 50 câu chuẩn format ETS
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowInstructionsModal(true)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>ℹ️</span>
              <span>Hướng dẫn thi</span>
            </button>
            <Link
              href="/dashboard/mock-test"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              ← Danh sách thi thử
            </Link>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Section 1: Select Parts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">1. Chọn phần thi (Parts)</h3>
              <button
                type="button"
                onClick={selectAllParts}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Chọn tất cả (Full 7 Parts)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { part: 1, name: "Part 1", desc: "Photographs" },
                { part: 2, name: "Part 2", desc: "Q & Response" },
                { part: 3, name: "Part 3", desc: "Conversations" },
                { part: 4, name: "Part 4", desc: "Short Talks" },
                { part: 5, name: "Part 5", desc: "Incomplete Sent." },
                { part: 6, name: "Part 6", desc: "Text Completion" },
                { part: 7, name: "Part 7", desc: "Reading Passages" },
              ].map((p) => {
                const isSelected = selectedParts.includes(p.part);
                return (
                  <button
                    key={p.part}
                    type="button"
                    onClick={() => togglePart(p.part)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                      isSelected
                        ? "bg-red-600/15 border-red-500 text-white shadow-lg shadow-red-600/15"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">{p.desc}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border mt-1 flex items-center justify-center ${
                        isSelected ? "border-red-400 bg-red-500" : "border-zinc-600"
                      }`}
                    >
                      {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Time Limit */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">2. Giới hạn thời gian</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { m: 30, label: "⚡ 30 Phút (Nhanh)" },
                { m: 45, label: "⏱️ 45 Phút (Chuẩn)" },
                { m: 60, label: "⏳ 60 Phút (Thoải mái)" },
              ].map((t) => (
                <button
                  key={t.m}
                  type="button"
                  onClick={() => setTimeLimitMinutes(t.m)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    timeLimitMinutes === t.m
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Options */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">3. Tùy chọn nâng cao</h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRealTimeScoring}
                  onChange={(e) => setEnableRealTimeScoring(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-0"
                />
                <span>Bật tính điểm & độ chính xác thời gian thực trong lúc thi</span>
              </label>
            </div>
          </div>

          {/* Start Action */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-zinc-400">
                Cấu hình: <strong className="text-white">50 câu hỏi</strong> •{" "}
                <strong className="text-white">{selectedParts.length} phần thi</strong> •{" "}
                <strong className="text-white">{timeLimitMinutes} phút</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartTest}
              disabled={loadingStart}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition disabled:opacity-50"
            >
              {loadingStart ? "Đang tạo đề thi..." : "🚀 Bắt đầu làm bài Mini Test"}
            </button>
          </div>
        </div>

        {/* ── INSTRUCTIONS MODAL ── */}
        {showInstructionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>Quy chế & Hướng dẫn thi Mini Test</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(false)}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed max-h-80 overflow-y-auto pr-1">
                <p>
                  • <strong>Số lượng câu hỏi:</strong> Đề thi gồm chính xác 50 câu hỏi tuyển chọn từ ngân hàng đề thi TOEIC bản quyền.
                </p>
                <p>
                  • <strong>Giới hạn thời gian:</strong> Đồng hồ sẽ đếm ngược liên tục. Khi hết giờ, bài thi sẽ được tự động nộp và chấm điểm.
                </p>
                <p>
                  • <strong>Tạm dừng (Pause):</strong> Bạn có thể bấm nút Tạm dừng nếu có việc đột xuất. Nội dung đề sẽ tạm mờ và dừng đếm giờ.
                </p>
                <p>
                  • <strong>Đánh dấu cờ (Flag 🚩):</strong> Gắn cờ những câu hỏi bạn còn phân vân để dễ dàng rà soát lại trước khi nộp.
                </p>
                <p>
                  • <strong>Bảng câu hỏi (Palette):</strong> Nhấp vào bất kỳ số câu nào để nhảy ngay đến câu hỏi đó.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                >
                  Đã hiểu & Sẵn sàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // SCREEN 2: ACTIVE LIVE TEST
  // =========================================================
  if (screen === "test" && session) {
    const totalQ = session.questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = Math.round((answeredCount / totalQ) * 100);
    const currentQ: MiniTestQuestion = session.questions[currentQIndex];
    const isCurrentMarked = !!markedForReview[currentQ?.id];
    const selectedOptId = answers[currentQ?.id];

    // Filter questions in grid if filterMarkedOnly
    const displayedQuestions = filterMarkedOnly
      ? session.questions.filter((q) => !!markedForReview[q.id])
      : session.questions;

    const isNearTimeout = timeRemaining !== null && timeRemaining <= 300; // < 5 mins

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
        {/* ── PAUSE OVERLAY ── */}
        {isPaused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="text-4xl">⏸️</div>
              <h3 className="text-xl font-bold text-white">Bài thi đang tạm dừng</h3>
              <p className="text-xs text-zinc-400">
                Đồng hồ đã tạm dừng đếm. Bạn có thể nhấn Tiếp tục để quay trở lại làm bài thi bất cứ lúc nào.
              </p>
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                ▶️ Tiếp tục làm bài
              </button>
            </div>
          </div>
        )}

        {/* ── TOP LIVE TEST BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/85 border border-zinc-800 rounded-2xl p-4 sticky top-4 z-40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-sm font-bold text-white">{session.testTitle}</h2>
              <p className="text-[11px] text-zinc-400">
                Đang làm: <strong className="text-red-400">Part {currentQ?.part}</strong> • Câu {currentQIndex + 1}/{totalQ}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time score indicator (if enabled) */}
            {enableRealTimeScoring && (
              <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 font-semibold">
                Đã trả lời: {answeredCount}/{totalQ}
              </div>
            )}

            {/* Timer */}
            {timeRemaining !== null && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border ${
                  isNearTimeout
                    ? "bg-rose-600/20 text-rose-400 border-rose-500/40 animate-pulse"
                    : "bg-amber-600/15 text-amber-400 border-amber-500/30"
                }`}
              >
                <span>⏳</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Pause Button */}
            <button
              type="button"
              onClick={() => setIsPaused(true)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition"
              title="Tạm dừng bài thi"
            >
              ⏸️ Tạm dừng
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Nộp bài
            </button>
          </div>
        </div>

        {/* ── 2 COLUMNS: QUESTION CONTENT & QUESTION GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 font-bold text-xs flex items-center justify-center">
                    #{currentQIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    Part {currentQ?.part}
                  </span>
                </div>

                {/* Mark for review */}
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isCurrentMarked
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{isCurrentMarked ? "🚩 Đã đánh dấu" : "🏳️ Đánh dấu xem lại"}</span>
                </button>
              </div>

              {/* Passage / Image / Audio (If listening / reading part) */}
              {currentQ.audioUrl && (
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-zinc-400 font-semibold">🔊 Audio đoạn hội thoại / bài nói:</p>
                  <audio controls className="w-full h-8" src={currentQ.audioUrl} />
                </div>
              )}

              {currentQ.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex justify-center p-2">
                  <img
                    src={currentQ.imageUrl}
                    alt="Question visual"
                    className="max-h-64 object-contain rounded-xl"
                  />
                </div>
              )}

              {currentQ.passage && (
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                  {currentQ.passage}
                </div>
              )}

              {/* Question Text */}
              <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
                <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ.questionText || "Chọn đáp án đúng nhất:"}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-red-600/15 border-red-500 text-white shadow-lg shadow-red-600/10"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-red-600 text-white"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {opt.label}
                      </div>
                      <span className="text-sm font-medium flex-1 leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav: Prev / Next */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition disabled:opacity-40"
                >
                  ← Câu trước
                </button>

                {currentQIndex < totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => Math.min(prev + 1, totalQ - 1))}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Câu tiếp theo →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Hoàn thành & Nộp bài ✓
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Progress & Question Palette Grid */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Tiến độ: {answeredCount}/{totalQ} câu</span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>

              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Filter marked toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                <span className="font-bold text-zinc-300">Bảng câu hỏi ({totalQ})</span>
                <button
                  type="button"
                  onClick={() => setFilterMarkedOnly(!filterMarkedOnly)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition ${
                    filterMarkedOnly
                      ? "bg-amber-600/20 text-amber-400 border-amber-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  🚩 Chỉ xem câu có cờ
                </button>
              </div>

              {/* Grid 50 Questions */}
              <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
                {displayedQuestions.map((q) => {
                  const actualIdx = session.questions.findIndex((item) => item.id === q.id);
                  const isAnswered = answers[q.id] !== undefined;
                  const isMarked = markedForReview[q.id];
                  const isCurrent = actualIdx === currentQIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(actualIdx)}
                      className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all relative ${
                        isCurrent
                          ? "ring-2 ring-red-500 bg-red-600 text-white shadow"
                          : isAnswered
                          ? "bg-zinc-700 text-white hover:bg-zinc-600"
                          : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      }`}
                    >
                      {actualIdx + 1}
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-[10px] text-zinc-400 text-center">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-800 border" />
                  <span>Chưa làm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-700" />
                  <span>Đã làm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span>Đánh dấu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SUBMIT CONFIRMATION MODAL ── */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="text-3xl">📝</div>
                <h3 className="text-lg font-bold text-white">Xác nhận nộp bài thi?</h3>
                <p className="text-xs text-zinc-400">
                  Bạn đã hoàn thành <strong className="text-white">{answeredCount}/{totalQ} câu hỏi</strong>.
                </p>
                {totalQ - answeredCount > 0 && (
                  <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
                    ⚠️ Còn <strong>{totalQ - answeredCount} câu chưa làm</strong>. Bạn có chắc chắn muốn nộp bài?
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  Làm tiếp
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? "Đang nộp..." : "Xác nhận nộp bài"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // SCREEN 3: RESULT & DETAILED BREAKDOWN
  // =========================================================
  if (screen === "result" && result) {
    const isHigh = result.totalScore >= 700;

    // Filter review items
    const filteredReviewList: MiniTestResultItem[] = result.results.filter((item) => {
      if (selectedReviewPart !== "all" && item.part !== selectedReviewPart) return false;
      if (reviewFilter === "correct") return item.isCorrect;
      if (reviewFilter === "wrong") return !item.isCorrect;
      if (reviewFilter === "marked") return markedForReview[item.questionId];
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setScreen("config")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition"
          >
            ← Làm bài Mini Test khác
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>Chia sẻ kết quả</span>
            </button>
            <button
              type="button"
              onClick={handleStartTest}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>Làm lại đề này</span>
            </button>
          </div>
        </div>

        {/* ── SCORE SUMMARY CARD ── */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                  isHigh
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                }`}
              >
                {isHigh ? "🏆" : "🎯"}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Kết Quả Mini Test (50 Câu)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Thời gian hoàn thành: {formatTime(result.durationSeconds)} • Độ chính xác: {result.accuracy}%
                </p>
              </div>
            </div>

            {/* Total Scaled Score */}
            <div className="text-right sm:text-right">
              <span className="text-[11px] text-zinc-500 uppercase font-bold">Điểm TOEIC ước tính</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-red-400">
                {result.totalScore} <span className="text-sm text-zinc-500 font-normal">/ 990</span>
              </p>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Listening Score</p>
              <p className="text-xl font-extrabold text-blue-400 mt-1">{result.listeningScore} / 495</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Reading Score</p>
              <p className="text-xl font-extrabold text-purple-400 mt-1">{result.readingScore} / 495</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Số câu đúng</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">
                {result.correctCount} / {result.totalQuestions}
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Số câu sai / bỏ qua</p>
              <p className="text-xl font-extrabold text-rose-400 mt-1">
                {result.incorrectCount} câu
              </p>
            </div>
          </div>
        </div>

        {/* ── DETAILED SCORE BREAKDOWN & TIME ANALYSIS PER PART ── */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📊</span>
            <span>Phân tích chi tiết điểm số & thời gian theo từng Part</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/60">
                  <th className="py-3 px-4 font-bold">Phần thi</th>
                  <th className="py-3 px-4 font-bold">Số câu đúng</th>
                  <th className="py-3 px-4 font-bold">Độ chính xác</th>
                  <th className="py-3 px-4 font-bold">Thời gian làm</th>
                  <th className="py-3 px-4 font-bold">Tốc độ TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {result.partBreakdown.map((part) => (
                  <tr key={part.part} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 px-4 font-bold text-white">{part.name}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      {part.correct}/{part.total} câu
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          part.accuracy >= 70 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {part.accuracy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{formatTime(part.timeSeconds)}</td>
                    <td className="py-3 px-4 text-zinc-400">{part.avgSecondsPerQuestion}s/câu</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── INCORRECT / REVIEW SECTION ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📖</span>
              <span>Xem lại chi tiết câu hỏi & Lời giải</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "all"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Tất cả ({result.totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("wrong")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "wrong"
                    ? "bg-rose-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Chỉ câu sai ({result.incorrectCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("correct")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "correct"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Chỉ câu đúng ({result.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("marked")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "marked"
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Đã đánh dấu 🚩
              </button>
            </div>
          </div>

          {/* Questions Review List */}
          <div className="space-y-5">
            {filteredReviewList.map((item, idx) => {
              const isBookmarked = !!errorLogBookmarked[item.questionId];

              return (
                <div
                  key={item.questionId}
                  className={`bg-zinc-900/80 border rounded-3xl p-6 sm:p-7 space-y-4 transition ${
                    item.isCorrect
                      ? "border-emerald-800/40"
                      : "border-rose-800/50 shadow-lg shadow-rose-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                          item.isCorrect
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        Part {item.part}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          item.isCorrect
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {item.isCorrect ? "✓ Trả lời đúng" : "✗ Trả lời sai"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleErrorLog(item.questionId)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isBookmarked
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-zinc-800 text-zinc-400 hover:text-amber-400"
                      }`}
                    >
                      <span>{isBookmarked ? "⭐" : "☆"}</span>
                      <span>{isBookmarked ? "Đã lưu sổ tay lỗi" : "Lưu vào sổ tay lỗi"}</span>
                    </button>
                  </div>

                  {/* Passage / Image / Audio */}
                  {item.audioUrl && (
                    <audio controls className="w-full h-8" src={item.audioUrl} />
                  )}

                  {item.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex justify-center p-2">
                      <img
                        src={item.imageUrl}
                        alt="Question visual"
                        className="max-h-56 object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {item.passage && (
                    <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {item.passage}
                    </div>
                  )}

                  <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
                    <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      {item.questionText || "Chọn đáp án đúng:"}
                    </p>
                  </div>

                  {/* Options Comparison */}
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {item.options.map((opt) => {
                      const isUserChoice = opt.id === item.selectedOptionId;
                      const isCorrectChoice = opt.isCorrect;

                      let optStyle = "bg-zinc-900 border-zinc-800 text-zinc-400";
                      if (isCorrectChoice) {
                        optStyle = "bg-emerald-950/50 border-emerald-500/50 text-emerald-200 font-bold";
                      } else if (isUserChoice && !isCorrectChoice) {
                        optStyle = "bg-rose-950/50 border-rose-500/50 text-rose-200 line-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${optStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 ${
                              isCorrectChoice
                                ? "bg-emerald-600 text-white"
                                : isUserChoice
                                ? "bg-rose-600 text-white"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrectChoice && <span className="text-emerald-400 font-bold">✓ Đúng</span>}
                          {isUserChoice && !isCorrectChoice && <span className="text-rose-400">✗ Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
                      <span>📖</span>
                      <span>Giải thích chi tiết</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed pl-6">{item.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
