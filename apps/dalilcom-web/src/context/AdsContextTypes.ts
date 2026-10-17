import { AdItem, Category, NotificationItem } from '../types';

export interface CarBrand {
  id?: number;
  ar: string;
  en: string;
  count: number;
  domain?: string;
  icon?: string;
  image?: string;
}

export interface RealEstateCategory {
  id: string;
  ar: string;
  en: string;
  count: number;
  image?: string;
  icon?: string;
}

export interface RealEstateSubcategory {
  id?: number;
  ar: string;
  en: string;
  count: number;
  image?: string;
}

export interface FilterCriteria {
  query?: string;
  category?: 'all' | Category;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  brand?: string;
  carYear?: string;
  carModel?: string;
  minYear?: string;
  maxYear?: string;
  minMileage?: number;
  maxMileage?: number;
  transmission?: string;
  fuelType?: string;
  rooms?: string;
  bathrooms?: string;
  minArea?: number;
  maxArea?: number;
  purpose?: string;
  isFeatured?: boolean;
  projectStatus?: string;
  deliveryYear?: string;
  projectType?: string;
  projectFinishing?: string;
  subCategory?: string;
}

export interface AdsContextType {
  ads: AdItem[];
  addAd: (ad: Partial<AdItem> & Record<string, any>) => Promise<void>;
  updateAd: (id: string, updatedFields: Partial<AdItem> & Record<string, any>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  getFilteredAds: (filters: FilterCriteria) => AdItem[];
  refresh: () => Promise<void>;

  brands: CarBrand[];
  addBrand: (brand: CarBrand) => Promise<void>;
  updateBrand: (index: number, updated: CarBrand) => Promise<void>;
  deleteBrand: (index: number) => Promise<void>;

  carModelsMap: Record<string, { ar: string; en: string }[]>;
  updateCarModels: (brandEn: string, models: { ar: string; en: string }[]) => Promise<void>;

  realEstateCats: RealEstateCategory[];
  updateRealEstateCat: (id: string, updated: Partial<RealEstateCategory>) => Promise<void>;

  realEstateSubs: Record<string, RealEstateSubcategory[]>;
  updateRealEstateSubs: (catId: string, subs: RealEstateSubcategory[]) => Promise<void>;

  iconOverrides: Record<string, string>;
  updateIconOverride: (key: string, iconName: string) => Promise<void>;

  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;

  comparisons: string[];
  toggleComparison: (id: string) => void;
  isInComparison: (id: string) => boolean;
  clearComparisons: () => void;

  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markAllNotificationsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'isRead'>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  userLimits: Record<string, { userId?: number; maxAds: number; maxImages: number; maxVideos: number }>;
  updateUserLimit: (phone: string, maxImages: number, maxVideos: number, maxAds?: number) => Promise<void>;
  deleteUserLimit: (phone: string) => Promise<void>;
  defaultLimits: { maxAds: number; maxImages: number; maxVideos: number };
  updateDefaultLimits: (maxImages: number, maxVideos: number, maxAds?: number) => Promise<void>;
}

export const STORAGE_KEY = 'dalilukum_user_ads_v2';
export const BRANDS_STORAGE_KEY = 'dalilukum_custom_brands_v1';
export const MODELS_STORAGE_KEY = 'dalilukum_custom_models_v1';
export const RE_CATS_STORAGE_KEY = 'dalilukum_custom_re_cats_v1';
export const RE_SUBS_STORAGE_KEY = 'dalilukum_custom_re_subs_v1';
export const ICONS_STORAGE_KEY = 'dalilukum_custom_icons_v1';
export const FAVS_STORAGE_KEY = 'dalilukum_favs_v1';
export const COMPS_STORAGE_KEY = 'dalilukum_comps_v1';
