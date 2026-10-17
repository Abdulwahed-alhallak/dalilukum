import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  CarFront,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CarBrand } from '../../context/AdsContextTypes';

function DynamicIcon({ name, size = 18, className }: { name?: string; size?: number; className?: string }) {
  const IconComp = (name && (LucideIcons as any)[name]) || HelpCircle;
  return <IconComp size={size} className={className} />;
}

interface AdminBrandsTabProps {
  brands: CarBrand[];
  carModelsMap: Record<string, { ar: string; en: string }[]>;
  addBrand: (brand: CarBrand) => Promise<void>;
  updateBrand: (index: number, updated: CarBrand) => Promise<void>;
  deleteBrand: (index: number) => Promise<void>;
  updateCarModels: (brandEn: string, models: { ar: string; en: string }[]) => Promise<void>;
  showToast: (msg: string) => void;
}

export function AdminBrandsTab({
  brands,
  carModelsMap,
  addBrand,
  updateBrand,
  deleteBrand,
  updateCarModels,
  showToast,
}: AdminBrandsTabProps) {
  const [selectedBrandEn, setSelectedBrandEn] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [arName, setArName] = useState('');
  const [enName, setEnName] = useState('');
  const [domain, setDomain] = useState('');
  const [icon, setIcon] = useState('CarFront');
  const [image, setImage] = useState('');
  const [modelAr, setModelAr] = useState('');
  const [modelEn, setModelEn] = useState('');

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arName.trim() || !enName.trim()) {
      alert('الرجاء تعبئة الاسم بالعربي والإنجليزي');
      return;
    }
    await addBrand({
      ar: arName.trim(),
      en: enName.trim(),
      count: 0,
      domain: domain.trim() || undefined,
      icon: icon || undefined,
      image: image.trim() || undefined,
    });
    setArName('');
    setEnName('');
    setDomain('');
    setIcon('CarFront');
    setImage('');
    setShowAddForm(false);
    showToast('تمت إضافة ماركة السيارات بنجاح');
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandEn) return;
    if (!modelAr.trim() || !modelEn.trim()) {
      alert('الرجاء كتابة اسم الموديل بالعربية والإنجليزية');
      return;
    }
    const nextModels = [...(carModelsMap[selectedBrandEn] || []), { ar: modelAr.trim(), en: modelEn.trim() }];
    await updateCarModels(selectedBrandEn, nextModels);
    setModelAr('');
    setModelEn('');
    showToast('تم حفظ موديل السيارة في قاعدة البيانات');
  };

  const handleRemoveModel = async (brandEn: string, modelIndex: number) => {
    const nextModels = (carModelsMap[brandEn] || []).filter((_, idx) => idx !== modelIndex);
    await updateCarModels(brandEn, nextModels);
    showToast('تم حذف الموديل من قاعدة البيانات');
  };

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#F6F2E8] mb-6">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">ماركات الشركات والوكالات</h3>
            <p className="text-[11px] text-[#C9A15A] font-medium">
              إضافة شركات سيارات جديدة وإدارة شعاراتها وموديلاتها الفرعية
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-[#C9A15A] hover:bg-[#0D3B46] text-white text-xs px-4 py-2.5 rounded-xl font-bold border border-[#C9A15A] shadow-md outline-none transition-all cursor-pointer"
          >
            <Plus size={16} />
            {showAddForm ? 'إلغاء النموذج' : 'إضافة ماركة جديدة'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddBrand} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#0D3B46]">الاسم بالعربية</label>
              <input
                type="text"
                placeholder="مثال: تويوتا"
                value={arName}
                onChange={e => setArName(e.target.value)}
                className="h-10 px-4 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl outline-none text-xs text-[#2B2B2B] focus:bg-white focus:border-[#C9A15A]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#0D3B46]">الاسم بالإنجليزية (مفتاح الربط)</label>
              <input
                type="text"
                placeholder="مثال: Toyota"
                value={enName}
                onChange={e => setEnName(e.target.value)}
                className="h-10 px-4 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl outline-none text-xs text-[#2B2B2B] focus:bg-white focus:border-[#C9A15A]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#0D3B46]">نطاق الموقع (لجلب الشعار)</label>
              <input
                type="text"
                placeholder="مثال: toyota.com"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="h-10 px-4 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl outline-none text-xs text-[#2B2B2B] focus:bg-white focus:border-[#C9A15A]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#0D3B46]">أيقونة بديلة</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="h-10 px-4 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl outline-none text-xs font-mono text-[#2B2B2B] focus:bg-white focus:border-[#C9A15A]"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <label className="text-[11px] font-bold text-[#0D3B46]">رابط صورة/شعار الماركة (اختياري)</label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={image}
                onChange={e => setImage(e.target.value)}
                className="h-10 px-4 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl outline-none text-xs text-[#2B2B2B] focus:bg-white focus:border-[#C9A15A]"
              />
            </div>
            <div className="flex items-end lg:col-span-3 mt-2">
              <button
                type="submit"
                className="w-full h-11 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-white text-xs rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                حفظ الماركة في قاعدة البيانات
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm overflow-hidden lg:col-span-2">
          <h4 className="font-extrabold text-xs text-[#2B2B2B] pb-3 border-b border-[#F6F2E8] mb-4">
            قائمة الماركات المسجلة ({brands.length})
          </h4>
          <div className="divide-y divide-[#F6F2E8] max-h-[500px] overflow-y-auto">
            {brands.map((brand, idx) => {
              const isSelected = selectedBrandEn === brand.en;
              const autoLogo = `https://cdn.jsdelivr.net/gh/filippofg/car-logos-dataset@master/logos/optimized/${brand.en.toLowerCase().replace(/[\s_.]/g, '-').replace(/-+/g, '-')}.png`;
              return (
                <div
                  key={brand.id || brand.en}
                  className={`p-4 flex flex-col gap-3 transition-colors rounded-xl border mb-3 ${
                    isSelected ? 'bg-[#F6F2E8] border-[#E3C98D]' : 'border-[#F6F2E8] hover:bg-[#F6F2E8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F6F2E8] flex items-center justify-center border border-[#E3C98D] p-1 overflow-hidden shrink-0">
                        {brand.image ? (
                          <img src={brand.image} alt={brand.ar} className="max-h-full max-w-full object-contain" />
                        ) : brand.icon ? (
                          <DynamicIcon name={brand.icon} size={22} className="text-[#2B2B2B]" />
                        ) : brand.domain ? (
                          <img
                            src={autoLogo}
                            alt={brand.ar}
                            className="max-h-full max-w-full object-contain"
                            onError={e => {
                              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${brand.domain}`;
                            }}
                          />
                        ) : (
                          <CarFront className="text-[#C9A15A]" size={20} />
                        )}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-bold text-[#2B2B2B] text-xs">{brand.ar}</span>
                        <span className="text-[10px] text-[#C9A15A] font-medium" dir="ltr">
                          {brand.en} ({brand.count} إعلان)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBrandEn(brand.en)}
                        className={`px-3 py-1.5 rounded-lg font-extrabold text-[11px] transition-all outline-none cursor-pointer ${
                          isSelected ? 'bg-[#C9A15A] text-white shadow-sm' : 'bg-[#F6F2E8] text-[#2B2B2B]'
                        }`}
                      >
                        الموديلات ({carModelsMap[brand.en]?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`هل أنت متأكد من حذف ماركة ${brand.ar}؟`)) {
                            await deleteBrand(idx);
                            showToast('تم حذف ماركة السيارة');
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-[#C9A15A]/10 hover:bg-[#C9A15A]/20 text-[#C9A15A] flex items-center justify-center shrink-0 border border-[#C9A15A]/25 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-dashed border-[#F6F2E8] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#C9A15A] font-bold block text-right">
                        إعدادات الشعار والأيقونة لـ ({brand.ar}):
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateBrand(idx, { ...brand, image: autoLogo, icon: undefined });
                            showToast(`تم توليد رابط الشعار لـ ${brand.ar}`);
                          }}
                          className="px-2 py-1 bg-[#C9A15A]/10 hover:bg-[#C9A15A]/20 text-[#0D3B46] border border-[#C9A15A]/35 rounded text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={10} />
                          توليد تلقائي
                        </button>
                        <label className="px-2 py-1 bg-[#C9A15A]/10 hover:bg-[#C9A15A]/20 text-[#0D3B46] border border-[#C9A15A]/35 rounded text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer">
                          <Plus size={10} />
                          رفع شعار
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async ev => {
                                  if (ev.target?.result) {
                                    await updateBrand(idx, { ...brand, image: String(ev.target.result), icon: undefined });
                                    showToast(`تم رفع شعار ${brand.ar} بنجاح`);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#2B2B2B] text-white border border-[#2B2B2B] rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[400px]">
          <h4 className="font-extrabold text-xs text-[#C9A15A] pb-3 border-b border-[#3D3D3D] mb-4 flex items-center gap-2">
            <Layers size={14} />
            تحرير قائمة الموديلات الفرعية
          </h4>
          {selectedBrandEn ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-[#C9A15A] font-semibold mb-3">
                  موديلات ماركة: <span className="text-white font-extrabold">{selectedBrandEn}</span>
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto mb-4 bg-[#1F1F1F] p-2.5 rounded-xl border border-[#3D3D3D]">
                  {(carModelsMap[selectedBrandEn] || []).map((model, mIdx) => (
                    <div key={`${model.en}-${mIdx}`} className="p-2 border border-[#3D3D3D] rounded-lg flex items-center justify-between text-right">
                      <span className="text-[11px] font-bold text-[#F6F2E8]">
                        {model.ar}{' '}
                        <span className="text-[#C9A15A] font-medium" dir="ltr">
                          ({model.en})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModel(selectedBrandEn, mIdx)}
                        className="text-[#C9A15A] hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {(carModelsMap[selectedBrandEn] || []).length === 0 && (
                    <div className="p-3 text-center text-[#C9A15A] text-[11px]">
                      لا توجد موديلات فرعية مضافة بعد.
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddModel} className="space-y-3 pt-3 border-t border-[#3D3D3D]">
                <h5 className="font-extrabold text-[11px] text-white">إضافة موديل فرعي جديد</h5>
                <input
                  type="text"
                  placeholder="الاسم بالعربي (مثال: كامري)"
                  value={modelAr}
                  onChange={e => setModelAr(e.target.value)}
                  className="w-full h-9 px-3 bg-[#1F1F1F] border border-[#3D3D3D] rounded-lg outline-none text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="الاسم بالإنجليزي (مثال: Camry)"
                  value={modelEn}
                  onChange={e => setModelEn(e.target.value)}
                  className="w-full h-9 px-3 bg-[#1F1F1F] border border-[#3D3D3D] rounded-lg outline-none text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full h-9 bg-[#C9A15A] hover:bg-[#0D3B46] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  حفظ الموديل في قاعدة البيانات
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#C9A15A] text-center py-20">
              <AlertCircle size={36} className="mb-2 text-[#C9A15A]" />
              <p className="text-[11px] font-semibold">
                الرجاء تحديد ماركة من القائمة المقابلة لتحرير أو إضافة الموديلات الفرعية.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
