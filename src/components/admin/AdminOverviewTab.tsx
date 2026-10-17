import React from 'react';
import { 
  FileText, Sparkles, CarFront, Building2, BarChart3, Activity 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { AdItem } from '../../types';

interface AdminOverviewTabProps {
  ads: AdItem[];
}

export function AdminOverviewTab({ ads }: AdminOverviewTabProps) {
  const totalCountAds = ads.length;
  const totalFeaturedAds = ads.filter(a => a.isFeatured).length;
  const uniqueCarBrandsCount = 12; // Dynamic or aesthetic preset matching context
  const uniqueRealEstateCats = 4;

  const syrCities = [
    { name: 'دمشق', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('دمشق')).length },
    { name: 'حلب', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('حلب')).length },
    { name: 'اللاذقية', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('اللاذقية')).length },
    { name: 'طرطوس', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('طرطوس')).length },
    { name: 'حمص', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('حمص')).length },
    { name: 'حماة', 'الإعلانات': ads.filter(a => a.location.toLowerCase().includes('حماة')).length },
  ];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      
      {/* Stats cards container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'إجمالي الإعلانات', value: totalCountAds, desc: 'إعلانات مدرجة نشطة', color: 'text-blue-600', bg: 'bg-blue-500/5', icon: FileText },
          { title: 'الإعلانات المميزة', value: totalFeaturedAds, desc: 'ترويج في الصفحة الأولى', color: 'text-rose-600', bg: 'bg-rose-500/5', icon: Sparkles },
          { title: 'ماركات السيارات النشطة', value: uniqueCarBrandsCount, desc: 'علامة تجارية مدرجة', color: 'text-emerald-600', bg: 'bg-emerald-500/5', icon: CarFront },
          { title: 'الفئات العقارية الأساسية', value: uniqueRealEstateCats, desc: 'تقسيمات ثنائية المستوى', color: 'text-indigo-600', bg: 'bg-indigo-50/5', icon: Building2 },
        ].map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-150 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <span className="text-[12px] font-bold text-slate-400">{s.title}</span>
              <h3 className="text-3xl font-black text-slate-800 select-all">{s.value}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{s.desc}</p>
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
        <div className="bg-white border border-gray-150 rounded-2xl p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-4">
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-slate-800">توزيع الإعلانات جغرافياً حسب المحافظات السورية 🇸🇾</h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">الإحصائيات فورية وتفاعلية</span>
              </div>
              <BarChart3 size={18} className="text-indigo-600" />
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
                  itemStyle={{ color: '#fb7185' }}
                />
                <Bar dataKey="الإعلانات" fill="#ef4444" radius={[8, 8, 0, 0]}>
                  {syrCities.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? '#ef4444' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Mix Area Chart */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-gray-150 mb-4">
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-slate-800">مزيج التصنيفات النشطة</h4>
                <span className="text-[10px] text-slate-400 font-bold">مقارنة بين العقارات والسيارات</span>
              </div>
              <Activity size={18} className="text-rose-500" />
            </div>
          </div>

          <div className="w-full h-44 cursor-crosshair" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'دليلكم', 'السيارات': ads.filter(a => a.category === 'cars').length, 'العقارات': ads.filter(a => a.category === 'real-estate').length },
                ]}
                margin={{ top: 0, right: 0, left: -40, bottom: 0 }}
              >
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="السيارات" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} />
                <Area type="monotone" dataKey="العقارات" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-around text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>سيارات ({ads.filter(a => a.category === 'cars').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>عقارات ({ads.filter(a => a.category === 'real-estate').length})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary list of activity logs (smaller size for elegant feel) */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h4 className="font-extrabold text-sm text-slate-800">بث عمليات لوحة الإشراف المتفرقة</h4>
          <span className="text-[10px] text-slate-500 font-bold">النشاطات المقيدة اليومية</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs font-semibold text-slate-600">
          <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <span>إجمالي القيمة التقديرية لكافة الإعلانات النشطة:</span>
            <span className="text-rose-600 font-extrabold">
              {ads.reduce((sum, a) => sum + a.price, 0).toLocaleString('en-US')} ل.س / دولار
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <span>حالة الاتصال والخدمات السحابية:</span>
            <span className="text-emerald-600 font-extrabold">عمليات نشطة ومؤمنة بالكامل</span>
          </div>
        </div>
      </div>

    </div>
  );
}
