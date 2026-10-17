import React, { useEffect } from 'react';
import { Linking, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeIcon } from '../components/common/NativeIcon';
import { AppHeaderLogo, BottomBackButton } from '../components/common/AppHeader';
import { useApp, AdItem } from '../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

function getMapUrl(ad: AdItem) {
  return ad.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ad.location)}`;
}

export default function MapPage() {
  const router = useRouter();
  const { state, getFilteredAds, refresh } = useApp();
  const ads = getFilteredAds({ category: 'real-estate' });

  useEffect(() => {
    if (state.ads.length === 0) {
      refresh();
    }
  }, [refresh, state.ads.length]);

  const renderItem = ({ item }: { item: AdItem }) => (
    <View style={styles.card}>
      <View style={styles.pin}><NativeIcon name="location-outline" size={22} color={COLORS.white} /></View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
        <Text style={styles.price}>{item.price.toLocaleString('ar-SY')} {item.currency}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.mapBtn} onPress={() => Linking.openURL(getMapUrl(item)).catch(() => null)}>
            <Text style={styles.mapText}>فتح على الخريطة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailBtn} onPress={() => router.push(`/details/property/${item.id}` as any)}>
            <Text style={styles.detailText}>التفاصيل</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeaderLogo title="الإعلانات على الخريطة" />
      <FlatList
        data={ads}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.count}>{ads.length.toLocaleString('ar-SY')} موقع عقاري معروض</Text>}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد إعلانات لعرضها على الخريطة</Text>}
      />
      <BottomBackButton />
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  list: { padding: SPACING.lg, paddingBottom: 170, gap: SPACING.md },
  count: { textAlign: 'right', color: COLORS.gray900, fontSize: FONT_SIZES.lg, fontWeight: '900', marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, flexDirection: 'row-reverse', gap: SPACING.md, ...shadow },
  pin: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, alignItems: 'flex-end' },
  title: { color: COLORS.gray900, fontSize: FONT_SIZES.md, fontWeight: '900' },
  location: { color: COLORS.gray500, fontSize: FONT_SIZES.sm, marginTop: 4 },
  price: { color: COLORS.danger, fontSize: FONT_SIZES.md, fontWeight: '900', marginTop: 6 },
  actions: { flexDirection: 'row-reverse', gap: SPACING.sm, marginTop: SPACING.md },
  mapBtn: { backgroundColor: '#0D3B46', borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  detailBtn: { backgroundColor: 'rgba(246,242,232,0.74)', borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  mapText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '900' },
  detailText: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '900' },
  empty: { color: COLORS.gray500, textAlign: 'center', marginTop: 120, fontWeight: '800' },
});

