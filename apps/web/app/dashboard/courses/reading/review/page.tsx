"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  getReadingCompletedLessons,
  getReadingLessonById,
  getReadingReviewLessons,
  type ReadingLesson,
  type ReadingLessonGroup,
  type ReadingQuestion,
  type ReadingLessonSummary,
} from "@/services/reading";

type ReviewMode = "part" | "lesson" | "all";

const PART_LABELS: Record<number, string> = {
  5: "Part 5: Incomplete Sentences",
  6: "Part 6: Text Completion",
  7: "Part 7: Reading Comprehension",
};

const PART_ICONS: Record<number, string> = {
  5: "📝",
  6: "📄",
  7: "📚",
};

const VALID_PARTS = [5, 6, 7];

type ReviewQuestion = ReadingQuestion & {
  groupId: number;
  groupTitle: string;
  groupPart: number;
  groupNumber?: number;
  passage?: string | null;
  imageUrl?: string | null;
  groupKnowledge?: string | null;
};

export default function ReadingReviewPage() {
  const searchParams = useSearchParams();

  // =========================================================
  // URL
  // =========================================================

  const partParam = searchParams.get("part");
  const lessonIdParam = searchParams.get("lessonId");

  const parsedPart = partParam ? Number(partParam) : null;
  const parsedLessonId = lessonIdParam
    ? Number(lessonIdParam)
    : null;

  const selectedPartFromUrl =
    parsedPart !== null &&
    VALID_PARTS.includes(parsedPart)
      ? parsedPart
      : null;

  const selectedLessonIdFromUrl =
    parsedLessonId !== null &&
    Number.isFinite(parsedLessonId)
      ? parsedLessonId
      : null;

  // =========================================================
  // BASIC STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);

  const [lessons, setLessons] = useState<
    ReadingLessonSummary[]
  >([]);

  const [reviewLessons, setReviewLessons] = useState<
    ReadingLesson[]
  >([]);

  /**
   * QUAN TRỌNG:
   *
   * reviewGroups chứa danh sách GROUP.
   *
   * Mỗi group là một bài/đoạn Reading riêng.
   * Số câu hỏi trong mỗi group KHÔNG CỐ ĐỊNH.
   */
  const [reviewGroups, setReviewGroups] = useState<
    ReadingLessonGroup[]
  >([]);

  const [selectedLesson, setSelectedLesson] =
    useState<ReadingLessonSummary | null>(null);

  const [selectedPart, setSelectedPart] =
    useState<number | null>(selectedPartFromUrl);

  const [mode, setMode] = useState<ReviewMode>(
    selectedPartFromUrl
      ? "part"
      : selectedLessonIdFromUrl
        ? "lesson"
        : "part",
  );

  // =========================================================
  // SESSION STATE
  // =========================================================

  /**
   * currentGroupIndex:
   * Đang ở GROUP nào.
   *
   * Ví dụ:
   * Group 1 -> Single Passage 001
   * Group 2 -> Single Passage 002
   * Group 3 -> Double Passage 001
   */
  const [currentGroupIndex, setCurrentGroupIndex] =
    useState(0);

  /**
   * currentQuestionIndex:
   * Đang ở câu nào TRONG GROUP hiện tại.
   *
   * Đây là điểm quan trọng:
   *
   * Group A có 4 câu:
   *   1/4
   *   2/4
   *   3/4
   *   4/4
   *
   * Group B có 3 câu:
   *   1/3
   *   2/3
   *   3/3
   *
   * Group C có 5 câu:
   *   1/5
   *   ...
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);

  const [answeredCount, setAnsweredCount] = useState(0);

  const [finished, setFinished] = useState(false);

  // =========================================================
  // RESET SESSION
  // =========================================================

  const resetSession = () => {
    setCurrentGroupIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setFinished(false);
  };

  // =========================================================
  // LOAD COMPLETED LESSONS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      try {
        setLoading(true);

        const res = await getReadingCompletedLessons();

        if (cancelled) return;

        if (res.success) {
          setLessons(
            Array.isArray(res.lessons)
              ? res.lessons
              : [],
          );
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error(
          "Không thể tải danh sách Reading đã học:",
          error,
        );

        if (!cancelled) {
          setLessons([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // LOAD REVIEW LESSONS
  // =========================================================

  const loadReviewLessons =
    async (): Promise<ReadingLesson[]> => {
      try {
        const res = await getReadingReviewLessons();

        if (
          res.success &&
          Array.isArray(res.lessons)
        ) {
          return res.lessons;
        }

        return [];
      } catch (error) {
        console.error(
          "Không thể tải Reading review lessons:",
          error,
        );

        return [];
      }
    };

  // =========================================================
  // LOAD LESSON BY ID
  // =========================================================

  const loadLesson = async (
    lessonId: number,
  ): Promise<ReadingLesson | null> => {
    try {
      const res = await getReadingLessonById(
        lessonId,
      );

      if (res.success && res.lesson) {
        return res.lesson;
      }

      return null;
    } catch (error) {
      console.error(
        `Không thể tải Reading lesson ${lessonId}:`,
        error,
      );

      return null;
    }
  };

  // =========================================================
  // LOAD ALL REVIEW GROUPS
  //
  // Backend:
  // GET /reading/review-lessons
  //
  // Mỗi lesson có:
  //   reading_lesson_groups
  //
  // Mỗi group là một bài Reading riêng.
  // =========================================================

  const loadAllReviewGroups =
    async (): Promise<ReadingLessonGroup[]> => {
      try {
        const review = await loadReviewLessons();

        setReviewLessons(review);

        if (review.length === 0) {
          return [];
        }

        const allGroups = review.flatMap(
          (lesson) =>
            lesson.reading_lesson_groups || [],
        );

        /**
         * Không giới hạn số câu.
         *
         * Không slice().
         * Không lấy 10 câu.
         * Không ép mỗi group thành 4 câu.
         */
        return allGroups;
      } catch (error) {
        console.error(
          "Không thể lấy toàn bộ Reading review groups:",
          error,
        );

        return [];
      }
    };

  // =========================================================
  // APPLY GROUPS
  // =========================================================

  const applyReviewGroups = (
    groups: ReadingLessonGroup[],
  ) => {
    /**
     * Giữ nguyên TOÀN BỘ GROUP.
     *
     * Không cắt câu.
     */
    setReviewGroups(groups);

    setCurrentGroupIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setFinished(false);
  };

  // =========================================================
  // LOAD REVIEW THEO PART
  // =========================================================

  const loadPartReview = async (
    part: number,
  ) => {
    try {
      setLoadingReview(true);

      setMode("part");
      setSelectedPart(part);
      setSelectedLesson(null);

      resetSession();

      const allGroups =
        await loadAllReviewGroups();

      const groupsForPart =
        allGroups.filter((group) => {
          const groupPart = Number(
            (
              group as ReadingLessonGroup & {
                part?: number;
              }
            ).part,
          );

          return groupPart === part;
        });

      console.log(
        "[Reading Review] Part:",
        part,
      );

      console.log(
        "[Reading Review] All groups:",
        allGroups,
      );

      console.log(
        "[Reading Review] Groups for part:",
        groupsForPart,
      );

      groupsForPart.forEach((group) => {
        console.log(
          `[Reading Review] Group ${group.id} - ${
            group.title
          } - số câu: ${
            group.reading_questions?.length ?? 0
          }`,
        );
      });

      applyReviewGroups(groupsForPart);
    } catch (error) {
      console.error(
        "Không thể tải Reading review theo Part:",
        error,
      );

      setReviewGroups([]);
    } finally {
      setLoadingReview(false);
    }
  };

  // =========================================================
  // LOAD REVIEW THEO LESSON
  // =========================================================

  const handleSelectLesson = async (
    lesson: ReadingLessonSummary,
  ) => {
    try {
      setLoadingReview(true);

      setMode("lesson");

      setSelectedLesson(lesson);

      setSelectedPart(null);

      resetSession();

      const fullLesson = await loadLesson(
        lesson.id,
      );

      if (fullLesson) {
        const groups =
          fullLesson.reading_lesson_groups || [];

        console.log(
          "[Reading Review] Lesson:",
          fullLesson,
        );

        console.log(
          "[Reading Review] Lesson groups:",
          groups,
        );

        groups.forEach((group) => {
          console.log(
            `[Reading Review] Group ${group.id} - ${
              group.title
            } - số câu: ${
              group.reading_questions?.length ?? 0
            }`,
          );
        });

        applyReviewGroups(groups);
      } else {
        setReviewGroups([]);
      }
    } catch (error) {
      console.error(
        "Không thể tải review Reading bài:",
        error,
      );

      setReviewGroups([]);
    } finally {
      setLoadingReview(false);
    }
  };

  // =========================================================
  // LOAD ALL
  // =========================================================

  const handleSelectAll = async () => {
    try {
      setLoadingReview(true);

      setMode("all");

      setSelectedPart(null);
      setSelectedLesson(null);

      resetSession();

      const groups =
        await loadAllReviewGroups();

      console.log(
        "[Reading Review] All review groups:",
        groups,
      );

      groups.forEach((group) => {
        console.log(
          `[Reading Review] Group ${group.id} - ${
            group.title
          } - số câu: ${
            group.reading_questions?.length ?? 0
          }`,
        );
      });

      applyReviewGroups(groups);
    } catch (error) {
      console.error(
        "Không thể tải toàn bộ Reading review:",
        error,
      );

      setReviewGroups([]);
    } finally {
      setLoadingReview(false);
    }
  };

  // =========================================================
  // AUTO LOAD THEO URL
  // =========================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    // -------------------------------------------------------
    // ?part=5 / ?part=6 / ?part=7
    // -------------------------------------------------------

    if (selectedPartFromUrl !== null) {
      loadPartReview(selectedPartFromUrl);
      return;
    }

    // -------------------------------------------------------
    // ?lessonId=...
    // -------------------------------------------------------

    if (
      selectedLessonIdFromUrl !== null &&
      lessons.length > 0
    ) {
      const lesson = lessons.find(
        (item) =>
          item.id === selectedLessonIdFromUrl,
      );

      if (lesson) {
        handleSelectLesson(lesson);
      }

      return;
    }

    // -------------------------------------------------------
    // Không có URL
    //
    // Load Part đầu tiên user đã học
    // -------------------------------------------------------

    if (
      lessons.length > 0 &&
      reviewGroups.length === 0
    ) {
      loadPartReview(lessons[0].part);
    }
  }, [
    loading,
    selectedPartFromUrl,
    selectedLessonIdFromUrl,
    lessons,
  ]);

  // =========================================================
  // CURRENT GROUP
  // =========================================================

  const currentGroup =
    reviewGroups[currentGroupIndex] || null;

  // =========================================================
  // CURRENT GROUP QUESTIONS
  //
  // LẤY NGUYÊN SỐ CÂU CỦA GROUP
  //
  // KHÔNG slice()
  // KHÔNG LIMIT 10
  // KHÔNG LIMIT 4
  // =========================================================

  const currentGroupQuestions =
    useMemo<ReviewQuestion[]>(() => {
      if (!currentGroup) {
        return [];
      }

      const groupPart = Number(
        (
          currentGroup as ReadingLessonGroup & {
            part?: number;
          }
        ).part ??
          selectedPart ??
          selectedLesson?.part ??
          0,
      );

      return (
        currentGroup.reading_questions || []
      ).map((question) => ({
        ...question,

        groupId: currentGroup.id,

        groupTitle:
          currentGroup.title ||
          `Group ${currentGroup.id}`,

        groupPart,

        groupNumber: (
          currentGroup as ReadingLessonGroup & {
            group_number?: number;
          }
        ).group_number,

        passage: currentGroup.passage,

        imageUrl: currentGroup.image_url,

        groupKnowledge:
          currentGroup.knowledge,
      }));
    }, [
      currentGroup,
      selectedPart,
      selectedLesson,
    ]);

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  const currentQuestion =
    currentGroupQuestions[
      currentQuestionIndex
    ] || null;

  // =========================================================
  // TOTAL QUESTIONS OF CURRENT GROUP
  //
  // ĐÂY LÀ SỐ CÂU THỰC TẾ CỦA GROUP.
  //
  // Ví dụ:
  // Group 001 có 4 câu -> 4
  // Group 002 có 3 câu -> 3
  // Group 003 có 5 câu -> 5
  // =========================================================

  const totalQuestions =
    currentGroupQuestions.length;

  // =========================================================
  // TOTAL GROUPS
  // =========================================================

  const totalGroups =
    reviewGroups.length;

  // =========================================================
  // CURRENT PART
  // =========================================================

  const currentPart =
    selectedPart ||
    currentQuestion?.groupPart ||
    selectedLesson?.part ||
    null;

  // =========================================================
  // PAGE TITLE
  // =========================================================

  const pageTitle =
    currentPart &&
    PART_LABELS[currentPart]
      ? PART_LABELS[currentPart]
      : mode === "all"
        ? "Ôn tất cả Reading"
        : selectedLesson?.title ||
          "Ôn tập Reading";

  // =========================================================
  // ANSWER
  // =========================================================

  const handleAnswerSelect = (
    optionKey: string,
  ) => {
    if (submitted) {
      return;
    }

    setSelectedAnswer(optionKey);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmitAnswer = () => {
    if (
      !currentQuestion ||
      !selectedAnswer
    ) {
      return;
    }

    const correctOption =
      currentQuestion.reading_options.find(
        (option) => option.is_correct,
      );

    const isCorrect =
      selectedAnswer ===
      correctOption?.option_key;

    if (isCorrect) {
      setCorrectCount(
        (prev) => prev + 1,
      );
    }

    setAnsweredCount(
      (prev) => prev + 1,
    );

    setSubmitted(true);
  };

  // =========================================================
  // NEXT QUESTION
  //
  // LOGIC:
  //
  // 1. Nếu còn câu trong group:
  //      -> sang câu tiếp theo.
  //
  // 2. Nếu hết câu trong group:
  //      -> sang group tiếp theo.
  //
  // 3. Nếu hết group:
  //      -> hoàn thành.
  // =========================================================

  const handleNextQuestion = () => {
    if (!currentGroup) {
      return;
    }

    // -------------------------------------------------------
    // CÒN CÂU TRONG GROUP
    // -------------------------------------------------------

    if (
      currentQuestionIndex <
      totalQuestions - 1
    ) {
      setCurrentQuestionIndex(
        (prev) => prev + 1,
      );

      setSelectedAnswer(null);
      setSubmitted(false);

      return;
    }

    // -------------------------------------------------------
    // HẾT CÂU CỦA GROUP HIỆN TẠI
    // -------------------------------------------------------

    const nextGroupIndex =
      currentGroupIndex + 1;

    // -------------------------------------------------------
    // CÒN GROUP TIẾP THEO
    // -------------------------------------------------------

    if (
      nextGroupIndex <
      totalGroups
    ) {
      setCurrentGroupIndex(
        nextGroupIndex,
      );

      setCurrentQuestionIndex(0);

      setSelectedAnswer(null);
      setSubmitted(false);

      return;
    }

    // -------------------------------------------------------
    // HẾT TOÀN BỘ GROUP
    // -------------------------------------------------------

    setFinished(true);
  };

  // =========================================================
  // RESTART
  // =========================================================

  const handleRestart = () => {
    resetSession();
  };

  // =========================================================
  // GROUP PROGRESS
  // =========================================================

  const questionProgress =
    totalQuestions > 0
      ? Math.round(
          ((currentQuestionIndex +
            (submitted ? 1 : 0)) /
            totalQuestions) *
            100,
        )
      : 0;

  // =========================================================
  // OVERALL GROUP PROGRESS
  // =========================================================

  const groupProgress =
    totalGroups > 0
      ? Math.round(
          ((currentGroupIndex +
            (submitted &&
            currentQuestionIndex ===
              totalQuestions - 1
              ? 1
              : 0)) /
            totalGroups) *
            100,
        )
      : 0;

  // =========================================================
  // CORRECT OPTION
  // =========================================================

  const correctOption =
    currentQuestion?.reading_options.find(
      (option) => option.is_correct,
    );

  const isCurrentCorrect =
    submitted &&
    selectedAnswer ===
      correctOption?.option_key;

  // =========================================================
  // LOADING PAGE
  // =========================================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20">
        <div className="flex items-center justify-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />

          <p className="text-sm text-zinc-500">
            Đang tải dữ liệu Reading...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition mb-4"
          >
            ← Quay lại Học tập
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-xl">
              📖
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Ôn tập Reading
              </h1>

              <p className="text-xs text-zinc-500 mt-1">
                {pageTitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PART SELECTOR
          ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VALID_PARTS.map((part) => {
          const active =
            mode === "part" &&
            selectedPart === part;

          return (
            <button
              key={part}
              onClick={() =>
                loadPartReview(part)
              }
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-red-600/40 bg-red-600/10"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                    active
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {PART_ICONS[part]}
                </div>

                <div>
                  <p
                    className={`text-xs font-semibold ${
                      active
                        ? "text-white"
                        : "text-zinc-300"
                    }`}
                  >
                    Part {part}
                  </p>

                  <p className="text-[10px] text-zinc-600 mt-1">
                    {
                      PART_LABELS[part].split(
                        ": ",
                      )[1]
                    }
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          COMPLETED LESSON INFO
          ===================================================== */}

      {lessons.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-zinc-500">
              Đã tìm thấy{" "}
              <span className="font-semibold text-zinc-300">
                {lessons.length}
              </span>{" "}
              bài Reading đã học.
            </p>

            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
            >
              Ôn tất cả bài đã học →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING REVIEW
          ===================================================== */}

      {loadingReview ? (
        <div className="min-h-[550px] rounded-3xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />

            <p className="text-sm text-zinc-500">
              Đang tải nội dung ôn tập...
            </p>
          </div>
        </div>
      ) : reviewGroups.length === 0 ? (
        /* ===================================================
           EMPTY
           =================================================== */

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
          <div className="text-5xl mb-5">
            📖
          </div>

          <h2 className="text-lg font-semibold text-white">
            Chưa có nội dung ôn tập
          </h2>

          <p className="max-w-md mx-auto text-sm text-zinc-500 mt-2">
            {lessons.length > 0
              ? `Bạn đã hoàn thành ${lessons.length} bài Reading, nhưng hệ thống chưa lấy được các nhóm câu hỏi của bài đã học.`
              : "Hãy hoàn thành bài Reading trước rồi quay lại đây để ôn tập."}
          </p>

          {lessons.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="inline-flex mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              🔁 Tải lại nội dung đã học
            </button>
          )}

          {lessons.length === 0 && (
            <Link
              href="/dashboard/courses"
              className="inline-flex mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Quay lại Học tập
            </Link>
          )}
        </div>
      ) : finished ? (
        /* ===================================================
           RESULT
           =================================================== */

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="max-w-xl mx-auto p-10 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-4xl">
              🎉
            </div>

            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600 mt-6">
              Hoàn thành ôn tập
            </p>

            <h2 className="text-3xl font-bold text-white mt-2">
              Kết quả của bạn
            </h2>

            <div className="mt-8">
              <p className="text-5xl font-black text-emerald-400">
                {correctCount}/
                {answeredCount}
              </p>

              <p className="text-sm text-zinc-500 mt-2">
                câu trả lời đúng
              </p>
            </div>

            <div className="mt-7">
              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${
                      answeredCount > 0
                        ? (correctCount /
                            answeredCount) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="text-xs text-zinc-600 mt-2">
                {answeredCount > 0
                  ? Math.round(
                      (correctCount /
                        answeredCount) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={handleRestart}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Ôn lại lần nữa
              </button>

              <Link
                href="/dashboard/courses"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition"
              >
                Quay lại Học tập
              </Link>
            </div>
          </div>
        </div>
      ) : currentQuestion ? (
        /* ===================================================
           REVIEW SESSION
           =================================================== */

        <div className="space-y-4">
          {/* =================================================
              SESSION HEADER
              ================================================= */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                  {currentPart
                    ? PART_LABELS[currentPart]
                    : "Reading"}
                </p>

                <p className="text-sm font-semibold text-white mt-1">
                  {currentQuestion.groupTitle}
                </p>

                {currentQuestion.groupNumber !==
                  undefined &&
                  currentQuestion.groupNumber !==
                    null && (
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Nhóm{" "}
                      {
                        currentQuestion.groupNumber
                      }
                    </p>
                  )}

                {/* GROUP PROGRESS */}

                <p className="text-[10px] text-zinc-500 mt-2">
                  Group{" "}
                  <span className="font-semibold text-zinc-300">
                    {currentGroupIndex + 1}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold text-zinc-300">
                    {totalGroups}
                  </span>
                </p>
              </div>

              <div className="text-right">
                {/* =================================================
                    QUAN TRỌNG:
                    SỐ CÂU LẤY ĐÚNG TỪ GROUP HIỆN TẠI
                    ================================================= */}

                <p className="text-sm font-bold text-white">
                  Câu{" "}
                  {currentQuestionIndex + 1}{" "}
                  / {totalQuestions}
                </p>

                <p className="text-[10px] text-zinc-600 mt-1">
                  Đúng{" "}
                  {correctCount}
                </p>
              </div>
            </div>

            {/* QUESTION PROGRESS */}

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-zinc-600">
                  Tiến độ câu hỏi của group
                </p>

                <p className="text-[10px] text-zinc-600">
                  {questionProgress}%
                </p>
              </div>

              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      submitted
                        ? questionProgress
                        : 0,
                      submitted ? 5 : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* GROUP PROGRESS */}

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-zinc-600">
                  Tiến độ group
                </p>

                <p className="text-[10px] text-zinc-600">
                  {currentGroupIndex + 1}/
                  {totalGroups}
                </p>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-600 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      groupProgress,
                      2,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              GROUP INFO
              ================================================= */}

          <div className="rounded-3xl border border-red-600/20 bg-red-600/5 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-red-400">
                  Reading Group
                </p>

                <p className="text-sm font-semibold text-white mt-1">
                  {currentGroup?.title ||
                    `Group ${
                      currentGroup?.id
                    }`}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] text-zinc-500">
                  Số câu trong group
                </p>

                <p className="text-lg font-bold text-red-400">
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              PASSAGE
              ================================================= */}

          {currentQuestion.passage && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                    📄
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Đoạn văn
                    </p>

                    <p className="text-[10px] text-zinc-600">
                      Đọc đoạn văn và trả lời câu hỏi
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
                  <p className="text-sm sm:text-base leading-7 text-zinc-300 whitespace-pre-line">
                    {currentQuestion.passage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              IMAGE
              ================================================= */}

          {currentQuestion.imageUrl && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 flex justify-center">
                <img
                  src={
                    currentQuestion.imageUrl.startsWith(
                      "http",
                    )
                      ? currentQuestion.imageUrl
                      : `http://localhost:3001${currentQuestion.imageUrl}`
                  }
                  alt="Reading reference"
                  className="max-h-[420px] w-auto max-w-full object-contain rounded-xl"
                />
              </div>
            </div>
          )}

          {/* =================================================
              QUESTION CARD
              ================================================= */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 text-[10px] font-semibold text-red-300">
                  Câu{" "}
                  {currentQuestionIndex + 1}
                  {" / "}
                  {totalQuestions}
                </span>

                {submitted && (
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold border ${
                      isCurrentCorrect
                        ? "bg-emerald-600/10 text-emerald-300 border-emerald-500/20"
                        : "bg-red-600/10 text-red-300 border-red-500/20"
                    }`}
                  >
                    {isCurrentCorrect
                      ? "✓ Chính xác"
                      : "✕ Chưa chính xác"}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-white">
                {currentQuestion.question_text}
              </h2>

              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 mt-3 mb-5">
                Chọn đáp án đúng
              </p>

              {/* =================================================
                  OPTIONS
                  ================================================= */}

              <div className="space-y-3">
                {currentQuestion.reading_options.map(
                  (option) => {
                    const isSelected =
                      selectedAnswer ===
                      option.option_key;

                    const isCorrect =
                      option.is_correct;

                    let optionClass =
                      "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-950";

                    let letterClass =
                      "bg-zinc-800 text-zinc-400";

                    if (
                      !submitted &&
                      isSelected
                    ) {
                      optionClass =
                        "border-red-600/50 bg-red-600/10 text-white ring-1 ring-red-600/20";

                      letterClass =
                        "bg-red-600 text-white";
                    }

                    if (
                      submitted &&
                      isCorrect
                    ) {
                      optionClass =
                        "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";

                      letterClass =
                        "bg-emerald-600 text-white";
                    }

                    if (
                      submitted &&
                      isSelected &&
                      !isCorrect
                    ) {
                      optionClass =
                        "border-red-500/40 bg-red-500/10 text-red-200";

                      letterClass =
                        "bg-red-600 text-white";
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleAnswerSelect(
                            option.option_key,
                          )
                        }
                        disabled={submitted}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${optionClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${letterClass}`}
                          >
                            {
                              option.option_key
                            }
                          </span>

                          <span className="text-sm leading-6">
                            {
                              option.option_text
                            }
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              {/* =================================================
                  EXPLANATION
                  ================================================= */}

              {submitted && (
                <div className="mt-6 space-y-3">
                  <div
                    className={`rounded-2xl border p-5 ${
                      isCurrentCorrect
                        ? "border-emerald-500/20 bg-emerald-950/20"
                        : "border-red-500/20 bg-red-950/20"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        isCurrentCorrect
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {isCurrentCorrect
                        ? "✓ Chính xác!"
                        : "✕ Chưa chính xác"}
                    </p>

                    {!isCurrentCorrect &&
                      selectedAnswer && (
                        <p className="text-xs text-zinc-400 mt-2">
                          Bạn chọn:{" "}
                          <span className="font-semibold text-white">
                            {selectedAnswer}
                          </span>
                        </p>
                      )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                        Đáp án đúng
                      </p>

                      <p className="text-sm text-emerald-300 mt-2">
                        {correctOption?.option_key}
                        .{" "}
                        {correctOption?.option_text}
                      </p>
                    </div>

                    {currentQuestion.explanation && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                          Giải thích
                        </p>

                        <p className="text-sm leading-6 text-zinc-300 mt-2 whitespace-pre-line">
                          {
                            currentQuestion.explanation
                          }
                        </p>
                      </div>
                    )}

                    {currentQuestion.knowledge && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                          Kiến thức cần nhớ
                        </p>

                        <p className="text-sm leading-6 text-zinc-300 mt-2 whitespace-pre-line">
                          {
                            currentQuestion.knowledge
                          }
                        </p>
                      </div>
                    )}

                    {currentQuestion.groupKnowledge &&
                      !currentQuestion.knowledge && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                            Kiến thức của bài
                          </p>

                          <p className="text-sm leading-6 text-zinc-300 mt-2 whitespace-pre-line">
                            {
                              currentQuestion.groupKnowledge
                            }
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* =================================================
                  ACTION
                  ================================================= */}

              <div className="flex gap-3 mt-6">
                {!submitted ? (
                  <button
                    onClick={
                      handleSubmitAnswer
                    }
                    disabled={!selectedAnswer}
                    className={`ml-auto rounded-xl px-7 py-3 text-sm font-semibold transition ${
                      selectedAnswer
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    onClick={
                      handleNextQuestion
                    }
                    className="ml-auto rounded-xl bg-red-600 px-7 py-3 text-sm font-semibold text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                  >
                    {currentQuestionIndex <
                    totalQuestions - 1
                      ? "Câu tiếp theo →"
                      : currentGroupIndex <
                          totalGroups - 1
                        ? "Sang nhóm tiếp theo →"
                        : "Xem kết quả"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              CURRENT GROUP INFO
              ================================================= */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-zinc-300">
                  Group hiện tại
                </p>

                <p className="text-[10px] text-zinc-600 mt-1">
                  {currentGroup?.title ||
                    `Group ${
                      currentGroup?.id
                    }`}{" "}
                  ·{" "}
                  {totalQuestions} câu
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-zinc-600">
                  Tiến độ
                </p>

                <p className="text-xs font-semibold text-zinc-300">
                  Câu{" "}
                  {currentQuestionIndex +
                    1}
                  /
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          FOOTER
          ===================================================== */}

      {!finished &&
        !loadingReview &&
        reviewGroups.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <div className="text-[11px] text-zinc-600">
              Đã trả lời{" "}
              <span className="text-zinc-400 font-semibold">
                {answeredCount}
              </span>{" "}
              câu
            </div>

            <button
              onClick={handleSelectAll}
              className="text-[11px] font-semibold text-zinc-500 hover:text-white transition"
            >
              🔁 Ôn tất cả bài đã học
            </button>
          </div>
        )}
    </div>
  );
}