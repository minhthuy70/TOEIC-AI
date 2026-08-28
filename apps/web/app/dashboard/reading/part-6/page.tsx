"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  startPractice,
  submitPractice,
  PracticeStartResponse,
  SubmitPracticeResponse,
} from "@/services/practice";
import {
  ArrowLeft,
  Timer,
  Infinity as InfinityIcon,
  X,
  Star,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Search,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ScreenState = "config" | "practice" | "review";
type FillMode = "one-by-one" | "all-at-once";

// Common English cohesion devices grouped by function
const COHESION_DEVICES = {
  "Bổ sung (Addition)": ["furthermore", "moreover", "in addition", "also", "besides", "additionally", "as well as"],
  "Tương phản (Contrast)": ["however", "nevertheless", "on the other hand", "although", "despite", "yet", "but", "while", "whereas"],
  "Nguyên nhân-Kết quả (Cause-Effect)": ["therefore", "thus", "hence", "consequently", "as a result", "because", "since", "so"],
  "Trình tự (Sequence)": ["first", "second", "finally", "then", "next", "afterward", "subsequently", "previously"],
  "Ví dụ (Example)": ["for example", "for instance", "such as", "namely", "including"],
  "Kết luận (Conclusion)": ["in conclusion", "in summary", "to sum up", "overall", "in brief"],
};

function highlightCohesion(text: string): React.ReactNode[] {
  if (!text) return [text];
  const allDevices = Object.values(COHESION_DEVICES).flat();
  const sorted = [...allDevices].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${sorted.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(regex.source, regex.flags);
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <mark
        key={match.index}
        title="Thiết bị liên kết (Cohesion device)"
        className="bg-amber-500/25 text-amber-300 rounded px-0.5 cursor-help not-italic"
      >
        {match[0]}
      </mark>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function Part6PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");

  // Config
  const [count, setCount] = useState<number>(2);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [fillMode, setFillMode] = useState<FillMode>("all-at-once");

  // Practice
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQInGroup, setCurrentQInGroup] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<SubmitPracticeResponse | null>(null);

  // Review extras
  const [highlightGrammar, setHighlightGrammar] = useState(false);
  const [showCohesionPanel, setShowCohesionPanel] = useState(false);
  const [addedNotes, setAddedNotes] = useState<Record<number, boolean>>({});

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "practice" && isTimed && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining(p => (p ? p - 1 : 0)), 1000);
    } else if (screen === "practice" && isTimed && timeRemaining === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startPractice(6, count);
      setSession(res);
      setAnswers({});
      setMarkedForReview({});
      setCurrentGroupIndex(0);
      setCurrentQInGroup(0);
      if (isTimed) setTimeRemaining(res.questionCount * 45);
      setScreen("practice");
    } catch {
      alert("Lỗi khi tải bài tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optId: number) => {
    setAnswers(p => ({ ...p, [qId]: optId }));
    if (fillMode === "one-by-one" && session) {
      const currentGroup = session.groups[currentGroupIndex];
      if (currentQInGroup < currentGroup.questions.length - 1) {
        setTimeout(() => setCurrentQInGroup(q => q + 1), 300);
      }
    }
  };

  const toggleMark = (qId: number) => setMarkedForReview(p => ({ ...p, [qId]: !p[qId] }));

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qId, oId]) => ({
        questionId: Number(qId),
        optionId: Number(oId),
      }));
      const res = await submitPractice({ sessionId: session.sessionId, answers: answersArr });
      setReviewData(res);
      setScreen("review");
      setCurrentGroupIndex(0);
    } catch {
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── CONFIG SCREEN ──────────────────────────────────────────────
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/reading" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              <span>Part 6: Hoàn thành đoạn văn</span>
            </h1>
            <p className="text-zinc-400 text-sm">Text Completion — Cấu hình bài luyện tập</p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          {/* Count */}
          <div>
            <h3 className="text-white font-bold mb-4">Số đoạn văn <span className="text-zinc-500 font-normal text-sm">(mỗi đoạn ~4 câu)</span></h3>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 4, 8].map(c => (
                <button key={c} onClick={() => setCount(c)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  {c} đoạn
                </button>
              ))}
            </div>
          </div>

          {/* Fill mode */}
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ điền đáp án</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => setFillMode("one-by-one")}
                className={`px-5 py-4 rounded-xl font-bold transition-all flex flex-col gap-1 text-left ${fillMode === "one-by-one" ? "bg-indigo-600/30 border-2 border-indigo-500 text-white" : "bg-zinc-800 border-2 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <span>Từng câu một</span>
                <span className="text-xs font-normal opacity-70">Điền lần lượt từng chỗ trống — tập trung cao</span>
              </button>
              <button onClick={() => setFillMode("all-at-once")}
                className={`px-5 py-4 rounded-xl font-bold transition-all flex flex-col gap-1 text-left ${fillMode === "all-at-once" ? "bg-indigo-600/30 border-2 border-indigo-500 text-white" : "bg-zinc-800 border-2 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <span>Tất cả cùng lúc</span>
                <span className="text-xs font-normal opacity-70">Xem toàn bộ câu hỏi và điền tự do</span>
              </button>
            </div>
          </div>

          {/* Timer mode */}
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsTimed(true)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isTimed ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <Timer className="w-4 h-4" />
                <span>Giới hạn thời gian</span>
              </button>
              <button onClick={() => setIsTimed(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${!isTimed ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <InfinityIcon className="w-4 h-4" />
                <span>Không giới hạn</span>
              </button>
            </div>
          </div>

          <button onClick={handleStart} disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 text-white font-extrabold text-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ────────────────────────────────────────────
  if (screen === "practice" && session) {
    const groups = session.groups;
    const currentGroup = groups[currentGroupIndex];
    const totalAnswered = Object.keys(answers).length;
    const totalQ = groups.flatMap(g => g.questions).length;
    const isOneByOne = fillMode === "one-by-one";
    const currentQuestion = currentGroup?.questions[currentQInGroup];

    const goNextGroup = () => {
      setCurrentGroupIndex(i => i + 1);
      setCurrentQInGroup(0);
    };
    const goPrevGroup = () => {
      setCurrentGroupIndex(i => i - 1);
      setCurrentQInGroup(0);
    };

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => { if (confirm("Thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
            <div className="h-5 w-px bg-zinc-800" />
            <span className="font-bold text-white text-sm">Đoạn {currentGroupIndex + 1}/{groups.length}</span>
            {isOneByOne && <span className="text-zinc-500 text-xs">Câu {currentQInGroup + 1}/{currentGroup?.questions.length}</span>}
            <span className="text-zinc-600 text-xs hidden sm:block">({totalAnswered}/{totalQ} câu đã trả lời)</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOneByOne ? "bg-indigo-900/50 text-indigo-300" : "bg-zinc-800 text-zinc-400"}`}>
              {isOneByOne ? "Từng câu" : "Cùng lúc"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold flex items-center gap-1 ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </span>
            )}
            <button onClick={handleSubmit} disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6">

          {/* Left: Passage */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="bg-zinc-800/60 px-5 py-3 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Đoạn văn {currentGroupIndex + 1}</span>
              </h3>
              {currentGroup?.title && <span className="text-xs text-zinc-400 italic">{currentGroup.title}</span>}
            </div>
            <div className="p-6 text-zinc-200 leading-relaxed flex-1 overflow-y-auto text-sm lg:text-base font-serif">
              {currentGroup?.passage ? (
                currentGroup.passage.split(/(\s*_{3,}\s*|\s*\[BLANK[^\]]*\]\s*)/gi).map((part, i) => (
                  /_{3,}|\[BLANK/i.test(part) ? (
                    <span key={i} className="inline-block bg-amber-500/20 text-amber-400 px-3 py-0.5 mx-0.5 rounded border border-amber-500/40 font-bold text-sm tracking-wider">
                      ______
                    </span>
                  ) : <span key={i}>{part}</span>
                ))
              ) : (
                <p className="text-zinc-500 italic">Không có nội dung đoạn văn.</p>
              )}
            </div>
          </div>

          {/* Right: Questions */}
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            {isOneByOne ? (
              currentQuestion && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex gap-1.5">
                    {currentGroup.questions.map((q, i) => (
                      <button key={i} onClick={() => setCurrentQInGroup(i)}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          i === currentQInGroup ? "bg-indigo-500" : answers[q.id] ? "bg-zinc-500" : "bg-zinc-800"
                        }`} title={`Câu ${i + 1}`} />
                    ))}
                  </div>

                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-zinc-200">
                      Chỗ trống {currentQInGroup + 1}: <span className="text-zinc-400 font-normal">{currentQuestion.question_text || "Điền vào chỗ trống"}</span>
                    </h4>
                    <button onClick={() => toggleMark(currentQuestion.id)}
                      className={`shrink-0 ml-2 px-2 py-1 rounded-lg text-sm transition-colors ${markedForReview[currentQuestion.id] ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
                      <Star className={`w-4 h-4 ${markedForReview[currentQuestion.id] ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map(opt => {
                      const isSelected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button key={opt.id} onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                          className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-sm font-medium ${
                            isSelected ? "bg-indigo-600/25 border-indigo-500 text-white scale-[1.02]" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                          }`}>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                            {opt.option_label}
                          </span>
                          {opt.option_text}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-2">
                    <button onClick={() => setCurrentQInGroup(q => q - 1)} disabled={currentQInGroup === 0}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40 flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trước</span>
                    </button>
                    {currentQInGroup < currentGroup.questions.length - 1 ? (
                      <button onClick={() => setCurrentQInGroup(q => q + 1)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-1">
                        <span>Tiếp</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      currentGroupIndex < groups.length - 1 && (
                        <button onClick={goNextGroup}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-1">
                          <span>Đoạn tiếp</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            ) : (
              currentGroup?.questions.map((q, qIdx) => {
                const isMarked = markedForReview[q.id];
                return (
                  <div key={q.id} className={`bg-zinc-900/60 border rounded-2xl p-4 transition-all ${answers[q.id] ? "border-zinc-700" : "border-zinc-800"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Chỗ trống {qIdx + 1}</span>
                        <h4 className="font-medium text-zinc-300 text-sm mt-0.5">{q.question_text || "Điền vào chỗ trống thích hợp"}</h4>
                      </div>
                      <button onClick={() => toggleMark(q.id)}
                        className={`shrink-0 ml-2 px-2 py-1 rounded-lg text-sm transition-colors ${isMarked ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
                        <Star className={`w-4 h-4 ${isMarked ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(opt => {
                        const isSelected = answers[q.id] === opt.id;
                        return (
                          <button key={opt.id} onClick={() => handleSelectAnswer(q.id, opt.id)}
                            className={`p-3 rounded-xl border flex items-center gap-2 transition-all text-sm ${
                              isSelected ? "bg-emerald-600/20 border-emerald-500 text-white" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                            }`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-emerald-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                              {opt.option_label}
                            </span>
                            <span className="text-left break-words">{opt.option_text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Passage Navigation ── */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <button onClick={goPrevGroup} disabled={currentGroupIndex === 0}
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-40 text-sm flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            <span>Đoạn trước</span>
          </button>
          <div className="flex gap-2">
            {groups.map((g, idx) => {
              const answered = g.questions.every(q => answers[q.id] !== undefined);
              const hasMarked = g.questions.some(q => markedForReview[q.id]);
              return (
                <button key={idx} onClick={() => { setCurrentGroupIndex(idx); setCurrentQInGroup(0); }}
                  title={`Đoạn ${idx + 1}${hasMarked ? " (Đã đánh dấu)" : ""}`}
                  className={`relative w-9 h-9 rounded-lg font-bold text-xs transition-colors ${
                    currentGroupIndex === idx ? "bg-emerald-600 text-white" : answered ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                  }`}>
                  {idx + 1}
                  {hasMarked && <span className="absolute -top-1 -right-1 text-amber-400"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /></span>}
                </button>
              );
            })}
          </div>
          <button onClick={goNextGroup} disabled={currentGroupIndex === groups.length - 1}
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-40 text-sm flex items-center gap-1.5">
            <span>Đoạn tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── REVIEW SCREEN ──────────────────────────────────────────────
  if (screen === "review" && reviewData && session) {
    const groups = session.groups;
    const currentGroup = groups[currentGroupIndex];
    const accuracy = Math.round((reviewData.correct / reviewData.total) * 100);

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">

        {/* ── Review Header ── */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white shadow-lg ${accuracy >= 80 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : accuracy >= 60 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-rose-500 to-red-600"}`}>
              <span className="text-lg font-extrabold leading-tight">{reviewData.correct}/{reviewData.total}</span>
              <span className="text-[9px] opacity-80">câu đúng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả bài làm</h2>
              <p className="text-zinc-400 text-sm">Độ chính xác: <span className={`font-bold ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-amber-400" : "text-rose-400"}`}>{accuracy}%</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHighlightGrammar(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${highlightGrammar ? "bg-purple-600/30 text-purple-300 border border-purple-600/40" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              <Search className="w-3.5 h-3.5" />
              <span>Ngữ cảnh ngữ pháp</span>
            </button>
            <button onClick={() => setShowCohesionPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showCohesionPanel ? "bg-amber-600/30 text-amber-300 border border-amber-600/40" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Thiết bị liên kết</span>
            </button>
            <button onClick={() => setScreen("config")} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition">
              <RotateCcw className="w-4 h-4" />
              <span>Luyện lại</span>
            </button>
          </div>
        </div>

        {/* Cohesion devices legend */}
        {showCohesionPanel && (
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-4 mb-5">
            <h4 className="text-amber-300 font-bold text-sm mb-3 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4" />
              <span>Thiết bị liên kết (Cohesion Devices) — được tô vàng trong đoạn văn</span>
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(COHESION_DEVICES).map(([type, words]) => (
                <div key={type} className="bg-amber-900/20 rounded-xl p-2.5">
                  <p className="text-amber-400 font-bold text-[11px] mb-1">{type}</p>
                  <p className="text-amber-200/70 text-[11px] leading-relaxed">{words.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passage tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {groups.map((g, idx) => {
            const correctCount = g.questions.filter(q => reviewData.answers.find(a => a.questionId === q.id)?.isCorrect).length;
            const perfect = correctCount === g.questions.length;
            return (
              <button key={idx} onClick={() => setCurrentGroupIndex(idx)}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
                  currentGroupIndex === idx ? "border-white" : "border-transparent"
                } ${perfect ? "bg-emerald-900/30 text-emerald-400" : "bg-rose-900/20 text-rose-400"}`}>
                Đoạn {idx + 1} ({correctCount}/{g.questions.length})
              </button>
            );
          })}
        </div>

        {/* Main review body */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 items-start">

          {/* Left: Passage with cohesion highlight */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-800/60 px-5 py-3 border-b border-zinc-700 flex items-center gap-2">
              <h3 className="text-white font-bold text-sm flex-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Đoạn văn đầy đủ</span>
              </h3>
              {showCohesionPanel && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Cohesion đã bật</span>}
              {highlightGrammar && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Ngữ pháp đã bật</span>}
            </div>
            <div className="p-5 text-zinc-200 leading-relaxed overflow-y-auto max-h-[55vh] text-sm lg:text-[15px] font-serif">
              {currentGroup?.passage ? (
                showCohesionPanel
                  ? highlightCohesion(currentGroup.passage)
                  : currentGroup.passage
              ) : (
                <p className="text-zinc-500 italic">Không có nội dung.</p>
              )}
            </div>
          </div>

          {/* Right: Q&A with explanations */}
          <div className="flex flex-col space-y-4 overflow-y-auto max-h-[70vh]">
            {currentGroup?.questions.map((q, qIdx) => {
              const resultItem = reviewData.answers.find(a => a.questionId === q.id);
              const isMarked = markedForReview[q.id];
              const correct = resultItem?.isCorrect;

              return (
                <div key={q.id} className={`bg-zinc-900/60 border rounded-2xl overflow-hidden ${correct ? "border-emerald-800/40" : "border-rose-800/40"}`}>
                  {/* Header */}
                  <div className={`px-4 py-3 border-b flex items-center gap-2 ${correct ? "bg-emerald-900/20 border-emerald-800/30" : "bg-rose-900/20 border-rose-800/30"}`}>
                    <span className={`font-bold text-sm flex items-center gap-1 ${correct ? "text-emerald-400" : "text-rose-400"}`}>
                      {correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>Chỗ trống {qIdx + 1}</span>
                    </span>
                    {isMarked && <span className="text-amber-400 text-xs flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" /> Đánh dấu</span>}
                    <span className="text-zinc-500 text-xs ml-auto">{q.question_text}</span>
                  </div>

                  {/* Options */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(opt => {
                        const isUserChoice = resultItem?.optionId === opt.id;
                        let cls = "bg-zinc-800/50 border-zinc-700 text-zinc-400";
                        let iconCls = "bg-zinc-700 text-zinc-400";
                        if (isUserChoice && correct) {
                          cls = "bg-emerald-900/40 border-emerald-500/50 text-emerald-300";
                          iconCls = "bg-emerald-600 text-white";
                        } else if (isUserChoice && !correct) {
                          cls = "bg-rose-900/40 border-rose-500/50 text-rose-300";
                          iconCls = "bg-rose-600 text-white";
                        }
                        return (
                          <div key={opt.id} className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${cls}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${iconCls}`}>{opt.option_label}</span>
                            <span className="break-words">{opt.option_text}</span>
                            {isUserChoice && correct && <CheckCircle2 className="ml-auto shrink-0 text-emerald-400 w-4 h-4" />}
                            {isUserChoice && !correct && <XCircle className="ml-auto shrink-0 text-rose-400 w-4 h-4" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation ? (
                      <div className={`rounded-xl p-3 text-xs leading-relaxed ${highlightGrammar ? "bg-purple-950/40 border border-purple-800/30" : "bg-indigo-950/30 border border-indigo-900/30"}`}>
                        <h5 className={`font-bold uppercase mb-1 text-[10px] flex items-center gap-1.5 ${highlightGrammar ? "text-purple-400" : "text-indigo-400"}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{highlightGrammar ? "Giải thích ngữ pháp" : "Giải thích"}</span>
                        </h5>
                        <p className={`${highlightGrammar ? "text-purple-100/70" : "text-indigo-100/70"}`}
                          dangerouslySetInnerHTML={{ __html: q.explanation.replace(/\n/g, "<br/>") }} />
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600 italic">Không có giải thích.</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setAddedNotes(p => ({ ...p, [q.id]: true }));
                          alert(`Đã thêm câu ${qIdx + 1} vào Sổ tay ghi chú!`);
                        }}
                        className={`flex-1 py-1.5 text-[11px] rounded-lg transition font-medium flex items-center justify-center gap-1 ${addedNotes[q.id] ? "bg-indigo-900/40 text-indigo-400 border border-indigo-800/30" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}`}>
                        {addedNotes[q.id] ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Đã thêm ghi chú</span>
                          </>
                        ) : (
                          <span>Thêm ghi chú</span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowCohesionPanel(p => !p)}
                        className="flex-1 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition font-medium flex items-center justify-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>Thiết bị liên kết</span>
                      </button>
                    </div>
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
