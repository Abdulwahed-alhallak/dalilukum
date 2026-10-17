import React from 'react';
import { Alert, Linking, View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NativeIcon } from '../../../components/common/NativeIcon';
import { GlassCard } from '../../../components/common/UI';
import { useApp, AdItem } from '../../../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { MediaCarousel } from '../../../components/common/MediaCarousel';

export default function CarDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, toggleFavorite } = useApp();
  const ad = state.ads.find((a: AdItem) => a.id === id);

  if (!ad) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>الإعلان غير موجود</Text>
      </View>
    );
  }

  const isFav = state.favorites.includes(ad.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MediaCarousel images={ad.images || (ad.imageUrl ? [ad.imageUrl] : [])} videos={ad.videos || []} />

      <View style={styles.body}>
        <Text style={styles.title}>{ad.title}</Text>
        <View style={styles.row}>
          <NativeIcon name="location-outline" size={16} color={COLORS.gray500} />
          <Text style={styles.location}>{ad.location}</Text>
        </View>
        <Text style={styles.price}>{ad.price.toLocaleString('ar-SY')} {ad.currency}</Text>

        <GlassCard padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>التفاصيل</Text>
          {ad.details.map((d: string, i: number) => (
            <Text key={i} style={styles.detailItem}>{d}</Text>
          ))}
        </GlassCard>

        {ad.description && (
          <GlassCard padding="lg" style={styles.section}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{ad.description}</Text>
          </GlassCard>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(ad.id)}>
            <NativeIcon name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? COLORS.danger : COLORS.gray400} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => {
              if (ad.ownerPhone) {
                Linking.openURL(`tel:${ad.ownerPhone}`).catch(() => Alert.alert('تنبيه', 'تعذر فتح تطبيق الاتصال'));
              } else {
                Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح');
              }
            }}
          >
            <NativeIcon name="call-outline" size={18} color={COLORS.white} />
            <Text style={styles.callText}>اتصل بالمعلن</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={() => {
            const phone = (ad.whatsappPhone || ad.ownerPhone || '').replace(/[^\d]/g, '');
            if (phone) {
              const msg = encodeURIComponent(`مرحباً، أنا مهتم بإعلانك: ${ad.title}`);
              Linking.openURL(`https://wa.me/${phone}?text=${msg}`).catch(() =>
                Alert.alert('تنبيه', 'تعذر فتح واتساب على هذا الجهاز'),
              );
            } else {
              Alert.alert('تنبيه', 'لا يوجد رقم واتساب متاح');
            }
          }}
        >
          <NativeIcon name="logo-whatsapp" size={20} color={COLORS.white} />
          <Text style={styles.callText}>تواصل عبر واتساب</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push({ pathname: '/(tabs)/create', params: { editId: ad.id } } as any)}
        >
          <NativeIcon name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.callText}>تعديل الإعلان</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, fontSize: FONT_SIZES.md, fontWeight: '600' },
  image: { width: '100%', height: 260, backgroundColor: COLORS.gray200 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: SPACING.lg, gap: SPACING.md },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.gray900 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: FONT_SIZES.sm, color: COLORS.gray500 },
  price: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.danger },
  section: { marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
  detailItem: { fontSize: FONT_SIZES.md, color: COLORS.gray600, lineHeight: 22 },
  description: { fontSize: FONT_SIZES.md, color: COLORS.gray600, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  favBtn: { width: 48, height: 48, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', shadowColor: '#2B2B2B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  callBtn: { flex: 1, flexDirection: 'row', height: 48, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  callText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  whatsappBtn: { flexDirection: 'row', height: 48, borderRadius: BORDER_RADIUS.full, backgroundColor: '#0D3B46', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  editBtn: { flexDirection: 'row', height: 48, borderRadius: BORDER_RADIUS.full, backgroundColor: '#C9A15A', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
});
