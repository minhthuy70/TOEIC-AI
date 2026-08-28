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
import {
  Edit3,
  Settings,
  Clock,
  Infinity as InfinityIcon,
  Rocket,
  Flag,
  Trophy,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Star,
  Layers,
  Lightbulb,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
  Search,
} from "lucide-react";

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

  // Start Session handler
  const handleStart = async (topicIdParam?: number) => {
    try {
      setLoadingSession(true);
      const chosenTopicId = topicIdParam !== undefined ? topicIdParam : selectedTopicId;
      const res = await startGrammarExercise({
        categoryId: chosenTopicId > 0 ? chosenTopicId : undefined,
        questionCount,
        difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
        isTimed,
      });

      setSession(res);
      setCurrentQIndex(0);
      setAnswers({});
      setMarkedForReview({});
      setElapsedSeconds(0);
      setTimeRemaining(isTimed ? res.timeLimitSeconds : null);
      setScreen("exercise");
      playSoundFeedback("click");
    } catch (err) {
      console.error("Error starting grammar exercise session:", err);
      alert("Không thể tải câu hỏi luyện tập. Vui lòng thử lại!");
    } finally {
      setLoadingSession(false);
    }
  };

  // Select Option handler
  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    playSoundFeedback("click");

    const gs = loadGrammarSettings();
    if (gs.autoAdvanceAfterCorrect && session) {
      if (currentQIndex < session.questions.length - 1) {
        setTimeout(() => setCurrentQIndex((prev) => prev + 1), 300);
      }
    }
  };

  // Toggle Mark For Review
  const toggleMarkForReview = (questionId: number) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    playSoundFeedback("click");
  };

  // Submit Session handler
  const handleSubmit = async () => {
    if (!session || submitting) return;
    try {
      setSubmitting(true);
      const answerList = Object.entries(answers).map(([qid, oid]) => ({
        questionId: Number(qid),
        optionId: oid,
      }));

      const res = await submitGrammarExercise({
        categoryId: session.categoryId || undefined,
        answers: answerList,
        durationSeconds: elapsedSeconds,
      });

      setResult(res);
      setScreen("summary");
      if (res.accuracy >= 70) {
        playSoundFeedback("complete");
      } else {
        playSoundFeedback("incorrect");
      }
    } catch (err) {
      console.error("Error submitting grammar exercise:", err);
      alert("Có lỗi khi chấm điểm bài tập.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Error Log bookmark
  const toggleErrorLog = (questionId: number) => {
    setErrorLogBookmarked((prev) => {
      const next = { ...prev, [questionId]: !prev[questionId] };
      try {
        localStorage.setItem("grammar_error_log", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showToast(next[questionId] ? "Đã lưu câu hỏi vào Sổ tay lỗi sai!" : "Đã bỏ lưu câu hỏi.");
      return next;
    });
  };

  // Retry only incorrect questions
  const handleRetryIncorrect = () => {
    if (!result) return;
    const incorrectQIds = result.results
      .filter((r) => !r.isCorrect)
      .map((r) => r.questionId);

    if (incorrectQIds.length === 0) return;

    if (session) {
      const subsetQuestions = session.questions.filter((q) =>
        incorrectQIds.includes(q.id)
      );
      setSession({
        ...session,
        questions: subsetQuestions,
        totalQuestions: subsetQuestions.length,
      });
      setCurrentQIndex(0);
      setAnswers({});
      setMarkedForReview({});
      setElapsedSeconds(0);
      setTimeRemaining(isTimed ? subsetQuestions.length * 45 : null);
      setScreen("exercise");
    }
  };

  // Format time (seconds -> mm:ss)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter topics in list
  const filteredTopics = useMemo(() => {
    if (!searchTopic.trim()) return topics;
    const q = searchTopic.toLowerCase().trim();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [topics, searchTopic]);

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
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-red-500" />
                <span>Luyện Tập Bài Tập Ngữ Pháp</span>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </Link>
            <Link
              href="/dashboard/grammar"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bảng điều khiển</span>
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
            <h3 className="text-white font-bold text-sm mb-3">2. Độ khó mục tiêu</h3>
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
                <Clock className="w-4 h-4" />
                <span>Bấm giờ thi thật (45s/câu)</span>
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
                <InfinityIcon className="w-4 h-4" />
                <span>Không giới hạn thời gian</span>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
            >
              {loadingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              <span>{loadingSession ? "Đang tải câu hỏi..." : "Bắt đầu luyện tập tổng hợp"}</span>
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

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chủ đề bài tập..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="bg-zinc-900/90 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all w-full"
              />
            </div>
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
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow transition"
                    >
                      <span>Luyện chủ đề này</span>
                      <ArrowRight className="w-3 h-3" />
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
            <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Chủ đề bài tập:</p>
              <h2 className="text-sm font-bold text-white">{session.categoryName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            {isTimed && timeRemaining !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
                <Clock className="w-4 h-4" />
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
              <Flag className={`w-3.5 h-3.5 ${isCurrentMarked ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>{isCurrentMarked ? "Đã đánh dấu" : "Đánh dấu xem lại"}</span>
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Câu trước</span>
            </button>

            {currentQIndex < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => Math.min(prev + 1, totalQ - 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Hoàn thành & Nộp bài</span>
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
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Back Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen("config")}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn bài luyện tập khác</span>
          </button>
          <Link
            href="/dashboard/grammar"
            className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300"
          >
            <span>Về Dashboard Ngữ Pháp</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── EXERCISE SUMMARY BOX ── */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                  isPassed
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                }`}
              >
                {isPassed ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
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
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại {result.incorrectCount} câu sai</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStart()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow transition"
              >
                <span>Làm lại toàn bộ</span>
                <Rocket className="w-3.5 h-3.5" />
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
              <BookOpen className="w-5 h-5 text-red-500" />
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
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reviewFilter === "marked"
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Flag className="w-3 h-3" />
                <span>Đã đánh dấu</span>
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
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          item.isCorrect
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {item.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{item.isCorrect ? "Trả lời đúng" : "Trả lời sai"}</span>
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
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
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
                          {isCorrectChoice && <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Đúng</span>}
                          {isUserChoice && !isCorrectChoice && <span className="text-rose-400 flex items-center gap-1"><X className="w-3 h-3" /> Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Box */}
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Giải thích chi tiết</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed pl-6">{item.explanation}</p>

                    {/* Grammar Rule Reference */}
                    <div className="pt-2 border-t border-zinc-800/60 pl-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Tham chiếu quy tắc ngữ pháp:</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{item.grammarRule}</p>
                    </div>

                    {/* Related Example */}
                    {item.relatedExample && (
                      <div className="pt-2 border-t border-zinc-800/60 pl-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Lightbulb className="w-3.5 h-3.5" />
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
