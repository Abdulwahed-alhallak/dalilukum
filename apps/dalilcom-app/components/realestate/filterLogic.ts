import { AdItem } from '../../context/AppContext';

export type RealEstateCategory = { id: string; ar_name: string; ads_count?: number };

export type EstateFilters = {
  query: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  purpose: string;
  propType: string;
  rooms: string;
  baths: string;
  minArea: string;
  maxArea: string;
};

export const initialEstateFilters: EstateFilters = {
  query: '',
  minPrice: '',
  maxPrice: '',
  location: 'الكل',
  purpose: 'الكل',
  propType: 'الكل',
  rooms: 'الكل',
  baths: 'الكل',
  minArea: '',
  maxArea: '',
};

export const categoryIcons: Record<string, string> = {
  all: 'list',
  apartments: 'business',
  lands: 'map',
  shops: 'storefront',
  villas: 'home',
  buildings: 'business',
  arabic: 'home',
  projects: 'list',
};

const rules: Array<{ id: string; type: string; words: string[] }> = [
  { id: 'projects', type: 'مشروع', words: ['مشاريع', 'مشروع', 'قيد التنفيذ', 'قيد الإنشاء'] },
  { id: 'villas', type: 'فيلا', words: ['فلل', 'فيلا', 'مزارع', 'مزرعة', 'نزهة'] },
  { id: 'lands', type: 'أرض', words: ['أراضي', 'أرض', 'ارض', 'أرضي'] },
  { id: 'shops', type: 'محل', words: ['محلات', 'محل', 'تجاري', 'تجارية'] },
  { id: 'buildings', type: 'بناء', words: ['أبنية', 'بناء', 'عمارة', 'بناية'] },
  { id: 'arabic', type: 'بيت عربي', words: ['بيوت عربية', 'بيت عربي', 'عربية'] },
  { id: 'apartments', type: 'شقة', words: ['شقق', 'شقة', 'سكنية', 'سكني'] },
];

function sourceFor(ad: AdItem) {
  return [
    ad.subcategory,
    ad.title,
    ad.location,
    ad.description,
    ...(ad.details || []),
  ].filter(Boolean).join(' ');
}

export function categoryIdForAd(ad: AdItem) {
  const source = sourceFor(ad);
  return rules.find(rule => rule.words.some(word => source.includes(word)))?.id || 'apartments';
}

export function propTypeForAd(ad: AdItem) {
  return rules.find(rule => rule.id === categoryIdForAd(ad))?.type || 'شقة';
}

export function categoryCounts(ads: AdItem[]) {
  return ads.reduce<Record<string, number>>((acc, ad) => {
    const id = categoryIdForAd(ad);
    acc[id] = (acc[id] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});
}

function hasPurpose(source: string, purpose: string) {
  if (purpose === 'الكل') return true;
  if (purpose === 'للبيع') return source.includes('للبيع') || source.includes('بيع');
  if (purpose === 'للإيجار') return source.includes('للإيجار') || source.includes('ايجار') || source.includes('إيجار');
  return source.includes(purpose);
}

function extractArea(ad: AdItem): number | null {
  if (ad.reNetArea) {
    const num = Number(ad.reNetArea);
    if (!isNaN(num) && num > 0) return num;
  }
  const areaStr = ad.reArea || (ad.details || []).find(d => d.includes('متر') || d.includes('م²') || d.includes('مساحة')) || '';
  const match = areaStr.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function applyEstateFilters(ads: AdItem[], selectedCategory: string | null, filters: EstateFilters) {
  return ads.filter(ad => {
    const source = sourceFor(ad);
    if (selectedCategory && selectedCategory !== 'all' && categoryIdForAd(ad) !== selectedCategory) return false;
    if (filters.query && !source.includes(filters.query)) return false;
    if (filters.location !== 'الكل' && !ad.location.includes(filters.location)) return false;
    if (filters.propType !== 'الكل' && propTypeForAd(ad) !== filters.propType) return false;
    if (!hasPurpose(source, filters.purpose)) return false;
    if (filters.rooms !== 'الكل' && !source.includes(filters.rooms)) return false;
    if (filters.baths !== 'الكل' && !source.includes(filters.baths)) return false;
    if (filters.minPrice && ad.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && ad.price > Number(filters.maxPrice)) return false;
    if (filters.minArea || filters.maxArea) {
      const areaVal = extractArea(ad);
      if (filters.minArea && areaVal !== null && areaVal < Number(filters.minArea)) return false;
      if (filters.maxArea && areaVal !== null && areaVal > Number(filters.maxArea)) return false;
    }
    return true;
  });
}
