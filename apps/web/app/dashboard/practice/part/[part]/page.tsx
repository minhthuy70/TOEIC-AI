"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import {
  startPractice,
  submitPractice,
  type PracticeGroup,
  type PracticeQuestion,
  type PracticeStartResponse,
  type SubmitPracticeResponse,
} from "@/services/practice";

import {
  Headphones,
  Check,
  ArrowLeft,
  ArrowRight,
  PartyPopper,
  Target,
} from "lucide-react";

export default function PracticePartPage() {
  const params = useParams();

  const router = useRouter();

  const part = Number(params.part);

  const [
    practice,
    setPractice,
  ] = useState<PracticeStartResponse | null>(
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
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState<
    Record<number, number>
  >({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    result,
    setResult,
  ] =
    useState<SubmitPracticeResponse | null>(
      null,
    );

  // ==========================================================
  // LOAD PRACTICE
  // ==========================================================

  useEffect(() => {
    if (
      !Number.isInteger(part) ||
      part < 1 ||
      part > 7
    ) {
      setError("Part không hợp lệ.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPractice() {
      try {
        setLoading(true);
        setError("");

        const data =
          await startPractice(part);

        if (!cancelled) {
          setPractice(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Không thể tải bài luyện.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPractice();

    return () => {
      cancelled = true;
    };
  }, [part]);

  // ==========================================================
  // FLATTEN QUESTIONS
  // ==========================================================

  const questions =
    useMemo(() => {
      if (!practice) {
        return [];
      }

      return practice.groups.flatMap(
        (group) =>
          group.questions.map(
            (question) => ({
              ...question,

              groupId: group.id,

              groupTitle:
                group.title,

              passage:
                group.passage,

              imageUrl:
                group.image_url,

              audioUrl:
                group.audio_url,

              groupType:
                group.group_type,

              audioStartTime:
                group.audio_start_time,

              audioEndTime:
                group.audio_end_time,
            }),
          ),
      );
    }, [practice]);

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const currentQuestion =
    questions[currentIndex];
function resolveMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) {
    return undefined;
  }

  const value = String(url).trim();

  if (!value) {
    return undefined;
  }

  // URL đầy đủ
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Backend của NestJS
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  // Nếu DB lưu:
  // /uploads/xxx.jpg
  // /audio/xxx.mp3
  // /images/xxx.jpg
  if (value.startsWith("/")) {
    return `${apiUrl}${value}`;
  }

  // Nếu DB lưu:
  // uploads/xxx.jpg
  // audio/xxx.mp3
  // images/xxx.jpg
  return `${apiUrl}/${value}`;
}
  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  function handleSelectOption(
    questionId: number,
    optionId: number,
  ) {
    if (submitting || result) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,

      [questionId]:
        optionId,
    }));
  }

  // ==========================================================
  // NEXT
  // ==========================================================

  function handleNext() {
    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1,
      );
    }
  }

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(
        (prev) => prev - 1,
      );
    }
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit() {
    if (!practice) {
      return;
    }

    if (submitting || result) {
      return;
    }

    const unanswered =
      questions.filter(
        (question) =>
          !answers[
            question.id
          ],
      );

    if (unanswered.length > 0) {
      const confirmSubmit =
        window.confirm(
          `Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài không?`,
        );

      if (!confirmSubmit) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        sessionId:
          practice.sessionId,

        answers:
          questions.map(
            (question) => ({
              questionId:
                question.id,

              optionId:
                answers[
                  question.id
                ] ?? 0,
            }),
          ).filter(
            (answer) =>
              answer.optionId > 0,
          ),
      };

      const data =
        await submitPractice(
          payload,
        );

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể nộp bài.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Đang tải bài luyện...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !practice) {
    return (
      <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-xl font-bold text-red-400">
            Không thể tải bài luyện
          </h1>

          <p className="mt-3 text-zinc-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/practice",
              )
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  if (result) {
    return (
      <ResultView
        result={result}
        onBack={() =>
          router.push(
            "/dashboard/practice",
          )
        }
      />
    );
  }

  // ==========================================================
  // NO DATA
  // ==========================================================

  if (
    !practice ||
    !currentQuestion
  ) {
    return (
      <div className="min-h-screen bg-[#09090b] p-10 text-center text-zinc-400">
        Không có câu hỏi.
      </div>
    );
  }

  const selectedOptionId =
    answers[
      currentQuestion.id
    ];

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs text-zinc-500">
              {practice.testTitle}
            </p>

            <h1 className="font-bold">
              Part {practice.part}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-400">
              Câu{" "}
              {currentIndex + 1} /{" "}
              {questions.length}
            </p>
          </div>
        </div>

        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-red-600 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </header>

      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* GROUP CONTEXT */}

        {currentQuestion.groupTitle && (
          <div className="mb-5 text-sm text-zinc-500">
            {currentQuestion.groupTitle}
          </div>
        )}

        {/* PASSAGE */}

        {currentQuestion.passage && (
          <div className="mb-6 rounded-2xl border border-white/5 bg-[#121214] p-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Reading passage
            </div>

            <div className="whitespace-pre-wrap leading-7 text-zinc-300">
              {currentQuestion.passage}
            </div>
          </div>
        )}

        {/* IMAGE */}

        {currentQuestion.imageUrl && (
  <div className="mb-6 flex justify-center rounded-2xl border border-white/5 bg-[#121214] p-5">
    <img
      src={resolveMediaUrl(
        currentQuestion.imageUrl,
      )}
      alt="Question image"
      className="max-h-[420px] max-w-full rounded-xl object-contain"
      onError={(event) => {
        console.error(
          "Không tải được hình:",
          resolveMediaUrl(
            currentQuestion.imageUrl,
          ),
        );

        event.currentTarget.style.display =
          "none";
      }}
    />
  </div>
)}
        {/* AUDIO */}

        {currentQuestion.audioUrl && (
  <div className="mb-6 rounded-2xl border border-white/5 bg-[#121214] p-5">
    <p className="mb-3 text-sm text-zinc-400 flex items-center gap-2">
      <Headphones className="w-4 h-4 text-red-500" />
      <span>Audio</span>
    </p>

    <audio
      controls
      preload="metadata"
      className="w-full"
      src={resolveMediaUrl(
        currentQuestion.audioUrl,
      )}
      onError={() => {
        console.error(
          "Không tải được audio:",
          resolveMediaUrl(
            currentQuestion.audioUrl,
          ),
        );
      }}
    />

  </div>
)}

        {/* QUESTION */}

        <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 font-bold">
              {currentIndex + 1}
            </div>

            <h2 className="text-lg font-semibold leading-7">
              {
                currentQuestion.question_text
              }
            </h2>
          </div>

          {/* OPTIONS */}

<div className="space-y-3">
  {currentQuestion.options.map(
    (option) => {
      const selected =
        selectedOptionId ===
        option.id;

      // Part 1 và Part 2:
      // chỉ hiển thị A/B/C/D, không hiển thị nội dung đáp án
      const hideOptionText =
        part === 1 || part === 2;

      return (
        <button
          key={option.id}
          type="button"
          onClick={() =>
            handleSelectOption(
              currentQuestion.id,
              option.id,
            )
          }
          className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
            selected
              ? "border-red-500 bg-red-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
          }`}
        >
          {/* A / B / C / D */}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
              selected
                ? "bg-red-600 text-white"
                : "bg-white/10 text-zinc-300"
            }`}
          >
            {option.option_label}
          </span>

          {/* Nội dung đáp án:
              chỉ hiện từ Part 3 trở đi */}
          {!hideOptionText && (
            <span className="pt-1 text-zinc-300">
              {option.option_text}
            </span>
          )}
        </button>
      );
    },
  )}
</div>
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={
              handlePrevious
            }
            disabled={
              currentIndex === 0
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <div className="text-sm text-zinc-500">
            {
              Object.keys(
                answers,
              ).length
            } /{" "}
            {questions.length} câu đã chọn
          </div>

          {currentIndex <
          questions.length - 1 ? (
            <button
              type="button"
              onClick={
                handleNext
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium hover:bg-red-500"
            >
              <span>Câu tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting
                ? "Đang chấm..."
                : "Nộp bài"}</span>
            </button>
          )}
        </div>

        {/* ==================================================
            QUESTION NAVIGATOR
        ================================================== */}

        <div className="mt-8 rounded-2xl border border-white/5 bg-[#121214] p-5">
          <p className="mb-4 text-sm font-medium">
            Danh sách câu
          </p>

          <div className="flex flex-wrap gap-2">
            {questions.map(
              (question, index) => {
                const answered =
                  Boolean(
                    answers[
                      question.id
                    ],
                  );

                return (
                  <button
                    key={
                      question.id
                    }
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        index,
                      )
                    }
                    className={`h-9 w-9 rounded-lg text-xs font-medium ${
                      index ===
                      currentIndex
                        ? "bg-red-600 text-white"
                        : answered
                        ? "bg-green-600/20 text-green-400"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// RESULT VIEW
// ============================================================

function ResultView({
  result,
  onBack,
}: {
  result: SubmitPracticeResponse;
  onBack: () => void;
}) {
  const isGood =
    result.score >= 70;

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            {isGood ? (
              <PartyPopper className="w-10 h-10 text-emerald-400" />
            ) : (
              <Target className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Hoàn thành!
          </h1>

          <p className="mt-2 text-zinc-500">
            Part {result.part}
          </p>

          {/* SCORE */}

          <div className="mt-8">
            <div
              className={`text-6xl font-black ${
                isGood
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {result.score}%
            </div>

            <p className="mt-2 text-zinc-500">
              Độ chính xác
            </p>
          </div>

          {/* STATS */}

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat
              label="Tổng câu"
              value={
                result.total
              }
            />

            <Stat
              label="Đúng"
              value={
                result.correct
              }
            />

            <Stat
              label="Sai"
              value={
                result.wrong
              }
            />
          </div>

          {/* BUTTON */}

          <button
            type="button"
            onClick={onBack}
            className="mt-8 rounded-xl bg-red-600 px-7 py-3 font-medium hover:bg-red-500"
          >
            Quay lại Luyện tập
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT
// ============================================================

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-5">
      <div className="text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-xs text-zinc-500">
        {label}
      </div>
    </div>
  );
}