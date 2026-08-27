"use client";

import { useEffect, useState } from "react";
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
import { getListeningDashboard } from "@/services/listening";
import { ListeningDashboardResponse } from "@/types/listening";

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

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white font-bold">{payload[0]?.payload?.subject}</p>
      <p className="text-indigo-400 font-semibold">Tá»· lá»‡ chÃ­nh xÃ¡c: {payload[0]?.value}%</p>
    </div>
  );
};

export default function ListeningDashboardPage() {
  const [data, setData] = useState<ListeningDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListeningDashboard()
      .then((res) => { if (res.success) setData(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Äang táº£i dá»¯ liá»‡u luyá»‡n nghe...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500 text-sm">KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u.</div>
      </div>
    );
  }

  const hasData = data.totalQuestionsCompleted > 0 || data.overallScore > 0;
  
  // Format data for radar chart
  const radarData = data.scoreByPart.map(p => ({
    subject: `Part ${p.part}`,
    A: p.accuracy,
    fullMark: 100,
  }));

  // Ensure all 4 parts exist for the radar chart
  for (let i = 1; i <= 4; i++) {
    if (!radarData.find(p => p.subject === `Part ${i}`)) {
      radarData.push({ subject: `Part ${i}`, A: 0, fullMark: 100 });
    }
  }
  radarData.sort((a, b) => a.subject.localeCompare(b.subject));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ðŸŽ§ Luyá»‡n Nghe (Listening)</h1>
          <p className="text-zinc-400 text-sm mt-1">Báº£ng Ä‘iá»u khiá»ƒn vÃ  phÃ¢n tÃ­ch ká»¹ nÄƒng nghe cá»§a báº¡n</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          â† Trá»Ÿ vá» Dashboard
        </Link>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <p className="text-4xl mb-3">ðŸŽ§</p>
          <p className="text-white font-bold text-lg">ChÆ°a cÃ³ dá»¯ liá»‡u luyá»‡n nghe</p>
          <p className="text-zinc-500 text-sm mt-1">HÃ£y lÃ m bÃ i táº­p Ä‘á»ƒ há»‡ thá»‘ng cÃ³ thá»ƒ phÃ¢n tÃ­ch ká»¹ nÄƒng cá»§a báº¡n.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon="ðŸ†" label="Äiá»ƒm TOEIC (Nghe)" value={data.overallScore} sub="Æ¯á»›c tÃ­nh tá»« thi thá»­" color="amber" />
            <StatCard icon="ðŸŽ¯" label="Äá»™ chÃ­nh xÃ¡c" value={`${data.accuracyRate}%`} sub="Táº¥t cáº£ bÃ i táº­p" color="green" />
            <StatCard icon="â±ï¸" label="Thá»i gian trung bÃ¬nh" value={`${data.averageTimePerQuestion}s`} sub="Má»—i cÃ¢u há»i" color="sky" />
            <StatCard icon="ðŸ”¥" label="Chuá»—i luyá»‡n táº­p" value={`${data.streak} ngÃ y`} sub="LiÃªn tiáº¿p" color="purple" />
            <StatCard icon="ðŸ“š" label="ÄÃ£ hoÃ n thÃ nh" value={data.totalQuestionsCompleted} sub="CÃ¢u há»i" color="indigo" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Weak Parts Alert */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {data.weakParts.length > 0 ? (
                <div className="bg-rose-950/30 border border-rose-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">âš ï¸</span>
                  </div>
                  <h3 className="text-lg font-bold text-rose-300 mb-2">Ká»¹ nÄƒng yáº¿u: Part {data.weakParts.join(", ")}</h3>
                  <p className="text-sm text-rose-200/70 mb-5">
                    Há»‡ thá»‘ng nháº­n tháº¥y báº¡n cÃ³ tá»· lá»‡ chÃ­nh xÃ¡c tháº¥p nháº¥t á»Ÿ pháº§n nÃ y. HÃ£y dÃ nh thÃªm thá»i gian luyá»‡n táº­p!
                  </p>
                  <Link 
                    href={`/dashboard/listening/part-${data.weakParts[0]}`}
                    className="mx-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition"
                  >
                    Luyá»‡n táº­p ngay Part {data.weakParts[0]}
                  </Link>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">ðŸŒŸ</span>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-300 mb-2">Ráº¥t tá»‘t!</h3>
                  <p className="text-sm text-emerald-200/70 mb-5">
                    Báº¡n Ä‘ang duy trÃ¬ tá»· lá»‡ chÃ­nh xÃ¡c khÃ¡ Ä‘á»“ng Ä‘á»u. Tiáº¿p tá»¥c phÃ¡t huy nhÃ©!
                  </p>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">PhÃ¢n tÃ­ch ká»¹ nÄƒng theo Part (Tá»· lá»‡ chÃ­nh xÃ¡c)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                      name="Tá»· lá»‡ chÃ­nh xÃ¡c"
                      dataKey="A"
                      stroke="#818cf8"
                      fill="#6366f1"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Navigation to Practices */}
      <h2 className="text-lg font-bold text-white mt-10 mb-4">Báº¯t Ä‘áº§u luyá»‡n táº­p</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/listening/part-1" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">ðŸ–¼ï¸</div>
          <h3 className="font-bold text-white mb-1">Part 1</h3>
          <p className="text-xs text-zinc-400">MÃ´ táº£ hÃ¬nh áº£nh (Photographs)</p>
        </Link>
        <Link href="/dashboard/listening/part-2" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">ðŸ’¬</div>
          <h3 className="font-bold text-white mb-1">Part 2</h3>
          <p className="text-xs text-zinc-400">Há»i & ÄÃ¡p (Question-Response)</p>
        </Link>
        <Link href="/dashboard/listening/part-3" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">ðŸ‘¥</div>
          <h3 className="font-bold text-white mb-1">Part 3</h3>
          <p className="text-xs text-zinc-400">Äoáº¡n há»™i thoáº¡i (Conversations)</p>
        </Link>
        <Link href="/dashboard/listening/part-4" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">ðŸŽ¤</div>
          <h3 className="font-bold text-white mb-1">Part 4</h3>
          <p className="text-xs text-zinc-400">BÃ i nÃ³i chuyá»‡n (Talks)</p>
        </Link>
      </div>
    </div>
  );
}