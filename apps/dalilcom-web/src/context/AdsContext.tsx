import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AdItem, NotificationItem } from '../types';
import { api, listApi } from '../lib/api';
import { filterAds } from './AdsFilterHelper';
import { AdsContextType, CarBrand, FilterCriteria, RealEstateCategory, RealEstateSubcategory } from './AdsContextTypes';
export type { CarBrand, RealEstateCategory, RealEstateSubcategory, FilterCriteria };
const AdsContext = createContext<AdsContextType | undefined>(undefined);
const mapBrand = (row: any): CarBrand => ({ ar: row.ar_name, en: row.en_name, count: row.ads_count, domain: row.domain, icon: row.icon, image: row.image_url });
const mapCategory = (row: any): RealEstateCategory => ({ id: row.id, ar: row.ar_name, en: row.en_name, count: row.ads_count, image: row.image_url, icon: row.icon });
const mapSub = (row: any): RealEstateSubcategory => ({ ar: row.ar_name, en: row.en_name, count: row.ads_count, image: row.image_url });
const mapNotif = (row: any): NotificationItem => ({ id: row.id, title: row.title, body: row.body, date: row.display_date || row.created_at, isRead: Boolean(row.is_read) });
const cleanDetails = (items: any[]) => items.map((detail: any) => detail?.detail_text || detail).filter(Boolean);
const specDetails = (ad: any, specs: any = {}, reSpecs: any = {}) => {
  const items = ad.category === 'cars' ? [
    specs.brand_name, specs.model_name, specs.model_year, specs.transmission, specs.fuel_type,
    specs.mileage ? `${specs.mileage} كم` : null, specs.body_type, specs.car_condition,
    specs.car_type, specs.color, specs.engine_size, specs.engine_power,
    specs.drive_type, specs.has_warranty, specs.advertiser_type,
  ] : [
    reSpecs.property_type, reSpecs.rooms, reSpecs.bathrooms, reSpecs.area_text,
    reSpecs.floor, reSpecs.total_floors, reSpecs.furnished, reSpecs.building_age,
    reSpecs.re_type, reSpecs.net_area, reSpecs.heating_type, reSpecs.title_deed_type,
    reSpecs.advertiser_type, reSpecs.property_direction, reSpecs.has_elevator, reSpecs.has_parking,
    specs.buildingTotalFloors, specs.bedsCount, specs.minNetArea, specs.maxNetArea,
    specs.heatingType, specs.kitchenType, specs.balconyCount, specs.hasElevator,
    specs.hasParking, specs.houseStatus, specs.inComplex, specs.titleDeedType,
    specs.propertyDirection, specs.advertiserType, specs.villaFloors, specs.landZoning,
    specs.landFrontage, specs.officeFitted, specs.shopHasLicense, specs.minArea,
    specs.maxArea, specs.projectType, specs.paymentPlan,
    Array.isArray(specs.projectFacilities) ? specs.projectFacilities.join(', ') : specs.projectFacilities,
    Array.isArray(specs.projectAmenities) ? specs.projectAmenities.join(', ') : specs.projectAmenities,
  ];
  return items.filter(Boolean).map(String);
};
const requestDetails = (category: string, specs: any = {}, details: string[] = []) => {
  const fromSpecs = category === 'cars' ? [
    specs.brand, specs.model, specs.year, specs.gear, specs.fuel,
    specs.carMileage ? `${specs.carMileage} كم` : null, specs.carBodyType,
    specs.carCondition, specs.carType, specs.carColor, specs.engineSize,
    specs.enginePower, specs.carDrive, specs.carWarranty, specs.carAdvertiser,
  ] : [
    specs.propType, specs.reRooms, specs.reBaths, specs.reArea, specs.reFloor,
    specs.reFurnished, specs.reBuildingAge, specs.reType, specs.projectStatus,
    specs.deliveryYear ? `تسليم ${specs.deliveryYear}` : null,
    specs.projectFloors ? `${specs.projectFloors} طوابق` : null,
    specs.projectFinishing, specs.projectLandArea ? `${specs.projectLandArea} م² أرض` : null,
    specs.projectUnitsCount ? `${specs.projectUnitsCount} وحدة` : null,
    specs.buildingTotalFloors, specs.bedsCount, specs.minNetArea, specs.maxNetArea,
    specs.heatingType, specs.kitchenType, specs.balconyCount, specs.hasElevator,
    specs.hasParking, specs.houseStatus, specs.inComplex, specs.titleDeedType,
    specs.propertyDirection, specs.advertiserType, specs.villaFloors, specs.landZoning,
    specs.landFrontage, specs.officeFitted, specs.shopHasLicense, specs.minArea,
    specs.maxArea, specs.projectType, specs.paymentPlan,
    Array.isArray(specs.projectFacilities) ? specs.projectFacilities.join(', ') : specs.projectFacilities,
    Array.isArray(specs.projectAmenities) ? specs.projectAmenities.join(', ') : specs.projectAmenities,
  ];
  return Array.from(new Set([...details, ...fromSpecs.filter(Boolean).map(String)]));
};
const mapAd = (row: any): AdItem => {
  const ad = row.ad || row;
  const specs = row.car_specs || ad.car_specs || {};
  const reSpecs = row.real_estate_specs || ad.real_estate_specs || {};
  const images = row.images || ad.images || [];
  const videos = row.videos || ad.videos || [];
  const details = row.details || ad.details || [];
  const mappedDetails = cleanDetails(details);
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: Number(ad.price),
    currency: ad.currency,
    location: ad.location,
    category: ad.category,
    imageUrl: ad.cover_image_url || images[0]?.image_url || '',
    imageUrls: images.map((img: any) => img.image_url).filter(Boolean),
    videoUrl: videos[0]?.video_url || ad.video_url,
    isFeatured: Boolean(ad.is_featured),
    date: String(ad.published_on || ad.created_at || '').slice(0, 10),
    details: mappedDetails.length ? mappedDetails : specDetails(ad, specs, reSpecs),
    subCategory: ad.subcategory,
    purpose: ad.purpose,
    carBrand: specs.brand_name,
    carModel: specs.model_name,
    carYear: specs.model_year,
    carGear: specs.transmission,
    carFuel: specs.fuel_type,
    carMileage: specs.mileage,
    carBodyType: specs.body_type,
    carCondition: specs.car_condition,
    carType: specs.car_type,
    carColor: specs.color,
    engineSize: specs.engine_size,
    enginePower: specs.engine_power,
    carDrive: specs.drive_type,
    carWarranty: specs.has_warranty,
    carAdvertiser: specs.advertiser_type,
    propType: reSpecs.property_type,
    reRooms: reSpecs.rooms,
    reBaths: reSpecs.bathrooms,
    reArea: reSpecs.area_text,
    reNetArea: reSpecs.net_area,
    reFloor: reSpecs.floor,
    buildingTotalFloors: reSpecs.total_floors,
    reFurnished: reSpecs.furnished,
    reBuildingAge: reSpecs.building_age,
    reType: reSpecs.re_type,
    titleDeedType: reSpecs.title_deed_type,
    advertiserType: reSpecs.advertiser_type,
    heatingType: reSpecs.heating_type,
    propertyDirection: reSpecs.property_direction,
    hasElevator: reSpecs.has_elevator,
    hasParking: reSpecs.has_parking,
    ownerPhone: ad.owner_phone || '',
    whatsappPhone: ad.whatsapp_phone || '',
  };
};
export function AdsProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [carModelsMap, setCarModelsMap] = useState<Record<string, { ar: string; en: string }[]>>({});
  const [realEstateCats, setRealEstateCats] = useState<RealEstateCategory[]>([]);
  const [realEstateSubs, setRealEstateSubs] = useState<Record<string, RealEstateSubcategory[]>>({});
  const [iconOverrides, setIconOverrides] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userLimits, setUserLimits] = useState<Record<string, { maxImages: number; maxVideos: number }>>({});
  const [defaultLimits, setDefaultLimits] = useState({ maxImages: 3, maxVideos: 1 });
  const refresh = async () => {
    try {
      const [adRows, brandRows, modelRows, catRows, subRows, notifRows, limitRows, defaults, icons, favRows] = await Promise.all([
        listApi<any>('/ads?per_page=200').catch(() => []),
        listApi<any>('/car-brands?per_page=200').catch(() => []),
        listApi<any>('/car-models?per_page=1000').catch(() => []),
        listApi<any>('/real-estate/categories?per_page=200').catch(() => []),
        listApi<any>('/real-estate/subcategories?per_page=500').catch(() => []),
        listApi<any>('/notifications?per_page=200').catch(() => []),
        listApi<any>('/user-limits?per_page=200').catch(() => []),
        listApi<any>('/default-limits?per_page=1').catch(() => []),
        listApi<any>('/icon-overrides?per_page=500').catch(() => []),
        listApi<any>('/favorites?per_page=500').catch(() => []),
      ]);
      const brandList = brandRows.map(mapBrand);
      const models = modelRows.reduce((acc: any, row: any) => {
        const brand = brandRows.find((b: any) => b.id === row.brand_id)?.en_name;
        if (brand) acc[brand] = [...(acc[brand] || []), { ar: row.ar_name, en: row.en_name }];
        return acc;
      }, {});
      setAds(adRows.map(mapAd));
      setBrands(brandList);
      setCarModelsMap(models);
      setRealEstateCats(catRows.map(mapCategory));
      setRealEstateSubs(subRows.reduce((acc: any, row: any) => ({ ...acc, [row.category_id]: [...(acc[row.category_id] || []), mapSub(row)] }), {}));
      setNotifications(
        notifRows
          .filter((r: any) => r && r.title && String(r.title).trim() !== '')
          .map(mapNotif)
      );
      setUserLimits(limitRows.reduce((acc: any, row: any) => ({ ...acc, [String(row.user_id)]: { maxImages: row.max_images, maxVideos: row.max_videos } }), {}));

      if (defaults[0]) setDefaultLimits({ maxImages: defaults[0].max_images, maxVideos: defaults[0].max_videos });
      setIconOverrides(icons.reduce((acc: any, row: any) => ({ ...acc, [row.override_key]: row.icon_name }), {}));
      setFavorites(favRows.map((row: any) => row.ad_id).filter(Boolean));
    } catch (e) { console.error(e); }
  };
  useEffect(() => { refresh().catch(console.error); }, []);
  const addAd: AdsContextType['addAd'] = async (ad: any) => {
    const payload = {
      category: ad.category,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      currency: ad.currency,
      location: ad.location,
      subcategory: ad.subCategory,
      purpose: ad.purpose,
      cover_image_url: ad.image || ad.imageUrl,
      published_on: new Date().toISOString().slice(0, 10),
      images: ad.images || ad.imageUrls || [ad.image || ad.imageUrl].filter(Boolean),
      videos: ad.videos || ad.videoUrls || [ad.video || ad.videoUrl].filter(Boolean),
      details: requestDetails(ad.category, ad.specs, ad.details || []),
      specs: ad.specs || {},
      owner_phone: ad.ownerPhone,
      whatsapp_phone: ad.whatsappPhone,
    };
    const created = await api.post<any>('/ads', payload);
    const mapped = mapAd(created.ad ? { ...created.ad, images: created.images, videos: created.videos, details: created.details, car_specs: created.car_specs, real_estate_specs: created.real_estate_specs } : created);
    setAds(prev => [mapped, ...prev]);
  };
  const updateAd = async (id: string, fields: Partial<AdItem>) => {
    const payload: Record<string, any> = { ...fields };
    if ('isFeatured' in payload) {
      payload.is_featured = payload.isFeatured;
      delete payload.isFeatured;
    }
    if ('imageUrl' in payload) {
      payload.cover_image_url = payload.imageUrl;
      delete payload.imageUrl;
    }
    if ('subCategory' in payload) {
      payload.subcategory = payload.subCategory;
      delete payload.subCategory;
    }
    if ('ownerPhone' in payload) {
      payload.owner_phone = payload.ownerPhone;
      delete payload.ownerPhone;
    }
    if ('whatsappPhone' in payload) {
      payload.whatsapp_phone = payload.whatsappPhone;
      delete payload.whatsappPhone;
    }
    await api.put(`/ads/${id}`, payload);
    await refresh();
  };
  const deleteAd = async (id: string) => { await api.delete(`/ads/${id}`); setAds(prev => prev.filter(ad => ad.id !== id)); };
  const addBrand = async (brand: CarBrand) => { await api.post('/car-brands', { ar_name: brand.ar, en_name: brand.en, ads_count: brand.count, domain: brand.domain, icon: brand.icon, image_url: brand.image }); await refresh(); };
  const updateBrand = async (idx: number, brand: CarBrand) => { const row = brands[idx]; await api.put(`/car-brands/${(row as any).id || idx + 1}`, { ar_name: brand.ar, en_name: brand.en, ads_count: brand.count, domain: brand.domain, icon: brand.icon, image_url: brand.image }); await refresh(); };
  const deleteBrand = async (idx: number) => { await api.delete(`/car-brands/${idx + 1}`); await refresh(); };
  const updateCarModels = async () => refresh();
  const updateRealEstateCat = async (id: string, data: Partial<RealEstateCategory>) => { await api.put(`/real-estate/categories/${id}`, { ar_name: data.ar, en_name: data.en, ads_count: data.count, image_url: data.image, icon: data.icon }); await refresh(); };
  const updateRealEstateSubs = async () => refresh();
  const updateIconOverride = async (key: string, iconName: string) => { await api.post('/icon-overrides', { override_key: key, icon_name: iconName }); setIconOverrides(prev => ({ ...prev, [key]: iconName })); };
  const addNotification = async (notif: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const newId = `notif-${Date.now()}`;
    await api.post('/notifications', { id: newId, title: notif.title, body: notif.body, display_date: notif.date || 'الآن', is_read: 0 });
    setNotifications(prev => [{ id: newId, title: notif.title, body: notif.body, date: notif.date || 'الآن', isRead: false }, ...prev]);
  };
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await api.delete(`/notifications/${id}`).catch(() => null);
  };
  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await Promise.all(unread.map(n => api.put(`/notifications/${n.id}`, { is_read: 1 }).catch(() => null)));
  };
  const clearAllNotifications = async () => {
    const current = [...notifications];
    setNotifications([]);
    await Promise.all(current.map(n => api.delete(`/notifications/${n.id}`).catch(() => null)));
  };
  const toggleFavorite = async (id: string) => {
    const exists = favorites.includes(id);
    setFavorites(prev => exists ? prev.filter(x => x !== id) : [...prev, id]);
    try {
      if (exists) {
        await api.delete(`/favorites/${encodeURIComponent(id)}`);
      } else {
        await api.post('/favorites', { ad_id: id });
      }
    } catch (e) {
      setFavorites(prev => exists ? [...prev, id] : prev.filter(x => x !== id));
      console.error(e);
    }
  };

  const toggleComparison = (id: string) => setComparisons(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]);
  const value = useMemo(() => ({
    ads, addAd, updateAd, deleteAd, getFilteredAds: (criteria: FilterCriteria) => filterAds(ads, criteria, brands, carModelsMap),
    brands, addBrand, updateBrand, deleteBrand, carModelsMap, updateCarModels,
    realEstateCats, updateRealEstateCat, realEstateSubs, updateRealEstateSubs,
    iconOverrides, updateIconOverride, favorites, toggleFavorite, isFavorite: (id: string) => favorites.includes(id),
    comparisons, toggleComparison, isInComparison: (id: string) => comparisons.includes(id), clearComparisons: () => setComparisons([]),
    notifications, unreadNotificationsCount: notifications.filter(n => !n.isRead).length,
    markAllNotificationsRead, clearAllNotifications, addNotification, deleteNotification,
    userLimits, updateUserLimit: () => refresh(), deleteUserLimit: () => refresh(), defaultLimits, updateDefaultLimits: () => refresh(),
  }), [ads, brands, carModelsMap, realEstateCats, realEstateSubs, iconOverrides, favorites, comparisons, notifications, userLimits, defaultLimits]);
  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}
export function useAds() { const context = useContext(AdsContext); if (!context) throw new Error('useAds must be used within an AdsProvider'); return context; }
