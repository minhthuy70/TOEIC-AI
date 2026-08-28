"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getGrammarExercises,
  startGrammarExercise,
  submitGrammarExercise,
} from "@/services/grammar";
import {
  loadGrammarSettings,
  playSoundFeedback,
} from "@/lib/grammar-settings";
import type {
  GrammarExerciseTopic,
  GrammarExerciseSession,
  GrammarExerciseQuestion,
  GrammarExerciseSubmitResult,
  GrammarExerciseResultItem,
} from "@/types/grammar";

type ScreenState = "config" | "exercise" | "summary";

export default function GrammarExercisesPage() {
  const [screen, setScreen] = useState<ScreenState>("config");

  // Config State
  const [topics, setTopics] = useState<GrammarExerciseTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | 0>(0); // 0 = all topics
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [searchTopic, setSearchTopic] = useState("");

  // Exercise State
  const [loadingSession, setLoadingSession] = useState(false);
  const [session, setSession] = useState<GrammarExerciseSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Summary & Review State
  const [result, setResult] = useState<GrammarExerciseSubmitResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "marked">("all");
  const [errorLogBookmarked, setErrorLogBookmarked] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load settings & error log from localStorage
  useEffect(() => {
    try {
      const gs = loadGrammarSettings();
      if (gs.exerciseDifficultyPreference) {
        setSelectedDifficulty(gs.exerciseDifficultyPreference);
      }
      const stored = localStorage.getItem("grammar_error_log");
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

  // Load topics list
  useEffect(() => {
    async function loadTopics() {
      try {
        setLoadingTopics(true);
        const res = await getGrammarExercises();
        setTopics(res);
      } catch (err) {
        console.error("Load grammar exercise topics error:", err);
      } finally {
        setLoadingTopics(false);
      }
    }
    loadTopics();
  }, []);

  // Timer logic during exercise
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "exercise") {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (isTimed && timeRemaining !== null) {
          setTimeRemaining((prev) => {
            if (prev === null || prev <= 1) {
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  // Filter topics for config screen
  const filteredTopics = useMemo(() => {
    let list = topics;
    if (selectedDifficulty !== "all") {
      list = list.filter((t) => {
        if (selectedDifficulty === "basic") return t.stage <= 2;
        if (selectedDifficulty === "intermediate") return t.stage === 3 || t.stage === 4;
        if (selectedDifficulty === "advanced") return t.stage >= 5;
        return true;
      });
    }
    if (searchTopic.trim()) {
      const q = searchTopic.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [topics, selectedDifficulty, searchTopic]);

  // Start Exercise
  const handleStart = async (topicId?: number) => {
    const tId = topicId !== undefined ? topicId : selectedTopicId;
    setLoadingSession(true);
    try {
      const res = await startGrammarExercise({
        categoryId: tId > 0 ? tId : undefined,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        questionCount,
        isTimed,
      });

      setSession(res);
      setAnswers({});
      setMarkedForReview({});
      setCurrentQIndex(0);
      setElapsedSeconds(0);
      if (isTimed) {
        setTimeRemaining(res.timeLimitSeconds || res.totalQuestions * 45);
      } else {
        setTimeRemaining(null);
      }
      setScreen("exercise");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải câu hỏi bài tập. Vui lòng thử lại!");
    } finally {
      setLoadingSession(false);
    }
  };

  // Select Option
  const handleSelectOption = (qId: number, optId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
    playSoundFeedback("click");

    // Auto-advance if enabled in settings
    const gs = loadGrammarSettings();
    if (gs.autoAdvanceAfterCorrect && session && currentQIndex < session.questions.length - 1) {
      setTimeout(() => {
        setCurrentQIndex((prev) => Math.min(prev + 1, session.questions.length - 1));
      }, 250);
    }
  };

  // Toggle Mark for review
  const toggleMarkForReview = (qId: number) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
    playSoundFeedback("click");
  };

  // Submit Exercise
  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qId, oId]) => ({
        questionId: Number(qId),
        optionId: Number(oId),
      }));

      const res = await submitGrammarExercise({
        categoryId: session.categoryId || undefined,
        answers: answersArr,
        durationSeconds: elapsedSeconds,
      });

      setResult(res);
      setScreen("summary");
      setCurrentQIndex(0);

      if (res.accuracy >= 70) {
        playSoundFeedback("complete");
      } else {
        playSoundFeedback("incorrect");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi nộp bài tập. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Bookmark to Error Log
  const toggleErrorLog = (qId: number) => {
    setErrorLogBookmarked((prev) => {
      const next = { ...prev, [qId]: !prev[qId] };
      try {
        localStorage.setItem("grammar_error_log", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      playSoundFeedback("click");
      showToast(next[qId] ? "Đã lưu vào Nhật ký lỗi ngữ pháp!" : "Đã gỡ khỏi Nhật ký lỗi.");
      return next;
    });
  };

  // Retry Incorrect Questions
  const handleRetryIncorrect = () => {
    if (!result || result.incorrectQuestions.length === 0 || !session) return;

    const retryQuestions: GrammarExerciseQuestion[] = result.incorrectQuestions.map(
      (iq, idx) => ({
        id: iq.questionId,
        questionNumber: idx + 1,
        questionText: iq.questionText,
        options: iq.options.map((o) => ({
          id: o.id,
          label: o.label,
          text: o.text,
        })),
        knowledge: iq.grammarRule,
      })
    );

    const retrySession: GrammarExerciseSession = {
      ...session,
      totalQuestions: retryQuestions.length,
      questions: retryQuestions,
      timeLimitSeconds: isTimed ? retryQuestions.length * 45 : null,
    };

    setSession(retrySession);
    setAnswers({});
    setMarkedForReview({});
    setCurrentQIndex(0);
    setElapsedSeconds(0);
    setTimeRemaining(isTimed ? retryQuestions.length * 45 : null);
    setResult(null);
    setScreen("exercise");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // =========================================================
  // SCREEN 1: CONFIG & TOPIC SELECTOR
  // =========================================================
  if (screen === "config") {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                ✍️ Luyện Tập Bài Tập Ngữ Pháp
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                Part 5 & 6 TOEIC
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Rèn luyện phản xạ ngữ pháp theo chủ đề, độ khó, bấm giờ và sửa lỗi chi tiết
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/grammar/settings"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              <span>⚙️</span>
              <span>Cài đặt</span>
            </Link>
            <Link
              href="/dashboard/grammar"
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              ← Bảng điều khiển
            </Link>
          </div>
        </div>

        {/* Configuration Box */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Section: Question Count */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">1. Chọn số lượng câu hỏi</h3>
            <div className="flex flex-wrap gap-2.5">
              {[5, 10, 15, 20, 30].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuestionCount(c)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    questionCount === c
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {c} câu
                </button>
              ))}
            </div>
          </div>

          {/* Section: Difficulty */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">2. Chọn độ khó bài tập</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: "all", label: "Tất cả độ khó" },
                { id: "basic", label: "Cơ bản (Chặng 1-2)" },
                { id: "intermediate", label: "Trung cấp (Chặng 3-4)" },
                { id: "advanced", label: "Nâng cao (Chặng 5)" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDifficulty === d.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Timer mode */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">3. Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsTimed(true)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isTimed
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <span>⏳ Bấm giờ thi thật (45s/câu)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTimed(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  !isTimed
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <span>♾️ Không giới hạn thời gian</span>
              </button>
            </div>
          </div>

          {/* Section: Start Quick Exercise button */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-zinc-400">
                Đang chọn: <span className="text-white font-bold">{questionCount} câu</span> •{" "}
                <span className="text-white font-bold">
                  {selectedDifficulty === "all" ? "Mọi độ khó" : selectedDifficulty}
                </span>{" "}
                • <span className="text-white font-bold">{isTimed ? "Có bấm giờ" : "Tự do"}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStart(0)}
              disabled={loadingSession}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
            >
              {loadingSession ? "Đang tải câu hỏi..." : "🚀 Bắt đầu luyện tập tổng hợp"}
            </button>
          </div>
        </div>

        {/* Section: Exercise list by topic */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Hoặc chọn bài tập theo từng chủ đề</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Nhấp vào chủ đề để luyện chuyên sâu kiến thức đó</p>
            </div>

            <input
              type="text"
              placeholder="Tìm chủ đề bài tập..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all w-full sm:w-56"
            />
          </div>

          {loadingTopics ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-36 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        Chặng {topic.stage}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-600/20">
                        {topic.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-red-400 transition-colors line-clamp-1">
                        {topic.name}
                      </h4>
                      {topic.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>Độ chính xác: <strong className="text-white">{topic.accuracy}%</strong></span>
                      <span>{topic.completedLessons}/{topic.totalLessons} bài học</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">
                      ~{topic.estimatedQuestions} câu hỏi
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStart(topic.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow transition"
                    >
                      Luyện chủ đề này →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // SCREEN 2: EXERCISE / QUIZ VIEW
  // =========================================================
  if (screen === "exercise" && session) {
    const currentQ = session.questions[currentQIndex];
    const totalQ = session.questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = Math.round((answeredCount / totalQ) * 100);
    const isCurrentMarked = !!markedForReview[currentQ.id];
    const selectedOptId = answers[currentQ.id];

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Top Exercise Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-xs text-zinc-400">Chủ đề bài tập:</p>
              <h2 className="text-sm font-bold text-white">{session.categoryName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            {isTimed && timeRemaining !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
                <span>⏳</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? "Đang chấm điểm..." : `Nộp bài (${answeredCount}/${totalQ})`}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Palette Grid */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tiến độ làm bài: {answeredCount}/{totalQ} câu</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>

          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Palette Grid */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {session.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarked = markedForReview[q.id];
              const isCurrent = idx === currentQIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all relative ${
                    isCurrent
                      ? "ring-2 ring-red-500 bg-red-600 text-white"
                      : isAnswered
                      ? "bg-zinc-700 text-white hover:bg-zinc-600"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {idx + 1}
                  {isMarked && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 font-bold text-xs flex items-center justify-center">
                #{currentQIndex + 1}
              </span>
              <span className="text-xs text-zinc-400">Câu hỏi {currentQIndex + 1} / {totalQ}</span>
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

          {/* Question Text */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
            <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQ.questionText}
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
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 group ${
                    isSelected
                      ? "bg-red-600/15 border-red-500 text-white shadow-lg shadow-red-600/10"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white"
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

          {/* Navigation Prev / Next */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
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
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Hoàn thành & Nộp bài ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // SCREEN 3: SUMMARY & DETAILED REVIEW
  // =========================================================
  if (screen === "summary" && result) {
    const isPassed = result.accuracy >= 70;

    // Filter results for review
    const reviewList: GrammarExerciseResultItem[] = result.results.filter((r) => {
      if (reviewFilter === "incorrect") return !r.isCorrect;
      if (reviewFilter === "marked") return markedForReview[r.questionId];
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-10 relative">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Back Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen("config")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition"
          >
            ← Chọn bài luyện tập khác
          </button>
          <Link
            href="/dashboard/grammar"
            className="text-xs font-bold text-red-400 hover:text-red-300"
          >
            Về Dashboard Ngữ Pháp →
          </Link>
        </div>

        {/* ── EXERCISE SUMMARY BOX ── */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                  isPassed
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                }`}
              >
                {isPassed ? "🏆" : "⚠️"}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isPassed ? "Hoàn Thành Xuất Sắc!" : "Cần Củng Cố Thêm Kiến Thức"}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Thời gian làm bài: {formatTime(result.durationSeconds)} • Tổng số câu: {result.totalQuestions}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {result.incorrectCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetryIncorrect}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow transition flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Làm lại {result.incorrectCount} câu sai</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStart()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow transition"
              >
                Làm lại toàn bộ 🚀
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase font-bold">Điểm số</p>
              <p className="text-2xl font-extrabold text-white mt-1">{result.score}/100</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase font-bold">Độ chính xác</p>
              <p className={`text-2xl font-extrabold mt-1 ${isPassed ? "text-emerald-400" : "text-rose-400"}`}>
                {result.accuracy}%
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase font-bold">Số câu đúng</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                {result.correctCount} câu
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase font-bold">Số câu sai</p>
              <p className="text-2xl font-extrabold text-rose-400 mt-1">
                {result.incorrectCount} câu
              </p>
            </div>
          </div>
        </div>

        {/* ── REVIEW LIST HEADER & TABS ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📖</span>
              <span>Xem lại chi tiết câu hỏi & Lời giải ngữ pháp</span>
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
                onClick={() => setReviewFilter("incorrect")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "incorrect"
                    ? "bg-rose-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Chỉ câu sai ({result.incorrectCount})
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
            {reviewList.map((item, idx) => {
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
                  {/* Top item badge */}
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

                    {/* Bookmark to Error Log */}
                    <button
                      type="button"
                      onClick={() => toggleErrorLog(item.questionId)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isBookmarked
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-zinc-700"
                      }`}
                    >
                      <span>{isBookmarked ? "⭐" : "☆"}</span>
                      <span>{isBookmarked ? "Đã lưu vào sổ tay lỗi" : "Lưu vào sổ tay lỗi"}</span>
                    </button>
                  </div>

                  {/* Question text */}
                  <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
                    <p className="text-base font-semibold text-white leading-relaxed">
                      {item.questionText}
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

                  {/* Detailed Explanation Box */}
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
                      <span>📖</span>
                      <span>Giải thích chi tiết</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed pl-6">{item.explanation}</p>

                    {/* Grammar Rule Reference */}
                    <div className="pt-2 border-t border-zinc-800/60 pl-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                        <span>📐</span>
                        <span>Tham chiếu quy tắc ngữ pháp:</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{item.grammarRule}</p>
                    </div>

                    {/* Related Example */}
                    {item.relatedExample && (
                      <div className="pt-2 border-t border-zinc-800/60 pl-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <span>💡</span>
                          <span>Ví dụ tương tự:</span>
                        </div>
                        <p className="text-zinc-300 italic leading-relaxed">{item.relatedExample}</p>
                      </div>
                    )}
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
