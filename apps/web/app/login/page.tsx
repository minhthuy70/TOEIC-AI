"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function login() {

    const res = await fetch(
      "http://localhost:3001/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    localStorage.setItem(
      "userId",
      data.id
    );

    if (
      data.firstLoginCompleted
    ) {
      router.push(
        "/dashboard"
      );
    } else {
      router.push(
        "/onboarding"
      );
    }
  }

  return (
    <div className="p-10 flex flex-col gap-3">

      <h1>Đăng nhập</h1>

      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Mật khẩu"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        onClick={login}
        className="border p-2"
      >
        Đăng nhập
      </button>

    </div>
  );
}