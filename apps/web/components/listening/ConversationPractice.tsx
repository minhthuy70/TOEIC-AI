"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse, PracticeGroup } from "@/services/practice";
import AudioPlayer from "@/components/listening/AudioPlayer";

type ScreenState = "config" | "practice" | "review";

interface Props {
  part: 3 | 4;
}

function ConversationPractice({ part }: Props) {
  const isP3 = part === 3;
  const partLabel = isP3 ? "Part 3: Conversations" : "Part 4: Talks";
  const partDesc = isP3 ? "Há»™i thoáº¡i 2-3 ngÆ°á»i" : "BÃ i nÃ³i chuyá»‡n ngáº¯n";

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
    } catch { alert("Lá»—i khi táº£i bÃ i táº­p. Vui lÃ²ng thá»­ láº¡i."); }
    finally { setLoading(false); }
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
    } catch { alert("Lá»—i khi ná»™p bÃ i."); }
    finally { setSubmitting(false); }
  };

  const handleSaveNote = () => {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  // ---- CONFIG SCREEN ----
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">â†</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{partLabel}</h1>
            <p className="text-zinc-400 text-sm">{partDesc}</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Sá»‘ {isP3 ? "Ä‘oáº¡n há»™i thoáº¡i" : "bÃ i nÃ³i"}</h3>
            <div className="flex flex-wrap gap-3">
              {[1, 3, 5, 10, 999].map(c => (
                <button key={c} onClick={() => setCount(c)} className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                  {c === 999 ? "Táº¥t cáº£" : `${c} ${isP3 ? "Ä‘oáº¡n" : "bÃ i"}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Cháº¿ Ä‘á»™ thá»i gian</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsTimed(true)} className={`px-6 py-3 rounded-xl font-bold transition-all ${isTimed ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>â³ Giá»›i háº¡n thá»i gian</button>
              <button onClick={() => setIsTimed(false)} className={`px-6 py-3 rounded-xl font-bold transition-all ${!isTimed ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>â™¾ï¸ KhÃ´ng giá»›i háº¡n</button>
            </div>
          </div>
          <button onClick={handleStart} disabled={loading} className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-zinc-200 transition disabled:opacity-50">
            {loading ? "Äang táº¡o bÃ i táº­p..." : "Báº¯t Ä‘áº§u luyá»‡n táº­p"}
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
            <button onClick={() => { if(confirm("ThoÃ¡t? Káº¿t quáº£ sáº½ khÃ´ng Ä‘Æ°á»£c lÆ°u.")) setScreen("config"); }} className="text-zinc-400 hover:text-white">âœ• ThoÃ¡t</button>
            <span className="font-bold text-white">{isP3 ? "Äoáº¡n" : "BÃ i"} {currentGroupIdx + 1} / {session.groups.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>â³ {formatTime(timeRemaining)}</span>
            )}
            <button onClick={() => { setMarkedGroups(prev => { const n = new Set(prev); n.has(currentGroupIdx) ? n.delete(currentGroupIdx) : n.add(currentGroupIdx); return n; }); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${markedGroups.has(currentGroupIdx) ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>ðŸš© ÄÃ¡nh dáº¥u</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {submitting ? "Äang ná»™p..." : "Ná»™p bÃ i"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1">
          {/* Left: Audio + Notes */}
          <div className="space-y-4">
            {currentGroup.audio_url ? (
              <AudioPlayer src={currentGroup.audio_url} autoPlay={false} />
            ) : (
              <div className="h-24 bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-500">KhÃ´ng cÃ³ audio</div>
            )}
            {/* Note-taking area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-zinc-400 mb-3">ðŸ“ Ghi chÃº</h4>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setSavedNote(false); }}
                placeholder="Ghi chÃº nhanh trong khi nghe..."
                className="w-full h-32 bg-zinc-800 text-white text-sm rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-600"
              />
              <button onClick={handleSaveNote} className={`mt-2 px-4 py-2 rounded-lg text-sm font-bold transition ${savedNote ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
                {savedNote ? "âœ“ ÄÃ£ lÆ°u!" : "LÆ°u ghi chÃº"}
              </button>
            </div>
          </div>

          {/* Right: Questions */}
          <div className="space-y-6">
            {currentGroup.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <p className="text-white font-semibold mb-4 text-sm">CÃ¢u {qIdx + 1}: {q.question_text || "(Nghe cÃ¢u há»i tá»« audio)"}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-sm ${isSelected ? "bg-purple-600/20 border-purple-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? "bg-purple-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>{opt.option_label}</div>
                        <span className="text-left">{opt.option_text || "(Nghe bÄƒng Ä‘Ã i)"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
          <button onClick={() => setCurrentGroupIdx(p => p - 1)} disabled={currentGroupIdx === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">â† TrÆ°á»›c</button>
          <div className="flex gap-1.5">
            {session.groups.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentGroupIdx(idx)}
                className={`w-9 h-9 rounded-lg font-bold text-xs ${idx === currentGroupIdx ? "bg-white text-black" : markedGroups.has(idx) ? "bg-amber-600/30 text-amber-400" : "bg-zinc-800 text-zinc-500"}`}>
                {idx + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGroupIdx(p => p + 1)} disabled={currentGroupIdx === session.groups.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">Tiáº¿p â†’</button>
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
              <span className="text-[10px] opacity-80">ÄÃºng</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Káº¿t quáº£ - {partLabel}</h2>
              <p className="text-zinc-400 text-xs">Äiá»ƒm Æ°á»›c tÃ­nh: {reviewData.score}</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg">Luyá»‡n táº­p láº¡i</button>
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
                {isP3 ? "Äoáº¡n" : "BÃ i"} {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {currentGroup.audio_url && <AudioPlayer src={currentGroup.audio_url} autoPlay={false} />}
          </div>
          <div className="space-y-6">
            {currentGroup.questions.map((q, qIdx) => {
              const resultItem = reviewData.answers.find(a => a.questionId === q.id);
              return (
                <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm">CÃ¢u {qIdx + 1}: {q.question_text || "(Nghe audio)"}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${resultItem?.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}>{resultItem?.isCorrect ? "âœ“" : "âœ—"}</span>
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
                          <span>{opt.option_text || "(Nghe bÄƒng Ä‘Ã i)"}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-4 bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 text-sm text-blue-200">
                      <h4 className="font-bold text-blue-400 mb-1">ðŸ“– Giáº£i thÃ­ch</h4>
                      <p dangerouslySetInnerHTML={{ __html: q.explanation.replace(/\n/g, "<br/>") }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentGroupIdx(p => p - 1)} disabled={currentGroupIdx === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">â† TrÆ°á»›c</button>
          <button onClick={() => setCurrentGroupIdx(p => p + 1)} disabled={currentGroupIdx === session.groups.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">Tiáº¿p â†’</button>
        </div>
      </div>
    );
  }
  return null;
}

export default ConversationPractice;