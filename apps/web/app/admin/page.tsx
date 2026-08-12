"use client";

import { useEffect, useState } from "react";

type User = {
  fullName: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-zinc-500 mt-2">
          Chào mừng trở lại,{" "}
          <span className="text-white">
            {user?.fullName}
          </span>
        </p>
      </div>

      {/* ROLE */}
      <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm text-zinc-500">
          Quyền hiện tại
        </p>

        <div className="mt-2">
          <span
            className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${
              user?.role === "SUPER_ADMIN"
                ? "bg-red-600/20 text-red-400"
                : "bg-blue-600/20 text-blue-400"
            }`}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon="👥"
          title="Người dùng"
          value="--"
        />

        <StatCard
          icon="📚"
          title="Từ vựng"
          value="--"
        />

        <StatCard
          icon="📖"
          title="Bài ngữ pháp"
          value="--"
        />

        <StatCard
          icon="📝"
          title="Đề thi"
          value="--"
        />
      </div>

      {/* MODULES */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          Quản lý nội dung
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <ModuleCard
            icon="📚"
            title="Từ vựng"
            description="Quản lý kho từ vựng TOEIC"
          />

          <ModuleCard
            icon="📖"
            title="Ngữ pháp"
            description="Quản lý danh mục và bài học"
          />

          <ModuleCard
            icon="🎧"
            title="Listening"
            description="Quản lý bài nghe và câu hỏi"
          />

          <ModuleCard
            icon="📕"
            title="Reading"
            description="Quản lý bài đọc và câu hỏi"
          />

          <ModuleCard
            icon="📝"
            title="Đề thi"
            description="Quản lý đề và bộ câu hỏi"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="text-2xl">
        {icon}
      </div>

      <p className="text-zinc-500 text-sm mt-4">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition cursor-pointer">
      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="font-bold text-lg mt-4">
        {title}
      </h3>

      <p className="text-sm text-zinc-500 mt-1">
        {description}
      </p>
    </div>
  );
}