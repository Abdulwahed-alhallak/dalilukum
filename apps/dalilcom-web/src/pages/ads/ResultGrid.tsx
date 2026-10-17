import React, { useState } from 'react';
import { Info, Compass, AlertCircle, Trash2 } from 'lucide-react';
import { AdCard } from '../../components/AdCard';
import { useAdsFilter } from './FilterContext';
import { useAds } from '../../context/AdsContext';
import { useAuth } from '../../context/AuthContext';

interface ResultGridProps {
  filteredAds: any[];
}

const normalizeDigits = (val?: string) => (val || '').replace(/\D/g, '');

export function ResultGrid({ filteredAds }: ResultGridProps) {
  const { deleteAd } = useAds();
  const { user } = useAuth();
  const { resetFilters } = useAdsFilter();
  const [showTipsAlert, setShowTipsAlert] = useState(true);

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('dalil_admin_auth') === 'true';
  const normUserPhone = normalizeDigits(user?.phone);

  const canDeleteAd = (ad: any) => {
    if (isAdmin) return true;
    if (!user) return false;
    if (user.id && ad.ownerUserId && user.id === ad.ownerUserId) return true;
    const normOwner = normalizeDigits(ad.ownerPhone);
    return normUserPhone.length >= 7 && normOwner.length >= 7 && (normOwner.endsWith(normUserPhone.slice(-8)) || normUserPhone.endsWith(normOwner.slice(-8)));
  };

  return (
    <div className="flex-1 space-y-6">
      {showTipsAlert && (
        <div className="bg-[#C9A15A]/15 border border-[#C9A15A]/40 rounded-xl p-4 flex gap-3 relative animate-in slide-in-from-top duration-300" dir="rtl">
          <Info className="text-[#0D3B46] shrink-0 mt-0.5" size={20} />
          <div className="text-right">
            <span className="font-bold text-[#0D3B46] text-[14px] block mb-0.5">تبويب المساعدة الذكي</span>
            <p className="text-[#2B2B2B] text-[13px] leading-relaxed">
              نصيحة: يمكنك استخدام البحث الذكي بكلمة مفتاحية (مثل: فلل أو مرسيدس) بالاقتران مع البحث المتقدم للوصول إلى النتائج بدقة وسرعة متناهية.
            </p>
          </div>
          <button 
            onClick={() => setShowTipsAlert(false)}
            className="absolute top-3 left-3 text-[#0D3B46] hover:text-[#C9A15A] p-1 rounded transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-[#F6F2E8] shadow-sm" dir="rtl">
        <div className="flex items-center gap-2">
          <Compass className="text-[#C9A15A]" size={20} />
          <span className="text-[14px] text-[#0D3B46] font-bold font-sans">النتائج المطابقة:</span>
          <span className="bg-[#0D3B46]/10 text-[#0D3B46] text-xs font-extrabold px-2.5 py-1 rounded-full leading-none">
            {filteredAds.length} إعلانات
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#C9A15A] font-semibold">بيانات حية محدثة</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="relative group">
            {canDeleteAd(ad) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('هل ترغب في حذف هذا الإعلان؟')) {
                    deleteAd(ad.id);
                  }
                }}
                title="حذف الإعلان"
                className="absolute top-3 left-3 z-30 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-700 transition-colors shadow"
              >
                <Trash2 size={16} />
              </button>
            )}
            <AdCard item={ad} />
          </div>
        ))}
      </div>

      {filteredAds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#F6F2E8] rounded-3xl p-8 shadow-sm" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-[#C9A15A]/15 flex items-center justify-center mb-4 text-[#0D3B46]">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-[#2B2B2B] mb-2">لا توجد نتائج مطابقة تماماً للمواصفات</h3>
          <p className="text-[14px] text-[#C9A15A] text-center max-w-md leading-relaxed mb-6 font-semibold">
            يرجى تعديل معايير البحث المتقدم، أو تصفير السعر وتغيير الموقع من أجل العثور على تشكيلة أوسع من الإعلانات.
          </p>
          <button
            onClick={resetFilters}
            className="apple-btn bg-[#C9A15A]/15 text-[#0D3B46] border border-[#C9A15A]/40 hover:bg-[#C9A15A]/25 transition-colors cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs"
          >
            تحديث وتصفير خيارات البحث
          </button>
        </div>
      )}
    </div>
  );
}
