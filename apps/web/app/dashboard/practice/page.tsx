"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getPracticeHistory,
  type PracticeHistoryItem,
} from "@/services/practice";

type PracticeTab =
  | "practice"
  | "history";

type PartItem = {
  part: number;
  title: string;
  description: string;
  section: "listening" | "reading";
  icon: string;
};

const PARTS: PartItem[] = [
  {
    part: 1,
    title: "Part 1: Photographs",
    description:
      "Chọn ảnh phù hợp với âm thanh nghe được",
    section: "listening",
    icon: "🖼️",
  },

  {
    part: 2,
    title: "Part 2: Question-Response",
    description:
      "Chọn câu trả lời phù hợp nhất cho câu hỏi",
    section: "listening",
    icon: "💬",
  },

  {
    part: 3,
    title: "Part 3: Conversations",
    description:
      "Nghe hội thoại và trả lời câu hỏi",
    section: "listening",
    icon: "👥",
  },

  {
    part: 4,
    title: "Part 4: Talks",
    description:
      "Nghe bài nói đơn và trả lời câu hỏi",
    section: "listening",
    icon: "🎙️",
  },

  {
    part: 5,
    title: "Part 5: Incomplete Sentences",
    description:
      "Điền từ thích hợp vào chỗ trống",
    section: "reading",
    icon: "✏️",
  },

  {
    part: 6,
    title: "Part 6: Text Completion",
    description:
      "Điền từ/câu vào đoạn văn có chỗ trống",
    section: "reading",
    icon: "📄",
  },

  {
    part: 7,
    title: "Part 7: Reading Comprehension",
    description:
      "Đọc hiểu đơn, kép và ba đoạn văn",
    section: "reading",
    icon: "📖",
  },
];

export default function PracticePage() {
  const [activeTab, setActiveTab] =
    useState<PracticeTab>("practice");

  const [
    history,
    setHistory,
  ] = useState<PracticeHistoryItem[]>([]);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(false);

  const [
    historyError,
    setHistoryError,
  ] = useState("");

  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  useEffect(() => {
    if (activeTab !== "history") {
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        setLoadingHistory(true);
        setHistoryError("");

        const data =
          await getPracticeHistory();

        if (!cancelled) {
          setHistory(data);
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Không thể tải lịch sử.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const listeningParts =
    PARTS.filter(
      (item) =>
        item.section ===
        "listening",
    );

  const readingParts =
    PARTS.filter(
      (item) =>
        item.section ===
        "reading",
    );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              ✍️
            </span>

            <h2 className="text-3xl font-bold">
              Luyện tập
            </h2>
          </div>

          <p className="mt-2 text-zinc-400">
            Luyện từng Part · Theo dõi tiến độ
          </p>
        </div>

        {/* ==================================================
            TABS
        ================================================== */}

        <div className="mb-10 flex rounded-2xl border border-white/5 bg-[#121214] p-1">
          <button
            type="button"
            onClick={() =>
              setActiveTab("practice")
            }
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-medium transition ${
              activeTab === "practice"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            🎯 Luyện theo Part
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("history")
            }
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-medium transition ${
              activeTab === "history"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            🕘 Lịch sử
          </button>
        </div>

        {/* ==================================================
            PRACTICE TAB
        ================================================== */}

        {activeTab ===
          "practice" && (
          <>
            {/* LISTENING */}

            <SectionTitle
              color="blue"
              title="SECTION A — LISTENING"
            />

            <div className="grid gap-4 md:grid-cols-2">
              {listeningParts.map(
                (part) => (
                  <PartCard
                    key={part.part}
                    part={part}
                  />
                ),
              )}
            </div>

            {/* READING */}

            <div className="mt-8">
              <SectionTitle
                color="green"
                title="SECTION B — READING"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {readingParts.map(
                (part) => (
                  <PartCard
                    key={part.part}
                    part={part}
                  />
                ),
              )}
            </div>
          </>
        )}

        {/* ==================================================
            HISTORY TAB
        ================================================== */}

        {activeTab ===
          "history" && (
          <HistoryTab
            history={history}
            loading={loadingHistory}
            error={historyError}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  title,
  color,
}: {
  title: string;
  color: "blue" | "green";
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`h-2 w-2 rounded-full ${
          color === "blue"
            ? "bg-blue-500"
            : "bg-green-500"
        }`}
      />

      <h3 className="text-xs font-semibold tracking-[0.18em] text-zinc-500">
        {title}
      </h3>
    </div>
  );
}

// ============================================================
// PART CARD
// ============================================================

function PartCard({
  part,
}: {
  part: PartItem;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121214] p-5 transition hover:border-white/10 hover:bg-[#151517]">
      <div className="flex items-start gap-4">
        {/* ICON */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-2xl">
          {part.icon}
        </div>

        {/* TEXT */}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            {part.title}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {part.description}
          </p>
        </div>
      </div>

      {/* BUTTONS */}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          onClick={() => {
            window.location.href =
              `/dashboard/practice/part/${part.part}`;
          }}
        >
          Luyện ngẫu nhiên
        </button>

        <Link
          href={`/dashboard/practice/part/${part.part}`}
          className="flex flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-medium transition hover:bg-red-500"
        >
          Bắt đầu →
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// HISTORY
// ============================================================

function HistoryTab({
  history,
  loading,
  error,
}: {
  history: PracticeHistoryItem[];
  loading: boolean;
  error: string;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#121214] p-10 text-center text-zinc-500">
        Đang tải lịch sử...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#121214] p-10 text-center">
        <div className="text-4xl">
          📝
        </div>

        <h3 className="mt-4 font-semibold">
          Chưa có lịch sử luyện tập
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Hãy chọn một Part và bắt đầu luyện.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map(
        (item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#121214] p-5"
          >
            <div>
              <h3 className="font-semibold">
                Part {item.part}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                {item.question_count} câu ·{" "}
                {item.correct_count} đúng
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {formatDate(
                  item.created_at,
                )}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">
                {item.score}%
              </div>

              <div className="text-xs text-zinc-500">
                {item.completed_at
                  ? "Đã hoàn thành"
                  : "Chưa hoàn thành"}
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
  value: string,
) {
  try {
    return new Intl.DateTimeFormat(
      "vi-VN",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    ).format(new Date(value));
  } catch {
    return value;
  }
}