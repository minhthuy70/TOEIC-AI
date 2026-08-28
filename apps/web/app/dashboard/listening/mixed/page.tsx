"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse } from "@/services/practice";
import AudioPlayer from "@/components/listening/AudioPlayer";
import {
  ArrowLeft,
  Timer,
  Play,
  Pause,
  RotateCcw,
  BookMarked,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Mic,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

type ScreenState = "config" | "practice" | "review";
type PracticeMode = "normal" | "timed" | "exam";

const PART_CONFIGS = [
  { part: 1, label: "Part 1", desc: "Photographs", icon: ImageIcon, color: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30" },
  { part: 2, label: "Part 2", desc: "Question-Response", icon: MessageSquare, color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" },
  { part: 3, label: "Part 3", desc: "Conversations", icon: Users, color: "bg-amber-600/20 text-amber-400 border-amber-600/30" },
  { part: 4, label: "Part 4", desc: "Talks", icon: Mic, color: "bg-rose-600/20 text-rose-400 border-rose-600/30" },
];

export default function MixedPracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");
  const [selectedParts, setSelectedParts] = useState<number[]>([1, 2, 3, 4]);
  const [countPerPart, setCountPerPart] = useState(5);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("timed");
  const [shuffle, setShuffle] = useState(true);
  const [loading, setLoading] = useState(false);

  // Practice state
  const [sessions, setSessions] = useState<{ part: number; session: PracticeStartResponse }[]>([]);
  const [flatQuestions, setFlatQuestions] = useState<{ part: number; group: any; question: any }[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Review state
  const [allReviews, setAllReviews] = useState<{ part: number; review: SubmitPracticeResponse }[]>([]);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "practice" && !isPaused) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
        if (practiceMode !== "normal" && timeRemaining !== null) {
          setTimeRemaining(prev => {
            if (prev && prev > 1) return prev - 1;
            handleSubmitAll();
            return 0;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, isPaused, practiceMode, timeRemaining]);

  const togglePart = (part: number) => {
    setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const handleStart = async () => {
    if (selectedParts.length === 0) { alert("Vui lòng chọn ít nhất 1 phần."); return; }
    setLoading(true);
    try {
      const results = await Promise.all(selectedParts.map(p => startPractice(p, countPerPart).then(s => ({ part: p, session: s }))));
      setSessions(results);

      let qs = results.flatMap(r => r.session.groups.flatMap(g => g.questions.map(q => ({ part: r.part, group: g, question: q }))));
      if (shuffle) qs = qs.sort(() => Math.random() - 0.5);
      setFlatQuestions(qs);
      setAnswers({});
      setCurrentQIndex(0);
      setTimeSpent(0);
      setIsPaused(false);
      
      if (practiceMode !== "normal") {
        setTimeRemaining(qs.length * 35);
      } else {
        setTimeRemaining(null);
      }
      
      setScreen("practice");
    } catch { alert("Lỗi khi tải bài tập."); }
    finally { setLoading(false); }
  };

  const handleSubmitAll = async () => {
    if (submitting) return;
    setSubmitting(true);
    setIsPaused(true);
    try {
      const reviews = await Promise.all(sessions.map(async ({ part, session }) => {
        const sessionAnswers = flatQuestions
          .filter(fq => fq.part === part)
          .map(fq => ({ questionId: fq.question.id, optionId: answers[fq.question.id] || 0 }))
          .filter(a => a.optionId > 0);
        const review = await submitPractice({ sessionId: session.sessionId, answers: sessionAnswers });
        return { part, review };
      }));
      setAllReviews(reviews);
      setScreen("review");
      setCurrentQIndex(0);
    } catch { alert("Lỗi khi nộp bài."); setIsPaused(false); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ---- CONFIG ----
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <SlidersHorizontal className="w-6 h-6 text-purple-400" />
              <span>Luyện nghe Hỗn hợp</span>
            </h1>
            <p className="text-zinc-400 text-sm">Chọn nhiều phần và luyện tập cùng một lúc</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Chọn phần luyện tập</h3>
            <div className="grid grid-cols-2 gap-3">
              {PART_CONFIGS.map(pc => {
                const sel = selectedParts.includes(pc.part);
                const Icon = pc.icon;
                return (
                  <button key={pc.part} onClick={() => togglePart(pc.part)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${sel ? pc.color : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                    <div className="mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-bold">{pc.label}</p>
                    <p className="text-xs opacity-70">{pc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Số câu mỗi phần</h3>
            <div className="flex flex-wrap gap-3">
              {[3, 5, 10, 20].map(c => (
                <button key={c} onClick={() => setCountPerPart(c)} className={`px-6 py-3 rounded-xl font-bold ${countPerPart === c ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{c} câu</button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ luyện tập</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPracticeMode("normal")} className={`px-6 py-3 rounded-xl font-bold ${practiceMode === "normal" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Bình thường</button>
              <button onClick={() => setPracticeMode("timed")} className={`px-6 py-3 rounded-xl font-bold ${practiceMode === "timed" ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Giới hạn thời gian</button>
              <button onClick={() => setPracticeMode("exam")} className={`px-6 py-3 rounded-xl font-bold ${practiceMode === "exam" ? "bg-rose-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Thi (Nghiêm ngặt)</button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div onClick={() => setShuffle(s => !s)} className={`w-12 h-6 rounded-full transition-colors relative ${shuffle ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${shuffle ? "left-6" : "left-0.5"}`} />
              </div>
              <span className="text-zinc-300 font-bold">Xáo trộn câu hỏi</span>
            </label>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
            Tổng câu dự kiến: <span className="text-white font-bold">{selectedParts.length * countPerPart}</span> câu
          </div>

          <button onClick={handleStart} disabled={loading || selectedParts.length === 0} className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-zinc-200 transition disabled:opacity-50">
            {loading ? "Đang tạo bài tập..." : "Bắt đầu luyện tập"}
          </button>
        </div>
      </div>
    );
  }

  // ---- PRACTICE ----
  if (screen === "practice" && flatQuestions.length > 0) {
    const currentItem = flatQuestions[currentQIndex];
    const partInfo = PART_CONFIGS.find(p => p.part === currentItem.part);
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (confirm("Thoát?")) setScreen("config"); }} className="text-zinc-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${partInfo?.color || ""}`}>{partInfo?.label}</span>
            <span className="text-white font-bold">Câu {currentQIndex + 1}/{flatQuestions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-400">Đã làm: <span className="text-white font-bold">{answeredCount}/{flatQuestions.length}</span></div>
            {practiceMode !== "normal" && timeRemaining !== null && (
              <span className={`font-mono font-bold text-sm flex items-center gap-1 ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </span>
            )}
            {practiceMode !== "exam" && (
               <button onClick={() => setIsPaused(!isPaused)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-white text-xs font-bold rounded-lg hover:bg-zinc-700">
                 {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                 <span>{isPaused ? "Tiếp tục" : "Tạm dừng"}</span>
               </button>
            )}
            <button onClick={handleSubmitAll} disabled={submitting} className="px-4 py-2 bg-white text-black text-sm font-extrabold rounded-lg disabled:opacity-50">
              {submitting ? "..." : "Nộp bài"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(answeredCount / flatQuestions.length) * 100}%` }} />
        </div>

        {isPaused ? (
           <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
             <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
               <Pause className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Đã tạm dừng</h2>
             <p className="text-zinc-400 mb-6 text-sm">Thời gian làm bài đang được giữ lại.</p>
             <button onClick={() => setIsPaused(false)} className="flex items-center gap-2 px-8 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200">
               <Play className="w-4 h-4 fill-black" />
               <span>Tiếp tục làm bài</span>
             </button>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 flex-1">
            <div className="space-y-4">
              {currentItem.group.image_url && (
                <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700">
                  <img src={currentItem.group.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {currentItem.group.audio_url && <AudioPlayer src={currentItem.group.audio_url} autoPlay={false} />}
            </div>
            <div className="flex flex-col">
              {currentItem.question.question_text && (
                <p className="text-white font-medium mb-6 text-sm">{currentItem.question.question_text}</p>
              )}
              <div className="space-y-3 flex-1">
                {currentItem.question.options.map((opt: any) => {
                  const isSelected = answers[currentItem.question.id] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [currentItem.question.id]: opt.id }))}
                      className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${isSelected ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{opt.option_label}</div>
                      <span className="text-left">{opt.option_text || "(Nghe băng đài)"}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
                <button onClick={() => setCurrentQIndex(p => p - 1)} disabled={currentQIndex === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>
                <button onClick={() => setCurrentQIndex(p => p + 1)} disabled={currentQIndex === flatQuestions.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
                  <span>Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- REVIEW ----
  if (screen === "review" && allReviews.length > 0) {
    const totalCorrect = allReviews.reduce((s, r) => s + r.review.correct, 0);
    const totalQ = allReviews.reduce((s, r) => s + r.review.total, 0);
    const accuracyRate = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    
    // Flatten reviews to easily iterate
    let reviewQuestions = flatQuestions.map(fq => {
        const reviewGroup = allReviews.find(ar => ar.part === fq.part)?.review;
        const resultItem = reviewGroup?.answers.find(a => a.questionId === fq.question.id);
        return { ...fq, resultItem };
    });
    
    if (showOnlyIncorrect) {
        reviewQuestions = reviewQuestions.filter(q => !q.resultItem?.isCorrect);
    }

    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <span>Kết quả luyện nghe hỗn hợp</span>
          </h2>
          <button onClick={() => setScreen("config")} className="flex items-center gap-1.5 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition">
            <RotateCcw className="w-4 h-4" />
            <span>Luyện lại</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-white">{totalCorrect}/{totalQ}</p>
            <p className="text-xs text-zinc-400 mt-1">Tổng câu đúng</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className={`text-3xl font-extrabold ${accuracyRate >= 70 ? "text-emerald-400" : accuracyRate >= 50 ? "text-amber-400" : "text-rose-400"}`}>{accuracyRate}%</p>
            <p className="text-xs text-zinc-400 mt-1">Tỷ lệ chính xác</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-white">{allReviews.reduce((s, r) => s + r.review.score, 0)}</p>
            <p className="text-xs text-zinc-400 mt-1">Tổng điểm</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-blue-400">{formatTime(timeSpent)}</p>
            <p className="text-xs text-zinc-400 mt-1">Thời gian làm bài</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setShowOnlyIncorrect(s => !s)} className={`w-10 h-5 rounded-full transition-colors relative ${showOnlyIncorrect ? "bg-rose-500" : "bg-zinc-700"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${showOnlyIncorrect ? "left-5" : "left-0.5"}`} />
              </div>
              <span className="text-zinc-300 font-bold text-sm">Chỉ hiển thị câu sai</span>
            </label>
            <button className="flex items-center gap-1.5 text-xs px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition">
                <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                <span>Thêm câu sai vào sổ tay lỗi</span>
            </button>
        </div>

        <div className="space-y-6">
          {reviewQuestions.map((q, qIdx) => {
              const partInfo = PART_CONFIGS.find(p => p.part === q.part);
              return (
                <div key={q.question.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${partInfo?.color || ""}`}>{partInfo?.label}</span>
                        <p className="text-white font-semibold text-sm">Câu {qIdx + 1}: {q.question.question_text || "(Nghe audio)"}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${q.resultItem?.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}>
                      {q.resultItem?.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          {q.group.image_url && (
                             <div className="w-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                               <img src={q.group.image_url} alt="" className="w-full h-full object-cover" />
                             </div>
                          )}
                          {q.group.audio_url && <AudioPlayer src={q.group.audio_url} autoPlay={false} />}
                          {q.group.title && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-4">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Bản ghi</h4>
                                <p className="text-sm text-zinc-300">{q.group.title}</p>
                            </div>
                          )}
                      </div>
                      
                      <div className="space-y-2">
                        {q.question.options.map((opt: any) => {
                          const isSelected = q.resultItem?.optionId === opt.id;
                          let cls = "bg-zinc-900 border-zinc-800 text-zinc-400";
                          if (isSelected && q.resultItem?.isCorrect) cls = "bg-emerald-900/40 border-emerald-500 text-emerald-300";
                          else if (isSelected && !q.resultItem?.isCorrect) cls = "bg-rose-900/40 border-rose-500 text-rose-300";
                          
                          return (
                            <div key={opt.id} className={`p-3 rounded-xl border flex items-center gap-3 text-sm ${cls}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? (q.resultItem?.isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white") : "bg-zinc-800 text-zinc-500"}`}>{opt.option_label}</div>
                              <span>{opt.option_text || "(Nghe băng đài)"}</span>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                  
                  {q.question.explanation && (
                    <div className="mt-4 bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 text-sm text-blue-200">
                      <h4 className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Giải thích</span>
                      </h4>
                      <p dangerouslySetInnerHTML={{ __html: q.question.explanation.replace(/\n/g, "<br/>") }} />
                    </div>
                  )}
                </div>
              )
          })}
        </div>
      </div>
    );
  }

  return null;
}
