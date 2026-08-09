"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getListeningGroupById,
  submitListeningGroup,
  type ListeningGroup,
  type ListeningQuestion,
} from "@/services/listening";

// ─── Learning flow steps ───
const STEPS = [
  { id: "listen", label: "Nghe", icon: "🎧" },
  { id: "explain", label: "Học / Giải thích", icon: "📖" },
  { id: "listen2", label: "Nghe lại", icon: "🔁" },
  { id: "quiz", label: "Làm câu hỏi", icon: "✏️" },
  { id: "score", label: "Chấm điểm", icon: "📊" },
  { id: "review", label: "Đọc lại lý thuyết", icon: "📝" },
  { id: "complete", label: "Hoàn thành", icon: "✅" },
];

const PART_LABELS: Record<number, string> = {
  1: "Part 1: Photographs",
  2: "Part 2: Question-Response",
  3: "Part 3: Conversations",
  4: "Part 4: Talks",
};

export default function ListeningLearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = Number(searchParams.get("groupId"));
  const partNumber = Number(searchParams.get("part"));

  const [group, setGroup] = useState<ListeningGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Quiz state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Load group data
  useEffect(() => {
    const loadGroup = async () => {
      try {
        setLoading(true);
        const result = await getListeningGroupById(groupId);
        if (result.success && result.group) {
          setGroup(result.group);
        }
      } catch (error) {
        console.error("Load group error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) loadGroup();
  }, [groupId]);

  // Audio controls
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!group) return;

    let correct = 0;
    const questions = group.listening_lesson_questions || [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const correctOption = question.listening_lesson_options.find(
        (opt) => opt.is_correct
      );
      if (correctOption && userAnswer === correctOption.option_label) {
        correct++;
      }
    }

    const totalQuestions = questions.length || 1;
    const calculatedScore = Math.round((correct / totalQuestions) * 100);
    setScore(calculatedScore);
    setSubmitted(true);
    setCurrentStep(4); // Move to score step

    // Save progress to backend
    try {
      await submitListeningGroup(groupId, calculatedScore);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      // Reset audio when going to listen again step
      if (STEPS[currentStep + 1].id === "listen2" && audioRef.current) {
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-64 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <p className="text-zinc-400 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-zinc-400 text-lg">Không tìm thấy Group này.</p>
        <Link
          href="/dashboard/courses"
          className="mt-4 inline-block text-red-400 hover:text-red-300 text-sm"
        >
          ← Quay lại Học tập
        </Link>
      </div>
    );
  }

  const questions = group.listening_lesson_questions || [];
  const audioUrl = group.audio_url
    ? `http://localhost:3001${group.audio_url}`
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/courses"
            className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
          >
            ←
          </Link>
          <div>
            <p className="text-[15px] text-white font-bold">
              {PART_LABELS[partNumber] || `Part ${partNumber}`}
            </p>
            <p className="text-[11px] text-zinc-500">
              {group.title || `Group ${group.display_order}`}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-zinc-600 bg-zinc-800/60 border border-zinc-700/30 px-3 py-1 rounded-full">
          Bước {currentStep + 1}/{STEPS.length}
        </span>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                    i < currentStep
                      ? "bg-emerald-600/20 border border-emerald-600/30 text-emerald-400"
                      : i === currentStep
                      ? "bg-red-600/20 border border-red-600/30 text-red-400 scale-110 shadow-lg shadow-red-600/10"
                      : "bg-zinc-800/60 border border-zinc-700/30 text-zinc-600"
                  }`}
                >
                  {i < currentStep ? "✓" : step.icon}
                </div>
                <p
                  className={`text-[8px] mt-1 text-center leading-tight ${
                    i === currentStep ? "text-red-400 font-semibold" : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                    i < currentStep ? "bg-emerald-600/40" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 min-h-[300px]">
        {/* Render Image if exists (Especially for Part 1) */}
        {group.image_url && (
          <div className="mb-6 flex justify-center">
            <img 
              src={`http://localhost:3001${group.image_url}`} 
              alt="Listening reference" 
              className="max-h-64 rounded-xl border border-zinc-700/50 object-contain shadow-lg"
            />
          </div>
        )}

        {/* ── Step 1: Nghe ── */}
        {STEPS[currentStep].id === "listen" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">🎧 Nghe audio</p>
              <p className="text-[12px] text-zinc-400">
                Hãy nghe kỹ đoạn audio bên dưới. Tập trung vào nội dung chính.
              </p>
            </div>

            {/* Audio Player */}
            {audioUrl ? (
              <div className="bg-zinc-800/60 border border-zinc-700/30 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAudio}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-red-600/20 hover:scale-105 transition-transform"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <div className="flex-1">
                    <div className="w-full bg-zinc-700 rounded-full h-2 cursor-pointer"
                      onClick={(e) => {
                        if (!audioRef.current || !audioDuration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        audioRef.current.currentTime = pct * audioDuration;
                      }}
                    >
                      <div
                        className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-zinc-500">{formatTime(audioProgress)}</span>
                      <span className="text-[10px] text-zinc-500">{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 text-sm py-8">
                Không có audio cho group này.
              </div>
            )}

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 hover:scale-[1.01] transition-all"
            >
              Tiếp tục → Học / Giải thích
            </button>
          </div>
        )}

        {/* ── Step 2: Giải thích ── */}
        {STEPS[currentStep].id === "explain" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">📖 Học / Giải thích</p>
              <p className="text-[12px] text-zinc-400">
                Đọc phần giải thích bên dưới để hiểu rõ nội dung audio.
              </p>
            </div>

            {/* Kiến thức cần nắm */}
            {group.knowledge && (
              <div className="bg-gradient-to-r from-amber-950/30 to-orange-950/20 border border-amber-700/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">📚</span>
                  <div>
                    <p className="text-[13px] font-semibold text-amber-300 mb-2">Kiến thức cần nắm</p>
                    <p className="text-[12px] text-amber-200/80 leading-relaxed whitespace-pre-line">
                      {group.knowledge}
                    </p>
                  </div>
                </div>
              </div>
            )}



            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
              >
                Tiếp tục → Nghe lại
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Nghe lại ── */}
        {STEPS[currentStep].id === "listen2" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">🔁 Nghe lại</p>
              <p className="text-[12px] text-zinc-400">
                Nghe lại audio một lần nữa. Lần này bạn sẽ hiểu rõ hơn!
              </p>
            </div>

            {audioUrl ? (
              <div className="bg-zinc-800/60 border border-zinc-700/30 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAudio}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <div className="flex-1">
                    <div className="w-full bg-zinc-700 rounded-full h-2 cursor-pointer"
                      onClick={(e) => {
                        if (!audioRef.current || !audioDuration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        audioRef.current.currentTime = pct * audioDuration;
                      }}
                    >
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-zinc-500">{formatTime(audioProgress)}</span>
                      <span className="text-[10px] text-zinc-500">{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 text-sm py-8">
                Không có audio.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
              >
                Tiếp tục → Làm câu hỏi
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Làm câu hỏi ── */}
        {STEPS[currentStep].id === "quiz" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">✏️ Làm câu hỏi</p>
              <p className="text-[12px] text-zinc-400">
                Chọn đáp án đúng cho {questions.length > 1 ? `${questions.length} câu hỏi` : "câu hỏi"} bên dưới.
              </p>
            </div>

            {/* Audio mini player */}
            {audioUrl && (
              <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/20 rounded-lg px-3 py-2">
                <button
                  onClick={toggleAudio}
                  className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm text-white hover:bg-zinc-600 transition"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <span className="text-[10px] text-zinc-500">Nghe lại audio nếu cần</span>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={q.id} className="bg-zinc-800/30 border border-zinc-700/30 rounded-xl p-4">
                  <p className="text-[13px] text-white font-medium mb-3">
                    Câu {qi + 1}: {q.question_text}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.listening_lesson_options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (!submitted) {
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.option_label }));
                          }
                        }}
                        disabled={submitted}
                        className={`text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] border transition-all ${
                          answers[q.id] === opt.option_label
                            ? "bg-red-600/15 border-red-600/30 text-white"
                            : "bg-zinc-800/40 border-zinc-700/30 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        <span className="font-bold text-zinc-500 shrink-0">{opt.option_label}.</span>
                        {(partNumber === 3 || partNumber === 4) && opt.option_text && (
                          <span>{opt.option_text}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < questions.length}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${
                  Object.keys(answers).length >= questions.length
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-600/20 hover:shadow-red-600/30"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none"
                }`}
              >
                Nộp bài →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Chấm điểm ── */}
        {STEPS[currentStep].id === "score" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-3">📊 Kết quả</p>
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-zinc-800 to-zinc-800/60 border-4 border-zinc-700/40 flex items-center justify-center mb-3">
                <span className={`text-3xl font-black ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {score}%
                </span>
              </div>
              <p className={`text-sm font-medium ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {score >= 70 ? "🎉 Tuyệt vời!" : score >= 40 ? "👍 Khá tốt!" : "💪 Cần cố gắng thêm!"}
              </p>
            </div>

            {/* Show correct / wrong answers */}
            <div className="space-y-2">
              {questions.map((q, qi) => {
                const userAnswer = answers[q.id];
                const correctOption = q.listening_lesson_options.find((o) => o.is_correct);
                const isCorrect = userAnswer === correctOption?.option_label;

                return (
                  <div
                    key={q.id}
                    className={`rounded-lg p-3 border text-[12px] ${
                      isCorrect
                        ? "bg-emerald-950/20 border-emerald-600/20 text-emerald-300"
                        : "bg-red-950/20 border-red-600/20 text-red-300"
                    }`}
                  >
                    <span className="font-medium">Câu {qi + 1}:</span>{" "}
                    {isCorrect ? (
                      <span>✓ Đúng ({userAnswer})</span>
                    ) : (
                      <span>
                        ✗ Sai — Bạn chọn {userAnswer}, đáp án đúng: {correctOption?.option_label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
            >
              Tiếp tục → Đọc lại lý thuyết
            </button>
          </div>
        )}

        {/* ── Step 6: Đọc lại lý thuyết ── */}
        {STEPS[currentStep].id === "review" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">📝 Đọc lại lý thuyết</p>
              <p className="text-[12px] text-zinc-400">
                Xem lại giải thích chi tiết cho từng câu hỏi.
              </p>
            </div>

            <div className="space-y-3">
              {questions.map((q, qi) => {
                const correctOption = q.listening_lesson_options.find((o) => o.is_correct);
                return (
                  <div key={q.id} className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-[13px] text-white font-medium mb-2">
                      Câu {qi + 1}: {q.question_text}
                    </p>
                    <p className="text-[11px] text-emerald-400 mb-2">
                      Đáp án đúng: <span className="font-semibold">{correctOption?.option_label}.</span>
                    </p>
                    {q.explanation && (
                      <div className="bg-blue-950/20 border border-blue-800/20 rounded-lg p-3">
                        <p className="text-[11px] text-blue-300/80">
                          💡 {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
            >
              ✅ Hoàn thành Group này
            </button>
          </div>
        )}

        {/* ── Step 7: Hoàn thành ── */}
        {STEPS[currentStep].id === "complete" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border-2 border-emerald-600/30 flex items-center justify-center text-4xl">
              🎉
            </div>
            <div>
              <p className="text-xl font-bold text-white mb-1">Hoàn thành!</p>
              <p className="text-[13px] text-zinc-400">
                Bạn đã hoàn thành Group này với điểm số <span className="text-white font-semibold">{score}%</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href="/dashboard/courses"
                className="py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all text-center"
              >
                ← Quay lại Học tập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
