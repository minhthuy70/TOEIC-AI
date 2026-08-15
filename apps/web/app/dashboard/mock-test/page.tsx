"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getMockTestHistory,
  getMockTests,
  startMockTest,
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
                            : "Bắt đầu thi →"}
                        </button>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </>
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