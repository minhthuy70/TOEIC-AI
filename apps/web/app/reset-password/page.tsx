"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token || !emailParam) {
      setMessage("Liên kết không hợp lệ hoặc đã thiếu tham số.");
    }
  }, [token, emailParam]);

  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          email: emailParam, 
          newPassword 
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
        setMessage("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setMessage(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      setMessage("Có lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <p className="text-center text-zinc-400 mb-8">
        Vui lòng nhập mật khẩu mới của bạn.
      </p>

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={!token || !emailParam || isSuccess}
        className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
      />

      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={!token || !emailParam || isSuccess}
        className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-6 focus:outline-none focus:border-red-500"
      />

      {message && (
        <div className={`mb-6 p-4 rounded-xl border text-center ${isSuccess ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
          {message}
        </div>
      )}

      <button
        onClick={handleResetPassword}
        disabled={isLoading || !token || !emailParam || isSuccess}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white font-bold py-4 rounded-xl mb-6"
      >
        {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
      
      <p className="text-center text-zinc-400">
        <a href="/login" className="text-red-500 hover:text-red-400">
          Quay lại đăng nhập
        </a>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
            B
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Đặt lại mật khẩu
        </h1>

        <Suspense fallback={<p className="text-center text-zinc-400">Đang tải...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
