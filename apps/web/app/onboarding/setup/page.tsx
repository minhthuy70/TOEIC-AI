"use client";

import { useState, useEffect } from "react";

export default function SetupPage() {
  const [currentScore, setCurrentScore] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyTime, setDailyStudyTime] = useState<number>(60); // default 60 mins

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scoreParam = params.get("score");
      if (scoreParam) {
        setCurrentScore(scoreParam);
      }
    }
  }, []);

  const studyTimeOptions = [
    { value: 30, label: "30 phút", desc: "Thư thả" },
    { value: 60, label: "60 phút", desc: "Tiêu chuẩn" },
    { value: 90, label: "90 phút", desc: "Tập trung" },
    { value: 120, label: "120 phút+", desc: "Cấp tốc" },
  ];

  async function saveGoal() {
    if (!currentScore || !targetScore || !examDate) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const cScore = Number(currentScore);
    const tScore = Number(targetScore);

    if (cScore < 0 || cScore > 990 || tScore < 0 || tScore > 990) {
      alert("Điểm TOEIC phải nằm trong khoảng từ 0 đến 990");
      return;
    }

    if (cScore > tScore) {
      alert("Điểm mục tiêu không được thấp hơn điểm hiện tại");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await fetch(
      "http://localhost:3001/profile/complete-first-login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentScore: cScore,
          targetScore: tScore,
          examDate,
          dailyStudyTime,
        }),
      }
    );

    if (!res.ok) {
      alert("Lưu mục tiêu thất bại");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-600/30">
            B
          </div>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 mt-4 tracking-wider">
            BELLA
          </h1>

          <p className="text-gray-400 mt-2 text-sm">
            Thiết lập mục tiêu TOEIC cá nhân hóa của bạn
          </p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Điểm hiện tại
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="990"
                placeholder="Ví dụ: 350"
                className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-300"
                value={currentScore}
                onChange={(e) => setCurrentScore(e.target.value)}
              />
              <span className="absolute right-4 top-4 text-gray-600 text-sm font-semibold">
                / 990
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Điểm mục tiêu
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="990"
                placeholder="Ví dụ: 650"
                className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-300"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
              />
              <span className="absolute right-4 top-4 text-gray-600 text-sm font-semibold">
                / 990
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Thời gian học mỗi ngày
            </label>
            <div className="grid grid-cols-2 gap-2">
              {studyTimeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDailyStudyTime(opt.value)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 ${
                    dailyStudyTime === opt.value
                      ? "border-red-500 bg-red-950/20 text-white shadow-md shadow-red-500/10"
                      : "border-zinc-800 bg-zinc-900 text-gray-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Thời gian dự kiến thi
            </label>
            <input
              type="date"
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-300"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <button
            onClick={saveGoal}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-2xl transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/30 hover:shadow-red-500/50"
          >
            Lưu mục tiêu
          </button>
        </div>
      </div>
    </div>
  );
}
