"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse } from "@/services/practice";
import AudioPlayer from "@/components/listening/AudioPlayer";

type ScreenState = "config" | "practice" | "review";

const PART_CONFIGS = [
  { part: 1, label: "Part 1", desc: "Photographs", icon: "ðŸ–¼ï¸", color: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30" },
  { part: 2, label: "Part 2", desc: "Question-Response", icon: "ðŸ’¬", color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" },
  { part: 3, label: "Part 3", desc: "Conversations", icon: "ðŸ‘¥", color: "bg-amber-600/20 text-amber-400 border-amber-600/30" },
  { part: 4, label: "Part 4", desc: "Talks", icon: "ðŸŽ¤", color: "bg-rose-600/20 text-rose-400 border-rose-600/30" },
];

export default function MixedPracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");
  const [selectedParts, setSelectedParts] = useState<number[]>([1, 2, 3, 4]);
  const [countPerPart, setCountPerPart] = useState(5);
  const [isTimed, setIsTimed] = useState(true);
  const [shuffle, setShuffle] = useState(true);
  const [loading, setLoading] = useState(false);

  // Practice state - merged sessions per part
  const [sessions, setSessions] = useState<{ part: number; session: PracticeStartResponse }[]>([]);
  const [flatQuestions, setFlatQuestions] = useState<{ part: number; group: any; question: any }[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [allReviews, setAllReviews] = useState<{ part: number; review: SubmitPracticeResponse }[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === "practice" && isTimed && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining(prev => (prev ? prev - 1 : 0)), 1000);
    } else if (screen === "practice" && isTimed && timeRemaining === 0) {
      handleSubmitAll();
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  const togglePart = (part: number) => {
    setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const handleStart = async () => {
    if (selectedParts.length === 0) { alert("Vui lÃ²ng chá»n Ã­t nháº¥t 1 pháº§n."); return; }
    setLoading(true);
    try {
      const results = await Promise.all(selectedParts.map(p => startPractice(p, countPerPart).then(s => ({ part: p, session: s }))));
      setSessions(results);

      let qs = results.flatMap(r => r.session.groups.flatMap(g => g.questions.map(q => ({ part: r.part, group: g, question: q }))));
      if (shuffle) qs = qs.sort(() => Math.random() - 0.5);
      setFlatQuestions(qs);
      setAnswers({});
      setCurrentQIndex(0);
      if (isTimed) setTimeRemaining(qs.length * 35);
      setScreen("practice");
    } catch { alert("Lá»—i khi táº£i bÃ i táº­p."); }
    finally { setLoading(false); }
  };

  const handleSubmitAll = async () => {
    if (submitting) return;
    setSubmitting(true);
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
    } catch { alert("Lá»—i khi ná»™p bÃ i."); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const getPartColor = (part: number) => PART_CONFIGS.find(p => p.part === part)?.color || "";
  const getPartLabel = (part: number) => PART_CONFIGS.find(p => p.part === part)?.label || `Part ${part}`;

  // ---- CONFIG ----
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">â†</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">ðŸŽ¯ Luyá»‡n nghe Há»—n há»£p</h1>
            <p className="text-zinc-400 text-sm">Chá»n nhiá»u pháº§n vÃ  luyá»‡n táº­p cÃ¹ng má»™t lÃºc</p>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Chá»n pháº§n luyá»‡n táº­p</h3>
            <div className="grid grid-cols-2 gap-3">
              {PART_CONFIGS.map(pc => {
                const sel = selectedParts.includes(pc.part);
                return (
                  <button key={pc.part} onClick={() => togglePart(pc.part)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${sel ? pc.color : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>
                    <div className="text-xl mb-1">{pc.icon}</div>
                    <p className="font-bold">{pc.label}</p>
                    <p className="text-xs opacity-70">{pc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Sá»‘ cÃ¢u má»—i pháº§n</h3>
            <div className="flex flex-wrap gap-3">
              {[3, 5, 10, 20].map(c => (
                <button key={c} onClick={() => setCountPerPart(c)} className={`px-6 py-3 rounded-xl font-bold ${countPerPart === c ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{c} cÃ¢u</button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setIsTimed(t => !t)} className={`w-12 h-6 rounded-full transition-colors relative ${isTimed ? "bg-amber-500" : "bg-zinc-700"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isTimed ? "left-6" : "left-0.5"}`} />
              </div>
              <span className="text-zinc-300 text-sm font-medium">Giá»›i háº¡n thá»i gian</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setShuffle(s => !s)} className={`w-12 h-6 rounded-full transition-colors relative ${shuffle ? "bg-indigo-500" : "bg-zinc-700"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${shuffle ? "left-6" : "left-0.5"}`} />
              </div>
              <span className="text-zinc-300 text-sm font-medium">XÃ¡o trá»™n cÃ¢u há»i</span>
            </label>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
            Tá»•ng cÃ¢u dá»± kiáº¿n: <span className="text-white font-bold">{selectedParts.length * countPerPart}</span> cÃ¢u
          </div>

          <button onClick={handleStart} disabled={loading || selectedParts.length === 0} className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-zinc-200 transition disabled:opacity-50">
            {loading ? "Äang táº¡o bÃ i táº­p..." : "Báº¯t Ä‘áº§u luyá»‡n táº­p"}
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
            <button onClick={() => { if(confirm("ThoÃ¡t?")) setScreen("config"); }} className="text-zinc-400 hover:text-white">âœ•</button>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${partInfo?.color || ""}`}>{partInfo?.label}</span>
            <span className="text-white font-bold">CÃ¢u {currentQIndex + 1}/{flatQuestions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-400">ÄÃ£ lÃ m: <span className="text-white font-bold">{answeredCount}/{flatQuestions.length}</span></div>
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold text-sm ${timeRemaining < 60 ? "text-rose-500" : "text-amber-400"}`}>â³ {formatTime(timeRemaining)}</span>
            )}
            <button onClick={handleSubmitAll} disabled={submitting} className="px-4 py-2 bg-white text-black text-sm font-extrabold rounded-lg disabled:opacity-50">
              {submitting ? "..." : "Ná»™p bÃ i"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(answeredCount / flatQuestions.length) * 100}%` }} />
        </div>

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
                    <span className="text-left">{opt.option_text || "(Nghe bÄƒng Ä‘Ã i)"}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
              <button onClick={() => setCurrentQIndex(p => p - 1)} disabled={currentQIndex === 0} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">â† TrÆ°á»›c</button>
              <button onClick={() => setCurrentQIndex(p => p + 1)} disabled={currentQIndex === flatQuestions.length - 1} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50">Tiáº¿p â†’</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- REVIEW ----
  if (screen === "review" && allReviews.length > 0) {
    const totalCorrect = allReviews.reduce((s, r) => s + r.review.correct, 0);
    const totalQ = allReviews.reduce((s, r) => s + r.review.total, 0);
    const accuracyRate = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">ðŸ“Š Káº¿t quáº£ luyá»‡n nghe há»—n há»£p</h2>
          <button onClick={() => setScreen("config")} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg">Luyá»‡n láº¡i</button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-white">{totalCorrect}/{totalQ}</p>
            <p className="text-xs text-zinc-400 mt-1">Tá»•ng cÃ¢u Ä‘Ãºng</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className={`text-3xl font-extrabold ${accuracyRate >= 70 ? "text-emerald-400" : accuracyRate >= 50 ? "text-amber-400" : "text-rose-400"}`}>{accuracyRate}%</p>
            <p className="text-xs text-zinc-400 mt-1">Tá»· lá»‡ chÃ­nh xÃ¡c</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-white">{allReviews.reduce((s, r) => s + r.review.score, 0)}</p>
            <p className="text-xs text-zinc-400 mt-1">Tá»•ng Ä‘iá»ƒm</p>
          </div>
        </div>

        <div className="space-y-4">
          {allReviews.map(({ part, review }) => {
            const partInfo = PART_CONFIGS.find(p => p.part === part);
            const partAccuracy = review.total > 0 ? Math.round((review.correct / review.total) * 100) : 0;
            return (
              <div key={part} className={`flex items-center justify-between border rounded-2xl p-5 ${partInfo?.color || "bg-zinc-900 border-zinc-800"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{partInfo?.icon}</span>
                  <div>
                    <p className="font-bold text-white">{partInfo?.label}: {partInfo?.desc}</p>
                    <p className="text-xs text-zinc-400">{review.correct}/{review.total} cÃ¢u Ä‘Ãºng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-extrabold ${partAccuracy >= 70 ? "text-emerald-400" : "text-rose-400"}`}>{partAccuracy}%</p>
                  <p className="text-xs text-zinc-500">Äiá»ƒm: {review.score}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}