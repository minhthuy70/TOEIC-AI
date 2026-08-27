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

const SRS_COLORS = [
  "#6366f1","#818cf8","#a78bfa","#c084fc",
  "#e879f9","#f0abfc","#fbcfe8","#fbbf24",
];

function StatCard({
  label, value, sub, icon, color = "indigo",
}: {
  label: string; value: string | number; sub?: string; icon: string; color?: string;
}) {
  const gradients: Record<string,string> = {
    indigo: "from-indigo-600/20 to-indigo-800/10 border-indigo-600/30",
    amber:  "from-amber-600/20 to-amber-800/10 border-amber-500/30",
    green:  "from-emerald-600/20 to-emerald-800/10 border-emerald-600/30",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-600/30",
    rose:   "from-rose-600/20 to-rose-800/10 border-rose-600/30",
    sky:    "from-sky-600/20 to-sky-800/10 border-sky-600/30",
  };
  return (
    <div className={`bg-gradient-to-br ${gradients[color] ?? gradients.indigo} border rounded-2xl p-5 flex flex-col gap-2`}>
      <div className="text-2xl">{icon}</div>
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
  topic: string; mastered: number; total: number; masteryRate: number; rank?: "strong"|"weak";
}) {
  const barColor = rank === "weak" ? "bg-rose-500"
    : masteryRate >= 70 ? "bg-emerald-500"
    : masteryRate >= 40 ? "bg-amber-500"
    : "bg-rose-500";
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{topic}</p>
        <p className="text-[11px] text-zinc-500">{mastered}/{total} t&#7915; th&#224;nh th&#7841;o</p>
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
          {p.dataKey === "newWords" ? "T&#7915; m&#7899;i h&#244;m nay" : "T&#7893;ng t&#237;ch l&#361;y"}: {p.value}
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
      <p className="text-indigo-400 font-semibold">{payload[0]?.value} t&#7915;</p>
    </div>
  );
};

export default function VocabularyStatisticsPage() {
  const [data, setData] = useState<VocabularyStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthView, setGrowthView] = useState<"new"|"cumulative">("cumulative");

  useEffect(() => {
    getVocabularyStatistics()
      .then((res) => { if (res.success) setData(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">&#272;ang t&#7843;i d&#7919; li&#7879;u th&#7889;ng k&#234;...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500 text-sm">Kh&#244;ng th&#7875; t&#7843;i d&#7919; li&#7879;u th&#7889;ng k&#234;.</div>
      </div>
    );
  }

  const noData = data.totalLearned === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">&#128202; Th&#7889;ng k&#234; t&#7915; v&#7921;ng</h1>
          <p className="text-zinc-400 text-sm mt-1">Ph&#226;n t&#237;ch chi ti&#7871;t ti&#7871;n tr&#236;nh h&#7885;c v&#224; &#244;n t&#7853;p t&#7915; v&#7921;ng c&#7911;a b&#7841;n</p>
        </div>
        <Link
          href="/dashboard/vocabulary"
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          &#8592; Quay l&#7841;i T&#7915; v&#7921;ng
        </Link>
      </div>

      {noData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <p className="text-4xl mb-3">&#128218;</p>
          <p className="text-white font-bold text-lg">Ch&#432;a c&#243; d&#7919; li&#7879;u h&#7885;c t&#7853;p</p>
          <p className="text-zinc-500 text-sm mt-1">H&#227;y b&#7855;t &#273;&#7847;u h&#7885;c t&#7915; v&#7921;ng &#273;&#7875; xem th&#7889;ng k&#234; t&#7841;i &#273;&#226;y!</p>
          <Link href="/dashboard/vocabulary" className="inline-block mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition">
            B&#7855;t &#273;&#7847;u h&#7885;c ngay &#8594;
          </Link>
        </div>
      )}

      {!noData && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon="&#128293;" label="Chu&#7895;i ng&#224;y h&#7885;c" value={`${data.streaks.currentStreak} ng&#224;y`} sub="li&#234;n ti&#7871;p" color="amber" />
            <StatCard icon="&#127942;" label="Chu&#7895;i d&#224;i nh&#7845;t" value={`${data.streaks.longestStreak} ng&#224;y`} sub="k&#7927; l&#7909;c" color="purple" />
            <StatCard icon="&#9989;" label="&#272;&#227; th&#224;nh th&#7841;o" value={data.masteredCount} sub={`/ ${data.totalLearned} &#273;&#227; h&#7885;c`} color="green" />
            <StatCard icon="&#127919;" label="T&#7927; l&#7879; gi&#7919;" value={`${data.rates.retentionRate}%`} sub="Retention" color="sky" />
            <StatCard icon="&#9889;" label="&#272;&#7897; ch&#237;nh x&#225;c" value={`${data.rates.accuracyRate}%`} sub="khi h&#7885;c" color="indigo" />
            <StatCard icon="&#128200;" label="T&#7927; l&#7879; &#244;n" value={`${data.rates.successRate}%`} sub="th&#224;nh c&#244;ng" color="rose" />
          </div>

          {/* Rates + SRS Distribution */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white">T&#7927; l&#7879; h&#7885;c t&#7853;p</h2>
              <RateBar label="T&#7927; l&#7879; ch&#237;nh x&#225;c khi h&#7885;c" value={data.rates.accuracyRate} color="bg-indigo-500" />
              <RateBar label="T&#7927; l&#7879; th&#224;nh c&#244;ng khi &#244;n" value={data.rates.successRate} color="bg-purple-500" />
              <RateBar label="T&#7927; l&#7879; gi&#7919; l&#7841;i t&#7915; v&#7921;ng" value={data.rates.retentionRate} color="bg-emerald-500" />
            </div>
            <div className="col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">Ph&#226;n ph&#7889;i m&#7913;c SRS</h2>
              {data.srsDistribution.every((d) => d.count === 0) ? (
                <p className="text-zinc-500 text-xs text-center py-8">Ch&#432;a c&#243; d&#7919; li&#7879;u &#244;n t&#7853;p</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.srsDistribution} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="level" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<SrsTooltip />} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
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
              <h2 className="text-sm font-bold text-white">Bi&#7875;u &#273;&#7891; t&#259;ng tr&#432;&#7903;ng t&#7915; v&#7921;ng</h2>
              <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                <button onClick={() => setGrowthView("cumulative")} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${growthView === "cumulative" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}>T&#237;ch l&#361;y</button>
                <button onClick={() => setGrowthView("new")} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${growthView === "new" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}>T&#7915; m&#7899;i/ng&#224;y</button>
              </div>
            </div>
            {data.growthData.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-10">Ch&#432;a c&#243; d&#7919; li&#7879;u h&#7885;c t&#7853;p</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }}
                    tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }}
                  />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<GrowthTooltip />} />
                  {growthView === "cumulative" ? (
                    <Line type="monotone" dataKey="totalWords" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  ) : (
                    <Line type="monotone" dataKey="newWords" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Topic Mastery + Weak Topics */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-1">Th&#224;nh th&#7841;o theo ch&#7911; &#273;&#7873;</h2>
              <p className="text-[11px] text-zinc-500 mb-4">S&#7855;p x&#7871;p t&#7915; t&#7889;t nh&#7845;t &#273;&#7871;n y&#7871;u nh&#7845;t</p>
              {data.topicsBreakdown.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center py-8">Ch&#432;a c&#243; d&#7919; li&#7879;u</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {data.topicsBreakdown.map((t) => <TopicRow key={t.topic} {...t} />)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-rose-950/30 border border-rose-800/30 rounded-2xl p-5 flex-1">
                <h2 className="text-sm font-bold text-rose-300 mb-1">&#9888;&#65039; Ch&#7911; &#273;&#7873; t&#7915; v&#7921;ng y&#7871;u</h2>
                <p className="text-[11px] text-zinc-500 mb-4">C&#7847;n &#432;u ti&#234;n &#244;n t&#7853;p nh&#7919;ng ch&#7911; &#273;&#7873; n&#224;y</p>
                {data.weakTopics.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-6">Kh&#244;ng c&#243; ch&#7911; &#273;&#7873; y&#7871;u &#127881;</p>
                ) : (
                  <div className="divide-y divide-rose-900/30">
                    {data.weakTopics.map((t) => <TopicRow key={t.topic} {...t} rank="weak" />)}
                  </div>
                )}
              </div>
              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-emerald-300 mb-3">&#9989; T&#7893;ng k&#7871;t th&#224;nh th&#7841;o</h2>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-4xl font-extrabold text-white">{data.masteredCount}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">t&#7915; &#273;&#227; th&#224;nh th&#7841;o</p>
                  </div>
                  <div className="text-zinc-600 text-2xl font-light pb-1">/</div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-300">{data.totalLearned}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">t&#7915; &#273;&#227; h&#7885;c</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: data.totalLearned > 0 ? `${Math.round((data.masteredCount/data.totalLearned)*100)}%` : "0%" }}
                  />
                </div>
                <p className="text-right text-[11px] text-emerald-400 font-semibold mt-1">
                  {data.totalLearned > 0 ? Math.round((data.masteredCount/data.totalLearned)*100) : 0}% ho&#224;n th&#224;nh
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}