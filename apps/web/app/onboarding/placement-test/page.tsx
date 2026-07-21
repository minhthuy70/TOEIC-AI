"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ───────── Types ───────── */
interface Question {
  questionNumber: number;
  image?: string;
  text?: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
}

interface Part {
  partNumber: number;
  title: string;
  titleVi: string;
  section: "listening" | "reading";
  description: string;
  totalQuestions: number;
  audio?: string;
  questions: Question[];
}

interface TestData {
  testInfo: {
    title: string;
    totalQuestions: number;
    listeningTime: number;
    readingTime: number;
  };
  parts: Part[];
}

/* ───────── Constants ───────── */
const API = "http://localhost:3001";

const PART_ICONS: Record<number, string> = {
  1: "🖼️",
  2: "💬",
  3: "🗣️",
  4: "🎙️",
  5: "✏️",
  6: "📝",
  7: "📖",
};

/* ────────────────────────────────────────── */
/*           MAIN COMPONENT                   */
/* ────────────────────────────────────────── */
export default function PlacementTestPage() {
  const router = useRouter();

  // ── Data
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Test state
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // ── Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Fetch data ── */
  useEffect(() => {
    fetch(`${API}/placement-test`)
      .then((r) => r.json())
      .then((d: TestData) => {
        setTestData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu bài test");
        setLoading(false);
      });
  }, []);

  /* ── Timer logic ── */
  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, submitted]);

  /* ── Derived values ── */
  const currentPart = testData?.parts[currentPartIndex];
  const currentQuestion = currentPart?.questions[currentQuestionIndex];
  const questionKey = currentQuestion
    ? `p${currentPart!.partNumber}-q${currentQuestion.questionNumber}`
    : "";

  // Count total available questions across all parts
  const totalAvailableQuestions =
    testData?.parts.reduce((s, p) => s + p.questions.length, 0) ?? 0;
  const totalAnswered = Object.keys(answers).length;

  /* ── Helpers ── */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startTest = () => {
    if (!testData) return;
    const totalMinutes =
      testData.testInfo.listeningTime + testData.testInfo.readingTime;
    setTimeLeft(totalMinutes * 60);
    setStarted(true);
  };

  const selectAnswer = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionKey]: option }));
  };

  /* ── Navigation ── */
  const goToQuestion = useCallback(
    (partIdx: number, qIdx: number) => {
      if (!testData) return;
      const part = testData.parts[partIdx];
      if (!part || part.questions.length === 0) return;
      if (qIdx < 0 || qIdx >= part.questions.length) return;
      setCurrentPartIndex(partIdx);
      setCurrentQuestionIndex(qIdx);
      setSidebarOpen(false);
    },
    [testData]
  );

  const goNext = () => {
    if (!testData || !currentPart) return;
    if (currentQuestionIndex < currentPart.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Move to next part with questions
      for (let i = currentPartIndex + 1; i < testData.parts.length; i++) {
        if (testData.parts[i].questions.length > 0) {
          setCurrentPartIndex(i);
          setCurrentQuestionIndex(0);
          return;
        }
      }
    }
  };

  const goPrev = () => {
    if (!testData || !currentPart) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else {
      // Move to prev part with questions
      for (let i = currentPartIndex - 1; i >= 0; i--) {
        if (testData.parts[i].questions.length > 0) {
          setCurrentPartIndex(i);
          setCurrentQuestionIndex(testData.parts[i].questions.length - 1);
          return;
        }
      }
    }
  };

  const goToPart = (partIdx: number) => {
    if (!testData) return;
    setCurrentPartIndex(partIdx);
    setCurrentQuestionIndex(0);
    setSidebarOpen(false);
  };

  /* ── Submit ── */
  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  /* ── Calculate score ── */
  const calculateScore = () => {
    if (!testData) return { correct: 0, total: 0, listening: 0, reading: 0, estimatedScore: 0 };

    let listeningCorrect = 0;
    let readingCorrect = 0;
    let listeningTotal = 0;
    let readingTotal = 0;

    testData.parts.forEach((part) => {
      part.questions.forEach((q) => {
        const key = `p${part.partNumber}-q${q.questionNumber}`;
        const userAns = answers[key];
        const isCorrect =
          userAns === q.correctAnswer ||
          (userAns &&
            q.options &&
            q.options.indexOf(userAns) >= 0 &&
            String.fromCharCode(65 + q.options.indexOf(userAns)) === q.correctAnswer);

        if (part.section === "listening") {
          listeningTotal++;
          if (isCorrect) listeningCorrect++;
        } else {
          readingTotal++;
          if (isCorrect) readingCorrect++;
        }
      });
    });

    const total = listeningTotal + readingTotal;
    const correct = listeningCorrect + readingCorrect;

    // Estimate TOEIC score: scale to 990
    const listeningScore = listeningTotal > 0
      ? Math.round((listeningCorrect / listeningTotal) * 495)
      : 0;
    const readingScore = readingTotal > 0
      ? Math.round((readingCorrect / readingTotal) * 495)
      : 0;
    const estimatedScore = listeningScore + readingScore;

    return { correct, total, listening: listeningScore, reading: readingScore, estimatedScore };
  };

  /* ────────────────────────────────────── */
  /*          RENDER: LOADING              */
  /* ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4 text-lg">Đang tải bài test...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">⚠️ {error || "Lỗi tải dữ liệu"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────── */
  /*     RENDER: INTRO SCREEN              */
  /* ────────────────────────────────────── */
  if (!started) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <h1 className="text-3xl font-bold text-red-500 mt-4">
              Bài Test Xếp Trình Độ
            </h1>
            <p className="text-gray-400 mt-2">
              Đánh giá trình độ TOEIC hiện tại của bạn
            </p>
          </div>

          {/* Test Info Card */}
          <div className="bg-zinc-900/80 backdrop-blur border border-red-600/20 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400">📋</span>
              Thông tin bài test
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Tổng câu hỏi</p>
                <p className="text-2xl font-bold text-white mt-1">200</p>
              </div>
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Thời gian</p>
                <p className="text-2xl font-bold text-white mt-1">120 <span className="text-sm font-normal text-gray-400">phút</span></p>
              </div>
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Listening</p>
                <p className="text-2xl font-bold text-red-400 mt-1">100 <span className="text-sm font-normal text-gray-400">câu</span></p>
              </div>
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Reading</p>
                <p className="text-2xl font-bold text-red-400 mt-1">100 <span className="text-sm font-normal text-gray-400">câu</span></p>
              </div>
            </div>
          </div>

          {/* Parts Overview */}
          <div className="bg-zinc-900/80 backdrop-blur border border-red-600/20 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400">📊</span>
              Cấu trúc bài test
            </h2>

            <div className="space-y-2">
              {/* Listening Section */}
              <div className="mb-3">
                <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Section A — Listening
                </p>
                {testData.parts
                  .filter((p) => p.section === "listening")
                  .map((part) => (
                    <div
                      key={part.partNumber}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{PART_ICONS[part.partNumber]}</span>
                        <div>
                          <p className="text-white text-sm font-medium">
                            Part {part.partNumber}: {part.title}
                          </p>
                          <p className="text-gray-500 text-xs">{part.titleVi}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{part.totalQuestions} câu</span>
                        {part.questions.length > 0 ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Có dữ liệu" />
                        ) : (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Chưa có dữ liệu" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Reading Section */}
              <div>
                <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Section B — Reading
                </p>
                {testData.parts
                  .filter((p) => p.section === "reading")
                  .map((part) => (
                    <div
                      key={part.partNumber}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{PART_ICONS[part.partNumber]}</span>
                        <div>
                          <p className="text-white text-sm font-medium">
                            Part {part.partNumber}: {part.title}
                          </p>
                          <p className="text-gray-500 text-xs">{part.titleVi}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{part.totalQuestions} câu</span>
                        {part.questions.length > 0 ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Có dữ liệu" />
                        ) : (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Chưa có dữ liệu" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3.5 rounded-xl font-semibold transition-all"
            >
              ← Quay lại
            </button>
            <button
              onClick={startTest}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-[0.98]"
            >
              🚀 Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────── */
  /*     RENDER: RESULT SCREEN             */
  /* ────────────────────────────────────── */
  if (submitted) {
    const score = calculateScore();

    const getLevel = (s: number) => {
      if (s >= 905) return { level: "Advanced", color: "text-green-400", bg: "bg-green-500/20" };
      if (s >= 785) return { level: "Upper Intermediate", color: "text-blue-400", bg: "bg-blue-500/20" };
      if (s >= 605) return { level: "Intermediate", color: "text-yellow-400", bg: "bg-yellow-500/20" };
      if (s >= 405) return { level: "Pre-Intermediate", color: "text-orange-400", bg: "bg-orange-500/20" };
      return { level: "Beginner", color: "text-red-400", bg: "bg-red-500/20" };
    };

    const level = getLevel(score.estimatedScore);

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-600/30 mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Kết quả bài test</h1>
          </div>

          {/* Score Card */}
          <div className="bg-zinc-900/80 backdrop-blur border border-red-600/20 rounded-2xl p-6 mb-4">
            {/* Estimated Score */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Điểm TOEIC ước tính</p>
              <p className="text-6xl font-bold text-red-500 mt-2">{score.estimatedScore}</p>
              <p className="text-gray-500 text-sm mt-1">/ 990</p>
            </div>

            {/* Level Badge */}
            <div className={`${level.bg} rounded-xl p-3 text-center mb-6`}>
              <p className={`${level.color} font-semibold text-lg`}>📊 {level.level}</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Listening</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{score.listening}</p>
                <p className="text-gray-600 text-xs mt-1">/ 495</p>
              </div>
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Reading</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{score.reading}</p>
                <p className="text-gray-600 text-xs mt-1">/ 495</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 bg-black/50 rounded-xl p-4 border border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Số câu đúng</span>
                <span className="text-white font-semibold">{score.correct} / {score.total}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${score.total > 0 ? (score.correct / score.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (user.id) {
                  fetch(`${API}/profile/complete-first-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: user.id,
                      currentScore: score.estimatedScore,
                      targetScore: 990,
                      examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    }),
                  }).then(() => {
                    window.location.href = "/dashboard";
                  });
                } else {
                  window.location.href = "/dashboard";
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/25"
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────── */
  /*     RENDER: TEST IN PROGRESS          */
  /* ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ─── Top Header Bar ─── */}
      <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Logo + Part info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">B</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  Part {currentPart?.partNumber}: {currentPart?.title}
                </p>
                <p className="text-gray-500 text-xs">{currentPart?.titleVi}</p>
              </div>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Đã trả lời</span>
              <span className="bg-red-600/20 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {totalAnswered} / {totalAvailableQuestions}
              </span>
            </div>
            <div className="w-32 bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${totalAvailableQuestions > 0 ? (totalAnswered / totalAvailableQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Right: Timer + Submit */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${timeLeft < 300
                ? "bg-red-600/20 text-red-400 animate-pulse"
                : "bg-zinc-800 text-white"
                }`}
            >
              <span>⏱</span>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900/95 backdrop-blur-md border-r border-zinc-800
            transform transition-transform duration-300 lg:relative lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            overflow-y-auto pt-16 lg:pt-0
          `}
        >
          {/* Overlay on mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-[-1] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-3">
              Danh sách Part
            </p>

            {testData.parts.map((part, pIdx) => {
              const isActive = pIdx === currentPartIndex;
              const hasQuestions = part.questions.length > 0;
              const answeredInPart = part.questions.filter(
                (q) => answers[`p${part.partNumber}-q${q.questionNumber}`]
              ).length;

              return (
                <div key={part.partNumber} className="mb-3">
                  <button
                    onClick={() => goToPart(pIdx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${isActive
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{PART_ICONS[part.partNumber]}</span>
                      <span>Part {part.partNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasQuestions ? (
                        <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                          {answeredInPart}/{part.questions.length}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500">—</span>
                      )}
                    </div>
                  </button>

                  {/* Question grid for active part */}
                  {isActive && hasQuestions && (
                    <div className="grid grid-cols-6 gap-1.5 mt-2 px-1">
                      {part.questions.map((q, qIdx) => {
                        const key = `p${part.partNumber}-q${q.questionNumber}`;
                        const isAnswered = !!answers[key];
                        const isCurrent = qIdx === currentQuestionIndex;

                        return (
                          <button
                            key={q.questionNumber}
                            onClick={() => goToQuestion(pIdx, qIdx)}
                            className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all ${isCurrent
                              ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-600/30"
                              : isAnswered
                                ? "bg-red-600/30 text-red-300 hover:bg-red-600/50"
                                : "bg-zinc-800 text-gray-500 hover:bg-zinc-700 hover:text-white"
                              }`}
                          >
                            {q.questionNumber}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8">
            {/* Part has no questions */}
            {!currentPart || currentPart.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-zinc-900/80 backdrop-blur border border-yellow-600/20 rounded-2xl p-10 text-center max-w-md">
                  <div className="w-20 h-20 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🚧</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Part {currentPart?.partNumber}: {currentPart?.title}
                  </h2>
                  <p className="text-gray-400 mb-1">{currentPart?.titleVi}</p>
                  <p className="text-yellow-400/80 text-sm mt-4">
                    Dữ liệu cho Part này đang được cập nhật.
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    {currentPart?.description}
                  </p>
                  <p className="text-gray-500 text-sm mt-4">
                    Tổng cộng: <span className="text-white font-semibold">{currentPart?.totalQuestions} câu</span>
                  </p>

                  {/* Navigate to other parts */}
                  <div className="flex gap-2 mt-6 justify-center">
                    {currentPartIndex > 0 && (
                      <button
                        onClick={() => goToPart(currentPartIndex - 1)}
                        className="px-4 py-2 border border-zinc-700 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
                      >
                        ← Part trước
                      </button>
                    )}
                    {currentPartIndex < testData.parts.length - 1 && (
                      <button
                        onClick={() => goToPart(currentPartIndex + 1)}
                        className="px-4 py-2 border border-zinc-700 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
                      >
                        Part sau →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ─── Question Display ─── */
              <>
                {/* Section badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${currentPart.section === "listening"
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-green-600/20 text-green-400"
                      }`}
                  >
                    {currentPart.section === "listening" ? "🎧 Listening" : "📖 Reading"}
                  </span>
                  <span className="text-gray-600 text-xs">
                    Part {currentPart.partNumber} • {currentPart.titleVi}
                  </span>
                </div>

                {/* Audio player for listening parts */}
                {currentPart.section === "listening" && currentPart.audio && (
                  <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 text-lg">🎵</span>
                      <audio
                        ref={audioRef}
                        src={`${API}${currentPart.audio}`}
                        controls
                        className="flex-1 h-10"
                        style={{ filter: "invert(1) hue-rotate(180deg)" }}
                      />
                    </div>
                  </div>
                )}

                {/* Question Card */}
                {currentQuestion && (
                  <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Question header */}
                    <div className="bg-zinc-800/50 px-6 py-3 flex items-center justify-between border-b border-zinc-700/50">
                      <h3 className="text-white font-semibold">
                        Câu {currentQuestion.questionNumber}
                      </h3>
                      <span className="text-gray-500 text-xs">
                        {currentQuestionIndex + 1} / {currentPart.questions.length} (Part {currentPart.partNumber})
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Image for Question */}
                      {currentQuestion.image && (
                        <div className="mb-6 flex justify-center">
                          <div className="relative rounded-xl overflow-hidden border border-zinc-700 shadow-2xl max-w-lg w-full bg-zinc-900 min-h-[160px] flex items-center justify-center">
                            <img
                              src={
                                currentQuestion.image.startsWith("http")
                                  ? currentQuestion.image
                                  : `${API}${currentQuestion.image.startsWith("/") ? "" : "/"}${currentQuestion.image}`
                              }
                              alt={`Question ${currentQuestion.questionNumber}`}
                              className="w-full h-auto object-contain bg-zinc-800"
                              onError={(e) => {
                                const target = e.currentTarget;
                                // Fallback strategy: try by questionNumber if group_id filename failed
                                const altSrc = `${API}/uploads/tests/placement-test/images/part${currentPart.partNumber}/${currentQuestion.questionNumber}.jpg`;
                                if (target.src !== altSrc) {
                                  target.src = altSrc;
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Passage / Text */}
                      {currentQuestion.passage && (
                        <div className="bg-black/40 rounded-xl p-5 mb-6 border border-zinc-800">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {currentQuestion.passage}
                          </p>
                        </div>
                      )}

                      {currentQuestion.text && (
                        <p className="text-white text-lg mb-6">{currentQuestion.text}</p>
                      )}

                      {/* For Part 1 - description */}
                      {currentPart.partNumber === 1 && !currentQuestion.text && (
                        <p className="text-gray-400 text-sm mb-5 italic">
                          Hãy nghe audio và chọn câu miêu tả đúng nhất cho bức tranh trên.
                        </p>
                      )}

                      {/* Options */}
                      <div className="space-y-3">
                        {currentQuestion.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isSelected = answers[questionKey] === opt;

                          return (
                            <button
                              key={i}
                              onClick={() => selectAnswer(opt)}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group ${isSelected
                                ? "bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-600/10"
                                : "bg-black/30 border-zinc-800 text-gray-300 hover:border-zinc-600 hover:bg-zinc-800/50"
                                }`}
                            >
                              <span
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${isSelected
                                  ? "bg-red-600 text-white"
                                  : "bg-zinc-800 text-gray-400 group-hover:bg-zinc-700 group-hover:text-white"
                                  }`}
                              >
                                {letter}
                              </span>
                              <span className="font-medium">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="bg-zinc-800/30 px-6 py-4 flex items-center justify-between border-t border-zinc-700/50">
                      <button
                        onClick={goPrev}
                        disabled={currentPartIndex === 0 && currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Câu trước
                      </button>

                      <div className="flex gap-1.5">
                        {currentPart.questions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToQuestion(currentPartIndex, idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentQuestionIndex
                              ? "bg-red-500 scale-125"
                              : answers[`p${currentPart.partNumber}-q${currentPart.questions[idx].questionNumber}`]
                                ? "bg-red-600/50"
                                : "bg-zinc-700"
                              }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={goNext}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        Câu sau →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
