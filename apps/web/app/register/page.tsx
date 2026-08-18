"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function register() {
    setError("");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    const res = await fetch(
      "http://localhost:3001/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    if (data.id) {
      router.push("/login");
    } else {
      setError(data.message || "Đăng ký thất bại");
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
        <h1 className="text-4xl font-bold text-center text-white">
          BELLA
        </h1>

        <p className="text-center text-zinc-400 mt-2 mb-8">
          Tạo tài khoản TOEIC
        </p>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Họ tên */}
        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && register()}
          className={`w-full p-4 rounded-xl bg-zinc-800 text-white border mb-6 focus:outline-none transition ${
            confirmPassword && confirmPassword !== password
              ? "border-red-500"
              : confirmPassword && confirmPassword === password
              ? "border-green-500"
              : "border-zinc-700 focus:border-red-500"
          }`}
        />

        {/* Button */}
        <button
          onClick={register}
          className="w-full bg-red-600 hover:bg-red-700 transition text-white font-bold py-4 rounded-xl"
        >
          Đăng ký
        </button>

        <p className="text-center text-zinc-400 mt-6">
          Đã có tài khoản?
          <a href="/login" className="text-red-500 ml-2">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}