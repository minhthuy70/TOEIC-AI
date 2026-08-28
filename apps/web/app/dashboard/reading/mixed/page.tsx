"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  startPractice,
  submitPractice,
  PracticeStartResponse,
  PracticeQuestion,
  PracticeOption,
} from "@/services/practice";

// ─── Types ────────────────────────────────────────────────────────────────
type PracticeMode = "normal" | "timed" | "exam";
type ScreenState = "config" | "practice" | "review";
type QuestionOrder = "sequential" | "shuffle";

interface EnrichedQuestion extends PracticeQuestion {
  part: number;
  groupId: number;
  passage?: string | null;
  groupTitle?: string | null;
}

interface TimeEntry {
  questionId: number;
  seconds: number;
}

interface ErrorLogEntry {
  questionId: number;
  questionText: string;
  part: number;
  correctOptionLabel: string;
  userOptionLabel: string;
  addedAt: string;
}

const PART_LABELS: Record<number, { label: string; color: string; bg: string; icon: string }> = {
  5: { label: "Part 5", color: "text-indigo-400", bg: "bg-indigo-600", icon: "🧩" },
  6: { label: "Part 6", color: "text-emerald-400", bg: "bg-emerald-600", icon: "📝" },
  7: { label: "Part 7", color: "text-amber-400", bg: "bg-amber-600", icon: "📄" },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ERROR_LOG_KEY = "bella_reading_error_log";

function loadErrorLog(): ErrorLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || "[]");
  } catch { return []; }
}
function saveErrorLog(entries: ErrorLogEntry[]) {
  localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(entries.slice(-200)));
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ReadingMixedPage() {
  const [screen, setScreen] = useState<ScreenState>("config");

  // Config
  const [selectedParts, setSelectedParts] = useState<number[]>([5, 6, 7]);
  const [countPerPart, setCountPerPart] = useState(5);
  const [mode, setMode] = useState<PracticeMode>("timed");
  const [order, setOrder] = useState<QuestionOrder>("shuffle");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  // Practice
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<EnrichedQuestion[]>([]);
  const [sessions, setSessions] = useState<{ part: number; sessionId: number }[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Real-time score
  const [liveScore, setLiveScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Time tracking per question
  const questionStartTime = useRef<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<TimeEntry[]>([]);

  // Review
  interface ReviewResult {
    questionId: number;
    optionId: number | null;
    optionLabel: string | null;
    isCorrect: boolean;
  }
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "marked">("all");
  const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
  const [addedToLog, setAddedToLog] = useState<Record<number, boolean>>({});

  // Timer
  useEffect(() => {
    if (screen !== "practice" || paused || mode === "normal") return;
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0) handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeRemaining(t => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [screen, paused, mode, timeRemaining]);

  // Record time for current question on navigation
  const recordTimeForCurrent = () => {
    const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
    if (questions[currentQIndex]) {
      setTimeSpent(prev => {
        const existing = prev.find(e => e.questionId === questions[currentQIndex].id);
        if (existing) {
          return prev.map(e => e.questionId === questions[currentQIndex].id ? { ...e, seconds: e.seconds + elapsed } : e);
        }
        return [...prev, { questionId: questions[currentQIndex].id, seconds: elapsed }];
      });
    }
    questionStartTime.current = Date.now();
  };

  const navigateTo = (idx: number) => {
    recordTimeForCurrent();
    setCurrentQIndex(idx);
  };

  const handleSelectAnswer = (qId: number, optId: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleMark = (qId: number) => setMarkedForReview(p => ({ ...p, [qId]: !p[qId] }));

  // Update live score whenever answers change
  useEffect(() => {
    // We don't have correct answers during practice — show answered count vs total
    const answered = Object.keys(answers).length;
    setLiveScore({ correct: answered, total: questions.length });
  }, [answers, questions.length]);

  const handleStart = async () => {
    if (selectedParts.length === 0) { alert("Vui lòng chọn ít nhất 1 phần."); return; }
    setLoading(true);
    try {
      const allQuestions: EnrichedQuestion[] = [];
      const sessionList: { part: number; sessionId: number }[] = [];

      for (const part of selectedParts) {
        const res: PracticeStartResponse = await startPractice(part, countPerPart);
        sessionList.push({ part, sessionId: res.sessionId });
        for (const group of res.groups) {
          for (const q of group.questions) {
            allQuestions.push({
              ...q,
              part,
              groupId: group.id,
              passage: group.passage,
              groupTitle: group.title,
            });
          }
        }
      }

      const ordered = order === "shuffle" ? shuffleArray(allQuestions) : allQuestions;
      setQuestions(ordered);
      setSessions(sessionList);
      setAnswers({});
      setMarkedForReview({});
      setTimeSpent([]);
      setCurrentQIndex(0);
      setPaused(false);
      if (mode !== "normal") {
        setTimeRemaining(timeLimitMinutes * 60);
      } else {
        setTimeRemaining(null);
      }
      questionStartTime.current = Date.now();
      setScreen("practice");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải bài tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    recordTimeForCurrent();
    setSubmitting(true);

    // Submit each session's answers
    const allResults: ReviewResult[] = [];
    try {
      for (const { part, sessionId } of sessions) {
        const partQs = questions.filter(q => q.part === part);
        const partAnswers = partQs
          .filter(q => answers[q.id] !== undefined)
          .map(q => ({ questionId: q.id, optionId: answers[q.id] }));

        if (partAnswers.length === 0) continue;
        const res = await submitPractice({ sessionId, answers: partAnswers });
        allResults.push(...res.answers);
      }
      setReviewResults(allResults);
      setErrorLog(loadErrorLog());
      setScreen("review");
      setCurrentQIndex(0);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToErrorLog = (q: EnrichedQuestion) => {
    const result = reviewResults.find(r => r.questionId === q.id);
    if (!result || result.isCorrect) return;
    const entry: ErrorLogEntry = {
      questionId: q.id,
      questionText: q.question_text || "",
      part: q.part,
      correctOptionLabel: "—",
      userOptionLabel: result.optionLabel || "—",
      addedAt: new Date().toLocaleString("vi-VN"),
    };
    const existing = loadErrorLog();
    const updated = [...existing.filter(e => e.questionId !== q.id), entry];
    saveErrorLog(updated);
    setAddedToLog(p => ({ ...p, [q.id]: true }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalSeconds = timeLimitMinutes * 60;
  const progressPct = timeRemaining !== null ? Math.round(((totalSeconds - timeRemaining) / totalSeconds) * 100) : 0;

  // ─── CONFIG SCREEN ─────────────────────────────────────────────────────
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/reading" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">🎯 Luyện đọc hỗn hợp</h1>
            <p className="text-zinc-400 text-sm">Reading Mixed Practice — Part 5, 6, 7</p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          {/* Part selection */}
          <div>
            <h3 className="text-white font-bold mb-4">Chọn phần thi</h3>
            <div className="flex flex-wrap gap-3">
              {[5, 6, 7].map(p => {
                const info = PART_LABELS[p];
                const selected = selectedParts.includes(p);
                return (
                  <button key={p}
                    onClick={() => setSelectedParts(prev => selected ? prev.filter(x => x !== p) : [...prev, p])}
                    className={`px-5 py-4 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-1 min-w-[100px] ${selected ? `${info.bg}/20 border-current ${info.color}` : "bg-zinc-800 border-transparent text-zinc-500 hover:bg-zinc-700 hover:text-white"}`}>
                    <span className="text-xl">{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count per part */}
          <div>
            <h3 className="text-white font-bold mb-1">Số câu mỗi phần</h3>
            <p className="text-zinc-500 text-xs mb-3">Tổng: ~{selectedParts.length * countPerPart} câu</p>
            <div className="flex flex-wrap gap-3">
              {[5, 10, 15, 20].map(c => (
                <button key={c} onClick={() => setCountPerPart(c)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all ${countPerPart === c ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  {c} câu
                </button>
              ))}
            </div>
          </div>

          {/* Practice mode */}
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ luyện tập</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                { value: "normal" as PracticeMode, label: "Bình thường", icon: "🌙", desc: "Không giới hạn thời gian" },
                { value: "timed" as PracticeMode, label: "Giới hạn giờ", icon: "⏱️", desc: "Có đồng hồ đếm ngược, có thể tạm dừng" },
                { value: "exam" as PracticeMode, label: "Thi thử", icon: "🎓", desc: "Nghiêm ngặt, tự động nộp khi hết giờ" },
              ] as const).map(m => (
                <button key={m.value} onClick={() => setMode(m.value)}
                  className={`px-4 py-4 rounded-xl font-bold transition-all border-2 flex flex-col gap-1 text-left ${mode === m.value ? "bg-purple-600/20 border-purple-500 text-white" : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  <span className="text-xl">{m.icon}</span>
                  <span>{m.label}</span>
                  <span className="text-[11px] font-normal opacity-70">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time limit (for timed/exam) */}
          {mode !== "normal" && (
            <div>
              <h3 className="text-white font-bold mb-4">Thời gian giới hạn</h3>
              <div className="flex flex-wrap gap-3">
                {[10, 15, 20, 30, 45, 60].map(m => (
                  <button key={m} onClick={() => setTimeLimitMinutes(m)}
                    className={`px-5 py-3 rounded-xl font-bold transition-all ${timeLimitMinutes === m ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                    {m} phút
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order */}
          <div>
            <h3 className="text-white font-bold mb-4">Thứ tự câu hỏi</h3>
            <div className="flex gap-3">
              <button onClick={() => setOrder("shuffle")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${order === "shuffle" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                🔀 Xáo trộn
              </button>
              <button onClick={() => setOrder("sequential")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${order === "sequential" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                📋 Tuần tự
              </button>
            </div>
          </div>

          <button onClick={handleStart} disabled={loading || selectedParts.length === 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-lg hover:from-purple-500 hover:to-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20">
            {loading ? "Đang tải bài tập..." : `Bắt đầu luyện (${selectedParts.length} phần, ~${selectedParts.length * countPerPart} câu)`}
          </button>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ────────────────────────────────────────────────────
  if (screen === "practice" && questions.length > 0) {
    const currentQ = questions[currentQIndex];
    const info = PART_LABELS[currentQ?.part] || PART_LABELS[5];
    const answeredCount = Object.keys(answers).length;
    const progressAnswered = Math.round((answeredCount / questions.length) * 100);

    return (
      <div className="max-w-5xl mx-auto py-4 px-4 flex flex-col min-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-2xl mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {mode !== "exam" && (
              <button onClick={() => { if (confirm("Thoát?")) setScreen("config"); }} className="text-zinc-400 hover:text-white text-sm">✕ Thoát</button>
            )}
            <div className="h-5 w-px bg-zinc-800" />
            <span className="font-bold text-white text-sm">Câu {currentQIndex + 1}/{questions.length}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${info.bg}/20 ${info.color}`}>{info.icon} {info.label}</span>
            {/* Real-time score */}
            <span className="text-zinc-500 text-xs">✍️ {answeredCount}/{questions.length} đã trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Pause/Resume */}
            {mode !== "exam" && mode !== "normal" && (
              <button onClick={() => setPaused(p => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${paused ? "bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 animate-pulse" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                {paused ? "▶ Tiếp tục" : "⏸ Tạm dừng"}
              </button>
            )}
            {timeRemaining !== null && (
              <span className={`font-mono font-bold text-sm ${timeRemaining < 60 ? "text-rose-500 animate-pulse" : "text-amber-400"}`}>
                ⏳ {formatTime(timeRemaining)}
              </span>
            )}
            <button onClick={handleSubmit} disabled={submitting}
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all"
            style={{ width: `${progressAnswered}%` }}
          />
          {mode !== "normal" && timeRemaining !== null && (
            <div
              className="absolute left-0 top-0 h-full bg-amber-500/30 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-[11px] text-zinc-600 mb-5 px-1">
          <span>Tiến độ trả lời: {progressAnswered}%</span>
          {mode !== "normal" && <span>Thời gian đã dùng: {progressPct}%</span>}
        </div>

        {/* Pause overlay */}
        {paused && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-10 text-center max-w-sm mx-4">
              <p className="text-5xl mb-4">⏸</p>
              <h3 className="text-2xl font-bold text-white mb-2">Đang tạm dừng</h3>
              <p className="text-zinc-400 text-sm mb-6">Nhấn "Tiếp tục" để tiếp tục làm bài.</p>
              <button onClick={() => setPaused(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">
                ▶ Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* Main Q area */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5">
          {/* Left: Passage (if part 6 or 7) */}
          {currentQ?.passage ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="bg-zinc-800/60 px-4 py-2.5 border-b border-zinc-700 flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${info.color}`}>{info.label}</span>
                <span className="text-white text-xs font-bold">{currentQ.groupTitle || "Đoạn văn"}</span>
              </div>
              <div className="p-5 flex-1 overflow-y-auto text-zinc-200 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                {currentQ.passage}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-center min-h-[200px]">
              <div className="text-center p-6">
                <span className="text-4xl">{info.icon}</span>
                <p className={`text-sm font-bold mt-2 ${info.color}`}>{info.label} — Incomplete Sentence</p>
                <p className="text-zinc-500 text-xs mt-1">Không có đoạn văn — chọn đáp án bên phải</p>
              </div>
            </div>
          )}

          {/* Right: Question */}
          <div className="flex flex-col gap-4">
            {/* Part quick nav */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {selectedParts.map(p => {
                const pInfo = PART_LABELS[p];
                const pQs = questions.filter(q => q.part === p);
                const pAnswered = pQs.filter(q => answers[q.id]).length;
                return (
                  <div key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${pInfo.bg}/10 border border-current/20 ${pInfo.color} text-xs font-bold shrink-0`}>
                    {pInfo.icon} {pAnswered}/{pQs.length}
                  </div>
                );
              })}
            </div>

            {currentQ && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-white font-medium leading-relaxed">{currentQ.question_text || "Điền vào chỗ trống"}</h4>
                  <button onClick={() => toggleMark(currentQ.id)}
                    className={`shrink-0 px-2 py-1 rounded-lg text-sm ${markedForReview[currentQ.id] ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
                    {markedForReview[currentQ.id] ? "★" : "☆"}
                  </button>
                </div>
                <div className="space-y-2">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button key={opt.id} onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                        className={`w-full p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                          isSelected ? `${info.bg}/20 border-current ${info.color}` : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        }`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? `${info.bg} text-white` : "bg-zinc-700 text-zinc-400"}`}>
                          {opt.option_label}
                        </span>
                        <span className="break-words text-sm">{opt.option_text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button onClick={() => navigateTo(currentQIndex - 1)} disabled={currentQIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">← Trước</button>
              <button onClick={() => navigateTo(currentQIndex + 1)} disabled={currentQIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">Tiếp →</button>
            </div>
          </div>
        </div>

        {/* Question grid */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-[11px] mb-2">Điều hướng nhanh:</p>
          <div className="flex gap-1.5 flex-wrap">
            {questions.map((q, i) => {
              const pInfo = PART_LABELS[q.part];
              const isAnswered = answers[q.id] !== undefined;
              const isMark = markedForReview[q.id];
              return (
                <button key={q.id} onClick={() => navigateTo(i)}
                  title={`${pInfo.label} — Câu ${i + 1}`}
                  className={`w-8 h-8 rounded-lg font-bold text-[11px] transition-all ${
                    currentQIndex === i ? "ring-2 ring-white scale-110" : ""
                  } ${isMark ? "bg-amber-500/30 text-amber-300" : isAnswered ? `${pInfo.bg}/30 ${pInfo.color}` : "bg-zinc-900 text-zinc-600 border border-zinc-800"}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW SCREEN ──────────────────────────────────────────────────────
  if (screen === "review" && reviewResults.length > 0) {
    const totalCorrect = reviewResults.filter(r => r.isCorrect).length;
    const totalQ = reviewResults.length;
    const accuracy = Math.round((totalCorrect / totalQ) * 100);

    // Score by part
    const partStats = selectedParts.map(part => {
      const partQs = questions.filter(q => q.part === part);
      const partResults = reviewResults.filter(r => partQs.some(q => q.id === r.questionId));
      const correct = partResults.filter(r => r.isCorrect).length;
      return { part, correct, total: partResults.length, accuracy: partResults.length ? Math.round((correct / partResults.length) * 100) : 0 };
    });

    // Time analysis
    const avgTime = timeSpent.length > 0 ? Math.round(timeSpent.reduce((acc, e) => acc + e.seconds, 0) / timeSpent.length) : 0;
    const slowestQ = [...timeSpent].sort((a, b) => b.seconds - a.seconds)[0];
    const slowestQData = slowestQ ? questions.find(q => q.id === slowestQ.questionId) : null;

    // Filtered questions for review
    const filteredQs = questions.filter(q => {
      const r = reviewResults.find(rr => rr.questionId === q.id);
      if (reviewFilter === "wrong") return r && !r.isCorrect;
      if (reviewFilter === "marked") return markedForReview[q.id];
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl ${accuracy >= 80 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : accuracy >= 60 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-rose-500 to-red-600"}`}>
              <span className="text-xl font-extrabold leading-tight">{accuracy}%</span>
              <span className="text-[10px] opacity-80">chính xác</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">Kết quả luyện hỗn hợp</h2>
              <p className="text-zinc-400 text-sm">{totalCorrect}/{totalQ} câu đúng · {selectedParts.map(p => PART_LABELS[p].label).join(", ")}</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm">
            Luyện lại
          </button>
        </div>

        {/* Score breakdown by part */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">📊 Phân tích điểm theo phần</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {partStats.map(({ part, correct, total, accuracy: acc }) => {
              const info = PART_LABELS[part];
              return (
                <div key={part} className={`${info.bg}/10 border border-current/20 ${info.color} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-bold">{info.label}</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{acc}%</p>
                  <p className="text-xs opacity-70 mt-1">{correct}/{total} câu đúng</p>
                  <div className="h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full ${info.bg} rounded-full`} style={{ width: `${acc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time analysis */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">⏱️ Phân tích thời gian</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-sky-400">{avgTime}s</p>
              <p className="text-zinc-400 text-xs mt-1">Thời gian TB / câu</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-amber-400">{slowestQ?.seconds || 0}s</p>
              <p className="text-zinc-400 text-xs mt-1">Câu chậm nhất</p>
              {slowestQData && <p className="text-zinc-500 text-[10px] mt-1 truncate">{PART_LABELS[slowestQData.part]?.label}</p>}
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-purple-400">
                {timeSpent.reduce((acc, e) => acc + e.seconds, 0)}s
              </p>
              <p className="text-zinc-400 text-xs mt-1">Tổng thời gian làm bài</p>
            </div>
          </div>
        </div>

        {/* Questions review */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h3 className="text-white font-bold">📝 Xem lại câu hỏi</h3>
            <div className="flex gap-2">
              {(["all", "wrong", "marked"] as const).map(f => (
                <button key={f} onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${reviewFilter === f ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                  {f === "all" ? `Tất cả (${totalQ})` : f === "wrong" ? `Câu sai (${reviewResults.filter(r => !r.isCorrect).length})` : `Đánh dấu (${Object.values(markedForReview).filter(Boolean).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQs.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-6">Không có câu hỏi nào phù hợp với bộ lọc.</p>
            )}
            {filteredQs.map((q, idx) => {
              const result = reviewResults.find(r => r.questionId === q.id);
              const isCorrect = result?.isCorrect;
              const info = PART_LABELS[q.part];
              const qTime = timeSpent.find(t => t.questionId === q.id);
              const isInLog = addedToLog[q.id];

              return (
                <div key={q.id} className={`border rounded-2xl overflow-hidden ${isCorrect ? "border-emerald-800/40" : "border-rose-800/40"}`}>
                  <div className={`px-4 py-2.5 border-b flex items-center gap-3 flex-wrap ${isCorrect ? "bg-emerald-900/20 border-emerald-800/30" : "bg-rose-900/20 border-rose-800/30"}`}>
                    <span className={`font-bold text-sm ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>{isCorrect ? "✓" : "✗"} Câu {questions.indexOf(q) + 1}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.bg}/20 ${info.color}`}>{info.icon} {info.label}</span>
                    {markedForReview[q.id] && <span className="text-amber-400 text-[11px]">★ Đánh dấu</span>}
                    {qTime && <span className="text-zinc-500 text-[11px] ml-auto">⏱ {qTime.seconds}s</span>}
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm font-medium mb-3">{q.question_text}</p>
                    <div className="grid sm:grid-cols-2 gap-2 mb-3">
                      {q.options.map(opt => {
                        const isUser = result?.optionId === opt.id;
                        let cls = "bg-zinc-800/50 border-zinc-700 text-zinc-400";
                        if (isUser && isCorrect) cls = "bg-emerald-900/40 border-emerald-500/50 text-emerald-300";
                        else if (isUser && !isCorrect) cls = "bg-rose-900/40 border-rose-500/50 text-rose-300";
                        return (
                          <div key={opt.id} className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${cls}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${isUser && isCorrect ? "bg-emerald-600 text-white" : isUser ? "bg-rose-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>{opt.option_label}</span>
                            <span className="break-words">{opt.option_text}</span>
                            {isUser && <span className="ml-auto shrink-0">{isCorrect ? "✓" : "✗"}</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3 mb-2">
                        <p className="text-indigo-400 font-bold text-[10px] uppercase mb-1">📖 Giải thích</p>
                        <p className="text-indigo-100/70 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation.replace(/\n/g, "<br/>") }} />
                      </div>
                    )}
                    {!isCorrect && (
                      <button onClick={() => handleAddToErrorLog(q)}
                        className={`w-full py-2 text-xs font-bold rounded-lg transition ${isInLog ? "bg-rose-900/30 text-rose-400 border border-rose-800/30 cursor-default" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}`}
                        disabled={isInLog}>
                        {isInLog ? "✓ Đã thêm vào nhật ký lỗi" : "🗂️ Thêm vào nhật ký lỗi"}
                      </button>
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
