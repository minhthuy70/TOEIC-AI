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
  type MockTest,
  type MockTestHistoryItem,
} from "@/services/mock-test";

export default function MockTestPage() {
  const router = useRouter();

  const [tab, setTab] =
    useState<"tests" | "history">(
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
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

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
      ] = await Promise.all([
        getMockTests(),
        getMockTestHistory(),
      ]);

      setTests(testsData);
      setHistory(historyData);
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
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Đang tải dữ liệu thi thử...
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

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              📋
            </span>

            <div>
              <h1 className="text-3xl font-bold">
                Thi thử
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Full TOEIC Test · Lịch sử thi
              </p>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
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

        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/5 bg-[#121214] p-1">
          <button
            type="button"
            onClick={() =>
              setTab("tests")
            }
            className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
              tab === "tests"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📄 Full TOEIC Test
          </button>

          <button
            type="button"
            onClick={() =>
              setTab("history")
            }
            className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
              tab === "history"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📊 Lịch sử thi
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
                    ⚡
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
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition whitespace-nowrap"
                >
                  🚀 Bắt đầu Mini Test ngay →
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex gap-4">
                <div className="text-2xl">
                  ⚠️
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
                <div className="rounded-2xl border border-white/5 bg-[#121214] p-12 text-center">
                  <div className="text-5xl">
                    📋
                  </div>

                  <p className="mt-4 text-zinc-400">
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
                            <span className="rounded-lg bg-white/5 px-3 py-1.5">
                              📝{" "}
                              {test.total_questions ??
                                200}{" "}
                              câu
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5">
                              ⏱{" "}
                              {test.duration ??
                                120}{" "}
                              phút
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5">
                              🎧 Listening
                            </span>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5">
                              📖 Reading
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
                            className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-300 transition"
                          >
                            ⚙️ Cấu hình & Hướng dẫn
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
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ✕
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
                    <span className="text-xs font-bold block">📄 Tiêu chuẩn (Standard)</span>
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
                    <span className="text-xs font-bold block">⚡ Tùy chỉnh (Custom)</span>
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
                      <span className="text-[11px] text-zinc-400 block mb-1">🎧 Thời gian Nghe (phút):</span>
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
                      <span className="text-[11px] text-zinc-400 block mb-1">📖 Thời gian Đọc (phút):</span>
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
                  <span>ℹ️</span> <span>Quy chế thi TOEIC Full Test:</span>
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition disabled:opacity-50"
                >
                  {startingTestId === configModalTest.id ? "Đang tạo bài thi..." : "🚀 Bắt đầu làm bài thi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* HISTORY */}
        {/* ================================================== */}

        {tab === "history" && (
          <div className="mt-6 space-y-4">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-12 text-center">
                <div className="text-5xl">
                  📋
                </div>

                <p className="mt-4 text-zinc-400">
                  Bạn chưa có lần thi nào.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setTab("tests")
                  }
                  className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium"
                >
                  Thi thử ngay
                </button>
              </div>
            ) : (
              history.map(
                (item) => (
                  <HistoryCard
                    key={item.id}
                    item={item}
                    onView={() =>
                      router.push(
                        `/dashboard/mock-test/result/${item.id}`,
                      )
                    }
                  />
                ),
              )
            )}
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

// ============================================================
// HISTORY CARD
// ============================================================

function HistoryCard({
  item,
  onView,
}: {
  item: MockTestHistoryItem;
  onView: () => void;
}) {
  const date =
    new Date(
      item.createdAt,
    ).toLocaleString(
      "vi-VN",
    );

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h3 className="font-semibold">
            {item.testTitle}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {date}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-white/5 px-3 py-2 text-zinc-400">
              Đúng:{" "}
              <strong className="text-white">
                {item.totalCorrect ??
                  0}
                /
                {item.totalQuestions}
              </strong>
            </span>

            <span className="rounded-lg bg-white/5 px-3 py-2 text-zinc-400">
              Điểm:{" "}
              <strong className="text-green-400">
                {item.totalScore ??
                  0}
              </strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onView}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          Xem kết quả
        </button>
      </div>
    </div>
  );
}