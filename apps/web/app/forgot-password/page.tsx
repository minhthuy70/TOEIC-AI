"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email) return;
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Vui lòng kiểm tra email của bạn.");
    } catch (error) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
            B
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Quên mật khẩu
        </h1>

        <p className="text-center text-zinc-400 mb-8">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-6 focus:outline-none focus:border-red-500"
        />

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-center text-zinc-300">
            {message}
          </div>
        )}

        <button
          onClick={handleForgotPassword}
          disabled={isLoading || !email}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white font-bold py-4 rounded-xl mb-6"
        >
          {isLoading ? "Đang gửi..." : "Gửi liên kết"}
        </button>

        <p className="text-center text-zinc-400">
          Nhớ mật khẩu?
          <a href="/login" className="text-red-500 ml-2 hover:text-red-400">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
