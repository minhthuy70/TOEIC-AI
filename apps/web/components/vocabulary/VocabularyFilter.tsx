"use client";

import { useState, useEffect } from "react";
import { Topic } from "@/types/vocabulary";
import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  currentStage: number;
  topics: Topic[];
  onFilterChange: (filters: {
    stage?: number;
    topic?: string;
    search?: string;
    sort?: "alphabet_asc" | "alphabet_desc" | "learned_asc" | "learned_desc" | "review_asc" | "review_desc";
    status?: string;
    srsLevel?: number;
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
  const [sort, setSort] = useState<"alphabet_asc" | "alphabet_desc" | "learned_asc" | "learned_desc" | "review_asc" | "review_desc">("alphabet_asc");
  const [status, setStatus] = useState<string>("");
  const [srsLevel, setSrsLevel] = useState<number | undefined>(undefined);

  // Debounce search input to avoid hitting database on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        stage: selectedStage,
        topic: selectedTopic || undefined,
        search: search.trim() || undefined,
        sort,
        status: status || undefined,
        srsLevel: srsLevel,
        page: 1, // Reset page on filter change
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedStage, selectedTopic, search, sort, status, srsLevel]);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-red-500" />
          <span>Tìm kiếm & Bộ lọc từ vựng</span>
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Tra cứu, sắp xếp và lọc từ vựng trong chặng học của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Tìm kiếm</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập từ Tiếng Anh / Nghĩa..."
              className="w-full text-xs text-white placeholder-zinc-500 bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl pl-8 pr-3 py-2.5 outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3 pointer-events-none" />
          </div>
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

        {/* Status Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">Chưa học (New)</option>
            <option value="LEARNING">Đang học (Learning)</option>
            <option value="REVIEW">Cần ôn tập (Review)</option>
            <option value="MASTERED">Thành thạo (Mastered)</option>
          </select>
        </div>

        {/* SRS Level Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Mức SRS (1-7)</label>
          <select
            value={srsLevel === undefined ? "" : srsLevel}
            onChange={(e) => {
              const val = e.target.value;
              setSrsLevel(val === "" ? undefined : Number(val));
            }}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
          >
            <option value="">Tất cả cấp độ</option>
            {[1, 2, 3, 4, 5, 6, 7].map((l) => (
              <option key={l} value={l}>Cấp độ {l}</option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold uppercase">Sắp xếp</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="w-full text-xs text-white bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
          >
            <option value="alphabet_asc">A-Z (Tăng dần)</option>
            <option value="alphabet_desc">Z-A (Giảm dần)</option>
            <option value="learned_desc">Ngày học: Mới nhất</option>
            <option value="learned_asc">Ngày học: Cũ nhất</option>
            <option value="review_asc">Ngày ôn: Gần nhất</option>
            <option value="review_desc">Ngày ôn: Xa nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
