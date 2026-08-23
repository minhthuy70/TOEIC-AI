"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "CONTENT_ADMIN" | "SUPER_ADMIN";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
  isLocked: boolean;
  isPermanentlyLocked: boolean;
  lockedUntil: string | null;
  unlockRequestSent: boolean;
  profile: {
    currentScore: number | null;
    targetScore: number | null;
  } | null;
};

const API_URL = "http://localhost:3001";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      setCurrentUserId(user.id);

      if (user.role !== "SUPER_ADMIN") {
        router.push("/admin");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    loadUsers(token);
  }, [router]);

  async function loadUsers(token: string) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          router.push("/admin");
          return;
        }

        throw new Error(
          "Không thể tải danh sách người dùng"
        );
      }

      const data = await res.json();

      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(
        "Không thể tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(
    userId: number,
    role: Role
  ) {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userId === currentUserId) {
      alert(
        "Bạn không thể tự thay đổi quyền của chính mình."
      );
      return;
    }

    try {
      setUpdatingId(userId);

      const res = await fetch(
        `${API_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể cập nhật quyền"
        );
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật quyền"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function unlockUser(userId: number, email: string) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!confirm(`Bạn có chắc muốn mở khóa tài khoản ${email}?`)) {
      return;
    }

    try {
      setUnlockingId(userId);

      const res = await fetch(
        `${API_URL}/auth/unlock-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể mở khóa tài khoản"
        );
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isLocked: false,
                isPermanentlyLocked: false,
                lockedUntil: null,
                unlockRequestSent: false,
              }
            : user
        )
      );

      alert("Tài khoản đã được mở khóa thành công!");
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Không thể mở khóa tài khoản"
      );
    } finally {
      setUnlockingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword)
    );
  }, [users, search]);

  function getRoleLabel(role: Role) {
    switch (role) {
      case "SUPER_ADMIN":
        return "SUPER ADMIN";

      case "CONTENT_ADMIN":
        return "CONTENT ADMIN";

      default:
        return "USER";
    }
  }

  function getRoleClass(role: Role) {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      case "CONTENT_ADMIN":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "vi-VN"
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Quản lý người dùng
            </h1>

            <p className="text-zinc-400 mt-2">
              Quản lý tài khoản và phân quyền
              trong hệ thống BELLA.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
            <p className="text-sm text-zinc-400">
              Tổng tài khoản
            </p>

            <p className="text-2xl font-bold mt-1">
              {users.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-red-500 transition"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">
              Đang tải danh sách người dùng...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              Không tìm thấy người dùng.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Người dùng
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Điểm hiện tại
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Mục tiêu
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Quyền
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Trạng thái
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => {
                      const isCurrentUser =
                        user.id === currentUserId;

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition"
                        >
                          {/* ID */}
                          <td className="px-6 py-5 text-zinc-400">
                            #{user.id}
                          </td>

                          {/* User */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-600/15 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">
                                {user.fullName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  {user.fullName}
                                </p>

                                {isCurrentUser && (
                                  <span className="text-xs text-red-400">
                                    Tài khoản hiện tại
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-5 text-zinc-300">
                            {user.email}
                          </td>

                          {/* Current score */}
                          <td className="px-6 py-5">
                            {user.profile
                              ?.currentScore ??
                              "—"}
                          </td>

                          {/* Target score */}
                          <td className="px-6 py-5">
                            {user.profile
                              ?.targetScore ??
                              "—"}
                          </td>

                          {/* Role */}
                          <td className="px-6 py-5">
                            {isCurrentUser ? (
                              <div>
                                <span
                                  className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRoleClass(
                                    user.role
                                  )}`}
                                >
                                  {getRoleLabel(
                                    user.role
                                  )}
                                </span>

                                <p className="text-xs text-zinc-500 mt-1">
                                  Không thể tự đổi
                                </p>
                              </div>
                            ) : (
                              <select
                                value={user.role}
                                disabled={
                                  updatingId ===
                                  user.id
                                }
                                onChange={(e) =>
                                  updateRole(
                                    user.id,
                                    e.target
                                      .value as Role
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none cursor-pointer bg-zinc-900 ${getRoleClass(
                                  user.role
                                )}`}
                              >
                                <option value="USER">
                                  USER
                                </option>

                                <option value="CONTENT_ADMIN">
                                  CONTENT ADMIN
                                </option>

                                <option value="SUPER_ADMIN">
                                  SUPER_ADMIN
                                </option>
                              </select>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            {user.isPermanentlyLocked ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold bg-red-500/10 text-red-400 border-red-500/30">
                                  Khóa vĩnh viễn
                                </span>
                                {!isCurrentUser && (
                                  <button
                                    onClick={() => unlockUser(user.id, user.email)}
                                    disabled={unlockingId === user.id}
                                    className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition"
                                  >
                                    {unlockingId === user.id ? "Đang mở..." : "Mở khóa"}
                                  </button>
                                )}
                              </div>
                            ) : user.isLocked ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold bg-orange-500/10 text-orange-400 border-orange-500/30">
                                  Khóa tạm
                                </span>
                                {user.lockedUntil && (
                                  <span className="text-xs text-zinc-500">
                                    {new Date(user.lockedUntil).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            ) : user.unlockRequestSent ? (
                              <span className="inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                Đang chờ
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold bg-green-500/10 text-green-400 border-green-500/30">
                                Hoạt động
                              </span>
                            )}
                          </td>

                          {/* Created */}
                          <td className="px-6 py-5 text-zinc-400">
                            {formatDate(
                              user.createdAt
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="mt-4 text-sm text-zinc-500">
            Hiển thị{" "}
            <span className="text-zinc-300">
              {filteredUsers.length}
            </span>{" "}
            /{" "}
            <span className="text-zinc-300">
              {users.length}
            </span>{" "}
            tài khoản
          </div>
        )}
      </div>
    </div>
  );
}