"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
const router = useRouter();

const handleSkip = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Mark first login as completed without saving any data
  try {
    const res = await fetch("http://localhost:3001/profile/complete-first-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        currentScore: 0,
        targetScore: 600,
        examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dailyStudyTime: 60,
        studySchedule: "morning",
        motivationLevel: 5,
        learningStyle: "visual",
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    router.push("/dashboard");
  }
};

return ( <div className="min-h-screen bg-black flex items-center justify-center px-6"> <div className="w-full max-w-md text-center">

    {/* Logo */}
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold text-white">
          B
        </span>
      </div>
    </div>

    {/* Brand */}
    <h1 className="text-4xl font-extrabold text-red-600">
      BELLA
    </h1>

    <p className="text-gray-400 mt-2 mb-8">
      Hãy cho chúng tôi biết trình độ hiện tại của bạn
    </p>

    {/* Card */}
    <div className="bg-zinc-900 border border-red-600/30 rounded-2xl p-6 shadow-xl">

      <button
        onClick={() =>
          router.push("/onboarding/setup")
        }
        className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-3 rounded-xl"
      >
        Tôi biết điểm TOEIC hiện tại
      </button>

      <button
        onClick={() =>
          router.push("/onboarding/placement-test")
        }
        className="w-full mt-4 border border-red-600 text-red-500 hover:bg-red-950 transition font-semibold py-3 rounded-xl"
      >
        Làm bài test xếp trình độ
      </button>

      <button
        onClick={handleSkip}
        className="w-full mt-6 text-gray-500 hover:text-gray-300 text-sm transition"
      >
        Bỏ qua thiết lập lần đầu
      </button>

    </div>

    <p className="text-gray-600 text-xs mt-6">
      BELLA • TOEIC Learning System
    </p>

  </div>
</div>


);
}
