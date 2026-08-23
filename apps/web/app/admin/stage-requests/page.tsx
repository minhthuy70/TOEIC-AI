"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function StageRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "APPLIED">("PENDING");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/profile/stage-change-requests${filter !== "ALL" ? `?status=${filter}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: any) => {
    setSelectedRequest(request);
    setReviewComment(request.adminComment || "");
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`${API}/profile/review-stage-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: "APPROVED",
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        alert("Đã phê duyệt yêu cầu");
        setShowReviewModal(false);
        fetchRequests();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`${API}/profile/review-stage-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: "REJECTED",
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        alert("Đã từ chối yêu cầu");
        setShowReviewModal(false);
        fetchRequests();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleApply = async (requestId: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!confirm("Bạn có chắc muốn áp dụng thay đổi chặng này?")) return;

    try {
      const response = await fetch(`${API}/profile/apply-stage-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        alert("Đã áp dụng thay đổi chặng thành công");
        fetchRequests();
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error applying stage change:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "APPROVED":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      case "REJECTED":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      case "APPLIED":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      default:
        return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xét duyệt";
      case "APPROVED":
        return "Đã phê duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "APPLIED":
        return "Đã áp dụng";
      default:
        return status;
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Yêu cầu thay đổi chặng</h1>
          <p className="text-gray-400">Quản lý và phê duyệt yêu cầu thay đổi chặng học tập</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "APPLIED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-gray-400 hover:text-white border border-zinc-800"
              }`}
            >
              {status === "ALL" ? "Tất cả" : getStatusText(status)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400">Không có yêu cầu nào</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center text-red-400 text-xl">
                      👤
                    </div>
                    <div>
                      <p className="text-white font-semibold">{request.user.fullName}</p>
                      <p className="text-gray-400 text-sm">{request.user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chặng hiện tại</p>
                    <p className="text-white font-semibold text-lg">Chặng {request.currentStage}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chặng mong muốn</p>
                    <p className="text-white font-semibold text-lg">Chặng {request.requestedStage}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ngày yêu cầu</p>
                    <p className="text-white font-semibold text-lg">
                      {new Date(request.requestedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {request.reason && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Lý do</p>
                    <p className="text-gray-300">{request.reason}</p>
                  </div>
                )}

                {request.adminComment && (
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 mb-4">
                    <p className="text-blue-400 text-xs uppercase tracking-wider mb-2">Nhận xét Admin</p>
                    <p className="text-gray-300">{request.adminComment}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {request.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleReview(request)}
                        className="px-4 py-2 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 rounded-lg text-sm font-medium transition-all"
                      >
                        Xem xét
                      </button>
                    </>
                  )}
                  {request.status === "APPROVED" && (
                    <button
                      onClick={() => handleApply(request.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Áp dụng thay đổi
                    </button>
                  )}
                  {request.reviewedAt && (
                    <p className="text-gray-500 text-sm ml-auto">
                      Đã xem xét: {new Date(request.reviewedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Xem xét yêu cầu</h2>
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Người dùng</p>
                <p className="text-white font-semibold">{selectedRequest.user.fullName}</p>
                <p className="text-gray-500 text-sm">{selectedRequest.user.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Từ chặng</p>
                  <p className="text-white font-semibold">Chặng {selectedRequest.currentStage}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Đến chặng</p>
                  <p className="text-white font-semibold">Chặng {selectedRequest.requestedStage}</p>
                </div>
              </div>
              {selectedRequest.reason && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Lý do</p>
                  <p className="text-gray-300 bg-zinc-800/50 rounded-xl p-4">{selectedRequest.reason}</p>
                </div>
              )}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Nhận xét (tùy chọn)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập nhận xét của bạn..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white min-h-[80px]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 py-3 rounded-xl font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Từ chối
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Phê duyệt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
