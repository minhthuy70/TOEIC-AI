"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getVocabularyStatistics } from "@/services/vocabulary";
import { VocabularyStatisticsResponse } from "@/types/vocabulary";
import {
  BarChart3,
  Flame,
  Trophy,
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

const SRS_COLORS = [
  "#6366f1", "#818cf8", "#a78bfa", "#c084fc",
  "#e879f9", "#f0abfc", "#fbcfe8", "#fbbf24",
];

function StatCard({
  label, value, sub, icon: Icon, color = "indigo",
}: {
  label: string; value: string | number; sub?: string; icon: any; color?: string;
}) {
  const gradients: Record<string, string> = {
    indigo: "from-indigo-600/20 to-indigo-800/10 border-indigo-600/30",
    amber:  "from-amber-600/20 to-amber-800/10 border-amber-500/30",
    green:  "from-emerald-600/20 to-emerald-800/10 border-emerald-600/30",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-600/30",
    rose:   "from-rose-600/20 to-rose-800/10 border-rose-600/30",
    sky:    "from-sky-600/20 to-sky-800/10 border-sky-600/30",
  };
  return (
    <div className={`bg-gradient-to-br ${gradients[color] ?? gradients.indigo} border rounded-2xl p-5 flex flex-col gap-2`}>
      <div className="text-zinc-300">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}

function RateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-300">{label}</span>
        <span className="font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TopicRow({ topic, mastered, total, masteryRate, rank }: {
  topic: string; mastered: number; total: number; masteryRate: number; rank?: "strong" | "weak";
}) {
  const barColor = rank === "weak" ? "bg-rose-500"
    : masteryRate >= 70 ? "bg-emerald-500"
    : masteryRate >= 40 ? "bg-amber-500"
    : "bg-rose-500";
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{topic}</p>
        <p className="text-[11px] text-zinc-500">{mastered}/{total} từ thành thạo</p>
      </div>
      <div className="flex items-center gap-2 w-36">
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${masteryRate}%` }} />
        </div>
        <span className={`text-xs font-bold w-10 text-right ${
          masteryRate >= 70 ? "text-emerald-400" : masteryRate >= 40 ? "text-amber-400" : "text-rose-400"
        }`}>{masteryRate}%</span>
      </div>
    </div>
  );
}

const GrowthTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === "newWords" ? "Từ mới hôm nay" : "Tổng tích lũy"}: {p.value}
        </p>
      ))}
    </div>
  );
};

const SrsTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white font-bold">{payload[0]?.payload?.level}</p>
      <p className="text-indigo-400 font-semibold">{payload[0]?.value} từ</p>
    </div>
  );
};

export default function VocabularyStatisticsPage() {
  const [data, setData] = useState<VocabularyStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthView, setGrowthView] = useState<"new" | "cumulative">("cumulative");

  useEffect(() => {
    getVocabularyStatistics()
      .then((res) => { if (res.success) setData(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500 text-sm">Không thể tải dữ liệu thống kê.</div>
      </div>
    );
  }

  const noData = data.totalLearned === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Thống kê từ vựng</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Phân tích chi tiết tiến trình học và ôn tập từ vựng của bạn</p>
        </div>
        <Link
          href="/dashboard/vocabulary"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Từ vựng</span>
        </Link>
      </div>

      {noData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-zinc-600 mb-3" />
          <p className="text-white font-bold text-lg">Chưa có dữ liệu học tập</p>
          <p className="text-zinc-500 text-sm mt-1">Hãy bắt đầu học từ vựng để xem thống kê tại đây!</p>
          <Link href="/dashboard/vocabulary" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition">
            <span>Bắt đầu học ngay</span>
          </Link>
        </div>
      )}

      {!noData && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Flame} label="Chuỗi ngày học" value={`${data.streaks.currentStreak} ngày`} sub="liên tiếp" color="amber" />
            <StatCard icon={Trophy} label="Chuỗi dài nhất" value={`${data.streaks.longestStreak} ngày`} sub="kỷ lục" color="purple" />
            <StatCard icon={CheckCircle2} label="Đã thành thạo" value={data.masteredCount} sub={`/ ${data.totalLearned} đã học`} color="green" />
            <StatCard icon={Target} label="Tỷ lệ giữ" value={`${data.rates.retentionRate}%`} sub="Retention" color="sky" />
            <StatCard icon={Zap} label="Độ chính xác" value={`${data.rates.accuracyRate}%`} sub="khi học" color="indigo" />
            <StatCard icon={TrendingUp} label="Tỷ lệ ôn" value={`${data.rates.successRate}%`} sub="thành công" color="rose" />
          </div>

          {/* Rates + SRS Distribution */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white">Tỷ lệ học tập</h2>
              <RateBar label="Tỷ lệ chính xác khi học" value={data.rates.accuracyRate} color="bg-indigo-500" />
              <RateBar label="Tỷ lệ thành công khi ôn" value={data.rates.successRate} color="bg-purple-500" />
              <RateBar label="Tỷ lệ giữ lại từ vựng" value={data.rates.retentionRate} color="bg-emerald-500" />
            </div>
            <div className="col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">Phân phối mức SRS</h2>
              {data.srsDistribution.every((d) => d.count === 0) ? (
                <p className="text-zinc-500 text-xs text-center py-8">Chưa có dữ liệu ôn tập</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.srsDistribution} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="level" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<SrsTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.srsDistribution.map((_entry: any, index: number) => (
                        <Cell key={index} fill={SRS_COLORS[index % SRS_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Biểu đồ tăng trưởng từ vựng</h2>
              <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                <button onClick={() => setGrowthView("cumulative")} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${growthView === "cumulative" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>Tích lũy</button>
                <button onClick={() => setGrowthView("new")} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${growthView === "new" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>Từ mới/ngày</button>
              </div>
            </div>
            {data.growthData.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-10">Chưa có dữ liệu học tập</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                  />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<GrowthTooltip />} />
                  {growthView === "cumulative" ? (
                    <Line type="monotone" dataKey="totalWords" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  ) : (
                    <Line type="monotone" dataKey="newWords" stroke="#f87171" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Topic Mastery + Weak Topics */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-1">Thành thạo theo chủ đề</h2>
              <p className="text-[11px] text-zinc-500 mb-4">Sắp xếp từ tốt nhất đến yếu nhất</p>
              {data.topicsBreakdown.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {data.topicsBreakdown.map((t) => <TopicRow key={t.topic} {...t} />)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-rose-950/30 border border-rose-800/30 rounded-2xl p-5 flex-1">
                <h2 className="text-sm font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Chủ đề từ vựng yếu</span>
                </h2>
                <p className="text-[11px] text-zinc-500 mb-4">Cần ưu tiên ôn tập những chủ đề này</p>
                {data.weakTopics.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-6">Không có chủ đề yếu</p>
                ) : (
                  <div className="divide-y divide-rose-900/30">
                    {data.weakTopics.map((t) => <TopicRow key={t.topic} {...t} rank="weak" />)}
                  </div>
                )}
              </div>
              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tổng kết thành thạo</span>
                </h2>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-4xl font-extrabold text-white">{data.masteredCount}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">từ đã thành thạo</p>
                  </div>
                  <div className="text-zinc-600 text-2xl font-light pb-1">/</div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-300">{data.totalLearned}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">từ đã học</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: data.totalLearned > 0 ? `${Math.round((data.masteredCount / data.totalLearned) * 100)}%` : "0%" }}
                  />
                </div>
                <p className="text-right text-[11px] text-emerald-400 font-semibold mt-1">
                  {data.totalLearned > 0 ? Math.round((data.masteredCount / data.totalLearned) * 100) : 0}% hoàn thành
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}