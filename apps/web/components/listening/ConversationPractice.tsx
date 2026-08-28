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
  MapPin,
  FileText,
  StickyNote,
  Check,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

type ScreenState = "config" | "practice" | "review";

interface Props {
  part: 3 | 4;
}

function ConversationPractice({ part }: Props) {
  const isP3 = part === 3;
  const partLabel = isP3 ? "Part 3: Conversations" : "Part 4: Talks";
  const partDesc = isP3 ? "Hội thoại 2-3 người" : "Bài nói chuyện ngắn";

  const [screen, setScreen] = useState<ScreenState>("config");
  const [count, setCount] = useState<number>(3);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<SubmitPracticeResponse | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [savedNote, setSavedNote] = useState(false);
  const [markedGroups, setMarkedGroups] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);

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
      const res = await startPractice(part, count);
      setSession(res);
      setAnswers({});
      setCurrentGroupIdx(0);
      setMarkedGroups(new Set());
      setNotes("");
      if (isTimed) setTimeRemaining(res.groups.length * 90);
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
      setCurrentGroupIdx(0);
    } catch { 
      alert("Lỗi khi nộp bài."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleSaveNote = () => {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ---- CONFIG SCREEN ----
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{partLabel}</h1>
            <p className="text-zinc-400 text-sm">{partDesc}</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Số {isP3 ? "đoạn hội thoại" : "bài nói"}</h3>
            <div className="flex flex-wrap gap-3">
              {[1, 3, 5, 10, 999].map(c => (
                <button key={c} onClick={() => setCount(c)} className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  {c === 999 ? "Tất cả" : `${c} ${isP3 ? "đoạn" : "bài"}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Chế độ thời gian</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsTimed(true)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isTimed ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                <Timer className="w-4 h-4" />
                <span>Giới hạn thời gian</span>
              </button>
              <button onClick={() => setIsTimed(false)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!isTimed ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
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

  // ---- PRACTICE SCREEN ----
  if (screen === "practice" && session) {
    const currentGroup = session.groups[currentGroupIdx];
    if (!currentGroup) return null;

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm("Thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-medium">
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
            <span className="font-bold text-white">{isP3 ? "Đoạn" : "Bài"} {currentGroupIdx + 1} / {session.groups.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold flex items-center gap-1 ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </span>
            )}
            <button onClick={() => { setMarkedGroups(prev => { const n = new Set(prev); n.has(currentGroupIdx) ? n.delete(currentGroupIdx) : n.add(currentGroupIdx); return n; }); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 ${markedGroups.has(currentGroupIdx) ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
              <Flag className="w-4 h-4" />
              <span>Đánh dấu</span>
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1">
          {/* Left: Context + Audio + Transcript + Notes */}
          <div className="space-y-4">
            {/* Conversation context (knowledge) */}
            {(currentGroup.knowledge || currentGroup.group_type) && (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{isP3 ? "Bối cảnh hội thoại" : "Thông tin bài nói"}</span>
                </h4>
                {currentGroup.group_type && (
                  <span className="inline-block px-3 py-1 bg-rose-600/20 text-rose-400 text-xs font-bold rounded-full mb-3">
                    {currentGroup.group_type}
                  </span>
                )}
                {currentGroup.knowledge && (
                  <p className="text-zinc-200 text-sm leading-relaxed">{currentGroup.knowledge}</p>
                )}
              </div>
            )}
            {currentGroup.audio_url ? (
              <AudioPlayer src={currentGroup.audio_url} autoPlay={false} />
            ) : (
              <div className="h-24 bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-500">Không có audio</div>
            )}
            {/* Transcript Toggle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <button onClick={() => setShowTranscript(s => !s)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition">
                <span className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Bản ghi {isP3 ? "hội thoại" : "bài nói"}</span>
                </span>
                <span className="text-zinc-500 text-xs flex items-center gap-1">
                  {showTranscript ? (
                    <>
                      <span>Ẩn</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Xem</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              </button>
              {showTranscript && currentGroup.title && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{currentGroup.title}</p>
                </div>
              )}
              {showTranscript && !currentGroup.title && (
                <p className="px-4 pb-4 text-xs text-zinc-500 italic">Chưa có bản ghi cho đoạn này.</p>
              )}
            </div>
            {/* Note-taking area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-400" />
                <span>Ghi chú</span>
              </h4>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setSavedNote(false); }}
                placeholder="Ghi chú nhanh trong khi nghe..."
                className="w-full h-32 bg-zinc-800 text-white text-sm rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-600"
              />
              <button onClick={handleSaveNote} className={`mt-2 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1.5 ${savedNote ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                {savedNote ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <span>Lưu ghi chú</span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Questions */}
          <div className="space-y-6">
            {currentGroup.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <p className="text-white font-semibold mb-4 text-sm">Câu {qIdx + 1}: {q.question_text || "(Nghe câu hỏi từ audio)"}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-sm ${isSelected ? "bg-purple-600/20 border-purple-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? "bg-purple-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>{opt.option_label}</div>
                        <span className="text-left">{opt.option_text || "(Nghe băng đài)"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
          <button onClick={() => setCurrentGroupIdx(p => p - 1)} disabled={currentGroupIdx === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          <div className="flex gap-1.5">
            {session.groups.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentGroupIdx(idx)}
                className={`w-9 h-9 rounded-lg font-bold text-xs ${idx === currentGroupIdx ? "bg-white text-black" : markedGroups.has(idx) ? "bg-amber-600/30 text-amber-400" : "bg-zinc-800 text-zinc-500"}`}>
                {idx + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGroupIdx(p => p + 1)} disabled={currentGroupIdx === session.groups.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---- REVIEW SCREEN ----
  if (screen === "review" && reviewData && session) {
    const currentGroup = session.groups[currentGroupIdx];
    if (!currentGroup) return null;

    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex flex-col items-center justify-center text-white">
              <span className="text-sm font-bold">{reviewData.correct}/{reviewData.total}</span>
              <span className="text-[10px] opacity-80">Đúng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả - {partLabel}</h2>
              <p className="text-zinc-400 text-xs">Điểm ước tính: {reviewData.score}</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="flex items-center gap-1.5 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition">
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lại</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {session.groups.map((g, idx) => {
            const groupQIds = g.questions.map(q => q.id);
            const groupAnswers = reviewData.answers.filter(a => groupQIds.includes(a.questionId));
            const allCorrect = groupAnswers.length > 0 && groupAnswers.every(a => a.isCorrect);
            const anyCorrect = groupAnswers.some(a => a.isCorrect);
            return (
              <button key={g.id} onClick={() => setCurrentGroupIdx(idx)}
                className={`min-w-[52px] h-10 rounded-lg font-bold text-xs border-2 ${currentGroupIdx === idx ? "border-white" : "border-transparent"} ${allCorrect ? "bg-emerald-600/20 text-emerald-400" : anyCorrect ? "bg-amber-600/20 text-amber-400" : "bg-rose-600/20 text-rose-400"}`}>
                {isP3 ? "Đoạn" : "Bài"} {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {(currentGroup.knowledge || currentGroup.group_type) && (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{isP3 ? "Bối cảnh" : "Thông tin"}</span>
                </h4>
                {currentGroup.group_type && (
                  <span className="inline-block px-3 py-1 bg-rose-600/20 text-rose-400 text-xs font-bold rounded-full mb-3">
                    {currentGroup.group_type}
                  </span>
                )}
                {currentGroup.knowledge && (
                  <p className="text-zinc-200 text-sm leading-relaxed">{currentGroup.knowledge}</p>
                )}
              </div>
            )}
            {currentGroup.audio_url && <AudioPlayer src={currentGroup.audio_url} autoPlay={false} />}
            {/* Transcript with keyword highlighting */}
            {currentGroup.title && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Bản ghi</span>
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: currentGroup.title
                      .replace(/(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b)/g, '<mark class="bg-amber-400/20 text-amber-300 rounded px-0.5">$1</mark>')
                  }}
                />
              </div>
            )}
          </div>
          <div className="space-y-6">
            {currentGroup.questions.map((q, qIdx) => {
              const resultItem = reviewData.answers.find(a => a.questionId === q.id);
              return (
                <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm">Câu {qIdx + 1}: {q.question_text || "(Nghe audio)"}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${resultItem?.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}>
                      {resultItem?.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const isSelected = resultItem?.optionId === opt.id;
                      let cls = "bg-zinc-900 border-zinc-800 text-zinc-400";
                      if (isSelected && resultItem?.isCorrect) cls = "bg-emerald-900/40 border-emerald-500 text-emerald-300";
                      else if (isSelected && !resultItem?.isCorrect) cls = "bg-rose-900/40 border-rose-500 text-rose-300";
                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border flex items-center gap-3 text-sm ${cls}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? (resultItem?.isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white") : "bg-zinc-800 text-zinc-500"}`}>{opt.option_label}</div>
                          <span>{opt.option_text || "(Nghe băng đài)"}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-4 bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 text-sm text-blue-200">
                      <h4 className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Giải thích</span>
                      </h4>
                      <p dangerouslySetInnerHTML={{ __html: q.explanation.replace(/\n/g, "<br/>") }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentGroupIdx(p => p - 1)} disabled={currentGroupIdx === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          <button onClick={() => setCurrentGroupIdx(p => p + 1)} disabled={currentGroupIdx === session.groups.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  return null;
}

export default ConversationPractice;