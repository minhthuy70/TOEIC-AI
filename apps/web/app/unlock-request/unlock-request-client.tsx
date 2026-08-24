"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnlockRequestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [userEmail, setUserEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRequestUnlock() {
    if (!userEmail.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/request-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Gửi yêu cầu thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
            B
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Yêu cầu mở khóa
        </h1>

        <p className="text-center text-zinc-400 mb-8">
          Tài khoản của bạn đã bị khóa vĩnh viễn. Gửi yêu cầu để được hỗ trợ.
        </p>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="w-full p-4 rounded-xl bg-green-600/20 border border-green-600/40 text-green-400 text-sm mb-4">
            <div className="font-semibold mb-2">Yêu cầu đã được gửi!</div>
            <div className="text-xs">
              Chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ làm việc.
              Vui lòng kiểm tra email để nhận thông báo cập nhật.
            </div>
          </div>
        )}

        {!success && (
          <>
            {/* Email input */}
            <input
              type="email"
              placeholder="Email của bạn"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
            />

            {/* Info box */}
            <div className="w-full p-4 rounded-xl bg-orange-600/10 border border-orange-600/30 text-orange-400 text-sm mb-6">
              <div className="font-semibold mb-2">Thông tin:</div>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Yêu cầu sẽ được xử lý trong 24-48 giờ</li>
                <li>Bạn sẽ nhận email xác nhận khi có kết quả</li>
                <li>Liên hệ support@bella-ai.com nếu cần hỗ trợ khẩn cấp</li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              onClick={handleRequestUnlock}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 transition text-white font-bold py-4 rounded-xl"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu mở khóa"}
            </button>
          </>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-zinc-400 hover:text-red-500 transition text-sm"
          >
            ← Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
