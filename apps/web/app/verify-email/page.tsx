"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  async function verify() {
    if (code.length !== 6) {
      setError("Mã xác thực phải gồm 6 chữ số");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3001/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (
          data.user.role === "SUPER_ADMIN" ||
          data.user.role === "CONTENT_ADMIN"
        ) {
          router.push("/admin");
        } else if (!data.user.firstLoginCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Xác thực thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3001/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Đã gửi lại mã xác thực. Vui lòng kiểm tra email.");
      } else {
        setError(data.message || "Không thể gửi lại mã");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
          B
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center text-white">BELLA</h1>
      <p className="text-center text-zinc-400 mt-2 mb-8">
        Xác thực email tài khoản
      </p>

      {error && (
        <div className="w-full p-3 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-sm mb-4 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full p-3 rounded-xl bg-green-600/20 border border-green-600/40 text-green-400 text-sm mb-4 text-center">
          {success}
        </div>
      )}

      <p className="text-center text-zinc-300 mb-6 text-sm">
        Mã xác thực 6 số đã được gửi đến email:<br />
        <strong className="text-white">{email}</strong>
      </p>

      <input
        type="text"
        placeholder="Nhập mã 6 số"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full p-4 text-center text-2xl tracking-widest rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-6 focus:outline-none focus:border-red-500 font-mono"
      />

      <button
        onClick={verify}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 transition text-white font-bold py-4 rounded-xl mb-4"
      >
        {loading ? "Đang xác thực..." : "Xác thực"}
      </button>

      <div className="text-center">
        <button
          onClick={resendCode}
          disabled={resendLoading}
          className="text-zinc-400 hover:text-white transition text-sm disabled:opacity-50"
        >
          {resendLoading ? "Đang gửi lại..." : "Chưa nhận được mã? Gửi lại"}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <a href="/login" className="text-red-500 hover:text-red-400 transition text-sm">
          Quay lại trang Đăng nhập
        </a>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-white">Đang tải...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
