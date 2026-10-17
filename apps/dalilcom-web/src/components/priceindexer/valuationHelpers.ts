import { AdItem } from '../../types';

export const SYRIAN_NEIGHBORHOODS = [
  { value: 'دمشق - مشروع دمر', label: 'دمشق — مشروع دمر' },
  { value: 'دمشق - المزة', label: 'دمشق — المزة' },
  { value: 'دمشق - المالكي وأبو رمانة', label: 'دمشق — المالكي وأبو رمانة' },
  { value: 'دمشق - كفرسوسة', label: 'دمشق — كفرسوسة' },
  { value: 'ريف دمشق - يعفور والصبورة', label: 'ريف دمشق — يعفور والصبورة' },
  { value: 'حلب - الشهباء والفرقان', label: 'حلب — الشهباء والفرقان' },
  { value: 'اللاذقية - الكورنيش والمشروع العاشر', label: 'اللاذقية — الكورنيش والمشروع العاشر' },
  { value: 'طرطوس - المشبكة والكورنيش', label: 'طرطوس — المشبكة والكورنيش' },
  { value: 'حمص - الإنشاءات والحمرا', label: 'حمص — الإنشاءات والحمرا' },
  { value: 'حماة - القصور والشريعة', label: 'حماة — القصور والشريعة' },
];

interface EvaluateParams {
  valType: 'cars' | 'real-estate';
  currency: 'ل.س' | '$';
  carBrand: string;
  carYear: string;
  carMileage: number;
  carCondition: 'excellent' | 'good' | 'fair';
  locNeighborhood: string;
  reArea: number;
  userAskingPrice: number | '';
  ads?: AdItem[];
}

export function evaluateMarketValue({
  valType,
  currency,
  carBrand,
  carYear,
  carMileage,
  carCondition,
  locNeighborhood,
  reArea,
  userAskingPrice,
  ads = [],
}: EvaluateParams) {
  const exchangeRate = 14000;
  const multiplier = currency === '$' ? 1 : exchangeRate;

  // Normalize ad price into USD for statistical comparison
  const toUsd = (ad: AdItem) => {
    if (ad.currency === '$' || ad.currency === 'USD') return ad.price;
    return ad.price / exchangeRate;
  };

  let priceBaseUsd = 0;
  let matchedAdsCount = 0;

  if (valType === 'cars') {
    const carAds = ads.filter(a => a.category === 'cars' && a.price > 0);
    const brandMatches = carAds.filter(
      a => a.carBrand === carBrand || a.title.includes(carBrand)
    );
    matchedAdsCount = brandMatches.length || carAds.length;

    let brandBaseUsd = 20000;
    if (brandMatches.length > 0) {
      brandBaseUsd =
        brandMatches.reduce((sum, a) => sum + toUsd(a), 0) / brandMatches.length;
    } else if (carAds.length > 0) {
      brandBaseUsd =
        carAds.reduce((sum, a) => sum + toUsd(a), 0) / carAds.length;
    }

    const yearDiff = Math.max(0, new Date().getFullYear() - parseInt(carYear, 10));
    const yearFactor = Math.pow(0.93, yearDiff);
    const mileageFactor = Math.max(0.65, 1 - carMileage / 350000);
    const condFactor =
      carCondition === 'excellent' ? 1.0 : carCondition === 'good' ? 0.9 : 0.78;

    priceBaseUsd = brandBaseUsd * yearFactor * mileageFactor * condFactor;
  } else {
    const reAds = ads.filter(a => a.category === 'real-estate' && a.price > 0);
    const cityPrefix = locNeighborhood.split('-')[0].trim();
    const cityMatches = reAds.filter(a => a.location.includes(cityPrefix));
    matchedAdsCount = cityMatches.length || reAds.length;

    // Compute average price per sqm from real ads that have areaSize
    const pool = cityMatches.length > 0 ? cityMatches : reAds;
    const withArea = pool.filter(a => a.areaSize && a.areaSize > 20);

    let avgSqmUsd = 650;
    if (withArea.length > 0) {
      avgSqmUsd =
        withArea.reduce((sum, a) => sum + toUsd(a) / (a.areaSize || 100), 0) /
        withArea.length;
    } else if (pool.length > 0) {
      const avgTotalUsd = pool.reduce((sum, a) => sum + toUsd(a), 0) / pool.length;
      avgSqmUsd = avgTotalUsd / 140;
    }

    // Clamp to realistic market bounds ($200 - $3500 / sqm)
    avgSqmUsd = Math.max(200, Math.min(3500, avgSqmUsd));
    priceBaseUsd = reArea * avgSqmUsd;
  }

  const priceBase = Math.round(priceBaseUsd * multiplier);
  const minBounds = Math.round(priceBase * 0.92);
  const maxBounds = Math.round(priceBase * 1.08);

  let isOverpriced = false;
  let askingDiffPerc: number | null = null;
  if (userAskingPrice && userAskingPrice > 0 && priceBase > 0) {
    askingDiffPerc = Math.round(((Number(userAskingPrice) - priceBase) / priceBase) * 100);
    isOverpriced = Number(userAskingPrice) > maxBounds;
  }

  return {
    fairValue: priceBase,
    minBounds,
    maxBounds,
    confidence: matchedAdsCount >= 3 ? 'high' : 'medium',
    isOverpriced,
    askingDiffPerc,
    sampleCount: matchedAdsCount,
    roi: valType === 'real-estate' ? 6.5 : undefined,
  };
}
