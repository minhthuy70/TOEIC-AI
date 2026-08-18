"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<SettingsMap>("/settings");
      setSettings(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Không thể tải cài đặt' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      setMessage({ type: 'success', text: 'Lưu cài đặt thành công!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Lỗi khi lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cài đặt Hệ thống
          </h1>
          <p className="text-zinc-400">
            Quản lý các cấu hình chung của nền tảng TOEIC AI
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-red-600/20 text-red-400 border border-red-600/30'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Hệ thống */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚙️</span> Hệ thống
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Bảo trì hệ thống
              </label>
              <select 
                value={settings.MAINTENANCE_MODE || 'false'}
                onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="false">Tắt (Hoạt động bình thường)</option>
                <option value="true">Bật (Bảo trì)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Cho phép đăng ký mới
              </label>
              <select 
                value={settings.ALLOW_REGISTRATION || 'true'}
                onChange={(e) => handleChange('ALLOW_REGISTRATION', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="true">Cho phép</option>
                <option value="false">Khóa đăng ký</option>
              </select>
            </div>
          </div>
        </div>

        {/* Học tập */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📚</span> Học tập
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Mục tiêu điểm TOEIC mặc định (cho người dùng mới)
              </label>
              <input 
                type="number"
                value={settings.DEFAULT_TARGET_SCORE || '500'}
                onChange={(e) => handleChange('DEFAULT_TARGET_SCORE', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Số câu hỏi mỗi phiên luyện tập (Practice Session)
              </label>
              <input 
                type="number"
                value={settings.PRACTICE_QUESTIONS_COUNT || '10'}
                onChange={(e) => handleChange('PRACTICE_QUESTIONS_COUNT', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
