"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  getListeningCompletedLessons,
  getListeningLessonReview,
  getListeningReviewGroups,
  type ListeningGroup,
  type ListeningLessonSummary,
} from "@/services/listening";

type ReviewMode = "part" | "lesson" | "all";

const PART_LABELS: Record<number, string> = {
  1: "Part 1: Photographs",
  2: "Part 2: Question-Response",
  3: "Part 3: Conversations",
  4: "Part 4: Talks",
};

const PART_ICONS: Record<number, string> = {
  1: "🖼️",
  2: "💬",
  3: "🗣️",
  4: "🎙️",
};

const QUESTION_LIMITS = [5, 10, 15, 20];

const VALID_PARTS = [1, 2, 3, 4];

function ListeningReviewContent() {
  const searchParams = useSearchParams();

  // =========================================================
  // URL
  // =========================================================

  const partParam = searchParams.get("part");
  const lessonIdParam = searchParams.get("lessonId");

  const parsedPart = partParam
    ? Number(partParam)
    : null;

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

  const [loadingReview, setLoadingReview] =
    useState(false);

  const [lessons, setLessons] = useState<
    ListeningLessonSummary[]
  >([]);

  const [reviewGroups, setReviewGroups] =
    useState<ListeningGroup[]>([]);

  const [selectedLesson, setSelectedLesson] =
    useState<ListeningLessonSummary | null>(null);

  const [selectedPart, setSelectedPart] =
    useState<number | null>(
      selectedPartFromUrl,
    );

  const [mode, setMode] =
    useState<ReviewMode>(
      selectedPartFromUrl
        ? "part"
        : selectedLessonIdFromUrl
          ? "lesson"
          : "part",
    );

  // =========================================================
  // SESSION STATE
  // =========================================================

  const [questionLimit, setQuestionLimit] =
    useState<number>(10);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [answeredCount, setAnsweredCount] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  // =========================================================
  // AUDIO
  // =========================================================

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [audioProgress, setAudioProgress] =
    useState(0);

  const [audioDuration, setAudioDuration] =
    useState(0);

  // =========================================================
  // RESET SESSION
  // =========================================================

  const resetSession = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setFinished(false);

    setIsPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // =========================================================
  // LOAD COMPLETED LESSONS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      try {
        setLoading(true);

        const res =
          await getListeningCompletedLessons();

        if (cancelled) return;

        if (res.success) {
          setLessons(res.lessons || []);
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error(
          "Không thể tải danh sách bài Listening đã học:",
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
  // LOAD ALL REVIEW GROUPS
  //
  // Ưu tiên:
  // /listening/review-groups
  //
  // Nếu API này không trả dữ liệu thì fallback:
  // completed-lessons -> review từng lesson
  // =========================================================

  const loadAllReviewGroups =
    async (): Promise<ListeningGroup[]> => {
      // -----------------------------------------------------
      // CÁCH 1: API review-groups
      // -----------------------------------------------------

      try {
        const reviewRes =
          await getListeningReviewGroups();

        if (
          reviewRes.success &&
          Array.isArray(reviewRes.groups) &&
          reviewRes.groups.length > 0
        ) {
          return reviewRes.groups;
        }
      } catch (error) {
        console.warn(
          "API /listening/review-groups không trả dữ liệu:",
          error,
        );
      }

      // -----------------------------------------------------
      // CÁCH 2: FALLBACK
      //
      // Lấy lesson đã học rồi gọi review từng lesson
      // -----------------------------------------------------

      try {
        let completedLessons =
          lessons;

        if (completedLessons.length === 0) {
          const completedRes =
            await getListeningCompletedLessons();

          if (completedRes.success) {
            completedLessons =
              completedRes.lessons || [];
          }
        }

        if (completedLessons.length === 0) {
          return [];
        }

        const results =
          await Promise.all(
            completedLessons.map(
              async (lesson) => {
                try {
                  const res =
                    await getListeningLessonReview(
                      lesson.id,
                    );

                  if (
                    res.success &&
                    res.lesson &&
                    Array.isArray(
                      res.lesson
                        .listening_lesson_groups,
                    )
                  ) {
                    return res.lesson
                      .listening_lesson_groups;
                  }

                  return [];
                } catch (error) {
                  console.error(
                    `Không thể lấy review lesson ${lesson.id}:`,
                    error,
                  );

                  return [];
                }
              },
            ),
          );

        return results.flat();
      } catch (error) {
        console.error(
          "Không thể fallback lấy review Listening:",
          error,
        );

        return [];
      }
    };

  // =========================================================
  // SET GROUPS + QUESTION LIMIT
  // =========================================================

  const applyReviewGroups = (
    groups: ListeningGroup[],
    defaultLimit = 10,
  ) => {
    setReviewGroups(groups);

    const totalQuestions =
      groups.reduce(
        (sum, group) =>
          sum +
          (group.listening_lesson_questions
            ?.length ?? 0),
        0,
      );

    setQuestionLimit(
      Math.min(
        defaultLimit,
        totalQuestions,
      ) || 1,
    );
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

      // -----------------------------------------------------
      // Lọc group theo part
      // -----------------------------------------------------

      const groupsForPart =
        allGroups.filter(
          (group) =>
            Number(group.part) === part,
        );

      console.log(
        "[Listening Review] Part:",
        part,
        "All groups:",
        allGroups,
        "Part groups:",
        groupsForPart,
      );

      applyReviewGroups(
        groupsForPart,
        10,
      );
    } catch (error) {
      console.error(
        "Không thể tải review theo Part:",
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
    lesson: ListeningLessonSummary,
  ) => {
    try {
      setLoadingReview(true);

      setMode("lesson");

      setSelectedLesson(lesson);

      setSelectedPart(null);

      resetSession();

      const res =
        await getListeningLessonReview(
          lesson.id,
        );

      if (
        res.success &&
        res.lesson
      ) {
        const groups =
          res.lesson
            .listening_lesson_groups ||
          [];

        applyReviewGroups(
          groups,
          10,
        );
      } else {
        setReviewGroups([]);
      }
    } catch (error) {
      console.error(
        "Không thể tải review bài:",
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
        "[Listening Review] All review groups:",
        groups,
      );

      applyReviewGroups(
        groups,
        15,
      );
    } catch (error) {
      console.error(
        "Không thể tải review toàn bộ:",
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
    // URL có ?part=1
    // -------------------------------------------------------

    if (
      selectedPartFromUrl !== null
    ) {
      loadPartReview(
        selectedPartFromUrl,
      );

      return;
    }

    // -------------------------------------------------------
    // URL có ?lessonId=...
    // -------------------------------------------------------

    if (
      selectedLessonIdFromUrl !== null &&
      lessons.length > 0
    ) {
      const lesson =
        lessons.find(
          (item) =>
            item.id ===
            selectedLessonIdFromUrl,
        );

      if (lesson) {
        handleSelectLesson(lesson);
      }

      return;
    }

    // -------------------------------------------------------
    // Nếu không có URL -> load tất cả bài đã học
    // -------------------------------------------------------

    if (
      lessons.length > 0 &&
      reviewGroups.length === 0
    ) {
      loadPartReview(
        lessons[0].part,
      );
    }
  }, [
    loading,
    selectedPartFromUrl,
    selectedLessonIdFromUrl,
    lessons,
  ]);

  // =========================================================
  // FLATTEN QUESTIONS
  // =========================================================

  const flattenedQuestions =
    useMemo(() => {
      return reviewGroups.flatMap(
        (group) =>
          (
            group.listening_lesson_questions ||
            []
          ).map((question) => ({
            ...question,

            groupTitle:
              group.title ||
              `Group ${group.display_order}`,

            groupPart:
              group.part,

            groupAudioUrl:
              group.audio_url,

            groupImageUrl:
              group.image_url,

            groupKnowledge:
              group.knowledge,
          })),
      );
    }, [reviewGroups]);

  // =========================================================
  // VISIBLE QUESTIONS
  // =========================================================

  const visibleQuestions =
    useMemo(() => {
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

  const totalQuestions =
    visibleQuestions.length;

  const currentQuestion =
    visibleQuestions[currentIndex] ||
    null;

  // =========================================================
  // CURRENT AUDIO
  // =========================================================

  const audioUrl =
    currentQuestion?.groupAudioUrl
      ? currentQuestion.groupAudioUrl.startsWith(
          "http",
        )
        ? currentQuestion.groupAudioUrl
        : `http://localhost:3001${currentQuestion.groupAudioUrl}`
      : null;

  const imageUrl =
    currentQuestion?.groupImageUrl
      ? currentQuestion.groupImageUrl.startsWith(
          "http",
        )
        ? currentQuestion.groupImageUrl
        : `http://localhost:3001${currentQuestion.groupImageUrl}`
      : null;

  // =========================================================
  // AUDIO
  // =========================================================

  const toggleAudio = () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();

      setIsPlaying(false);

      return;
    }

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error(
          "Không thể phát audio:",
          error,
        );
      });
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) {
      return;
    }

    setAudioProgress(
      audioRef.current.currentTime,
    );
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) {
      return;
    }

    setAudioDuration(
      audioRef.current.duration,
    );
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const seekAudio = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (
      !audioRef.current ||
      !audioDuration
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const percentage =
      Math.max(
        0,
        Math.min(
          1,
          x / rect.width,
        ),
      );

    audioRef.current.currentTime =
      percentage *
      audioDuration;
  };

  const formatTime = (
    seconds: number,
  ) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(
        seconds / 60,
      );

    const secs =
      Math.floor(
        seconds % 60,
      );

    return `${minutes}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================================================
  // ANSWER
  // =========================================================

  const handleAnswerSelect = (
    optionLabel: string,
  ) => {
    if (submitted) {
      return;
    }

    setSelectedAnswer(
      optionLabel,
    );
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
      currentQuestion.listening_lesson_options.find(
        (option) =>
          option.is_correct,
      );

    const isCorrect =
      selectedAnswer ===
      correctOption?.option_label;

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
  // NEXT
  // =========================================================

  const handleNextQuestion = () => {
    if (
      currentIndex >=
      totalQuestions - 1
    ) {
      setFinished(true);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      setIsPlaying(false);

      return;
    }

    setCurrentIndex(
      (prev) => prev + 1,
    );

    setSelectedAnswer(null);

    setSubmitted(false);

    setIsPlaying(false);

    setAudioProgress(0);

    setAudioDuration(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // =========================================================
  // CHANGE LIMIT
  // =========================================================

  const handleChangeLimit = (
    limit: number,
  ) => {
    const actualLimit =
      Math.min(
        limit,
        flattenedQuestions.length,
      );

    setQuestionLimit(
      actualLimit || 1,
    );

    resetSession();
  };

  // =========================================================
  // RESTART
  // =========================================================

  const handleRestart = () => {
    resetSession();
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const progress =
    totalQuestions > 0
      ? Math.round(
          ((currentIndex +
            (submitted ? 1 : 0)) /
            totalQuestions) *
            100,
        )
      : 0;

  // =========================================================
  // CORRECT OPTION
  // =========================================================

  const correctOption =
    currentQuestion?.listening_lesson_options.find(
      (option) =>
        option.is_correct,
    );

  const isCurrentCorrect =
    submitted &&
    selectedAnswer ===
      correctOption?.option_label;

  // =========================================================
  // CURRENT PART
  // =========================================================

  const currentPart =
    selectedPart ||
    currentQuestion?.groupPart ||
    selectedLesson?.part ||
    null;

  const pageTitle =
    currentPart
      ? PART_LABELS[
          currentPart
        ]
      : mode === "all"
        ? "Ôn tất cả Listening"
        : selectedLesson?.title ||
          "Ôn tập Listening";

  // =========================================================
  // LOADING PAGE
  // =========================================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20">
        <div className="flex items-center justify-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />

          <p className="text-sm text-zinc-500">
            Đang tải dữ liệu Listening...
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
              🎧
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Ôn tập Listening
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {VALID_PARTS.map(
          (part) => {
            const active =
              mode === "part" &&
              selectedPart ===
                part;

            return (
              <button
                key={part}
                onClick={() =>
                  loadPartReview(
                    part,
                  )
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
                    {
                      PART_ICONS[
                        part
                      ]
                    }
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
                        PART_LABELS[
                          part
                        ].split(
                          ": ",
                        )[1]
                      }
                    </p>
                  </div>
                </div>
              </button>
            );
          },
        )}
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
              bài Listening đã học.
            </p>

            <button
              onClick={
                handleSelectAll
              }
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
            🎧
          </div>

          <h2 className="text-lg font-semibold text-white">
            Chưa có nội dung ôn tập
          </h2>

          <p className="max-w-md mx-auto text-sm text-zinc-500 mt-2">
            {lessons.length > 0
              ? `Bạn đã hoàn thành ${lessons.length} bài Listening, nhưng hệ thống chưa lấy được các nhóm câu hỏi của bài đã học.`
              : "Hãy hoàn thành bài Listening trước rồi quay lại đây để ôn tập."}
          </p>

          {lessons.length > 0 && (
            <button
              onClick={
                handleSelectAll
              }
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
                {totalQuestions}
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
                      totalQuestions >
                      0
                        ? (correctCount /
                            totalQuestions) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="text-xs text-zinc-600 mt-2">
                {totalQuestions >
                0
                  ? Math.round(
                      (correctCount /
                        totalQuestions) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">

              <button
                onClick={
                  handleRestart
                }
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

          {/* SESSION HEADER */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                  {currentPart
                    ? PART_LABELS[
                        currentPart
                      ]
                    : "Listening"}
                </p>

                <p className="text-sm font-semibold text-white mt-1">
                  {
                    currentQuestion.groupTitle
                  }
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  Câu{" "}
                  {currentIndex +
                    1}{" "}
                  /{" "}
                  {
                    totalQuestions
                  }
                </p>

                <p className="text-[10px] text-zinc-600 mt-1">
                  Đúng{" "}
                  {
                    correctCount
                  }
                </p>
              </div>

            </div>

            <div className="mt-5 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{
                  width: `${Math.max(
                    5,
                    progress,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* QUESTION CARD */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">

            {/* AUDIO */}

            {audioUrl && (
              <div className="p-5 border-b border-zinc-800">

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">

                  <div className="flex items-center gap-4">

                    <button
                      onClick={
                        toggleAudio
                      }
                      className="h-12 w-12 shrink-0 rounded-full bg-red-600 flex items-center justify-center text-white text-lg hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                    >
                      {isPlaying
                        ? "⏸"
                        : "▶"}
                    </button>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-semibold text-white mb-2">
                        🎧 Nghe audio
                      </p>

                      <div
                        onClick={
                          seekAudio
                        }
                        className="h-2 rounded-full bg-zinc-800 cursor-pointer overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full bg-red-600 transition-all"
                          style={{
                            width: `${
                              audioDuration
                                ? (audioProgress /
                                    audioDuration) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between mt-1.5">

                        <span className="text-[10px] text-zinc-600">
                          {formatTime(
                            audioProgress,
                          )}
                        </span>

                        <span className="text-[10px] text-zinc-600">
                          {formatTime(
                            audioDuration,
                          )}
                        </span>

                      </div>
                    </div>
                  </div>

                  <audio
                    key={audioUrl}
                    ref={
                      audioRef
                    }
                    src={
                      audioUrl
                    }
                    preload="metadata"
                    onTimeUpdate={
                      handleTimeUpdate
                    }
                    onLoadedMetadata={
                      handleLoadedMetadata
                    }
                    onEnded={
                      handleAudioEnded
                    }
                    className="hidden"
                  />

                </div>
              </div>
            )}

            {/* IMAGE */}

            {imageUrl && (
              <div className="px-6 pt-6">

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 flex justify-center">

                  <img
                    src={imageUrl}
                    alt="Listening reference"
                    className="max-h-[360px] w-auto max-w-full object-contain rounded-xl"
                  />

                </div>

              </div>
            )}

            {/* QUESTION */}

            <div className="p-6">

              <div className="flex items-center justify-between gap-3 mb-5">

                <span className="rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 text-[10px] font-semibold text-red-300">
                  Câu{" "}
                  {currentIndex +
                    1}
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
                {
                  currentQuestion.question_text
                }
              </h2>

              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 mt-3 mb-5">
                Chọn đáp án đúng
              </p>

              {/* OPTIONS */}

<div className="space-y-3">
  {currentQuestion.listening_lesson_options.map(
    (option) => {
      const isSelected =
        selectedAnswer === option.option_label;

      const isCorrect =
        option.is_correct;

      let optionClass =
        "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-950";

      let letterClass =
        "bg-zinc-800 text-zinc-400";

      if (!submitted && isSelected) {
        optionClass =
          "border-red-600/50 bg-red-600/10 text-white ring-1 ring-red-600/20";

        letterClass =
          "bg-red-600 text-white";
      }

      if (submitted && isCorrect) {
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
              option.option_label,
            )
          }
          disabled={submitted}
          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${optionClass}`}
        >
          <div className="flex items-center gap-4">
            <span
              className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${letterClass}`}
            >
              {option.option_label}
            </span>

            {/* 
              Part 1 + Part 2:
              Chỉ hiển thị A/B/C/D.
              
              Part 3 + Part 4:
              Hiển thị cả nội dung đáp án.
            */}
            {currentPart !== 1 &&
              currentPart !== 2 && (
                <span className="text-sm leading-6">
                  {option.option_text}
                </span>
              )}
          </div>
        </button>
      );
    },
  )}
</div>

              {/* EXPLANATION */}

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
                            {
                              selectedAnswer
                            }
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
                        {
                          correctOption?.option_label
                        }
                        .{" "}
                        {
                          correctOption?.option_text
                        }
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

              {/* ACTION */}

              <div className="flex gap-3 mt-6">

                {!submitted ? (
                  <button
                    onClick={
                      handleSubmitAnswer
                    }
                    disabled={
                      !selectedAnswer
                    }
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
                    {currentIndex >=
                    totalQuestions -
                      1
                      ? "Xem kết quả"
                      : "Câu tiếp theo →"}
                  </button>
                )}

              </div>

            </div>
          </div>

          {/* QUESTION LIMIT */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold text-zinc-300">
                  Số câu ôn tập
                </p>

                <p className="text-[10px] text-zinc-600 mt-1">
                  Chọn số lượng câu cho phiên ôn.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                {QUESTION_LIMITS.map(
                  (limit) => {

                    const disabled =
                      limit >
                      flattenedQuestions.length;

                    return (
                      <button
                        key={
                          limit
                        }
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          handleChangeLimit(
                            limit,
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                          questionLimit ===
                          limit
                            ? "bg-red-600 text-white"
                            : disabled
                              ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                              : "bg-zinc-950 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {
                          limit
                        }{" "}
                        câu
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() =>
                    handleChangeLimit(
                      flattenedQuestions.length,
                    )
                  }
                  disabled={
                    flattenedQuestions.length ===
                    0
                  }
                  className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                    questionLimit ===
                    flattenedQuestions.length
                      ? "bg-emerald-600 text-white"
                      : flattenedQuestions.length ===
                          0
                        ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                        : "bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  Tất cả
                </button>

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
                {
                  answeredCount
                }
              </span>{" "}
              /{" "}
              {
                totalQuestions
              }
            </div>

            <button
              onClick={
                handleSelectAll
              }
              className="text-[11px] font-semibold text-zinc-500 hover:text-white transition"
            >
              🔁 Ôn tất cả bài đã học
            </button>

          </div>
        )}

    </div>
  );
}

export default function ListeningReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-zinc-400">Đang tải...</div></div>}>
      <ListeningReviewContent />
    </Suspense>
  );
}