"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getGrammarDashboard } from "@/services/grammar";
import type {
  GrammarDashboardData,
  GrammarTopicSummary,
} from "@/types/grammar";
import {
  FileText,
  Settings,
  BookOpen,
  Edit3,
  ArrowLeft,
  Trophy,
  Zap,
  Target,
  AlertTriangle,
  Sparkles,
  Search,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  const gradients: Record<string, string> = {
    indigo: "from-indigo-600/20 to-indigo-800/10 border-indigo-600/30 text-indigo-400",
    amber: "from-amber-600/20 to-amber-800/10 border-amber-500/30 text-amber-400",
    green: "from-emerald-600/20 to-emerald-800/10 border-emerald-600/30 text-emerald-400",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-600/30 text-purple-400",
    rose: "from-rose-600/20 to-rose-800/10 border-rose-600/30 text-rose-400",
    sky: "from-sky-600/20 to-sky-800/10 border-sky-600/30 text-sky-400",
  };
  const theme = gradients[color] ?? gradients.indigo;
  return (
    <div
      className={`bg-gradient-to-br ${theme} border rounded-2xl p-5 flex flex-col gap-2`}
    >
      <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white font-bold">{payload[0]?.payload?.subject}</p>
      <p className="text-purple-400 font-semibold">
        Tỷ lệ chính xác: {payload[0]?.value}%
      </p>
      {payload[0]?.payload?.completedLessons !== undefined && (
        <p className="text-zinc-400 text-[11px]">
          Đã hoàn thành: {payload[0]?.payload?.completedLessons}/
          {payload[0]?.payload?.totalLessons} bài
        </p>
      )}
    </div>
  );
};

export default function GrammarDashboardPage() {
  const [data, setData] = useState<GrammarDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<
    "all" | "learning" | "mastered" | "weak" | "not_started"
  >("all");
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "basic" | "intermediate" | "advanced">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getGrammarDashboard();
        setData(res);
      } catch (err: any) {
        console.error("Error loading grammar dashboard:", err);
        setError(err.message || "Không thể tải dữ liệu bảng điều khiển ngữ pháp");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    if (!data) return [];
    let list: GrammarTopicSummary[] = [];

    if (activeTab === "all") {
      list = [
        ...data.learningTopics,
        ...data.masteredTopics,
        ...data.notStartedTopics,
      ];
      const map = new Map<number, GrammarTopicSummary>();
      list.forEach((t) => map.set(t.id, t));
      list = Array.from(map.values()).sort(
        (a, b) => a.stage - b.stage || a.id - b.id
      );
    } else if (activeTab === "learning") {
      list = data.learningTopics;
    } else if (activeTab === "mastered") {
      list = data.masteredTopics;
    } else if (activeTab === "weak") {
      list = data.weakTopics;
    } else if (activeTab === "not_started") {
      list = data.notStartedTopics;
    }

    if (selectedStage > 0) {
      list = list.filter((t) => t.stage === selectedStage);
    }

    if (selectedDifficulty === "basic") {
      list = list.filter((t) => t.stage <= 2);
    } else if (selectedDifficulty === "intermediate") {
      list = list.filter((t) => t.stage === 3 || t.stage === 4);
    } else if (selectedDifficulty === "advanced") {
      list = list.filter((t) => t.stage >= 5);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, activeTab, selectedStage, selectedDifficulty, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400 text-sm animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          <span>Đang tải dữ liệu bảng điều khiển ngữ pháp...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500 text-sm">
          {error || "Không thể tải dữ liệu ngữ pháp."}
        </div>
      </div>
    );
  }

  const { overview, accuracy, stages, weakTopics, recentActivities, userStage } =
    data;

  // Format data for radar chart across 5 stages
  const radarData = stages.map((s) => ({
    subject: `Chặng ${s.stage}`,
    accuracy: s.accuracy,
    completedLessons: s.completedLessons,
    totalLessons: s.totalLessons,
    fullMark: 100,
  }));

  const hasData = overview.totalCategories > 0;

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-500" />
              <span>Bảng Điều Khiển Ngữ Pháp</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
              Chặng mục tiêu: Chặng {userStage}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Bảng điều khiển và phân tích kỹ năng ngữ pháp TOEIC theo 5 chặng
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/grammar/settings"
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt</span>
          </Link>
          <Link
            href="/dashboard/grammar/reference"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tra cứu</span>
          </Link>
          <Link
            href="/dashboard/grammar/exercises"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Luyện bài tập</span>
          </Link>
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-400 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Khóa học</span>
          </Link>
        </div>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-white font-bold text-lg">Chưa có dữ liệu ngữ pháp</p>
          <p className="text-zinc-500 text-sm mt-1">
            Hãy bắt đầu học bài để hệ thống phân tích kỹ năng của bạn.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* ── 5 STAT CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={BookOpen}
              label="Tổng bài học"
              value={`${overview.completedLessons}/${overview.totalLessons}`}
              sub={`${overview.overallProgress}% hoàn thành`}
              color="indigo"
            />
            <StatCard
              icon={Trophy}
              label="Thành thạo"
              value={overview.masteredCategories}
              sub={`/${overview.totalCategories} chủ đề`}
              color="green"
            />
            <StatCard
              icon={Zap}
              label="Đang học"
              value={overview.learningCategories}
              sub="Chủ đề đang tiến hành"
              color="amber"
            />
            <StatCard
              icon={Target}
              label="Độ chính xác"
              value={`${accuracy.overall}%`}
              sub={`${accuracy.totalScored} bài kiểm tra`}
              color="purple"
            />
            <StatCard
              icon={AlertTriangle}
              label="Cần cải thiện"
              value={overview.weakCategories}
              sub="Điểm dưới 60%"
              color="rose"
            />
          </div>

          {/* ── WEAK TOPICS ALERT & RADAR CHART ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Weak Topics or Positive Card */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {weakTopics.length > 0 ? (
                <div className="bg-rose-950/30 border border-rose-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-rose-300 mb-1">
                    Cần củng cố: {weakTopics.length} chủ đề
                  </h3>
                  <p className="text-xs text-rose-200/70 mb-4 leading-relaxed">
                    Hệ thống nhận thấy bạn có tỷ lệ làm sai cao ở chủ đề{" "}
                    <span className="font-bold text-rose-200">
                      {weakTopics[0].name}
                    </span>
                    . Hãy ôn tập lại lý thuyết để nâng band điểm!
                  </p>
                  <Link
                    href={`/dashboard/courses/grammar/${weakTopics[0].id}`}
                    className="mx-auto px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Ôn tập ngay: {weakTopics[0].name}
                  </Link>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-300 mb-1">
                    Rất tốt!
                  </h3>
                  <p className="text-xs text-emerald-200/70 leading-relaxed">
                    Bạn đang duy trì độ chính xác ngữ pháp rất tốt. Tiếp tục phát huy để đạt mục tiêu 900+ nhé!
                  </p>
                </div>
              )}
            </div>

            {/* Radar Chart By Stage */}
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">
                  Phân tích kỹ năng ngữ pháp theo 5 Chặng (Độ chính xác)
                </h2>
                <span className="text-[11px] text-zinc-400">
                  Lộ trình TOEIC 0 – 990
                </span>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#52525b", fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                      name="Tỷ lệ chính xác"
                      dataKey="accuracy"
                      stroke="#c084fc"
                      fill="#a855f7"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── TIẾN ĐỘ THEO 5 CHẶNG ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                Tiến độ ngữ pháp theo 5 Chặng
              </h2>
              <span className="text-xs text-zinc-500">
                Nhấp chọn chặng để lọc nhanh bài học
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stages.map((st) => (
                <div
                  key={st.stage}
                  onClick={() =>
                    setSelectedStage(selectedStage === st.stage ? 0 : st.stage)
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    selectedStage === st.stage
                      ? "bg-zinc-900 border-red-500 ring-1 ring-red-500/40 shadow-lg"
                      : st.isCurrent
                      ? "bg-zinc-900/90 border-zinc-700 hover:border-zinc-600"
                      : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {st.isCurrent && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                      MỤC TIÊU
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        Chặng {st.stage}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        ({st.completedLessons}/{st.totalLessons})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {st.progress}% hoàn thành
                    </p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${st.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TOPICS LIST & FILTER ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Danh sách chủ đề ngữ pháp
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Lựa chọn và theo dõi tiến độ từng chủ điểm
                </p>
              </div>

              {/* Search & Difficulties */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chủ đề..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "all"
                    ? "bg-red-600 text-white shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Tất cả ({overview.totalCategories})
              </button>
              <button
                onClick={() => setActiveTab("learning")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "learning"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Đang học ({overview.learningCategories})
              </button>
              <button
                onClick={() => setActiveTab("mastered")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "mastered"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Thành thạo ({overview.masteredCategories})
              </button>
              <button
                onClick={() => setActiveTab("weak")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "weak"
                    ? "bg-rose-600 text-white shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Cần cải thiện ({overview.weakCategories})
              </button>
              <button
                onClick={() => setActiveTab("not_started")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "not_started"
                    ? "bg-zinc-700 text-white shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Chưa học ({overview.notStartedCategories})
              </button>
            </div>

            {/* Grid */}
            {filteredTopics.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-10 text-center flex flex-col items-center">
                <Search className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-400 font-medium">
                  Không tìm thấy chủ đề phù hợp với bộ lọc.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedStage(0);
                    setSearchQuery("");
                  }}
                  className="mt-3 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((t) => {
                  const isMastered = t.isMastered;
                  const isLearning = t.isLearning;
                  const isWeak = t.isWeak;

                  return (
                    <div
                      key={t.id}
                      className={`bg-zinc-900/80 hover:bg-zinc-900 border rounded-2xl p-5 flex flex-col justify-between transition-all group ${
                        isWeak
                          ? "border-rose-800/40 hover:border-rose-600/60"
                          : isMastered
                          ? "border-emerald-800/40 hover:border-emerald-600/60"
                          : isLearning
                          ? "border-amber-800/40 hover:border-amber-600/60"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                            Chặng {t.stage}
                          </span>
                          <div className="flex items-center gap-1">
                            {isMastered && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <Trophy className="w-3 h-3" />
                                <span>Thành thạo</span>
                              </span>
                            )}
                            {isLearning && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <Zap className="w-3 h-3" />
                                <span>Đang học</span>
                              </span>
                            )}
                            {isWeak && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Cần củng cố</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h3 className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                            {t.name}
                          </h3>
                          {t.description && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 text-[11px]">
                              Tiến độ:
                            </span>
                            <span className="font-semibold text-zinc-300">
                              {t.completedLessons}/{t.totalLessons} bài (
                              {t.progress}%)
                            </span>
                          </div>
                          <div className="bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMastered
                                  ? "bg-emerald-500"
                                  : isWeak
                                  ? "bg-rose-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Accuracy */}
                        {t.completedLessons > 0 && (
                          <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                            <span className="text-zinc-400">Độ chính xác:</span>
                            <span
                              className={`font-bold ${
                                t.accuracy >= 80
                                  ? "text-emerald-400"
                                  : t.accuracy >= 60
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {t.accuracy}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <Link
                          href={`/dashboard/courses/grammar/${t.id}`}
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-medium transition"
                        >
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        {t.nextLesson ? (
                          <Link
                            href={`/dashboard/courses/grammar/${t.id}/lessons/${t.nextLesson.id}`}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow transition"
                          >
                            {t.progress > 0 ? "Học tiếp" : "Bắt đầu"}
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/courses/grammar/${t.id}`}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          >
                            Ôn tập
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RECENT ACTIVITIES ── */}
          {recentActivities && recentActivities.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Hoạt động gần đây</span>
                </h3>
                <span className="text-xs text-zinc-500">5 bài học mới nhất</span>
              </div>

              <div className="space-y-2">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-zinc-900 border border-zinc-800/70 rounded-xl p-3 flex items-center justify-between gap-4 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {act.lessonTitle}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Chủ đề: {act.categoryName} (Chặng {act.stage})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {act.score > 0 && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            act.score >= 80
                              ? "bg-emerald-500/15 text-emerald-400"
                              : act.score >= 60
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {act.score} điểm
                        </span>
                      )}
                      <Link
                        href={`/dashboard/courses/grammar/${act.categoryId}/lessons/${act.lessonId}`}
                        className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold"
                      >
                        <span>Xem lại</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
