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
import { getReadingDashboard, ReadingDashboardResponse } from "@/services/reading";
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  Flame,
  AlertTriangle,
  Sparkles,
  Settings,
  ArrowLeft,
  Puzzle,
  FileText,
  FileCheck,
  SlidersHorizontal,
} from "lucide-react";

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

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white font-bold">{payload[0]?.payload?.subject}</p>
      <p className="text-indigo-400 font-semibold">Tỷ lệ chính xác: {payload[0]?.value}%</p>
    </div>
  );
};

export default function ReadingDashboardPage() {
  const [data, setData] = useState<ReadingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReadingDashboard()
      .then((res) => { if (res.success) setData(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Đang tải dữ liệu luyện đọc...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500 text-sm">Không thể tải dữ liệu.</div>
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

  // Ensure all 3 parts exist for the radar chart (Part 5, 6, 7)
  for (let i = 5; i <= 7; i++) {
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-red-500" />
            <span>Luyện Đọc (Reading)</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Bảng điều khiển và phân tích kỹ năng đọc của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/reading/settings"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt đọc</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Dashboard</span>
          </Link>
        </div>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-zinc-600 mb-3" />
          <p className="text-white font-bold text-lg">Chưa có dữ liệu luyện đọc</p>
          <p className="text-zinc-500 text-sm mt-1">Hãy làm bài tập để hệ thống có thể phân tích kỹ năng của bạn.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Trophy} label="Điểm TOEIC (Đọc)" value={data.overallScore} sub="Ước tính từ thi thử" color="amber" />
            <StatCard icon={Target} label="Độ chính xác" value={`${data.accuracyRate}%`} sub="Tất cả bài tập" color="green" />
            <StatCard icon={Clock} label="Thời gian TB" value={`${data.averageTimePerQuestion}s`} sub="Mỗi câu hỏi" color="sky" />
            <StatCard icon={Flame} label="Chuỗi luyện tập" value={`${data.streak} ngày`} sub="Liên tiếp" color="purple" />
            <StatCard icon={BookOpen} label="Đã hoàn thành" value={data.totalQuestionsCompleted} sub="Câu hỏi" color="indigo" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Weak Parts Alert */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {data.weakParts.length > 0 ? (
                <div className="bg-rose-950/30 border border-rose-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-rose-300 mb-2">Kỹ năng yếu: Part {data.weakParts.join(", ")}</h3>
                  <p className="text-sm text-rose-200/70 mb-5">
                    Hệ thống nhận thấy bạn có tỷ lệ chính xác thấp nhất ở phần này. Hãy dành thêm thời gian luyện tập!
                  </p>
                  <Link 
                    href={`/dashboard/reading/part-${data.weakParts[0]}`}
                    className="mx-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition"
                  >
                    Luyện tập ngay Part {data.weakParts[0]}
                  </Link>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-5 flex-1 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-300 mb-2">Rất tốt!</h3>
                  <p className="text-sm text-emerald-200/70 mb-5">
                    Bạn đang duy trì tỷ lệ chính xác khá đồng đều. Tiếp tục phát huy nhé!
                  </p>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">Phân tích kỹ năng theo Part (Tỷ lệ chính xác)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                      name="Tỷ lệ chính xác"
                      dataKey="A"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Navigation to Practices */}
      <h2 className="text-lg font-bold text-white mt-10 mb-4">Bắt đầu luyện tập</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/reading/part-5" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Puzzle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white mb-1">Part 5</h3>
          <p className="text-xs text-zinc-400">Hoàn thành câu (Incomplete Sentences)</p>
        </Link>
        <Link href="/dashboard/reading/part-6" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white mb-1">Part 6</h3>
          <p className="text-xs text-zinc-400">Hoàn thành đoạn văn (Text Completion)</p>
        </Link>
        <Link href="/dashboard/reading/part-7" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white mb-1">Part 7</h3>
          <p className="text-xs text-zinc-400">Đọc hiểu (Reading Comprehension)</p>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Link href="/dashboard/reading/mixed" className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-800/30 rounded-2xl p-5 group transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">Luyện hỗn hợp</h3>
              <p className="text-xs text-zinc-400">Kết hợp Part 5-7 tùy chọn</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/reading/settings" className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 group transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-700/50 text-zinc-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">Cài đặt</h3>
              <p className="text-xs text-zinc-400">Cỡ chữ, chế độ tối/sáng...</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
