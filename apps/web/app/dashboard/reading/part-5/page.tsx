"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { startPractice, submitPractice, PracticeStartResponse, SubmitPracticeResponse } from "@/services/practice";

type ScreenState = "config" | "practice" | "review";

export default function Part5PracticePage() {
  const [screen, setScreen] = useState<ScreenState>("config");
  
  // Config state
  const [count, setCount] = useState<number>(20);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [grammarTopic, setGrammarTopic] = useState<string>("");
  const [vocabTopic, setVocabTopic] = useState<string>("");
  
  // Practice state
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<PracticeStartResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
      handleSubmit(); // Auto submit when time is up
    }
    return () => clearInterval(timer);
  }, [screen, isTimed, timeRemaining]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startPractice(5, count, grammarTopic || undefined, vocabTopic || undefined);
      setSession(res);
      setAnswers({});
      setMarkedForReview({});
      setCurrentQIndex(0);
      if (isTimed) {
        // Part 5 gives roughly 30 seconds per question on average in a real test (to save time for Part 7)
        setTimeRemaining(res.questionCount * 30); 
      }
      setScreen("practice");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải bài tập hoặc không tìm thấy câu hỏi với chủ đề bạn chọn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optId: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleMarkForReview = (qId: number) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
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
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  // Dummy options for Topics
  const GRAMMAR_TOPICS = ["", "Tenses", "Prepositions", "Conjunctions", "Pronouns", "Relative Clauses"];
  const VOCAB_TOPICS = ["", "Business", "Office", "Travel", "Dining", "Health"];

  // -----------------------------------------------------
  // RENDER CONFIG SCREEN
  // -----------------------------------------------------
  if (screen === "config") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/reading" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Part 5: Hoàn thành câu (Incomplete Sentences)</h1>
            <p className="text-zinc-400 text-sm">Cấu hình bài luyện tập đọc</p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-white font-bold mb-4">Số lượng câu hỏi</h3>
            <div className="flex flex-wrap gap-3">
              {[5, 10, 20, 30, 40].map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${count === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                >
                  {c} câu
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

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-bold mb-4">Lọc theo chủ đề ngữ pháp</h3>
              <select 
                value={grammarTopic}
                onChange={e => setGrammarTopic(e.target.value)}
                className="w-full bg-zinc-800 border-none text-white rounded-xl p-4 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Tất cả chủ đề ngữ pháp --</option>
                {GRAMMAR_TOPICS.filter(t => t).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Lọc theo chủ đề từ vựng</h3>
              <select 
                value={vocabTopic}
                onChange={e => setVocabTopic(e.target.value)}
                className="w-full bg-zinc-800 border-none text-white rounded-xl p-4 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Tất cả chủ đề từ vựng --</option>
                {VOCAB_TOPICS.filter(t => t).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-extrabold text-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    // For Part 5, questions might be grouped or not, but usually 1 question per group
    const questions = session.groups.flatMap(g => g.questions.map(q => ({ group: g, question: q })));
    const currentItem = questions[currentQIndex];
    
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if(confirm("Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.")) setScreen("config"); }} className="text-zinc-400 hover:text-white">✕ Thoát</button>
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="font-bold text-white">Câu {currentQIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {isTimed && timeRemaining !== null && (
              <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-rose-500' : 'text-amber-400'}`}>
                ⏳ {formatTime(timeRemaining)}
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
        <div className="flex-1 flex flex-col">
          {/* Question Display */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => toggleMarkForReview(currentItem.question.id)}
                title="Đánh dấu xem lại"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${markedForReview[currentItem.question.id] ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
              >
                {markedForReview[currentItem.question.id] ? "★ Đã đánh dấu" : "☆ Đánh dấu xem lại"}
              </button>
            </div>
            
            <h2 className="text-zinc-400 font-semibold mb-4 uppercase tracking-wider text-sm">Điền vào chỗ trống:</h2>
            <div className="text-xl md:text-2xl font-medium text-white leading-relaxed">
              {currentItem.question.question_text || "(Không có nội dung câu hỏi)"}
            </div>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-4 flex-1">
            {currentItem.question.options.map(opt => {
              const isSelected = answers[currentItem.question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAnswer(currentItem.question.id, opt.id)}
                  className={`w-full p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-900/20' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {opt.option_label}
                  </div>
                  <span className="text-left font-medium text-lg break-words text-wrap">
                    {opt.option_text || "(Không có văn bản)"}
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
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            
            {/* Quick navigator */}
            <div className="hidden sm:flex gap-1 overflow-x-auto px-2 max-w-[50%]">
              {questions.map((q, idx) => (
                <button
                  key={q.question.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-8 h-8 rounded shrink-0 text-xs font-bold transition-colors ${
                    currentQIndex === idx ? 'bg-indigo-600 text-white' : 
                    markedForReview[q.question.id] ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50' :
                    answers[q.question.id] ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentQIndex(prev => prev + 1)} 
              disabled={currentQIndex === questions.length - 1}
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp →
            </button>
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
      <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col min-h-[80vh]">
        
        {/* Review Header */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white leading-tight shadow-lg">
              <span className="text-sm font-bold">{reviewData.correct}/{reviewData.total}</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Kết quả bài làm</h2>
              <p className="text-zinc-400 text-xs">Độ chính xác: {Math.round((reviewData.correct / reviewData.total) * 100)}%</p>
            </div>
          </div>
          <button onClick={() => setScreen("config")} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition">
            Luyện tập lại
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
                className={`min-w-[40px] h-10 rounded-lg font-bold text-sm flex items-center justify-center border-2 transition relative ${
                  currentQIndex === idx ? 'border-white' : 'border-transparent'
                } ${isCorrect ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}
              >
                {idx + 1}
                {markedForReview[q.question.id] && <span className="absolute -top-1 -right-1 text-amber-400 text-xs text-[10px]">★</span>}
              </button>
            );
          })}
        </div>

        {/* Main Review Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Question and Options */}
          <div className="flex flex-col space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative">
               {markedForReview[currentItem.question.id] && (
                 <span className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">★ Đánh dấu</span>
               )}
              <h2 className="text-lg font-medium text-white leading-relaxed mb-6">
                {currentItem.question.question_text || "(Không có nội dung câu hỏi)"}
              </h2>

              <div className="space-y-3">
                {currentItem.question.options.map(opt => {
                  const isUserChoice = resultItem?.optionId === opt.id;
                  
                  // Highlight logic
                  let bgClass = 'bg-zinc-900 border-zinc-800 text-zinc-300';
                  let iconClass = 'bg-zinc-800 text-zinc-400';
                  
                  if (isUserChoice && resultItem?.isCorrect) {
                    bgClass = 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300';
                    iconClass = 'bg-emerald-600 text-white';
                  } else if (isUserChoice && !resultItem?.isCorrect) {
                    bgClass = 'bg-rose-900/40 border-rose-500/50 text-rose-300';
                    iconClass = 'bg-rose-600 text-white';
                  }
                  
                  return (
                    <div
                      key={opt.id}
                      className={`w-full p-4 rounded-xl border flex items-center gap-4 ${bgClass}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${iconClass}`}>
                        {opt.option_label}
                      </div>
                      <span className="text-left font-medium">
                        {opt.option_text || "(Trống)"}
                      </span>
                      {isUserChoice && resultItem?.isCorrect && <span className="ml-auto text-emerald-400 text-xl shrink-0">✓</span>}
                      {isUserChoice && !resultItem?.isCorrect && <span className="ml-auto text-rose-400 text-xl shrink-0">✗</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Explanation & Tools */}
          <div className="flex flex-col space-y-6">
            
            {/* Detailed Explanation */}
            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-indigo-900/40 px-5 py-3 border-b border-indigo-900/30 flex items-center gap-2">
                <span className="text-indigo-400">📖</span>
                <h4 className="font-bold text-indigo-300">Giải thích chi tiết</h4>
              </div>
              <div className="p-5 text-sm text-indigo-100/80 leading-relaxed">
                {currentItem.question.explanation ? (
                  <div dangerouslySetInnerHTML={{ __html: currentItem.question.explanation.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-indigo-300/40 italic">Không có giải thích chi tiết cho câu hỏi này.</p>
                )}
              </div>
            </div>

            {/* Mocked Study Features */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => alert("Tính năng tra cứu điểm ngữ pháp đang được phát triển!")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 text-left transition group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform origin-left">🧩</span>
                <span className="font-bold text-zinc-300 text-sm">Điểm ngữ pháp</span>
                <span className="text-[10px] text-zinc-500">Xem giải thích ngữ pháp liên quan</span>
              </button>
              
              <button 
                onClick={() => alert("Tính năng tra cứu từ vựng đang được phát triển!")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 text-left transition group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform origin-left">📚</span>
                <span className="font-bold text-zinc-300 text-sm">Giải nghĩa từ vựng</span>
                <span className="text-[10px] text-zinc-500">Tra cứu các từ mới trong câu</span>
              </button>

              <button 
                onClick={() => alert("Tính năng xem quy tắc ngữ pháp đang được phát triển!")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 text-left transition group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform origin-left">🔗</span>
                <span className="font-bold text-zinc-300 text-sm">Quy tắc liên quan</span>
                <span className="text-[10px] text-zinc-500">Liên kết tới bài học lý thuyết</span>
              </button>
              
              <button 
                onClick={() => alert("Đã thêm câu này vào Sổ tay ngữ pháp cá nhân (Mock)!")}
                className="bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800/30 rounded-xl p-4 flex flex-col gap-2 text-left transition group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform origin-left">📝</span>
                <span className="font-bold text-indigo-300 text-sm">Thêm vào Sổ tay</span>
                <span className="text-[10px] text-indigo-300/50">Lưu lại để ôn tập sau</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
}
