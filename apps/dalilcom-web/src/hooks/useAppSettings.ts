import { useEffect, useState } from 'react';
import { api, listApi } from '../lib/api';

export type AppSettings = { carsEnabled: boolean; loaded: boolean };

const defaultSettings: AppSettings = { carsEnabled: true, loaded: false };

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const refresh = async () => {
    try {
      const rows = await listApi<any>('/app-settings?per_page=100');
      const carsRow = rows.find((r: any) => r.setting_key === 'cars_enabled');
      const carsEnabled = carsRow ? String(carsRow.setting_value).toLowerCase() !== 'false' : true;
      setSettings({ carsEnabled, loaded: true });
    } catch {
      setSettings({ carsEnabled: true, loaded: true });
    }
  };

  const setCarsEnabled = async (enabled: boolean) => {
    setSettings(prev => ({ ...prev, carsEnabled: enabled }));
    await api.post('/app-settings', {
      setting_key: 'cars_enabled',
      setting_value: enabled ? 'true' : 'false',
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  return { settings, refresh, setCarsEnabled };
}
