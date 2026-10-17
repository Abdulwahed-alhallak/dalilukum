import React from 'react';
import { useAdsFilter } from './FilterContext';
import { useAds } from '../../context/AdsContext';
import { SearchableSelect } from '../../components/SearchableSelect';

export function CarFilters() {
  const { filters, updateFilter } = useAdsFilter();
  const { brands, carModelsMap } = useAds();

  // Find English name for brand models lookup
  const selectedBrandEn = filters.selectedBrand !== 'الكل'
    ? (brands.find(b => b.ar === filters.selectedBrand || b.en === filters.selectedBrand)?.en || filters.selectedBrand)
    : '';

  const activeModels = selectedBrandEn 
    ? carModelsMap[selectedBrandEn] || []
    : [];

  const years = Array.from({ length: 2027 - 1970 }, (_, i) => String(2026 - i));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h4 className="font-bold text-xs text-[#C9A15A] tracking-wider">مواصفات المركبات (دليلكم)</h4>
      
      {/* Brand */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">الماركة (الشركة المصنعة)</label>
        <SearchableSelect
          value={filters.selectedBrand}
          onChange={(val) => {
            updateFilter('selectedBrand', val);
            updateFilter('selectedModel', 'الكل');
          }}
          options={[
            { value: 'الكل', label: 'الكل / جميع الماركات' },
            ...brands.map(b => ({ value: b.ar, label: b.ar }))
          ]}
        />
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">الموديل (الطراز)</label>
        <SearchableSelect
          value={filters.selectedModel}
          onChange={(val) => updateFilter('selectedModel', val)}
          options={[
            { value: 'الكل', label: 'الكل / جميع الموديلات' },
            ...activeModels.map(m => ({ value: m.ar, label: m.ar }))
          ]}
        />
      </div>

      {/* Manufacture Year Ranges */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">سنة الصنع (من عام إلى عام)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-[#C9A15A] font-bold block">من سنة</span>
            <SearchableSelect
              value={filters.minYear}
              onChange={(val) => updateFilter('minYear', val)}
              placeholder="من"
              options={[{ value: 'الكل', label: 'من عام (الكل)' }, ...years]}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#C9A15A] font-bold block">إلى سنة</span>
            <SearchableSelect
              value={filters.maxYear}
              onChange={(val) => updateFilter('maxYear', val)}
              placeholder="إلى"
              options={[{ value: 'الكل', label: 'إلى عام (الكل)' }, ...years]}
            />
          </div>
        </div>
      </div>

      {/* Mileage (كم) Range */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">المسافة المقطوعة (كم)</label>
        <div className="grid grid-cols-2 gap-2" dir="ltr">
          <input
            type="number"
            placeholder="أقصى كم"
            value={filters.maxMileage}
            onChange={(e) => updateFilter('maxMileage', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-11 pl-2 text-xs rounded-lg border border-[#E3C98D] text-center outline-none bg-[#F6F2E8] focus:bg-white focus:border-[#0D3B46] font-medium"
          />
          <input
            type="number"
            placeholder="أدنى كم"
            value={filters.minMileage}
            onChange={(e) => updateFilter('minMileage', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-11 pl-2 text-xs rounded-lg border border-[#E3C98D] text-center outline-none bg-[#F6F2E8] focus:bg-white focus:border-[#0D3B46] font-medium"
          />
        </div>
      </div>

      {/* Transmission (Gearbox) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">ناقل الحركة</label>
        <div className="flex gap-2">
          {['الكل', 'أوتوماتيك', 'عادي'].map((gear) => (
            <button
              key={gear}
              onClick={() => updateFilter('transmission', gear)}
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                filters.transmission === gear 
                  ? 'bg-[#C9A15A]/10 border-[#C9A15A] text-[#0D3B46] font-bold' 
                  : 'border-[#E3C98D] text-[#0D3B46] bg-white hover:bg-[#F6F2E8]'
              }`}
            >
              {gear}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Specification */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0D3B46] block">نوع الوقود</label>
        <div className="flex flex-wrap gap-1.5">
          {['الكل', 'بنزين', 'ديزل', 'كهرباء', 'هجين'].map((fuel) => (
            <button
              key={fuel}
              onClick={() => updateFilter('fuelType', fuel)}
              type="button"
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                filters.fuelType === fuel 
                  ? 'bg-[#C9A15A]/10 border-[#C9A15A] text-[#0D3B46] font-bold' 
                  : 'border-[#E3C98D] text-[#C9A15A] bg-white hover:bg-[#F6F2E8]'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
