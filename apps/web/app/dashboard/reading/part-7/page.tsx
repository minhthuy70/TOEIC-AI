"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  startPractice,
  submitPractice,
  PracticeStartResponse,
  SubmitPracticeResponse,
  PracticeGroup,
} from "@/services/practice";

type ScreenState = "config" | "practice" | "review";
type PracticeType = "single" | "multiple";
type ViewMode = "split" | "compare"; // for multiple passages

// ─── Types ──────────────────────────────────────────────────────────────
interface HighlightRange {
  start: number;
  end: number;
  color: string;
  note?: string;
}

interface PassageNote {
  id: string;
  text: string;
  createdAt: string;
}

const HIGHLIGHT_COLORS = [
  { name: "Vàng", value: "bg-yellow-400/40 text-yellow-200", border: "border-yellow-500/40" },
  { name: "Xanh lá", value: "bg-emerald-400/30 text-emerald-200", border: "border-emerald-500/40" },
  { name: "Xanh dương", value: "bg-blue-400/30 text-blue-200", border: "border-blue-500/40" },
  { name: "Hồng", value: "bg-rose-400/30 text-rose-200", border: "border-rose-500/40" },
];

// ─── Highlightable Passage Component ────────────────────────────────────
function HighlightablePassage({
  text,
  highlights,
  onAddHighlight,
  fontSize,
  evidenceText,
}: {
  text: string;
  highlights: HighlightRange[];
  onAddHighlight: (start: number, end: number) => void;
  fontSize: number;
  evidenceText?: string;
}) {
  const passageRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !passageRef.current) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(passageRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    const end = start + range.toString().length;

    if (start < end) {
      onAddHighlight(start, end);
      selection.removeAllRanges();
    }
  };

  // Build highlighted segments
  const segments: { text: string; highlighted: boolean; color?: string }[] = [];
  if (highlights.length === 0) {
    segments.push({ text, highlighted: false });
  } else {
    let lastIdx = 0;
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    for (const h of sorted) {
      if (h.start > lastIdx) segments.push({ text: text.slice(lastIdx, h.start), highlighted: false });
      segments.push({ text: text.slice(h.start, h.end), highlighted: true, color: h.color });
      lastIdx = h.end;
    }
    if (lastIdx < text.length) segments.push({ text: text.slice(lastIdx), highlighted: false });
  }

  return (
    <div
      ref={passageRef}
      onMouseUp={handleMouseUp}
      className="leading-relaxed select-text cursor-text whitespace-pre-wrap font-serif"
      style={{ fontSize: `${fontSize}px` }}
    >
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark key={i} className={`${seg.color} rounded px-0.5 not-italic`}>{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
      {evidenceText && (
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-800/30 rounded-xl">
          <p className="text-[11px] text-indigo-400 font-bold uppercase mb-1">🔍 Bằng chứng trong văn bản</p>
          <p className="text-indigo-200/80 text-xs italic">"{evidenceText}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function Part7PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");

  // Config
  const [practiceType, setPracticeType] = useState<PracticeType>("single");
  const [count, setCount] = useState(3);
  const [isTimed, setIsTimed] = useState(true);

  // Practice
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<SubmitPracticeResponse | null>(null);

  // Passage tools
  const [fontSize, setFontSize] = useState(15);
  const [highlights, setHighlights] = useState<Record<number, HighlightRange[]>>({});
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [passageNotes, setPassageNotes] = useState<Record<number, PassageNote[]>>({});
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);

  // Multiple passage
  const [activePassageTab, setActivePassageTab] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [multiSetSize] = useState(2); // group 2 passages per set for "multiple" mode

  // Review
  const [showEvidence, setShowEvidence] = useState<Record<number, boolean>>({});

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
      const res = await startPractice(7, count);
      setSession(res);
      setAnswers({});
      setMarkedForReview({});
      setCurrentGroupIndex(0);
      setCurrentQIndex(0);
      setActivePassageTab(0);
      setHighlights({});
      setPassageNotes({});
      if (isTimed) {
        // Part 7: ~75 secs per question (more reading required)
        setTimeRemaining(res.questionCount * 75);
      }
      setScreen("practice");
    } catch {
      alert("Lỗi khi tải bài tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optId: number) => {
    setAnswers(p => ({ ...p, [qId]: optId }));
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
      setCurrentQIndex(0);
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

  const addHighlight = (groupId: number, start: number, end: number) => {
    setHighlights(p => ({
      ...p,
      [groupId]: [...(p[groupId] || []), { start, end, color: selectedColor }],
    }));
  };

  const addNote = (groupId: number) => {
    if (!noteInput.trim()) return;
    const note: PassageNote = { id: Date.now().toString(), text: noteInput.trim(), createdAt: new Date().toLocaleTimeString() };
    setPassageNotes(p => ({ ...p, [groupId]: [...(p[groupId] || []), note] }));
    setNoteInput("");
    setShowNoteInput(false);
  };

  const removeNote = (groupId: number, noteId: string) => {
    setPassageNotes(p => ({ ...p, [groupId]: (p[groupId] || []).filter(n => n.id !== noteId) }));
  };

  // For multiple passage mode, get sets of groups
  const getMultipleSets = (groups: PracticeGroup[]) => {
    const sets: PracticeGroup[][] = [];
    for (let i = 0; i < groups.length; i += multiSetSize) {
      sets.push(groups.slice(i, i + multiSetSize));
    }
    return sets;
  };

  // ─── CONFIG SCREEN ────────────────────────────────────────────────────
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/reading" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Part 7: Đọc hiểu</h1>
            <p className="text-zinc-400 text-sm">Reading Comprehension — Cấu hình bài luyện tập</p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          {/* Practice type */}
          <div>
            <h3 className="text-white font-bold mb-4">Loại bài tập</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => setPracticeType("single")}
                className={`px-5 py-5 rounded-xl font-bold transition-all flex flex-col gap-2 text-left border-2 ${practiceType === "single" ? "bg-amber-600/20 border-amber-500 text-white" : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <span className="text-2xl">📄</span>
                <span>Đoạn văn đơn</span>
                <span className="text-xs font-normal opacity-70">Single Passage — 1 bài đọc, 2-4 câu hỏi</span>
              </button>
              <button onClick={() => setPracticeType("multiple")}
                className={`px-5 py-5 rounded-xl font-bold transition-all flex flex-col gap-2 text-left border-2 ${practiceType === "multiple" ? "bg-purple-600/20 border-purple-500 text-white" : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                <span className="text-2xl">📑</span>
                <span>Đoạn văn kép</span>
                <span className="text-xs font-normal opacity-70">Multiple Passages — 2-3 bài đọc liên quan</span>
              </button>
            </div>
          </div>

          {/* Count */}
          <div>
            <h3 className="text-white font-bold mb-4">
              {practiceType === "single" ? "Số đoạn văn" : "Số bộ đoạn văn"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {practiceType === "single"
                ? [2, 3, 5, 10].map(c => (
                  <button key={c} onClick={() => setCount(c)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                    {c} đoạn
                  </button>
                ))
                : [1, 2, 3, 5].map(c => (
                  <button key={c} onClick={() => setCount(c * multiSetSize)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c * multiSetSize ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                    {c} bộ
                  </button>
                ))
              }
            </div>
          </div>

          {/* Timer */}
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsTimed(true)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isTimed ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                ⏳ Giới hạn thời gian
              </button>
              <button onClick={() => setIsTimed(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${!isTimed ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                ♾️ Không giới hạn
              </button>
            </div>
          </div>

          <button onClick={handleStart} disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-extrabold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${practiceType === "single" ? "bg-amber-600 hover:bg-amber-500" : "bg-purple-600 hover:bg-purple-500"}`}>
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ─────────────────────────────────────────────────
  if (screen === "practice" && session) {
    const groups = session.groups;
    const totalQ = groups.flatMap(g => g.questions).length;
    const totalAnswered = Object.keys(answers).length;

    // ── SINGLE PASSAGE PRACTICE ──
    if (practiceType === "single") {
      const currentGroup = groups[currentGroupIndex];
      const currentQuestion = currentGroup?.questions[currentQIndex];
      const groupHighlights = highlights[currentGroup?.id] || [];
      const groupNotes = passageNotes[currentGroup?.id] || [];

      return (
        <div className="max-w-6xl mx-auto py-4 px-4 flex flex-col min-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-2xl mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => { if (confirm("Thoát?")) setScreen("config"); }} className="text-zinc-400 hover:text-white text-sm">✕ Thoát</button>
              <div className="h-5 w-px bg-zinc-800" />
              <span className="font-bold text-white text-sm">Đoạn {currentGroupIndex + 1}/{groups.length}</span>
              <span className="text-zinc-500 text-xs">Câu {currentQIndex + 1}/{currentGroup?.questions.length}</span>
              <span className="hidden sm:inline text-zinc-600 text-xs">({totalAnswered}/{totalQ} đã trả lời)</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Font size */}
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
                <button onClick={() => setFontSize(s => Math.max(12, s - 1))} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center font-bold text-lg">−</button>
                <span className="text-zinc-300 text-xs w-6 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(22, s + 1))} className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center font-bold text-lg">+</button>
              </div>
              {/* Highlight */}
              <button onClick={() => setShowHighlightToolbar(p => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${showHighlightToolbar ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                🖊 Highlight
              </button>
              {/* Note */}
              <button onClick={() => setShowNoteInput(p => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${showNoteInput ? "bg-indigo-600/30 text-indigo-300 border border-indigo-600/40" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                📝 Ghi chú
              </button>
              {isTimed && timeRemaining !== null && (
                <span className={`font-mono font-bold text-sm ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>
                  ⏳ {formatTime(timeRemaining)}
                </span>
              )}
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg disabled:opacity-50">
                {submitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
          </div>

          {/* Highlight toolbar */}
          {showHighlightToolbar && (
            <div className="flex items-center gap-2 mb-3 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-zinc-400 text-xs font-bold">Màu highlight:</span>
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c.value} onClick={() => setSelectedColor(c.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${selectedColor === c.value ? "opacity-100 scale-110 " + c.border : "opacity-60 border-transparent"} ${c.value}`}>
                  {c.name}
                </button>
              ))}
              <span className="text-zinc-500 text-xs ml-2">← Chọn màu rồi bôi đen văn bản để highlight</span>
            </div>
          )}

          {/* Note input */}
          {showNoteInput && (
            <div className="flex gap-2 mb-3">
              <input
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addNote(currentGroup?.id); }}
                placeholder="Nhập ghi chú cho đoạn văn này..."
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={() => addNote(currentGroup?.id)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl">Lưu</button>
            </div>
          )}

          {/* Saved notes */}
          {groupNotes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {groupNotes.map(note => (
                <div key={note.id} className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-800/30 rounded-lg px-3 py-1.5">
                  <span className="text-indigo-300 text-xs">📝 {note.text}</span>
                  <button onClick={() => removeNote(currentGroup?.id, note.id)} className="text-zinc-600 hover:text-rose-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Main: passage + questions */}
          <div className="flex-1 grid lg:grid-cols-2 gap-5 overflow-hidden">
            {/* Left: Passage */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="bg-zinc-800/60 px-4 py-2.5 border-b border-zinc-700">
                <h3 className="text-white font-bold text-sm">📄 {currentGroup?.title || `Đoạn văn ${currentGroupIndex + 1}`}</h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                {currentGroup?.passage ? (
                  <HighlightablePassage
                    text={currentGroup.passage}
                    highlights={groupHighlights}
                    onAddHighlight={(s, e) => addHighlight(currentGroup.id, s, e)}
                    fontSize={fontSize}
                  />
                ) : (
                  <p className="text-zinc-500 italic text-sm">Không có nội dung đoạn văn.</p>
                )}
              </div>
            </div>

            {/* Right: Questions */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Question navigation dots */}
              <div className="flex gap-2 flex-wrap">
                {currentGroup?.questions.map((q, i) => (
                  <button key={q.id} onClick={() => setCurrentQIndex(i)}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors ${
                      currentQIndex === i ? "bg-amber-600 text-white" :
                      markedForReview[q.id] ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                      answers[q.id] ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Current question */}
              {currentQuestion && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-medium leading-relaxed">{currentQuestion.question_text || "Câu hỏi"}</h4>
                    <button onClick={() => toggleMark(currentQuestion.id)}
                      className={`shrink-0 px-2 py-1 rounded-lg text-sm transition-colors ${markedForReview[currentQuestion.id] ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
                      {markedForReview[currentQuestion.id] ? "★" : "☆"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentQuestion.options.map(opt => {
                      const isSelected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button key={opt.id} onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                          className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                            isSelected ? "bg-amber-600/20 border-amber-500 text-white scale-[1.01]" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                          }`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? "bg-amber-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                            {opt.option_label}
                          </span>
                          <span className="break-words">{opt.option_text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Prev/Next Q */}
                  <div className="flex justify-between">
                    <button onClick={() => setCurrentQIndex(i => i - 1)} disabled={currentQIndex === 0}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40">
                      ← Trước
                    </button>
                    <button onClick={() => setCurrentQIndex(i => i + 1)} disabled={currentQIndex === (currentGroup?.questions.length || 1) - 1}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40">
                      Tiếp →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Passage Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <button onClick={() => { setCurrentGroupIndex(i => i - 1); setCurrentQIndex(0); }} disabled={currentGroupIndex === 0}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">
              ← Đoạn trước
            </button>
            <div className="flex gap-2">
              {groups.map((g, idx) => {
                const allAnswered = g.questions.every(q => answers[q.id]);
                const hasMarked = g.questions.some(q => markedForReview[q.id]);
                return (
                  <button key={idx} onClick={() => { setCurrentGroupIndex(idx); setCurrentQIndex(0); }}
                    className={`relative w-9 h-9 rounded-lg font-bold text-xs transition-all ${currentGroupIndex === idx ? "bg-amber-600 text-white" : allAnswered ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>
                    {idx + 1}
                    {hasMarked && <span className="absolute -top-1 -right-1 text-amber-400 text-[9px]">★</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setCurrentGroupIndex(i => i + 1); setCurrentQIndex(0); }} disabled={currentGroupIndex === groups.length - 1}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">
              Đoạn tiếp →
            </button>
          </div>
        </div>
      );
    }

    // ── MULTIPLE PASSAGE PRACTICE ──
    const sets = getMultipleSets(groups);
    const currentSetIndex = currentGroupIndex;
    const currentSet = sets[currentSetIndex] || [];
    const allSetQuestions = currentSet.flatMap(g => g.questions);
    const currentQuestion = allSetQuestions[currentQIndex];

    return (
      <div className="max-w-6xl mx-auto py-4 px-4 flex flex-col min-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-2xl mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => { if (confirm("Thoát?")) setScreen("config"); }} className="text-zinc-400 hover:text-white text-sm">✕ Thoát</button>
            <div className="h-5 w-px bg-zinc-800" />
            <span className="font-bold text-white text-sm">Bộ {currentSetIndex + 1}/{sets.length}</span>
            <span className="text-zinc-500 text-xs">({currentSet.length} đoạn văn)</span>
            <span className="hidden sm:inline text-zinc-600 text-xs">({totalAnswered}/{totalQ} đã trả lời)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setViewMode(v => v === "split" ? "compare" : "split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "compare" ? "bg-purple-600/30 text-purple-300 border border-purple-600/40" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {viewMode === "compare" ? "⧉ So sánh" : "⧉ So sánh"}
            </button>
            <button onClick={() => setFontSize(s => Math.max(12, s - 1))} className="w-7 h-7 bg-zinc-800 rounded text-white text-sm flex items-center justify-center hover:bg-zinc-700">−</button>
            <span className="text-zinc-400 text-xs">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(22, s + 1))} className="w-7 h-7 bg-zinc-800 rounded text-white text-sm flex items-center justify-center hover:bg-zinc-700">+</button>
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold text-sm ${timeRemaining < 60 ? "text-rose-500" : "text-purple-400"}`}>
                ⏳ {formatTime(timeRemaining)}
              </span>
            )}
            <button onClick={handleSubmit} disabled={submitting}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* Passages: tab or compare mode */}
        <div className={`flex-1 flex flex-col gap-4 overflow-hidden ${viewMode === "compare" ? "" : ""}`}>
          {viewMode === "compare" ? (
            /* COMPARE VIEW: passages side by side */
            <div className={`grid gap-4 overflow-hidden`} style={{ gridTemplateColumns: `repeat(${currentSet.length}, 1fr)` }}>
              {currentSet.map((g, idx) => (
                <div key={g.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden max-h-[45vh]">
                  <div className="bg-zinc-800/60 px-3 py-2 border-b border-zinc-700 flex items-center gap-2">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Đoạn {idx + 1}</span>
                    <span className="text-white text-xs font-bold">{g.title || `Passage ${idx + 1}`}</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <HighlightablePassage
                      text={g.passage || ""}
                      highlights={highlights[g.id] || []}
                      onAddHighlight={(s, e) => addHighlight(g.id, s, e)}
                      fontSize={fontSize}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* SPLIT VIEW: tabs for passages */
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden max-h-[48vh]">
              {/* Tabs */}
              <div className="flex bg-zinc-800/60 border-b border-zinc-700">
                {currentSet.map((g, idx) => (
                  <button key={g.id} onClick={() => setActivePassageTab(idx)}
                    className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${activePassageTab === idx ? "border-purple-500 text-purple-300 bg-purple-900/10" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
                    📄 Đoạn {idx + 1}{g.title ? ` — ${g.title.slice(0, 20)}` : ""}
                  </button>
                ))}
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                {currentSet[activePassageTab] && (
                  <HighlightablePassage
                    text={currentSet[activePassageTab].passage || ""}
                    highlights={highlights[currentSet[activePassageTab].id] || []}
                    onAddHighlight={(s, e) => addHighlight(currentSet[activePassageTab].id, s, e)}
                    fontSize={fontSize}
                  />
                )}
              </div>
            </div>
          )}

          {/* Questions for the set */}
          <div className="flex flex-col gap-4">
            {/* Q dots */}
            <div className="flex gap-2 flex-wrap">
              {allSetQuestions.map((q, i) => {
                // Which passage does this question belong to?
                const passageIdx = currentSet.findIndex(g => g.questions.some(qq => qq.id === q.id));
                return (
                  <button key={q.id} onClick={() => setCurrentQIndex(i)}
                    title={`Câu ${i + 1} (Đoạn ${passageIdx + 1})`}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors relative ${
                      currentQIndex === i ? "bg-purple-600 text-white" :
                      markedForReview[q.id] ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                      answers[q.id] ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}>
                    {i + 1}
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-bold ${passageIdx === 0 ? "bg-amber-500" : passageIdx === 1 ? "bg-blue-500" : "bg-emerald-500"}`}>
                      {passageIdx + 1}
                    </span>
                  </button>
                );
              })}
              <span className="text-zinc-600 text-[10px] self-center ml-2">● Số góc = đoạn văn nguồn</span>
            </div>

            {currentQuestion && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">
                      Câu {currentQIndex + 1} — liên quan đến Đoạn {currentSet.findIndex(g => g.questions.some(q => q.id === currentQuestion.id)) + 1}
                    </p>
                    <h4 className="text-white font-medium leading-relaxed">{currentQuestion.question_text || "Câu hỏi"}</h4>
                  </div>
                  <button onClick={() => toggleMark(currentQuestion.id)}
                    className={`shrink-0 px-2 py-1 rounded-lg text-sm ${markedForReview[currentQuestion.id] ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
                    {markedForReview[currentQuestion.id] ? "★" : "☆"}
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {currentQuestion.options.map(opt => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    return (
                      <button key={opt.id} onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-sm text-left ${
                          isSelected ? "bg-purple-600/20 border-purple-500 text-white" : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        }`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-purple-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                          {opt.option_label}
                        </span>
                        {opt.option_text}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setCurrentQIndex(i => i - 1)} disabled={currentQIndex === 0}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40">← Trước</button>
                  <button onClick={() => setCurrentQIndex(i => i + 1)} disabled={currentQIndex === allSetQuestions.length - 1}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40">Tiếp →</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Set Navigation */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <button onClick={() => { setCurrentGroupIndex(i => i - 1); setCurrentQIndex(0); setActivePassageTab(0); }} disabled={currentSetIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">
            ← Bộ trước
          </button>
          <div className="flex gap-2">
            {sets.map((_, idx) => {
              const setQs = sets[idx].flatMap(g => g.questions);
              const allAnswered = setQs.every(q => answers[q.id]);
              return (
                <button key={idx} onClick={() => { setCurrentGroupIndex(idx); setCurrentQIndex(0); setActivePassageTab(0); }}
                  className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${currentSetIndex === idx ? "bg-purple-600 text-white" : allAnswered ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <button onClick={() => { setCurrentGroupIndex(i => i + 1); setCurrentQIndex(0); setActivePassageTab(0); }} disabled={currentSetIndex === sets.length - 1}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm disabled:opacity-40">
            Bộ tiếp →
          </button>
        </div>
      </div>
    );
  }

  // ─── REVIEW SCREEN ────────────────────────────────────────────────────
  if (screen === "review" && reviewData && session) {
    const groups = session.groups;
    const accuracy = Math.round((reviewData.correct / reviewData.total) * 100);
    const sets = practiceType === "multiple" ? getMultipleSets(groups) : null;

    const currentGroup = practiceType === "single" ? groups[currentGroupIndex] : null;
    const currentSet = sets ? sets[currentGroupIndex] : null;
    const displayGroups = currentGroup ? [currentGroup] : (currentSet || []);
    const allQsInView = displayGroups.flatMap(g => g.questions);
    const currentQuestion = allQsInView[currentQIndex];

    return (
      <div className="max-w-6xl mx-auto py-4 px-4 flex flex-col min-h-[90vh]">
        {/* Review Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white shadow-lg ${accuracy >= 80 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : accuracy >= 60 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-rose-500 to-red-600"}`}>
              <span className="text-sm font-extrabold leading-tight">{reviewData.correct}/{reviewData.total}</span>
              <span className="text-[9px] opacity-80">đúng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả bài làm</h2>
              <p className="text-zinc-400 text-sm">Độ chính xác: <span className={`font-bold ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-amber-400" : "text-rose-400"}`}>{accuracy}%</span></p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm">
            Luyện tập lại
          </button>
        </div>

        {/* Group/Set Navigation Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(sets || groups.map(g => [g])).map((item, idx) => {
            const qs = Array.isArray(item) ? (item as PracticeGroup[]).flatMap(g => g.questions) : [(item as PracticeGroup)].flatMap(g => g.questions);
            const correctCnt = qs.filter(q => reviewData.answers.find(a => a.questionId === q.id)?.isCorrect).length;
            const perfect = correctCnt === qs.length;
            return (
              <button key={idx} onClick={() => { setCurrentGroupIndex(idx); setCurrentQIndex(0); }}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${currentGroupIndex === idx ? "border-white" : "border-transparent"} ${perfect ? "bg-emerald-900/30 text-emerald-400" : "bg-rose-900/20 text-rose-400"}`}>
                {practiceType === "single" ? `Đoạn ${idx + 1}` : `Bộ ${idx + 1}`} ({correctCnt}/{qs.length})
              </button>
            );
          })}
        </div>

        {/* Main review content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5 items-start overflow-hidden">
          {/* Left: Passage(s) with highlights restored */}
          <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
            {displayGroups.map((g, idx) => (
              <div key={g.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-zinc-800/60 px-4 py-2.5 border-b border-zinc-700 flex items-center gap-2">
                  {displayGroups.length > 1 && <span className="text-[10px] text-purple-400 font-bold">Đoạn {idx + 1}</span>}
                  <h3 className="text-white font-bold text-sm">{g.title || `Passage ${idx + 1}`}</h3>
                </div>
                <div className="p-5 overflow-y-auto max-h-60">
                  <HighlightablePassage
                    text={g.passage || ""}
                    highlights={highlights[g.id] || []}
                    onAddHighlight={() => {}}
                    fontSize={fontSize}
                  />
                </div>
              </div>
            ))}
            {/* Saved notes for current group */}
            {currentGroup && (passageNotes[currentGroup.id] || []).length > 0 && (
              <div className="bg-indigo-950/20 border border-indigo-800/20 rounded-xl p-3">
                <p className="text-indigo-400 text-xs font-bold mb-2">📝 Ghi chú của bạn</p>
                {(passageNotes[currentGroup.id] || []).map(n => (
                  <p key={n.id} className="text-indigo-200/70 text-xs mb-1">• {n.text}</p>
                ))}
              </div>
            )}
          </div>

          {/* Right: Questions with answers */}
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[75vh]">
            {/* Q navigator */}
            <div className="flex gap-1.5 flex-wrap">
              {allQsInView.map((q, i) => {
                const r = reviewData.answers.find(a => a.questionId === q.id);
                return (
                  <button key={q.id} onClick={() => setCurrentQIndex(i)}
                    className={`w-9 h-9 rounded-lg font-bold text-xs border-2 transition ${currentQIndex === i ? "border-white" : "border-transparent"} ${r?.isCorrect ? "bg-emerald-800/40 text-emerald-400" : "bg-rose-800/30 text-rose-400"}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {currentQuestion && (() => {
              const resultItem = reviewData.answers.find(a => a.questionId === currentQuestion.id);
              const isCorrect = resultItem?.isCorrect;
              const passageIdx = displayGroups.findIndex(g => g.questions.some(q => q.id === currentQuestion.id));
              return (
                <div className={`bg-zinc-900/60 border rounded-2xl overflow-hidden ${isCorrect ? "border-emerald-800/40" : "border-rose-800/40"}`}>
                  <div className={`px-4 py-3 border-b flex items-center gap-2 flex-wrap ${isCorrect ? "bg-emerald-900/20 border-emerald-800/30" : "bg-rose-900/20 border-rose-800/30"}`}>
                    <span className={`font-bold text-sm ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>{isCorrect ? "✓" : "✗"} Câu {currentQIndex + 1}</span>
                    {markedForReview[currentQuestion.id] && <span className="text-amber-400 text-xs">★ Đánh dấu</span>}
                    {displayGroups.length > 1 && <span className="text-purple-400 text-xs ml-auto">Đoạn {passageIdx + 1}</span>}
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-white text-sm font-medium">{currentQuestion.question_text}</p>
                    <div className="space-y-2">
                      {currentQuestion.options.map(opt => {
                        const isUserChoice = resultItem?.optionId === opt.id;
                        let cls = "bg-zinc-800/50 border-zinc-700 text-zinc-400";
                        let iconCls = "bg-zinc-700 text-zinc-400";
                        if (isUserChoice && isCorrect) { cls = "bg-emerald-900/40 border-emerald-500/50 text-emerald-300"; iconCls = "bg-emerald-600 text-white"; }
                        else if (isUserChoice && !isCorrect) { cls = "bg-rose-900/40 border-rose-500/50 text-rose-300"; iconCls = "bg-rose-600 text-white"; }
                        return (
                          <div key={opt.id} className={`p-3 rounded-xl border flex items-center gap-3 text-sm ${cls}`}>
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${iconCls}`}>{opt.option_label}</span>
                            <span className="break-words flex-1">{opt.option_text}</span>
                            {isUserChoice && <span>{isCorrect ? "✓" : "✗"}</span>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Explanation */}
                    {currentQuestion.explanation && (
                      <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3">
                        <h5 className="text-indigo-400 font-bold text-[11px] uppercase mb-2">📖 Giải thích</h5>
                        <p className="text-indigo-100/70 text-xs leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: currentQuestion.explanation.replace(/\n/g, "<br/>") }} />
                      </div>
                    )}
                    {/* Evidence toggle */}
                    <button onClick={() => setShowEvidence(p => ({ ...p, [currentQuestion.id]: !p[currentQuestion.id] }))}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition ${showEvidence[currentQuestion.id] ? "bg-amber-600/20 text-amber-300 border border-amber-600/30" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}`}>
                      🔍 {showEvidence[currentQuestion.id] ? "Ẩn" : "Xem"} bằng chứng trong văn bản
                    </button>
                    {showEvidence[currentQuestion.id] && (
                      <div className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-3">
                        <p className="text-amber-400 text-[11px] font-bold mb-1">🔗 Bằng chứng (từ giải thích)</p>
                        <p className="text-amber-200/70 text-xs leading-relaxed italic">
                          {currentQuestion.explanation
                            ? currentQuestion.explanation.slice(0, 200) + (currentQuestion.explanation.length > 200 ? "..." : "")
                            : "Không có bằng chứng cụ thể."}
                        </p>
                      </div>
                    )}
                    {/* Cross-reference for multiple */}
                    {practiceType === "multiple" && displayGroups.length > 1 && (
                      <div className="bg-purple-950/20 border border-purple-800/20 rounded-xl p-3">
                        <p className="text-purple-400 text-[11px] font-bold mb-1">⇄ Tham chiếu chéo (Cross-reference)</p>
                        <p className="text-purple-200/60 text-xs">Câu này liên quan đến <strong>Đoạn {passageIdx + 1}</strong>. Hãy đối chiếu với các đoạn văn khác để hiểu ngữ cảnh đầy đủ.</p>
                      </div>
                    )}
                    {/* Nav */}
                    <div className="flex justify-between pt-1">
                      <button onClick={() => setCurrentQIndex(i => i - 1)} disabled={currentQIndex === 0}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold disabled:opacity-40">← Trước</button>
                      <button onClick={() => setCurrentQIndex(i => i + 1)} disabled={currentQIndex === allQsInView.length - 1}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold disabled:opacity-40">Tiếp →</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
