"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getMockTestHistory,
  getMockTests,
  startMockTest,
  startCustomFullTest,
  deleteMockTestAttempt,
  getMockTestAnalytics,
  type MockTest,
  type MockTestHistoryItem,
  type MockTestAnalyticsResponse,
} from "@/services/mock-test";
import {
  ClipboardList,
  Settings,
  Zap,
  AlertTriangle,
  FileText,
  Clock,
  Headphones,
  BookOpen,
  Rocket,
  Search,
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Trash2,
  Check,
  X,
  Target,
  Sparkles,
  Lightbulb,
  Info,
  Scale,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

export default function MockTestPage() {
  const router = useRouter();

  const [tab, setTab] =
    useState<"tests" | "history" | "analytics">(
      "tests",
    );

  const [tests, setTests] =
    useState<MockTest[]>([]);

  const [
    history,
    setHistory,
  ] =
    useState<
      MockTestHistoryItem[]
    >([]);

  const [analyticsData, setAnalyticsData] = useState<MockTestAnalyticsResponse | null>(null);
  const [analyticsMetric, setAnalyticsMetric] = useState<"total" | "listening" | "reading">("total");

  const [loading, setLoading] =
    useState(true);

  const [
    startingTestId,
    setStartingTestId,
  ] = useState<number | null>(
    null,
  );

  const [error, setError] =
    useState("");

  // Modal State for Full Test Config & Instructions
  const [configModalTest, setConfigModalTest] = useState<MockTest | null>(null);
  const [testMode, setTestMode] = useState<"standard" | "custom">("standard");
  const [selectedParts, setSelectedParts] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [listeningMinutes, setListeningMinutes] = useState<number>(45);
  const [readingMinutes, setReadingMinutes] = useState<number>(75);

  // 7.3 History Feature States
  const [historyTypeFilter, setHistoryTypeFilter] = useState<"all" | "full" | "mini">("all");
  const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [historyScoreFilter, setHistoryScoreFilter] = useState<"all" | "low" | "mid" | "high" | "expert">("all");
  const [historySort, setHistorySort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [historySearch, setHistorySearch] = useState<string>("");

  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [quickDetailItem, setQuickDetailItem] = useState<MockTestHistoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MockTestHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        testsData,
        historyData,
        analyticsRes,
      ] = await Promise.all([
        getMockTests(),
        getMockTestHistory(),
        getMockTestAnalytics().catch((e) => {
          console.error("Error loading analytics:", e);
          return null;
        }),
      ]);

      setTests(testsData);
      setHistory(historyData);
      if (analyticsRes) {
        setAnalyticsData(analyticsRes);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu thi thử.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // START TEST
  // ==========================================================

  async function handleStartTest(
    testId: number,
  ) {
    if (startingTestId) {
      return;
    }

    try {
      setStartingTestId(testId);
      setError("");

      const result =
        await startMockTest(
          testId,
        );

      router.push(
        `/dashboard/mock-test/${result.attemptId}`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể bắt đầu bài thi.",
      );
    } finally {
      setStartingTestId(null);
    }
  }

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const completed =
      history.filter(
        (item) =>
          item.submittedAt !== null,
      );

    if (
      completed.length === 0
    ) {
      return {
        count: 0,
        average: 0,
        highest: 0,
      };
    }

    const scores =
      completed
        .map(
          (item) =>
            item.totalScore ?? 0,
        )
        .filter(
          (score) =>
            score > 0,
        );

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) =>
                sum + score,
              0,
            ) /
              scores.length,
          )
        : 0;

    const highest =
      scores.length > 0
        ? Math.max(
            ...scores,
          )
        : 0;

    return {
      count:
        completed.length,

      average,

      highest,
    };
  }, [history]);

  // ==========================================================
  // FILTERED & SORTED HISTORY (7.3)
  // ==========================================================

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        // Search filter
        if (historySearch.trim()) {
          const q = historySearch.toLowerCase();
          const matchesTitle = item.testTitle?.toLowerCase().includes(q);
          const matchesId = item.id.toString().includes(q);
          if (!matchesTitle && !matchesId) return false;
        }

        // Test Type filter (mini vs full)
        if (historyTypeFilter === "mini" && (item.totalQuestions > 50)) return false;
        if (historyTypeFilter === "full" && (item.totalQuestions <= 50)) return false;

        // Date range filter
        if (historyDateFilter !== "all") {
          const itemDate = new Date(item.createdAt).getTime();
          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          if (historyDateFilter === "7d" && now - itemDate > 7 * dayMs) return false;
          if (historyDateFilter === "30d" && now - itemDate > 30 * dayMs) return false;
          if (historyDateFilter === "90d" && now - itemDate > 90 * dayMs) return false;
        }

        // Score range filter
        if (historyScoreFilter !== "all") {
          const score = item.totalScore ?? 0;
          if (historyScoreFilter === "low" && score >= 500) return false;
          if (historyScoreFilter === "mid" && (score < 500 || score >= 700)) return false;
          if (historyScoreFilter === "high" && (score < 700 || score >= 850)) return false;
          if (historyScoreFilter === "expert" && score < 850) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (historySort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (historySort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (historySort === "highest") {
          return (b.totalScore ?? 0) - (a.totalScore ?? 0);
        }
        if (historySort === "lowest") {
          return (a.totalScore ?? 0) - (b.totalScore ?? 0);
        }
        return 0;
      });
  }, [history, historySearch, historyTypeFilter, historyDateFilter, historyScoreFilter, historySort]);

  const toggleCompare = (id: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        showToast("Chỉ có thể so sánh tối đa 2 bài thi cùng lúc.");
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleDeleteAttempt = async () => {
    if (!deleteConfirmItem) return;
    try {
      setIsDeleting(true);
      await deleteMockTestAttempt(deleteConfirmItem.id);
      setHistory((prev) => prev.filter((item) => item.id !== deleteConfirmItem.id));
      setSelectedForCompare((prev) => prev.filter((id) => id !== deleteConfirmItem.id));
      showToast(`Đã xóa bài thi #${deleteConfirmItem.id} thành công.`);
      setDeleteConfirmItem(null);
    } catch (err: any) {
      alert(err?.message || "Lỗi khi xóa bài thi!");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportHistory = (format: "csv" | "json") => {
    if (filteredHistory.length === 0) {
      showToast("Không có dữ liệu bài thi để xuất!");
      return;
    }

    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredHistory, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `TOEIC_Test_History_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Đã xuất lịch sử dạng JSON thành công!");
    } else {
      const headers = ["Attempt ID", "Test Title", "Total Questions", "Listening Score", "Reading Score", "Total Score", "Correct Count", "Date"];
      const rows = filteredHistory.map((item) => [
        item.id,
        `"${(item.testTitle || "").replace(/"/g, '""')}"`,
        item.totalQuestions,
        item.listeningScore ?? 0,
        item.readingScore ?? 0,
        item.totalScore ?? 0,
        `${item.totalCorrect ?? 0}/${item.totalQuestions}`,
        `"${new Date(item.createdAt).toLocaleString("vi-VN")}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TOEIC_Test_History_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Đã xuất lịch sử dạng CSV thành công!");
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        <div className="animate-pulse flex items-center gap-2">
          <Clock className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu thi thử...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-red-500" />

            <div>
              <h1 className="text-3xl font-bold">
                Thi thử TOEIC
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Full TOEIC Test · Lịch sử thi · Phân tích chuyên sâu
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/mock-test/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition w-fit"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt thi thử</span>
          </Link>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            value={stats.count}
            label="Lần thi"
            className="text-red-400"
          />

          <StatCard
            value={stats.average}
            label="Điểm trung bình"
            className="text-yellow-400"
          />

          <StatCard
            value={stats.highest}
            label="Điểm cao nhất"
            className="text-green-400"
          />
        </div>

        {/* ================================================== */}
        {/* TABS */}
        {/* ================================================== */}

        <div className="mt-6 grid grid-cols-3 rounded-2xl border border-white/5 bg-[#121214] p-1">
          <button
            type="button"
            onClick={() =>
              setTab("tests")
            }
            className={`rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 ${
              tab === "tests"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full TOEIC Test</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTab("history")
            }
            className={`rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 ${
              tab === "history"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Lịch sử ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTab("analytics")
            }
            className={`rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 ${
              tab === "analytics"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Phân tích thi thử</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* TEST LIST */}
        {/* ================================================== */}

        {tab === "tests" && (
          <>
            {/* MINI TEST BANNER */}
            <div className="mt-6 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-zinc-900/90 to-zinc-900/90 p-6 transition hover:border-red-500/50 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/20 text-2xl font-bold text-red-400 border border-red-500/30 shrink-0">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        TOEIC Mini Test (50 Câu)
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Nhanh 30–60p
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xl">
                      Kiểm tra nhanh năng lực với 50 câu hỏi rút gọn, tùy chọn các phần thi (Part 1–7), bấm giờ, tạm dừng, phân tích điểm và lời giải chi tiết.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/mock-test/mini-test"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition whitespace-nowrap flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Bắt đầu Mini Test ngay →</span>
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex gap-4">
                <div className="text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="font-semibold text-red-300">
                    Bài thi TOEIC đầy đủ
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    200 câu · 120 phút ·
                    Sát với đề thi thật ·
                    Có kết quả và đáp án chi
                    tiết sau khi thi
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {tests.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-[#121214] p-12 text-center flex flex-col items-center">
                  <ClipboardList className="w-12 h-12 text-zinc-600 mb-4" />

                  <p className="text-zinc-400">
                    Chưa có đề thi nào.
                  </p>
                </div>
              ) : (
                tests.map(
                  (test) => (
                    <div
                      key={test.id}
                      className="rounded-2xl border border-white/5 bg-[#121214] p-6 transition hover:border-white/10"
                    >
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-lg font-bold text-red-400">
                              {test.id}
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold">
                                {test.title ??
                                  `TOEIC Full Test ${test.id}`}
                              </h3>

                              <p className="mt-1 text-sm text-zinc-500">
                                {test.description ??
                                  "Full TOEIC Test"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                            <span className="rounded-lg bg-white/5 px-3 py-1.5 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              <span>
                                {test.total_questions ?? 200} câu
                              </span>
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {test.duration ?? 120} phút
                              </span>
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5 flex items-center gap-1.5">
                              <Headphones className="w-3.5 h-3.5" />
                              <span>Listening</span>
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Reading</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfigModalTest(test);
                              setTestMode("standard");
                              setSelectedParts([1, 2, 3, 4, 5, 6, 7]);
                              setListeningMinutes(45);
                              setReadingMinutes(75);
                            }}
                            className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Cấu hình & Hướng dẫn</span>
                          </button>

                          <button
                            type="button"
                            disabled={
                              startingTestId ===
                              test.id
                            }
                            onClick={() =>
                              handleStartTest(
                                test.id,
                              )
                            }
                            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {startingTestId ===
                            test.id
                              ? "Đang chuẩn bị..."
                              : "Thi chuẩn 120p →"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </>
        )}

        {/* ── FULL TEST CONFIG & INSTRUCTIONS MODAL ── */}
        {configModalTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Cấu Hình Bài Thi #{configModalTest.id}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {configModalTest.title ?? `TOEIC Full Test ${configModalTest.id}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigModalTest(null)}
                  className="text-zinc-400 hover:text-white text-sm p-1 rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  1. Chế độ kiểm tra (Test Mode):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTestMode("standard");
                      setSelectedParts([1, 2, 3, 4, 5, 6, 7]);
                      setListeningMinutes(45);
                      setReadingMinutes(75);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      testMode === "standard"
                        ? "bg-red-600/15 border-red-500 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold block">Tiêu chuẩn (Standard)</span>
                    <span className="text-[10px] text-zinc-400">Part 1–7 theo thứ tự • 200 câu • 120 phút</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMode("custom")}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      testMode === "custom"
                        ? "bg-purple-600/15 border-purple-500 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold block">Tùy chỉnh (Custom)</span>
                    <span className="text-[10px] text-zinc-400">Chọn Parts và thời gian theo nhu cầu</span>
                  </button>
                </div>
              </div>

              {/* Custom Part selection */}
              {testMode === "custom" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-300 block">
                    2. Chọn phần thi (Select Parts):
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                      const isSel = selectedParts.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSelectedParts((prev) =>
                              prev.includes(p)
                                ? prev.length > 1
                                  ? prev.filter((x) => x !== p)
                                  : prev
                                : [...prev, p].sort((a, b) => a - b)
                            );
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                            isSel
                              ? "bg-purple-600 text-white border-purple-400"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          Part {p}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Thời gian Nghe (phút):</span>
                      <input
                        type="number"
                        min={5}
                        max={90}
                        value={listeningMinutes}
                        onChange={(e) => setListeningMinutes(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Thời gian Đọc (phút):</span>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={readingMinutes}
                        onChange={(e) => setReadingMinutes(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions Accordion / Toggle */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 space-y-2 leading-relaxed max-h-36 overflow-y-auto">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>Quy chế thi TOEIC Full Test:</span>
                </p>
                <p>• Phần Listening (Part 1–4, 100 câu, 45 phút): Audio tự động phát 1 lần.</p>
                <p>• Section break: Sau khi hoàn tất Listening, bạn sẽ có thông báo nghỉ 1–2 phút trước khi chuyển sang Reading (Part 5–7, 100 câu, 75 phút).</p>
                <p>• Chức năng Tạm dừng (Pause): Giới hạn tối đa 3 lần trong suốt bài thi.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setConfigModalTest(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={startingTestId === configModalTest.id}
                  onClick={async () => {
                    if (!configModalTest) return;
                    setStartingTestId(configModalTest.id);
                    try {
                      const res = await startCustomFullTest({
                        testId: configModalTest.id,
                        mode: testMode,
                        parts: selectedParts,
                        listeningDuration: listeningMinutes,
                        readingDuration: readingMinutes,
                      });
                      setConfigModalTest(null);
                      router.push(`/dashboard/mock-test/${res.attemptId}`);
                    } catch (err: any) {
                      alert(err?.message || "Lỗi khởi tạo bài thi!");
                    } finally {
                      setStartingTestId(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{startingTestId === configModalTest.id ? "Đang tạo bài thi..." : "Bắt đầu làm bài thi"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* HISTORY (7.3) */}
        {/* ================================================== */}

        {tab === "history" && (
          <div className="mt-6 space-y-6">
            {/* 1. SUMMARY STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-5">
                <p className="text-xs text-zinc-500 font-bold uppercase">Tổng lượt thi</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{stats.count}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Lần thi đã hoàn thành</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#121214] p-5">
                <p className="text-xs text-zinc-500 font-bold uppercase">Điểm cao nhất</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5">{stats.highest}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Kỷ lục cá nhân</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#121214] p-5">
                <p className="text-xs text-zinc-500 font-bold uppercase">Điểm trung bình</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1.5">{stats.average}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Trên tất cả các bài thi</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#121214] p-5">
                <p className="text-xs text-zinc-500 font-bold uppercase">Bài thi khớp lọc</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5">{filteredHistory.length}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Đang hiển thị</p>
              </div>
            </div>

            {/* 2. FILTER & TOOLBAR */}
            <div className="rounded-2xl border border-white/5 bg-[#121214] p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên đề hoặc mã bài thi..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  {historySearch && (
                    <button
                      type="button"
                      onClick={() => setHistorySearch("")}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-white text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Compare & Export action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={selectedForCompare.length !== 2}
                    onClick={() => setShowCompareModal(true)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedForCompare.length === 2
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>So sánh ({selectedForCompare.length}/2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportHistory("csv")}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportHistory("json")}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xuất JSON</span>
                  </button>
                </div>
              </div>

              {/* Filter controls row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                {/* Type Filter */}
                <div>
                  <span className="text-[11px] text-zinc-500 font-bold block mb-1">Loại bài thi:</span>
                  <select
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="all">Tất cả loại bài</option>
                    <option value="full">Full Test (200 câu)</option>
                    <option value="mini">Mini Test (50 câu)</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <span className="text-[11px] text-zinc-500 font-bold block mb-1">Thời gian:</span>
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="7d">7 ngày qua</option>
                    <option value="30d">30 ngày qua</option>
                    <option value="90d">90 ngày qua</option>
                  </select>
                </div>

                {/* Score Filter */}
                <div>
                  <span className="text-[11px] text-zinc-500 font-bold block mb-1">Mức điểm:</span>
                  <select
                    value={historyScoreFilter}
                    onChange={(e) => setHistoryScoreFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="all">Tất cả mức điểm</option>
                    <option value="low">&lt; 500 điểm</option>
                    <option value="mid">500 – 695 điểm</option>
                    <option value="high">700 – 845 điểm</option>
                    <option value="expert">850+ điểm</option>
                  </select>
                </div>

                {/* Sort Control */}
                <div>
                  <span className="text-[11px] text-zinc-500 font-bold block mb-1">Sắp xếp:</span>
                  <select
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Điểm cao nhất</option>
                    <option value="lowest">Điểm thấp nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. TEST LIST */}
            {filteredHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-12 text-center flex flex-col items-center">
                <ClipboardList className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-zinc-400">
                  Không tìm thấy bài thi nào phù hợp với bộ lọc.
                </p>
                {(historySearch || historyTypeFilter !== "all" || historyDateFilter !== "all" || historyScoreFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearch("");
                      setHistoryTypeFilter("all");
                      setHistoryDateFilter("all");
                      setHistoryScoreFilter("all");
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-red-400 bg-red-600/10 hover:bg-red-600/20 rounded-xl transition"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const isSelected = selectedForCompare.includes(item.id);
                  const isMini = (item.totalQuestions <= 50);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border bg-[#121214] p-5 transition ${
                        isSelected ? "border-purple-500/50 bg-purple-950/10" : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Info Column */}
                        <div className="flex items-start gap-4">
                          {/* Checkbox for compare */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(item.id)}
                            title="Chọn để so sánh bài thi"
                            className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center text-xs transition ${
                              isSelected
                                ? "bg-purple-600 border-purple-400 text-white font-bold"
                                : "bg-zinc-800 border-zinc-700 text-transparent hover:border-zinc-500"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  isMini
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-red-500/15 text-red-300 border-red-500/30"
                                }`}
                              >
                                {isMini ? "Mini Test (50 câu)" : "Full Test (200 câu)"}
                              </span>
                              <span className="text-xs text-zinc-500">Attempt #{item.id}</span>
                            </div>

                            <h3 className="font-bold text-white text-base mt-1.5">
                              {item.testTitle || `TOEIC Test ${item.testId}`}
                            </h3>

                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                            </p>
                          </div>
                        </div>

                        {/* Stats Breakdown Column */}
                        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                          <div className="rounded-xl bg-white/[0.03] px-3.5 py-2 text-center min-w-[70px]">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Nghe</span>
                            <span className="text-sm font-bold text-blue-400">{item.listeningScore ?? 0}</span>
                          </div>

                          <div className="rounded-xl bg-white/[0.03] px-3.5 py-2 text-center min-w-[70px]">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Đọc</span>
                            <span className="text-sm font-bold text-purple-400">{item.readingScore ?? 0}</span>
                          </div>

                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-center min-w-[80px]">
                            <span className="text-[10px] text-red-300 font-bold uppercase block">Tổng điểm</span>
                            <span className="text-lg font-black text-red-400">{item.totalScore ?? 0}</span>
                          </div>

                          <div className="rounded-xl bg-white/[0.03] px-3.5 py-2 text-center min-w-[75px]">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Số câu đúng</span>
                            <span className="text-xs font-bold text-emerald-400">
                              {item.totalCorrect ?? 0}/{item.totalQuestions}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons Column */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setQuickDetailItem(item)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Xem nhanh</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/mock-test/result/${item.id}`)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow flex items-center gap-1"
                          >
                            <span>Xem kết quả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Xóa bài thi này"
                            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* ANALYTICS (7.4) */}
        {/* ================================================== */}

        {tab === "analytics" && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {!analyticsData || analyticsData.totalTests === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-12 text-center flex flex-col items-center">
                <TrendingUp className="w-12 h-12 text-zinc-600 mb-3" />
                <h3 className="text-lg font-bold text-white mt-1">Chưa có dữ liệu phân tích</h3>
                <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
                  Hãy hoàn thành ít nhất 1 bài kiểm tra (Mini Test hoặc Full Test) để hệ thống AI phân tích điểm mạnh, điểm yếu và xu hướng điểm số của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("tests")}
                  className="mt-6 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Làm bài thi ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* 1. TOP PREDICTED SCORE & GOAL PROGRESS BANNER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Predicted Score Card */}
                  <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-zinc-900 to-zinc-950 p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Điểm Dự Đoán Thực Tế</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        AI Prediction
                      </span>
                    </div>

                    <div className="my-4">
                      <div className="text-5xl font-black text-white">
                        {analyticsData.predictedScore.score}
                        <span className="text-base font-normal text-zinc-500 ml-1">/ 990</span>
                      </div>
                      <p className="text-xs text-purple-300/80 mt-1.5">
                        Dải điểm ước tính: <strong>{analyticsData.predictedScore.minScore} – {analyticsData.predictedScore.maxScore}</strong>
                      </p>
                    </div>

                    <div className="text-[11px] text-zinc-400 bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40">
                      Độ tin cậy: <strong className="text-zinc-200">{analyticsData.predictedScore.confidence}</strong>
                    </div>
                  </div>

                  {/* Goal Progress Tracker */}
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 lg:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-red-500" />
                          <span>Tiến Độ Mục Tiêu (Target: {analyticsData.goalProgress.targetScore} TOEIC)</span>
                        </span>
                        <span className="text-sm font-black text-red-400">
                          {analyticsData.goalProgress.percentage}%
                        </span>
                      </div>

                      <div className="mt-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-600 via-purple-600 to-emerald-500 transition-all duration-500"
                          style={{ width: `${analyticsData.goalProgress.percentage}%` }}
                        />
                      </div>

                      <p className="text-xs text-zinc-400 mt-2">
                        Hiện tại: <strong className="text-white">{analyticsData.goalProgress.currentScore}đ</strong> • Còn thiếu:{" "}
                        <strong className="text-amber-400">{analyticsData.goalProgress.gap} điểm</strong> để đạt mục tiêu.
                      </p>
                    </div>

                    {/* Skill targets */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800">
                      <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Listening Target</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-sm font-bold text-blue-400">{analyticsData.goalProgress.listeningCurrent}đ</span>
                          <span className="text-[11px] text-zinc-500">Mục tiêu {analyticsData.goalProgress.listeningTarget}đ</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Reading Target</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-sm font-bold text-purple-400">{analyticsData.goalProgress.readingCurrent}đ</span>
                          <span className="text-[11px] text-zinc-500">Mục tiêu {analyticsData.goalProgress.readingTarget}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PROGRESS OVER TIME & METRICS BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Lần thi đầu tiên</span>
                    <p className="text-xl font-bold text-zinc-300 mt-1">{analyticsData.progressOverTime.firstScore}đ</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Lần thi gần nhất</span>
                    <p className="text-xl font-bold text-white mt-1">{analyticsData.progressOverTime.latestScore}đ</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Tiến bộ tổng thể</span>
                    <p className={`text-xl font-black mt-1 ${analyticsData.progressOverTime.improvementPoints >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {analyticsData.progressOverTime.improvementPoints >= 0 ? `+${analyticsData.progressOverTime.improvementPoints}` : analyticsData.progressOverTime.improvementPoints}đ
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Quỹ đạo phong độ</span>
                    <p className="text-sm font-bold text-purple-400 mt-1.5 flex items-center justify-center gap-1">
                      {analyticsData.progressOverTime.trendDirection === "improving" ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span>Đang tăng trưởng</span>
                        </>
                      ) : analyticsData.progressOverTime.trendDirection === "declining" ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span>Cần cải thiện</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4 text-amber-400" />
                          <span>Ổn định</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* 3. SCORE TREND CHART (Interactive SVG Line Chart) */}
                <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <span>Biểu Đồ Xu Hướng Điểm Số (Score Trend)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Theo dõi lịch sử điểm số qua các lần làm bài thi</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAnalyticsMetric("total")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          analyticsMetric === "total"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Tổng điểm
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalyticsMetric("listening")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          analyticsMetric === "listening"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Listening
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalyticsMetric("reading")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          analyticsMetric === "reading"
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Reading
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="w-full overflow-x-auto py-2">
                    <div className="min-w-[600px] h-[240px] relative flex flex-col justify-end">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                        <div className="border-b border-white w-full" />
                        <div className="border-b border-white w-full" />
                        <div className="border-b border-white w-full" />
                        <div className="border-b border-white w-full" />
                      </div>

                      {/* SVG Line & Dots */}
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${Math.max(600, analyticsData.scoreTrends.length * 100)} 200`}>
                        {(() => {
                          const maxVal = analyticsMetric === "total" ? 990 : 495;
                          const points = analyticsData.scoreTrends.map((s, idx) => {
                            const val = analyticsMetric === "total" ? s.totalScore : analyticsMetric === "listening" ? s.listeningScore : s.readingScore;
                            const x = (idx / Math.max(1, analyticsData.scoreTrends.length - 1)) * (Math.max(600, analyticsData.scoreTrends.length * 100) - 80) + 40;
                            const y = 180 - (val / maxVal) * 150;
                            return { x, y, val, item: s };
                          });

                          const pathStr = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                          const strokeColor = analyticsMetric === "total" ? "#ef4444" : analyticsMetric === "listening" ? "#3b82f6" : "#a855f7";

                          return (
                            <>
                              {/* Path */}
                              <path d={pathStr} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Dots */}
                              {points.map((p, i) => (
                                <g key={i} className="cursor-pointer group">
                                  <circle cx={p.x} cy={p.y} r="5" fill={strokeColor} className="transition-all group-hover:r-7" />
                                  {/* Score tooltip text above point */}
                                  <text x={p.x} y={p.y - 12} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                                    {p.val}đ
                                  </text>
                                  {/* X-axis date label */}
                                  <text x={p.x} y="198" fill="#71717a" fontSize="10" textAnchor="middle">
                                    Bài {i + 1} ({new Date(p.item.date).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" })})
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4. DUAL CHARTS: ACCURACY TREND & TIME TREND */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Accuracy Trend */}
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span>Tỷ Lệ Chính Xác (%) Qua Các Lần Thi</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Accuracy Trend Chart</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analyticsData.accuracyTrends.slice(-5).map((acc, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-semibold">
                              Lần thi #{acc.attemptId} ({new Date(acc.date).toLocaleDateString("vi-VN")})
                            </span>
                            <span className="text-emerald-400 font-bold">{acc.overallAccuracy}% đúng</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${acc.overallAccuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Trend */}
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Thời Gian Làm Bài (Phút) Qua Các Lần Thi</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Time Trend Chart</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analyticsData.timeTrends.slice(-5).map((t, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-semibold">
                              Lần thi #{t.attemptId} ({new Date(t.date).toLocaleDateString("vi-VN")})
                            </span>
                            <span className="text-blue-400 font-bold">{t.durationMinutes} phút</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${Math.min(100, (t.durationMinutes / 120) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. PART-WISE PERFORMANCE COMPARISON */}
                <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span>So Sánh Hiệu Suất Từng Phần (Part 1–7 Performance)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Tỷ lệ chính xác trung bình trên 7 phần thi TOEIC</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {analyticsData.partPerformance.map((p) => {
                      const isHigh = p.accuracy >= 75;
                      const isMid = p.accuracy >= 60 && p.accuracy < 75;
                      const barColor = isHigh ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-rose-500";
                      const textColor = isHigh ? "text-emerald-400" : isMid ? "text-amber-400" : "text-rose-400";

                      return (
                        <div key={p.part} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className={`text-xs font-black ${textColor}`}>{p.accuracy}%</span>
                          </div>

                          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${p.accuracy}%` }} />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span>Đã làm: {p.total} câu</span>
                            <span>Đúng: {p.correct} câu</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. STRENGTHS & WEAKNESSES IDENTIFICATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-zinc-950 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm font-bold text-emerald-400">Điểm Mạnh (Strength Identification)</h3>
                        <p className="text-[11px] text-zinc-400">Các phần bạn đang đạt độ chính xác cao nhất</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {analyticsData.strengths.map((s, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{s.name}</span>
                            <span className="text-xs font-bold text-emerald-400">{s.accuracy}% đúng</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">{s.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-zinc-950 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <div>
                        <h3 className="text-sm font-bold text-rose-400">Điểm Yếu Cần Cải Thiện (Weakness Identification)</h3>
                        <p className="text-[11px] text-zinc-400">Tập trung ôn luyện các phần này để bứt phá điểm số</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {analyticsData.weaknesses.map((w, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{w.name}</span>
                            <span className="text-xs font-bold text-rose-400">{w.accuracy}% đúng</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">{w.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. STUDY TIME VS SCORE CORRELATION */}
                {analyticsData.studyTimeVsScoreCorrelation.length > 0 && (
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-400" />
                          <span>Tương Quan Thời Gian Luyện Thi vs Điểm Số (Study Time Correlation)</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Chứng minh mức độ tăng trưởng điểm TOEIC tỷ lệ thuận với số giờ luyện đề thực tế
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {analyticsData.studyTimeVsScoreCorrelation.slice(-4).map((c, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                            Tích lũy {c.cumulativeHours}h học
                          </span>
                          <p className="text-lg font-black text-purple-400 mt-1">{c.score} điểm</p>
                          <span className="text-[10px] text-zinc-500">Attempt #{c.attemptId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── QUICK DETAIL MODAL ── */}
        {quickDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Tóm Tắt Bài Thi #{quickDetailItem.id}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{quickDetailItem.testTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickDetailItem(null)}
                  className="text-zinc-400 hover:text-white text-sm p-1 rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400 block">Điểm Listening</span>
                  <span className="text-2xl font-black text-blue-400 mt-1 block">
                    {quickDetailItem.listeningScore ?? 0}
                  </span>
                  <span className="text-[10px] text-zinc-500">Đúng {quickDetailItem.listeningCorrect ?? 0} câu</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400 block">Điểm Reading</span>
                  <span className="text-2xl font-black text-purple-400 mt-1 block">
                    {quickDetailItem.readingScore ?? 0}
                  </span>
                  <span className="text-[10px] text-zinc-500">Đúng {quickDetailItem.readingCorrect ?? 0} câu</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-red-600/10 border border-red-500/20 text-center">
                <span className="text-xs text-zinc-400 block">Tổng Điểm TOEIC</span>
                <span className="text-4xl font-black text-red-400 mt-1 block">
                  {quickDetailItem.totalScore ?? 0} <span className="text-sm font-normal text-zinc-500">/ 990</span>
                </span>
                <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                  Tổng đúng {quickDetailItem.totalCorrect ?? 0}/{quickDetailItem.totalQuestions} câu (
                  {Math.round(((quickDetailItem.totalCorrect ?? 0) / quickDetailItem.totalQuestions) * 100)}%)
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-400 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60">
                <p>• Ngày làm bài: <strong className="text-zinc-200">{new Date(quickDetailItem.createdAt).toLocaleString("vi-VN")}</strong></p>
                <p>• Loại bài: <strong className="text-zinc-200">{quickDetailItem.totalQuestions <= 50 ? "Mini Test (50 câu)" : "Full Test (200 câu)"}</strong></p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQuickDetailItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = quickDetailItem.id;
                    setQuickDetailItem(null);
                    router.push(`/dashboard/mock-test/result/${id}`);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow transition"
                >
                  <span>Xem phân tích đầy đủ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE TESTS MODAL ── */}
        {showCompareModal && selectedForCompare.length === 2 && (() => {
          const testA = history.find((h) => h.id === selectedForCompare[0]);
          const testB = history.find((h) => h.id === selectedForCompare[1]);
          if (!testA || !testB) return null;

          const scoreDiff = (testB.totalScore ?? 0) - (testA.totalScore ?? 0);
          const listenDiff = (testB.listeningScore ?? 0) - (testA.listeningScore ?? 0);
          const readDiff = (testB.readingScore ?? 0) - (testA.readingScore ?? 0);
          const correctDiff = (testB.totalCorrect ?? 0) - (testA.totalCorrect ?? 0);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span>So Sánh Kết Quả 2 Lần Thi</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Đối chiếu sự tiến bộ giữa Attempt #{testA.id} và Attempt #{testB.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(false)}
                    className="text-zinc-400 hover:text-white text-sm p-1 rounded-lg hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-hidden rounded-2xl border border-zinc-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5 font-bold">Chỉ số so sánh</th>
                        <th className="p-3.5 font-bold text-center text-blue-400">
                          Bài 1 (#{testA.id})
                        </th>
                        <th className="p-3.5 font-bold text-center text-purple-400">
                          Bài 2 (#{testB.id})
                        </th>
                        <th className="p-3.5 font-bold text-right">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      <tr>
                        <td className="p-3.5 font-semibold text-white">Tổng điểm TOEIC</td>
                        <td className="p-3.5 text-center font-bold text-lg">{testA.totalScore ?? 0}</td>
                        <td className="p-3.5 text-center font-bold text-lg">{testB.totalScore ?? 0}</td>
                        <td className={`p-3.5 text-right font-black ${scoreDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5">Điểm Listening</td>
                        <td className="p-3.5 text-center">{testA.listeningScore ?? 0}</td>
                        <td className="p-3.5 text-center">{testB.listeningScore ?? 0}</td>
                        <td className={`p-3.5 text-right font-bold ${listenDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {listenDiff >= 0 ? `+${listenDiff}` : listenDiff}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5">Điểm Reading</td>
                        <td className="p-3.5 text-center">{testA.readingScore ?? 0}</td>
                        <td className="p-3.5 text-center">{testB.readingScore ?? 0}</td>
                        <td className={`p-3.5 text-right font-bold ${readDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {readDiff >= 0 ? `+${readDiff}` : readDiff}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5">Số câu trả lời đúng</td>
                        <td className="p-3.5 text-center">{testA.totalCorrect ?? 0}/{testA.totalQuestions}</td>
                        <td className="p-3.5 text-center">{testB.totalCorrect ?? 0}/{testB.totalQuestions}</td>
                        <td className={`p-3.5 text-right font-bold ${correctDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {correctDiff >= 0 ? `+${correctDiff}` : correctDiff}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5">Ngày nộp bài</td>
                        <td className="p-3.5 text-center text-[10px] text-zinc-400">
                          {new Date(testA.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3.5 text-center text-[10px] text-zinc-400">
                          {new Date(testB.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3.5 text-right text-[10px] text-zinc-400">
                          —
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Verdict message */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  scoreDiff >= 0
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}>
                  {scoreDiff > 0 && `Điểm số đã tăng trưởng +${scoreDiff} điểm so với lần thi trước. Hãy tiếp tục duy trì phong độ!`}
                  {scoreDiff === 0 && `Điểm số duy trì ổn định bằng nhau (${testA.totalScore}đ). Hãy tập trung luyện thêm các phần điểm yếu để bứt phá!`}
                  {scoreDiff < 0 && `Điểm số giảm ${Math.abs(scoreDiff)} điểm. Khuyến nghị ôn lại các câu sai trong Sổ tay lỗi trước khi thi lại.`}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
              <div className="text-center space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Xác nhận xóa bài thi?</h3>
                <p className="text-xs text-zinc-400">
                  Bạn có chắc muốn xóa bản ghi <strong>Attempt #{deleteConfirmItem.id}</strong> ({deleteConfirmItem.testTitle})?
                </p>
                <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                  Hành động này không thể hoàn tác. Toàn bộ câu trả lời và kết quả sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAttempt}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                >
                  {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121214] p-6 text-center">
      <div
        className={`text-3xl font-black ${className}`}
      >
        {value}
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        {label}
      </p>
    </div>
  );
}