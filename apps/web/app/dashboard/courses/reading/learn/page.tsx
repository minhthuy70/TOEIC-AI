"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

import {
  getReadingLessonById,
  submitReadingLesson,
  type ReadingLesson,
  type ReadingQuestion,
} from "@/services/reading";

import {
  AlertTriangle,
  BookOpen,
  PartyPopper,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  FileText,
} from "lucide-react";

type LearnQuestion = ReadingQuestion & {
  groupId: number;
  groupTitle: string;
  passage?: string | null;
  imageUrl?: string | null;
  groupKnowledge?: string | null;
};

function ReadingLearnContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  // =========================================================
  // URL PARAMS
  // =========================================================

  const lessonIdParam =
    searchParams.get("lesson");

  const groupIdParam =
    searchParams.get("group");

  const lessonId =
    Number(lessonIdParam);

  const groupId =
    Number(groupIdParam);

  // =========================================================
  // STATE
  // =========================================================

  const [lesson, setLesson] =
    useState<ReadingLesson | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [answers, setAnswers] =
    useState<
      Record<number, string>
    >({});

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [correctCount, setCorrectCount] =
    useState(0);

  // =========================================================
  // FLATTEN QUESTIONS
  // =========================================================
  //
  // Backend đã chỉ trả 1 GROUP.
  //
  // Nhưng vẫn flatten để UI xử lý câu hỏi.
  // =========================================================

  const flattenedQuestions =
    useMemo<LearnQuestion[]>(() => {
      if (!lesson) {
        return [];
      }

      return (
        lesson.reading_lesson_groups?.flatMap(
          (group) =>
            (
              group.reading_questions ||
              []
            ).map(
              (question) => ({
                ...question,

                groupId:
                  group.id,

                groupTitle:
                  group.title ||
                  `Group ${group.id}`,

                passage:
                  group.passage,

                imageUrl: null,

                groupKnowledge:
                  group.knowledge,
              }),
            ),
        ) ?? []
      );
    }, [lesson]);

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  const currentQuestion =
    flattenedQuestions[
      currentQuestionIndex
    ] ?? null;

  // =========================================================
  // ANSWERED COUNT
  // =========================================================

  const answeredCount =
    useMemo(() => {
      return flattenedQuestions.filter(
        (question) =>
          Boolean(
            answers[question.id],
          ),
      ).length;
    }, [
      answers,
      flattenedQuestions,
    ]);

  // =========================================================
  // TOTAL QUESTIONS
  // =========================================================

  const totalQuestions =
    flattenedQuestions.length;

  // =========================================================
  // PROGRESS
  // =========================================================

  const progressPercent =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100,
        )
      : 0;

  // =========================================================
  // LOAD EXACT GROUP
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadLesson =
      async () => {
        // ---------------------------------------------------
        // VALIDATE LESSON
        // ---------------------------------------------------

        if (
          !lessonIdParam ||
          !Number.isInteger(
            lessonId,
          ) ||
          lessonId <= 0
        ) {
          setError(
            "Lesson ID không hợp lệ.",
          );

          setLoading(false);

          return;
        }

        // ---------------------------------------------------
        // VALIDATE GROUP
        // ---------------------------------------------------

        if (
          !groupIdParam ||
          !Number.isInteger(
            groupId,
          ) ||
          groupId <= 0
        ) {
          setError(
            "Group ID không hợp lệ.",
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          /**
           * QUAN TRỌNG:
           *
           * Truyền groupId trực tiếp cho API.
           *
           * Backend sẽ chỉ trả đúng GROUP này.
           */
          const res =
            await getReadingLessonById(
              lessonId,
              groupId,
            );

          if (cancelled) {
            return;
          }

          if (
            !res.success ||
            !res.lesson
          ) {
            setError(
              "Không tìm thấy bài Reading.",
            );

            return;
          }

          const groups =
            res.lesson
              .reading_lesson_groups ||
            [];

          /**
           * Safety check phía frontend.
           *
           * Dù backend đã lọc,
           * frontend vẫn kiểm tra group.
           */
          const selectedGroup =
            groups.find(
              (group) =>
                group.id ===
                groupId,
            );

          if (!selectedGroup) {
            setError(
              `Không tìm thấy group ${groupId} trong lesson ${lessonId}.`,
            );

            return;
          }

          /**
           * Giữ DUY NHẤT 1 GROUP.
           */
          const filteredLesson = {
            ...res.lesson,

            reading_lesson_groups: [
              selectedGroup,
            ],
          };

          setLesson(
            filteredLesson,
          );

          setAnswers({});
          setCurrentQuestionIndex(0);
          setSubmitted(false);
          setCorrectCount(0);
          setScore(0);
        } catch (err) {
          console.error(
            "Không thể tải Reading group:",
            err,
          );

          if (!cancelled) {
            setError(
              "Không thể tải bài Reading. Vui lòng kiểm tra kết nối với server.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [
    lessonIdParam,
    groupIdParam,
    lessonId,
    groupId,
  ]);

  // =========================================================
  // SELECT ANSWER
  // =========================================================

  const handleSelectAnswer = (
    questionId: number,
    optionKey: string,
  ) => {
    if (submitted) {
      return;
    }

    setAnswers(
      (prev) => ({
        ...prev,

        [questionId]:
          optionKey,
      }),
    );
  };

  // =========================================================
  // PREVIOUS
  // =========================================================

  const handlePrevious =
    () => {
      if (
        currentQuestionIndex <=
        0
      ) {
        return;
      }

      setCurrentQuestionIndex(
        (prev) => prev - 1,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =========================================================
  // NEXT
  // =========================================================

  const handleNext = () => {
    if (
      currentQuestionIndex >=
      totalQuestions - 1
    ) {
      return;
    }

    setCurrentQuestionIndex(
      (prev) => prev + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // GO QUESTION
  // =========================================================

  const handleGoToQuestion = (
    index: number,
  ) => {
    setCurrentQuestionIndex(
      index,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit =
    async () => {
      if (
        !lesson ||
        !currentQuestion
      ) {
        return;
      }

      if (
        totalQuestions === 0
      ) {
        return;
      }

      /**
       * Không cho submit nếu chưa
       * trả lời đủ toàn bộ GROUP.
       */
      if (
        answeredCount <
        totalQuestions
      ) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        let correct = 0;

        for (
          const question of
            flattenedQuestions
        ) {
          const selected =
            answers[
              question.id
            ];

          const correctOption =
            question.reading_options.find(
              (option) =>
                option.is_correct ===
                true,
            );

          if (
            correctOption &&
            selected ===
              correctOption.option_key
          ) {
            correct++;
          }
        }

        const calculatedScore =
          Math.round(
            (correct /
              totalQuestions) *
              100,
          );

        setCorrectCount(
          correct,
        );

        setScore(
          calculatedScore,
        );

        /**
         * QUAN TRỌNG:
         *
         * Gửi:
         *   lesson.id
         *   groupId
         *   score
         *
         * Backend cần groupId để lưu
         * progress theo GROUP.
         */
        console.log("Submitting reading lesson:", {
          lessonId: lesson.id,
          groupId,
          score: calculatedScore,
        });

        const submitResult = await submitReadingLesson(
          lesson.id,
          groupId,
          calculatedScore,
        );

        console.log("Submit result:", submitResult);

        setSubmitted(true);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (err) {
        console.error(
          "Không thể submit Reading:",
          err,
        );

        const errorMessage = err instanceof Error
          ? err.message
          : "Không thể lưu kết quả Reading.";

        console.error("Error message:", errorMessage);
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

  // =========================================================
  // RESTART
  // =========================================================

  const handleRestart =
    () => {
      setAnswers({});
      setCurrentQuestionIndex(
        0,
      );
      setSubmitted(false);
      setSubmitting(false);
      setScore(0);
      setCorrectCount(0);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =========================================================
  // CURRENT GROUP
  // =========================================================

  const currentGroup =
    lesson
      ?.reading_lesson_groups?.[0] ??
    null;

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // ERROR
  // =========================================================

  if (
    error &&
    !lesson
  ) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h1 className="text-lg font-bold text-white">
            Không thể tải bài Reading
          </h1>

          <p className="text-sm text-red-300 mt-3">
            {error}
          </p>

          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Học tập</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO QUESTIONS
  // =========================================================

  if (
    !lesson ||
    !currentGroup ||
    totalQuestions === 0
  ) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mb-5">
            <BookOpen className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-bold text-white">
            Group chưa có câu hỏi
          </h1>

          <p className="text-sm text-zinc-500 mt-2">
            Group này hiện chưa có câu hỏi Reading.
          </p>

          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Học tập</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // RESULT
  // =========================================================

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto space-y-5 pb-12 px-4">
        <div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Học tập</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="max-w-xl mx-auto p-10 text-center flex flex-col items-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PartyPopper className="w-10 h-10" />
            </div>

            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600 mt-6">
              Hoàn thành GROUP
            </p>

            <h1 className="text-2xl font-bold text-white mt-2">
              {currentGroup.title ||
                `Group ${currentGroup.id}`}
            </h1>

            <p className="text-sm text-zinc-500 mt-2">
              Part {lesson.part}
            </p>

            <div className="mt-8">
              <p className="text-5xl font-black text-emerald-400">
                {correctCount}/
                {totalQuestions}
              </p>

              <p className="text-sm text-zinc-500 mt-2">
                câu trả lời đúng
              </p>

              <p className="text-2xl font-bold text-white mt-4">
                {score}%
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={
                  handleRestart
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại</span>
              </button>

              <Link
                href="/dashboard/courses/reading/review"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ôn tập</span>
              </Link>

              <Link
                href="/dashboard/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Học tập</span>
              </Link>
            </div>
          </div>
        </div>

        {/* REVIEW QUESTIONS */}
        <div className="space-y-4">
          {flattenedQuestions.map(
            (question, index) => {
              const selected =
                answers[
                  question.id
                ];

              const correctOption =
                question.reading_options.find(
                  (option) =>
                    option.is_correct,
                );

              const isCorrect =
                selected ===
                correctOption?.option_key;

              return (
                <div
                  key={
                    question.id
                  }
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 text-[10px] font-semibold text-red-300">
                      Câu {index + 1}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                        isCorrect
                          ? "bg-emerald-600/10 text-emerald-300"
                          : "bg-red-600/10 text-red-300"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Đúng</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Sai</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-7">
                    {
                      question.question_text
                    }
                  </h2>

                  <div className="mt-5 space-y-2">
                    {question.reading_options.map(
                      (option) => {
                        const selectedOption =
                          selected ===
                          option.option_key;

                        return (
                          <div
                            key={
                              option.id
                            }
                            className={`rounded-xl border px-4 py-3 ${
                              option.is_correct
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : selectedOption
                                  ? "border-red-500/30 bg-red-500/10"
                                  : "border-zinc-800 bg-zinc-950/50"
                            }`}
                          >
                            <span className="font-bold mr-2">
                              {
                                option.option_key
                              }
                              .
                            </span>

                            <span className="text-sm text-zinc-300">
                              {
                                option.option_text
                              }
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {question.explanation && (
                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                        Giải thích
                      </p>

                      <p className="text-sm leading-6 text-zinc-300 mt-2 whitespace-pre-line">
                        {
                          question.explanation
                        }
                      </p>
                    </div>
                  )}

                  {question.knowledge && (
                    <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                        Kiến thức cần nhớ
                      </p>

                      <p className="text-sm leading-6 text-zinc-300 mt-2 whitespace-pre-line">
                        {
                          question.knowledge
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  if (!currentQuestion) {
    return null;
  }

  const correctOption =
    currentQuestion.reading_options.find(
      (option) =>
        option.is_correct,
    );

  const selectedAnswer =
    answers[
      currentQuestion.id
    ];

  // =========================================================
  // MAIN LEARN UI
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12 px-4">
      {/* HEADER */}
      <div>
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition mb-5"
        >
          ← Quay lại Học tập
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Part {lesson.part}
              </p>

              <h1 className="text-xl font-bold text-white mt-1">
                {currentGroup.title ||
                  `Group ${currentGroup.id}`}
              </h1>

              <p className="text-xs text-zinc-500 mt-1">
                Group{" "}
                {currentGroup.id}
                {" · "}
                {totalQuestions} câu hỏi
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-white">
                Câu{" "}
                {currentQuestionIndex +
                  1}{" "}
                /{" "}
                {totalQuestions}
              </p>

              <p className="text-[10px] text-zinc-600 mt-1">
                Đã trả lời{" "}
                {answeredCount}
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* PASSAGE */}
      {currentQuestion.passage && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <p className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>Đoạn văn</span>
            </p>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <p className="text-sm sm:text-base leading-7 text-zinc-300 whitespace-pre-line">
                {
                  currentQuestion.passage
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE */}
      {currentQuestion.imageUrl && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
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
              className="max-h-[420px] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* QUESTION */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
        <span className="inline-flex rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 text-[10px] font-semibold text-red-300">
          Câu{" "}
          {currentQuestionIndex +
            1}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-white mt-5">
          {
            currentQuestion.question_text
          }
        </h2>

        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 mt-3 mb-5">
          Chọn đáp án đúng
        </p>

        <div className="space-y-3">
          {currentQuestion.reading_options.map(
            (option) => {
              const isSelected =
                selectedAnswer ===
                option.option_key;

              let className =
                "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700";

              if (isSelected) {
                className =
                  "border-red-600/50 bg-red-600/10 text-white";
              }

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    handleSelectAnswer(
                      currentQuestion.id,
                      option.option_key,
                    )
                  }
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${className}`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
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

        {/* NAVIGATION */}
        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <button
            type="button"
            disabled={
              currentQuestionIndex ===
              0
            }
            onClick={
              handlePrevious
            }
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Câu trước
          </button>

          {currentQuestionIndex <
          totalQuestions - 1 ? (
            <button
              type="button"
              disabled={
                !selectedAnswer
              }
              onClick={
                handleNext
              }
              className={`sm:ml-auto rounded-xl px-6 py-3 text-sm font-semibold transition ${
                selectedAnswer
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Câu tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              disabled={
                answeredCount <
                  totalQuestions ||
                submitting
              }
              onClick={
                handleSubmit
              }
              className={`sm:ml-auto rounded-xl px-6 py-3 text-sm font-semibold transition ${
                answeredCount >=
                  totalQuestions &&
                !submitting
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              {submitting
                ? "Đang lưu..."
                : "Nộp →"}
            </button>
          )}
        </div>
      </div>

      {/* QUESTION NAVIGATOR */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
        <p className="text-xs font-semibold text-zinc-300 mb-3">
          Danh sách câu hỏi
        </p>

        <div className="flex flex-wrap gap-2">
          {flattenedQuestions.map(
            (question, index) => {
              const answered =
                Boolean(
                  answers[
                    question.id
                  ],
                );

              const active =
                index ===
                currentQuestionIndex;

              return (
                <button
                  key={
                    question.id
                  }
                  type="button"
                  onClick={() =>
                    handleGoToQuestion(
                      index,
                    )
                  }
                  className={`h-9 w-9 rounded-lg text-xs font-semibold transition ${
                    active
                      ? "bg-red-600 text-white"
                      : answered
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {index + 1}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// SUSPENSE WRAPPER
// =========================================================

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