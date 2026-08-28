"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse, PracticeGroup } from "@/services/practice";

type ScreenState = "config" | "practice" | "review";

export default function Part6PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");

  // Config state
  const [count, setCount] = useState<number>(2);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Practice state
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> optionId
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<SubmitPracticeResponse | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "practice" && isTimed && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => (prev ? prev - 1 : 0));
      }, 1000);
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
      if (isTimed) {
        // Part 6: ~45 seconds per question
        setTimeRemaining(res.questionCount * 45);
      }
      setScreen("practice");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải bài tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optId: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleMark = (qId: number) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

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
    } catch (err) {
      console.error(err);
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

  // ─── CONFIG SCREEN ─────────────────────────────────────────────
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/reading" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Part 6: Hoàn thành đoạn văn (Text Completion)</h1>
            <p className="text-zinc-400 text-sm">Cấu hình bài luyện tập</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Số đoạn văn (mỗi đoạn 4 câu)</h3>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 4, 8].map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                >
                  {c} đoạn
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsTimed(true)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isTimed ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
              >
                ⏳ Giới hạn thời gian
              </button>
              <button
                onClick={() => setIsTimed(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${!isTimed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
              >
                ♾️ Không giới hạn
              </button>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 text-white font-extrabold text-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ──────────────────────────────────────────
  if (screen === "practice" && session) {
    const groups = session.groups;
    const currentGroup = groups[currentGroupIndex];
    const totalQuestionsAnswered = Object.keys(answers).length;
    const allQuestionIds = groups.flatMap(g => g.questions.map(q => q.id));
    const totalQuestions = allQuestionIds.length;

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm("Thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white">✕ Thoát</button>
            <div className="h-6 w-px bg-zinc-800" />
            <span className="font-bold text-white">Đoạn {currentGroupIndex + 1} / {groups.length}</span>
            <span className="text-zinc-500 text-sm">({totalQuestionsAnswered}/{totalQuestions} câu đã trả lời)</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold text-lg ${timeRemaining < 60 ? 'text-rose-500' : 'text-amber-400'}`}>
                ⏳ {formatTime(timeRemaining)}
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* Main content: passage + questions side-by-side */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6">
          {/* Left: Passage */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="bg-zinc-800/60 px-5 py-3 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">📄 Đoạn văn {currentGroupIndex + 1}</h3>
              {currentGroup.title && (
                <span className="text-xs text-zinc-400 italic">{currentGroup.title}</span>
              )}
            </div>
            <div className="p-6 text-zinc-200 leading-relaxed flex-1 overflow-y-auto whitespace-pre-wrap text-sm lg:text-base font-serif">
              {currentGroup.passage ? (
                // Highlight blanks (---) in the passage
                currentGroup.passage.split(/(\s*_{2,}\s*|\s*---\s*)/g).map((part, i) =>
                  /_{2,}|---/.test(part) ? (
                    <span key={i} className="inline-block bg-amber-500/20 text-amber-400 px-2 py-0.5 mx-0.5 rounded border border-amber-500/40 font-bold text-sm">
                      ____
                    </span>
                  ) : part
                )
              ) : (
                <p className="text-zinc-500 italic">Không có nội dung đoạn văn.</p>
              )}
            </div>
          </div>

          {/* Right: Questions */}
          <div className="flex flex-col space-y-4 overflow-y-auto max-h-[70vh]">
            {currentGroup.questions.map((q, qIdx) => {
              const isMarked = markedForReview[q.id];
              return (
                <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-zinc-300 text-sm">Câu {qIdx + 1}: {q.question_text || "Điền vào chỗ trống"}</h4>
                    <button
                      onClick={() => toggleMark(q.id)}
                      title="Đánh dấu xem lại"
                      className={`shrink-0 ml-2 text-sm px-2 py-1 rounded-lg transition-colors ${isMarked ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {isMarked ? "★" : "☆"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(opt => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectAnswer(q.id, opt.id)}
                          className={`p-3 rounded-xl border flex items-center gap-2 transition-all text-sm ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-white'
                              : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-400'}`}>
                            {opt.option_label}
                          </span>
                          <span className="text-left break-words">{opt.option_text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setCurrentGroupIndex(prev => prev - 1)}
            disabled={currentGroupIndex === 0}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50"
          >
            ← Đoạn trước
          </button>
          <div className="flex gap-2">
            {groups.map((g, idx) => {
              const answered = g.questions.every(q => answers[q.id] !== undefined);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentGroupIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                    currentGroupIndex === idx ? 'bg-emerald-600 text-white' : answered ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentGroupIndex(prev => prev + 1)}
            disabled={currentGroupIndex === groups.length - 1}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50"
          >
            Đoạn tiếp →
          </button>
        </div>
      </div>
    );
  }

  // ─── REVIEW SCREEN ─────────────────────────────────────────────
  if (screen === "review" && reviewData && session) {
    const groups = session.groups;
    const currentGroup = groups[currentGroupIndex];

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        {/* Review Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
              <span className="text-lg font-extrabold leading-tight">{reviewData.correct}/{reviewData.total}</span>
              <span className="text-[10px] opacity-80">câu đúng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">Kết quả bài làm</h2>
              <p className="text-zinc-400 text-sm">Độ chính xác: {Math.round((reviewData.correct / reviewData.total) * 100)}%</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition">
            Luyện tập lại
          </button>
        </div>

        {/* Passage Navigation */}
        <div className="flex gap-2 mb-6">
          {groups.map((g, idx) => {
            const correctCount = g.questions.filter(q => reviewData.answers.find(a => a.questionId === q.id)?.isCorrect).length;
            const perfect = correctCount === g.questions.length;
            return (
              <button
                key={idx}
                onClick={() => setCurrentGroupIndex(idx)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 transition ${
                  currentGroupIndex === idx ? 'border-white' : 'border-transparent'
                } ${perfect ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/20 text-rose-400'}`}
              >
                Đoạn {idx + 1} ({correctCount}/{g.questions.length})
              </button>
            );
          })}
        </div>

        {/* Main review content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 items-start">
          {/* Left: Full passage with highlighted answers */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-zinc-800/60 px-5 py-3 border-b border-zinc-700">
              <h3 className="text-white font-bold text-sm">📄 Đoạn văn đầy đủ với đáp án</h3>
            </div>
            <div className="p-6 text-zinc-200 leading-relaxed flex-1 overflow-y-auto whitespace-pre-wrap text-sm lg:text-base font-serif">
              {currentGroup.passage || <p className="text-zinc-500 italic">Không có nội dung.</p>}
            </div>
          </div>

          {/* Right: Q&A and explanations */}
          <div className="flex flex-col space-y-4 overflow-y-auto max-h-[70vh]">
            {currentGroup.questions.map((q, qIdx) => {
              const resultItem = reviewData.answers.find(a => a.questionId === q.id);
              const isMarked = markedForReview[q.id];
              return (
                <div key={q.id} className={`bg-zinc-900/60 border rounded-2xl overflow-hidden ${resultItem?.isCorrect ? 'border-emerald-800/40' : 'border-rose-800/40'}`}>
                  <div className={`px-4 py-3 border-b ${resultItem?.isCorrect ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-rose-900/20 border-rose-800/30'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${resultItem?.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {resultItem?.isCorrect ? "✓" : "✗"} Câu {qIdx + 1}
                      </span>
                      {isMarked && <span className="text-amber-400 text-xs">★ Đánh dấu</span>}
                      {!resultItem?.isCorrect && resultItem?.optionLabel && (
                        <span className="text-zinc-400 text-xs ml-auto">Đáp án đúng: <span className="text-emerald-400 font-bold">{q.options.find(o => o.option_label?.toUpperCase() === q.options.find(oo => reviewData.answers.find(a => a.questionId === q.id)?.isCorrect === false && oo.id === reviewData.answers.find(a => a.questionId === q.id)?.optionId)?.option_label?.toUpperCase())?.option_label || "—"}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(opt => {
                        const isUserChoice = resultItem?.optionId === opt.id;
                        let cls = 'bg-zinc-800/50 border-zinc-700 text-zinc-400';
                        if (isUserChoice && resultItem?.isCorrect) cls = 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300';
                        else if (isUserChoice && !resultItem?.isCorrect) cls = 'bg-rose-900/40 border-rose-500/50 text-rose-300';
                        return (
                          <div key={opt.id} className={`p-2 rounded-lg border flex items-center gap-2 text-xs ${cls}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isUserChoice && resultItem?.isCorrect ? 'bg-emerald-600 text-white' :
                              isUserChoice ? 'bg-rose-600 text-white' : 'bg-zinc-700 text-zinc-400'
                            }`}>{opt.option_label}</span>
                            <span className="break-words">{opt.option_text}</span>
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3 mt-3">
                        <h5 className="text-indigo-400 font-bold text-[11px] uppercase mb-1">📖 Giải thích</h5>
                        <p className="text-indigo-100/70 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => alert("Tính năng highlight ngữ cảnh ngữ pháp đang được phát triển!")}
                        className="flex-1 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition font-medium"
                      >
                        🔍 Ngữ cảnh ngữ pháp
                      </button>
                      <button
                        onClick={() => alert("Đã thêm vào ghi chú!")}
                        className="flex-1 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition font-medium"
                      >
                        📝 Thêm ghi chú
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
