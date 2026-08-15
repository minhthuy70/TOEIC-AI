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
      submitting
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
  ]);

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

  const currentQuestion =
    questions[currentIndex];

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
        questions.filter(
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
      questions.length) *
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
    "======================================",
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs text-zinc-500">
              {practice.testTitle}
            </p>

            <h1 className="font-bold">
              Full TOEIC Test
            </h1>
          </div>

          <div className="text-center">
            <p className="text-xs text-zinc-500">
              Câu
            </p>

            <p className="font-bold">
              {currentIndex + 1} /{" "}
              {questions.length}
            </p>
          </div>

          <div
            className={`rounded-xl px-4 py-2 font-mono font-bold ${
              remainingSeconds <=
              300
                ? "bg-red-600 text-white"
                : "bg-white/5 text-zinc-200"
            }`}
          >
            ⏱{" "}
            {formatTime(
              remainingSeconds,
            )}
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
                }}
              />

              <p className="mt-2 break-all text-xs text-zinc-600">
                {audioUrl}
              </p>
            </div>
          )}

        {/* ================================================== */}
        {/* QUESTION */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 font-bold">
              {currentIndex + 1}
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
              questions.length
            }{" "}
            câu đã chọn
          </div>

          {currentIndex <
          questions.length - 1 ? (
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
          <p className="mb-4 text-sm font-semibold">
            Danh sách câu
          </p>

          <div className="flex flex-wrap gap-2">
            {questions.map(
              (
                question,
                index,
              ) => {
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
                    className={`h-9 w-9 rounded-lg text-xs font-semibold ${
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