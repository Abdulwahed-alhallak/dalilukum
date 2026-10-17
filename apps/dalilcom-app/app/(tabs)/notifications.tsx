import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeIcon } from '../../components/common/NativeIcon';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

type NotifPrefs = {
  notify_all_new: boolean;
  notify_category: 'all' | 'cars' | 'real-estate';
  notify_sound: boolean;
};

export default function NotificationsTab() {
  const { state, refresh, markAllNotificationsRead } = useApp();
  const unreadCount = state.notifications.filter(n => !n.isRead).length;
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({
    notify_all_new: true,
    notify_category: 'all',
    notify_sound: true,
  });

  useEffect(() => {
    if (!state.user?.id && !state.user?.phone) return;
    const q = state.user.id ? `?user_id=${state.user.id}` : `?phone=${encodeURIComponent(state.user.phone)}`;
    api
      .get<any>(`/notification-preferences${q}`)
      .then((res: any) => {
        if (res) {
          setPrefs({
            notify_all_new: Boolean(res.notify_all_new ?? true),
            notify_category: (res.notify_category as NotifPrefs['notify_category']) || 'all',
            notify_sound: Boolean(res.notify_sound ?? true),
          });
        }
      })
      .catch(() => null);
  }, [state.user?.id, state.user?.phone]);

  const updatePrefs = (next: NotifPrefs) => {
    setPrefs(next);
    if (state.user?.id || state.user?.phone) {
      api
        .post('/notification-preferences', {
          user_id: state.user?.id,
          phone: state.user?.phone,
          ...next,
        })
        .catch(() => null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.prefsBtn} onPress={() => setShowPrefs(v => !v)}>
            <Text style={styles.readAllText}>التفضيلات</Text>
          </TouchableOpacity>
          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.readAllBtn} onPress={markAllNotificationsRead}>
              <Text style={styles.readAllText}>قراءة الكل ({unreadCount})</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.headerTitle}>الإشعارات</Text>
      </View>

      {showPrefs ? (
        <View style={styles.prefsCard}>
          <View style={styles.prefsRow}>
            <TouchableOpacity
              style={[styles.prefToggle, prefs.notify_all_new && styles.prefToggleActive]}
              onPress={() => updatePrefs({ ...prefs, notify_all_new: !prefs.notify_all_new })}
            >
              <Text style={[styles.prefToggleText, prefs.notify_all_new && styles.prefToggleTextActive]}>
                إشعارات الإعلانات
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.prefToggle, prefs.notify_sound && styles.prefToggleActive]}
              onPress={() => updatePrefs({ ...prefs, notify_sound: !prefs.notify_sound })}
            >
              <Text style={[styles.prefToggleText, prefs.notify_sound && styles.prefToggleTextActive]}>
                صوت التنبيه
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.prefsRow}>
            {([
              { id: 'all', label: 'الكل' },
              { id: 'real-estate', label: 'العقارات' },
              { id: 'cars', label: 'السيارات' },
            ] as const).map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.catChip, prefs.notify_category === opt.id && styles.catChipActive]}
                onPress={() => updatePrefs({ ...prefs, notify_category: opt.id })}
              >
                <Text style={[styles.catChipText, prefs.notify_category === opt.id && styles.catChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <FlatList
        data={state.notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={state.loading} onRefresh={refresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <NativeIcon name="notifications-outline" size={38} color={COLORS.gray400} />
            <Text style={styles.emptyText}>لا توجد إشعارات حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.unreadCard]}>
            <View style={styles.icon}>
              <NativeIcon name="notifications-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>{item.message}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 42, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: COLORS.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  readAllBtn: { backgroundColor: 'rgba(201,161,90,0.25)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  prefsBtn: { backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  readAllText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '800' },
  prefsCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginTop: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, gap: SPACING.sm, elevation: 2 },
  prefsRow: { flexDirection: 'row-reverse', gap: SPACING.xs },
  prefToggle: { flex: 1, paddingVertical: 8, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200, alignItems: 'center' },
  prefToggleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  prefToggleText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.gray900 },
  prefToggleTextActive: { color: COLORS.white },
  catChip: { flex: 1, paddingVertical: 7, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.offWhite, alignItems: 'center' },
  catChipActive: { backgroundColor: '#C9A15A' },
  catChipText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.gray900 },
  catChipTextActive: { color: COLORS.white },
  list: { padding: SPACING.lg, paddingBottom: 105, gap: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, flexDirection: 'row-reverse', gap: SPACING.md, elevation: 4 },
  unreadCard: { borderRightWidth: 4, borderRightColor: '#C9A15A' },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(246,242,232,0.74)', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'flex-end' },
  title: { color: COLORS.gray900, fontSize: FONT_SIZES.md, fontWeight: '900' },
  text: { color: COLORS.gray500, fontSize: FONT_SIZES.sm, marginTop: SPACING.xs, textAlign: 'right' },
  date: { color: '#C9A15A', fontSize: 11, fontWeight: '700', marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 140, gap: SPACING.md },
  emptyText: { color: COLORS.gray500, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
