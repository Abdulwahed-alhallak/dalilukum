import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';
import { AdItem, AppState, Category, NotificationItem, CarBrandItem, CarModelItem, UserSession } from './types';
import { initialState } from './state';
import { FilterParams, getFilteredAds } from './filters';
import { mapAdFromApi } from './mappers';
import { listApi, api } from '../services/api';

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADS'; payload: AdItem[] }
  | { type: 'ADD_AD'; payload: AdItem }
  | { type: 'UPDATE_AD'; payload: AdItem }
  | { type: 'DELETE_AD'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationItem[] }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'SET_CATALOG'; payload: { carBrands: CarBrandItem[]; carModels: CarModelItem[]; carsEnabled: boolean } }
  | { type: 'SET_USER'; payload: UserSession | null };

const toId = (value: unknown) => String(value ?? '');

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ADS':
      return { ...state, ads: action.payload, loading: false, error: null };
    case 'ADD_AD':
      return { ...state, ads: [action.payload, ...state.ads], loading: false, error: null };
    case 'UPDATE_AD':
      return {
        ...state,
        ads: state.ads.map(ad => (ad.id === action.payload.id ? action.payload : ad)),
        loading: false,
        error: null,
      };
    case 'DELETE_AD':
      return {
        ...state,
        ads: state.ads.filter(ad => ad.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      };
    case 'SET_CATALOG':
      return {
        ...state,
        carBrands: action.payload.carBrands,
        carModels: action.payload.carModels,
        carsEnabled: action.payload.carsEnabled,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  toggleFavorite: (id: string) => void;
  addAd: (payload: any) => Promise<AdItem>;
  updateAd: (id: string, payload: any) => Promise<AdItem>;
  deleteAd: (id: string) => Promise<void>;
  getFilteredAds: (params: FilterParams) => AdItem[];
  refresh: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  loginUser: (phone: string) => Promise<UserSession>;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isFetchingRef = useRef(false);

  const applyRawData = useCallback(
    (adsRows: any[], notifRows: any[], brandRows: any[], modelRows: any[], settingsRows: any[]) => {
      if (Array.isArray(adsRows)) {
        const items = adsRows.map(mapAdFromApi);
        if (items.length > 0 || stateRef.current.ads.length === 0) {
          dispatch({ type: 'SET_ADS', payload: items });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }

      if (Array.isArray(notifRows) && (notifRows.length > 0 || stateRef.current.notifications.length === 0)) {
        const notifs: NotificationItem[] = notifRows.map((row: any) => ({
          id: String(row.id),
          title: row.title || '',
          message: row.message || row.body || '',
          date: row.date_label || row.display_date || row.created_at || 'الآن',
          isRead: Boolean(row.is_read),
          type: row.type || 'system',
        }));
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifs });
      }

      const brandEnById = new Map<number, string>();
      const carBrands: CarBrandItem[] = (Array.isArray(brandRows) ? brandRows : []).map((b: any) => {
        const idNum = b.id ? Number(b.id) : undefined;
        const enName = b.en_name || '';
        if (idNum && enName) {
          brandEnById.set(idNum, enName);
        }
        return {
          id: idNum,
          ar: b.ar_name || '',
          en: enName,
          count: Number(b.ads_count || 0),
        };
      });

      const carModels: CarModelItem[] = (Array.isArray(modelRows) ? modelRows : []).map((m: any) => ({
        id: m.id ? Number(m.id) : undefined,
        brandEn: m.brand_en_name || (m.brand_id ? brandEnById.get(Number(m.brand_id)) : '') || '',
        ar: m.ar_name || '',
        en: m.en_name || '',
        count: Number(m.ads_count || 0),
      }));

      const safeSettings = Array.isArray(settingsRows) ? settingsRows : [];
      const carsRow = safeSettings.find((r: any) => r.setting_key === 'cars_enabled');
      const carsEnabled = carsRow ? !['false', '0', 'off'].includes(String(carsRow.setting_value).toLowerCase()) : true;

      if (carBrands.length > 0 || stateRef.current.carBrands.length === 0) {
        dispatch({
          type: 'SET_CATALOG',
          payload: {
            carBrands: carBrands.length > 0 ? carBrands : stateRef.current.carBrands,
            carModels: carModels.length > 0 ? carModels : stateRef.current.carModels,
            carsEnabled,
          },
        });
      }
    },
    [],
  );

  const loadAll = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const hasExistingAds = stateRef.current.ads.length > 0;
    if (!hasExistingAds) {
      dispatch({ type: 'SET_LOADING', payload: true });
    }

    try {
      try {
        const boot = await api.get<any>('/bootstrap');
        if (boot && Array.isArray(boot.ads)) {
          applyRawData(
            boot.ads,
            boot.notifications || [],
            boot.car_brands || [],
            boot.car_models || [],
            boot.app_settings || [],
          );
          return;
        }
      } catch {
        // Fallback to individual endpoints if /bootstrap is unavailable
      }

      const [adsRows, notifRows, brandRows, modelRows, settingsRows] = await Promise.all([
        listApi<any>('/ads', { per_page: '200' }),
        listApi<any>('/notifications', { per_page: '200' }).catch(() => []),
        listApi<any>('/car-brands', { per_page: '500' }).catch(() => []),
        listApi<any>('/car-models', { per_page: '1000' }).catch(() => []),
        listApi<any>('/app-settings', { per_page: '100' }).catch(() => []),
      ]);

      applyRawData(adsRows, notifRows, brandRows, modelRows, settingsRows);
    } catch (e: any) {
      if (stateRef.current.ads.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: e?.message || 'فشل تحميل الإعلانات، يرجى التحقق من الاتصال' });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [applyRawData]);

  const toggleFavorite = useCallback((id: string) => {
    const adId = toId(id);
    const exists = state.favorites.includes(adId);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: adId });
    const params: Record<string, string> = {};
    if (state.user?.id) params.user_id = String(state.user.id);
    if (state.user?.phone) params.phone = state.user.phone;

    const query = new URLSearchParams(params).toString();
    const req = exists
      ? api.delete(`/favorites/${encodeURIComponent(adId)}${query ? `?${query}` : ''}`)
      : api.post('/favorites', { ad_id: adId, user_id: state.user?.id || null, phone: state.user?.phone || null });

    req.catch(() => {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: adId });
    });
  }, [state.favorites, state.user]);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const addAd = useCallback(async (payload: any) => {
    const created = await api.post<any>('/ads', payload);
    const item = mapAdFromApi(created);
    dispatch({ type: 'ADD_AD', payload: item });
    return item;
  }, []);

  const updateAd = useCallback(async (id: string, payload: any) => {
    const updated = await api.put<any>(`/ads/${encodeURIComponent(id)}`, payload);
    const item = mapAdFromApi(updated);
    dispatch({ type: 'UPDATE_AD', payload: item });
    return item;
  }, []);

  const deleteAd = useCallback(async (id: string) => {
    await api.delete(`/ads/${encodeURIComponent(id)}`);
    dispatch({ type: 'DELETE_AD', payload: id });
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
    await api
      .post('/notifications/read-all', {
        user_id: state.user?.id || null,
        phone: state.user?.phone || null,
      })
      .catch(() => null);
  }, [state.user]);

  const loginUser = useCallback(async (phone: string): Promise<UserSession> => {
    const trimmed = phone.trim();
    try {
      const res: any = await api.post('/auth/login', { phone: trimmed });
      const data = res?.data || res;
      const session: UserSession = { id: data?.id ? Number(data.id) : undefined, phone: data?.phone || trimmed };
      dispatch({ type: 'SET_USER', payload: session });
      return session;
    } catch {
      const session: UserSession = { phone: trimmed };
      dispatch({ type: 'SET_USER', payload: session });
      return session;
    }
  }, []);

  const logoutUser = useCallback(() => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_FAVORITES', payload: [] });
  }, []);

  const filtered = useCallback((params: FilterParams) => {
    return getFilteredAds(state.ads, params);
  }, [state.ads]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const sub = RNAppState.addEventListener('change', nextState => {
      if (nextState === 'active' && (stateRef.current.ads.length === 0 || stateRef.current.error)) {
        loadAll();
      }
    });
    return () => {
      sub.remove();
    };
  }, [loadAll]);

  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      try {
        const params: Record<string, string> = { per_page: '500' };
        if (state.user?.id) params.user_id = String(state.user.id);
        else if (state.user?.phone) params.phone = state.user.phone;
        const rows = await listApi<any>('/favorites', params);
        if (!cancelled) {
          dispatch({ type: 'SET_FAVORITES', payload: rows.map(row => toId(row.ad_id)).filter(Boolean) });
        }
      } catch {
        // Preserve existing favorites on transient network failure
      }
    }
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [state.user]);

  return (
    <AppContext.Provider
      value={{
        state,
        toggleFavorite,
        addAd,
        updateAd,
        deleteAd,
        getFilteredAds: filtered,
        refresh,
        markAllNotificationsRead,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export type { AdItem, Category };

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

