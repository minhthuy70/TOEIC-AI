"use client";

import { Topic } from "@/types/vocabulary";

interface Props {
  topics: Topic[];
  selectedTopic?: string;
  onSelect: (topic?: string) => void;
}

export default function TopicList({
  topics,
  selectedTopic,
  onSelect,
}: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-lg font-bold text-white">
          Chủ đề
        </h2>

        <span className="text-sm text-gray-400">
          {topics.length} chủ đề
        </span>

      </div>

      <div className="space-y-2">

        <button
          onClick={() => onSelect(undefined)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
            !selectedTopic
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          }`}
        >
          <span>Tất cả</span>
        </button>

        {topics.map((topic) => (
          <button
            key={topic.topic}
            onClick={() => onSelect(topic.topic)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
              selectedTopic === topic.topic
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            <span className="text-left">
              {topic.topic}
            </span>

            <span className="rounded-full bg-zinc-700 px-2 py-1 text-xs">
              {topic.totalWords}
            </span>
          </button>
        ))}

      </div>

    </div>
  );
}