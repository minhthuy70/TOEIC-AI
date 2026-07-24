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
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");

        if (!user) {
            setLoading(false);
            return;
        }

        const currentUser = JSON.parse(user);

        setUserId(currentUser.id);

        loadWords(currentUser.id);
    }, []);

    async function loadWords(id: number) {
        try {
            const res = await fetch(
                `http://localhost:3001/vocabulary/today/${id}`
            );

            const data = await res.json();

            console.log(data);

            setMode(data.mode ?? "");
            setWords(data.words ?? []);
            setIndex(0);
        } catch (err) {
            console.error(err);
            setWords([]);
        } finally {
            setLoading(false);
        }
    }

    async function answer(remembered: boolean) {
        if (!userId) return;

        const word = words[index];

        try {
            await fetch("http://localhost:3001/vocabulary/learn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    vocabularyId: word.id,
                    remembered,
                }),
            });

            if (index < words.length - 1) {
                setIndex(index + 1);
            } else {
                loadWords(userId);
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div className="text-center text-white mt-20">
                Đang tải...
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="text-center text-zinc-400 mt-20">
                Không còn từ để học hôm nay 🎉
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
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        mode === "REVIEW"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                    }`}
                >
                    {mode}
                </div>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

                <div className="text-center">

                    <h1 className="text-5xl font-bold text-white">
                        {word.english}
                    </h1>

                    <p className="text-zinc-400 mt-3">
                        {word.pronounce}
                    </p>

                    {word.imageUrl && (
                        <img
                            src={word.imageUrl}
                            alt={word.english}
                            className="mx-auto mt-6 w-72 rounded-xl"
                        />
                    )}

                    <div className="mt-8">

                        <h2 className="text-2xl font-bold text-red-400">
                            {word.vietnamese}
                        </h2>

                        <p className="text-zinc-300 mt-4">
                            {word.explain}
                        </p>

                        <div className="mt-6 rounded-xl bg-zinc-800 p-4 text-left">

                            <p className="italic text-white">
                                {word.example}
                            </p>

                            <p className="mt-2 text-zinc-400">
                                {word.exampleVietnamese}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">

                <button
                    onClick={() => answer(false)}
                    className="h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    👎 Chưa nhớ
                </button>

                <button
                    onClick={() => answer(true)}
                    className="h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                    👍 Đã nhớ
                </button>

            </div>

        </div>
    );
}