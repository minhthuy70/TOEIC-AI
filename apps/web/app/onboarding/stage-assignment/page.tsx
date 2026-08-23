"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const STAGES = [
  {
    id: 1,
    name: "Chặng 1: Cơ bản",
    scoreRange: "0 - 299",
    description: "Xây dựng nền tảng tiếng Anh cơ bản",
    goals: [
      "Học 500 từ vựng cơ bản",
      "Nắm vững ngữ pháp căn bản",
      "Làm quen với dạng bài Listening đơn giản",
      "Đạt mức 300 điểm TOEIC",
    ],
    color: "red",
  },
  {
    id: 2,
    name: "Chặng 2: Sơ trung cấp",
    scoreRange: "300 - 499",
    description: "Phát triển kỹ năng nghe và đọc hiểu",
    goals: [
      "Học thêm 800 từ vựng chuyên ngành",
      "Luyện nghe Part 1-4",
      "Luyện đọc Part 5-6",
      "Đạt mức 500 điểm TOEIC",
    ],
    color: "orange",
  },
  {
    id: 3,
    name: "Chặng 3: Trung cấp",
    scoreRange: "500 - 649",
    description: "Nâng cao tốc độ và độ chính xác",
    goals: [
      "Hoàn thành 2000 từ vựng",
      "Luyện tất cả Part Listening (1-4)",
      "Luyện Part 7 - Reading dài",
      "Đạt mức 650 điểm TOEIC",
    ],
    color: "yellow",
  },
  {
    id: 4,
    name: "Chặng 4: Cao cấp",
    scoreRange: "650 - 799",
    description: "Làm chủ kỹ năng TOEIC",
    goals: [
      "Mở rộng từ vựng chuyên sâu",
      "Luyện tập toàn bộ 7 Part",
      "Làm bài thi thử định kỳ",
      "Đạt mức 800 điểm TOEIC",
    ],
    color: "blue",
  },
  {
    id: 5,
    name: "Chặng 5: Chuyên gia",
    scoreRange: "800 - 990",
    description: "Thành thạo TOEIC chuyên nghiệp",
    goals: [
      "Làm chủ toàn bộ ngữ pháp",
      "Tốc độ đọc > 200 từ/phút",
      "Độ chính xác > 90%",
      "Đạt mức 900+ điểm TOEIC",
    ],
    color: "green",
  },
];

export default function StageAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [placementScore, setPlacementScore] = useState<number | null>(null);
  const [recommendedStage, setRecommendedStage] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const score = urlParams.get("score");
    if (score) {
      setPlacementScore(parseInt(score));
      const stage = getStageFromScore(parseInt(score));
      setRecommendedStage(stage);
      setSelectedStage(stage);
    }
    setLoading(false);

    // Fetch user profile
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetch(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setProfile(data))
        .catch(() => {});
    }
  }, []);

  const getStageFromScore = (score: number): number => {
    if (score >= 800) return 5;
    if (score >= 650) return 4;
    if (score >= 500) return 3;
    if (score >= 300) return 2;
    return 1;
  };

  const handleAcceptStage = async () => {
    if (!selectedStage) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để tiếp tục");
      return;
    }

    try {
      const response = await fetch(`${API}/profile/accept-stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: selectedStage }),
      });

      if (response.ok) {
        router.push(`/onboarding/setup?score=${placementScore}`);
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error accepting stage:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleRequestStageChange = async () => {
    if (!selectedStage || !requestReason) {
      alert("Vui lòng chọn chặng và nhập lý do");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để tiếp tục");
      return;
    }

    try {
      const response = await fetch(`${API}/profile/request-stage-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestedStage: selectedStage,
          reason: requestReason,
        }),
      });

      if (response.ok) {
        alert("Đã gửi yêu cầu thay đổi chặng. Yêu cầu sẽ được xem xét trong 24h.");
        setShowRequestModal(false);
        setRequestReason("");
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error requesting stage change:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const calculateEstimatedTime = (targetScore: number, dailyTime: number) => {
    const currentScore = placementScore || 0;
    const scoreDiff = targetScore - currentScore;
    const pointsPerDay = dailyTime * 0.5;
    const daysNeeded = Math.ceil(scoreDiff / pointsPerDay);
    return daysNeeded;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-600/30 mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gán chặng học tập</h1>
          <p className="text-gray-400">
            Dựa trên kết quả bài test ({placementScore} điểm), chúng tôi đề xuất chặng phù hợp nhất cho bạn
          </p>
        </div>

        {/* Recommended Stage */}
        {recommendedStage && (
          <div className="bg-zinc-900/80 backdrop-blur border border-red-600/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center text-red-400 text-xl">
                ⭐
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Chặng đề xuất</h2>
                <p className="text-gray-400 text-sm">Chúng tôi đề xuất chặng này dựa trên kết quả bài test của bạn</p>
              </div>
            </div>
            <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{STAGES[recommendedStage - 1].name}</p>
                  <p className="text-gray-400 text-sm">{STAGES[recommendedStage - 1].description}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-lg">{STAGES[recommendedStage - 1].scoreRange}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Completion Time */}
        {profile && profile.currentScore && profile.targetScore && profile.dailyStudyTime && (
          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 text-xl">
                ⏱️
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Thời gian hoàn thành ước tính</h2>
                <p className="text-gray-400 text-sm">Dựa trên mục tiêu và thời gian học hàng ngày của bạn</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Mục tiêu</p>
                <p className="text-white font-semibold text-lg">{profile.targetScore} điểm</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Thời gian học</p>
                <p className="text-white font-semibold text-lg">{profile.dailyStudyTime} phút/ngày</p>
              </div>
            </div>
            <div className="mt-4 bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold">Ước tính thời gian</p>
                  <p className="text-gray-400 text-sm">Để đạt mục tiêu {profile.targetScore} điểm</p>
                </div>
                <p className="text-white font-bold text-2xl">
                  {calculateEstimatedTime(profile.targetScore, profile.dailyStudyTime)} ngày
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage Selection */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chọn chặng học tập</h2>
          <div className="space-y-3">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedStage === stage.id
                    ? `border-${stage.color}-600 bg-${stage.color}-600/10`
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg bg-${stage.color}-600/20 flex items-center justify-center text-${stage.color}-400`}>
                      {stage.id}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{stage.name}</p>
                      <p className="text-gray-400 text-sm">{stage.description}</p>
                    </div>
                  </div>
                  <span className={`text-${stage.color}-400 font-semibold`}>{stage.scoreRange}</span>
                </div>
                <div className="ml-11">
                  <ul className="text-gray-400 text-sm space-y-1">
                    {stage.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAcceptStage}
            disabled={!selectedStage}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/25"
          >
            Chấp nhận chặng đã chọn
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-6 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3.5 rounded-xl font-semibold transition-all"
          >
            Yêu cầu thay đổi
          </button>
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Yêu cầu thay đổi chặng</h2>
              <p className="text-gray-400 text-sm mb-4">
                Vui lòng chọn chặng bạn muốn và giải thích lý do thay đổi. Yêu cầu sẽ được xem xét trong 24h.
              </p>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Chặng mong muốn</label>
                <select
                  value={selectedStage || ""}
                  onChange={(e) => setSelectedStage(parseInt(e.target.value))}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.scoreRange})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Lý do thay đổi</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Giải thích lý do bạn muốn thay đổi chặng..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3 rounded-xl font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRequestStageChange}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
