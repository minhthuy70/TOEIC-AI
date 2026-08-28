"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ImageIcon,
  MessageSquare,
  Users,
  Mic,
  Edit3,
  FileText,
  BookOpen,
  AlertTriangle,
  ClipboardList,
  Headphones,
  Rocket,
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Menu,
  Clock,
  Bookmark,
  Music,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

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

const PART_ICONS: Record<number, React.ElementType> = {
  1: ImageIcon,
  2: MessageSquare,
  3: Users,
  4: Mic,
  5: Edit3,
  6: FileText,
  7: BookOpen,
};

function PartIcon({ partNumber, className = "w-5 h-5" }: { partNumber: number; className?: string }) {
  const Icon = PART_ICONS[partNumber] || FileText;
  return <Icon className={className} />;
}

/* ────────────────────────────────────────── */
/*           MAIN COMPONENT                   */
/* ────────────────────────────────────────── */
export default function PlacementTestPage() {
  const router = useRouter();

  // ── Data
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cooldownInfo, setCooldownInfo] = useState<{ canRetake: boolean; cooldownDays: number } | null>(null);

  // ── Test state
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // ── Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Scroll container ref
  const mainRef = useRef<HTMLElement | null>(null);

  // ── Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll to top of window and main content area on question, part, or start state change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex, currentPartIndex, started]);

  /* ── Fetch data ── */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    // Check cooldown
    if (token) {
      fetch(`${API}/profile/placement-test-cooldown`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setCooldownInfo(data))
        .catch(() => setCooldownInfo(null));
    }

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
          // Auto-submit when time expires (skip confirmation)
          setSubmitted(true);
          if (audioRef.current) {
            audioRef.current.pause();
          }
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
  const totalMarked = markedQuestions.size;

  // Check if it's the last question of the last part
  const isLastPart = testData ? currentPartIndex === testData.parts.length - 1 : false;
  const isLastQuestion = currentPart ? currentQuestionIndex === currentPart.questions.length - 1 : false;

  /* ── Helpers ── */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startTest = () => {
    if (!testData) return;
    if (cooldownInfo && !cooldownInfo.canRetake) {
      alert(`Bạn cần đợi ${cooldownInfo.cooldownDays} ngày nữa trước khi có thể làm lại bài test.`);
      return;
    }
    setShowInstructions(true);
  };

  const confirmStartTest = () => {
    if (!testData) return;
    if (cooldownInfo && !cooldownInfo.canRetake) {
      alert(`Bạn cần đợi ${cooldownInfo.cooldownDays} ngày nữa trước khi có thể làm lại bài test.`);
      return;
    }
    const totalMinutes =
      testData.testInfo.listeningTime + testData.testInfo.readingTime;
    setTimeLeft(totalMinutes * 60);
    setStarted(true);
    setShowInstructions(false);
  };

  const selectAnswer = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionKey]: option }));
  };

  const toggleMarkQuestion = () => {
    if (submitted) return;
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey);
      } else {
        newSet.add(questionKey);
      }
      return newSet;
    });
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
      setShowOnlyMarked(false); // Reset filter when navigating directly
    },
    [testData]
  );

  const goNext = () => {
    if (!testData || !currentPart || !currentQuestion) return;
    
    const questionsToNavigate = showOnlyMarked
      ? currentPart.questions.filter((q) => markedQuestions.has(`p${currentPart.partNumber}-q${q.questionNumber}`))
      : currentPart.questions;
    
    const currentQNum = currentQuestion.questionNumber;
    const currentIdxInFiltered = questionsToNavigate.findIndex((q) => q.questionNumber === currentQNum);
    
    if (currentIdxInFiltered < questionsToNavigate.length - 1) {
      const nextQ = questionsToNavigate[currentIdxInFiltered + 1];
      const actualIdx = currentPart.questions.findIndex((q) => q.questionNumber === nextQ.questionNumber);
      setCurrentQuestionIndex(actualIdx);
    } else {
      // Move to next part with questions
      for (let i = currentPartIndex + 1; i < testData.parts.length; i++) {
        const partQuestions = showOnlyMarked
          ? testData.parts[i].questions.filter((q) => markedQuestions.has(`p${testData.parts[i].partNumber}-q${q.questionNumber}`))
          : testData.parts[i].questions;
        
        if (partQuestions.length > 0) {
          setCurrentPartIndex(i);
          const firstQ = partQuestions[0];
          const actualIdx = testData.parts[i].questions.findIndex((q) => q.questionNumber === firstQ.questionNumber);
          setCurrentQuestionIndex(actualIdx);
          return;
        }
      }
    }
  };

  const goPrev = () => {
    if (!testData || !currentPart || !currentQuestion) return;
    
    const questionsToNavigate = showOnlyMarked
      ? currentPart.questions.filter((q) => markedQuestions.has(`p${currentPart.partNumber}-q${q.questionNumber}`))
      : currentPart.questions;
    
    const currentQNum = currentQuestion.questionNumber;
    const currentIdxInFiltered = questionsToNavigate.findIndex((q) => q.questionNumber === currentQNum);
    
    if (currentIdxInFiltered > 0) {
      const prevQ = questionsToNavigate[currentIdxInFiltered - 1];
      const actualIdx = currentPart.questions.findIndex((q) => q.questionNumber === prevQ.questionNumber);
      setCurrentQuestionIndex(actualIdx);
    } else {
      // Move to prev part with questions
      for (let i = currentPartIndex - 1; i >= 0; i--) {
        const partQuestions = showOnlyMarked
          ? testData.parts[i].questions.filter((q) => markedQuestions.has(`p${testData.parts[i].partNumber}-q${q.questionNumber}`))
          : testData.parts[i].questions;
        
        if (partQuestions.length > 0) {
          setCurrentPartIndex(i);
          const lastQ = partQuestions[partQuestions.length - 1];
          const actualIdx = testData.parts[i].questions.findIndex((q) => q.questionNumber === lastQ.questionNumber);
          setCurrentQuestionIndex(actualIdx);
          return;
        }
      }
    }
  };

  const goToPart = (partIdx: number) => {
    if (!testData) return;
    const part = testData.parts[partIdx];
    
    if (showOnlyMarked) {
      const markedQuestionsInPart = part.questions.filter((q) => 
        markedQuestions.has(`p${part.partNumber}-q${q.questionNumber}`)
      );
      if (markedQuestionsInPart.length > 0) {
        const firstMarkedQ = markedQuestionsInPart[0];
        const actualIdx = part.questions.findIndex((q) => q.questionNumber === firstMarkedQ.questionNumber);
        setCurrentPartIndex(partIdx);
        setCurrentQuestionIndex(actualIdx);
      } else {
        // If no marked questions in this part, show all and go to first question
        setShowOnlyMarked(false);
        setCurrentPartIndex(partIdx);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentPartIndex(partIdx);
      setCurrentQuestionIndex(0);
    }
    
    setSidebarOpen(false);
  };

  /* ── Submit ── */
  const handleSubmit = () => {
    if (submitted) return;
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setShowSubmitConfirm(false);

    // Save placement test result
    const score = calculateScore();
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetch(`${API}/profile/save-placement-test-result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: score.estimatedScore }),
      }).catch((err) => console.error("Failed to save placement test result:", err));
    }
  };

  /* ── Calculate score ── */
  const calculateScore = () => {
    if (!testData) return { correct: 0, total: 0, listening: 0, reading: 0, estimatedScore: 0, partScores: [] };

    let listeningCorrect = 0;
    let readingCorrect = 0;
    let listeningTotal = 0;
    let readingTotal = 0;
    const partScores: any[] = [];

    testData.parts.forEach((part) => {
      let partCorrect = 0;
      part.questions.forEach((q) => {
        const key = `p${part.partNumber}-q${q.questionNumber}`;
        const userAns = answers[key];
        const isCorrect =
          userAns === q.correctAnswer ||
          (userAns &&
            q.options &&
            q.options.indexOf(userAns) >= 0 &&
            String.fromCharCode(65 + q.options.indexOf(userAns)) === q.correctAnswer);

        if (isCorrect) partCorrect++;

        if (part.section === "listening") {
          listeningTotal++;
          if (isCorrect) listeningCorrect++;
        } else {
          readingTotal++;
          if (isCorrect) readingCorrect++;
        }
      });

      const partScore = part.questions.length > 0
        ? Math.round((partCorrect / part.questions.length) * 100)
        : 0;
      partScores.push({
        partNumber: part.partNumber,
        title: part.title,
        titleVi: part.titleVi,
        section: part.section,
        correct: partCorrect,
        total: part.questions.length,
        score: partScore,
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

    return { correct, total, listening: listeningScore, reading: readingScore, estimatedScore, partScores };
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
        <div className="text-center flex flex-col items-center">
          <p className="text-red-500 text-xl mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span>{error || "Lỗi tải dữ liệu"}</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
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
      <>
        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-red-600/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center text-red-400">
                    <ClipboardList className="w-5 h-5" />
                  </span>
                  <span>Hướng dẫn làm bài test</span>
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Test Overview */}
                <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-3">Thông tin bài test</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tổng câu hỏi</p>
                      <p className="text-white font-semibold">200 câu</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Thời gian</p>
                      <p className="text-white font-semibold">120 phút</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Listening</p>
                      <p className="text-red-400 font-semibold">100 câu (45 phút)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reading</p>
                      <p className="text-red-400 font-semibold">100 câu (75 phút)</p>
                    </div>
                  </div>
                </div>

                {/* Section A - Listening */}
                <div className="bg-blue-600/10 rounded-xl p-4 border border-blue-600/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Headphones className="w-5 h-5" />
                    <span>Section A - Listening</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Part 1:</strong> Mô tả hình ảnh (6 câu) - Chọn câu miêu tả đúng nhất</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Part 2:</strong> Hỏi - Đáp (25 câu) - Chọn câu trả lời phù hợp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Part 3:</strong> Đoạn hội thoại (39 câu) - Nghe hội thoại và trả lời câu hỏi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Part 4:</strong> Bài nói chuyện ngắn (30 câu) - Nghe thông báo/bài phát biểu</span>
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                    <p className="text-xs text-blue-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Lưu ý: Audio chỉ phát một lần. Hãy tập trung nghe kỹ trước khi chọn đáp án.</span>
                    </p>
                  </div>
                </div>

                {/* Section B - Reading */}
                <div className="bg-green-600/10 rounded-xl p-4 border border-green-600/20">
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Section B - Reading</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span><strong>Part 5:</strong> Hoàn thành câu (30 câu) - Chọn từ/cụm từ phù hợp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span><strong>Part 6:</strong> Hoàn thành đoạn văn (16 câu) - Điền từ vào chỗ trống</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span><strong>Part 7:</strong> Đọc hiểu (54 câu) - Đọc hiểu đoạn văn và trả lời câu hỏi</span>
                    </li>
                  </ul>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-600/10 rounded-xl p-4 border border-yellow-600/20">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Lưu ý quan trọng</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Bài test sẽ tự động nộp khi hết thời gian</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Có thể điều hướng giữa các câu hỏi bất cứ lúc nào</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Đáp án có thể thay đổi trước khi nộp bài</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Kết quả sẽ hiển thị ngay sau khi nộp bài</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={confirmStartTest}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Tôi đã hiểu, bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        )}

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

          {/* Cooldown Warning */}
          {cooldownInfo && !cooldownInfo.canRetake && (
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-yellow-400 font-semibold">Cooldown còn lại</p>
                  <p className="text-gray-400 text-sm">
                    Bạn cần đợi {cooldownInfo.cooldownDays} ngày nữa trước khi có thể làm lại bài test.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Test Info Card */}
          <div className="bg-zinc-900/80 backdrop-blur border border-red-600/20 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400">
                <ClipboardList className="w-4 h-4" />
              </span>
              <span>Thông tin bài test</span>
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
              <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <span>Cấu trúc bài test</span>
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
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400">
                          <PartIcon partNumber={part.partNumber} className="w-4 h-4" />
                        </div>
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
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400">
                          <PartIcon partNumber={part.partNumber} className="w-4 h-4" />
                        </div>
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
              className="inline-flex items-center justify-center gap-1.5 flex-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3.5 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="inline-flex items-center justify-center gap-1.5 flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl font-semibold transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Xem hướng dẫn</span>
            </button>
            <button
              onClick={startTest}
              className="inline-flex items-center justify-center gap-1.5 flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4" />
              <span>Bắt đầu làm bài</span>
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  /* ────────────────────────────────────── */
  /*     RENDER: RESULT SCREEN             */
  /* ────────────────────────────────────── */
  if (submitted) {
    const score = calculateScore();

    const getLevel = (s: number) => {
      if (s >= 905) return { level: "Advanced", color: "text-green-400", bg: "bg-green-500/20", stage: 5 };
      if (s >= 785) return { level: "Upper Intermediate", color: "text-blue-400", bg: "bg-blue-500/20", stage: 4 };
      if (s >= 605) return { level: "Intermediate", color: "text-yellow-400", bg: "bg-yellow-500/20", stage: 3 };
      if (s >= 405) return { level: "Pre-Intermediate", color: "text-orange-400", bg: "bg-orange-500/20", stage: 2 };
      return { level: "Beginner", color: "text-red-400", bg: "bg-red-500/20", stage: 1 };
    };

    const level = getLevel(score.estimatedScore);

    // Identify weaknesses
    const weakParts = score.partScores.filter((p: any) => p.score < 60);
    const strongestParts = score.partScores.filter((p: any) => p.score >= 70);

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-600/30 mb-4 text-white">
              <Target className="w-10 h-10" />
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
              <p className={`${level.color} font-semibold text-lg flex items-center justify-center gap-2`}>
                <BarChart3 className="w-5 h-5" />
                <span>{level.level}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Chặng đề xuất: {level.stage}</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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
            <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
              <div className="flex justify-between text-sm mb-2">
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

          {/* Performance Analysis */}
          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span>Phân tích hiệu suất theo Part</span>
            </h3>
            <div className="space-y-3">
              {score.partScores.map((part: any) => (
                <div key={part.partNumber} className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400">
                        <PartIcon partNumber={part.partNumber} className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Part {part.partNumber}: {part.title}</p>
                        <p className="text-gray-500 text-xs">{part.titleVi}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${part.score >= 70 ? 'text-green-400' : part.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {part.score}%
                      </p>
                      <p className="text-gray-500 text-xs">{part.correct}/{part.total}</p>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        part.score >= 70 ? 'bg-green-500' : part.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${part.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakness Identification */}
          {weakParts.length > 0 && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span>Điểm yếu cần cải thiện</span>
              </h3>
              <div className="space-y-2">
                {weakParts.map((part: any) => (
                  <div key={part.partNumber} className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-red-600/20">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400">
                      <PartIcon partNumber={part.partNumber} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Part {part.partNumber}: {part.titleVi}</p>
                      <p className="text-red-400 text-xs">Điểm: {part.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strongestParts.length > 0 && (
            <div className="bg-green-600/10 border border-green-600/20 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <span>Điểm mạnh</span>
              </h3>
              <div className="space-y-2">
                {strongestParts.map((part: any) => (
                  <div key={part.partNumber} className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-green-600/20">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-green-400">
                      <PartIcon partNumber={part.partNumber} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Part {part.partNumber}: {part.titleVi}</p>
                      <p className="text-green-400 text-xs">Điểm: {part.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const estimatedScore = calculateScore().estimatedScore;
                router.push(`/onboarding/stage-assignment?score=${estimatedScore}`);
              }}
              className="inline-flex items-center justify-center gap-1.5 flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/25"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
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
              <Menu className="w-5 h-5" />
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
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Đã đánh dấu</span>
              <span className="bg-yellow-600/20 text-yellow-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {totalMarked}
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
              <Clock className="w-4 h-4" />
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                Danh sách Part
              </p>
              <button
                onClick={() => setShowOnlyMarked(!showOnlyMarked)}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                  showOnlyMarked
                    ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                    : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{showOnlyMarked ? "Tất cả" : "Đã đánh dấu"}</span>
              </button>
            </div>

            {testData.parts.map((part, pIdx) => {
              const isActive = pIdx === currentPartIndex;
              const hasQuestions = part.questions.length > 0;
              const answeredInPart = part.questions.filter(
                (q) => answers[`p${part.partNumber}-q${q.questionNumber}`]
              ).length;
              const markedInPart = part.questions.filter(
                (q) => markedQuestions.has(`p${part.partNumber}-q${q.questionNumber}`)
              ).length;
              const isDisabled = showOnlyMarked && markedInPart === 0;

              return (
                <div key={part.partNumber} className="mb-3">
                  <button
                    onClick={() => !isDisabled && goToPart(pIdx)}
                    disabled={isDisabled}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                      isDisabled
                        ? "opacity-30 cursor-not-allowed text-gray-600"
                        : isActive
                        ? "bg-red-600/20 text-red-400 border border-red-600/30"
                        : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <PartIcon partNumber={part.partNumber} className="w-4 h-4" />
                      <span>Part {part.partNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasQuestions ? (
                        <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                          {showOnlyMarked ? (
                            <>
                              <span>{markedInPart}</span>
                              <Bookmark className="w-3 h-3 text-yellow-400" />
                            </>
                          ) : (
                            `${answeredInPart}/${part.questions.length}`
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500">—</span>
                      )}
                    </div>
                  </button>

                  {/* Question grid for active part */}
                  {isActive && hasQuestions && (
                    <div className="grid grid-cols-6 gap-1.5 mt-2 px-1">
                      {part.questions
                        .filter((q) => !showOnlyMarked || markedQuestions.has(`p${part.partNumber}-q${q.questionNumber}`))
                        .map((q, qIdx) => {
                          const key = `p${part.partNumber}-q${q.questionNumber}`;
                          const isAnswered = !!answers[key];
                          const isMarked = markedQuestions.has(key);
                          const actualQIdx = part.questions.findIndex((pq) => pq.questionNumber === q.questionNumber);
                          const isCurrent = actualQIdx === currentQuestionIndex;

                          return (
                            <button
                              key={q.questionNumber}
                              onClick={() => goToQuestion(pIdx, actualQIdx)}
                              className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all relative ${isCurrent
                                ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-600/30"
                                : isAnswered
                                  ? "bg-red-600/30 text-red-300 hover:bg-red-600/50"
                                  : "bg-zinc-800 text-gray-500 hover:bg-zinc-700 hover:text-white"
                                }`}
                            >
                              {q.questionNumber}
                              {isMarked && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full text-[8px] flex items-center justify-center text-black font-bold">
                                  !
                                </span>
                              )}
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
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-32 lg:px-8">
            {/* Part has no questions */}
            {!currentPart || currentPart.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-zinc-900/80 backdrop-blur border border-yellow-600/20 rounded-2xl p-10 text-center max-w-md">
                  <div className="w-20 h-20 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-400">
                    <AlertTriangle className="w-10 h-10" />
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Part trước</span>
                      </button>
                    )}
                    {currentPartIndex < testData.parts.length - 1 && (
                      <button
                        onClick={() => goToPart(currentPartIndex + 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
                      >
                        <span>Part sau</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
                    className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${currentPart.section === "listening"
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-green-600/20 text-green-400"
                      }`}
                  >
                    {currentPart.section === "listening" ? (
                      <>
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Listening</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Reading</span>
                      </>
                    )}
                  </span>
                  <span className="text-gray-600 text-xs">
                    Part {currentPart.partNumber} • {currentPart.titleVi}
                  </span>
                </div>

                {/* Audio player for listening parts */}
                {currentPart.section === "listening" && currentPart.audio && (
                  <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-red-400" />
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleMarkQuestion}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            markedQuestions.has(questionKey)
                              ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                              : "bg-zinc-700 text-gray-400 hover:text-white border border-zinc-600"
                          }`}
                          title="Đánh dấu để xem lại"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${markedQuestions.has(questionKey) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          <span>{markedQuestions.has(questionKey) ? "Đã đánh dấu" : "Đánh dấu"}</span>
                        </button>
                        <span className="text-gray-500 text-xs">
                          {currentQuestionIndex + 1} / {currentPart.questions.length} (Part {currentPart.partNumber})
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Image for Question */}
                      {currentQuestion.image && (
                        <div className="mb-6 flex justify-center">
                          <div className="relative rounded-xl overflow-hidden border border-zinc-700 shadow-2xl max-w-lg w-full bg-zinc-900 min-h-40 flex items-center justify-center">
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Câu trước</span>
                      </button>

                      <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-[300px] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {(showOnlyMarked
                          ? currentPart.questions.filter((q) => markedQuestions.has(`p${currentPart.partNumber}-q${q.questionNumber}`))
                          : currentPart.questions
                        )
                          .slice(Math.max(0, currentQuestionIndex - 4), currentQuestionIndex + 6)
                          .map((q, offsetIdx) => {
                            const actualIdx = currentPart.questions.findIndex((pq) => pq.questionNumber === q.questionNumber);
                            const key = `p${currentPart.partNumber}-q${q.questionNumber}`;
                            return (
                              <button
                                key={q.questionNumber}
                                onClick={() => goToQuestion(currentPartIndex, actualIdx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${actualIdx === currentQuestionIndex
                                  ? "bg-red-500 scale-125"
                                  : markedQuestions.has(key)
                                    ? "bg-yellow-500"
                                    : answers[key]
                                      ? "bg-red-600/50"
                                      : "bg-zinc-700"
                                  }`}
                              />
                            );
                          })}
                      </div>

                      {isLastPart && isLastQuestion ? (
                        <button
                          onClick={handleSubmit}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                        >
                          Nộp bài
                        </button>
                      ) : (
                        <button
                          onClick={goNext}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-all"
                        >
                          <span>Câu sau</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-red-600/30 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Xác nhận nộp bài</h2>
              <p className="text-gray-400 text-sm">
                Bạn có chắc muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi đáp án.
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6 border border-zinc-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Đã trả lời</span>
                <span className="text-white font-semibold">{totalAnswered} / {totalAvailableQuestions}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Đã đánh dấu</span>
                <span className="text-yellow-400 font-semibold">{totalMarked}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Thời gian còn lại</span>
                <span className={`font-semibold ${timeLeft < 300 ? "text-red-400" : "text-white"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3 rounded-xl font-semibold transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
