import React, { useEffect, useState } from 'react';
import { CarFront, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { api, listApi } from '../../lib/api';
import { useAppSettings } from '../../hooks/useAppSettings';

export function AdminSettingsTab() {
  const { settings, setCarsEnabled } = useAppSettings();
  const [currentUser, setCurrentUser] = useState('admin');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    listApi<any>('/app-settings?per_page=100')
      .then(rows => {
        const userRow = rows.find((r: any) => r.setting_key === 'admin_username');
        if (userRow?.setting_value) {
          setCurrentUser(String(userRow.setting_value));
        }
      })
      .catch(() => null);
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = newUsername.trim() || currentUser;

    if (targetUser.length < 3) {
      setPassMessage({ type: 'error', text: 'اسم المستخدم يجب أن يكون 3 محارف على الأقل' });
      return;
    }

    if (!newPassword.trim() || newPassword.length < 4) {
      setPassMessage({ type: 'error', text: 'يرجى إدخال كلمة مرور لا تقل عن 4 محارف' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'كلمة المرور وتأكيدها غير متطابقين' });
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/credentials', {
        username: targetUser,
        password: newPassword.trim(),
      });
      setCurrentUser(targetUser);
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setPassMessage({ type: 'success', text: 'تم تحديث بيانات الدخول في قاعدة البيانات بنجاح' });
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err?.message || 'تعذر حفظ بيانات الدخول' });
    } finally {
      setSaving(false);
      setTimeout(() => setPassMessage(null), 5000);
    }
  };

  return (
    <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm space-y-8 text-right font-sans" dir="rtl">
      <div className="pb-4 border-b border-[#F6F2E8]">
        <h3 className="font-extrabold text-sm text-[#2B2B2B]">إعدادات منصة دليلكم</h3>
        <p className="text-[11px] text-[#C9A15A] font-medium">
          إعدادات عامة للمنصة، وإدارة حساب لوحة التحكم مباشرة في قاعدة البيانات.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Credentials Settings */}
        <div className="p-6 bg-[#F6F2E8] border border-[#E5DDCB] rounded-2xl space-y-5 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#2B2B2B] text-[#C9A15A] flex items-center justify-center shadow-md">
                <KeyRound size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#2B2B2B]">أمان وبيانات الدخول للوحة التحكم</h4>
                <p className="text-[11px] text-[#8C7A5B] font-bold">
                  يتم تشفير كلمة المرور وحفظها في قاعدة البيانات المركزية
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E5DDCB] px-4 py-2 rounded-xl text-xs font-bold text-[#2B2B2B] flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[#8C7A5B]">اسم المستخدم الحالي:</span>
              <span className="text-[#C9A15A] font-extrabold">{currentUser}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateCredentials} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#2B2B2B] mb-1.5">اسم المستخدم الجديد</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={`الحالي: ${currentUser}`}
                  className="w-full bg-white border border-[#E5DDCB] focus:border-[#C9A15A] text-[#2B2B2B] font-bold text-xs rounded-xl px-3.5 py-3 outline-none transition-all placeholder:text-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2B2B2B] mb-1.5">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full bg-white border border-[#E5DDCB] focus:border-[#C9A15A] text-[#2B2B2B] font-bold text-xs rounded-xl px-3.5 py-3 outline-none transition-all placeholder:text-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2B2B2B] mb-1.5">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full bg-white border border-[#E5DDCB] focus:border-[#C9A15A] text-[#2B2B2B] font-bold text-xs rounded-xl px-3.5 py-3 outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 h-11 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-[#C9A15A] hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{saving ? 'جاري الحفظ...' : 'حفظ وتحديث بيانات الدخول'}</span>
              </button>
            </div>
          </form>

          {passMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
                passMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {passMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <ShieldAlert size={18} className="shrink-0" />}
              <span>{passMessage.text}</span>
            </div>
          )}
        </div>

        {/* Cars Section toggle */}
        <div className="p-5 bg-[#F6F2E8] border border-[#E5DDCB] rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A15A]/10 text-[#C9A15A] flex items-center justify-center">
                <CarFront size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#2B2B2B]">قسم السيارات</h4>
                <p className="text-[11px] text-[#8C7A5B] font-bold">
                  التحكم بإظهار قسم السيارات في الواجهة وإضافة الإعلانات.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCarsEnabled(!settings.carsEnabled)}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                settings.carsEnabled
                  ? 'bg-[#0D3B46] text-white'
                  : 'bg-white border border-[#E3C98D] text-[#2B2B2B]'
              }`}
            >
              {settings.carsEnabled ? 'مفعل' : 'متوقف'}
            </button>
          </div>
        </div>

        <div className="p-5 bg-[#C9A15A]/10 border border-[#C9A15A]/25 rounded-2xl flex items-start gap-3">
          <CheckCircle2 size={18} className="text-[#0D3B46] shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#0D3B46] leading-6">
            جميع الإعدادات وبيانات السيارات والعقارات محفوظة مباشرة في قاعدة البيانات المركزية.
          </p>
        </div>
      </div>
    </div>
  );
}
