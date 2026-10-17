import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AdItem, NotificationItem } from '../types';
import { api, listApi } from '../lib/api';
import { filterAds } from './AdsFilterHelper';
import { AdsContextType, CarBrand, FilterCriteria, RealEstateCategory, RealEstateSubcategory } from './AdsContextTypes';

export type { CarBrand, RealEstateCategory, RealEstateSubcategory, FilterCriteria };

const AdsContext = createContext<AdsContextType | undefined>(undefined);

const mapBrand = (row: any): CarBrand => ({
  id: Number(row.id),
  ar: row.ar_name,
  en: row.en_name,
  count: Number(row.ads_count || 0),
  domain: row.domain || undefined,
  icon: row.icon || undefined,
  image: row.image_url || undefined,
});

const mapCategory = (row: any): RealEstateCategory => ({
  id: String(row.id),
  ar: row.ar_name,
  en: row.en_name,
  count: Number(row.ads_count || 0),
  image: row.image_url || undefined,
  icon: row.icon || undefined,
});

const mapSub = (row: any): RealEstateSubcategory => ({
  id: Number(row.id),
  ar: row.ar_name,
  en: row.en_name,
  count: Number(row.ads_count || 0),
  image: row.image_url || undefined,
});

const mapNotif = (row: any): NotificationItem => ({
  id: String(row.id),
  title: row.title,
  body: row.body,
  date: row.display_date || String(row.created_at || '').slice(0, 10),
  isRead: Boolean(row.is_read),
});

const cleanDetails = (items: any[]) =>
  items.map((detail: any) => detail?.detail_text || detail).filter(Boolean);

const specDetails = (ad: any, specs: any = {}, reSpecs: any = {}, projSpecs: any = {}) => {
  const items = ad.category === 'cars'
    ? [
        specs.brand_name,
        specs.model_name,
        specs.model_year,
        specs.transmission,
        specs.fuel_type,
        specs.mileage ? `${specs.mileage} كم` : null,
        specs.body_type,
        specs.car_condition,
        specs.car_type,
        specs.color,
        specs.engine_size,
        specs.engine_power,
        specs.drive_type,
        specs.has_warranty ? 'تحت الكفالة' : null,
        specs.advertiser_type,
      ]
    : [
        reSpecs.property_type,
        reSpecs.rooms,
        reSpecs.bathrooms,
        reSpecs.area_text,
        reSpecs.floor,
        reSpecs.total_floors,
        reSpecs.furnished,
        reSpecs.building_age,
        reSpecs.re_type,
        reSpecs.net_area ? `${reSpecs.net_area} م² صافي` : null,
        reSpecs.heating_type,
        reSpecs.title_deed_type,
        reSpecs.advertiser_type,
        reSpecs.property_direction,
        reSpecs.has_elevator ? 'مصعد' : null,
        reSpecs.has_parking ? 'موقف سيارات' : null,
        projSpecs?.project_status,
        projSpecs?.delivery_year ? `تسليم ${projSpecs.delivery_year}` : null,
        projSpecs?.project_floors ? `${projSpecs.project_floors} طوابق` : null,
        projSpecs?.project_finishing,
        projSpecs?.payment_plan,
      ];
  return items.filter(Boolean).map(String);
};

const requestDetails = (category: string, specs: any = {}, details: string[] = []) => {
  const fromSpecs = category === 'cars'
    ? [
        specs.brand,
        specs.model,
        specs.year,
        specs.gear,
        specs.fuel,
        specs.carMileage ? `${specs.carMileage} كم` : null,
        specs.carBodyType,
        specs.carCondition,
        specs.carType,
        specs.carColor,
        specs.engineSize,
        specs.enginePower,
        specs.carDrive,
        specs.carWarranty,
        specs.carAdvertiser,
      ]
    : [
        specs.propType,
        specs.reRooms,
        specs.reBaths,
        specs.reArea,
        specs.reFloor,
        specs.reFurnished,
        specs.reBuildingAge,
        specs.reType,
        specs.projectStatus,
        specs.deliveryYear ? `تسليم ${specs.deliveryYear}` : null,
        specs.projectFloors ? `${specs.projectFloors} طوابق` : null,
        specs.projectFinishing,
        specs.projectLandArea ? `${specs.projectLandArea} م² أرض` : null,
        specs.projectUnitsCount ? `${specs.projectUnitsCount} وحدة` : null,
        specs.buildingTotalFloors,
        specs.bedsCount,
        specs.minNetArea,
        specs.maxNetArea,
        specs.heatingType,
        specs.kitchenType,
        specs.balconyCount,
        specs.hasElevator,
        specs.hasParking,
        specs.houseStatus,
        specs.inComplex,
        specs.titleDeedType,
        specs.propertyDirection,
        specs.advertiserType,
        specs.villaFloors,
        specs.landZoning,
        specs.landFrontage,
        specs.officeFitted,
        specs.shopHasLicense,
        specs.minArea,
        specs.maxArea,
        specs.projectType,
        specs.paymentPlan,
        Array.isArray(specs.projectFacilities) ? specs.projectFacilities.join('، ') : specs.projectFacilities,
        Array.isArray(specs.projectAmenities) ? specs.projectAmenities.join('، ') : specs.projectAmenities,
      ];
  return Array.from(new Set([...details, ...fromSpecs.filter(Boolean).map(String)]));
};

const parseFirstInt = (val: any): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const match = String(val).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
};

const parseFirstFloat = (val: any): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const match = String(val).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : undefined;
};

const mapAd = (row: any): AdItem => {
  const ad = row.ad || row;
  const specs = row.car_specs || ad.car_specs || {};
  const reSpecs = row.real_estate_specs || ad.real_estate_specs || {};
  const projSpecs = row.project_specs || ad.project_specs || {};
  const images = row.images || ad.images || [];
  const videos = row.videos || ad.videos || [];
  const details = row.details || ad.details || [];
  const mappedDetails = cleanDetails(details);

  const roomsNum = reSpecs.bedrooms ?? parseFirstInt(reSpecs.rooms);
  const bathsNum = reSpecs.bathrooms_count ?? parseFirstInt(reSpecs.bathrooms);
  const areaNum = parseFirstFloat(reSpecs.area_size ?? reSpecs.area_text);

  return {
    id: String(ad.id),
    ownerUserId: ad.owner_user_id ?? undefined,
    title: ad.title || '',
    description: ad.description || '',
    price: Number(ad.price || 0),
    currency: ad.currency || 'ل.س',
    location: ad.location || '',
    category: ad.category,
    imageUrl: ad.cover_image_url || images[0]?.image_url || '',
    imageUrls: images.map((img: any) => img.image_url).filter(Boolean),
    videoUrl: videos[0]?.video_url || ad.video_url || undefined,
    isFeatured: Boolean(ad.is_featured),
    date: String(ad.published_on || ad.created_at || '').slice(0, 10),
    details: mappedDetails.length ? mappedDetails : specDetails(ad, specs, reSpecs, projSpecs),
    subCategory: ad.subcategory || undefined,
    purpose: ad.purpose || undefined,
    carBrand: specs.brand_name || undefined,
    carModel: specs.model_name || undefined,
    carYear: specs.model_year ? String(specs.model_year) : undefined,
    carGear: specs.transmission || undefined,
    carFuel: specs.fuel_type || undefined,
    carMileage: specs.mileage !== null && specs.mileage !== undefined ? Number(specs.mileage) : undefined,
    carBodyType: specs.body_type || undefined,
    carCondition: specs.car_condition || undefined,
    carType: specs.car_type || undefined,
    carColor: specs.color || undefined,
    engineSize: specs.engine_size || undefined,
    enginePower: specs.engine_power || undefined,
    carDrive: specs.drive_type || undefined,
    carWarranty: specs.has_warranty !== null && specs.has_warranty !== undefined ? (specs.has_warranty ? 'مكفولة' : 'بدون كفالة') : undefined,
    carAdvertiser: specs.advertiser_type || undefined,
    propType: reSpecs.property_type || undefined,
    reRooms: reSpecs.rooms || (roomsNum ? `${roomsNum} غرف` : undefined),
    reBaths: reSpecs.bathrooms || (bathsNum ? `${bathsNum} حمام` : undefined),
    reArea: reSpecs.area_text || (areaNum ? `${areaNum} م²` : undefined),
    reNetArea: reSpecs.net_area ? String(reSpecs.net_area) : undefined,
    reFloor: reSpecs.floor || undefined,
    buildingTotalFloors: reSpecs.total_floors || undefined,
    reFurnished: reSpecs.furnished || undefined,
    reBuildingAge: reSpecs.building_age || undefined,
    reType: reSpecs.category_id || reSpecs.re_type || undefined,
    titleDeedType: reSpecs.title_deed_type || undefined,
    advertiserType: reSpecs.advertiser_type || undefined,
    heatingType: reSpecs.heating_type || undefined,
    propertyDirection: reSpecs.property_direction || undefined,
    hasElevator: reSpecs.has_elevator !== null && reSpecs.has_elevator !== undefined ? (reSpecs.has_elevator ? 'نعم' : 'لا') : undefined,
    hasParking: reSpecs.has_parking !== null && reSpecs.has_parking !== undefined ? (reSpecs.has_parking ? 'نعم' : 'لا') : undefined,
    rooms: roomsNum,
    bathrooms: bathsNum,
    areaSize: areaNum,
    projectStatus: projSpecs?.project_status || undefined,
    deliveryYear: projSpecs?.delivery_year || undefined,
    projectFloors: projSpecs?.project_floors ?? undefined,
    projectType: projSpecs?.project_type || undefined,
    projectFinishing: projSpecs?.project_finishing || undefined,
    projectLandArea: projSpecs?.project_land_area ? Number(projSpecs.project_land_area) : undefined,
    projectUnitsCount: projSpecs?.project_units_count ? Number(projSpecs.project_units_count) : undefined,
    paymentPlan: projSpecs?.payment_plan || undefined,
    projectFacilities: Array.isArray(projSpecs?.facilities) ? projSpecs.facilities : undefined,
    projectAmenities: Array.isArray(projSpecs?.amenities) ? projSpecs.amenities : undefined,
    ownerPhone: ad.owner_phone || '',
    whatsappPhone: ad.whatsapp_phone || '',
    mapUrl: ad.map_url || '',
  };
};

const getSessionUser = (): { id?: number; phone?: string } => {
  try {
    const raw = localStorage.getItem('dalilukum_user_session_v1');
    if (raw) return JSON.parse(raw) || {};
  } catch {
    // ignore
  }
  return {};
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
  const [userLimits, setUserLimits] = useState<Record<string, { userId?: number; maxAds: number; maxImages: number; maxVideos: number }>>({});
  const [defaultLimits, setDefaultLimits] = useState({ maxAds: 5, maxImages: 5, maxVideos: 1 });

  const refresh = async () => {
    try {
      const sessionUser = getSessionUser();
      const favQuery = sessionUser.id
        ? `?user_id=${sessionUser.id}&per_page=500`
        : sessionUser.phone
          ? `?phone=${encodeURIComponent(sessionUser.phone)}&per_page=500`
          : '?per_page=500';
      const compQuery = sessionUser.id
        ? `?user_id=${sessionUser.id}`
        : sessionUser.phone
          ? `?phone=${encodeURIComponent(sessionUser.phone)}`
          : '';

      let adRows: any[] = [];
      let brandRows: any[] = [];
      let modelRows: any[] = [];
      let catRows: any[] = [];
      let subRows: any[] = [];
      let notifRows: any[] = [];
      let limitRows: any[] = [];
      let userRows: any[] = [];
      let defaults: any[] = [];
      let icons: any[] = [];

      const [bootData, favRows, compRows] = await Promise.all([
        api.get<any>('/bootstrap').catch(() => null),
        listApi<any>(`/favorites${favQuery}`).catch(() => null),
        compQuery ? listApi<any>(`/user-comparisons${compQuery}`).catch(() => null) : Promise.resolve(null),
      ]);

      if (bootData && Array.isArray(bootData.ads)) {
        adRows = bootData.ads;
        brandRows = bootData.car_brands || [];
        modelRows = bootData.car_models || [];
        catRows = bootData.real_estate_categories || [];
        subRows = bootData.real_estate_subcategories || [];
        notifRows = bootData.notifications || [];
        limitRows = bootData.user_limits || [];
        userRows = bootData.users || [];
        defaults = bootData.default_limits || [];
        icons = bootData.icon_overrides || [];
      } else {
        [
          adRows,
          brandRows,
          modelRows,
          catRows,
          subRows,
          notifRows,
          limitRows,
          userRows,
          defaults,
          icons,
        ] = await Promise.all([
          listApi<any>('/ads?per_page=200').catch(() => []),
          listApi<any>('/car-brands?per_page=500').catch(() => []),
          listApi<any>('/car-models?per_page=1000').catch(() => []),
          listApi<any>('/real-estate/categories?per_page=200').catch(() => []),
          listApi<any>('/real-estate/subcategories?per_page=500').catch(() => []),
          listApi<any>('/notifications?per_page=200').catch(() => []),
          listApi<any>('/user-limits?per_page=200').catch(() => []),
          listApi<any>('/users?per_page=500').catch(() => []),
          listApi<any>('/default-limits?per_page=1').catch(() => []),
          listApi<any>('/icon-overrides?per_page=500').catch(() => []),
        ]);
      }

      if (adRows.length > 0) {
        setAds(adRows.map(mapAd));
      }

      if (brandRows.length > 0) {
        const brandList = brandRows.map(mapBrand);
        const brandById = new Map<number, string>();
        brandRows.forEach((b: any) => brandById.set(Number(b.id), b.en_name));

        const models: Record<string, { ar: string; en: string }[]> = {};
        modelRows.forEach((row: any) => {
          const brandEn = row.brand_en_name || brandById.get(Number(row.brand_id));
          if (brandEn) {
            if (!models[brandEn]) models[brandEn] = [];
            models[brandEn].push({ ar: row.ar_name, en: row.en_name });
          }
        });

        setBrands(brandList);
        if (Object.keys(models).length > 0) {
          setCarModelsMap(models);
        }
      }

      if (catRows.length > 0) {
        setRealEstateCats(catRows.map(mapCategory));
      }
      if (subRows.length > 0) {
        setRealEstateSubs(
          subRows.reduce(
            (acc: any, row: any) => ({
              ...acc,
              [row.category_id]: [...(acc[row.category_id] || []), mapSub(row)],
            }),
            {},
          ),
        );
      }
      if (notifRows.length > 0) {
        setNotifications(
          notifRows
            .filter((r: any) => r && r.title && String(r.title).trim() !== '')
            .map(mapNotif),
        );
      }

      if (userRows.length > 0 || limitRows.length > 0) {
        const userPhoneById = new Map<number, string>();
        userRows.forEach((u: any) => userPhoneById.set(Number(u.id), String(u.phone)));

        const limitsMap: Record<string, { userId?: number; maxAds: number; maxImages: number; maxVideos: number }> = {};
        limitRows.forEach((row: any) => {
          const uid = Number(row.user_id);
          const key = userPhoneById.get(uid) || String(row.user_id);
          limitsMap[key] = {
            userId: uid,
            maxAds: Number(row.max_ads ?? 5),
            maxImages: Number(row.max_images ?? 5),
            maxVideos: Number(row.max_videos ?? 1),
          };
        });
        setUserLimits(limitsMap);
      }

      if (defaults[0]) {
        setDefaultLimits({
          maxAds: Number(defaults[0].max_ads ?? 5),
          maxImages: Number(defaults[0].max_images ?? 5),
          maxVideos: Number(defaults[0].max_videos ?? 1),
        });
      }
      if (icons.length > 0) {
        setIconOverrides(
          icons.reduce((acc: any, row: any) => ({ ...acc, [row.override_key]: row.icon_name }), {}),
        );
      }
      if (Array.isArray(favRows)) {
        setFavorites(favRows.map((row: any) => String(row.ad_id)).filter(Boolean));
      }
      if (compQuery && Array.isArray(compRows)) {
        setComparisons(compRows.map((row: any) => String(row?.ad_id ?? row)).filter(Boolean));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const addAd: AdsContextType['addAd'] = async (ad: any) => {
    const sessionUser = getSessionUser();
    const payload = {
      owner_user_id: ad.ownerUserId ?? sessionUser.id ?? undefined,
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
      owner_phone: ad.ownerPhone || sessionUser.phone || '',
      whatsapp_phone: ad.whatsappPhone || ad.ownerPhone || sessionUser.phone || '',
      map_url: ad.mapUrl || '',
    };
    const created = await api.post<any>('/ads', payload);
    const mapped = mapAd(
      created.ad
        ? {
            ...created.ad,
            images: created.images,
            videos: created.videos,
            details: created.details,
            car_specs: created.car_specs,
            real_estate_specs: created.real_estate_specs,
            project_specs: created.project_specs,
          }
        : created
    );
    setAds(prev => [mapped, ...prev]);
    await refresh();
  };

  const updateAd: AdsContextType['updateAd'] = async (id: string, fields: any) => {
    const payload: Record<string, any> = { ...fields };
    if ('isFeatured' in payload) {
      payload.is_featured = payload.isFeatured;
      delete payload.isFeatured;
    }
    if ('imageUrl' in payload || 'image' in payload) {
      payload.cover_image_url = payload.imageUrl || payload.image;
      delete payload.imageUrl;
      delete payload.image;
    }
    if ('imageUrls' in payload) {
      payload.images = payload.imageUrls;
      delete payload.imageUrls;
    }
    if ('videoUrl' in payload || 'videoUrls' in payload) {
      const vids = payload.videoUrls || (payload.videoUrl ? [payload.videoUrl] : []);
      payload.videos = vids.filter(Boolean);
      delete payload.videoUrl;
      delete payload.videoUrls;
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
    if ('mapUrl' in payload) {
      payload.map_url = payload.mapUrl;
      delete payload.mapUrl;
    }
    if ('specs' in payload && payload.specs) {
      payload.details = requestDetails(payload.category || 'real-estate', payload.specs, payload.details || []);
    }
    await api.put(`/ads/${encodeURIComponent(id)}`, payload);
    await refresh();
  };

  const deleteAd = async (id: string) => {
    await api.delete(`/ads/${encodeURIComponent(id)}`);
    setAds(prev => prev.filter(ad => ad.id !== id));
    await refresh();
  };

  const addBrand = async (brand: CarBrand) => {
    await api.post('/car-brands', {
      ar_name: brand.ar,
      en_name: brand.en,
      ads_count: brand.count ?? 0,
      domain: brand.domain,
      icon: brand.icon,
      image_url: brand.image,
    });
    await refresh();
  };

  const updateBrand = async (idx: number, brand: CarBrand) => {
    const row = brands[idx];
    const targetId = brand.id || row?.id || idx + 1;
    await api.put(`/car-brands/${targetId}`, {
      ar_name: brand.ar,
      en_name: brand.en,
      ads_count: brand.count ?? 0,
      domain: brand.domain,
      icon: brand.icon,
      image_url: brand.image,
    });
    await refresh();
  };

  const deleteBrand = async (idx: number) => {
    const row = brands[idx];
    const targetId = row?.id || idx + 1;
    await api.delete(`/car-brands/${targetId}`);
    await refresh();
  };

  const updateCarModels = async (brandEn: string, models: { ar: string; en: string }[]) => {
    setCarModelsMap(prev => ({ ...prev, [brandEn]: models }));
    await api.post('/car-models/sync-brand', {
      brand_name: brandEn,
      models: models.map(m => ({ ar_name: m.ar, en_name: m.en })),
    });
    await refresh();
  };

  const updateRealEstateCat = async (id: string, data: Partial<RealEstateCategory>) => {
    const existing = realEstateCats.find(c => c.id === id);
    await api.put(`/real-estate/categories/${encodeURIComponent(id)}`, {
      ar_name: data.ar ?? existing?.ar,
      en_name: data.en ?? existing?.en,
      ads_count: data.count ?? existing?.count ?? 0,
      image_url: data.image ?? existing?.image,
      icon: data.icon ?? existing?.icon,
    });
    await refresh();
  };

  const updateRealEstateSubs = async (catId: string, subs: RealEstateSubcategory[]) => {
    setRealEstateSubs(prev => ({ ...prev, [catId]: subs }));
    await api.post('/real-estate/subcategories/sync-category', {
      category_id: catId,
      subcategories: subs.map(s => ({
        ar_name: s.ar,
        en_name: s.en,
        ads_count: s.count ?? 0,
        image_url: s.image,
      })),
    });
    await refresh();
  };

  const updateIconOverride = async (key: string, iconName: string) => {
    await api.post('/icon-overrides', { override_key: key, icon_name: iconName });
    setIconOverrides(prev => ({ ...prev, [key]: iconName }));
  };

  const addNotification = async (notif: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const newId = `notif-${Date.now()}`;
    await api.post('/notifications', {
      id: newId,
      title: notif.title,
      body: notif.body,
      display_date: notif.date || new Date().toISOString().slice(0, 10),
      is_read: 0,
    });
    setNotifications(prev => [
      { id: newId, title: notif.title, body: notif.body, date: notif.date || 'الآن', isRead: false },
      ...prev,
    ]);
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await api.delete(`/notifications/${encodeURIComponent(id)}`).catch(() => null);
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await Promise.all(
      unread.map(n => api.put(`/notifications/${encodeURIComponent(n.id)}`, { is_read: 1 }).catch(() => null))
    );
  };

  const clearAllNotifications = async () => {
    const current = [...notifications];
    setNotifications([]);
    await Promise.all(current.map(n => api.delete(`/notifications/${encodeURIComponent(n.id)}`).catch(() => null)));
  };

  const toggleFavorite = async (id: string) => {
    const sessionUser = getSessionUser();
    const exists = favorites.includes(id);
    setFavorites(prev => (exists ? prev.filter(x => x !== id) : [...prev, id]));
    try {
      const userParam = sessionUser.id
        ? `?user_id=${sessionUser.id}`
        : sessionUser.phone
          ? `?phone=${encodeURIComponent(sessionUser.phone)}`
          : '';
      if (exists) {
        await api.delete(`/favorites/${encodeURIComponent(id)}${userParam}`);
      } else {
        await api.post('/favorites', {
          ad_id: id,
          user_id: sessionUser.id,
          phone: sessionUser.phone,
        });
      }
    } catch (e) {
      setFavorites(prev => (exists ? [...prev, id] : prev.filter(x => x !== id)));
      console.error(e);
    }
  };

  const toggleComparison = (id: string) => {
    setComparisons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]
    );
    const sessionUser = getSessionUser();
    if (sessionUser.id || sessionUser.phone) {
      api
        .post('/user-comparisons/toggle', {
          ad_id: id,
          user_id: sessionUser.id,
          phone: sessionUser.phone,
        })
        .catch(console.error);
    }
  };

  const clearComparisons = () => {
    setComparisons([]);
    const sessionUser = getSessionUser();
    if (sessionUser.id || sessionUser.phone) {
      api
        .post('/user-comparisons/toggle', {
          clear: true,
          user_id: sessionUser.id,
          phone: sessionUser.phone,
        })
        .catch(console.error);
    }
  };

  const updateUserLimit = async (phone: string, maxImages: number, maxVideos: number, maxAds = 5) => {
    const loginRes = await api.post<any>('/auth/login', { phone: phone.trim() });
    const userId = loginRes?.id;
    if (userId) {
      await api.post('/user-limits', {
        user_id: userId,
        max_ads: maxAds,
        max_images: maxImages,
        max_videos: maxVideos,
      });
    }
    await refresh();
  };

  const deleteUserLimit = async (phone: string) => {
    const existing = userLimits[phone];
    if (existing?.userId) {
      await api.delete(`/user-limits/${existing.userId}`).catch(() => null);
    } else if (/^\d+$/.test(phone)) {
      await api.delete(`/user-limits/${phone}`).catch(() => null);
    }
    await refresh();
  };

  const updateDefaultLimits = async (maxImages: number, maxVideos: number, maxAds = 5) => {
    setDefaultLimits({ maxAds, maxImages, maxVideos });
    await api.post('/default-limits', {
      id: 1,
      max_ads: maxAds,
      max_images: maxImages,
      max_videos: maxVideos,
    });
    await refresh();
  };

  const value = useMemo(
    () => ({
      ads,
      addAd,
      updateAd,
      deleteAd,
      refresh,
      getFilteredAds: (criteria: FilterCriteria) => filterAds(ads, criteria, brands, carModelsMap),
      brands,
      addBrand,
      updateBrand,
      deleteBrand,
      carModelsMap,
      updateCarModels,
      realEstateCats,
      updateRealEstateCat,
      realEstateSubs,
      updateRealEstateSubs,
      iconOverrides,
      updateIconOverride,
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      comparisons,
      toggleComparison,
      isInComparison: (id: string) => comparisons.includes(id),
      clearComparisons,
      notifications,
      unreadNotificationsCount: notifications.filter(n => !n.isRead).length,
      markAllNotificationsRead,
      clearAllNotifications,
      addNotification,
      deleteNotification,
      userLimits,
      updateUserLimit,
      deleteUserLimit,
      defaultLimits,
      updateDefaultLimits,
    }),
    [
      ads,
      brands,
      carModelsMap,
      realEstateCats,
      realEstateSubs,
      iconOverrides,
      favorites,
      comparisons,
      notifications,
      userLimits,
      defaultLimits,
    ]
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) throw new Error('useAds must be used within an AdsProvider');
  return context;
}
