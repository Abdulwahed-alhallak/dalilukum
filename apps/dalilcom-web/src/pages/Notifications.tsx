import React, { useState } from 'react';
import { Bell, BellOff, Check, Trash2, CheckCircle2, Inbox } from 'lucide-react';
import { useAds } from '../context/AdsContext';

export function NotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    clearAllNotifications,
    deleteNotification,
  } = useAds();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
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
      <div className="flex items-center justify-between border-b border-[#F6F2E8] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#C9A15A]/10 p-2.5 rounded-2xl text-[#C9A15A]">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">مركز الإشعارات</h2>
            <p className="text-[12px] text-[#8C7A5B] font-semibold mt-0.5">
              تنبيهات حقيقية مباشرة لنشاط إعلاناتك وتفاعلات حسابك
            </p>
          </div>
        </div>

        {unreadNotificationsCount > 0 ? (
          <span className="bg-[#C9A15A] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm">
            {unreadNotificationsCount} غير مقروء
          </span>
        ) : (
          <span className="bg-[#F6F2E8] text-[#8C7A5B] text-xs font-bold px-3 py-1.5 rounded-full">
            لا توجد إشعارات جديدة
          </span>
        )}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-[#F6F2E8]">
          <button
            onClick={() => {
              markAllNotificationsRead();
              showToast('تم تعليم كافة الإشعارات كمقروءة');
            }}
            className="text-xs font-black text-[#0D3B46] hover:text-[#C9A15A] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={16} />
            <span>تعيين الكل كمقروء</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل تريد مسح وحذف كافة الإشعارات؟')) {
                clearAllNotifications();
                showToast('تم مسح كافة الإشعارات');
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
            <h3 className="font-extrabold text-base text-[#2B2B2B]">لا توجد إشعارات حالياً</h3>
            <p className="text-xs font-semibold text-[#8C7A5B] max-w-sm mx-auto">
              ستصلك التنبيهات الحقيقية هنا فور نشر إعلاناتك الجديدة أو حفظ إعلاناتك في المفضلة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

