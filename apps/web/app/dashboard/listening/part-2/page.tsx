"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse } from "@/services/practice";
import AudioPlayer from "@/components/listening/AudioPlayer";
import {
  ArrowLeft,
  Timer,
  Infinity as InfinityIcon,
  X,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Check,
} from "lucide-react";

type ScreenState = "config" | "practice" | "review";
const Q_TYPES: Record<string, { label: string; color: string }> = {
  "wh": { label: "Wh-Question", color: "bg-indigo-600/20 text-indigo-400" },
  "yes-no": { label: "Yes/No Question", color: "bg-emerald-600/20 text-emerald-400" },
  "statement": { label: "Statement", color: "bg-amber-600/20 text-amber-400" },
};

function detectQuestionType(text: string): string {
  if (!text) return "statement";
  const lower = text.toLowerCase();
  if (lower.startsWith("who") || lower.startsWith("what") || lower.startsWith("when") || lower.startsWith("where") || lower.startsWith("why") || lower.startsWith("how")) return "wh";
  if (lower.startsWith("is") || lower.startsWith("are") || lower.startsWith("do") || lower.startsWith("does") || lower.startsWith("did") || lower.startsWith("can") || lower.startsWith("will")) return "yes-no";
  return "statement";
}

export default function Part2PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");
  const [count, setCount] = useState<number>(15);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<SubmitPracticeResponse | null>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "practice" && isTimed && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining(prev => (prev ? prev - 1 : 0)), 1000);
    } else if (screen === "practice" && isTimed && timeRemaining === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startPractice(2, count);
      setSession(res);
      setAnswers({});
      setCurrentQIndex(0);
      setMarkedForReview(new Set());
      if (isTimed) setTimeRemaining(res.questionCount * 30);
      setScreen("practice");
    } catch { 
      alert("Lỗi khi tải bài tập. Vui lòng thử lại."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qId, oId]) => ({ questionId: Number(qId), optionId: Number(oId) }));
      const res = await submitPractice({ sessionId: session.sessionId, answers: answersArr });
      setReviewData(res);
      setScreen("review");
      setCurrentQIndex(0);
    } catch { 
      alert("Lỗi khi nộp bài."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Part 2: Question-Response</h1>
            <p className="text-zinc-400 text-sm">Nghe câu hỏi và chọn câu trả lời đúng nhất trong 3 lựa chọn</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Số lượng câu hỏi</h3>
            <div className="flex flex-wrap gap-3">
              {[5, 10, 15, 25, 999].map(c => (
                <button key={c} onClick={() => setCount(c)} className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  {c === 999 ? "Tất cả" : `${c} câu`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsTimed(true)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isTimed ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                <Timer className="w-4 h-4" />
                <span>Giới hạn thời gian</span>
              </button>
              <button onClick={() => setIsTimed(false)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!isTimed ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                <InfinityIcon className="w-4 h-4" />
                <span>Không giới hạn</span>
              </button>
            </div>
          </div>
          <button onClick={handleStart} disabled={loading} className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-zinc-200 transition disabled:opacity-50">
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "practice" && session) {
    const questions = session.groups.flatMap(g => g.questions.map(q => ({ group: g, question: q })));
    const currentItem = questions[currentQIndex];
    const qType = detectQuestionType(currentItem.question.question_text || "");
    const qTypeInfo = Q_TYPES[qType];

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm("Thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-medium">
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
            <span className="font-bold text-white">Câu {currentQIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold flex items-center gap-1 ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </span>
            )}
            <button onClick={() => { setMarkedForReview(prev => { const n = new Set(prev); n.has(currentItem.question.id) ? n.delete(currentItem.question.id) : n.add(currentItem.question.id); return n; }); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${markedForReview.has(currentItem.question.id) ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              <Flag className="w-4 h-4" />
              <span>Đánh dấu</span>
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${qTypeInfo.color}`}>{qTypeInfo.label}</span>
            {markedForReview.has(currentItem.question.id) && (
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                <span>Đánh dấu xem lại</span>
              </span>
            )}
          </div>
          {currentItem.group.audio_url ? (
            <AudioPlayer src={currentItem.group.audio_url} autoPlay={false} />
          ) : (
            <div className="h-20 bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-500">Không có audio</div>
          )}
        </div>

        <div className="space-y-3 flex-1">
          {currentItem.question.options.map(opt => {
            const isSelected = answers[currentItem.question.id] === opt.id;
            return (
              <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [currentItem.question.id]: opt.id }))}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${isSelected ? "bg-emerald-600/20 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{opt.option_label}</div>
                <span className="text-left">{opt.option_text || "(Nghe băng đài)"}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
          <button onClick={() => setCurrentQIndex(p => p - 1)} disabled={currentQIndex === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          <div className="flex gap-1 overflow-x-auto max-w-xs">
            {questions.slice(Math.max(0, currentQIndex - 3), currentQIndex + 4).map((q, i) => {
              const realIdx = Math.max(0, currentQIndex - 3) + i;
              const hasAnswer = answers[q.question.id] !== undefined;
              const isMarked = markedForReview.has(q.question.id);
              return (
                <button key={q.question.id} onClick={() => setCurrentQIndex(realIdx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${realIdx === currentQIndex ? "bg-white text-black" : isMarked ? "bg-amber-600/30 text-amber-400" : hasAnswer ? "bg-emerald-600/30 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {realIdx + 1}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCurrentQIndex(p => p + 1)} disabled={currentQIndex === questions.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (screen === "review" && reviewData && session) {
    const questions = session.groups.flatMap(g => g.questions.map(q => ({ group: g, question: q })));
    const currentItem = questions[currentQIndex];
    const resultItem = reviewData.answers.find(a => a.questionId === currentItem.question.id);
    const qType = detectQuestionType(currentItem.question.question_text || "");
    const qTypeInfo = Q_TYPES[qType];

    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex flex-col items-center justify-center text-white">
              <span className="text-sm font-bold">{reviewData.correct}/{reviewData.total}</span>
              <span className="text-[10px] opacity-80">Đúng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả bài làm - Part 2</h2>
              <p className="text-zinc-400 text-xs">Điểm thi ước tính: {reviewData.score}</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="flex items-center gap-1.5 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition">
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lại</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {questions.map((q, idx) => {
            const ans = reviewData.answers.find(a => a.questionId === q.question.id);
            return (
              <button key={q.question.id} onClick={() => setCurrentQIndex(idx)}
                className={`min-w-[36px] h-9 rounded-lg font-bold text-xs border-2 ${currentQIndex === idx ? "border-white" : "border-transparent"} ${ans?.isCorrect ? "bg-emerald-600/20 text-emerald-400" : "bg-rose-600/20 text-rose-400"}`}>
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${qTypeInfo.color}`}>{qTypeInfo.label}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${resultItem?.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}>
              {resultItem?.isCorrect ? <><Check className="w-3.5 h-3.5" /> Đúng</> : <><X className="w-3.5 h-3.5" /> Sai</>}
            </span>
          </div>
          {currentItem.group.audio_url && <AudioPlayer src={currentItem.group.audio_url} autoPlay={false} />}
          <div className="space-y-3">
            {currentItem.question.options.map(opt => {
              const isSelected = resultItem?.optionId === opt.id;
              let cls = "bg-zinc-900 border-zinc-800 text-zinc-300";
              if (isSelected && resultItem?.isCorrect) cls = "bg-emerald-900/40 border-emerald-500 text-emerald-300";
              else if (isSelected && !resultItem?.isCorrect) cls = "bg-rose-900/40 border-rose-500 text-rose-300";
              return (
                <div key={opt.id} className={`w-full p-4 rounded-xl border flex items-center gap-4 ${cls}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? (resultItem?.isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white") : "bg-zinc-800 text-zinc-400"}`}>{opt.option_label}</div>
                  <span>{opt.option_text || "(Nghe băng đài)"}</span>
                </div>
              );
            })}
          </div>
          {currentItem.question.explanation && (
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-5 text-sm">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Transcript & Giải thích</span>
              </h4>
              <p className="text-blue-200/80" dangerouslySetInnerHTML={{ __html: currentItem.question.explanation.replace(/\n/g, "<br/>") }} />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentQIndex(p => p - 1)} disabled={currentQIndex === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          <button onClick={() => setCurrentQIndex(p => p + 1)} disabled={currentQIndex === questions.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  return null;
}