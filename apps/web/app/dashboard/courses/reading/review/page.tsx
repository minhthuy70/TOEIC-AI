"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getReadingCompletedLessons,
  getReadingLessonById,
  type ReadingGroup,
  type ReadingLessonSummary,
} from "@/services/reading";

const REVIEW_MODES = [
  { id: "lesson", label: "Ôn theo bài đã học" },
  { id: "all", label: "Ôn tất cả" },
];

const QUESTION_LIMITS = [5, 10, 15, 20];

type ReviewMode = "lesson" | "all";

export default function ReadingReviewPage() {
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<ReviewMode>("lesson");

  const [lessons, setLessons] = useState<
    ReadingLessonSummary[]
  >([]);

  const [selectedLesson, setSelectedLesson] =
    useState<ReadingLessonSummary | null>(null);

  const [reviewGroups, setReviewGroups] = useState<
    ReadingGroup[]
  >([]);

  const [loadingReview, setLoadingReview] =
    useState(false);

  const [questionLimit, setQuestionLimit] =
    useState<number>(10);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  const [submitted, setSubmitted] =
    useState(false);

  const [correctCount, setCorrectCount] =
    useState(0);

  /* =========================================================
   * LOAD BÀI ĐÃ HỌC
   * ========================================================= */

  const loadLessons = async () => {
    try {
      setLoading(true);

      const res = await getReadingCompletedLessons();

      if (res.success) {
        setLessons(res.lessons || []);
      }
    } catch (err) {
      console.error(
        "Không thể tải danh sách bài Reading đã học",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  /* =========================================================
   * RESET SESSION
   * ========================================================= */

  const resetSession = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrectCount(0);
  };

  /* =========================================================
   * CHỌN MỘT BÀI
   * ========================================================= */

  const handleSelectLesson = async (
    lesson: ReadingLessonSummary,
  ) => {
    try {
      setLoadingReview(true);

      setMode("lesson");
      setSelectedLesson(lesson);

      resetSession();

      const res = await getReadingLessonById(
        lesson.id,
      );

      if (res.success && res.lesson) {
        const groups =
          res.lesson.reading_lesson_groups || [];

        setReviewGroups(groups);

        const totalQuestions =
          groups.reduce(
            (sum, group) =>
              sum +
              (group.reading_questions?.length ?? 0),
            0,
          );

        setQuestionLimit(
          Math.min(10, totalQuestions) || 1,
        );
      } else {
        setReviewGroups([]);
      }
    } catch (err) {
      console.error(
        "Không thể tải review bài Reading",
        err,
      );

      setReviewGroups([]);
    } finally {
      setLoadingReview(false);
    }
  };

  /* =========================================================
   * ÔN TẤT CẢ
   *
   * completed-lessons -> lấy toàn bộ bài đã học
   * lesson/:id        -> lấy chi tiết từng bài
   * ========================================================= */

  const handleSelectAll = async () => {
    try {
      setLoadingReview(true);

      setMode("all");
      setSelectedLesson(null);

      resetSession();

      const completedRes =
        await getReadingCompletedLessons();

      if (
        !completedRes.success ||
        !completedRes.lessons?.length
      ) {
        setReviewGroups([]);
        return;
      }

      const completedLessons =
        completedRes.lessons;

      const lessonResponses =
        await Promise.all(
          completedLessons.map((lesson) =>
            getReadingLessonById(lesson.id),
          ),
        );

      const groups: ReadingGroup[] = [];

      lessonResponses.forEach((res) => {
        if (
          res.success &&
          res.lesson?.reading_lesson_groups
        ) {
          groups.push(
            ...res.lesson.reading_lesson_groups,
          );
        }
      });

      setReviewGroups(groups);

      const totalQuestions =
        groups.reduce(
          (sum, group) =>
            sum +
            (group.reading_questions?.length ?? 0),
          0,
        );

      setQuestionLimit(
        Math.min(15, totalQuestions) || 1,
      );
    } catch (err) {
      console.error(
        "Không thể tải review toàn bộ Reading",
        err,
      );

      setReviewGroups([]);
    } finally {
      setLoadingReview(false);
    }
  };

  /* =========================================================
   * ĐỔI CHẾ ĐỘ
   * ========================================================= */

  const handleModeChange = async (
    newMode: ReviewMode,
  ) => {
    if (newMode === mode) return;

    resetSession();

    if (newMode === "all") {
      await handleSelectAll();
      return;
    }

    setMode("lesson");

    if (lessons.length > 0) {
      await handleSelectLesson(lessons[0]);
    } else {
      setSelectedLesson(null);
      setReviewGroups([]);
    }
  };

  /* =========================================================
   * FLATTEN QUESTIONS
   * ========================================================= */

  const flattenedQuestions = useMemo(() => {
    return reviewGroups.flatMap((group) =>
      (group.reading_questions || []).map(
        (question) => ({
          ...question,

          groupTitle:
            group.title ||
            `Group ${group.display_order ?? group.id}`,

          groupPassage:
            group.passage || null,

          groupKnowledge:
            group.knowledge || null,
        }),
      ),
    );
  }, [reviewGroups]);

  /* =========================================================
   * CÂU HỎI HIỂN THỊ
   * ========================================================= */

  const visibleQuestions = useMemo(() => {
    if (
      !questionLimit ||
      questionLimit <= 0
    ) {
      return flattenedQuestions;
    }

    return flattenedQuestions.slice(
      0,
      questionLimit,
    );
  }, [
    flattenedQuestions,
    questionLimit,
  ]);

  /* =========================================================
   * THỐNG KÊ
   * ========================================================= */

  const totalQuestions =
    visibleQuestions.length;

  const answeredCount =
    visibleQuestions.filter(
      (question) =>
        answers[question.id],
    ).length;

  const isReadyToSubmit =
    answeredCount === totalQuestions &&
    totalQuestions > 0;

  /* =========================================================
   * CHỌN ĐÁP ÁN
   * ========================================================= */

  const handleAnswerSelect = (
    questionId: number,
    optionKey: string,
  ) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  /* =========================================================
   * CHỌN SỐ CÂU
   * ========================================================= */

  const handleQuestionLimitChange = (
    limit: number,
  ) => {
    const newLimit = Math.min(
      limit,
      flattenedQuestions.length,
    );

    setQuestionLimit(newLimit);

    resetSession();
  };

  /* =========================================================
   * HOÀN THÀNH
   * ========================================================= */

  const handleSubmit = () => {
    if (
      !isReadyToSubmit ||
      submitted
    ) {
      return;
    }

    const correct =
      visibleQuestions.reduce(
        (count, question) => {
          const selected =
            answers[question.id];

          const correctOption =
            question.reading_options.find(
              (option) =>
                option.is_correct,
            );

          return (
            count +
            (selected ===
            correctOption?.option_key
              ? 1
              : 0)
          );
        },
        0,
      );

    setCorrectCount(correct);
    setSubmitted(true);
  };

  /* =========================================================
   * ĐIỂM %
   * ========================================================= */

  const scorePercent =
    totalQuestions > 0
      ? Math.round(
          (correctCount /
            totalQuestions) *
            100,
        )
      : 0;

  /* =========================================================
   * TITLE
   * ========================================================= */

  const selectedLessonTitle =
    mode === "all"
      ? "Ôn tất cả bài đã học"
      : selectedLesson?.title ||
        "Chọn bài để ôn";

  /* =========================================================
   * RENDER
   * ========================================================= */

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            🔁 Ôn tập Reading
          </h1>

          <p className="text-zinc-400 text-sm mt-1">
            Chọn bài đã học hoặc ôn tất cả câu hỏi.
            Sau khi làm xong, bạn sẽ thấy đúng/sai,
            đáp án đúng và giải thích.
          </p>
        </div>

        <Link
          href="/dashboard/courses"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          ← Quay lại Học tập
        </Link>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <div className="space-y-4">
          {/* CHẾ ĐỘ ÔN */}

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-[0.18em] mb-4">
              Chọn chế độ ôn
            </h2>

            <div className="space-y-2">
              {REVIEW_MODES.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    handleModeChange(
                      item.id as ReviewMode,
                    )
                  }
                  className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === item.id
                      ? "bg-red-600 text-white border border-red-600/20"
                      : "bg-zinc-950/70 text-zinc-300 border border-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* BÀI ĐÃ HỌC */}

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-[0.18em]">
                Bài đã học
              </h2>

              <button
                onClick={handleSelectAll}
                className="rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-600/15 transition"
              >
                Ôn tất cả
              </button>
            </div>

            {loading ? (
              <div className="text-zinc-500 text-sm">
                Đang tải...
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-zinc-500 text-sm">
                Chưa có bài học đã hoàn thành.
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() =>
                      handleSelectLesson(
                        lesson,
                      )
                    }
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedLesson?.id ===
                        lesson.id &&
                      mode === "lesson"
                        ? "border-red-600 bg-red-600/10 text-white"
                        : "border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {lesson.title}
                        </p>

                        <p className="text-[11px] text-zinc-500 mt-1">
                          Part {lesson.part} ·{" "}
                          {lesson.totalGroups}{" "}
                          group ·{" "}
                          {lesson.totalQuestions}{" "}
                          câu
                        </p>

                        {lesson.best_score !==
                          null &&
                          lesson.best_score !==
                            undefined && (
                            <p className="text-[11px] text-emerald-400 mt-1">
                              Điểm tốt nhất:{" "}
                              {
                                lesson.best_score
                              }
                            </p>
                          )}
                      </div>

                      <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                        {lesson.lastStudied
                          ? new Date(
                              lesson.lastStudied,
                            ).toLocaleDateString(
                              "vi-VN",
                            )
                          : "Chưa ôn"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5 min-h-105">
          {loadingReview ? (
            <div className="flex min-h-65 items-center justify-center text-zinc-500">
              Đang tải dữ liệu ôn...
            </div>
          ) : reviewGroups.length === 0 ? (
            <div className="flex min-h-65 flex-col items-center justify-center text-zinc-400 space-y-3">
              <p className="text-sm font-semibold">
                Chưa có nội dung ôn.
              </p>

              <p className="text-xs text-zinc-500 text-center max-w-sm">
                Chọn một bài đã học hoặc nhấn
                Ôn tất cả để hiển thị câu hỏi
                Reading và tiếp tục.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  REVIEW HEADER
              ================================================= */}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-white text-lg font-bold">
                    {selectedLessonTitle}
                  </p>

                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tổng câu hỏi:{" "}
                    {totalQuestions} · Đã trả lời:{" "}
                    {answeredCount}/
                    {totalQuestions}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {QUESTION_LIMITS.map(
                    (count) => {
                      const actualCount =
                        Math.min(
                          count,
                          flattenedQuestions.length,
                        );

                      const disabled =
                        flattenedQuestions.length <
                        count;

                      return (
                        <button
                          key={count}
                          onClick={() =>
                            handleQuestionLimitChange(
                              count,
                            )
                          }
                          disabled={disabled}
                          className={`rounded-full px-3 py-2 text-[11px] transition ${
                            questionLimit ===
                            actualCount
                              ? "bg-red-600 text-white"
                              : disabled
                              ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                              : "bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900"
                          }`}
                        >
                          {count} câu
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() =>
                      handleQuestionLimitChange(
                        flattenedQuestions.length,
                      )
                    }
                    className={`rounded-full px-3 py-2 text-[11px] transition ${
                      questionLimit ===
                      flattenedQuestions.length
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    Ôn hết
                  </button>
                </div>
              </div>

              {/* =================================================
                  QUESTIONS
              ================================================= */}

              <div className="space-y-6">
                {visibleQuestions.map(
                  (question, index) => {
                    const correctOption =
                      question.reading_options.find(
                        (option) =>
                          option.is_correct,
                      );

                    const selected =
                      answers[question.id];

                    const isCorrect =
                      selected ===
                      correctOption?.option_key;

                    return (
                      <div
                        key={question.id}
                        className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-5"
                      >
                        <div className="flex flex-col gap-4">
                          {/* QUESTION HEADER */}

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">
                                Câu {index + 1}:{" "}
                                {
                                  question.question_text
                                }
                              </p>

                              <p className="text-[11px] text-zinc-500 mt-1">
                                {question.question_number
                                  ? `Question ${question.question_number}`
                                  : `Group ${
                                      question.id
                                    }`}
                              </p>
                            </div>

                            {submitted && (
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  isCorrect
                                    ? "bg-emerald-600/15 text-emerald-300 border border-emerald-500/20"
                                    : "bg-red-600/15 text-red-300 border border-red-500/20"
                                }`}
                              >
                                {isCorrect
                                  ? "Đúng"
                                  : "Sai"}
                              </span>
                            )}
                          </div>

                          {/* PASSAGE */}

                          {question.groupPassage && (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-4">
                              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                Đoạn văn
                              </p>

                              <div className="text-sm leading-6 text-zinc-300 whitespace-pre-line">
                                {
                                  question.groupPassage
                                }
                              </div>
                            </div>
                          )}

                          {/* IMAGE */}

                          {(() => {
                            const group =
                              reviewGroups.find(
                                (item) =>
                                  item.reading_questions?.some(
                                    (q) =>
                                      q.id ===
                                      question.id,
                                  ),
                              );

                            if (!group?.image_url) {
                              return null;
                            }

                            return (
                              <div className="rounded-2xl overflow-hidden border border-zinc-800/70 bg-zinc-900/70">
                                <img
                                  src={
                                    group.image_url
                                  }
                                  alt="Reading passage"
                                  className="w-full max-h-80 object-contain"
                                />
                              </div>
                            );
                          })()}

                          {/* OPTIONS */}

                          <div className="grid gap-2">
                            {question.reading_options.map(
                              (option) => {
                                const selectedOption =
                                  selected ===
                                  option.option_key;

                                const optionClasses =
                                  submitted
                                    ? option.is_correct
                                      ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-200"
                                      : selectedOption
                                      ? "bg-red-600/10 border border-red-500/20 text-red-200"
                                      : "bg-zinc-950/80 border border-zinc-800 text-zinc-300"
                                    : selectedOption
                                    ? "bg-red-600/15 border border-red-600/30 text-white"
                                    : "bg-zinc-950/80 border border-zinc-800 text-zinc-300 hover:bg-zinc-900";

                                return (
                                  <button
                                    key={
                                      option.id
                                    }
                                    onClick={() =>
                                      handleAnswerSelect(
                                        question.id,
                                        option.option_key,
                                      )
                                    }
                                    disabled={
                                      submitted
                                    }
                                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${optionClasses}`}
                                  >
                                    <span className="font-semibold mr-3">
                                      {
                                        option.option_key
                                      }
                                      .
                                    </span>

                                    {
                                      option.option_text
                                    }
                                  </button>
                                );
                              },
                            )}
                          </div>

                          {/* RESULT */}

                          {submitted && (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/80 p-4 text-sm text-zinc-300 space-y-3">
                              {/* ĐÁP ÁN */}

                              <div>
                                <p className="text-sm font-semibold text-white">
                                  Đáp án đúng:
                                </p>

                                {correctOption ? (
                                  <p>
                                    {
                                      correctOption.option_key
                                    }
                                    .{" "}
                                    {
                                      correctOption.option_text
                                    }
                                  </p>
                                ) : (
                                  <p className="text-zinc-500">
                                    Chưa có đáp án
                                    đúng.
                                  </p>
                                )}
                              </div>

                              {/* GIẢI THÍCH */}

                              {question.explanation && (
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Giải thích:
                                  </p>

                                  <p className="whitespace-pre-line">
                                    {
                                      question.explanation
                                    }
                                  </p>
                                </div>
                              )}

                              {/* KIẾN THỨC CÂU HỎI */}

                              {question.knowledge && (
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Kiến thức cần
                                    nắm:
                                  </p>

                                  <p className="whitespace-pre-line">
                                    {
                                      question.knowledge
                                    }
                                  </p>
                                </div>
                              )}

                              {/* KIẾN THỨC GROUP */}

                              {!question.knowledge &&
                                question.groupKnowledge && (
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      Kiến thức cần
                                      nắm:
                                    </p>

                                    <p className="whitespace-pre-line">
                                      {
                                        question.groupKnowledge
                                      }
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}

                {/* =================================================
                    COMPLETE
                ================================================= */}

                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Hoàn thành ôn tập
                      </p>

                      <p className="text-[12px] text-zinc-400 mt-1">
                        Chọn đáp án cho tất cả câu hỏi
                        rồi nhấn hoàn thành để xem kết
                        quả.
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={
                        !isReadyToSubmit ||
                        submitted
                      }
                      className={`rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                        !isReadyToSubmit ||
                        submitted
                          ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      Hoàn thành
                    </button>
                  </div>

                  {/* RESULT SUMMARY */}

                  {submitted && (
                    <div className="mt-4 rounded-2xl border border-emerald-600/30 bg-emerald-950/50 p-4 text-white">
                      <p className="font-semibold">
                        Kết quả ôn tập
                      </p>

                      <p className="mt-2 text-sm text-zinc-300">
                        Bạn trả lời đúng{" "}
                        <span className="text-emerald-300 font-semibold">
                          {correctCount}
                        </span>{" "}
                        /{" "}
                        <span className="text-white font-semibold">
                          {totalQuestions}
                        </span>{" "}
                        câu.
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Tỷ lệ đúng:{" "}
                        <span className="text-emerald-300 font-semibold">
                          {scorePercent}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}