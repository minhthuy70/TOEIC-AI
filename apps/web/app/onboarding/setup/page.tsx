"use client";

import { useState } from "react";

export default function SetupPage() {
const [currentScore, setCurrentScore] = useState("");
const [targetScore, setTargetScore] = useState("");
const [examDate, setExamDate] = useState("");

async function saveGoal() {
const user = JSON.parse(
localStorage.getItem("user") || "{}"
);

const res = await fetch(
  "http://localhost:3001/profile/complete-first-login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      currentScore: Number(currentScore),
      targetScore: Number(targetScore),
      examDate,
    }),
  }
);

if (!res.ok) {
  alert("Lưu mục tiêu thất bại");
  return;
}

window.location.href = "/dashboard";

}

return ( <div className="min-h-screen bg-black flex items-center justify-center px-6"> <div className="w-full max-w-md">


    <div className="text-center mb-8">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold">
        B
      </div>

      <h1 className="text-3xl font-bold text-red-600 mt-4">
        BELLA
      </h1>

      <p className="text-gray-400">
        Thiết lập mục tiêu TOEIC
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-6 border border-red-600/30 space-y-4">

      <input
        type="number"
        placeholder="Điểm hiện tại"
        className="w-full p-3 rounded-xl bg-black border border-red-600/30 text-white"
        onChange={(e) =>
          setCurrentScore(e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Điểm mục tiêu"
        className="w-full p-3 rounded-xl bg-black border border-red-600/30 text-white"
        onChange={(e) =>
          setTargetScore(e.target.value)
        }
      />

      <input
        type="date"
        className="w-full p-3 rounded-xl bg-black border border-red-600/30 text-white"
        onChange={(e) =>
          setExamDate(e.target.value)
        }
      />

      <button
        onClick={saveGoal}
        className="w-full bg-red-600 text-white py-3 rounded-xl"
      >
        Lưu mục tiêu
      </button>

    </div>
  </div>
</div>


);
}
