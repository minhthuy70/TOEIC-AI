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
  getMockTestAttempt,
  submitMockTest,
  type MockTestAttemptResponse,
} from "@/services/mock-test";

export default function MockTestAttemptPage() {
  const params = useParams();

  const router = useRouter();

  const attemptId = Number(
    params.attemptId,
  );

  const [
    practice,
    setPractice,
  ] = useState<MockTestAttemptResponse | null>(
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
  ] = useState<Record<number, number>>(
    {},
  );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(7200);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    result,
    setResult,
  ] = useState<any>(null);

  const [
    selectedPart,
    setSelectedPart,
  ] = useState<number | "all">("all");

  const [
    audioError,
    setAudioError,
  ] = useState(false);

  // Additional 7.2 Features State
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausesRemaining, setPausesRemaining] = useState<number>(3);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showSectionBreakModal, setShowSectionBreakModal] = useState<boolean>(false);
  const [filterMarkedOnly, setFilterMarkedOnly] = useState<boolean>(false);
  const [sectionBreakTimer, setSectionBreakTimer] = useState<number>(60); // 60s break

  // ==========================================================
  // LOAD ATTEMPT
  // ==========================================================

  useEffect(() => {
    if (
      !Number.isInteger(attemptId) ||
      attemptId <= 0
    ) {
      setError(
        "Lần thi không hợp lệ.",
      );

      setLoading(false);

      return;
    }

    loadAttempt();
  }, [attemptId]);

  async function loadAttempt() {
    try {
      setLoading(true);

      setError("");

      const attempt =
        await getMockTestAttempt(
          attemptId,
        );

      // ========================================================
      // KIỂM TRA QUESTIONS
      // ========================================================

      if (
        !attempt.questions ||
        attempt.questions.length === 0
      ) {
        throw new Error(
          "API attempt chưa trả danh sách câu hỏi.",
        );
      }

      setPractice(attempt);

      // ========================================================
      // DEBUG
      // ========================================================

      console.log(
        "========== MOCK TEST ATTEMPT ==========",
      );

      console.log(
        "attempt:",
        attempt,
      );

      console.log(
        "testTitle:",
        attempt.testTitle,
      );

      console.log(
        "questions:",
        attempt.questions.length,
      );

      console.log(
        "first question:",
        attempt.questions[0],
      );

      console.log(
        "first imageUrl:",
        attempt.questions[0]?.imageUrl,
      );

      console.log(
        "first audioUrl:",
        attempt.questions[0]?.audioUrl,
      );

      console.log(
        "=======================================",
      );

      // ========================================================
      // KHÔI PHỤC CÁC CÂU ĐÃ TRẢ LỜI
      // ========================================================

      if (
        Array.isArray(
          attempt.answers,
        )
      ) {
        const restoredAnswers: Record<
          number,
          number
        > = {};

        for (
          const answer of attempt.answers
        ) {
          if (
            Number.isInteger(
              answer.questionId,
            ) &&
            Number.isInteger(
              answer.optionId,
            )
          ) {
            restoredAnswers[
              answer.questionId
            ] = answer.optionId;
          }
        }

        setAnswers(
          restoredAnswers,
        );
      }

      // ========================================================
      // TIMER
      // ========================================================

      const startedAt =
        new Date(
          attempt.startedAt,
        ).getTime();

      const duration =
        Number(
          attempt.duration ?? 120,
        ) * 60;

      const elapsed =
        Math.floor(
          (
            Date.now() -
            startedAt
          ) / 1000,
        );

      setRemainingSeconds(
        Math.max(
          0,
          duration -
            elapsed,
        ),
      );
    } catch (error) {
      console.error(
        "LOAD MOCK TEST ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải bài thi.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // TIMER
  // ==========================================================

  useEffect(() => {
    if (
      !practice ||
      submitted ||
      submitting ||
      isPaused ||
      showSectionBreakModal
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setRemainingSeconds(
            (prev) => {
              if (prev <= 1) {
                window.clearInterval(
                  timer,
                );

                handleSubmit(true);

                return 0;
              }

              return prev - 1;
            },
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [
    practice,
    submitted,
    submitting,
    isPaused,
    showSectionBreakModal,
  ]);

  // Section break countdown
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (showSectionBreakModal && sectionBreakTimer > 0) {
      t = setInterval(() => {
        setSectionBreakTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(t);
  }, [showSectionBreakModal, sectionBreakTimer]);

  // ==========================================================
  // QUESTIONS
  // ==========================================================

  const questions =
    useMemo(() => {
      return (
        practice?.questions ??
        []
      );
    }, [practice]);

  // Group questions by part
  const questionsByPart =
    useMemo(() => {
      const grouped: Record<
        number,
        typeof questions
      > = {};

      for (
        const question of questions
      ) {
        const part = question.part;

        if (!grouped[part]) {
          grouped[part] = [];
        }

        grouped[part].push(
          question,
        );
      }

      return grouped;
    }, [questions]);

  // Get available parts
  const availableParts =
    useMemo(() => {
      return Object.keys(
        questionsByPart,
      )
        .map(Number)
        .sort((a, b) => a - b);
    }, [questionsByPart]);

  // Filter questions by selected part
  const filteredQuestions =
    useMemo(() => {
      if (
        selectedPart === "all"
      ) {
        return questions;
      }

      return (
        questionsByPart[
          selectedPart
        ] ?? []
      );
    }, [questions, questionsByPart, selectedPart]);

  // Adjust current index when part changes
  useEffect(() => {
    if (
      selectedPart === "all"
    ) {
      setCurrentIndex(0);
      return;
    }

    const partQuestions =
      questionsByPart[
        selectedPart
      ] ?? [];

    if (partQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [selectedPart, questionsByPart]);

  // Reset audio error when question changes
  useEffect(() => {
    setAudioError(false);
  }, [currentIndex]);

  const currentQuestion =
    filteredQuestions[currentIndex];

  // ==========================================================
  // SELECT OPTION
  // ==========================================================

  function selectOption(
    questionId: number,
    optionId: number,
  ) {
    if (
      submitted ||
      submitting
    ) {
      return;
    }

    setAnswers(
      (prev) => ({
        ...prev,

        [questionId]:
          optionId,
      }),
    );
  }

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  function formatTime(
    seconds: number,
  ) {
    const safeSeconds =
      Math.max(
        0,
        seconds,
      );

    const minutes =
      Math.floor(
        safeSeconds / 60,
      );

    const secs =
      safeSeconds % 60;

    return `${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}:${String(
      secs,
    ).padStart(
      2,
      "0",
    )}`;
  }

  // ==========================================================
  // API URL
  // ==========================================================

  function getApiUrl() {
    return (
      process.env
        .NEXT_PUBLIC_API_URL ||
      "http://localhost:3001"
    ).replace(
      /\/$/,
      "",
    );
  }

  // ==========================================================
  // DETECT PLACEMENT TEST
  // ==========================================================

  function isPlacementTest() {
    const testTitle =
      String(
        practice?.testTitle ??
          "",
      ).toLowerCase();

    return (
      testTitle.includes(
        "placement",
      ) ||
      testTitle.includes(
        "đầu vào",
      ) ||
      testTitle.includes(
        "test đầu vào",
      )
    );
  }

  // ==========================================================
  // MEDIA URL
  //
  // TEST THƯỜNG:
  //
  // /images/test001/xxx.jpg
  // /audio/xxx.mp3
  //
  // PLACEMENT TEST:
  //
  // /uploads/tests/placement-test/images/part1/1.jpg
  // /uploads/tests/placement-test/audio/placement-test.mp3
  //
  // ==========================================================

  function resolveMediaUrl(
    url:
      | string
      | null
      | undefined,
    type:
      | "image"
      | "audio",
    part?: number,
  ) {
    if (!url) {
      return undefined;
    }

    let value =
      String(url).trim();

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
    // Xóa file://
    // ----------------------------------------------------------

    value =
      value.replace(
        /^file:\/\//i,
        "",
      );

    // ----------------------------------------------------------
    // Chuẩn hóa đường dẫn Windows
    // ----------------------------------------------------------

    const normalizedValue =
      value.toLowerCase();

    const apiUrl =
      getApiUrl();

    // ==========================================================
    // PLACEMENT TEST
    // ==========================================================

    if (
      isPlacementTest() ||
      normalizedValue.includes(
        "placement-test",
      )
    ) {
      // --------------------------------------------------------
      // Trường hợp DB đã lưu:
      //
      // /uploads/tests/placement-test/...
      // uploads/tests/placement-test/...
      // --------------------------------------------------------

      const uploadMarker =
        "uploads/tests/placement-test/";

      const uploadIndex =
        normalizedValue.indexOf(
          uploadMarker,
        );

      if (
        uploadIndex >= 0
      ) {
        const originalIndex =
          value
            .toLowerCase()
            .indexOf(
              uploadMarker,
            );

        const relative =
          value.substring(
            originalIndex +
              uploadMarker.length,
          );

        return `${apiUrl}/uploads/tests/placement-test/${relative}`;
      }

      // --------------------------------------------------------
      // Trường hợp DB lưu:
      //
      // /images/part1/1.jpg
      // images/part1/1.jpg
      // --------------------------------------------------------

      if (
        normalizedValue.startsWith(
          "/images/",
        ) ||
        normalizedValue.startsWith(
          "images/",
        )
      ) {
        const relative =
          value.replace(
            /^\/?images\//i,
            "",
          );

        // Part 1:
        // images/part1/1.jpg
        //
        // => /uploads/tests/placement-test/images/part1/1.jpg

        return `${apiUrl}/uploads/tests/placement-test/images/${relative}`;
      }

      // --------------------------------------------------------
      // Trường hợp DB lưu:
      //
      // /audio/placement-test.mp3
      // audio/placement-test.mp3
      // --------------------------------------------------------

      if (
        normalizedValue.startsWith(
          "/audio/",
        ) ||
        normalizedValue.startsWith(
          "audio/",
        )
      ) {
        const relative =
          value.replace(
            /^\/?audio\//i,
            "",
          );

        return `${apiUrl}/uploads/tests/placement-test/audio/${relative}`;
      }

      // --------------------------------------------------------
      // Nếu là image
      //
      // DB chỉ lưu:
      // 1.jpg
      // 2.jpg
      //
      // thì tự lấy theo Part
      // --------------------------------------------------------

      if (
        type === "image"
      ) {
        const cleanFilename =
          value.replace(
            /^\/+/,
            "",
          );

        const partFolder =
          part
            ? `part${part}`
            : "part1";

        return `${apiUrl}/uploads/tests/placement-test/images/${partFolder}/${cleanFilename}`;
      }

      // --------------------------------------------------------
      // Nếu là audio
        //
        // DB chỉ lưu:
        // placement-test.mp3
        // --------------------------------------------------------

      if (
        type === "audio"
      ) {
        const cleanFilename =
          value.replace(
            /^\/+/,
            "",
          );

        return `${apiUrl}/uploads/tests/placement-test/audio/${cleanFilename}`;
      }
    }

    // ==========================================================
    // TEST THƯỜNG
    // ==========================================================

    // ----------------------------------------------------------
    // Xóa đường dẫn toeic-generated-data
    // ----------------------------------------------------------

    const generatedDataMarker =
      "toeic-generated-data/";

    const generatedIndex =
      normalizedValue.indexOf(
        generatedDataMarker,
      );

    if (
      generatedIndex >= 0
    ) {
      const originalIndex =
        value
          .toLowerCase()
          .indexOf(
            generatedDataMarker,
          );

      value =
        value.substring(
          originalIndex +
            generatedDataMarker.length,
        );
    }

    // ----------------------------------------------------------
    // Nếu đã có /images hoặc /audio
    // ----------------------------------------------------------

    if (
      value.startsWith(
        "/images/",
      ) ||
      value.startsWith(
        "/audio/",
      )
    ) {
      return `${apiUrl}${value}`;
    }

    // ----------------------------------------------------------
    // Nếu có images/... hoặc audio/...
    // ----------------------------------------------------------

    if (
      value.startsWith(
        "images/",
      ) ||
      value.startsWith(
        "audio/",
      )
    ) {
      return `${apiUrl}/${value}`;
    }

    // ----------------------------------------------------------
    // Filename
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

  // ==========================================================
  // GET IMAGE URL
  // ==========================================================

  function getImageUrl(
    url:
      | string
      | null
      | undefined,
    part?: number,
  ) {
    return resolveMediaUrl(
      url,
      "image",
      part,
    );
  }

  // ==========================================================
  // GET AUDIO URL
  // ==========================================================

  function getAudioUrl(
    url:
      | string
      | null
      | undefined,
  ) {
    return resolveMediaUrl(
      url,
      "audio",
    );
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    auto = false,
  ) {
    if (
      submitting ||
      submitted
    ) {
      return;
    }

    if (!auto) {
      const unanswered =
        filteredQuestions.filter(
          (question) =>
            !answers[
              question.id
            ],
        );

      if (
        unanswered.length >
        0
      ) {
        const ok =
          window.confirm(
            `Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
          );

        if (!ok) {
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      setError("");

      const payload = {
        attemptId,

        answers:
          Object.entries(
            answers,
          ).map(
            ([
              questionId,
              optionId,
            ]) => ({
              questionId:
                Number(
                  questionId,
                ),

              optionId:
                Number(
                  optionId,
                ),
            }),
          ),
      };

      await submitMockTest(
  payload,
);

router.push(
  `/dashboard/mock-test/result/${attemptId}`,
);
    } catch (error) {
      console.error(
        "SUBMIT MOCK TEST ERROR:",
        error,
      );

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
        Đang tải bài thi...
      </div>
    );
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  if (
    submitted &&
    result
  ) {
    return (
      <ResultScreen
        result={result}
        onBack={() =>
          router.push(
            "/dashboard/mock-test",
          )
        }
      />
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !practice
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6 text-white">
        <div className="max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-xl font-bold text-red-400">
            Không thể tải bài thi
          </h1>

          <p className="mt-3 text-zinc-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/mock-test",
              )
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NO QUESTION
  // ==========================================================

  if (
    !practice ||
    !currentQuestion
  ) {
    return null;
  }

  const progress =
    ((currentIndex + 1) /
      filteredQuestions.length) *
    100;

  const part =
    currentQuestion.part;

  const isPart1Or2 =
    part === 1 ||
    part === 2;

  // ==========================================================
  // CURRENT MEDIA
  // ==========================================================

  const imageUrl =
    getImageUrl(
      currentQuestion.imageUrl,
      part,
    );

  const audioUrl =
    getAudioUrl(
      currentQuestion.audioUrl,
    );

  // ==========================================================
  // DEBUG CURRENT MEDIA
  // ==========================================================

  console.log(
    "========== CURRENT QUESTION ==========",
  );

  console.log(
    "QUESTION ID:",
    currentQuestion.id,
  );

  console.log(
    "PART:",
    part,
  );

  console.log(
    "IS PLACEMENT:",
    isPlacementTest(),
  );

  console.log(
    "IMAGE DB:",
    currentQuestion.imageUrl,
  );

  console.log(
    "IMAGE URL:",
    imageUrl,
  );

  console.log(
    "AUDIO DB:",
    currentQuestion.audioUrl,
  );

  console.log(
    "AUDIO URL:",
    audioUrl,
  );

  console.log(
    "AUDIO URL (original):",
    currentQuestion.audioUrl,
  );

  console.log(
    "EXPECTED AUDIO PATTERN:",
    `part${part}`,
  );

  console.log(
    "AUDIO CONTAINS CORRECT PART:",
    audioUrl?.includes(
      `part${part}`,
    ),
  );

  console.log(
    "======================================",
  );

  const isListeningSection = part <= 4;
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative">
      {/* ── PAUSE MODAL ── */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-4xl">⏸️</div>
            <h3 className="text-xl font-bold text-white">Bài thi đang tạm dừng</h3>
            <p className="text-xs text-zinc-400">
              Đồng hồ đã tạm dừng đếm. Bạn còn <strong className="text-amber-400">{pausesRemaining} lượt tạm dừng</strong>.
            </p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              ▶️ Tiếp tục làm bài thi
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION BREAK NOTIFICATION MODAL ── */}
      {showSectionBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div className="text-4xl">☕</div>
            <h3 className="text-xl font-bold text-white">Hoàn Thành Phần Thi Listening!</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Bạn có <strong>{sectionBreakTimer} giây</strong> nghỉ ngơi trước khi bước vào <strong>Phần thi Reading (Part 5, 6, 7 - 75 phút)</strong>.
            </p>
            <div className="text-2xl font-mono font-bold text-amber-400">
              ⏳ 00:{sectionBreakTimer.toString().padStart(2, "0")}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSectionBreakModal(false);
                setSelectedPart(5);
                // Jump to first question of Reading
                const firstReadingIdx = questions.findIndex((q) => q.part === 5);
                if (firstReadingIdx >= 0) setCurrentIndex(firstReadingIdx);
              }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              📖 Bắt đầu phần thi Reading ngay →
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="text-3xl">📝</div>
              <h3 className="text-lg font-bold text-white">Xác nhận nộp bài thi TOEIC?</h3>
              <p className="text-xs text-zinc-400">
                Bạn đã làm <strong className="text-white">{answeredCount}/{totalCount} câu hỏi</strong> • Đánh dấu <strong className="text-amber-400">{markedCount} câu</strong>.
              </p>
              {totalCount - answeredCount > 0 && (
                <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
                  ⚠️ Còn <strong>{totalCount - answeredCount} câu chưa trả lời</strong>. Bạn có chắc chắn muốn nộp bài?
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit(false);
                }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
              >
                {submitting ? "Đang nộp..." : "Xác nhận nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500">
                {practice.testTitle}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isListeningSection ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-purple-600/20 text-purple-400 border border-purple-500/30"}`}>
                {isListeningSection ? "🎧 Listening Section (Part 1–4)" : "📖 Reading Section (Part 5–7)"}
              </span>
            </div>

            <h1 className="font-bold text-sm sm:text-base">
              Câu {currentIndex + 1} / {filteredQuestions.length}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Mark for review */}
            <button
              type="button"
              onClick={() => setMarkedForReview((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                markedForReview[currentQuestion.id]
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <span>{markedForReview[currentQuestion.id] ? "🚩 Đã đánh dấu" : "🏳️ Đánh dấu cờ"}</span>
            </button>

            {/* Pause button */}
            <button
              type="button"
              disabled={pausesRemaining <= 0}
              onClick={() => {
                if (pausesRemaining > 0) {
                  setPausesRemaining((prev) => prev - 1);
                  setIsPaused(true);
                }
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition disabled:opacity-40"
            >
              ⏸️ Tạm dừng ({pausesRemaining}/3)
            </button>

            {/* Overall Timer */}
            <div
              className={`rounded-xl px-3.5 py-1.5 font-mono font-bold text-xs sm:text-sm ${
                remainingSeconds <= 300
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-white/5 text-zinc-200"
              }`}
            >
              ⏱ {formatTime(remainingSeconds)}
            </div>

            {/* Submit section button (if in listening) */}
            {isListeningSection && (
              <button
                type="button"
                onClick={() => {
                  setShowSectionBreakModal(true);
                  setSectionBreakTimer(60);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Nộp phần Nghe →
              </button>
            )}

            {/* Submit full test button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Nộp bài thi
            </button>
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

      {/* ================================================== */}
      {/* MAIN */}
      {/* ================================================== */}

      <main className="mx-auto max-w-5xl px-5 py-7">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* PART */}
        {/* ================================================== */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="rounded-lg bg-red-600/10 px-3 py-1.5 text-sm font-semibold text-red-400">
              Part {part}
            </span>

            {currentQuestion.groupTitle && (
              <span className="ml-3 text-sm text-zinc-500">
                {
                  currentQuestion.groupTitle
                }
              </span>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* PASSAGE */}
        {/* ================================================== */}

        {currentQuestion.passage && (
          <div className="mb-6 rounded-2xl border border-white/5 bg-[#121214] p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Reading passage
            </p>

            <div className="whitespace-pre-wrap leading-7 text-zinc-300">
              {
                currentQuestion.passage
              }
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* IMAGE */}
        {/* ================================================== */}

        {part === 1 &&
          imageUrl && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-white/5 bg-[#121214] p-5">
              <p className="mb-4 text-sm font-medium text-zinc-300">
                🖼️ Hình ảnh
              </p>

              <div className="flex min-h-[250px] items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Question image"
                  className="max-h-[500px] max-w-full rounded-xl object-contain"
                  onLoad={() => {
                    console.log(
                      "✓ IMAGE LOADED:",
                      imageUrl,
                    );
                  }}
                  onError={(event) => {
                    console.error(
                      "✗ IMAGE LOAD ERROR:",
                      imageUrl,
                    );

                    console.error(
                      "IMG ELEMENT:",
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

        {part <= 4 &&
          audioUrl && (
            <div className="mb-6 rounded-2xl border border-white/5 bg-[#121214] p-5">
              <p className="mb-3 text-sm font-medium text-zinc-300">
                🎧 Audio
              </p>

              {audioError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                  <p>⚠️ Không thể tải file audio</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    URL: {audioUrl}
                  </p>
                </div>
              ) : (
                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                  src={audioUrl}
                  onLoadedMetadata={() => {
                    console.log(
                      "✓ AUDIO LOADED:",
                      audioUrl,
                    );
                    setAudioError(false);
                  }}
                  onError={(event) => {
                    console.error(
                      "✗ AUDIO LOAD ERROR:",
                      audioUrl,
                    );

                    console.error(
                      "AUDIO ELEMENT:",
                      event.currentTarget,
                    );
                    setAudioError(true);
                  }}
                />
              )}
            </div>
          )}

        {/* ================================================== */}
        {/* QUESTION */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 font-bold">
              {currentQuestion.questionNumber ||
                currentIndex + 1}
            </div>

            <h2 className="pt-1 text-lg font-semibold leading-7">
              {
                currentQuestion.questionText
              }
            </h2>
          </div>

          {/* ================================================== */}
          {/* OPTIONS */}
          {/* ================================================== */}

          <div className="space-y-3">
            {currentQuestion.options.map(
              (option) => {
                const selected =
                  answers[
                    currentQuestion.id
                  ] === option.id;

                return (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    onClick={() =>
                      selectOption(
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
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        selected
                          ? "bg-red-600 text-white"
                          : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {
                        option.label
                      }
                    </span>

                    {!isPart1Or2 &&
                      option.text && (
                        <span className="pt-1 text-zinc-300">
                          {
                            option.text
                          }
                        </span>
                      )}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* NAV */}
        {/* ================================================== */}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={
              currentIndex === 0
            }
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  prev - 1,
              )
            }
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 disabled:opacity-30"
          >
            ← Trước
          </button>

          <div className="hidden text-sm text-zinc-500 md:block">
            {
              Object.keys(
                answers,
              ).length
            }{" "}
            /{" "}
            {
              filteredQuestions.length
            }{" "}
            câu đã chọn
          </div>

          {currentIndex <
          filteredQuestions.length -
            1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex(
                  (prev) =>
                    prev + 1,
                )
              }
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-500"
            >
              Tiếp →
            </button>
          ) : (
            <button
              type="button"
              disabled={
                submitting
              }
              onClick={() =>
                handleSubmit()
              }
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              {submitting
                ? "Đang chấm..."
                : "Nộp bài ✓"}
            </button>
          )}
        </div>

        {/* ================================================== */}
        {/* QUESTION NAVIGATOR */}
        {/* ================================================== */}

        <div className="mt-8 rounded-2xl border border-white/5 bg-[#121214] p-5">
          {/* PART FILTER TABS & MARKED FILTER */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPart("all");
                  setFilterMarkedOnly(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedPart === "all" && !filterMarkedOnly
                    ? "bg-red-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                Tất cả
              </button>

              {availableParts.map(
                (part) => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => {
                      setSelectedPart(part);
                      setFilterMarkedOnly(false);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      selectedPart ===
                      part && !filterMarkedOnly
                        ? "bg-red-600 text-white"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    Part {part}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterMarkedOnly(!filterMarkedOnly)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 border ${
                filterMarkedOnly
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/5 text-zinc-400 hover:text-white border-white/5"
              }`}
            >
              <span>🚩</span>
              <span>Chỉ xem câu có cờ ({markedCount})</span>
            </button>
          </div>

          <p className="mb-4 text-sm font-semibold">
            Danh sách câu
            {selectedPart !== "all" &&
              ` (Part ${selectedPart})`}
            {filterMarkedOnly && " [Đã đánh dấu]"}
          </p>

          <div className="flex flex-wrap gap-2">
            {filteredQuestions
              .filter((q) => !filterMarkedOnly || !!markedForReview[q.id])
              .map(
                (
                  question,
                  index,
                ) => {
                  const actualIdx = filteredQuestions.findIndex((item) => item.id === question.id);
                  const answered = Boolean(answers[question.id]);
                  const isMarked = Boolean(markedForReview[question.id]);

                  return (
                    <button
                      key={
                        question.id
                      }
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          actualIdx,
                        )
                      }
                      className={`h-9 w-9 rounded-lg text-xs font-semibold relative transition ${
                        actualIdx ===
                        currentIndex
                          ? "bg-red-600 text-white ring-2 ring-red-400"
                          : answered
                          ? "bg-green-600/20 text-green-400"
                          : "bg-white/5 text-zinc-500 hover:bg-white/10"
                      }`}
                    >
                      {question.questionNumber ||
                        actualIdx + 1}
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                      )}
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
// RESULT
// ============================================================

function ResultScreen({
  result,
  onBack,
}: {
  result: any;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-8">
          <div className="text-center">
            <div className="text-5xl">
              🎉
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Hoàn thành bài thi!
            </h1>

            <p className="mt-2 text-zinc-500">
              Full TOEIC Test
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ScoreBox
              label="Listening"
              value={
                result.listeningScore
              }
            />

            <ScoreBox
              label="Reading"
              value={
                result.readingScore
              }
            />

            <ScoreBox
              label="Tổng điểm"
              value={
                result.totalScore
              }
              highlight
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SmallStat
              label="Tổng câu"
              value={
                result.totalQuestions
              }
            />

            <SmallStat
              label="Đúng"
              value={
                result.totalCorrect
              }
            />

            <SmallStat
              label="Sai"
              value={
                result.totalQuestions -
                result.totalCorrect
              }
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl bg-red-600 px-7 py-3 font-semibold hover:bg-red-500"
            >
              Quay lại Thi thử
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCORE BOX
// ============================================================

function ScoreBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-6 text-center">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-3 text-5xl font-black ${
          highlight
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// SMALL STAT
// ============================================================

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-5 text-center">
      <p className="text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {label}
      </p>
    </div>
  );
}