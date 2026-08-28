"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getListeningGroupById,
  submitListeningGroup,
  type ListeningGroup,
  type ListeningQuestion,
} from "@/services/listening";
import {
  Headphones,
  BookOpen,
  RotateCcw,
  Edit3,
  BarChart3,
  FileText,
  Check,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Trophy,
  X,
  Loader2,
} from "lucide-react";

// ─── Learning flow steps ───
const STEPS = [
  { id: "listen", label: "Nghe", icon: Headphones },
  { id: "explain", label: "Học / Giải thích", icon: BookOpen },
  { id: "listen2", label: "Nghe lại", icon: RotateCcw },
  { id: "quiz", label: "Làm câu hỏi", icon: Edit3 },
  { id: "score", label: "Chấm điểm", icon: BarChart3 },
  { id: "review", label: "Đọc lại lý thuyết", icon: FileText },
  { id: "complete", label: "Hoàn thành", icon: Check },
];

const PART_LABELS: Record<number, string> = {
  1: "Part 1: Photographs",
  2: "Part 2: Question-Response",
  3: "Part 3: Conversations",
  4: "Part 4: Talks",
};

function ListeningLearnContent() {
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
    const questions = group.listening_lesson_questions || [];
    let correct = 0;

    questions.forEach((q) => {
      const correctOption = q.listening_lesson_options.find((o) => o.is_correct);
      if (correctOption && answers[q.id] === correctOption.option_label) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    try {
      await submitListeningGroup(groupId, calculatedScore);
    } catch (error) {
      console.error("Submit error:", error);
    }

    setCurrentStep(4); // Go to score step
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      // Pause audio when switching steps
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-32 bg-zinc-800/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-zinc-400 text-lg">Không tìm thấy dữ liệu bài học.</p>
        <Link
          href="/dashboard/courses"
          className="mt-4 inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Học tập</span>
        </Link>
      </div>
    );
  }

  const questions = group.listening_lesson_questions || [];
  const audioUrl = group.audio_url
    ? group.audio_url.startsWith("http")
      ? group.audio_url
      : `http://localhost:3001${group.audio_url}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
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
            <ArrowLeft className="w-4 h-4" />
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
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            return (
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
                    {i < currentStep ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
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
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 min-h-[300px]">
        {/* Render Image if exists (Especially for Part 1) */}
        {group.image_url && (
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <p className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Headphones className="w-5 h-5 text-red-500" />
                <span>Nghe audio</span>
              </p>
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
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
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
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 hover:scale-[1.01] transition-all"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
              <span>Học / Giải thích</span>
            </button>
          </div>
        )}

        {/* ── Step 2: Giải thích ── */}
        {STEPS[currentStep].id === "explain" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-red-500" />
                <span>Học / Giải thích</span>
              </p>
              <p className="text-[12px] text-zinc-400">
                Đọc phần giải thích bên dưới để hiểu rõ nội dung audio.
              </p>
            </div>

            {/* Kiến thức cần nắm */}
            {group.knowledge && (
              <div className="bg-gradient-to-r from-amber-950/30 to-orange-950/20 border border-amber-700/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
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
                className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
                <span>Nghe lại</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Nghe lại ── */}
        {STEPS[currentStep].id === "listen2" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-400" />
                <span>Nghe lại</span>
              </p>
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
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
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
                className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
                <span>Làm câu hỏi</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Làm câu hỏi ── */}
        {STEPS[currentStep].id === "quiz" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Edit3 className="w-5 h-5 text-red-500" />
                <span>Làm câu hỏi</span>
              </p>
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
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600 font-medium text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < questions.length}
                className={`flex items-center justify-center gap-1.5 flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${
                  Object.keys(answers).length >= questions.length
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-600/20 hover:shadow-red-600/30"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Nộp bài</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Chấm điểm ── */}
        {STEPS[currentStep].id === "score" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-3 flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Kết quả</span>
              </p>
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-zinc-800 to-zinc-800/60 border-4 border-zinc-700/40 flex items-center justify-center mb-3">
                <span className={`text-3xl font-black ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {score}%
                </span>
              </div>
              <p className={`text-sm font-medium ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {score >= 70 ? "Tuyệt vời!" : score >= 40 ? "Khá tốt!" : "Cần cố gắng thêm!"}
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
                    className={`rounded-lg p-3 border text-[12px] flex items-center justify-between ${
                      isCorrect
                        ? "bg-emerald-950/20 border-emerald-600/20 text-emerald-300"
                        : "bg-red-950/20 border-red-600/20 text-red-300"
                    }`}
                  >
                    <div>
                      <span className="font-medium">Câu {qi + 1}:</span>{" "}
                      {isCorrect ? (
                        <span>Đúng ({userAnswer})</span>
                      ) : (
                        <span>
                          Sai — Bạn chọn {userAnswer}, đáp án đúng: {correctOption?.option_label}
                        </span>
                      )}
                    </div>
                    {isCorrect ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
              <span>Đọc lại lý thuyết</span>
            </button>
          </div>
        )}

        {/* ── Step 6: Đọc lại lý thuyết ── */}
        {STEPS[currentStep].id === "review" && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <span>Đọc lại lý thuyết</span>
              </p>
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
                      <div className="bg-blue-950/20 border border-blue-800/20 rounded-lg p-3 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-300/80">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Hoàn thành Group này</span>
            </button>
          </div>
        )}

        {/* ── Step 7: Hoàn thành ── */}
        {STEPS[currentStep].id === "complete" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border-2 border-emerald-600/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-10 h-10" />
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
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Học tập</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListeningLearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="flex items-center gap-2 text-zinc-400"><Loader2 className="w-5 h-5 animate-spin text-red-500" /><span>Đang tải...</span></div></div>}>
      <ListeningLearnContent />
    </Suspense>
  );
}
