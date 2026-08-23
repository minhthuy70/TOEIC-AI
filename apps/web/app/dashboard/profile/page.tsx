"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "info", label: "Thông tin cá nhân", icon: "👤" },
  { id: "goal", label: "Mục tiêu TOEIC", icon: "🎯" },
  { id: "password", label: "Đổi mật khẩu", icon: "🔒" },
  { id: "settings", label: "Cài đặt", icon: "⚙️" },
  { id: "account", label: "Quản lý tài khoản", icon: "🔐" },
];

const TARGET_OPTIONS = [400, 500, 600, 700, 750, 800, 850, 900, 950, 990];
const STUDY_TIME_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState<{
id?: number;
fullName?: string;
email?: string;

avatar?: string;
phone?: string;
birthday?: string;
gender?: string;
address?: string;
bio?: string;
createdAt?: string;
lastLoginAt?: string;

currentScore?: number;
targetScore?: number;
examDate?: string;
dailyStudyTime?: number;

} | null>(null);

const [fullName, setFullName] = useState("");

const [currentScore, setCurrentScore] = useState(0);
const [targetScore, setTargetScore] = useState(600);
const [examDate, setExamDate] = useState("");

const [dailyStudyTime, setDailyStudyTime] = useState(30);
  const [phone, setPhone] = useState("");
const [birthday, setBirthday] = useState("");
const [gender, setGender] = useState("");
const [address, setAddress] = useState("");
const [bio, setBio] = useState("");
const [avatarFile, setAvatarFile] = useState<File | null>(null);
const [avatarPreview, setAvatarPreview] = useState<string>("");
const [uploadingAvatar, setUploadingAvatar] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showDeactivateModal, setShowDeactivateModal] = useState(false);
const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
const [deletePassword, setDeletePassword] = useState("");
const [isDeleting, setIsDeleting] = useState(false);
const [isDeactivating, setIsDeactivating] = useState(false);
const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
const [sessions, setSessions] = useState<any[]>([]);
const [showSessions, setShowSessions] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [studyNotification, setStudyNotification] = useState(true);

const [srsNotification, setSrsNotification] = useState(true);

const [autoPronunciation, setAutoPronunciation] = useState(false);

const [darkMode, setDarkMode] = useState(true);

 useEffect(() => {
  loadProfile();
}, []);
async function loadProfile() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    router.push("/login");
    return;
  }

  const res = await fetch(
    "http://localhost:3001/profile/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    router.push("/login");
    return;
  }

  const data = await res.json();
console.log("Profile API:", data);
  setUser(data);
  console.log("Current user state:", data);

setFullName(data.fullName || "");


setCurrentScore(
  data.currentScore || 0
);


setTargetScore(
  data.targetScore || 600
);


setExamDate(
  data.examDate
    ? data.examDate.substring(0,10)
    : ""
);


setDailyStudyTime(
  data.dailyStudyTime || 30
);
setPhone(data.phone || "");

setBirthday(
  data.birthday
    ? data.birthday.substring(0,10)
    : ""
);

setGender(data.gender || "");

setAddress(data.address || "");

setBio(data.bio || "");

setStudyNotification(
data.studyNotification ?? true
);

setSrsNotification(
data.srsNotification ?? true
);

setAutoPronunciation(
data.autoPronunciation ?? false
);

setDarkMode(
data.darkMode ?? true
);

if (data.avatar) {
  setAvatarPreview(data.avatar);
}

}
  const showSaved = (msg = "Đã lưu thành công!") => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveInfo = async () => {

const token = localStorage.getItem("accessToken");


const res = await fetch(
"http://localhost:3001/profile/me",
{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`,
},
body:JSON.stringify({
fullName,
phone,
birthday,
gender,
address,
bio,
})
}
);


if(res.ok){

const profileRes = await fetch(
"http://localhost:3001/profile/me",
{
headers:{
Authorization:`Bearer ${token}`,
}
}
);

const profile = await profileRes.json();

setUser(profile);

showSaved("Đã cập nhật thông tin!");

}

};

  const saveGoal = async () => {

const token = localStorage.getItem(
"accessToken"
);


const res = await fetch(
"http://localhost:3001/profile/me",
{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`,
},


body:JSON.stringify({

currentScore,

targetScore,

examDate,

dailyStudyTime,

})

}
);



if(res.ok){

const profileRes = await fetch(
"http://localhost:3001/profile/me",
{
headers:{
Authorization:`Bearer ${token}`,
}
}
);


const profile =
await profileRes.json();


setUser(profile);

// Update localStorage with currentScore and targetScore
const localStorageUser = JSON.parse(localStorage.getItem("user") || "{}");
const updatedUser = {
  ...localStorageUser,
  currentScore: profile.currentScore,
  targetScore: profile.targetScore,
};
localStorage.setItem("user", JSON.stringify(updatedUser));


showSaved(
"Đã cập nhật mục tiêu TOEIC!"
);


}

};

  const savePassword = async () => {

  if (
    !oldPassword ||
    !newPassword ||
    !confirmPassword
  ) {

    setSaveMsg(
      "Vui lòng điền đầy đủ thông tin."
    );

    return;

  }

  if (
    newPassword !== confirmPassword
  ) {

    setSaveMsg(
      "Mật khẩu xác nhận không khớp."
    );

    return;

  }
  if (oldPassword === newPassword) {

  setSaveMsg(
    "Mật khẩu mới phải khác mật khẩu cũ."
  );

  return;

}

  if (newPassword.length < 6) {

    setSaveMsg(
      "Mật khẩu phải có ít nhất 6 ký tự."
    );

    return;

  }
  const regex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

if (!regex.test(newPassword)) {

  setSaveMsg(
    "Mật khẩu phải có chữ hoa, chữ thường và số."
  );

  return;

}

  const token =
    localStorage.getItem(
      "accessToken"
    );

  const res =
    await fetch(

      "http://localhost:3001/profile/change-password",

      {

        method: "PUT",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

        },

        body: JSON.stringify({

          oldPassword,

          newPassword,

        }),

      }

    );

  const data =
    await res.json();

  if (!res.ok) {

    setSaveMsg(
      data.message ||
      "Đổi mật khẩu thất bại"
    );

    return;

  }

  setOldPassword("");

  setNewPassword("");

  setConfirmPassword("");

  showSaved(
    "Đổi mật khẩu thành công!"
  );

};
const saveSettings = async () => {

const token =
localStorage.getItem("accessToken");

const res =
await fetch(
"http://localhost:3001/profile/me",
{

method:"PUT",

headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
},

body:JSON.stringify({

studyNotification,

srsNotification,

autoPronunciation,

darkMode

})

}

);

if(res.ok){

showSaved("Đã lưu cài đặt!");

}

}

const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSaveMsg("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSaveMsg("Kích thước file không được vượt quá 5MB");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }
};

const uploadAvatar = async () => {
  if (!avatarFile) {
    setSaveMsg("Vui lòng chọn ảnh trước");
    setTimeout(() => setSaveMsg(""), 3000);
    return;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    router.push("/login");
    return;
  }

  setUploadingAvatar(true);
  setSaveMsg("");

  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const res = await fetch("http://localhost:3001/profile/upload-avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Tải lên thất bại");
    }

    // Update user state and localStorage
    setUser((prev) => ({ ...prev, avatar: data.avatarUrl }));
    const localStorageUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...localStorageUser, avatarUrl: data.avatarUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    showSaved("Đã tải lên avatar thành công!");
    setAvatarFile(null);
  } catch (error) {
    setSaveMsg(error instanceof Error ? error.message : "Tải lên thất bại");
    setTimeout(() => setSaveMsg(""), 3000);
  } finally {
    setUploadingAvatar(false);
  }
};

const handleDeactivateAccount = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    router.push("/login");
    return;
  }

  setIsDeactivating(true);
  setSaveMsg("");

  try {
    const res = await fetch("http://localhost:3001/profile/deactivate-account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Vô hiệu hóa thất bại");
    }

    // Clear local storage and redirect to login
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    router.push("/login");
  } catch (error) {
    setSaveMsg(error instanceof Error ? error.message : "Vô hiệu hóa thất bại");
    setTimeout(() => setSaveMsg(""), 3000);
  } finally {
    setIsDeactivating(false);
    setShowDeactivateModal(false);
  }
};

const handleDeleteAccount = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    router.push("/login");
    return;
  }

  setIsDeleting(true);
  setSaveMsg("");

  try {
    const res = await fetch("http://localhost:3001/profile/delete-account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: deletePassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Xóa tài khoản thất bại");
    }

    // Clear local storage and redirect to login
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    router.push("/login");
  } catch (error) {
    setSaveMsg(error instanceof Error ? error.message : "Xóa tài khoản thất bại");
    setTimeout(() => setSaveMsg(""), 3000);
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeletePassword("");
  }
};
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  const loadSessions = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/auth/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleLogoutAll = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoggingOutAll(true);
    setSaveMsg("");

    try {
      const res = await fetch("http://localhost:3001/auth/logout-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng xuất thất bại");
      }

      // Clear local storage and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      router.push("/login");
    } catch (error) {
      setSaveMsg(error instanceof Error ? error.message : "Đăng xuất thất bại");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setIsLoggingOutAll(false);
      setShowLogoutAllModal(false);
    }
  };

  const currentStage = (() => {
    const score = user?.currentScore ?? 0;
    if (score >= 800) return { id: 5, label: "Chặng 5 – Hoàn thiện" };
    if (score >= 650) return { id: 4, label: "Chặng 4 – Nâng cao" };
    if (score >= 500) return { id: 3, label: "Chặng 3 – Trung bình khá" };
    if (score >= 300) return { id: 2, label: "Chặng 2 – Củng cố" };
    return { id: 1, label: "Chặng 1 – Nền tảng" };
  })();
  const SETTINGS = [
  {
    label: "Thông báo học tập",
    desc: "Nhắc nhở học mỗi ngày",
    value: studyNotification,
    setValue: setStudyNotification,
  },
  {
    label: "Thông báo SRS",
    desc: "Nhắc ôn tập từ vựng theo lịch",
    value: srsNotification,
    setValue: setSrsNotification,
  },
  {
    label: "Âm thanh phát âm",
    desc: "Phát âm khi học flashcard",
    value: autoPronunciation,
    setValue: setAutoPronunciation,
  },
  {
    label: "Dark mode",
    desc: "Giao diện tối (mặc định)",
    value: darkMode,
    setValue: setDarkMode,
  },
];
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">👤 Hồ sơ cá nhân</h1>
        <p className="text-zinc-400 text-sm mt-1">Quản lý thông tin và cài đặt tài khoản</p>
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-red-600/20 overflow-hidden">
            {avatarPreview || user?.avatarUrl || user?.avatar ? (
              <img
                src={avatarPreview || `http://localhost:3001${user?.avatarUrl || user?.avatar || ""}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-lg">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{user?.fullName || "User"}</h2>
          <p className="text-[13px] text-zinc-400 truncate">{user?.email || ""}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] bg-red-600/15 text-red-400 border border-red-600/20 px-2.5 py-0.5 rounded-full font-medium">
              {currentStage.label}
            </span>
            <span className="text-[11px] text-zinc-500">
              Điểm: <span className="text-white font-semibold">{user?.currentScore ?? "—"}</span>
            </span>
            <span className="text-[11px] text-zinc-500">
              Mục tiêu: <span className="text-green-400 font-semibold">{user?.targetScore ?? "—"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Upload Preview */}
      {avatarPreview && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4">
          <img
            src={avatarPreview}
            alt="Preview"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Ảnh mới đã chọn</p>
            <p className="text-xs text-zinc-500">{avatarFile?.name}</p>
          </div>
          <button
            onClick={uploadAvatar}
            disabled={uploadingAvatar}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {uploadingAvatar ? "Đang tải..." : "Tải lên"}
          </button>
          <button
            onClick={() => {
              setAvatarFile(null);
              setAvatarPreview("");
            }}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-xl text-sm transition-colors"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Toast */}
      {saveMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium transition-all ${
          saveMsg.includes("không khớp") || saveMsg.includes("Vui lòng") || saveMsg.includes("ít nhất")
            ? "bg-red-600/15 border-red-600/25 text-red-300"
            : "bg-green-600/15 border-green-600/25 text-green-300"
        }`}>
          {saveMsg.includes("không khớp") || saveMsg.includes("Vui lòng") || saveMsg.includes("ít nhất")
            ? "❌"
            : "✅"
          } {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {activeTab === "info" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Thông tin cá nhân</h3>

          {/* Account Info */}
          <div className="bg-black/30 border border-zinc-800/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-500">Ngày tạo tài khoản</span>
              <span className="text-[11px] text-zinc-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-500">Đăng nhập gần nhất</span>
              <span className="text-[11px] text-zinc-300">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="w-full bg-zinc-800/60 border border-zinc-700/60 focus:border-red-600/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-[13px] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-zinc-800/30 border border-zinc-800/50 text-zinc-500 rounded-xl px-4 py-3 text-[13px] outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-zinc-600 mt-1.5">Email không thể thay đổi</p>
          </div>
          <div>
<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Số điện thoại
</label>

<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
placeholder="Nhập số điện thoại"
className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3 text-[13px]"
/>

</div>


<div>
<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Ngày sinh
</label>

<input
type="date"
value={birthday}
onChange={(e)=>setBirthday(e.target.value)}
className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3 text-[13px]"
/>

</div>


<div>
<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Giới tính
</label>

<select
value={gender}
onChange={(e)=>setGender(e.target.value)}
className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3"
>

<option value="">Chọn giới tính</option>
<option value="male">Nam</option>
<option value="female">Nữ</option>
<option value="other">Khác</option>

</select>

</div>


<div>
<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Địa chỉ
</label>

<input
value={address}
onChange={(e)=>setAddress(e.target.value)}
placeholder="Nhập địa chỉ"
className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3"
/>

</div>


<div>
<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Giới thiệu
</label>

<textarea
value={bio}
onChange={(e)=>setBio(e.target.value)}
rows={3}
placeholder="Viết vài dòng về bạn..."
className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3"
/>

</div>
          <button
            onClick={saveInfo}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Lưu thay đổi
          </button>
        </div>
      )}

      {/* ── Goal ── */}
      {activeTab === "goal" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Mục tiêu TOEIC</h3>
  {/* Preview */}
          <div className="bg-black/30 border border-zinc-800/40 rounded-xl p-4">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Xem trước</p>
         
              <p className="text-[13px] text-zinc-300">

Hiện tại:
<span className="text-yellow-400 font-bold">
{" "}
{currentScore} điểm
</span>

{" → "}

Mục tiêu:
<span className="text-green-400 font-bold">
{" "}
{targetScore} điểm
</span>

</p>


<p className="text-[13px] text-zinc-300 mt-2">

Lịch học:
<span className="text-red-400 font-bold">
{" "}
{dailyStudyTime} phút/ngày
</span>

</p>
          </div>
          <div><label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Điểm TOEIC hiện tại
</label>


<input

type="number"

value={currentScore}

onChange={(e)=>
setCurrentScore(
Number(e.target.value)
)
}

placeholder="Ví dụ: 450"

className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3 text-[13px]"

 />

</div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-3">
              Mục tiêu điểm TOEIC
            </label>
            <div>


            <div className="grid grid-cols-5 gap-2">
              {TARGET_OPTIONS.map((score) => (
                <button
                  key={score}
                  onClick={() => setTargetScore(score)}
                  className={`py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                    targetScore === score
                      ? "bg-red-600 border-red-500 text-white shadow-sm shadow-red-600/20"
                      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-3">
              Thời gian học mỗi ngày
            </label>
            <div className="flex gap-2 flex-wrap">
              {STUDY_TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setDailyStudyTime(t)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                    dailyStudyTime === t
                      ? "bg-red-600 border-red-500 text-white shadow-sm"
                      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {t} phút
                </button>
              ))}
            </div>
          </div>

        
          <div>

<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
Ngày dự thi TOEIC
</label>


<input

type="date"

value={examDate}

onChange={(e)=>
setExamDate(e.target.value)
}

className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white rounded-xl px-4 py-3 text-[13px]"

/>

</div>

          <button
            onClick={saveGoal}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Lưu mục tiêu
          </button>
        </div>
      )}

      {/* ── Password ── */}
      {activeTab === "password" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Đổi mật khẩu</h3>
          {[
            { label: "Mật khẩu hiện tại", value: oldPassword, onChange: setOldPassword },
            { label: "Mật khẩu mới", value: newPassword, onChange: setNewPassword },
            { label: "Xác nhận mật khẩu mới", value: confirmPassword, onChange: setConfirmPassword },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
                {field.label}
              </label>
              <input
                type="password"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 focus:border-red-600/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-[13px] outline-none transition-all"
              />
            </div>
          ))}
          <div className="bg-zinc-900/40 border border-zinc-800/30 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500">
              Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
            </p>
          </div>
          <button
            onClick={savePassword}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Đổi mật khẩu
          </button>
        </div>
      )}

      {/* ── Settings ── */}
      {activeTab === "settings" && (
        <div className="space-y-3">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 space-y-1">
            <h3 className="text-sm font-semibold text-white mb-4">Cài đặt tài khoản</h3>
            {SETTINGS.map((setting, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/30 last:border-0">
                <div>
                  <p className="text-[13px] text-white font-medium">{setting.label}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{setting.desc}</p>
                </div>
<div
  onClick={() => setting.setValue(!setting.value)}
  className={`w-11 h-6 rounded-full border cursor-pointer transition-all ${
    setting.value
      ? "bg-red-600 border-red-500"
      : "bg-zinc-800 border-zinc-700"
  }`}
>
<div
  className={`w-4 h-4 rounded-full bg-white shadow-sm m-0.5 transition-all ${
    setting.value
      ? "translate-x-5"
      : "translate-x-0"
  }`}
/>
                </div>
              </div>
            ))}
          </div>
<button
  onClick={saveSettings}
  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
>
  Lưu cài đặt
</button>
        </div>
      )}

      {/* ── Account Management ── */}
      {activeTab === "account" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Quản lý tài khoản</h3>

            {/* Active Sessions */}
            <div className="bg-blue-600/5 border border-blue-600/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Phiên đăng nhập</h4>
                  <p className="text-xs text-zinc-400 mb-3">Quản lý các thiết bị đang đăng nhập vào tài khoản của bạn.</p>
                  <button
                    onClick={() => {
                      setShowSessions(!showSessions);
                      if (!showSessions) loadSessions();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    {showSessions ? "Ẩn danh sách" : "Xem phiên đăng nhập"}
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              {showSessions && (
                <div className="mt-4 space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Không có phiên đăng nhập nào</p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          session.isCurrent
                            ? "bg-green-600/10 border-green-600/20"
                            : "bg-zinc-800/30 border-zinc-700/30"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white font-medium">
                              {session.isCurrent ? "Thiết bị hiện tại" : "Thiết bị khác"}
                            </span>
                            {session.isCurrent && (
                              <span className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            {session.userAgent?.substring(0, 50) || "Unknown"}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            Đăng nhập: {session.createdAt ? new Date(session.createdAt).toLocaleString('vi-VN') : '—'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Logout All Devices */}
            <div className="bg-purple-600/5 border border-purple-600/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Đăng xuất khỏi tất cả thiết bị</h4>
                  <p className="text-xs text-zinc-400 mb-3">Đăng xuất khỏi tất cả các thiết bị đang đăng nhập vào tài khoản của bạn.</p>
                  <button
                    onClick={() => setShowLogoutAllModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Đăng xuất tất cả
                  </button>
                </div>
              </div>
            </div>

            {/* Deactivate Account */}
            <div className="bg-orange-600/5 border border-orange-600/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 0A9 9 0 015.636 5.636m12.728 12.728A9 9 0 015.636 5.636m0 12.728A9 9 0 0018.364 5.636M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Vô hiệu hóa tài khoản</h4>
                  <p className="text-xs text-zinc-400 mb-3">Tạm thời vô hiệu hóa tài khoản. Bạn có thể kích hoạt lại bằng cách liên hệ hỗ trợ.</p>
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Vô hiệu hóa
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-red-600/5 border border-red-600/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Xóa tài khoản</h4>
                  <p className="text-xs text-zinc-400 mb-3">Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-600/25 text-red-400 hover:bg-red-600/10 transition-all text-[13px] font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Vô hiệu hóa tài khoản</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Bạn có chắc muốn vô hiệu hóa tài khoản? Tài khoản sẽ bị khóa và bạn không thể đăng nhập cho đến khi liên hệ hỗ trợ để kích hoạt lại.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {isDeactivating ? "Đang xử lý..." : "Vô hiệu hóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Xóa tài khoản</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
            </p>
            {user?.password && (
              <div className="mb-4">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium block mb-2">
                  Nhập mật khẩu để xác nhận
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || (user?.password && !deletePassword)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout All Modal */}
      {showLogoutAllModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Đăng xuất khỏi tất cả thiết bị</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Bạn có chắc muốn đăng xuất khỏi tất cả các thiết bị đang đăng nhập vào tài khoản của mình? Bạn sẽ cần đăng nhập lại trên mỗi thiết bị.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutAllModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLogoutAll}
                disabled={isLoggingOutAll}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {isLoggingOutAll ? "Đang xử lý..." : "Đăng xuất tất cả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
