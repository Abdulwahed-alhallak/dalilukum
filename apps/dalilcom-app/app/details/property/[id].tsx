import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NativeIcon } from '../../../components/common/NativeIcon';
import { MediaCarousel } from '../../../components/common/MediaCarousel';
import { useApp, AdItem } from '../../../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';

const logoImage = require('../../../assets/images/logo-mark.png');

const phoneOnly = (value?: string) => (value || '').replace(/[^\d]/g, '');

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, toggleFavorite } = useApp();
  const ad = state.ads.find((a: AdItem) => a.id === id);

  if (!ad) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>الإعلان غير موجود</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>الرجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFav = state.favorites.includes(ad.id);
  const mapUrl = ad.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ad.location)}`;
  const ownerPhone = phoneOnly(ad.ownerPhone || ad.whatsappPhone);
  const whatsappPhone = phoneOnly(ad.whatsappPhone || ad.ownerPhone);
  const whatsappText = encodeURIComponent(`مرحبا، أنا مهتم بالإعلان: ${ad.title}`);
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${whatsappText}` : '';
  const images = ad.images || (ad.imageUrl ? [ad.imageUrl] : []);
  const videos = ad.videos || [];

  const openUrl = (url?: string, fallback = 'الرابط غير متاح') => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('تنبيه', fallback));
    } else {
      Alert.alert('تنبيه', fallback);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.modal}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <NativeIcon name="close" size={21} color={COLORS.gray600} />
            </TouchableOpacity>
            <View style={styles.logoCard}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />

            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => toggleFavorite(ad.id)}>
              <NativeIcon name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? COLORS.danger : COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <View style={styles.trustPill}>
            <NativeIcon name="shield-checkmark-outline" size={14} color="#C9A15A" />
            <Text style={styles.trustText}>إعلان موثق ضمن دليل كوم</Text>
          </View>

          <View style={styles.gallery}>
            <MediaCarousel images={images} videos={videos} />
          </View>

          <View style={styles.safeBox}>
            <Text style={styles.safeTitle}>نصائح لمعاملة آمنة:</Text>
            <Text style={styles.safeLine}>• تحقق من هوية المعلن والمستندات الرسمية قبل أي دفعة.</Text>
            <Text style={styles.safeLine}>• عاين العقار على أرض الواقع وتأكد من صحة الموقع.</Text>
            <Text style={styles.safeLine}>• استخدم الاتصال أو واتساب للتنسيق مع المعلن.</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{ad.title}</Text>
            <View style={styles.locationRow}>
              <NativeIcon name="location-outline" size={16} color={COLORS.danger} />
              <Text style={styles.location}>{ad.location}</Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>السعر المطلوب</Text>
            <Text style={styles.price}>{ad.price.toLocaleString('en-US')} {ad.currency}</Text>
            {ad.isFeatured ? <Text style={styles.featured}>إعلان مميز</Text> : null}
          </View>

          {ad.description ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>وصف الإعلان</Text>
              <Text style={styles.description}>{ad.description}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>تفاصيل ومواصفات الإعلان</Text>
            <View style={styles.detailsGrid}>
              {ad.details.map((detail: string, index: number) => (
                <View key={`${detail}-${index}`} style={styles.detailChip}>
                  <NativeIcon name="checkmark-circle-outline" size={15} color={COLORS.danger} />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.mapBtn} onPress={() => openUrl(mapUrl)}>
            <NativeIcon name="map-outline" size={18} color={COLORS.white} />
            <Text style={styles.actionText}>فتح الموقع على الخريطة</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.callBtn} onPress={() => openUrl(ownerPhone ? `tel:${ownerPhone}` : '', 'لا يوجد رقم هاتف متاح')}>
              <NativeIcon name="call-outline" size={18} color={COLORS.white} />
              <Text style={styles.actionText}>اتصال</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappBtn} onPress={() => openUrl(whatsappUrl, 'لا يوجد رقم واتساب متاح')}>
              <NativeIcon name="logo-whatsapp" size={19} color={COLORS.white} />
              <Text style={styles.actionText}>تواصل واتساب</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: '/(tabs)/create', params: { editId: ad.id } } as any)}>
            <NativeIcon name="create-outline" size={18} color={COLORS.white} />
            <Text style={styles.actionText}>تعديل الإعلان</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgba(13,59,70,0.78)' },
  content: { padding: SPACING.md, paddingBottom: 34 },
  modal: { backgroundColor: COLORS.white, borderRadius: 28, overflow: 'hidden', minHeight: '100%' },
  topBar: { height: 82, paddingHorizontal: SPACING.lg, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F6F2E8', borderWidth: 1, borderColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  logoCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.gray100, width: 132, height: 58 },
  logo: { width: 112, height: 46 },
  trustPill: { alignSelf: 'flex-end', margin: SPACING.md, flexDirection: 'row-reverse', gap: 5, backgroundColor: 'rgba(201,161,90,0.16)', borderColor: 'rgba(201,161,90,0.34)', borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  trustText: { color: '#C9A15A', fontSize: FONT_SIZES.xs, fontWeight: '900' },
  gallery: { marginHorizontal: SPACING.lg, borderRadius: 18, overflow: 'hidden', backgroundColor: '#0D3B46' },
  safeBox: { margin: SPACING.lg, padding: SPACING.lg, borderRadius: 18, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: '#F6F2E8', gap: 7 },
  safeTitle: { color: COLORS.gray900, fontSize: FONT_SIZES.sm, fontWeight: '900', textAlign: 'right' },
  safeLine: { color: COLORS.gray600, fontSize: FONT_SIZES.xs, lineHeight: 20, textAlign: 'right' },
  info: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  title: { color: COLORS.gray900, fontSize: 23, fontWeight: '900', lineHeight: 32, textAlign: 'right' },
  locationRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  location: { color: COLORS.gray500, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  priceBox: { margin: SPACING.lg, padding: SPACING.lg, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,161,90,0.34)', backgroundColor: 'rgba(246,242,232,0.74)', alignItems: 'flex-end', gap: 5 },
  priceLabel: { color: COLORS.gray400, fontSize: FONT_SIZES.xs, fontWeight: '900' },
  price: { color: '#C9A15A', fontSize: 27, fontWeight: '900' },
  featured: { color: '#0D3B46', backgroundColor: 'rgba(201,161,90,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, fontSize: FONT_SIZES.xs, fontWeight: '900' },
  card: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.lg, borderRadius: 18, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: '#F6F2E8', gap: SPACING.md },
  sectionTitle: { color: COLORS.gray900, fontSize: FONT_SIZES.md, fontWeight: '900', textAlign: 'right' },
  description: { color: COLORS.gray600, fontSize: FONT_SIZES.sm, lineHeight: 23, textAlign: 'right', fontWeight: '700' },
  detailsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SPACING.sm },
  detailChip: { width: '47%', minHeight: 42, borderRadius: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  detailText: { flex: 1, color: COLORS.gray900, fontSize: FONT_SIZES.xs, fontWeight: '800', textAlign: 'right' },
  mapBtn: { marginHorizontal: SPACING.lg, height: 50, borderRadius: 14, backgroundColor: '#0D3B46', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row-reverse', gap: SPACING.md, padding: SPACING.lg },
  callBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: COLORS.primary, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 7 },
  whatsappBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#0D3B46', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 7 },
  editBtn: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, height: 50, borderRadius: 14, backgroundColor: '#C9A15A', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite, gap: SPACING.md },
  errorText: { color: COLORS.danger, fontSize: FONT_SIZES.md, fontWeight: '800' },
  backButton: { backgroundColor: '#0D3B46', borderRadius: 99, paddingHorizontal: 26, paddingVertical: 12 },
  backText: { color: COLORS.white, fontWeight: '900' },
});
