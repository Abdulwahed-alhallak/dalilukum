import React, { useMemo, useState } from 'react';
import { useAds } from '../context/AdsContext';
import { AdCard } from '../components/AdCard';
import { MapPinned, Navigation, Building2, CarFront, Layers, Search } from 'lucide-react';
import { AdItem } from '../types';

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  دمشق: { lat: 33.5138, lng: 36.2765 },
  'ريف دمشق': { lat: 33.58, lng: 36.35 },
  حلب: { lat: 36.2021, lng: 37.1343 },
  حمص: { lat: 34.7324, lng: 36.7137 },
  حماة: { lat: 35.1318, lng: 36.7578 },
  اللاذقية: { lat: 35.5317, lng: 35.7918 },
  طرطوس: { lat: 34.8959, lng: 35.8867 },
  درعا: { lat: 32.6252, lng: 36.1055 },
  السويداء: { lat: 32.709, lng: 36.5695 },
  إدلب: { lat: 35.9306, lng: 36.6339 },
  'دير الزور': { lat: 35.3359, lng: 40.1408 },
  الحسكة: { lat: 36.5072, lng: 40.7489 },
  الرقة: { lat: 35.9594, lng: 39.0079 },
  القنيطرة: { lat: 33.1256, lng: 35.8247 },
};

function resolveCoords(ad?: AdItem | null, cityFilter?: string): { lat: number; lng: number } {
  if (ad?.mapUrl) {
    const match = ad.mapUrl.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }
  const locText = `${ad?.location || ''} ${cityFilter || ''}`;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (locText.includes(city)) {
      return coords;
    }
  }
  return CITY_COORDS['دمشق'];
}

export function MapPage() {
  const { ads } = useAds();
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'real-estate' | 'cars'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (categoryFilter !== 'all' && ad.category !== categoryFilter) return false;
      if (cityFilter !== 'all' && !ad.location?.includes(cityFilter)) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${ad.title} ${ad.location} ${ad.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ads, categoryFilter, cityFilter, searchQuery]);

  const activeAd = useMemo(
    () => filteredAds.find((a) => a.id === selectedAdId) || filteredAds[0] || null,
    [filteredAds, selectedAdId]
  );

  const center = useMemo(
    () => resolveCoords(activeAd, cityFilter !== 'all' ? cityFilter : undefined),
    [activeAd, cityFilter]
  );

  const bbox = useMemo(() => {
    const delta = activeAd ? 0.035 : 0.12;
    const minLon = (center.lng - delta).toFixed(5);
    const minLat = (center.lat - delta).toFixed(5);
    const maxLon = (center.lng + delta).toFixed(5);
    const maxLat = (center.lat + delta).toFixed(5);
    return `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
  }, [center, activeAd]);

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat.toFixed(5)}%2C${center.lng.toFixed(5)}`;

  const availableCities = useMemo(() => {
    const set = new Set<string>(Object.keys(CITY_COORDS));
    ads.forEach((ad) => {
      const part = ad.location?.split(' - ')[0]?.split('،')[0]?.trim();
      if (part) set.add(part);
    });
    return Array.from(set);
  }, [ads]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl border border-[#E5DDCB] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3B46] text-[#C9A15A] flex items-center justify-center shadow-sm">
              <MapPinned size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">خريطة الإعلانات</h2>
              <p className="text-xs text-[#8C7A5B] font-bold">
                {filteredAds.length.toLocaleString('en-US')} موقع نشط على الخريطة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {([
              { id: 'all', label: 'الكل', icon: Layers },
              { id: 'real-estate', label: 'العقارات', icon: Building2 },
              { id: 'cars', label: 'السيارات', icon: CarFront },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-[#0D3B46] text-white border-[#0D3B46]'
                    : 'bg-[#FAF8F4] text-[#2B2B2B] border-[#E5DDCB] hover:border-[#C9A15A]'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A5B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو المنطقة..."
              className="w-full bg-[#FAF8F4] border border-[#E5DDCB] rounded-xl pr-10 pl-3 py-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none focus:border-[#0D3B46]"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            aria-label="تصفية حسب المحافظة"
            className="w-full bg-[#FAF8F4] border border-[#E5DDCB] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#2B2B2B] focus:outline-none focus:border-[#0D3B46]"
          >
            <option value="all">جميع المحافظات</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Map + Active Ad Pin Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5DDCB] overflow-hidden shadow-sm relative min-h-[340px]">
          <iframe
            title="خريطة دليلكم التفاعلية"
            src={mapEmbedUrl}
            className="w-full h-[360px] sm:h-[420px] border-0"
            loading="lazy"
          />
          {activeAd && (
            <div className="p-3.5 bg-[#0D3B46] text-white flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-xs font-black truncate">{activeAd.title}</div>
                <div className="text-[11px] text-[#C9A15A] font-bold truncate">{activeAd.location}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url =
                    activeAd.mapUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeAd.location)}`;
                  window.open(url, '_blank');
                }}
                className="flex items-center gap-1.5 bg-[#C9A15A] hover:bg-[#b58f4a] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Navigation size={14} />
                <span>الملاحة المباشرة</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Location Selector List */}
        <div className="bg-white rounded-2xl border border-[#E5DDCB] p-4 shadow-sm flex flex-col max-h-[470px]">
          <h3 className="text-sm font-black text-[#0D3B46] mb-3">المواقع النشطة</h3>
          <div className="space-y-2.5 overflow-y-auto flex-1 pl-1">
            {filteredAds.map((ad) => {
              const isSelected = activeAd?.id === ad.id;
              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => setSelectedAdId(ad.id)}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0D3B46]/5 border-[#0D3B46] shadow-xs'
                      : 'bg-[#FAF8F4] border-[#F6F2E8] hover:border-[#C9A15A]'
                  }`}
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-stone-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-[#2B2B2B] truncate">{ad.title}</div>
                    <div className="text-[11px] font-bold text-[#8C7A5B] truncate">{ad.location}</div>
                    <div className="text-xs font-black text-[#0D3B46] mt-0.5">
                      {ad.price.toLocaleString('en-US')} {ad.currency}
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredAds.length === 0 && (
              <div className="py-12 text-center text-xs font-bold text-[#8C7A5B]">
                لا توجد مواقع مطابقة للفلتر
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="relative group" onClick={() => setSelectedAdId(ad.id)}>
            <AdCard item={ad} />
            <div className="absolute top-2 left-2 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url =
                    ad.mapUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ad.location)}`;
                  window.open(url, '_blank');
                }}
                className="bg-[#0D3B46] hover:bg-[#092a32] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-colors cursor-pointer"
              >
                فتح الموقع
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
