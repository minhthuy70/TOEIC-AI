"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
const router = useRouter();

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
        className="w-full mt-4 border border-red-600 text-red-500 hover:bg-red-950 transition font-semibold py-3 rounded-xl"
      >
        Làm bài test xếp trình độ
      </button>

    </div>

    <p className="text-gray-600 text-xs mt-6">
      BELLA AI • TOEIC Learning System
    </p>

  </div>
</div>


);
}
