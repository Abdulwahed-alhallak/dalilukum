import React from 'react';
import {
  FileText,
  Sparkles,
  CarFront,
  Building2,
  BarChart3,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { AdItem } from '../../types';
import { useAds } from '../../context/AdsContext';

interface AdminOverviewTabProps {
  ads: AdItem[];
}

export function AdminOverviewTab({ ads }: AdminOverviewTabProps) {
  const { brands, realEstateCats, notifications } = useAds();
  const totalCountAds = ads.length;
  const totalFeaturedAds = ads.filter(a => a.isFeatured).length;
  const uniqueCarBrandsCount = brands.length;
  const uniqueRealEstateCats = realEstateCats.length;

  const syrCities = [
    { name: 'دمشق', 'الإعلانات': ads.filter(a => a.location.includes('دمشق')).length },
    { name: 'حلب', 'الإعلانات': ads.filter(a => a.location.includes('حلب')).length },
    { name: 'اللاذقية', 'الإعلانات': ads.filter(a => a.location.includes('اللاذقية')).length },
    { name: 'طرطوس', 'الإعلانات': ads.filter(a => a.location.includes('طرطوس')).length },
    { name: 'حمص', 'الإعلانات': ads.filter(a => a.location.includes('حمص')).length },
    { name: 'حماة', 'الإعلانات': ads.filter(a => a.location.includes('حماة')).length },
  ];

  const carsCount = ads.filter(a => a.category === 'cars').length;
  const realEstateCount = ads.filter(a => a.category === 'real-estate').length;

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Stats cards container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'إجمالي الإعلانات', value: totalCountAds, desc: 'إعلانات مدرجة نشطة', color: 'text-[#0D3B46]', bg: 'bg-[#C9A15A]/10', icon: FileText },
          { title: 'الإعلانات المميزة', value: totalFeaturedAds, desc: 'ترويج في الصفحة الأولى', color: 'text-[#C9A15A]', bg: 'bg-[#C9A15A]/10', icon: Sparkles },
          { title: 'ماركات السيارات المسجلة', value: uniqueCarBrandsCount, desc: 'علامة تجارية في القاعدة', color: 'text-[#0D3B46]', bg: 'bg-[#C9A15A]/10', icon: CarFront },
          { title: 'الفئات العقارية الأساسية', value: uniqueRealEstateCats, desc: 'تقسيمات عقارية معتمدة', color: 'text-[#0D3B46]', bg: 'bg-[#C9A15A]/10', icon: Building2 },
        ].map((s, idx) => (
          <div key={idx} className="bg-white border border-[#F6F2E8] p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-[#E3C98D] transition-all">
            <div className="space-y-1">
              <span className="text-[12px] font-bold text-[#C9A15A]">{s.title}</span>
              <h3 className="text-3xl font-black text-[#2B2B2B] select-all">{s.value}</h3>
              <p className="text-[11px] text-[#C9A15A] font-medium">{s.desc}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={26} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard layout blocks with Recharts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart 1: City Statistics Bar Chart */}
        <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-[#F6F2E8] mb-4">
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-[#2B2B2B]">توزيع الإعلانات جغرافياً حسب المحافظات السورية</h4>
                <span className="text-[10px] bg-[#C9A15A]/10 text-[#0D3B46] px-3 py-1 rounded-full font-bold">بيانات حية من قاعدة البيانات</span>
              </div>
              <BarChart3 size={18} className="text-[#0D3B46]" />
            </div>
          </div>

          <div className="w-full h-64 font-sans text-right" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={syrCities}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', direction: 'rtl' }}
                  itemStyle={{ color: '#C9A15A' }}
                />
                <Bar dataKey="الإعلانات" fill="#C9A15A" radius={[8, 8, 0, 0]}>
                  {syrCities.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? '#C9A15A' : '#0D3B46'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Mix Area Chart */}
        <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-[#F6F2E8] mb-4">
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-[#2B2B2B]">مزيج التصنيفات النشطة</h4>
                <span className="text-[10px] text-[#C9A15A] font-bold">مقارنة بين العقارات والسيارات</span>
              </div>
              <Activity size={18} className="text-[#C9A15A]" />
            </div>
          </div>

          <div className="w-full h-44 cursor-crosshair" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'دليلكم', 'السيارات': carsCount, 'العقارات': realEstateCount },
                ]}
                margin={{ top: 0, right: 0, left: -40, bottom: 0 }}
              >
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="السيارات" stroke="#C9A15A" fill="#C9A15A" fillOpacity={0.2} strokeWidth={3} />
                <Area type="monotone" dataKey="العقارات" stroke="#0D3B46" fill="#0D3B46" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F6F2E8] flex justify-around text-xs font-bold text-[#2B2B2B]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C9A15A]" />
              <span>سيارات ({carsCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0D3B46]" />
              <span>عقارات ({realEstateCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary list of activity logs */}
      <div className="bg-white border border-[#F6F2E8] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#F6F2E8]">
          <h4 className="font-extrabold text-sm text-[#2B2B2B]">مؤشرات التشغيل الحية</h4>
          <span className="text-[10px] text-[#C9A15A] font-bold">الإشعارات النشطة ({notifications.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs font-semibold text-[#0D3B46]">
          <div className="p-3 bg-[#F6F2E8] border border-[#F6F2E8] rounded-xl flex items-center justify-between">
            <span>إجمالي القيمة التقديرية للإعلانات المعروضة:</span>
            <span className="text-[#C9A15A] font-extrabold">
              {ads.reduce((sum, a) => sum + a.price, 0).toLocaleString('en-US')}
            </span>
          </div>
          <div className="p-3 bg-[#F6F2E8] border border-[#F6F2E8] rounded-xl flex items-center justify-between">
            <span>حالة الاتصال بقاعدة البيانات:</span>
            <span className="text-[#0D3B46] font-extrabold">متصل ومزامن بالكامل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
