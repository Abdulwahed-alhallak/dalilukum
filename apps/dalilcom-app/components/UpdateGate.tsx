import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal, ActivityIndicator, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

// Fallback version — must match app.json versionCode/buildNumber (single source: dalilukum.sy/CLAUDE.md 1.0.14/17)
const APP_VERSION_CODE = 17;

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'https://dalilukum.sy/api').replace(/\/$/, '');
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // كل ساعة

interface CheckResult {
  needs_update: boolean;
  force_update: boolean;
  latest_version: number;
  current_version: number;
  download_url: string;
  message: string;
}

export function UpdateGate({ children }: { children: React.ReactNode }) {
  const [update, setUpdate] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(true);

  const check = async () => {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      let ExpoConstants: any = null;
      try {
        ExpoConstants = (await import('expo-constants')).default;
      } catch {}
      const fromConstants =
        (ExpoConstants?.expoConfig as any)?.android?.versionCode ??
        (ExpoConstants?.expoConfig as any)?.ios?.buildNumber ??
        APP_VERSION_CODE;
      const currentVersion = Number(fromConstants) || APP_VERSION_CODE;

      const res = await fetch(`${API_BASE}/app/update-check?platform=${platform}&version=${currentVersion}`, {
        headers: { Accept: 'application/json' },
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        const data: CheckResult = json.data;
        if (data.needs_update) setUpdate(data);
        else setUpdate(null);
        const deviceId = String(ExpoConstants?.installationId || ExpoConstants?.sessionId || '');
        fetch(`${API_BASE}/app/update-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, version: currentVersion, device_id: deviceId }),
        }).catch(() => {});
      }
    } catch {}
    setChecking(false);
  };

  useEffect(() => {
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!update) return <>{children}</>;

  return (
    <>
      {children}
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>تحديث متوفر</Text>
            <Text style={styles.body}>{update.message}</Text>
            <Text style={styles.version}>
              إصدارك: {update.current_version} — الأحدث: {update.latest_version}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => Linking.openURL(update.download_url)}>
              <Text style={styles.primaryText}>تحديث الآن</Text>
            </TouchableOpacity>
            {!update.force_update && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setUpdate(null)}>
                <Text style={styles.secondaryText}>لاحقاً</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.primary, marginBottom: 8 },
  body: { fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 8 },
  version: { fontSize: 11, color: '#94a3b8', marginBottom: 16 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  secondaryBtn: { marginTop: 10, padding: 8 },
  secondaryText: { color: '#64748b', fontWeight: '700', fontSize: 12 },
});
