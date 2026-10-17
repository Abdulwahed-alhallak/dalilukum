import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface AdminUserLimitsTabProps {
  userLimits: Record<string, { userId?: number; maxAds: number; maxImages: number; maxVideos: number }>;
  defaultLimits: { maxAds: number; maxImages: number; maxVideos: number };
  updateUserLimit: (phone: string, maxImages: number, maxVideos: number, maxAds?: number) => Promise<void>;
  deleteUserLimit: (phone: string) => Promise<void>;
  updateDefaultLimits: (maxImages: number, maxVideos: number, maxAds?: number) => Promise<void>;
  showToast: (msg: string) => void;
}

export function AdminUserLimitsTab({
  userLimits,
  defaultLimits,
  updateUserLimit,
  deleteUserLimit,
  updateDefaultLimits,
  showToast,
}: AdminUserLimitsTabProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [maxAdsInput, setMaxAdsInput] = useState(5);
  const [maxImagesInput, setMaxImagesInput] = useState(5);
  const [maxVideosInput, setMaxVideosInput] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');

  const handleSaveDefaults = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const defaultAds = Number((form.elements.namedItem('defaultAds') as HTMLInputElement).value);
    const defaultImgs = Number((form.elements.namedItem('defaultImgs') as HTMLInputElement).value);
    const defaultVids = Number((form.elements.namedItem('defaultVids') as HTMLInputElement).value);
    await updateDefaultLimits(defaultImgs, defaultVids, defaultAds);
    showToast('تم حفظ الحدود الافتراضية للرفع بنجاح');
  };

  const handleSaveUserLimit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      alert('الرجاء كتابة رقم الهاتف أولاً');
      return;
    }
    await updateUserLimit(phoneInput.trim(), maxImagesInput, maxVideosInput, maxAdsInput);
    showToast(isEditing ? 'تم تحديث صلاحيات العميل' : 'تمت إضافة صلاحية مخصصة للعميل');
    setPhoneInput('');
    setMaxAdsInput(5);
    setMaxImagesInput(5);
    setMaxVideosInput(1);
    setIsEditing(false);
  };

  const entries = Object.entries(userLimits).filter(([phone]) => phone.includes(searchPhone));

  return (
    <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
      <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#F6F2E8]">
          <h3 className="font-extrabold text-sm text-[#2B2B2B]">
            الإعدادات الافتراضية للمنصة (للمستخدمين بدون تخصيص)
          </h3>
          <p className="text-[11px] text-[#C9A15A] font-medium">
            تحكم بحدود النشر الأساسية عند عدم وجود سجل استثنائي مخصص للمستخدم
          </p>
        </div>

        <form onSubmit={handleSaveDefaults} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 text-right font-bold">
            <label className="text-xs text-[#2B2B2B]">الحد الأقصى للإعلانات</label>
            <input
              name="defaultAds"
              type="number"
              key={`def-ads-${defaultLimits.maxAds}`}
              defaultValue={defaultLimits.maxAds}
              className="w-full h-11 px-4 text-xs rounded-xl border border-[#E3C98D] outline-none text-center font-bold bg-[#F6F2E8] focus:bg-white focus:border-[#C9A15A]"
              min={1}
              required
            />
          </div>
          <div className="space-y-1.5 text-right font-bold">
            <label className="text-xs text-[#2B2B2B]">الحد الأقصى للصور</label>
            <input
              name="defaultImgs"
              type="number"
              key={`def-imgs-${defaultLimits.maxImages}`}
              defaultValue={defaultLimits.maxImages}
              className="w-full h-11 px-4 text-xs rounded-xl border border-[#E3C98D] outline-none text-center font-bold bg-[#F6F2E8] focus:bg-white focus:border-[#C9A15A]"
              min={0}
              required
            />
          </div>
          <div className="space-y-1.5 text-right font-bold">
            <label className="text-xs text-[#2B2B2B]">الحد الأقصى للفيديو</label>
            <input
              name="defaultVids"
              type="number"
              key={`def-vids-${defaultLimits.maxVideos}`}
              defaultValue={defaultLimits.maxVideos}
              className="w-full h-11 px-4 text-xs rounded-xl border border-[#E3C98D] outline-none text-center font-bold bg-[#F6F2E8] focus:bg-white focus:border-[#C9A15A]"
              min={0}
              required
            />
          </div>
          <button
            type="submit"
            className="h-11 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            حفظ الحدود العامة
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="pb-3 border-b border-[#F6F2E8] text-right">
          <h3 className="font-extrabold text-sm text-[#2B2B2B]">
            تخصيص الصلاحيات الاستثنائية لكل مستخدم
          </h3>
          <p className="text-[11px] text-[#C9A15A] font-medium">
            حدد حدود الإعلانات والصور والفيديو برقم هاتف العميل مباشرة
          </p>
        </div>

        <div className="bg-[#F6F2E8]/50 rounded-2xl p-5 border border-[#F6F2E8] space-y-4">
          <h4 className="text-xs font-extrabold text-[#2B2B2B] text-right">
            {isEditing ? 'تعديل الصلاحيات المحددة للحساب' : 'إضافة تخصيص حساب عميل جديد'}
          </h4>
          <form onSubmit={handleSaveUserLimit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div className="space-y-1 text-right font-bold">
              <span className="text-[11px] text-[#0D3B46] block">رقم هاتف المستخدم *</span>
              <input
                type="text"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="+963 931 111 222"
                className="w-full h-11 px-4 text-xs bg-white rounded-xl border border-[#E3C98D] outline-none text-left font-semibold"
                dir="ltr"
                disabled={isEditing}
                required
              />
            </div>
            <div className="space-y-1 text-right font-bold">
              <span className="text-[11px] text-[#0D3B46] block">أقصى عدد إعلانات *</span>
              <input
                type="number"
                value={maxAdsInput}
                onChange={e => setMaxAdsInput(Number(e.target.value))}
                className="w-full h-11 px-4 text-xs bg-white rounded-xl border border-[#E3C98D] outline-none text-center font-bold"
                min={1}
                required
              />
            </div>
            <div className="space-y-1 text-right font-bold">
              <span className="text-[11px] text-[#0D3B46] block">أقصى حد صور *</span>
              <input
                type="number"
                value={maxImagesInput}
                onChange={e => setMaxImagesInput(Number(e.target.value))}
                className="w-full h-11 px-4 text-xs bg-white rounded-xl border border-[#E3C98D] outline-none text-center font-bold"
                min={0}
                required
              />
            </div>
            <div className="space-y-1 text-right font-bold">
              <span className="text-[11px] text-[#0D3B46] block">أقصى حد فيديو *</span>
              <input
                type="number"
                value={maxVideosInput}
                onChange={e => setMaxVideosInput(Number(e.target.value))}
                className="w-full h-11 px-4 text-xs bg-white rounded-xl border border-[#E3C98D] outline-none text-center font-bold"
                min={0}
                required
              />
            </div>
            <div className="flex gap-2 font-bold">
              <button
                type="submit"
                className="flex-1 h-11 bg-[#C9A15A] hover:bg-[#0D3B46] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
              >
                {isEditing ? 'حفظ التعديل' : 'إضافة الصلاحية'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoneInput('');
                    setMaxAdsInput(5);
                    setMaxImagesInput(5);
                    setMaxVideosInput(1);
                    setIsEditing(false);
                  }}
                  className="px-4 h-11 bg-[#F6F2E8] text-[#2B2B2B] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-row-reverse">
            <h4 className="text-xs font-bold text-[#2B2B2B]">سجل المستخدمين المخصصين:</h4>
            <input
              type="text"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              placeholder="البحث برقم الهاتف..."
              className="h-9 px-3 w-48 text-[11px] rounded-lg border border-[#E3C98D] outline-none focus:border-[#C9A15A] text-left"
              dir="ltr"
            />
          </div>

          <div className="border border-[#F6F2E8] rounded-2xl overflow-hidden bg-white max-h-80 overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F6F2E8] text-[#2B2B2B] font-bold border-b border-[#F6F2E8]">
                <tr>
                  <th className="p-3 text-right">رقم هاتف العميل</th>
                  <th className="p-3 text-center">حد الإعلانات</th>
                  <th className="p-3 text-center">حد الصور</th>
                  <th className="p-3 text-center">حد الفيديو</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2E8] font-semibold text-[#2B2B2B]">
                {entries.map(([phone, lim]) => (
                  <tr key={phone} className="hover:bg-[#F6F2E8]/50">
                    <td className="p-3 text-right font-mono text-[#2B2B2B]" dir="ltr">
                      {phone}
                    </td>
                    <td className="p-3 text-center font-bold text-[#2B2B2B]">
                      {lim.maxAds ?? 5} إعلانات
                    </td>
                    <td className="p-3 text-center font-bold text-[#2B2B2B]">
                      {lim.maxImages} صور
                    </td>
                    <td className="p-3 text-center font-bold text-[#2B2B2B]">
                      {lim.maxVideos} فيديو
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneInput(phone);
                            setMaxAdsInput(lim.maxAds ?? 5);
                            setMaxImagesInput(lim.maxImages);
                            setMaxVideosInput(lim.maxVideos);
                            setIsEditing(true);
                          }}
                          className="p-1.5 text-[#0D3B46] hover:bg-[#C9A15A]/10 rounded-lg transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`هل أنت متأكد من حذف التخصيص لرقم الهاتف ${phone}؟`)) {
                              await deleteUserLimit(phone);
                              showToast('تم حذف التخصيص بنجاح');
                            }
                          }}
                          className="p-1.5 text-[#C9A15A] hover:bg-[#C9A15A]/10 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#C9A15A] font-bold text-xs">
                      لا يوجد مستخدمون مخصصون حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
