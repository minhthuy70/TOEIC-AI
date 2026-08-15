"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getMockTestResult,
  type MockTestResultQuestion,
  type MockTestResultResponse,
} from "@/services/mock-test";

type FilterType =
  | "all"
  | "correct"
  | "wrong"
  | "unanswered";

export default function MockTestResultPage() {
  const params = useParams();

  const router = useRouter();

  const attemptId =
    Number(params.attemptId);

  const [
    result,
    setResult,
  ] =
    useState<MockTestResultResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>("all");

  const [
    selectedPart,
    setSelectedPart,
  ] = useState<number | "all">(
    "all",
  );

  // ==========================================================
  // LOAD RESULT
  // ==========================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        attemptId,
      ) ||
      attemptId <= 0
    ) {
      setError(
        "Lần thi không hợp lệ.",
      );

      setLoading(false);

      return;
    }

    loadResult();
  }, [attemptId]);

  async function loadResult() {
    try {
      setLoading(true);

      setError("");

      const data =
        await getMockTestResult(
          attemptId,
        );

      console.log(
        "========== MOCK TEST RESULT ==========",
      );

      console.log(
        "result:",
        data,
      );

      console.log(
        "questions:",
        data.questions.length,
      );

      console.log(
        "=======================================",
      );

      setResult(data);
    } catch (error) {
      console.error(
        "LOAD MOCK TEST RESULT ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải kết quả bài thi.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // FILTER QUESTIONS
  // ==========================================================

  const filteredQuestions =
    useMemo(() => {
      if (!result) {
        return [];
      }

      return result.questions.filter(
        (question) => {
          if (
            selectedPart !==
              "all" &&
            question.part !==
              selectedPart
          ) {
            return false;
          }

          if (
            filter ===
            "correct"
          ) {
            return (
              question.isCorrect
            );
          }

          if (
            filter === "wrong"
          ) {
            return (
              question.isAnswered &&
              !question.isCorrect
            );
          }

          if (
            filter ===
            "unanswered"
          ) {
            return (
              !question.isAnswered
            );
          }

          return true;
        },
      );
    }, [
      result,
      filter,
      selectedPart,
    ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Đang tải toàn bộ kết quả bài thi...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-xl font-bold text-red-400">
            Không thể tải kết quả
          </h1>

          <p className="mt-3 text-zinc-400">
            {error ||
              "Không tìm thấy dữ liệu kết quả."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/mock-test",
              )
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
          >
            Quay lại Thi thử
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PERCENTAGES
  // ==========================================================

  const accuracy =
    result.totalQuestions >
    0
      ? Math.round(
          (result.totalCorrect /
            result.totalQuestions) *
            100,
        )
      : 0;

  const listeningAccuracy =
    result.listeningTotal >
    0
      ? Math.round(
          (result.listeningCorrect /
            result.listeningTotal) *
            100,
        )
      : 0;

  const readingAccuracy =
    result.readingTotal >
    0
      ? Math.round(
          (result.readingCorrect /
            result.readingTotal) *
            100,
        )
      : 0;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs text-zinc-500">
              Kết quả thi thử
            </p>

            <h1 className="text-lg font-bold">
              {result.testTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/mock-test",
              )
            }
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            ← Danh sách đề
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* ================================================== */}
        {/* TITLE */}
        {/* ================================================== */}

        <section className="rounded-3xl border border-white/5 bg-[#121214] p-8">
          <div className="text-center">
            <div className="text-6xl">
              🎉
            </div>

            <h2 className="mt-4 text-3xl font-black">
              Hoàn thành bài thi!
            </h2>

            <p className="mt-2 text-zinc-500">
              Attempt #{result.attemptId}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Nộp lúc{" "}
              {formatDate(
                result.submittedAt,
              )}
            </p>
          </div>

          {/* ================================================== */}
          {/* TOTAL SCORE */}
          {/* ================================================== */}

          <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-sm text-zinc-500">
              Tổng điểm TOEIC
            </p>

            <p className="mt-2 text-7xl font-black text-red-400">
              {result.totalScore}
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              / 990
            </p>
          </div>

          {/* ================================================== */}
          {/* LISTENING / READING */}
          {/* ================================================== */}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScoreCard
              icon="🎧"
              title="Listening"
              score={
                result.listeningScore
              }
              correct={
                result.listeningCorrect
              }
              total={
                result.listeningTotal
              }
              accuracy={
                listeningAccuracy
              }
            />

            <ScoreCard
              icon="📖"
              title="Reading"
              score={
                result.readingScore
              }
              correct={
                result.readingCorrect
              }
              total={
                result.readingTotal
              }
              accuracy={
                readingAccuracy
              }
            />
          </div>

          {/* ================================================== */}
          {/* GENERAL STATS */}
          {/* ================================================== */}

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Tổng câu"
              value={
                result.totalQuestions
              }
            />

            <StatCard
              label="Đã làm"
              value={
                result.totalAnswered
              }
            />

            <StatCard
              label="Đúng"
              value={
                result.totalCorrect
              }
              positive
            />

            <StatCard
              label="Sai"
              value={
                result.totalWrong
              }
              negative
            />
          </div>

          {/* ================================================== */}
          {/* ACCURACY */}
          {/* ================================================== */}

          <div className="mt-6 rounded-2xl bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Độ chính xác
                </p>

                <p className="mt-1 text-3xl font-black">
                  {accuracy}%
                </p>
              </div>

              <p className="text-sm text-zinc-500">
                {result.totalCorrect} /{" "}
                {result.totalQuestions}
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-red-600"
                style={{
                  width: `${accuracy}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* PART SUMMARY */}
        {/* ================================================== */}

        <section className="mt-6 rounded-3xl border border-white/5 bg-[#121214] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Thống kê từng Part
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Kết quả chi tiết từ Part 1 đến Part 7
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {Array.from(
              {
                length: 7,
              },
              (_, index) =>
                index + 1,
            ).map((part) => {
              const stat =
                result.partStats[
                  part
                ];

              const percent =
                stat &&
                stat.total > 0
                  ? Math.round(
                      (stat.correct /
                        stat.total) *
                        100,
                    )
                  : 0;

              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => {
                    setSelectedPart(
                      part,
                    );

                    setFilter(
                      "all",
                    );

                    document
                      .getElementById(
                        "question-list",
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      });
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedPart ===
                    part
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <p className="text-sm font-bold text-red-400">
                    Part {part}
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    {stat?.correct ??
                      0}
                    <span className="text-sm font-normal text-zinc-600">
                      /
                      {stat?.total ??
                        0}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {percent}% đúng
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================== */}
        {/* FILTER */}
        {/* ================================================== */}

        <section
          id="question-list"
          className="mt-6"
        >
          <div className="sticky top-[73px] z-30 rounded-2xl border border-white/5 bg-[#121214]/95 p-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold">
                  Chi tiết toàn bộ bài thi
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Hiển thị{" "}
                  {
                    filteredQuestions.length
                  }{" "}
                  /{" "}
                  {
                    result.questions.length
                  }{" "}
                  câu
                </p>
              </div>

              {/* PART FILTER */}

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={
                    selectedPart ===
                    "all"
                  }
                  onClick={() =>
                    setSelectedPart(
                      "all",
                    )
                  }
                >
                  Tất cả Part
                </FilterButton>

                {Array.from(
                  {
                    length: 7,
                  },
                  (_, index) =>
                    index + 1,
                ).map((part) => (
                  <FilterButton
                    key={part}
                    active={
                      selectedPart ===
                      part
                    }
                    onClick={() =>
                      setSelectedPart(
                        part,
                      )
                    }
                  >
                    P{part}
                  </FilterButton>
                ))}
              </div>
            </div>

            {/* STATUS FILTER */}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
              <FilterButton
                active={
                  filter === "all"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                Tất cả
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "correct"
                }
                onClick={() =>
                  setFilter(
                    "correct",
                  )
                }
              >
                ✓ Đúng{" "}
                {
                  result.totalCorrect
                }
              </FilterButton>

              <FilterButton
                active={
                  filter === "wrong"
                }
                onClick={() =>
                  setFilter("wrong")
                }
              >
                ✕ Sai{" "}
                {
                  result.totalWrong
                }
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  "unanswered"
                }
                onClick={() =>
                  setFilter(
                    "unanswered",
                  )
                }
              >
                Chưa làm{" "}
                {
                  result.unanswered
                }
              </FilterButton>
            </div>
          </div>

          {/* ================================================== */}
          {/* QUESTIONS */}
          {/* ================================================== */}

          <div className="mt-5 space-y-6">
            {filteredQuestions.map(
              (
                question,
                index,
              ) => (
                <ResultQuestionCard
                  key={
                    question.id
                  }
                  question={
                    question
                  }
                  displayIndex={
                    index
                  }
                  testId={
                    result.testId
                  }
                  testTitle={
                    result.testTitle
                  }
                />
              ),
            )}

            {filteredQuestions.length ===
              0 && (
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-10 text-center">
                <p className="text-zinc-400">
                  Không có câu hỏi phù hợp với bộ lọc.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* BOTTOM */}
        {/* ================================================== */}

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/mock-test",
              )
            }
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold hover:bg-red-500"
          >
            ← Về danh sách đề thi
          </button>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// QUESTION CARD
// ============================================================

function ResultQuestionCard({
  question,
  displayIndex,
  testId,
  testTitle,
}: {
  question: MockTestResultQuestion;
  displayIndex: number;
  testId: number;
  testTitle: string;
}) {
  const imageUrl =
    resolveMediaUrl(
      question.imageUrl,
      "image",
      question.part,
      testId,
      testTitle,
    );

  const audioUrl =
    resolveMediaUrl(
      question.audioUrl,
      "audio",
      question.part,
      testId,
      testTitle,
    );

  const statusClass =
    question.isCorrect
      ? "border-green-500/20"
      : question.isAnswered
      ? "border-red-500/20"
      : "border-yellow-500/20";

  return (
    <article
      id={`question-${question.id}`}
      className={`rounded-3xl border bg-[#121214] p-6 ${statusClass}`}
    >
      {/* ================================================== */}
      {/* QUESTION HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black ${
              question.isCorrect
                ? "bg-green-600"
                : question.isAnswered
                ? "bg-red-600"
                : "bg-yellow-600"
            }`}
          >
            {question.questionNumber ??
              displayIndex + 1}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                Part{" "}
                {question.part}
              </span>

              {question.groupTitle && (
                <span className="text-xs text-zinc-500">
                  {
                    question.groupTitle
                  }
                </span>
              )}
            </div>

            <p className="mt-3 text-lg font-semibold leading-7 text-white">
              {question.questionText ||
                "(Không có nội dung câu hỏi)"}
            </p>
          </div>
        </div>

        {/* STATUS */}

        <StatusBadge
          question={
            question
          }
        />
      </div>

      {/* ================================================== */}
      {/* PASSAGE */}
      {/* ================================================== */}

      {question.passage && (
        <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Reading passage
          </p>

          <div className="whitespace-pre-wrap leading-7 text-zinc-300">
            {question.passage}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* IMAGE */}
      {/* ================================================== */}

      {imageUrl && (
        <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">
            🖼️ Hình ảnh
          </p>

          <div className="flex min-h-[220px] items-center justify-center">
            <img
              src={imageUrl}
              alt={`Question ${
                question.questionNumber ??
                displayIndex + 1
              }`}
              className="max-h-[550px] max-w-full rounded-xl object-contain"
              onError={(event) => {
                console.error(
                  "IMAGE ERROR:",
                  imageUrl,
                  event.currentTarget,
                );
              }}
            />
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* AUDIO */}
      {/* ================================================== */}

      {audioUrl && (
        <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            🎧 Audio
          </p>

          <audio
            controls
            preload="metadata"
            className="w-full"
            src={audioUrl}
          />
        </div>
      )}

      {/* ================================================== */}
      {/* OPTIONS */}
      {/* ================================================== */}

      <div className="mt-6 space-y-3">
        {question.options.map(
          (option) => {
            const selected =
              option.isSelected;

            const correct =
              option.isCorrect;

            let className =
              "border-white/10 bg-white/[0.02]";

            if (correct) {
              className =
                "border-green-500/40 bg-green-500/10";
            } else if (
              selected
            ) {
              className =
                "border-red-500/40 bg-red-500/10";
            }

            return (
              <div
                key={
                  option.id
                }
                className={`rounded-2xl border p-4 ${className}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                      correct
                        ? "bg-green-600 text-white"
                        : selected
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {
                      option.label
                    }
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    {option.text ? (
                      <p className="leading-6 text-zinc-200">
                        {
                          option.text
                        }
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Lựa chọn{" "}
                        {
                          option.label
                        }
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected && (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                          Bạn đã chọn
                        </span>
                      )}

                      {correct && (
                        <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                          Đáp án đúng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* ================================================== */}
      {/* ANSWER SUMMARY */}
      {/* ================================================== */}

      <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoItem
  label="Bạn chọn"
  value={
    question.selectedOptionId
      ? getOptionLabel(
          question,
          question.selectedOptionId,
        ) ?? "Không xác định"
      : "Chưa trả lời"
  }
/>

          <InfoItem
            label="Đáp án đúng"
            value={
              question.correctAnswer ??
              getOptionLabel(
                question,
                question.correctOptionId,
              ) ??
              "Không xác định"
            }
          />

          <InfoItem
            label="Kết quả"
            value={
              question.isCorrect
                ? "Đúng"
                : question.isAnswered
                ? "Sai"
                : "Chưa làm"
            }
            valueClass={
              question.isCorrect
                ? "text-green-400"
                : question.isAnswered
                ? "text-red-400"
                : "text-yellow-400"
            }
          />
        </div>
      </div>
    </article>
  );
}

// ============================================================
// STATUS
// ============================================================

function StatusBadge({
  question,
}: {
  question: MockTestResultQuestion;
}) {
  if (question.isCorrect) {
    return (
      <span className="shrink-0 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
        ✓ Đúng
      </span>
    );
  }

  if (question.isAnswered) {
    return (
      <span className="shrink-0 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
        ✕ Sai
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-400">
      Chưa làm
    </span>
  );
}

// ============================================================
// SCORE CARD
// ============================================================

function ScoreCard({
  icon,
  title,
  score,
  correct,
  total,
  accuracy,
}: {
  icon: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {icon}
          </span>

          <span className="font-bold">
            {title}
          </span>
        </div>

        <span className="text-xs text-zinc-600">
          {correct}/{total}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <p className="text-5xl font-black">
          {score}
        </p>

        <p className="text-sm text-zinc-500">
          {accuracy}% đúng
        </p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-red-600"
          style={{
            width: `${accuracy}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  positive = false,
  negative = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}) {
  let valueClass =
    "text-white";

  if (positive) {
    valueClass =
      "text-green-400";
  }

  if (negative) {
    valueClass =
      "text-red-400";
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] p-5 text-center">
      <p
        className={`text-3xl font-black ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-red-600 text-white"
          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// OPTION LABEL
// ============================================================

function getOptionLabel(
  question: MockTestResultQuestion,
  optionId: number | null,
) {
  if (!optionId) {
    return null;
  }

  return (
    question.options.find(
      (option) =>
        option.id ===
        optionId,
    )?.label ?? null
  );
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "--";
  }

  try {
    return new Date(
      value,
    ).toLocaleString(
      "vi-VN",
    );
  } catch {
    return value;
  }
}

// ============================================================
// MEDIA URL
// ============================================================

function resolveMediaUrl(
  rawUrl:
    | string
    | null
    | undefined,
  type:
    | "image"
    | "audio",
  part: number,
  testId: number,
  testTitle: string,
) {
  if (!rawUrl) {
    return undefined;
  }

  let value =
    String(rawUrl).trim();

  if (!value) {
    return undefined;
  }

  // ----------------------------------------------------------
  // Chuẩn hóa slash
  // ----------------------------------------------------------

  value =
    value.replace(
      /\\/g,
      "/",
    );

  // ----------------------------------------------------------
  // URL đầy đủ
  // ----------------------------------------------------------

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    )
  ) {
    return value;
  }

  // ----------------------------------------------------------
  // file://
  // ----------------------------------------------------------

  value =
    value.replace(
      /^file:\/\//i,
      "",
    );

  // ----------------------------------------------------------
  // API URL
  // ----------------------------------------------------------

  const apiUrl =
    (
      process.env
        .NEXT_PUBLIC_API_URL ||
      "http://localhost:3001"
    ).replace(
      /\/$/,
      "",
    );

  // ==========================================================
  // PLACEMENT TEST
  // ==========================================================

  const isPlacementTest =
    testId === 5 ||
    testTitle
      .toLowerCase()
      .includes(
        "placement",
      );

  if (
    isPlacementTest
  ) {
    // --------------------------------------------------------
    // Đã là đường dẫn uploads/tests/placement-test
    // --------------------------------------------------------

    const placementIndex =
      value.indexOf(
        "uploads/tests/placement-test/",
      );

    if (
      placementIndex >=
      0
    ) {
      const relative =
        value.substring(
          placementIndex,
        );

      return `${apiUrl}/${relative}`;
    }

    // --------------------------------------------------------
    // IMAGE
    //
    // DB có thể:
    //
    // 1.jpg
    // images/part1/1.jpg
    // part1/1.jpg
    // --------------------------------------------------------

    if (
      type === "image"
    ) {
      let imageValue =
        value.replace(
          /^\/+/,
          "",
        );

      imageValue =
        imageValue.replace(
          /^images\//i,
          "",
        );

      imageValue =
        imageValue.replace(
          /^part\d+\//i,
          "",
        );

      // Nếu DB đã chứa part1/...
      // lấy filename cuối cùng

      const filename =
        imageValue
          .split("/")
          .pop();

      if (!filename) {
        return undefined;
      }

      return `${apiUrl}/uploads/tests/placement-test/images/part${part}/${filename}`;
    }

    // --------------------------------------------------------
    // AUDIO
    //
    // DB có thể:
    //
    // placement-test.mp3
    // audio/placement-test.mp3
    // --------------------------------------------------------

    let audioValue =
      value.replace(
        /^\/+/,
        "",
      );

    audioValue =
      audioValue.replace(
        /^audio\//i,
        "",
      );

    const audioFilename =
      audioValue
        .split("/")
        .pop();

    if (!audioFilename) {
      return undefined;
    }

    return `${apiUrl}/uploads/tests/placement-test/audio/${audioFilename}`;
  }

  // ==========================================================
  // FULL TEST
  //
  // Hỗ trợ:
  //
  // images/test001/...
  // audio/test001/...
  // ==========================================================

  const generatedDataIndex =
    value.indexOf(
      "toeic-generated-data/",
    );

  if (
    generatedDataIndex >=
    0
  ) {
    value =
      value.substring(
        generatedDataIndex +
          "toeic-generated-data/"
            .length,
      );
  }

  // ----------------------------------------------------------
  // /images/...
  // ----------------------------------------------------------

  if (
    value.startsWith(
      "/images/",
    )
  ) {
    return `${apiUrl}${value}`;
  }

  // ----------------------------------------------------------
  // images/...
  // ----------------------------------------------------------

  if (
    value.startsWith(
      "images/",
    )
  ) {
    return `${apiUrl}/${value}`;
  }

  // ----------------------------------------------------------
  // /audio/...
  // ----------------------------------------------------------

  if (
    value.startsWith(
      "/audio/",
    )
  ) {
    return `${apiUrl}${value}`;
  }

  // ----------------------------------------------------------
  // audio/...
  // ----------------------------------------------------------

  if (
    value.startsWith(
      "audio/",
    )
  ) {
    return `${apiUrl}/${value}`;
  }

  // ----------------------------------------------------------
  // FILENAME
  // ----------------------------------------------------------

  value =
    value.replace(
      /^\/+/,
      "",
    );

  const folder =
    type === "image"
      ? "images"
      : "audio";

  return `${apiUrl}/${folder}/${value}`;
}