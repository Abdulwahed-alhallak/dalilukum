import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Trash2, CheckCircle2, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

type NotifPrefs = {
  notify_all_new: boolean;
  notify_category: 'all' | 'cars' | 'real-estate';
  notify_sound: boolean;
};

export function NotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    clearAllNotifications,
    deleteNotification,
  } = useAds();
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({
    notify_all_new: true,
    notify_category: 'all',
    notify_sound: true,
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!user?.id && !user?.phone) return;
    const query = user.id
      ? `?user_id=${user.id}`
      : `?phone=${encodeURIComponent(user.phone)}`;
    api
      .get<any>(`/notification-preferences${query}`)
      .then((res) => {
        if (res) {
          setPrefs({
            notify_all_new: Boolean(res.notify_all_new ?? true),
            notify_category: (res.notify_category as NotifPrefs['notify_category']) || 'all',
            notify_sound: Boolean(res.notify_sound ?? true),
          });
        }
      })
      .catch(() => null);
  }, [user?.id, user?.phone]);

  const handleSavePrefs = async (next: NotifPrefs) => {
    setPrefs(next);
    if (!user?.id && !user?.phone) {
      localStorage.setItem('dalilukum_notif_prefs_v1', JSON.stringify(next));
      showToast('تم حفظ تفضيلات الإشعارات');
      return;
    }
    setSavingPrefs(true);
    try {
      await api.post('/notification-preferences', {
        user_id: user.id,
        phone: user.phone,
        ...next,
      });
      showToast('تم حفظ تفضيلات الإشعارات');
    } catch {
      showToast('تعذر حفظ التفضيلات');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-1 py-4 pb-24 relative select-none font-sans" dir="rtl">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#C9A15A]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F6F2E8] pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#C9A15A]/10 p-2.5 rounded-2xl text-[#C9A15A]">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">مركز الإشعارات</h2>
            <p className="text-[12px] text-[#8C7A5B] font-semibold mt-0.5">
              تنبيهات مباشرة لنشاط الإعلانات والحساب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrefs((v) => !v)}
            className="flex items-center gap-1.5 bg-white border border-[#E5DDCB] hover:border-[#C9A15A] text-[#0D3B46] text-xs font-extrabold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={15} className="text-[#C9A15A]" />
            <span>إعدادات التنبيه</span>
          </button>

          {unreadNotificationsCount > 0 ? (
            <span className="bg-[#C9A15A] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-sm">
              {unreadNotificationsCount} غير مقروء
            </span>
          ) : (
            <span className="bg-[#F6F2E8] text-[#8C7A5B] text-xs font-bold px-3 py-2 rounded-xl">
              لا جديد
            </span>
          )}
        </div>
      </div>

      {/* Notification Preferences Card (connected to notification_preferences table) */}
      {showPrefs && (
        <div className="bg-white rounded-2xl border border-[#E5DDCB] p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0D3B46]">تفضيلات الإشعارات</h3>
            {savingPrefs && <span className="text-[11px] font-bold text-[#C9A15A]">جارٍ الحفظ...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSavePrefs({ ...prefs, notify_all_new: !prefs.notify_all_new })}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-colors cursor-pointer ${
                prefs.notify_all_new
                  ? 'border-[#0D3B46] bg-[#0D3B46]/5 text-[#0D3B46]'
                  : 'border-[#F6F2E8] bg-[#FAF8F4] text-[#8C7A5B]'
              }`}
            >
              <div>
                <div className="text-xs font-black">إشعارات الإعلانات</div>
                <div className="text-[11px] opacity-80">تنبيه فوري عند الإضافة</div>
              </div>
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  prefs.notify_all_new ? 'bg-[#0D3B46]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    prefs.notify_all_new ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSavePrefs({ ...prefs, notify_sound: !prefs.notify_sound })}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-colors cursor-pointer ${
                prefs.notify_sound
                  ? 'border-[#0D3B46] bg-[#0D3B46]/5 text-[#0D3B46]'
                  : 'border-[#F6F2E8] bg-[#FAF8F4] text-[#8C7A5B]'
              }`}
            >
              <div className="flex items-center gap-2">
                {prefs.notify_sound ? <Volume2 size={18} className="text-[#C9A15A]" /> : <VolumeX size={18} />}
                <div>
                  <div className="text-xs font-black">صوت التنبيه</div>
                  <div className="text-[11px] opacity-80">{prefs.notify_sound ? 'مفعل' : 'صامت'}</div>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  prefs.notify_sound ? 'bg-[#C9A15A]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    prefs.notify_sound ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#2B2B2B]">قسم الإشعارات المفضل</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'all', label: 'الكل' },
                { id: 'real-estate', label: 'العقارات' },
                { id: 'cars', label: 'السيارات' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSavePrefs({ ...prefs, notify_category: opt.id })}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                    prefs.notify_category === opt.id
                      ? 'bg-[#0D3B46] text-white border-[#0D3B46]'
                      : 'bg-[#FAF8F4] text-[#2B2B2B] border-[#E5DDCB] hover:border-[#C9A15A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-[#F6F2E8]">
          <button
            onClick={() => {
              markAllNotificationsRead();
              showToast('تم تعليم الكل كمقروء');
            }}
            className="text-xs font-black text-[#0D3B46] hover:text-[#C9A15A] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={16} />
            <span>قراءة الكل</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل تريد حذف كافة الإشعارات؟')) {
                clearAllNotifications();
                showToast('تم مسح الإشعارات');
              }
            }}
            className="text-xs font-black text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={15} />
            <span>حذف الكل</span>
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-3.5">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative ${
              item.isRead
                ? 'bg-white border-[#F6F2E8] shadow-sm opacity-90'
                : 'bg-white border-[#C9A15A]/40 shadow-md ring-1 ring-[#C9A15A]/20'
            }`}
          >
            <div className="flex gap-3 sm:gap-4 items-start">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  item.isRead ? 'bg-[#F6F2E8] text-[#8C7A5B]' : 'bg-[#C9A15A]/15 text-[#C9A15A]'
                }`}
              >
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1.5">
                  <h3 className="font-extrabold text-sm sm:text-base leading-snug text-[#2B2B2B]">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[#8C7A5B] shrink-0">{item.date}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#555]">{item.body}</p>
              </div>
              <button
                onClick={() => deleteNotification(item.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                title="حذف الإشعار"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#E5DDCB] space-y-3">
            <div className="w-14 h-14 bg-[#F6F2E8] text-[#C9A15A] rounded-2xl flex items-center justify-center mx-auto">
              <BellOff size={28} />
            </div>
            <h3 className="font-extrabold text-base text-[#2B2B2B]">لا توجد إشعارات</h3>
            <p className="text-xs font-semibold text-[#8C7A5B] max-w-sm mx-auto">
              ستصلك التنبيهات فور نشر الإعلانات الجديدة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
