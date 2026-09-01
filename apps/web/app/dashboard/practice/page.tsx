"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ImageIcon,
  MessageSquare,
  Users,
  Mic,
  Edit3,
  FileText,
  BookOpen,
  Target,
  History as HistoryIcon,
  ArrowRight,
  Loader2,
  ClipboardCheck,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";

import {
  getPracticeHistory,
  type PracticeHistoryItem,
} from "@/services/practice";

type PracticeTab =
  | "practice"
  | "mocktest"
  | "history";

type PartItem = {
  part: number;
  title: string;
  description: string;
  section: "listening" | "reading";
  icon: React.ElementType;
};

const PARTS: PartItem[] = [
  {
    part: 1,
    title: "Part 1: Photographs",
    description:
      "Chọn ảnh phù hợp với âm thanh nghe được",
    section: "listening",
    icon: ImageIcon,
  },

  {
    part: 2,
    title: "Part 2: Question-Response",
    description:
      "Chọn câu trả lời phù hợp nhất cho câu hỏi",
    section: "listening",
    icon: MessageSquare,
  },

  {
    part: 3,
    title: "Part 3: Conversations",
    description:
      "Nghe hội thoại và trả lời câu hỏi",
    section: "listening",
    icon: Users,
  },

  {
    part: 4,
    title: "Part 4: Talks",
    description:
      "Nghe bài nói đơn và trả lời câu hỏi",
    section: "listening",
    icon: Mic,
  },

  {
    part: 5,
    title: "Part 5: Incomplete Sentences",
    description:
      "Điền từ thích hợp vào chỗ trống",
    section: "reading",
    icon: Edit3,
  },

  {
    part: 6,
    title: "Part 6: Text Completion",
    description:
      "Điền từ/câu vào đoạn văn có chỗ trống",
    section: "reading",
    icon: FileText,
  },

  {
    part: 7,
    title: "Part 7: Reading Comprehension",
    description:
      "Đọc hiểu đơn, kép và ba đoạn văn",
    section: "reading",
    icon: BookOpen,
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

        const result =
          await getPracticeHistory();

        if (cancelled) {
          return;
        }

        setHistory(
          Array.isArray(result) ? result : [],
        );
      } catch (error: any) {
        if (!cancelled) {
          setHistoryError(
            error?.message ||
              "Không thể kết nối tới server.",
          );
          setHistory([]);
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
      (p) =>
        p.section === "listening",
    );

  const readingParts =
    PARTS.filter(
      (p) =>
        p.section === "reading",
    );

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
        {/* TITLE */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>

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
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
              activeTab === "practice"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Luyện theo Part</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("mocktest")
            }
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
              activeTab === "mocktest"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Thi thử TOEIC</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("history")
            }
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
              activeTab === "history"
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span>Lịch sử</span>
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
            MOCK TEST TAB
        ================================================== */}

        {activeTab === "mocktest" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-red-600/15 via-zinc-900/60 to-zinc-900/40 border border-red-500/20 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/25">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Hệ Thống Thi Thử TOEIC Chuẩn ETS</h3>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      Đo lường chính xác năng lực thực tế với bộ đề chuẩn format, đồng hồ đếm ngược và thang điểm quy đổi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Test Card */}
              <div className="bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-6 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30">
                      Chuẩn ETS Toàn Diện
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      120 Phút
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">Full Test 200 Câu</h4>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Bài thi mô phỏng 100% kỳ thi thật tại IIG: 100 câu Listening (45 phút) và 100 câu Reading (75 phút). Trải nghiệm áp lực thời gian và nhận bảng điểm dự đoán TOEIC 10–990.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                    <div>🎧 Listening: Part 1–4 (100 câu)</div>
                    <div>📖 Reading: Part 5–7 (100 câu)</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Mô phỏng IIG Vietnam</span>
                  <Link
                    href="/dashboard/mock-test"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-md shadow-red-600/20"
                  >
                    <span>Vào phòng thi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Mini Test Card */}
              <div className="bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-6 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-600/30">
                      Đánh Giá Nhanh
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      45 Phút
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">Mini Test 50 Câu</h4>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Dành cho những ngày bận rộn: 50 câu hỏi chọn lọc bao gồm cả 7 phần thi, giúp kiểm tra nhanh phong độ phản xạ và cập nhật lại trình độ mà không mất trọn 2 giờ.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                    <div>🎧 Listening: 25 câu tiêu biểu</div>
                    <div>📖 Reading: 25 câu tiêu biểu</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Rút gọn 1/4 đề thi</span>
                  <Link
                    href="/dashboard/mock-test/mini-test"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
                  >
                    <span>Làm bài Mini Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab ===
          "history" && (
          <HistoryTab
            history={history}
            loading={loadingHistory}
            error={historyError}
          />
        )}
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
  const Icon = part.icon;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121214] p-5 transition hover:border-white/10 hover:bg-[#151517]">
      <div className="flex items-start gap-4">
        {/* ICON */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400">
          <Icon className="w-6 h-6" />
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
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium transition hover:bg-red-500"
        >
          <span>Bắt đầu</span>
          <ArrowRight className="w-4 h-4" />
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
      <div className="rounded-2xl border border-white/5 bg-[#121214] p-10 text-center text-zinc-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
        <span>Đang tải lịch sử...</span>
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
      <div className="rounded-2xl border border-white/5 bg-[#121214] p-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mb-4">
          <FileText className="w-6 h-6" />
        </div>

        <h3 className="font-semibold">
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