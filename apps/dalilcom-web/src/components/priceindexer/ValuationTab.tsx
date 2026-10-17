import React, { useState, useEffect } from 'react';
import { Sparkles, Gauge } from 'lucide-react';
import { SYRIAN_NEIGHBORHOODS, evaluateMarketValue } from './valuationHelpers';
import { useAds } from '../../context/AdsContext';

interface ValuationTabProps {
  onSaveReport: (rep: {
    type: 'cars' | 'real-estate';
    title: string;
    specs: string;
    estimatedPrice: number;
    priceRange: [number, number];
  }) => void;
}

export function ValuationTab({ onSaveReport }: ValuationTabProps) {
  const { ads, brands } = useAds();
  const [valType, setValType] = useState<'cars' | 'real-estate'>('real-estate');
  const [currency, setCurrency] = useState<'ل.س' | '$'>('$');
  const [carBrand, setCarBrand] = useState('تويوتا');
  const [carYear, setCarYear] = useState('2024');
  const [carMileage, setCarMileage] = useState(35000);
  const [carCondition, setCarCondition] = useState<'excellent' | 'good' | 'fair'>('excellent');
  const [locNeighborhood, setLocNeighborhood] = useState(SYRIAN_NEIGHBORHOODS[0].value);
  const [propType, setPropType] = useState('شقة');
  const [rooms, setRooms] = useState('3 غرف');
  const [reArea, setReArea] = useState(140);
  const [userAskingPrice, setUserAskingPrice] = useState<number | ''>('');
  const [result, setResult] = useState<ReturnType<typeof evaluateMarketValue> | null>(null);

  useEffect(() => {
    if (brands.length > 0 && !brands.some(b => b.ar === carBrand)) {
      setCarBrand(brands[0].ar);
    }
  }, [brands]);

  useEffect(() => {
    const evaluated = evaluateMarketValue({
      valType,
      currency,
      carBrand,
      carYear,
      carMileage,
      carCondition,
      locNeighborhood,
      reArea,
      userAskingPrice,
      ads,
    });
    setResult(evaluated);
  }, [valType, currency, carBrand, carYear, carMileage, carCondition, locNeighborhood, propType, rooms, reArea, userAskingPrice, ads]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right" dir="rtl">
      <div className="lg:col-span-6 bg-white border border-[#E3C98D] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#F6F2E8] pb-3">
          <span className="font-extrabold text-xs text-[#0D3B46] flex items-center gap-1.5">
            <Gauge size={14} className="text-[#0D3B46]" />
            تخصيص مواصفات وموقع التقييم
          </span>
          <div className="flex bg-[#F6F2E8] p-0.5 rounded-lg shrink-0">
            {(['$', 'ل.س'] as const).map(curr => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 text-xs font-black rounded-md cursor-pointer ${
                  currency === curr ? 'bg-[#0D3B46] text-white' : 'text-[#C9A15A]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#F6F2E8] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setValType('real-estate')}
            className={`py-2 text-[11px] sm:text-xs font-black rounded-lg cursor-pointer ${
              valType === 'real-estate' ? 'bg-[#0D3B46] text-white' : 'text-[#0D3B46]'
            }`}
          >
            قسم العقارات والمشاريع
          </button>
          <button
            type="button"
            onClick={() => setValType('cars')}
            className={`py-2 text-[11px] sm:text-xs font-black rounded-lg cursor-pointer ${
              valType === 'cars' ? 'bg-[#0D3B46] text-white' : 'text-[#0D3B46]'
            }`}
          >
            قسم المركبات والسيارات
          </button>
        </div>

        <div className="space-y-4">
          {valType === 'cars' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">العلامة التجارية</label>
                <select
                  value={carBrand}
                  onChange={e => setCarBrand(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-semibold outline-none"
                >
                  {brands.map(b => (
                    <option key={b.en} value={b.ar}>
                      {b.ar} ({b.en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">سنة الصنع</label>
                <select
                  value={carYear}
                  onChange={e => setCarYear(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-semibold outline-none"
                >
                  {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2016', '2014', '2012', '2010'].map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">الممشى التراكمي (كم)</label>
                <input
                  type="number"
                  step={5000}
                  value={carMileage}
                  onChange={e => setCarMileage(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-bold font-mono outline-none focus:border-[#C9A15A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">الحالة العامة للآلية</label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { id: 'excellent' as const, name: 'ممتازة خالية العلام' },
                    { id: 'good' as const, name: 'جيدة نظيفة' },
                    { id: 'fair' as const, name: 'مقبولة مستعملة' },
                  ].map(cond => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setCarCondition(cond.id)}
                      className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        carCondition === cond.id
                          ? 'border-[#C9A15A] bg-[#C9A15A]/10 text-[#0D3B46] font-extrabold'
                          : 'border-[#E3C98D] bg-[#F6F2E8] text-[#C9A15A]'
                      }`}
                    >
                      {cond.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">موقع العقار والمنطقة</label>
                <select
                  value={locNeighborhood}
                  onChange={e => setLocNeighborhood(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-semibold outline-none"
                >
                  {SYRIAN_NEIGHBORHOODS.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D3B46]">المساحة الإجمالية (متر مربع)</label>
                <input
                  type="number"
                  value={reArea}
                  onChange={e => setReArea(Math.max(10, Number(e.target.value)))}
                  className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-bold font-mono outline-none focus:border-[#0D3B46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0D3B46]">عدد الغرف</label>
                  <select
                    value={rooms}
                    onChange={e => setRooms(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="1 غرف">غرفة واحدة / ستوديو</option>
                    <option value="2 غرف">غرفتين وصالة</option>
                    <option value="3 غرف">3 غرف وصالة</option>
                    <option value="4 غرف">4 غرف وصالة</option>
                    <option value="5+ غرف">5 غرف فأكثر</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0D3B46]">نوع الملكية</label>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-semibold outline-none"
                  >
                    <option value="شقة">شقة سكنية</option>
                    <option value="بنتهاوس">بنتهاوس</option>
                    <option value="فيلا">فيلا مستقلة</option>
                    <option value="مكتب">مكتب تجاري</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-[#0D3B46]">سعر العرض المقترح للمقارنة (اختياري)</label>
              <span className="text-[10px] text-[#C9A15A] font-semibold">لمقارنته مع متوسط السوق</span>
            </div>
            <input
              type="number"
              placeholder={`أدخل السعر المطلوب بـ ${currency}`}
              value={userAskingPrice}
              onChange={e => setUserAskingPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full h-10 px-3 bg-[#F6F2E8] border border-[#E3C98D] rounded-xl text-xs font-bold font-mono outline-none focus:border-[#C9A15A]"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        {result && (
          <>
            <div className="bg-[#2B2B2B] border border-[#2B2B2B] text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-[#C9A15A] text-white px-2.5 py-0.5 rounded-full font-sans text-[10px] font-black">
                  بناءً على {result.sampleCount} إعلان مرجعي
                </span>
                <span className="text-[#C9A15A] font-bold">القيمة التقديرية في دليلكم</span>
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#C9A15A] font-mono tracking-tight leading-none text-left">
                  {result.fairValue.toLocaleString('en-US')} {currency}
                </h2>
                <div className="flex justify-between text-[11px] font-bold text-[#C9A15A] mt-2">
                  <span>
                    الحد الأعلى: {result.maxBounds.toLocaleString('en-US')} {currency}
                  </span>
                  <span>
                    الحد الأدنى: {result.minBounds.toLocaleString('en-US')} {currency}
                  </span>
                </div>
              </div>

              {result.askingDiffPerc !== null && (
                <div className="p-3 rounded-2xl flex items-center justify-between font-bold text-xs bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A]">
                  <span className="text-[10px]">
                    {result.isOverpriced
                      ? 'السعر المطلوب أعلى من متوسط السوق في دليلكم'
                      : 'السعر المطلوب عادل ومطابق لمتوسط السوق في دليلكم'}
                  </span>
                  <span className="font-mono">
                    {result.askingDiffPerc > 0 ? `+${result.askingDiffPerc}` : result.askingDiffPerc}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E3C98D] rounded-3xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#0D3B46]">حفظ التقرير في قاعدة البيانات</span>
                <span className="text-[11px] text-[#C9A15A] font-semibold">أرشيف التقييمات المرجعية</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onSaveReport({
                    type: valType,
                    title: valType === 'cars' ? `${carBrand} ${carYear}` : `${propType} في ${locNeighborhood}`,
                    specs:
                      valType === 'cars'
                        ? `سنة ${carYear} - ممشى ${carMileage.toLocaleString('en-US')} كم - حالة ${
                            carCondition === 'excellent' ? 'ممتازة' : carCondition === 'good' ? 'جيدة' : 'مقبولة'
                          }`
                        : `${propType} - ${reArea} م² - ${rooms}`,
                    estimatedPrice: result.fairValue,
                    priceRange: [result.minBounds, result.maxBounds],
                  })
                }
                className="w-full h-11 bg-[#0D3B46] hover:bg-[#122538] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-[#C9A15A]" />
                حفظ التقرير في الأرشيف المرجعي
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
