import React from 'react';
import { ShieldCheck, LogOut, Trash2, PlusCircle } from 'lucide-react';
import { useAds } from '../context/AdsContext';
import { AdCard } from '../components/AdCard';

interface LoginSuccessViewProps {
  phone: string;
  userId?: number;
  onCreateAd: () => void;
  onLogout: () => void;
}

const normalizeDigits = (val?: string) => (val || '').replace(/\D/g, '');

export function LoginSuccessView({ phone, userId, onCreateAd, onLogout }: LoginSuccessViewProps) {
  const { ads, deleteAd, userLimits, defaultLimits } = useAds();
  const normUserPhone = normalizeDigits(phone);

  const myAds = ads.filter(ad => {
    if (userId && ad.ownerUserId === userId) return true;
    const normOwner = normalizeDigits(ad.ownerPhone);
    return normUserPhone.length >= 7 && normOwner.length >= 7 && (normOwner.endsWith(normUserPhone.slice(-8)) || normUserPhone.endsWith(normOwner.slice(-8)));
  });

  const customLimits = userLimits[phone];
  const maxAds = customLimits ? customLimits.maxAds : defaultLimits.maxAds;
  const maxImages = customLimits ? customLimits.maxImages : defaultLimits.maxImages;

  return (
    <div className="space-y-8 max-w-5xl mx-auto mt-6" dir="rtl">
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-[#F6F2E8] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#C9A15A]/15 text-[#0D3B46] rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[#0D3B46] mb-2">مرحباً بك في دليلكم</h2>
        <p className="text-[#C9A15A] mb-4 text-[15px]">
          أنت مسجل الدخول بالرقم: <span className="font-semibold text-[#2B2B2B]" dir="ltr">{phone}</span>
        </p>
        <div className="bg-[#F6F2E8] rounded-2xl p-3 mb-6 grid grid-cols-2 gap-2 text-xs font-bold text-[#0D3B46]">
          <div>إعلاناتي النشطة: {myAds.length} / {maxAds}</div>
          <div>حد الصور لكل إعلان: {maxImages} صور</div>
        </div>
        <button
          onClick={onCreateAd}
          className="w-full bg-[#0D3B46] text-white py-3.5 rounded-xl font-bold hover:bg-[#122538] transition-colors mb-3 shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          <span>أضف إعلان جديد</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-[#C9A15A] py-3 font-bold hover:bg-[#C9A15A]/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#F6F2E8] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F6F2E8] pb-3">
          <h3 className="text-lg font-extrabold text-[#0D3B46]">إعلاناتي المنشورة ({myAds.length})</h3>
        </div>
        {myAds.length === 0 ? (
          <p className="text-center text-sm text-[#C9A15A] py-8 font-bold">
            لا توجد إعلانات مرتبطة برقم هاتفك حالياً. يمكنك نشر إعلانك الأول الآن.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAds.map(ad => (
              <div key={ad.id} className="relative group">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('هل ترغب في حذف هذا الإعلان نهائياً؟')) {
                      deleteAd(ad.id);
                    }
                  }}
                  title="حذف الإعلان"
                  className="absolute top-3 left-3 z-30 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-700 transition-colors shadow"
                >
                  <Trash2 size={15} />
                </button>
                <AdCard item={ad} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
