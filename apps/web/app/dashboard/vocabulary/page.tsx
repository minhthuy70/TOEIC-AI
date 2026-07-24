"use client";

import { useEffect, useState } from "react";

interface Word {
    id: number;
    english: string;
    vietnamese: string;
    pronounce?: string;
    explain?: string;
    example?: string;
    exampleVietnamese?: string;
    imageUrl?: string;
    audioUrl?: string;
    topic: string;
    isReview: boolean;
}

export default function VocabularyPage() {
    const [loading, setLoading] = useState(true);

    const [mode, setMode] = useState("");

    const [words, setWords] = useState<Word[]>([]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        loadWords();
    }, []);

    async function loadWords() {
        try {
            const res = await fetch(
                "http://localhost:3001/vocabulary/learn?userId=1"
            );

            const data = await res.json();

            setMode(data.mode);
            setWords(data.words);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="text-white text-center mt-20">
                Đang tải...
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="text-center text-zinc-400 mt-20">
                Không còn từ để học.
            </div>
        );
    }

    const word = words[index];

    return (
        <div className="max-w-3xl mx-auto">

            <div className="flex justify-between mb-6">

                <div className="text-zinc-400">
                    {index + 1} / {words.length}
                </div>

                <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${mode === "REVIEW"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                >
                    {mode}
                </div>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

                <div className="text-center">

                    <p className="text-4xl font-bold text-white">
                        {word.english}
                    </p>

                    <p className="text-zinc-400 mt-2">
                        {word.pronounce}
                    </p>

                    {word.imageUrl && (
                        <img
                            src={word.imageUrl}
                            className="w-64 h-48 object-cover rounded-xl mx-auto mt-6"
                        />
                    )}

                    <div className="mt-8">

                        <p className="text-2xl text-red-400 font-semibold">
                            {word.vietnamese}
                        </p>

                        <p className="text-zinc-300 mt-4">
                            {word.explain}
                        </p>

                        <div className="mt-6 text-left bg-zinc-800 rounded-xl p-4">

                            <p className="text-white italic">
                                {word.example}
                            </p>

                            <p className="text-zinc-400 mt-2">
                                {word.exampleVietnamese}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">

                <button
                    className="h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    👎 Chưa nhớ
                </button>

                <button
                    className="h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                    👍 Đã nhớ
                </button>

            </div>

        </div>
    );
}