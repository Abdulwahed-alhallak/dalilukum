import { AdItem, Category, NotificationItem } from '../types';
export interface CarBrand {
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
  addAd: (ad: Omit<AdItem, 'id' | 'date' | 'isFeatured'>) => void;
  updateAd: (id: string, updatedFields: Partial<AdItem>) => void;
  deleteAd: (id: string) => void;
  getFilteredAds: (filters: FilterCriteria) => AdItem[];
  
  brands: CarBrand[];
  addBrand: (brand: CarBrand) => void;
  updateBrand: (index: number, updated: CarBrand) => void;
  deleteBrand: (index: number) => void;
  
  carModelsMap: Record<string, { ar: string; en: string }[]>;
  updateCarModels: (brandEn: string, models: { ar: string; en: string }[]) => void;
  
  realEstateCats: RealEstateCategory[];
  updateRealEstateCat: (id: string, updated: Partial<RealEstateCategory>) => void;
  
  realEstateSubs: Record<string, RealEstateSubcategory[]>;
  updateRealEstateSubs: (catId: string, subs: RealEstateSubcategory[]) => void;
  
  iconOverrides: Record<string, string>;
  updateIconOverride: (key: string, iconName: string) => void;

  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  
  comparisons: string[];
  toggleComparison: (id: string) => void;
  isInComparison: (id: string) => boolean;
  clearComparisons: () => void;

  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'isRead'>) => void;
  deleteNotification: (id: string) => void;

  userLimits: Record<string, { maxImages: number; maxVideos: number }>;
  updateUserLimit: (phone: string, maxImages: number, maxVideos: number) => void;
  deleteUserLimit: (phone: string) => void;
  defaultLimits: { maxImages: number; maxVideos: number };
  updateDefaultLimits: (maxImages: number, maxVideos: number) => void;
}

export const STORAGE_KEY = 'dalilukum_user_ads_v2';
export const BRANDS_STORAGE_KEY = 'dalilukum_custom_brands_v1';
export const MODELS_STORAGE_KEY = 'dalilukum_custom_models_v1';
export const RE_CATS_STORAGE_KEY = 'dalilukum_custom_re_cats_v1';
export const RE_SUBS_STORAGE_KEY = 'dalilukum_custom_re_subs_v1';
export const ICONS_STORAGE_KEY = 'dalilukum_custom_icons_v1';
export const FAVS_STORAGE_KEY = 'dalilukum_favs_v1';
export const COMPS_STORAGE_KEY = 'dalilukum_comps_v1';
