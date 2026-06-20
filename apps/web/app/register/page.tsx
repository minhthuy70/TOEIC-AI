"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function register() {

    const res = await fetch(
      "http://localhost:3001/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    alert(JSON.stringify(data));
  }

  return (
    <div className="p-10 flex flex-col gap-3">

      <h1>Đăng ký</h1>

      <input
        className="border p-2"
        placeholder="Họ tên"
        onChange={(e) =>
          setFullName(e.target.value)
        }
      />

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
        onClick={register}
        className="border p-2"
      >
        Đăng ký
      </button>

    </div>
  );
}