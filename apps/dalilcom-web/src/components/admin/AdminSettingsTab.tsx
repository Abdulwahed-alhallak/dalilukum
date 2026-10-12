import React, { useState } from 'react';
import { CarFront, CheckCircle2, Settings, Lock, KeyRound, ShieldAlert } from 'lucide-react';

const ADMIN_CUSTOM_USER_KEY = 'dalil_admin_custom_user';
const ADMIN_CUSTOM_PASS_KEY = 'dalil_admin_custom_pass';

export function AdminSettingsTab() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(ADMIN_CUSTOM_USER_KEY) || 'basel');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() && !newPassword.trim()) {
      setPassMessage({ type: 'error', text: 'يرجى إدخال اسم مستخدم أو كلمة مرور جديدة' });
      return;
    }

    if (newUsername.trim()) {
      if (newUsername.trim().length < 3) {
        setPassMessage({ type: 'error', text: 'اسم المستخدم يجب أن يكون 3 محارف على الأقل' });
        return;
      }
      localStorage.setItem(ADMIN_CUSTOM_USER_KEY, newUsername.trim());
      setCurrentUser(newUsername.trim());
    }

    if (newPassword.trim()) {
      if (newPassword.length < 4) {
        setPassMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 4 محارف على الأقل' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setPassMessage({ type: 'error', text: 'كلمة المرور وتأكيدها غير متطابقين' });
        return;
      }
      localStorage.setItem(ADMIN_CUSTOM_PASS_KEY, newPassword.trim());
    }

    setPassMessage({ type: 'success', text: 'تم تحديث بيانات الدخول للوحة التحكم بنجاح!' });
    setNewUsername('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassMessage(null), 5000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد استعادة بيانات الدخول الافتراضية (basel / basel)؟')) {
      localStorage.removeItem(ADMIN_CUSTOM_USER_KEY);
      localStorage.removeItem(ADMIN_CUSTOM_PASS_KEY);
      setCurrentUser('basel');
      setPassMessage({ type: 'success', text: 'تمت استعادة البيانات الافتراضية بنجاح: basel / basel' });
      setTimeout(() => setPassMessage(null), 5000);
    }
  };

  return (
    <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm space-y-8 text-right font-sans" dir="rtl">
      <div className="pb-4 border-b border-[#F6F2E8]">
        <h3 className="font-extrabold text-sm text-[#2B2B2B]">إعدادات منصة دليل كوم</h3>
        <p className="text-[11px] text-[#C9A15A] font-medium">
          إعدادات عامة للمنصة، وإدارة أمان وحساب لوحة التحكم.
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
                  يمكنك تعديل اسم المستخدم وكلمة المرور في أي وقت
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
                className="w-full sm:w-auto px-6 h-11 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-[#C9A15A] hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>حفظ وتحديث بيانات الدخول</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs font-bold text-stone-500 hover:text-red-700 transition-colors underline cursor-pointer"
              >
                استعادة الافتراضي (basel / basel)
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


        {/* Cars Section status */}
        <div className="p-5 bg-[#F6F2E8] border border-[#F6F2E8] rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A15A]/10 text-[#C9A15A] flex items-center justify-center">
                <CarFront size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#2B2B2B]">قسم السيارات</h4>
                <p className="text-[11px] text-[#C9A15A] font-bold">
                  السيارات مفعلة دائماً وتظهر في الواجهة وإضافة الإعلان.
                </p>
              </div>
            </div>
            <span className="text-[#0D3B46] font-black text-xs">مفعل دائماً</span>
          </div>
        </div>

        <div className="p-5 bg-[#C9A15A]/10 border border-[#C9A15A]/25 rounded-2xl flex items-start gap-3">
          <CheckCircle2 size={18} className="text-[#0D3B46] shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#0D3B46] leading-6">
            بيانات السيارات والعقارات متصلة بالسيرفر وقابلة للإدارة والتحكم الكامل من لوحة التحكم.
          </p>
        </div>
      </div>
    </div>
  );
}

