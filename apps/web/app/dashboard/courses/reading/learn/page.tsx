"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getReadingLessonById,
  submitReadingLesson,
  type ReadingLesson,
  type ReadingQuestion,
} from "@/services/reading";

function ReadingLearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonIdParam = searchParams.get("lesson");
const groupIdParam = searchParams.get("group");

const lessonId = Number(lessonIdParam);
const groupId = Number(groupIdParam);

  const [lesson, setLesson] = useState<ReadingLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  /**
   * Flatten toàn bộ câu hỏi từ các group
   * để dễ xử lý next / previous / progress.
   */
  const flattenedQuestions = useMemo(() => {
    if (!lesson) return [];

    return lesson.reading_lesson_groups.flatMap((group) =>
      group.reading_questions.map((question) => ({
        ...question,
        groupId: group.id,
        groupTitle:
          group.title ||
          `Đoạn ${group.display_order ?? group.id}`,
        passage: group.passage,
        imageUrl: group.image_url,
        groupKnowledge: group.knowledge,
      })),
    );
  }, [lesson]);

  const currentQuestion = flattenedQuestions[currentQuestionIndex];

  const answeredCount = useMemo(() => {
    return flattenedQuestions.filter(
      (question) => answers[question.id],
    ).length;
  }, [answers, flattenedQuestions]);

  const totalQuestions = flattenedQuestions.length;

  const progressPercent =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  /**
   * Load lesson
   */
  useEffect(() => {
  const loadLesson = async () => {
    if (
      !lessonIdParam ||
      !Number.isInteger(lessonId) ||
      lessonId <= 0
    ) {
      setError("Lesson ID không hợp lệ.");
      setLoading(false);
      return;
    }

    if (
      !groupIdParam ||
      !Number.isInteger(groupId) ||
      groupId <= 0
    ) {
      setError("Group ID không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await getReadingLessonById(lessonId);

      if (!res.success || !res.lesson) {
        setError("Không tìm thấy bài Reading này.");
        return;
      }

      // ============================================
      // CHỈ LẤY 1 GROUP ĐƯỢC CHỌN
      // ============================================
      const selectedGroup =
        res.lesson.reading_lesson_groups.find(
          (group) => group.id === groupId,
        );

      if (!selectedGroup) {
        setError(
          `Không tìm thấy group ${groupId} trong bài Reading này.`,
        );
        return;
      }

      // Chỉ giữ lại đúng 1 group
      const filteredLesson = {
        ...res.lesson,
        reading_lesson_groups: [selectedGroup],
      };

      setLesson(filteredLesson);
    } catch (err) {
      console.error("Không thể tải bài Reading:", err);

      setError(
        "Không thể tải bài Reading. Vui lòng kiểm tra kết nối với server.",
      );
    } finally {
      setLoading(false);
    }
  };

  loadLesson();
}, [
  lessonIdParam,
  lessonId,
  groupIdParam,
  groupId,
]);

  /**
   * Chọn đáp án
   */
  const handleSelectAnswer = (
    questionId: number,
    optionKey: string,
  ) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  /**
   * Câu trước
   */
  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;

    setCurrentQuestionIndex((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Câu tiếp theo
   */
  const handleNext = () => {
    if (currentQuestionIndex >= totalQuestions - 1) return;

    setCurrentQuestionIndex((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Chuyển trực tiếp tới câu hỏi
   */
  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Nộp bài
   */
  const handleSubmit = async () => {
    if (!lesson || totalQuestions === 0) return;

    if (answeredCount < totalQuestions) {
      return;
    }

    try {
      setSubmitting(true);

      let correct = 0;

      flattenedQuestions.forEach((question) => {
        const selected = answers[question.id];

        const correctOption = question.reading_options.find(
          (option) => option.is_correct === true,
        );

        if (
          correctOption &&
          selected === correctOption.option_key
        ) {
          correct++;
        }
      });

      const calculatedScore = Math.round(
        (correct / totalQuestions) * 100,
      );

      setCorrectCount(correct);
      setScore(calculatedScore);
      setSubmitted(true);

      try {
        await submitReadingLesson(
          lesson.id,
          calculatedScore,
        );
      } catch (submitError) {
        console.error(
          "Không thể lưu tiến độ Reading:",
          submitError,
        );
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Không thể chấm bài:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Làm lại bài
   */
  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSubmitted(false);
    setCorrectCount(0);
    setScore(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />

          <p className="text-sm text-zinc-400">
            Đang tải bài Reading...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error
   */
  if (error || !lesson) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>

          <h1 className="text-xl font-bold text-white">
            Không thể mở bài Reading
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {error || "Không tìm thấy bài học."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition"
            >
              ← Quay lại
            </button>

            <Link
              href="/dashboard/courses"
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Về Học tập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Không có câu hỏi
   */
  if (totalQuestions === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
          <div className="text-4xl mb-4">📖</div>

          <h1 className="text-xl font-bold text-white">
            Bài học chưa có câu hỏi
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Bài Reading này hiện chưa có dữ liệu câu hỏi.
          </p>

          <Link
            href="/dashboard/courses"
            className="inline-flex mt-6 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            ← Quay lại Học tập
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Kết quả sau khi nộp
   */
  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-red-400 font-semibold">
              Reading
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">
              {lesson.title}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Part {lesson.part} · Kết quả bài học
            </p>
          </div>

          <Link
            href="/dashboard/courses"
            className="text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            ← Quay lại Học tập
          </Link>
        </div>

        {/* Result */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center">
              <p className="text-xs text-zinc-500">
                Điểm
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {score}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                / 100
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center">
              <p className="text-xs text-zinc-500">
                Câu đúng
              </p>

              <p className="mt-2 text-4xl font-bold text-emerald-400">
                {correctCount}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                / {totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center">
              <p className="text-xs text-zinc-500">
                Tỷ lệ đúng
              </p>

              <p className="mt-2 text-4xl font-bold text-red-400">
                {Math.round(
                  (correctCount / totalQuestions) * 100,
                )}
                %
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">
                Kết quả
              </span>

              <span className="text-sm font-semibold text-white">
                {score}/100
              </span>
            </div>

            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-600 transition-all"
                style={{
                  width: `${score}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              🔄 Làm lại
            </button>

            <Link
              href="/dashboard/courses/reading/review"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 transition text-center"
            >
              🔁 Ôn tập
            </Link>

            <Link
              href="/dashboard/courses"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 transition text-center"
            >
              ← Học tập
            </Link>
          </div>
        </div>

        {/* Review all questions */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              Xem lại bài làm
            </h2>

            <p className="text-xs text-zinc-500 mt-1">
              Kiểm tra đáp án, giải thích và kiến thức cần nắm.
            </p>
          </div>

          {flattenedQuestions.map((question, index) => {
            const selected = answers[question.id];

            const correctOption =
              question.reading_options.find(
                (option) => option.is_correct === true,
              );

            const isCorrect =
              selected === correctOption?.option_key;

            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                selected={selected}
                correctOption={correctOption}
                isCorrect={isCorrect}
                submitted
                onSelectAnswer={handleSelectAnswer}
              />
            );
          })}
        </div>
      </div>
    );
  }

  /**
   * Màn hình làm bài
   */
  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-600/10 border border-red-500/20 px-3 py-1 text-[11px] font-semibold text-red-300">
              READING
            </span>

            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400">
              Part {lesson.part}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-white">
            {lesson.title}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Bài {lesson.display_order ?? lesson.id} ·{" "}
            {totalQuestions} câu hỏi
          </p>
        </div>

        <Link
          href="/dashboard/courses"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          ← Quay lại Học tập
        </Link>
      </div>

      {/* Progress */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Tiến độ bài học
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              Đã trả lời {answeredCount}/{totalQuestions} câu
            </p>
          </div>

          <span className="text-sm font-bold text-red-400">
            {progressPercent}%
          </span>
        </div>

        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-red-600 transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Question navigation */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Danh sách câu hỏi
          </p>

          <p className="text-xs text-zinc-500">
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {flattenedQuestions.map((question, index) => {
            const answered = Boolean(answers[question.id]);
            const active =
              index === currentQuestionIndex;

            return (
              <button
                key={question.id}
                onClick={() => handleGoToQuestion(index)}
                className={`h-9 min-w-9 rounded-xl px-3 text-xs font-semibold transition ${
                  active
                    ? "bg-red-600 text-white"
                    : answered
                      ? "bg-emerald-600/15 border border-emerald-500/20 text-emerald-300"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {currentQuestion && (
        <>
          {/* Passage */}
          <PassageCard
            question={currentQuestion}
          />

          {/* Question */}
          <QuestionCard
            question={currentQuestion}
            index={currentQuestionIndex}
            selected={answers[currentQuestion.id]}
            submitted={false}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Navigation */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`w-full sm:w-auto rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  currentQuestionIndex === 0
                    ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    : "bg-zinc-950 text-zinc-200 border border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                ← Câu trước
              </button>

              {currentQuestionIndex <
              totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Câu tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    answeredCount < totalQuestions ||
                    submitting
                  }
                  className={`w-full sm:w-auto rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                    answeredCount < totalQuestions ||
                    submitting
                      ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {submitting
                    ? "Đang chấm..."
                    : "✓ Hoàn thành"}
                </button>
              )}
            </div>

            {answeredCount < totalQuestions && (
              <p className="mt-3 text-center text-xs text-zinc-500">
                Bạn cần trả lời đủ{" "}
                {totalQuestions - answeredCount} câu còn lại
                trước khi hoàn thành.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Passage
 */
function PassageCard({
  question,
}: {
  question: ReadingQuestion & {
    passage?: string | null;
    imageUrl?: string | null;
    groupTitle?: string;
    groupKnowledge?: string | null;
  };
}) {
  if (
    !question.passage &&
    !question.imageUrl &&
    !question.groupTitle
  ) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
          Reading passage
        </p>

        {question.groupTitle && (
          <h2 className="mt-1 text-lg font-bold text-white">
            {question.groupTitle}
          </h2>
        )}
      </div>

      {question.imageUrl && (
        <div className="px-5 pt-5">
          <img
            src={question.imageUrl}
            alt={question.groupTitle || "Reading passage"}
            className="max-h-96 w-full object-contain rounded-2xl border border-zinc-800 bg-zinc-950"
          />
        </div>
      )}

      {question.passage && (
        <div className="p-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {question.passage}
            </p>
          </div>
        </div>
      )}

      {question.groupKnowledge && (
  <div className="px-5 pb-5">
    <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
        Kiến thức cần nắm
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
        {question.groupKnowledge}
      </p>
    </div>
  </div>
)}
    </div>
  );
}

/**
 * Question card
 */
function QuestionCard({
  question,
  index,
  selected,
  correctOption,
  isCorrect,
  submitted,
  onSelectAnswer,
}: {
  question: ReadingQuestion & {
    groupTitle?: string;
    groupKnowledge?: string | null;
    passage?: string | null;
    imageUrl?: string | null;
  };
  index: number;
  selected?: string;
  correctOption?: {
    id: number;
    option_key: string;
    option_text: string;
    is_correct?: boolean;
  };
  isCorrect?: boolean;
  submitted: boolean;
  onSelectAnswer: (
    questionId: number,
    optionKey: string,
  ) => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
      {/* Question header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-red-400">
            CÂU {index + 1}
          </p>

          <h2 className="mt-2 text-base sm:text-lg font-semibold leading-7 text-white">
            {question.question_text}
          </h2>
        </div>

        {submitted && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border ${
              isCorrect
                ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-600/10 border-red-500/20 text-red-300"
            }`}
          >
            {isCorrect ? "✓ Đúng" : "✕ Sai"}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="mt-5 grid gap-3">
        {question.reading_options.map((option) => {
          const isSelected =
            selected === option.option_key;

          let optionClass =
            "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900";

          if (!submitted && isSelected) {
            optionClass =
              "bg-red-600/15 border-red-500/40 text-white";
          }

          if (submitted) {
            if (option.is_correct) {
              optionClass =
                "bg-emerald-600/10 border-emerald-500/30 text-emerald-200";
            } else if (isSelected) {
              optionClass =
                "bg-red-600/10 border-red-500/30 text-red-200";
            } else {
              optionClass =
                "bg-zinc-950/80 border-zinc-800 text-zinc-400";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={submitted}
              onClick={() =>
                onSelectAnswer(
                  question.id,
                  option.option_key,
                )
              }
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${optionClass} ${
                submitted
                  ? "cursor-default"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : option.is_correct && submitted
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {option.option_key}
                </span>

                <span className="pt-1 text-sm leading-6">
                  {option.option_text}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && (
        <div className="mt-5 space-y-3">
          {correctOption && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
                Đáp án đúng
              </p>

              <p className="mt-2 text-sm text-emerald-100">
                <span className="font-bold">
                  {correctOption.option_key}.
                </span>{" "}
                {correctOption.option_text}
              </p>
            </div>
          )}

          {question.explanation && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Giải thích
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                {question.explanation}
              </p>
            </div>
          )}

          {(question.knowledge ||
            question.groupKnowledge) && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Kiến thức cần nắm
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                {question.knowledge ||
                  question.groupKnowledge}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Suspense wrapper
 *
 * Next.js cần Suspense khi page sử dụng useSearchParams().
 */
export default function ReadingLearnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />

            <p className="text-sm text-zinc-400">
              Đang tải bài Reading...
            </p>
          </div>
        </div>
      }
    >
      <ReadingLearnContent />
    </Suspense>
  );
}