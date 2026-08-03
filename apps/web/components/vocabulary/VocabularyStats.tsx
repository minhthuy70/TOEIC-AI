"use client";

import { DashboardResponse } from "@/types/vocabulary";

interface Props {
  data: DashboardResponse | null;
}

export default function VocabularyStats({
  data,
}: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-gray-400">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===== Thống kê ===== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Chặng hiện tại"
          value={`Chặng ${data.stage}`}
          color="text-blue-400"
        />

        <StatCard
          title="Điểm hiện tại"
          value={String(data.currentScore ?? 0)}
          color="text-green-400"
        />

        <StatCard
          title="Điểm mục tiêu"
          value={String(data.targetScore ?? 0)}
          color="text-yellow-400"
        />

        <StatCard
          title="Đã học"
          value={`${data.totalLearned}/${data.totalWords}`}
          color="text-pink-400"
        />

      </div>

      {/* ===== Progress ===== */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-gray-300 font-medium">
            Tiến độ học từ vựng
          </span>

          <span className="font-bold text-white">
            {data.progress.toFixed(0)}%
          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-zinc-700">

          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{
              width: `${data.progress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-400">

          <span>
            {data.totalLearned} từ đã học
          </span>

          <span>
            {data.totalWords} từ
          </span>

        </div>

      </div>

      {/* ===== Học hôm nay ===== */}

      <div className="grid gap-4 md:grid-cols-3">

        <SmallCard
          title="Đã học hôm nay"
          value={data.learnedToday}
        />

        <SmallCard
          title="Mục tiêu"
          value={data.dailyGoal}
        />

        <SmallCard
          title="Còn lại"
          value={data.remainToday}
        />

      </div>

    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  color: string;
}

function StatCard({
  title,
  value,
  color,
}: CardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2
        className={`mt-2 text-3xl font-bold ${color}`}
      >
        {value}
      </h2>

    </div>
  );
}

interface SmallCardProps {
  title: string;
  value: number;
}

function SmallCard({
  title,
  value,
}: SmallCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {value}
      </h3>

    </div>
  );
}