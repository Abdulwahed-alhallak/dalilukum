import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeIcon } from '../../components/common/NativeIcon';
import { useApp } from '../../context/AppContext';
import { listApi } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { RealEstateCategory, categoryCounts, categoryIcons } from '../../components/realestate/filterLogic';
import { AppHeaderLogo } from '../../components/common/AppHeader';

function CategoryRow({ item, count, onPress }: {
  item: RealEstateCategory;
  count: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.categoryRow} onPress={onPress}>
      <View style={styles.categoryIcon}>
        <NativeIcon name={categoryIcons[item.id] || 'business'} size={24} color={COLORS.white} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.ar_name}</Text>
        <Text style={styles.categorySub}>({count.toLocaleString('ar-SY')}) إعلان</Text>
      </View>
      <NativeIcon name="chevron-back" size={20} color={COLORS.gray400} />
    </TouchableOpacity>
  );
}

const defaultCategories: RealEstateCategory[] = [
  { id: 'residential', ar_name: 'عقارات سكنية' },
  { id: 'commercial', ar_name: 'عقارات تجارية' },
  { id: 'lands', ar_name: 'أراضي وعقارات زراعية' },
  { id: 'villas', ar_name: 'فلل وقصور' },
  { id: 'offices', ar_name: 'مكاتب وعيادات' },
  { id: 'projects', ar_name: 'مشاريع عقارية' },
];

export default function RealEstateTab() {
  const router = useRouter();
  const { state, getFilteredAds, refresh } = useApp();
  const [categories, setCategories] = useState<RealEstateCategory[]>(defaultCategories);
  const ads = getFilteredAds({ category: 'real-estate' });
  const counts = categoryCounts(ads);
  const allCategory = { id: 'all', ar_name: 'عرض الكل' };

  useEffect(() => {
    listApi<RealEstateCategory>('/real-estate/categories', { per_page: '50' })
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) {
          setCategories(rows);
        }
      })
      .catch(() => {});
    if (state.ads.length === 0) {
      refresh();
    }
  }, [refresh, state.ads.length]);

  const openCategory = (item: RealEstateCategory) => {
    router.push({
      pathname: '/real-estate/category/[id]',
      params: { id: item.id, title: item.ar_name },
    } as any);
  };

  return (
    <View style={styles.container}>
      <AppHeaderLogo title="العقارات" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>الفئات العقارية</Text>
        <CategoryRow item={allCategory} count={counts.all || 0} onPress={() => openCategory(allCategory)} />
        {categories.map(item => (
          <CategoryRow key={item.id} item={item} count={counts[item.id] || 0} onPress={() => openCategory(item)} />
        ))}
      </ScrollView>
    </View>
  );
}

const shadow = { shadowColor: '#0D3B46', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: SPACING.lg, paddingBottom: 105 },
  sectionTitle: { alignSelf: 'flex-end', fontSize: 21, fontWeight: '900', color: COLORS.gray900, marginBottom: SPACING.lg },
  categoryRow: { minHeight: 82, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray100, ...shadow },
  categoryIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#0D3B46', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.md },
  categoryInfo: { flex: 1, alignItems: 'flex-end' },
  categoryTitle: { fontSize: 17, fontWeight: '900', color: COLORS.gray900 },
  categorySub: { fontSize: 13, color: COLORS.gray500, marginTop: 5 },
});

