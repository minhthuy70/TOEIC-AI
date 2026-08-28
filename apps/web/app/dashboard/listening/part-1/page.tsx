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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";

type ScreenState = "config" | "practice" | "review";

export default function Part1PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");
  
  // Config state
  const [count, setCount] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  
  // Practice state
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
      handleSubmit(); // Auto submit when time is up
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startPractice(1, count);
      setSession(res);
      setAnswers({});
      setCurrentQIndex(0);
      if (isTimed) {
        setTimeRemaining(res.questionCount * 40); 
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

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qId, oId]) => ({
        questionId: Number(qId),
        optionId: Number(oId)
      }));
      const res = await submitPractice({ sessionId: session.sessionId, answers: answersArr });
      setReviewData(res);
      setScreen("review");
      setCurrentQIndex(0);
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

  // -----------------------------------------------------
  // RENDER CONFIG SCREEN
  // -----------------------------------------------------
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Part 1: Photographs</h1>
            <p className="text-zinc-400 text-sm">Cấu hình bài luyện tập</p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Số lượng câu hỏi</h3>
            <div className="flex flex-wrap gap-3">
              {[5, 10, 20, 999].map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                >
                  {c === 999 ? "Tất cả" : `${c} câu`}
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
                <Timer className="w-4 h-4" />
                <span>Giới hạn thời gian</span>
              </button>
              <button
                onClick={() => setIsTimed(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${!isTimed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
              >
                <InfinityIcon className="w-4 h-4" />
                <span>Không giới hạn</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER PRACTICE SCREEN
  // -----------------------------------------------------
  if (screen === "practice" && session) {
    const questions = session.groups.flatMap(g => g.questions.map(q => ({ group: g, question: q })));
    const currentItem = questions[currentQIndex];
    
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm("Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-medium">
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="font-bold text-white">Câu {currentQIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold flex items-center gap-1 ${timeRemaining < 60 ? 'text-rose-500' : 'text-amber-400'}`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </span>
            )}
            <button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid md:grid-cols-2 gap-8">
          {/* Image & Audio */}
          <div className="space-y-6">
            <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 relative">
              {currentItem.group.image_url ? (
                <img src={currentItem.group.image_url} alt="Question" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Không có hình ảnh</div>
              )}
            </div>
            {currentItem.group.audio_url && (
              <AudioPlayer src={currentItem.group.audio_url} autoPlay={false} />
            )}
          </div>

          {/* Options */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Chọn đáp án đúng:</h3>
            <div className="space-y-3 flex-1">
              {currentItem.question.options.map(opt => {
                const isSelected = answers[currentItem.question.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectAnswer(currentItem.question.id, opt.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {opt.option_label}
                    </div>
                    <span className="text-left font-medium">
                      (Nghe băng đài)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <button 
                onClick={() => setCurrentQIndex(prev => prev - 1)} 
                disabled={currentQIndex === 0}
                className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              <button 
                onClick={() => setCurrentQIndex(prev => prev + 1)} 
                disabled={currentQIndex === questions.length - 1}
                className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER REVIEW SCREEN
  // -----------------------------------------------------
  if (screen === "review" && reviewData && session) {
    const questions = session.groups.flatMap(g => g.questions.map(q => ({ group: g, question: q })));
    const currentItem = questions[currentQIndex];
    const resultItem = reviewData.answers.find(a => a.questionId === currentItem.question.id);

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        {/* Review Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white leading-tight">
              <span className="text-sm font-bold">{reviewData.correct}/{reviewData.total}</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả bài làm</h2>
              <p className="text-zinc-400 text-xs">Điểm: {reviewData.score}</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="flex items-center gap-1.5 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition">
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lại</span>
          </button>
        </div>

        {/* Question Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {questions.map((q, idx) => {
            const ans = reviewData.answers.find(a => a.questionId === q.question.id);
            const isCorrect = ans?.isCorrect;
            return (
              <button
                key={q.question.id}
                onClick={() => setCurrentQIndex(idx)}
                className={`min-w-[40px] h-10 rounded-lg font-bold text-sm flex items-center justify-center border-2 transition ${
                  currentQIndex === idx ? 'border-white' : 'border-transparent'
                } ${isCorrect ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Main Review Content */}
        <div className="flex-1 grid md:grid-cols-2 gap-8">
          {/* Left: Image & Audio */}
          <div className="space-y-6">
            <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 relative">
              {currentItem.group.image_url && (
                <img src={currentItem.group.image_url} alt="Question" className="w-full h-full object-cover" />
              )}
            </div>
            {currentItem.group.audio_url && (
              <AudioPlayer src={currentItem.group.audio_url} autoPlay={false} />
            )}
          </div>

          {/* Right: Options & Explanation */}
          <div className="flex flex-col space-y-6">
            {/* Options */}
            <div className="space-y-3">
              {currentItem.question.options.map(opt => {
                const isUserChoice = resultItem?.optionId === opt.id;
                const isSelected = isUserChoice;
                let bgClass = 'bg-zinc-900 border-zinc-800 text-zinc-300';
                if (isSelected && resultItem?.isCorrect) bgClass = 'bg-emerald-900/40 border-emerald-500 text-emerald-300';
                else if (isSelected && !resultItem?.isCorrect) bgClass = 'bg-rose-900/40 border-rose-500 text-rose-300';

                return (
                  <div
                    key={opt.id}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 ${bgClass}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? (resultItem?.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-zinc-800 text-zinc-400'}`}>
                      {opt.option_label}
                    </div>
                    <span className="text-left font-medium">
                      {opt.option_text || "(Nghe băng đài)"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Explanation / Transcript */}
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-5 text-sm text-blue-200">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Transcript & Giải thích</span>
              </h4>
              {currentItem.question.explanation ? (
                <div dangerouslySetInnerHTML={{ __html: currentItem.question.explanation.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-blue-300/60 italic">Không có giải thích chi tiết cho câu hỏi này.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
}