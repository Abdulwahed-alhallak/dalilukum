import React, { useCallback, useMemo, useState } from 'react';
import { Alert, BackHandler, Image, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { NativeIcon } from '../../components/common/NativeIcon';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const heroImage = 'https://dalilukum.sy/images/ads/local_ad_938d86b249f0.jpg';
const logoImage = require('../../assets/images/logo-header.png');

function LogoCard() {
  return (
    <View style={styles.logoCard}>
      <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
}

function CategoryCard({ title, subtitle, count, icon, color, active, onPress }: {
  title: string;
  subtitle: string;
  count: number;
  icon: string;
  color: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.categoryCard, active && styles.categoryActive]} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: color }]}>
        <NativeIcon name={icon} size={29} color={COLORS.white} />
      </View>
      <View style={styles.categoryText}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categorySub}>{subtitle}</Text>
      </View>
      <View style={styles.categoryCount}>
        <NativeIcon name="chevron-back" size={20} color={COLORS.gray400} />
        <Text style={styles.countText}>({count})</Text>
      </View>
    </TouchableOpacity>
  );
}

function QuickCard({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.82} style={styles.quickCard} onPress={onPress}>
      <View style={styles.quickIcon}>
        <NativeIcon name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const { state, refresh, getFilteredAds } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const realEstate = getFilteredAds({ category: 'real-estate' });
  const cars = getFilteredAds({ category: 'cars' });
  const visibleAds = state.ads.filter(ad => state.carsEnabled || ad.category !== 'cars');
  const latestAds = visibleAds.slice(0, 6);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    return getFilteredAds({ category: 'all', query })
      .filter(ad => state.carsEnabled || ad.category !== 'cars')
      .slice(0, 8);
  }, [getFilteredAds, searchQuery, state.carsEnabled]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert('الخروج من التطبيق', 'هل تريد إغلاق تطبيق دليلكم؟', [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'خروج', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      });

      return () => subscription.remove();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><LogoCard /></View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={state.loading} onRefresh={refresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.searchBox}>
          <NativeIcon name="search" size={21} color={COLORS.gold} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن عقار، سيارة، منطقة..."
            placeholderTextColor={COLORS.gray400}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {searchQuery.trim() ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>نتائج البحث ({searchResults.length.toLocaleString('ar-SY')})</Text>
            {searchResults.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد نتائج مطابقة حالياً.</Text>
            ) : (
              searchResults.map(ad => (
                <TouchableOpacity
                  key={`search-${ad.id}`}
                  activeOpacity={0.86}
                  style={styles.adRow}
                  onPress={() => router.push(ad.category === 'cars' ? `/details/car/${ad.id}` as any : `/details/property/${ad.id}` as any)}
                >
                  {ad.imageUrl ? <Image source={{ uri: ad.imageUrl }} style={styles.adImage} /> : <View style={styles.adImageFallback} />}
                  <View style={styles.adInfo}>
                    <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
                    <Text style={styles.adLocation} numberOfLines={1}>{ad.location}</Text>
                    <Text style={styles.adPrice}>{ad.price.toLocaleString('ar-SY')} {ad.currency}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>التصنيفات</Text>
        <CategoryCard
          active
          title="العقارات"
          subtitle="شقق، فلل، محلات وأراضي للبيع أو الإيجار"
          count={realEstate.length}
          icon="business"
          color="#0D3B46"
          onPress={() => router.push('/real-estate' as any)}
        />
        {state.carsEnabled && (
          <CategoryCard
            title="السيارات"
            subtitle="سيارات ومركبات للبيع أو الإيجار"
            count={cars.length}
            icon="car"
            color="#C9A15A"
            onPress={() => router.push('/cars' as any)}
          />
        )}

        <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>عروض مميزة</Text>
            <Text style={styles.heroSub}>اكتشف أحدث العقارات والسيارات</Text>
          </View>
        </ImageBackground>

        <View style={styles.quickRow}>
          <QuickCard icon="add" title="أضف إعلانك" onPress={() => router.push('/create' as any)} />
          <QuickCard icon="star" title="المميزة" onPress={() => router.push('/featured' as any)} />
          <QuickCard icon="person" title={state.user ? 'إعلاناتي' : 'حسابي'} onPress={() => router.push('/(tabs)/profile' as any)} />
        </View>

        <TouchableOpacity style={styles.mapCard} activeOpacity={0.85} onPress={() => router.push('/map' as any)}>
          <NativeIcon name="map" size={32} color="#C9A15A" />
          <View>
            <Text style={styles.mapTitle}>ابحث في الخريطة</Text>
            <Text style={styles.mapSub}>اختر الموقع مباشرة</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.latestHeader}>
          <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
            <NativeIcon name="refresh" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.latestTitle}>آخر الإعلانات ({visibleAds.length})</Text>
        </View>

        {state.error && latestAds.length === 0 ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {latestAds.length === 0 && !state.error ? (
          <Text style={styles.emptyText}>{state.loading ? 'جاري تحميل الإعلانات...' : 'لا توجد إعلانات حالياً'}</Text>
        ) : null}

        {latestAds.map(ad => (
          <TouchableOpacity
            key={ad.id}
            activeOpacity={0.86}
            style={styles.adRow}
            onPress={() => router.push(ad.category === 'cars' ? `/details/car/${ad.id}` as any : `/details/property/${ad.id}` as any)}
          >
            {ad.imageUrl ? <Image source={{ uri: ad.imageUrl }} style={styles.adImage} /> : <View style={styles.adImageFallback} />}
            <View style={styles.adInfo}>
              <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
              <Text style={styles.adLocation} numberOfLines={1}>{ad.location}</Text>
              <Text style={styles.adPrice}>{ad.price.toLocaleString('ar-SY')} {ad.currency}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 5 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 20, paddingBottom: 20, alignItems: 'center' },
  logoCard: { backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', width: 318, height: 126 },
  logoImage: { width: 252, height: 104 },
  content: { padding: SPACING.lg, paddingBottom: 110 },
  searchBox: { height: 58, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E3C98D', ...shadow },
  searchInput: { flex: 1, textAlign: 'right', fontSize: 15, color: COLORS.gray900, fontWeight: '800', paddingVertical: 0 },
  searchResults: { marginBottom: SPACING.lg },
  searchResultsTitle: { alignSelf: 'flex-end', color: COLORS.primary, fontSize: 17, fontWeight: '900', marginBottom: SPACING.md },
  sectionTitle: { alignSelf: 'flex-end', fontSize: 22, fontWeight: '900', color: COLORS.gray900, marginBottom: SPACING.lg },
  categoryCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, minHeight: 92, flexDirection: 'row-reverse', alignItems: 'center', padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.gray200, ...shadow },
  categoryActive: { borderWidth: 1.4, borderColor: COLORS.primary },
  categoryIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.md },
  categoryText: { flex: 1, alignItems: 'flex-end' },
  categoryTitle: { fontSize: 19, fontWeight: '900', color: COLORS.gray900 },
  categorySub: { fontSize: 14, color: COLORS.gray500, marginTop: 6, textAlign: 'right' },
  categoryCount: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 70 },
  countText: { color: COLORS.gray500, fontSize: 16, fontWeight: '700' },
  hero: { height: 158, marginTop: 18, overflow: 'hidden', borderRadius: BORDER_RADIUS.xl, ...shadow },
  heroImage: { borderRadius: BORDER_RADIUS.xl },
  heroOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: SPACING.lg, backgroundColor: 'rgba(13,59,70,0.50)' },
  heroTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  heroSub: { color: COLORS.white, fontSize: 15, marginTop: 5 },
  quickRow: { flexDirection: 'row-reverse', gap: SPACING.md, marginTop: 24 },
  quickCard: { flex: 1, height: 112, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, ...shadow },
  quickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(246,242,232,0.74)', alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 14, fontWeight: '900', color: COLORS.gray900 },
  mapCard: { marginTop: 20, borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.white, minHeight: 90, padding: SPACING.lg, flexDirection: 'row-reverse', alignItems: 'center', gap: SPACING.lg, ...shadow },
  mapTitle: { color: COLORS.primary, fontSize: 17, fontWeight: '900', textAlign: 'right' },
  mapSub: { color: COLORS.gray500, fontSize: 13, marginTop: 4, textAlign: 'right' },
  latestHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  latestTitle: { color: COLORS.gray900, fontSize: 20, fontWeight: '900', textAlign: 'right' },
  refreshButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  errorBox: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.sm },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  retryBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '900' },
  emptyText: { color: COLORS.gray500, backgroundColor: COLORS.white, borderRadius: 10, padding: SPACING.md, textAlign: 'right', fontWeight: '800' },
  adRow: { minHeight: 108, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, padding: SPACING.sm, flexDirection: 'row-reverse', alignItems: 'center', gap: SPACING.md, ...shadow },
  adImage: { width: 92, height: 78, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.gray100 },
  adImageFallback: { width: 92, height: 78, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.gray100 },
  adInfo: { flex: 1, alignItems: 'flex-end' },
  adTitle: { color: COLORS.gray900, fontSize: 15, fontWeight: '900', textAlign: 'right' },
  adLocation: { color: COLORS.gray500, fontSize: 12, marginTop: 5, textAlign: 'right' },
  adPrice: { color: COLORS.primary, fontSize: 14, fontWeight: '900', marginTop: 6, textAlign: 'right' },
});
