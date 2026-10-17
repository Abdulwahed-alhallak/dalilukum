import React from 'react';

interface ProjectInputsProps {
  projectStatusState: string;
  setProjectStatusState: (val: string) => void;
  deliveryYearState: string;
  setDeliveryYearState: (val: string) => void;
  projectFloorsState: number | '';
  setProjectFloorsState: (val: number | '') => void;
  projectTypeState: string;
  setProjectTypeState: (val: string) => void;
  paymentPlanState?: string;
  setPaymentPlanState?: (val: string) => void;
  projectFinishingState: string;
  setProjectFinishingState: (val: string) => void;
  projectLandAreaState: number | '';
  setProjectLandAreaState: (val: number | '') => void;
  projectUnitsCountState: number | '';
  setProjectUnitsCountState: (val: number | '') => void;
  projectFacilities?: string[];
  setProjectFacilities?: (val: string[]) => void;
  projectAmenities?: string[];
  setProjectAmenities?: (val: string[]) => void;
}

const FACILITY_OPTIONS = ['مسبح', 'مواقف', 'حراسة', 'نادي', 'ألعاب'];
const AMENITY_OPTIONS = ['مولد', 'بئر', 'حدائق', 'مصاعد', 'عزل'];

export function ProjectInputs({
  projectStatusState, setProjectStatusState,
  deliveryYearState, setDeliveryYearState,
  projectFloorsState, setProjectFloorsState,
  projectTypeState, setProjectTypeState,
  paymentPlanState = '', setPaymentPlanState,
  projectFinishingState, setProjectFinishingState,
  projectLandAreaState, setProjectLandAreaState,
  projectUnitsCountState, setProjectUnitsCountState,
  projectFacilities = [], setProjectFacilities,
  projectAmenities = [], setProjectAmenities,
}: ProjectInputsProps) {
  const toggleItem = (list: string[], item: string, setter?: (val: string[]) => void) => {
    if (!setter) return;
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">مستوى إنجاز المشروع</label>
          <select
            value={projectStatusState}
            onChange={(e) => setProjectStatusState(e.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
          >
            <option value="تحت الأرض / حفر وتأسيس">تأسيس وحفر الأراضي الأولية</option>
            <option value="هيكل وعضم قيد التشبيك">بناء الهياكل والصب (على العظم)</option>
            <option value="كسوة داخلية وتشطيب">مرحلة التشطيبات والكسوة الداخلية</option>
            <option value="جاهز للتسليم خلال أشهر">جاهز للتسليم الفوري القريب جداً</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">السنة المتوقعة للتسليم النهائي</label>
          <select
            value={deliveryYearState}
            onChange={(e) => setDeliveryYearState(e.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
          >
            {['2025', '2026', '2027', '2028', '2029', '2030'].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">عدد طوابق المشروع بالكامل</label>
          <input
            type="number"
            value={projectFloorsState}
            onChange={(e) => setProjectFloorsState(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="مثال: 5"
            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">نوع المشروع</label>
          <select
            value={projectTypeState}
            onChange={(event) => setProjectTypeState(event.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
          >
            <option value="سكني">سكني</option>
            <option value="تجاري">تجاري</option>
            <option value="سياحي / خدمي">سياحي / خدمي</option>
            <option value="صناعي / مستودعات / زراعي">صناعي / مستودعات / زراعي</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">خطة السداد</label>
          <select
            value={paymentPlanState}
            onChange={(event) => setPaymentPlanState?.(event.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
          >
            <option value="">اختر خطة السداد</option>
            <option value="دفعة أولى مع أقساط شهرية">دفعة أولى مع أقساط شهرية</option>
            <option value="أقساط مرنة بدون دفعة أولى">أقساط مرنة بدون دفعة أولى</option>
            <option value="دفع كاش بالكامل مع خصم">دفع كاش بالكامل مع خصم</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">حالة تسليم شقق المشروع</label>
          <select
            value={projectFinishingState}
            onChange={(e) => setProjectFinishingState(e.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
          >
            <option value="على العضم">على العظم بالكامل</option>
            <option value="نصف تشطيب">نصف تشطيب</option>
            <option value="تشطيب ديلوكس / سوبر ديلوكس">تشطيب ديلوكس / سوبر ديلوكس</option>
            <option value="كامل الكسوة والمفروشات">كامل الكسوة والمفروشات</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">مساحة أرض المشروع (م²)</label>
          <input
            type="number"
            value={projectLandAreaState}
            onChange={(e) => setProjectLandAreaState(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="مثال: 4500"
            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">عدد الوحدات أو الشقق الكلي</label>
          <input
            type="number"
            value={projectUnitsCountState}
            onChange={(e) => setProjectUnitsCountState(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="مثال: 40"
            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold font-mono"
          />
        </div>
      </div>

      {setProjectFacilities && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-600 block">مرافق المشروع</label>
          <div className="flex flex-wrap gap-2">
            {FACILITY_OPTIONS.map((fac) => {
              const active = projectFacilities.includes(fac);
              return (
                <button
                  key={fac}
                  type="button"
                  onClick={() => toggleItem(projectFacilities, fac, setProjectFacilities)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    active ? 'bg-[#0D3B46] text-white border-[#0D3B46]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {fac}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {setProjectAmenities && (
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-gray-600 block">المزايا الهندسية والخدمية</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((am) => {
              const active = projectAmenities.includes(am);
              return (
                <button
                  key={am}
                  type="button"
                  onClick={() => toggleItem(projectAmenities, am, setProjectAmenities)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    active ? 'bg-[#C9A15A] text-white border-[#C9A15A]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {am}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
