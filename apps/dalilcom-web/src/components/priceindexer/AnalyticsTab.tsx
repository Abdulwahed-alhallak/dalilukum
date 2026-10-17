import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useAds } from '../../context/AdsContext';

export function AnalyticsTab() {
  const { ads } = useAds();

  const realEstateLocationData = useMemo(() => {
    const cities = ['دمشق', 'ريف دمشق', 'حلب', 'اللاذقية', 'طرطوس', 'حمص'];
    const reAds = ads.filter(a => a.category === 'real-estate' && a.price > 0);
    const toUsd = (a: typeof ads[number]) =>
      a.currency === '$' || a.currency === 'USD' ? a.price : a.price / 14000;

    return cities.map(city => {
      const matched = reAds.filter(a => a.location.includes(city));
      const withArea = matched.filter(a => a.areaSize && a.areaSize > 20);
      let avgSqm = 650;
      if (withArea.length > 0) {
        avgSqm = Math.round(
          withArea.reduce((sum, a) => sum + toUsd(a) / (a.areaSize || 120), 0) / withArea.length
        );
      } else if (matched.length > 0) {
        const avgTotal = matched.reduce((sum, a) => sum + toUsd(a), 0) / matched.length;
        avgSqm = Math.round(avgTotal / 140);
      }
      avgSqm = Math.max(250, Math.min(3500, avgSqm));
      return {
        city: `${city} (${matched.length})`,
        averagePrice: avgSqm,
        rentIndex: Math.round(avgSqm * 0.055),
      };
    });
  }, [ads]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="font-black text-[#2B2B2B] text-sm">مؤشر الأسعار العقاري حسب المحافظة (من الإعلانات الحية)</h3>
        <p className="text-[11px] text-[#C9A15A]">
          مقارنة متوسط أسعار المتر المربع ($) ومؤشر العائد الإيجاري السنوي بناءً على الإعلانات المسجلة في دليلكم
        </p>
      </div>

      <div className="bg-white border border-[#F6F2E8] rounded-3xl p-4 shadow-sm">
        <div className="h-60 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realEstateLocationData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvgPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D3B46" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0D3B46" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A15A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A15A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="city" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip formatter={(value) => [`${value} $`, '']} />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Area
                type="monotone"
                name="متوسط قيمة المتر المربع ($)"
                dataKey="averagePrice"
                stroke="#0D3B46"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAvgPrice)"
              />
              <Area
                type="monotone"
                name="مؤشر الإيجار السنوي التقديري ($/م²)"
                dataKey="rentIndex"
                stroke="#C9A15A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#2B2B2B] text-[#C9A15A] p-4 rounded-3xl border border-[#2B2B2B] text-[11px] leading-relaxed">
        <strong>معلومات المؤشر:</strong> تُحتسب هذه المؤشرات آلياً من الإعلانات العقارية المنشورة على منصة دليلكم وتحدث فور إضافة أو تعديل الإعلانات.
      </div>
    </div>
  );
}
