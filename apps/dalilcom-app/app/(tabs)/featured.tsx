import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, AdItem } from '../../context/AppContext';
import { NativeIcon } from '../../components/common/NativeIcon';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

export default function FeaturedTab() {
  const router = useRouter();
  const { state } = useApp();
  const ads = state.ads.filter(ad => ad.isFeatured && (state.carsEnabled || ad.category !== 'cars'));

  const renderItem = ({ item }: { item: AdItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(item.category === 'cars' ? `/details/car/${item.id}` as any : `/details/property/${item.id}` as any)}
    >
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : <View style={styles.image} />}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.location}</Text>
        <Text style={styles.price}>{item.price.toLocaleString('ar-SY')} {item.currency}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>الإعلانات المميزة ({ads.length})</Text></View>
      <FlatList
        data={ads}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Empty icon="sparkles" text="لا توجد إعلانات مميزة حالياً" />}
      />
    </View>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.empty}>
      <NativeIcon name={icon} size={38} color={COLORS.gray400} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 42, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, alignItems: 'flex-end' },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: COLORS.white },
  list: { padding: SPACING.lg, paddingBottom: 105, gap: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.sm, flexDirection: 'row-reverse', gap: SPACING.md, elevation: 4 },
  image: { width: 112, height: 92, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.gray200 },
  body: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  title: { fontSize: FONT_SIZES.md, fontWeight: '900', color: COLORS.gray900 },
  meta: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: 5 },
  price: { fontSize: FONT_SIZES.md, fontWeight: '900', color: COLORS.danger, marginTop: 7 },
  empty: { alignItems: 'center', marginTop: 150, gap: SPACING.md },
  emptyText: { color: COLORS.gray500, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
