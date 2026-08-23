"use client";

import { useState, useEffect } from "react";

export default function SetupPage() {
  const [currentScore, setCurrentScore] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyTime, setDailyStudyTime] = useState<number>(60); // default 60 mins
  const [studySchedule, setStudySchedule] = useState<string>("morning");
  const [motivationLevel, setMotivationLevel] = useState<number>(5);
  const [learningStyle, setLearningStyle] = useState<string>("visual");

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

  const studyScheduleOptions = [
    { value: "morning", label: "Sáng", icon: "🌅", desc: "6:00 - 12:00" },
    { value: "afternoon", label: "Chiều", icon: "☀️", desc: "12:00 - 18:00" },
    { value: "evening", label: "Tối", icon: "🌙", desc: "18:00 - 24:00" },
  ];

  const learningStyleOptions = [
    { value: "visual", label: "Hình ảnh", icon: "👁️", desc: "Học qua hình ảnh, sơ đồ" },
    { value: "auditory", label: "Nghe", icon: "🎧", desc: "Học qua âm thanh, hội thoại" },
    { value: "reading", label: "Đọc", icon: "📖", desc: "Học qua văn bản, bài đọc" },
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
          studySchedule,
          motivationLevel,
          learningStyle,
        }),
      }
    );

    if (!res.ok) {
      alert("Lưu mục tiêu thất bại");
      return;
    }

    // Update localStorage with currentScore and targetScore
    const updatedUser = {
      ...user,
      currentScore: cScore,
      targetScore: tScore,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

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
            Thiết lập mục tiêu TOEIC của bạn
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
              Ưa thích thời gian học
            </label>
            <div className="grid grid-cols-3 gap-2">
              {studyScheduleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStudySchedule(opt.value)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-300 ${
                    studySchedule === opt.value
                      ? "border-red-500 bg-red-950/20 text-white shadow-md shadow-red-500/10"
                      : "border-zinc-800 bg-zinc-900 text-gray-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <p className="text-lg mb-1">{opt.icon}</p>
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Mức độ động lực ({motivationLevel}/10)
            </label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <input
                type="range"
                min="1"
                max="10"
                value={motivationLevel}
                onChange={(e) => setMotivationLevel(Number(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>1 - Thấp</span>
                <span className="text-red-400 font-bold">{motivationLevel}</span>
                <span>10 - Cao</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Phong cách học tập
            </label>
            <div className="grid grid-cols-3 gap-2">
              {learningStyleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLearningStyle(opt.value)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-300 ${
                    learningStyle === opt.value
                      ? "border-red-500 bg-red-950/20 text-white shadow-md shadow-red-500/10"
                      : "border-zinc-800 bg-zinc-900 text-gray-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <p className="text-lg mb-1">{opt.icon}</p>
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{opt.desc}</p>
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
