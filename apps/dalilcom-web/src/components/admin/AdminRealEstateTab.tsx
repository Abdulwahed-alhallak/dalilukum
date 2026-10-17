import React, { useState } from 'react';
import { Layers, Trash2, ChevronLeft, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { RealEstateCategory, RealEstateSubcategory } from '../../context/AdsContextTypes';

function DynamicIcon({ name, size = 18, className }: { name?: string; size?: number; className?: string }) {
  const IconComp = (name && (LucideIcons as any)[name]) || HelpCircle;
  return <IconComp size={size} className={className} />;
}

interface AdminRealEstateTabProps {
  realEstateCats: RealEstateCategory[];
  realEstateSubs: Record<string, RealEstateSubcategory[]>;
  iconOverrides: Record<string, string>;
  updateRealEstateCat: (id: string, updated: Partial<RealEstateCategory>) => Promise<void>;
  updateRealEstateSubs: (catId: string, subs: RealEstateSubcategory[]) => Promise<void>;
  updateIconOverride: (key: string, iconName: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export function AdminRealEstateTab({
  realEstateCats,
  realEstateSubs,
  iconOverrides,
  updateRealEstateCat,
  updateRealEstateSubs,
  updateIconOverride,
  showToast,
}: AdminRealEstateTabProps) {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [subAr, setSubAr] = useState('');
  const [subEn, setSubEn] = useState('');
  const [subImage, setSubImage] = useState('');

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId) return;
    if (!subAr.trim() || !subEn.trim()) {
      alert('يرجى كتابة اسم القسم بالعربية والإنجليزية');
      return;
    }
    const nextSubs: RealEstateSubcategory[] = [
      ...(realEstateSubs[selectedCatId] || []),
      {
        ar: subAr.trim(),
        en: subEn.trim(),
        count: 0,
        image: subImage.trim() || undefined,
      },
    ];
    await updateRealEstateSubs(selectedCatId, nextSubs);
    setSubAr('');
    setSubEn('');
    setSubImage('');
    showToast('تم حفظ القسم العقاري الفرعي في قاعدة البيانات');
  };

  const handleRemoveSub = async (catId: string, subIndex: number) => {
    const nextSubs = (realEstateSubs[catId] || []).filter((_, idx) => idx !== subIndex);
    await updateRealEstateSubs(catId, nextSubs);
    showToast('تم حذف القسم الفرعي من قاعدة البيانات');
  };

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm">
        <div className="pb-4 border-b border-[#F6F2E8] mb-6 text-right">
          <h3 className="font-extrabold text-sm text-[#2B2B2B]">فئات العقارات الأساسية</h3>
          <p className="text-[11px] text-[#C9A15A] font-medium">
            التحكم بتصنيفات العقارات وأيقوناتها وفروعها المرتبطة بقاعدة البيانات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realEstateCats.map(cat => {
            const isSelected = selectedCatId === cat.id;
            const customIcon = iconOverrides[cat.id];
            return (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  isSelected ? 'border-[#C9A15A] bg-[#C9A15A]/10' : 'border-[#E3C98D] bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#C9A15A]/20 flex items-center justify-center text-[#0D3B46] font-bold shrink-0 overflow-hidden">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.ar} className="w-full h-full object-cover" />
                      ) : (
                        <DynamicIcon name={customIcon || cat.icon || 'Building2'} size={20} />
                      )}
                    </div>
                    <div className="text-right">
                      <h4 className="font-extrabold text-[#2B2B2B] text-xs">{cat.ar}</h4>
                      <span className="text-[10px] text-[#C9A15A] font-bold" dir="ltr">
                        {cat.en}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0D3B46] bg-[#F6F2E8] px-2.5 py-1 rounded-full">
                    {cat.count} إعلان
                  </span>
                </div>

                <div className="space-y-3 border-t border-[#F6F2E8] pt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="الأيقونة (Building2)"
                      value={iconOverrides[cat.id] || ''}
                      onChange={e => updateIconOverride(cat.id, e.target.value)}
                      className="h-8 px-2.5 max-w-[130px] border border-[#E3C98D] rounded-lg text-[10px] bg-[#F6F2E8] font-mono outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={cat.ar}
                      onBlur={e => {
                        if (e.target.value.trim() && e.target.value !== cat.ar) {
                          updateRealEstateCat(cat.id, { ar: e.target.value.trim() });
                          showToast('تم تحديث اسم الفئة');
                        }
                      }}
                      className="h-8 flex-1 px-2 border border-[#E3C98D] rounded-lg text-[10px] bg-white text-[#2B2B2B] outline-none font-bold text-right"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className="w-full h-8 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    إدارة الفروع ({realEstateSubs[cat.id]?.length || 0})
                    <ChevronLeft size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#2B2B2B] text-white border border-[#2B2B2B] rounded-2xl p-6 shadow-sm">
        <h4 className="font-extrabold text-xs text-[#C9A15A] pb-3 border-b border-[#3D3D3D] mb-4 flex items-center gap-2">
          <Layers size={14} className="text-[#C9A15A]" />
          تحرير التفرعات العقارية لقسم:
          {selectedCatId ? (
            <span className="text-white font-extrabold bg-[#1F1F1F] px-3 py-1 rounded-lg">
              {realEstateCats.find(c => c.id === selectedCatId)?.ar} ({selectedCatId})
            </span>
          ) : (
            <span className="text-[#C9A15A]">اختر فئة من الأعلى</span>
          )}
        </h4>

        {selectedCatId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-3 max-h-96 overflow-y-auto bg-[#1F1F1F] p-4 rounded-xl border border-[#3D3D3D]">
              {(realEstateSubs[selectedCatId] || []).map((sub, idx) => (
                <div key={`${sub.ar}-${idx}`} className="p-3.5 border border-[#3D3D3D] bg-[#2B2B2B] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {sub.image && (
                      <img src={sub.image} alt={sub.ar} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    )}
                    <div className="flex flex-col text-right">
                      <span className="text-[#F6F2E8] font-bold text-xs">{sub.ar}</span>
                      <span className="text-[10px] text-[#C9A15A] font-medium" dir="ltr">
                        {sub.en} ({sub.count} إعلان)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSub(selectedCatId, idx)}
                    className="w-8 h-8 rounded-lg bg-[#C9A15A]/10 hover:bg-red-900/40 text-[#C9A15A] border border-[#C9A15A]/30 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {(realEstateSubs[selectedCatId] || []).length === 0 && (
                <div className="p-8 text-center text-[#C9A15A] text-xs">
                  لا توجد تفرعات فرعية تتبع هذا القسم بعد
                </div>
              )}
            </div>

            <form onSubmit={handleAddSub} className="space-y-4 bg-[#1F1F1F] p-5 rounded-xl border border-[#3D3D3D]">
              <h5 className="font-extrabold text-xs text-[#C9A15A]">إضافة فرع عقاري جديد</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 font-bold">
                  <label className="text-[10px] text-[#C9A15A]">الاسم بالعربية</label>
                  <input
                    type="text"
                    placeholder="مثال: شقق سكنية"
                    value={subAr}
                    onChange={e => setSubAr(e.target.value)}
                    className="h-9 px-3 bg-[#2B2B2B] border border-[#3D3D3D] rounded-lg outline-none text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5 font-bold">
                  <label className="text-[10px] text-[#C9A15A]">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    placeholder="مثال: Apartments"
                    value={subEn}
                    onChange={e => setSubEn(e.target.value)}
                    className="h-9 px-3 bg-[#2B2B2B] border border-[#3D3D3D] rounded-lg outline-none text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 font-bold">
                <label className="text-[10px] text-[#C9A15A]">رابط صورة الفرع (اختياري)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={subImage}
                  onChange={e => setSubImage(e.target.value)}
                  className="h-9 px-3 bg-[#2B2B2B] border border-[#3D3D3D] rounded-lg outline-none text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-[#C9A15A] hover:bg-[#0D3B46] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                حفظ الفرع في قاعدة البيانات
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center text-[#C9A15A] text-xs">
            الرجاء النقر على «إدارة الفروع» لأي من الفئات الأساسية بالأعلى لتحرير قوائمها الفرعية.
          </div>
        )}
      </div>
    </div>
  );
}
