"use client";

import { useState, useEffect } from "react";
import { Topic } from "@/types/vocabulary";

interface Props {
  currentStage: number;
  topics: Topic[];
  onFilterChange: (filters: {
    stage?: number;
    topic?: string;
    search?: string;
    sort?: "asc" | "desc";
    page: number;
  }) => void;
}

export default function VocabularyFilter({
  currentStage,
  topics,
  onFilterChange,
}: Props) {
  const [selectedStage, setSelectedStage] = useState<number | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  // Debounce search input to avoid hitting database on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        stage: selectedStage,
        topic: selectedTopic || undefined,
        search: search.trim() || undefined,
        sort,
        page: 1, // Reset page on filter change
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedStage, selectedTopic, search, sort]);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🔍</span> Tìm kiếm & Bộ lọc từ vựng
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Tra cứu, sắp xếp và lọc từ vựng trong chặng học của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Tìm kiếm</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập từ Tiếng Anh / Nghĩa..."
            className="w-full text-xs text-white placeholder-zinc-500 bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition"
          />
        </div>

        {/* Stage Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Chặng học</label>
          <select
            value={selectedStage === undefined ? "" : selectedStage}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStage(val === "" ? undefined : Number(val));
            }}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
          >
            <option value="">Tất cả (Chặng 1 {currentStage > 1 ? `→ ${currentStage}` : ""})</option>
            {Array.from({ length: currentStage }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Chặng {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Chủ đề</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
          >
            <option key="all-topics" value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t.id} value={t.label}>
                {t.label} ({t.words} từ)
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Sắp xếp bảng chữ cái</label>
          <button
            type="button"
            onClick={() => setSort((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 rounded-xl px-4 py-2.5 flex items-center justify-between transition"
          >
            <span>Tên từ vựng (A-Z)</span>
            <span className="text-red-400 font-bold">{sort === "asc" ? "↑ A-Z" : "↓ Z-A"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
